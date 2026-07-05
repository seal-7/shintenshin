---
name: shintenshin-send
description: Use when the user wants to share, hand over, or export this Claude Code conversation as a link for someone else (or another machine) to pick up.
---

# Shintenshin: Send (心転身)

The Mind-Body Transfer Jutsu — package this conversation and hand it off.

The current transcript is gzipped, encrypted with a fresh AES-256-GCM key,
and uploaded to the shintenshin server. The decryption key never leaves
this machine except inside the URL fragment (`#...`), which servers never
see. The link works for anyone who has it, and expires after 7 days.

## Steps

1. Your very next tool call MUST be Bash running this — do not call the
   Skill tool again, do not explain first:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/scripts/send.mjs
   ```
   (No arguments needed — it reads the current session id and cwd
   automatically. Only pass `--session`, `--cwd`, or `--server` if the
   user explicitly asks to override them.)
2. Relay the script's output to the user close to verbatim: the share
   URL, the expiry date, and the warning that anyone with the link can
   import the conversation.
3. If the script exits non-zero, show the user the exact error message
   it printed (no transcript found, network error, etc.) — don't
   paraphrase it away.
