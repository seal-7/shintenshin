# r/ClaudeAI post

## Title

```
I built a way to hand off a Claude Code conversation to someone else with one link (E2E encrypted)
```

## Body

So this started from a pretty specific, kind of dumb situation: I was hours deep
into a documentation session with Claude Code — lots of back and forth, decisions
made, context built up — and I had to step away. What I actually wanted to do was
just hand my wife the whole conversation so she could pick it up and keep going
without me re-explaining three hours of context. Turns out there's no way to do
that. You can't screen-share async, copy-pasting scrollback loses all the tool
calls, and the "real" way is digging up the raw JSONL transcript file yourself and
knowing what `claude --resume` even means. So I built the thing instead.

Shintenshin (心転身 — it's the Yamanaka clan's mind-transfer jutsu from Naruto,
felt fitting) is a Claude Code plugin that exports your entire current
conversation — full history, tool calls, everything — as one encrypted link.
Whoever opens that link, on their own machine, can pull the conversation into
their own Claude Code and resume exactly where you left off.

### How it works

1. You run `/shintenshin:send` in the conversation you want to hand off. It
   locates the transcript, compresses it, encrypts it locally with a random
   AES-256-GCM key, and uploads only the ciphertext. You get back a link like
   `https://.../t/<id>#<key>`.
2. You send that link to whoever's taking over (chat, email, whatever).
3. They run `/shintenshin:receive <link>` from their own project directory.
   It downloads and decrypts the blob locally and writes it into their own
   Claude Code session history, then tells them to run
   `claude --resume <new-id>` to continue.

The important bit: the decryption key never leaves your machine as far as the
server is concerned — it lives in the URL fragment (the part after `#`), which
never gets sent over the network by browsers or HTTP clients. The server (a tiny
self-hosted Node app on Railway) only ever sees and stores encrypted bytes. Links
auto-expire after 7 days.

### Install

```
claude plugin marketplace add seal-7/shintenshin
claude plugin install shintenshin@shintenshin
```

### Caveats, honestly

- It only transfers the **conversation**, not your files or git state. If the
  chat references a file, that file needs to already exist on the other
  person's machine — Shintenshin doesn't bundle your working directory.
- It relies on Claude Code's internal JSONL transcript format, which is
  undocumented and not something Anthropic promises to keep stable. A future
  Claude Code update could change that format and break this. I've tried to
  make the rewrite logic tolerant of that (it only touches the couple of
  fields it needs to and leaves everything else alone), but it's a real risk,
  not a hypothetical.
- The link *is* the credential — no accounts, no separate password. Anyone
  who gets the full link can decrypt and read the conversation, so share it
  the way you'd share a password, not the way you'd share a public gist.
- Once someone imports it, that copy sits on their machine indefinitely even
  after the server-side link expires.

Repo (MIT licensed): https://github.com/seal-7/shintenshin

It's a small personal project, first real release, so I'd love feedback —
especially on the security model and whether the JSONL-format risk is as
contained as I think it is.
