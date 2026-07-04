#!/usr/bin/env node
// Usage: node receive.mjs <url> [--cwd <path>]
//
// Fetches an encrypted transcript blob from a shintenshin share URL,
// decrypts + gunzips it, rewrites sessionId/cwd, appends a synthetic
// system-reminder line, and writes it as a new transcript file.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { slugify, gunzip, decrypt, keyFromBase64Url } from "./lib.mjs";

function fail(message) {
  console.error(`shintenshin receive: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { url: undefined, cwd: undefined };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--cwd") args.cwd = argv[++i];
    else positional.push(a);
  }
  args.url = positional[0];
  return args;
}

function parseShareUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`not a valid URL: "${rawUrl}"`);
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 1];
  if (!id) {
    throw new Error(`could not find a transfer id in the URL path "${parsed.pathname}"`);
  }
  const key = parsed.hash ? parsed.hash.slice(1) : "";
  if (!key) {
    throw new Error(
      "URL is missing the decryption key fragment (the part after #). Paste the full link."
    );
  }
  return { origin: parsed.origin, id, key };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url) {
    fail("usage: node receive.mjs <url> [--cwd <path>]");
    return;
  }

  const receiverCwd = path.resolve(args.cwd || process.cwd());

  let origin, id, keyStr;
  try {
    ({ origin, id, key: keyStr } = parseShareUrl(args.url));
  } catch (err) {
    fail(`bad share link: ${err.message}`);
    return;
  }

  let key;
  try {
    key = keyFromBase64Url(keyStr);
  } catch (err) {
    fail(`bad share link: could not decode key: ${err.message}`);
    return;
  }

  let res;
  try {
    res = await fetch(`${origin}/api/v1/transfers/${id}`);
  } catch (err) {
    fail(`network error fetching transfer: ${err.message}`);
    return;
  }

  if (res.status === 404) {
    fail("transfer not found or expired (blobs expire after 7 days).");
    return;
  }
  if (!res.ok) {
    fail(`server returned ${res.status} ${res.statusText}`);
    return;
  }

  let blob;
  try {
    blob = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    fail(`could not read response body: ${err.message}`);
    return;
  }

  let gzipped;
  try {
    gzipped = decrypt(blob, key);
  } catch {
    fail("wrong or corrupted link (decryption failed). Double check you pasted the full URL including the #key part.");
    return;
  }

  let plaintext;
  try {
    plaintext = gunzip(gzipped);
  } catch (err) {
    fail(`decrypted payload was not valid gzip data: ${err.message}`);
    return;
  }

  const text = plaintext.toString("utf8");
  const rawLines = text.split("\n");
  // Drop a single trailing empty line produced by a trailing newline.
  if (rawLines.length > 0 && rawLines[rawLines.length - 1] === "") {
    rawLines.pop();
  }

  const newSessionId = randomUUID();
  let lastUuid = null;
  let priorVersion = "";
  const outLines = [];

  for (const line of rawLines) {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      outLines.push(line); // pass through unparseable lines untouched
      continue;
    }
    if (obj && typeof obj === "object") {
      if ("sessionId" in obj) obj.sessionId = newSessionId;
      if ("cwd" in obj) obj.cwd = receiverCwd;
      if (typeof obj.uuid === "string") lastUuid = obj.uuid;
      if (typeof obj.version === "string" && obj.version) priorVersion = obj.version;
    }
    outLines.push(JSON.stringify(obj));
  }

  const synthetic = {
    parentUuid: lastUuid,
    isSidechain: false,
    type: "user",
    message: {
      role: "user",
      content:
        "<system-reminder>This conversation was transferred from another machine via Shintenshin. The filesystem, git state, and files referenced above may not exist or may differ here. Re-verify file state before editing anything. Greet the user, tell them the transfer succeeded, and summarize where things left off.</system-reminder>",
    },
    uuid: randomUUID(),
    timestamp: new Date().toISOString(),
    sessionId: newSessionId,
    cwd: receiverCwd,
    userType: "external",
    version: priorVersion,
    gitBranch: "",
  };
  outLines.push(JSON.stringify(synthetic));

  const slug = slugify(receiverCwd);
  const targetDir = path.join(os.homedir(), ".claude", "projects", slug);
  const targetPath = path.join(targetDir, `${newSessionId}.jsonl`);

  if (existsSync(targetPath)) {
    fail(`refusing to overwrite existing transcript at ${targetPath}`);
    return;
  }

  try {
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(targetPath, outLines.join("\n") + "\n");
  } catch (err) {
    fail(`could not write transcript to ${targetPath}: ${err.message}`);
    return;
  }

  console.log("Transfer received successfully.");
  console.log(`New session id: ${newSessionId}`);
  console.log(`Written to: ${targetPath}`);
  console.log(`Next step: run \`claude --resume ${newSessionId}\` from ${receiverCwd}`);
}

main().catch((err) => {
  fail(err && err.stack ? err.stack : String(err));
});
