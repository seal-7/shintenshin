---
description: Share this conversation as an E2E-encrypted link via Shintenshin
---

Run this now — do not call the Skill tool, do not explain first, your very next tool call must be Bash:

```
node ${CLAUDE_PLUGIN_ROOT}/scripts/send.mjs
```

Then relay the script's output to the user close to verbatim (share URL, expiry, warning). If it exits non-zero, show the exact error message.
