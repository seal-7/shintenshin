import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_URL = 'https://github.com/seal-7/shintenshin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HERO_SVG = fs
  .readFileSync(path.join(__dirname, '..', 'assets', 'hero.svg'), 'utf8')
  .replace(/^<svg /, '<svg style="width:100%;height:auto;display:block;" ');

const BASE_CSS = `
  :root {
    color-scheme: dark;
    --bg: #0a0a12;
    --bg-alt: #121225;
    --fg: #e8e6f5;
    --fg-dim: #9a97b8;
    --accent: #8b5cf6;
    --accent-dim: #6d28d9;
    --border: #26243d;
    --code-bg: #14131f;
    --danger: #f87171;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: radial-gradient(circle at 50% -10%, var(--bg-alt), var(--bg) 60%);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 48px 20px 64px;
  }
  .container { width: 100%; max-width: 640px; }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 18px;
  }
  .hero {
    margin: -8px -8px 24px;
    border-radius: 16px;
    overflow: hidden;
  }
  h1 {
    font-size: 28px;
    line-height: 1.3;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #ffffff, var(--accent) 120%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .lore {
    color: var(--fg-dim);
    font-size: 15px;
    margin: 0 0 32px;
    font-style: italic;
  }
  .card {
    background: var(--bg-alt);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 28px;
    margin-bottom: 24px;
  }
  .notice {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 24px;
    font-size: 14px;
    border: 1px solid var(--border);
  }
  .notice.expired {
    border-color: var(--danger);
    color: var(--danger);
    background: rgba(248, 113, 113, 0.08);
  }
  ol { padding-left: 20px; margin: 0; }
  li { margin-bottom: 22px; }
  li:last-child { margin-bottom: 0; }
  code, pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px;
  }
  code.inline {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 1px 6px;
  }
  pre {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
    overflow-x: auto;
    margin: 8px 0 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .note { font-size: 13.5px; color: var(--fg-dim); margin-top: 6px; }
  .accent { color: var(--accent); }
  footer {
    margin-top: 40px;
    font-size: 13px;
    color: var(--fg-dim);
    text-align: center;
  }
  footer a { color: var(--accent); text-decoration: none; }
  footer a:hover { text-decoration: underline; }
`;

function instructionsList({ urlPlaceholderId }) {
  return `
    <ol>
      <li>
        Install the plugin:
        <pre>claude plugin marketplace add seal-7/shintenshin
claude plugin install shintenshin@shintenshin</pre>
      </li>
      <li>
        In Claude Code, from the project folder where you want the conversation to land:
        <pre id="${urlPlaceholderId}">/shintenshin:receive &lt;PASTE FULL URL&gt;</pre>
        <div class="note">Paste the <em>entire</em> URL you were given, exactly as-is.</div>
      </li>
      <li>
        The full URL &mdash; including the <code class="inline">#...</code> fragment &mdash; <span class="accent">is</span> the decryption key.
        The server only ever stores encrypted bytes and cannot read your conversation. This is end-to-end encrypted.
        <div class="note">Blobs are deleted automatically after 7 days.</div>
      </li>
    </ol>
  `;
}

function page({ title, headerBadge, notice, script }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<style>${BASE_CSS}</style>
</head>
<body>
  <div class="container">
    <div class="hero">${HERO_SVG}</div>
    <div class="badge">${headerBadge}</div>
    <h1>Shintenshin &mdash; mind transfer awaits you</h1>
    <p class="lore">A forbidden jutsu, sealed in cipher, carries one mind's memory across the wire to another vessel.</p>
    ${notice || ''}
    <div class="card">
      ${instructionsList({ urlPlaceholderId: 'full-url' })}
    </div>
    <footer>
      <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer">${REPO_URL.replace('https://', '')}</a>
    </footer>
  </div>
  ${script || ''}
</body>
</html>
`;
}

export function renderLanding({ mode }) {
  if (mode === 'transfer') {
    return page({
      title: 'Shintenshin — mind transfer awaits you',
      headerBadge: '🥷 transfer ready',
      notice: '',
      script: `<script>
        (function () {
          if (location.hash) {
            var el = document.getElementById('full-url');
            if (el) el.textContent = '/shintenshin:receive ' + location.href;
          }
        })();
      </script>`,
    });
  }

  if (mode === 'not-found') {
    return page({
      title: 'Shintenshin — transfer expired or not found',
      headerBadge: '🥷 shintenshin',
      notice: `<div class="notice expired">This transfer has expired or was never here. Links are only valid for 7 days after creation.</div>`,
      script: '',
    });
  }

  // generic
  return page({
    title: 'Shintenshin — mind transfer awaits you',
    headerBadge: '🥷 shintenshin',
    notice: '',
    script: '',
  });
}
