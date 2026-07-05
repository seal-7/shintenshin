// Shared helpers for shintenshin send/receive scripts.
// Node builtins only: node:crypto, node:zlib.

import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";

// Overridable via SHINTENSHIN_SERVER env var.
export const DEFAULT_SERVER = "https://share.shintenshin.com";

const MAGIC = Buffer.from("ST01", "ascii");
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;

/**
 * Absolute path -> Claude Code project slug: every non-alphanumeric char
 * becomes "-". e.g. "/Users/raj/my.dir_x" -> "-Users-raj-my-dir-x".
 */
export function slugify(absPath) {
  return absPath.replace(/[^a-zA-Z0-9]/g, "-");
}

export function gzip(buf) {
  return gzipSync(buf);
}

export function gunzip(buf) {
  return gunzipSync(buf);
}

/** Generate a fresh random 32-byte AES-256 key. */
export function generateKey() {
  return randomBytes(KEY_LEN);
}

/**
 * Encrypt plaintext with AES-256-GCM and pack into the shintenshin blob
 * layout: "ST01" (4 bytes) || IV (12 bytes) || ciphertext || auth tag (16 bytes).
 */
export function encrypt(plaintext, key) {
  if (key.length !== KEY_LEN) {
    throw new Error(`encrypt: key must be ${KEY_LEN} bytes, got ${key.length}`);
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, iv, ciphertext, tag]);
}

/**
 * Decrypt a shintenshin blob. Throws on bad magic, truncated input, or
 * GCM authentication failure (tampered/corrupt/wrong key).
 */
export function decrypt(blob, key) {
  if (key.length !== KEY_LEN) {
    throw new Error(`decrypt: key must be ${KEY_LEN} bytes, got ${key.length}`);
  }
  if (blob.length < MAGIC.length + IV_LEN + TAG_LEN) {
    throw new Error("decrypt: blob too short to be valid");
  }
  const magic = blob.subarray(0, MAGIC.length);
  if (!magic.equals(MAGIC)) {
    throw new Error('decrypt: bad magic (expected "ST01")');
  }
  const iv = blob.subarray(MAGIC.length, MAGIC.length + IV_LEN);
  const tag = blob.subarray(blob.length - TAG_LEN);
  const ciphertext = blob.subarray(MAGIC.length + IV_LEN, blob.length - TAG_LEN);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  // Throws "Unsupported state or unable to authenticate data" on tamper.
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function keyToBase64Url(key) {
  return key.toString("base64url");
}

export function keyFromBase64Url(str) {
  return Buffer.from(str, "base64url");
}
