---
description: Import a conversation from a Shintenshin share link
---

Run this now — do not call the Skill tool, do not explain first, your very next tool call must be Bash. Quote the URL so the shell doesn't treat `#` as a comment:

```
node ${CLAUDE_PLUGIN_ROOT}/scripts/receive.mjs "$ARGUMENTS"
```

Then relay the script's output to the user close to verbatim (success message, new session id, file path). Tell the user to switch to it themselves — a running session cannot resume into itself — by running `/resume` in this same terminal and picking the session that just arrived (most recent in the picker), or `claude --resume <new-id>` from a new terminal. If the script exits non-zero, show the exact error message.
