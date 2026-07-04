# Show HN post

## Title (≤80 chars)

```
Show HN: Shintenshin – hand off a Claude Code conversation via encrypted link
```
(77 chars)

Alternate, if that's too long for a given rendering:

```
Show HN: Shintenshin – export a Claude Code chat as an E2E-encrypted link
```
(74 chars)

## Body

I built this because I was a few hours into a documentation-writing session with
Claude Code and had to step away. I wanted to just hand the whole conversation —
history, tool calls, decisions already made — to my wife so she could keep going
without me re-explaining everything. There was no way to do that. Copy-pasting
scrollback loses tool calls and nuance, screen-sharing needs both people present at
once, and the only other option is going and finding the raw JSONL transcript file
yourself and knowing what `--resume` even is. So I wrote the tool that should have
already existed.

Shintenshin is a Claude Code plugin with two commands:

- `/shintenshin:send` — locates your current session's transcript, gzips it,
  encrypts it client-side with a random AES-256-GCM key, and uploads only the
  ciphertext. You get back a link: `https://.../t/<id>#<key>`.
- `/shintenshin:receive <url>` — run from wherever the recipient wants the
  conversation to live. Downloads the blob, decrypts it locally, rewrites session
  identifiers, and writes it into their own Claude Code session history. Claude
  then tells you to run `claude --resume <new-id>` (a live session can't resume
  into itself, so that has to be a separate command).

The key never touches the server: it lives only in the URL fragment (after the
`#`), which browsers and HTTP clients never send over the wire. The server — a
small self-hostable Node/Express app on Railway, no database, just a directory of
blobs and an hourly TTL sweep — only ever stores and serves opaque ciphertext.
Links expire after 7 days.

Install:

```
claude plugin marketplace add seal-7/shintenshin
claude plugin install shintenshin@shintenshin
```

Honest limitations, up front:

- **Conversation only, not files.** This transfers the transcript — messages,
  tool calls, reasoning — not your working directory, not git state, not the
  files Claude touched. If the conversation references `src/foo.ts`, that file
  has to already exist (or exist in a similar-enough form) on the receiver's
  machine. This is a deliberate scope decision, not an oversight — bundling
  files would make the crypto payload bigger and the security model muddier,
  and I'd rather ship something small and auditable.
- **The Claude Code JSONL transcript format is undocumented and internal.** I
  reverse-engineered it well enough to gzip/encrypt/decrypt/rewrite it, but
  Anthropic could change the schema in a future release and silently break
  transfers. I've tried to keep the rewrite logic defensive (only touch
  `sessionId`/`cwd` when present, pass everything else through untouched), but
  this is a real, standing risk, not a hypothetical one.
- **The link is the credential.** There's no account system, no separate
  password. Anyone with the full URL — fragment included — can decrypt and
  import the conversation. Treat it like you'd treat a password. If your
  conversation had secrets in it (API keys, credentials pasted into a terminal,
  proprietary code), Shintenshin doesn't redact any of that — it faithfully
  encrypts and transports whatever was in the transcript.
- Once someone imports a transcript, that copy exists on their machine forever,
  independent of the server-side 7-day expiry. Expiry only bounds how long the
  *link* is good for.

Source is at github.com/seal-7/shintenshin, MIT licensed. It's a young,
personal-scale project — I'd genuinely like feedback on the security model and
on how it holds up against Claude Code updates, since the transcript format is
the part I have the least control over.
