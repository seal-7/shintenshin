import fs from 'node:fs';
import path from 'node:path';

const WRITE_DEBOUNCE_MS = 15 * 1000;

function emptyStats() {
  return {
    uploads: 0,
    downloads: 0,
    landingViews: 0,
    bytesUploaded: 0,
    byDay: {},
  };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

// Loads counters from <dataDir>/stats.json at boot (tolerating a missing or
// corrupt file) and persists them with a debounced write: at most once per
// WRITE_DEBOUNCE_MS while dirty, plus an explicit flush() for shutdown.
export function createStats(dataDir) {
  const statsPath = path.join(dataDir, 'stats.json');
  let stats = emptyStats();
  let dirty = false;
  let writeTimer = null;

  try {
    const raw = fs.readFileSync(statsPath, 'utf8');
    const parsed = JSON.parse(raw);
    stats = {
      uploads: Number(parsed.uploads) || 0,
      downloads: Number(parsed.downloads) || 0,
      landingViews: Number(parsed.landingViews) || 0,
      bytesUploaded: Number(parsed.bytesUploaded) || 0,
      byDay: parsed.byDay && typeof parsed.byDay === 'object' ? parsed.byDay : {},
    };
  } catch {
    // missing or corrupt: start fresh
    stats = emptyStats();
  }

  function dayBucket() {
    const key = todayKey();
    if (!stats.byDay[key]) {
      stats.byDay[key] = { uploads: 0, downloads: 0, landingViews: 0 };
    }
    return stats.byDay[key];
  }

  function scheduleWrite() {
    dirty = true;
    if (writeTimer) return;
    writeTimer = setTimeout(() => {
      writeTimer = null;
      flush();
    }, WRITE_DEBOUNCE_MS);
    writeTimer.unref();
  }

  function flush() {
    if (!dirty) return;
    dirty = false;
    try {
      fs.writeFileSync(statsPath, JSON.stringify(stats));
    } catch {
      // best-effort; will retry on the next dirty write
    }
  }

  return {
    recordUpload(bytes) {
      stats.uploads += 1;
      stats.bytesUploaded += bytes;
      dayBucket().uploads += 1;
      scheduleWrite();
    },
    recordDownload() {
      stats.downloads += 1;
      dayBucket().downloads += 1;
      scheduleWrite();
    },
    recordLandingView() {
      stats.landingViews += 1;
      dayBucket().landingViews += 1;
      scheduleWrite();
    },
    snapshot() {
      return {
        uploads: stats.uploads,
        downloads: stats.downloads,
        landingViews: stats.landingViews,
        bytesUploaded: stats.bytesUploaded,
        byDay: stats.byDay,
      };
    },
    flush,
  };
}
