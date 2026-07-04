#!/usr/bin/env node
// Usage: node send.mjs [--session <id>] [--cwd <path>] [--server <url>]
//
// Locates the current transcript, gzips + AES-256-GCM encrypts it, uploads
// it to the shintenshin server, and prints a shareable link.

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  DEFAULT_SERVER,
  slugify,
  gzip,
  generateKey,
  encrypt,
  keyToBase64Url,
} from "./lib.mjs";

function parseArgs(argv) {
  const args = { session: undefined, cwd: undefined, server: undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--session") args.session = argv[++i];
    else if (a === "--cwd") args.cwd = argv[++i];
    else if (a === "--server") args.server = argv[++i];
    else {
      fail(`Unknown argument: ${a}`);
    }
  }
  return args;
}

function fail(message) {
  console.error(`shintenshin send: ${message}`);
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const session = args.session || process.env.CLAUDE_CODE_SESSION_ID;
  if (!session) {
    fail(
      "no session id: pass --session <id> or run inside a Claude Code session (CLAUDE_CODE_SESSION_ID unset)."
    );
    return;
  }

  const cwd = path.resolve(args.cwd || process.cwd());
  const server = (
    args.server ||
    process.env.SHINTENSHIN_SERVER ||
    DEFAULT_SERVER
  ).replace(/\/+$/, "");

  const slug = slugify(cwd);
  const transcriptPath = path.join(
    os.homedir(),
    ".claude",
    "projects",
    slug,
    `${session}.jsonl`
  );

  if (!existsSync(transcriptPath)) {
    fail(
      `transcript not found at ${transcriptPath} (session "${session}", cwd "${cwd}"). ` +
        `Check --session and --cwd match the conversation you want to share.`
    );
    return;
  }

  let raw;
  try {
    raw = readFileSync(transcriptPath);
  } catch (err) {
    fail(`could not read transcript ${transcriptPath}: ${err.message}`);
    return;
  }

  let blob;
  let key;
  try {
    const gzipped = gzip(raw);
    key = generateKey();
    blob = encrypt(gzipped, key);
  } catch (err) {
    fail(`failed to prepare payload: ${err.message}`);
    return;
  }

  let res;
  try {
    res = await fetch(`${server}/api/v1/transfers`, {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: blob,
    });
  } catch (err) {
    fail(`network error uploading to ${server}: ${err.message}`);
    return;
  }

  if (res.status !== 201) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      // ignore
    }
    fail(`upload failed: server returned ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
    return;
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    fail(`server returned 201 but response body was not valid JSON: ${err.message}`);
    return;
  }

  if (!body || !body.id) {
    fail(`server response missing "id": ${JSON.stringify(body)}`);
    return;
  }

  const keyStr = keyToBase64Url(key);
  const shareUrl = `${server}/t/${body.id}#${keyStr}`;

  console.log(shareUrl);
  console.log(`Expires: ${body.expiresAt || "unknown"}`);
  console.log(
    "Warning: anyone with this link can import this conversation. Treat it like a password."
  );
}

main().catch((err) => {
  fail(err && err.stack ? err.stack : String(err));
});
