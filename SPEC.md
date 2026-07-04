# Shintenshin — Technical Spec (binding contract)

Shintenshin (心転身, the Mind-Body Transfer Jutsu) transfers a Claude Code conversation from one person to another via an E2E-encrypted shareable link.

Two components in this repo:
1. **Plugin** (repo root): Claude Code plugin with `send` and `receive` skills + Node scripts.
2. **Server** (`server/`): tiny Node blob store deployed on Railway.

## Verified platform facts (do not re-derive)

- Transcripts: `~/.claude/projects/<slug>/<session-id>.jsonl` where `slug` = absolute cwd with every non-alphanumeric char replaced by `-` (e.g. `/Users/raj/my.dir_x` → `-Users-raj-my-dir-x`).
- The running session's ID is in env `CLAUDE_CODE_SESSION_ID`.
- `claude --resume <session-id>` (run from the matching cwd) resumes any transcript present in that slug dir.
- Transcript JSONL lines are objects; many carry `sessionId`, `cwd`, `version`, `gitBranch`, `uuid`, `parentUuid` fields. Sample real transcript for reference (READ-ONLY): `/Users/rajtalekar/.claude/projects/-Users-rajtalekar-workspace-mini-claude/31f7afb7-05bf-4095-a690-a870bb7eefdc.jsonl`

## Crypto & blob format (shared by both sides)

- Plaintext = `gzip(jsonl bytes)`.
- Encrypt: AES-256-GCM via `node:crypto`. Key = 32 random bytes. IV = 12 random bytes.
- Blob layout (binary): `"ST01"` (4 bytes ASCII magic) ‖ IV (12 bytes) ‖ ciphertext ‖ GCM auth tag (16 bytes, appended — i.e. `cipher.update+final` output followed by `cipher.getAuthTag()`).
- Key encoding in URL: base64url, no padding.
- Share URL: `https://<host>/t/<id>#<key-b64url>` — the fragment NEVER reaches the server.

## Server API (`server/`)

Plain Node ≥20, no framework beyond `express` (keep deps minimal: `express` only). Port from `PORT` env (default 3000). Blob dir from `DATA_DIR` env (default `./data`, created if missing).

- `POST /api/v1/transfers` — body `application/octet-stream`, max **20 MB** (return 413 beyond). Validates magic `ST01` (400 otherwise). Generates `id` = 22-char base64url from 16 random bytes. Writes `<DATA_DIR>/<id>.bin`. Returns 201 `{"id": "...", "expiresAt": "<ISO, now+7d>"}`.
- `GET /api/v1/transfers/:id` — validate id `[A-Za-z0-9_-]{22}`; 200 octet-stream or 404 `{"error":"not_found_or_expired"}`.
- `GET /t/:id` — HTML landing page (below). 200 even if blob missing, but show "expired/not found" state via a tiny existence check.
- `GET /` — same landing page, generic (no id).
- `GET /healthz` — 200 `{"ok":true}`.
- TTL: sweep every hour (`setInterval`), delete `*.bin` with mtime older than **7 days**. Also run sweep at boot.
- Rate limit: in-memory, max **30 uploads per IP per hour** (429). Trust `x-forwarded-for` first hop (Railway proxy).
- Log one line per request (method, path, status, bytes) — never log body or ids at debug level beyond first 8 chars.

### Landing page

Single self-contained HTML (inline CSS, no external assets, dark ninja/Naruto-inspired theme — deep indigo/black, one accent color, tasteful; no copyrighted images). Content: title "Shintenshin — a mind transfer awaits you", one-line lore, then numbered instructions:
1. Install: `claude plugin marketplace add seal-7/shintenshin` then `claude plugin install shintenshin@shintenshin`
2. In Claude Code, from the project folder where you want to receive it: `/shintenshin:receive <PASTE FULL URL>`
3. Emphasize: the full URL including the `#...` part is the decryption key; the server cannot read the conversation (E2E encrypted). Blobs expire after 7 days.
Footer: link to GitHub repo `https://github.com/seal-7/shintenshin`.

