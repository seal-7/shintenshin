<div align="center">

<img src="docs/assets/hero.svg" alt="Shintenshin mascot — a chibi shinobi casts the mind-transfer jutsu, sending a glowing heart-kanji orb to a waiting silhouette" width="460">

# 心転身 Shintenshin

**Mind-Body Transfer Jutsu for Claude Code — hand your entire conversation to someone else with a single link.**

<img src="https://img.shields.io/badge/Claude_Code-plugin-8b5cf6?style=flat-square" alt="Claude Code plugin"> <img src="https://img.shields.io/badge/encryption-AES--256--GCM-22c55e?style=flat-square" alt="AES-256-GCM end-to-end encrypted"> <img src="https://img.shields.io/badge/license-MIT-555?style=flat-square" alt="MIT license">

*He steps away mid-session. She opens one link. The jutsu is complete.*

</div>

Shintenshin (心転身, from the Yamanaka clan's *Shintenshin no Jutsu*) is a Claude Code
plugin that exports your current conversation — full history, tool calls, and context —
as an encrypted, shareable link. Whoever opens it can pull the conversation into their
own Claude Code and pick up exactly where you left off.

## Why

Claude Code conversations accumulate context you don't want to lose: decisions made,
dead ends explored, half-finished reasoning. Today the only way to hand that off to
someone else is to describe it in prose, screen-share in real time, or go spelunking for
the raw transcript file yourself. Shintenshin makes it one command and one link —
asynchronous, no screen-share required, nothing lost in translation.

This started as a very specific need: stepping away mid-session and wanting to hand an
in-progress conversation straight to a family member so she could keep going without
starting from scratch.

## How it works

```
1. Sender runs /shintenshin:send
   -> transcript is gzipped, encrypted (AES-256-GCM, random local key),
      and uploaded as ciphertext only.
   -> a share link is printed: https://.../t/<id>#<key>

2. Sender shares the link with the recipient (chat, email, whatever).
   -> the server only ever stores and serves encrypted bytes.
   -> the decryption key lives in the URL fragment and never reaches the server.

3. Recipient runs /shintenshin:receive <link> from their own project directory
   -> the blob is downloaded, decrypted locally, and written into their own
      Claude Code session history.
   -> they run `claude --resume <new-id>` and continue exactly where it left off.
```

## Install

```bash
claude plugin marketplace add seal-7/shintenshin
claude plugin install shintenshin@shintenshin
```

## Usage

**Send** the current conversation:

```
/shintenshin:send
```

Prints a share URL, its 7-day expiry, and a reminder that anyone with the link can
import the conversation.

**Receive** a conversation someone shared with you, from the project directory where you
want it to live:

```
/shintenshin:receive https://shintenshin.up.railway.app/t/<id>#<key>
```

Then, in your terminal, from that same directory:

```bash
claude --resume <new-session-id>
```

(A running session can't resume into itself, so this last step is a separate command
Claude prints for you to run.)

## Security model

- **End-to-end encrypted.** Your transcript is compressed and encrypted with
  AES-256-GCM using a key generated locally. The key is embedded only in the URL
  fragment (`#...`), which browsers and HTTP clients never transmit to the server.
- **The server sees only encrypted bytes.** It cannot read your conversation, and
  neither can anyone with access to its storage or logs.
- **7-day auto-expiry.** Uploaded blobs are swept and deleted an hour after they turn a
  week old.
- **The link is the secret.** There's no account system and no separate password —
  anyone who has the full URL, fragment included, can decrypt and import the
  conversation. Treat it exactly like you'd treat a password: share it only with the
  person you intend to hand off to, and don't post it publicly unless you're fine with
  the conversation being public.
- Shintenshin encrypts and transports your transcript faithfully — it does **not** scan
  or redact its contents. If your conversation contains secrets (credentials, private
  code, etc.), that's on you to consider before sharing a link.

## Self-hosting the server

The server (`server/`) is a small Node + Express app designed for [Railway](https://railway.app):

1. Deploy `server/` as a Railway service (a `Dockerfile` is included: `node:22-alpine`).
2. Attach a persistent volume and point `DATA_DIR` at it (default `./data` if unset).
3. Set `PORT` if you need something other than Railway's default (falls back to `3000`
   locally).
4. Point your plugin install at your own server by setting `SHINTENSHIN_SERVER` in the
   environment before running `/shintenshin:send` or `/shintenshin:receive`.

No database, no external services beyond `express` — the filesystem plus an hourly TTL
sweep is the entire storage layer.

## Side effects of the jutsu

Shintenshin transfers the **conversation only** — not your files, not your git state,
not your working directory. When you receive a session:

- Any files, paths, or git state referenced in the conversation belong to the sender's
  machine and may not exist (or may look different) on yours.
- Your working directory when you run `/shintenshin:receive` is yours to set up — the
  plugin doesn't touch it beyond writing the transcript into your Claude Code session
  history.
- A transfer-notice message is automatically injected into the imported conversation
  telling Claude to re-verify file state before editing anything and to summarize where
  things left off, so you're not caught off guard by stale assumptions.

## Contributing

Issues and pull requests are welcome at
[github.com/seal-7/shintenshin](https://github.com/seal-7/shintenshin). This is a young,
personal-scale project — please open an issue before a large PR so we can align on
approach first.

## License

MIT — see [LICENSE](./LICENSE).
