# X / Twitter thread

1/
I was hours into a documentation session with Claude Code and had to step away. What I actually wanted was to hand my wife the whole conversation so she could keep going without me re-explaining everything. That didn't exist. So I built it: Shintenshin.

2/
Shintenshin (心転身) is a Claude Code plugin. Run /shintenshin:send and it exports your entire current conversation — full history, tool calls, context — as one link. Whoever opens it can import it into their own Claude Code and resume exactly where you left off.

3/
It's end-to-end encrypted: AES-256-GCM, key generated locally, key lives only in the URL fragment (after the #), which never gets sent over the network. The server only ever stores and serves ciphertext — it can't read your conversation. Links expire in 7 days.

4/
Install:
claude plugin marketplace add seal-7/shintenshin
claude plugin install shintenshin@shintenshin

Then /shintenshin:send to export, /shintenshin:receive <link> to import, claude --resume <id> to continue.

5/
Honest limits: it transfers the conversation only, not files or git state — the other machine needs the referenced files itself. It also relies on Claude Code's internal JSONL transcript format, which is undocumented and could change under us in a future release.

6/
The link is the credential — no accounts, no password, treat it like one. Source is MIT licensed: github.com/seal-7/shintenshin. Feedback welcome, especially on the security model.
