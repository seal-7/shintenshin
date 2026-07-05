import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLanding } from './landing.js';
import { createStats } from './stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || './data';
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SWEEP_INTERVAL_MS = 60 * 60 * 1000; // hourly
const RATE_LIMIT_MAX = 30; // uploads per IP per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ID_RE = /^[A-Za-z0-9_-]{22}$/;
const MAGIC = Buffer.from('ST01', 'ascii');
const STATS_TOKEN = process.env.STATS_TOKEN;

fs.mkdirSync(DATA_DIR, { recursive: true });

const stats = createStats(DATA_DIR);

function checkStatsAuth(req) {
  if (!STATS_TOKEN) return false;
  const auth = req.headers['authorization'] || '';
  const expected = `Bearer ${STATS_TOKEN}`;
  const a = Buffer.from(auth);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const app = express();
app.disable('x-powered-by');
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// --- request logging: method, path, status, bytes. Never log full ids/body. ---
function redactPath(p) {
  return p.replace(/[A-Za-z0-9_-]{22}/g, (m) => `${m.slice(0, 8)}…`);
}

app.use((req, res, next) => {
  res.on('finish', () => {
    const bytes = res.locals.bytes ?? Number(res.getHeader('content-length')) ?? 0;
    console.log(`${req.method} ${redactPath(req.path)} ${res.statusCode} ${bytes}b`);
  });
  next();
});

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    return String(xff).split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// --- in-memory per-IP rate limiter (uploads only) ---
const uploadLog = new Map(); // ip -> [timestamps]

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  let arr = uploadLog.get(ip) || [];
  arr = arr.filter((t) => t > windowStart);
  if (arr.length >= RATE_LIMIT_MAX) {
    uploadLog.set(ip, arr);
    return true;
  }
  arr.push(now);
  uploadLog.set(ip, arr);
  return false;
}

// periodic cleanup so uploadLog doesn't grow unbounded
setInterval(() => {
  const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, arr] of uploadLog) {
    const filtered = arr.filter((t) => t > windowStart);
    if (filtered.length === 0) uploadLog.delete(ip);
    else uploadLog.set(ip, filtered);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

// --- TTL sweep: delete *.bin older than 7 days (by mtime). Runs at boot + hourly. ---
async function sweep() {
  let files;
  try {
    files = await fsp.readdir(DATA_DIR);
  } catch {
    return;
  }
  const now = Date.now();
  for (const file of files) {
    if (!file.endsWith('.bin')) continue;
    const full = path.join(DATA_DIR, file);
    try {
      const stat = await fsp.stat(full);
      if (now - stat.mtimeMs > TTL_MS) {
        await fsp.unlink(full);
      }
    } catch {
      // ignore races / already-deleted files
    }
  }
}

sweep();
setInterval(sweep, SWEEP_INTERVAL_MS).unref();

function idPath(id) {
  return path.join(DATA_DIR, `${id}.bin`);
}

function blobExists(id) {
  return fs.existsSync(idPath(id));
}

// --- routes ---

app.get('/healthz', (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  stats.recordLandingView();
  res.type('html').send(renderLanding({ mode: 'generic' }));
});

app.get('/t/:id', (req, res) => {
  const { id } = req.params;
  stats.recordLandingView();
  if (ID_RE.test(id) && blobExists(id)) {
    res.type('html').send(renderLanding({ mode: 'transfer' }));
  } else {
    res.type('html').send(renderLanding({ mode: 'not-found' }));
  }
});

app.post('/api/v1/transfers', (req, res) => {
  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({ error: 'rate limit exceeded, try again later' });
    return;
  }

  const chunks = [];
  let total = 0;
  let rejected = false;

  req.on('data', (chunk) => {
    if (rejected) return;
    total += chunk.length;
    if (total > MAX_BYTES) {
      rejected = true;
      res.locals.bytes = total;
      res.status(413).json({ error: 'payload too large (max 20MB)' });
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', async () => {
    if (rejected) return;
    const body = Buffer.concat(chunks);
    res.locals.bytes = body.length;

    if (body.length < 4 || !body.subarray(0, 4).equals(MAGIC)) {
      res.status(400).json({ error: 'invalid blob: missing ST01 magic bytes' });
      return;
    }

    const id = crypto.randomBytes(16).toString('base64url');

    try {
      await fsp.writeFile(idPath(id), body);
    } catch {
      res.status(500).json({ error: 'failed to store blob' });
      return;
    }

    stats.recordUpload(body.length);
    const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
    res.status(201).json({ id, expiresAt });
  });

  req.on('error', () => {
    rejected = true;
  });
});

app.get('/api/v1/transfers/:id', async (req, res) => {
  const { id } = req.params;
  if (!ID_RE.test(id)) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  try {
    const data = await fsp.readFile(idPath(id));
    res.locals.bytes = data.length;
    stats.recordDownload();
    res.type('application/octet-stream').status(200).send(data);
  } catch {
    res.status(404).json({ error: 'not found' });
  }
});

app.get('/api/v1/stats', async (req, res) => {
  if (!checkStatsAuth(req)) {
    res.status(404).json({ error: 'not found' });
    return;
  }

  let activeBlobs = 0;
  let diskBytes = 0;
  try {
    const files = await fsp.readdir(DATA_DIR);
    for (const file of files) {
      if (!file.endsWith('.bin')) continue;
      try {
        const stat = await fsp.stat(path.join(DATA_DIR, file));
        activeBlobs += 1;
        diskBytes += stat.size;
      } catch {
        // ignore races with concurrent deletes
      }
    }
  } catch {
    // DATA_DIR unreadable: report zeros rather than failing
  }

  res.json({
    ...stats.snapshot(),
    activeBlobs,
    diskBytes,
    uptimeSeconds: Math.floor(process.uptime()),
    serverTime: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

app.listen(PORT, () => {
  console.log(`shintenshin-server listening on :${PORT} (DATA_DIR=${DATA_DIR})`);
});

process.on('SIGTERM', () => {
  stats.flush();
  process.exit(0);
});
