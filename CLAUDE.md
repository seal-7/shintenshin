# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Shintenshin (心転身) is a Claude Code plugin that exports the current conversation transcript as
an E2E-encrypted, shareable link so another person/machine can import it and resume. Two
independent components live in this one repo:

1. **Plugin** (repo root): `commands/`, `skills/`, `scripts/*.mjs` — runs inside the user's
   Claude Code environment via Node scripts invoked by skills.
2. **Server** (`server/`): a tiny Node + Express blob store deployed on Railway, storing only
   opaque encrypted bytes.

`SPEC.md` is the binding technical contract for both components (crypto format, server API,
plugin file layout, script behavior) — read it before making protocol-level changes. `README.md`
has the user-facing pitch and security model summary.

## Commands

No build step, bundler, or test suite in this repo — it's plain Node with a single runtime
dependency (`express`, used only in `server/`).

```bash
# Server: install deps and run locally
cd server && npm install
cd server && npm start          # node src/index.js, PORT default 3000, DATA_DIR default ./data

# Plugin scripts: run directly with node (no install step, no deps)
node scripts/send.mjs [--session <id>] [--cwd <path>] [--server <url>]
node scripts/receive.mjs <url> [--cwd <path>]
```

There is no linter or test runner configured. Verify plugin script changes by actually running
`send.mjs`/`receive.mjs` against a local or deployed server and inspecting the resulting
transcript JSONL. Verify server changes with `npm start` plus a manual `curl` against
`/api/v1/transfers`.

## Architecture

### Crypto & blob format (shared contract between plugin and server)

- Plaintext is `gzip(transcript jsonl bytes)`, then AES-256-GCM encrypted with a random 32-byte
  key and 12-byte IV, both generated locally by the sender — the server never sees the key.
- Wire format: `"ST01"` magic (4 bytes) ‖ IV (12 bytes) ‖ ciphertext ‖ GCM auth tag (16 bytes).
- Share URL: `https://<host>/t/<id>#<key-b64url>` — the key lives only in the URL fragment,
  which is never sent to the server by browsers or HTTP clients. The server is a
  zero-knowledge blob store: it validates the magic bytes and stores/serves ciphertext, nothing
  more.
- Shared crypto/gzip/slugify helpers live in `scripts/lib.mjs` and are used by both
  `send.mjs` and `receive.mjs`.

### Plugin flow (`scripts/send.mjs`, `scripts/receive.mjs`)

- Transcripts on disk live at `~/.claude/projects/<slug>/<session-id>.jsonl`, where `slug` is the
  absolute cwd with every non-alphanumeric character replaced by `-`. `send.mjs` locates the
  current session's transcript this way (session id defaults to
  `$CLAUDE_CODE_SESSION_ID`) and uploads the encrypted blob.
- `receive.mjs` downloads and decrypts the blob, then rewrites every parseable JSONL line's
  `sessionId` and `cwd` fields to match the receiver's new session, and appends a synthetic
  user-turn message (schema-copied from a real transcript line) telling the resuming Claude to
  re-verify file state before touching anything. It writes the rewritten transcript to a new
  file under the receiver's own `~/.claude/projects/<slug>/` directory — never overwriting an
  existing file — and never actually resumes the session itself (a running session can't resume
  into itself; `/resume` is a manual interactive keystroke and cannot be triggered
  programmatically).
- `commands/send.md` and `commands/receive.md` are thin wrappers that just point Claude at the
  corresponding skill; the actual instructions Claude follows live in `skills/send/SKILL.md` and
  `skills/receive/SKILL.md`.

### Server (`server/src/`)

- `index.js` — Express app: `POST /api/v1/transfers` (upload, 20 MB cap, validates `ST01` magic,
  20-char-ish base64url id), `GET /api/v1/transfers/:id` (download), `GET /t/:id` and `GET /`
  (landing page), `GET /healthz`. In-memory rate limiting (30 uploads/IP/hour, trusting the
  first `x-forwarded-for` hop since Railway sits in front). Blobs are swept hourly (and at boot)
  once older than 7 days; no database — the filesystem plus this TTL sweep is the entire storage
  layer.
- `landing.js` — self-contained HTML landing page (inline CSS, no external assets) shown at
  `/t/:id` and `/`.
- `stats.js` — server-side stats embedded on the landing page (transfer counts).
- Deploys to Railway via `server/Dockerfile` (`node:22-alpine`) and `server/railway.json`, with
  auto-deploy from `main` on the `server/` subdirectory.
