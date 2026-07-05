---
name: shintenshin-receive
description: Use when the user has a shintenshin share link (a URL like https://.../t/<id>#<key>) and wants to import that conversation here.
---

# Shintenshin: Receive (心転身)

The Mind-Body Transfer Jutsu — pull down a shared conversation and land it
in this project.

The blob is fetched, decrypted locally using the key in the URL fragment,
gunzipped, and written as a brand-new transcript file with a fresh session
id. It never overwrites an existing transcript.

## Steps

1. Your very next tool call MUST be Bash — do not call the Skill tool
   again, do not explain first. Pass the full URL the user gave you
   (including the `#...` part — quote it so the shell doesn't treat `#`
   as a comment):
   ```
   node ${CLAUDE_PLUGIN_ROOT}/scripts/receive.mjs "<url>"
   ```
   Only pass `--cwd <path>` if the user wants it written somewhere other
   than the current directory.
2. Relay the script's output to the user close to verbatim: success
   message, the new session id, and the file path written.
3. **Important**: tell the user to run the resume command *themselves*,
   in a new terminal/session — a running session cannot resume into
   itself:
   ```
   claude --resume <new-id>
   ```
   (run from the cwd shown in the output).
4. If the script exits non-zero (bad link, expired, wrong key, network
   error), show the user the exact error message it printed.