Also `server/Dockerfile` (node:22-alpine, npm ci --omit=dev, CMD node src/index.js) and `server/railway.json` optional. `server/package.json` with `start` script.

## Plugin (repo root)

```
.claude-plugin/plugin.json        # name "shintenshin", version 0.1.0, author Raj Talekar, MIT
.claude-plugin/marketplace.json   # repo as its own marketplace; marketplace name "shintenshin"; one plugin entry with "source": "./"
skills/send/SKILL.md
skills/receive/SKILL.md
commands/send.md                  # thin wrapper: instructs Claude to use the shintenshin:send skill
commands/receive.md               # thin wrapper for receive; passes $ARGUMENTS (the URL)
scripts/send.mjs
scripts/receive.mjs
scripts/lib.mjs                   # shared: slugify, crypto, gzip helpers
```

Reference for marketplace.json schema: `/Users/rajtalekar/.claude/plugins/marketplaces/claude-plugins-official/.claude-plugin/marketplace.json` (READ-ONLY). Reference plugin.json: superpowers at `/Users/rajtalekar/.claude/plugins/cache/claude-plugins-official/superpowers/6.1.1/.claude-plugin/plugin.json`.

### `scripts/send.mjs`

Usage: `node send.mjs [--session <id>] [--cwd <path>] [--server <url>]`
- session default `$CLAUDE_CODE_SESSION_ID`; cwd default `process.cwd()`; server default `$SHINTENSHIN_SERVER` else `SERVER_URL_PLACEHOLDER` const at top of lib.mjs (I will replace after Railway deploy).
- Locate transcript via slug; error clearly if missing.
- gzip → encrypt → POST. Print (exact, human-friendly):
  - the share URL on its own line,
  - expiry date,
  - a warning that anyone with the link can import the conversation.
- Exit non-zero with clear message on any failure (no transcript, network, non-201).

### `scripts/receive.mjs`

Usage: `node receive.mjs <url> [--cwd <path>]`
- Parse id + key from URL (fragment). Fetch blob, verify magic, decrypt (clear error "wrong or corrupted link" on GCM auth failure), gunzip.
- New session id = `crypto.randomUUID()`.
- For every JSONL line that parses as JSON: rewrite `sessionId` → new id and `cwd` → receiver cwd (only when those keys exist). Pass through unparseable lines untouched.
- Append one synthetic line, schema-copied from a real `type:"user"` line: `{parentUuid: <uuid of last line having a uuid>, isSidechain:false, type:"user", message:{role:"user", content:"<system-reminder>This conversation was transferred from another machine via Shintenshin. The filesystem, git state, and files referenced above may not exist or may differ here. Re-verify file state before editing anything. Greet the user, tell them the transfer succeeded, and summarize where things left off.</system-reminder>"}, uuid: <new random uuid>, timestamp: <now ISO>, sessionId: <new id>, cwd: <receiver cwd>, userType:"external", version: <copied from a prior line if present>, gitBranch:""}`
- Write to `~/.claude/projects/<slug-of-receiver-cwd>/<new-id>.jsonl` (mkdir -p). NEVER overwrite an existing file.
- Print: success, the new session id, and exact next step: `claude --resume <new-id>` (run from `<cwd>`).

### SKILL.md files

Frontmatter `name` + `description` (description states when to use, e.g. "Use when the user wants to share/hand over/export this conversation as a link"). Body: short lore line, then exact steps for Claude: run `node ${CLAUDE_PLUGIN_ROOT}/scripts/send.mjs` (resp. `receive.mjs <url>`), then relay the script output to the user verbatim-ish. Receive skill: tell the user to run `claude --resume <id>` themselves (a running session cannot resume into itself). Keep each SKILL.md under 60 lines.

## Non-goals (v1)

File/workspace bundling, git patches, auth/accounts, custom TTL, web viewer, one-time links.
