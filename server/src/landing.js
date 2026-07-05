const REPO_URL = 'https://github.com/seal-7/shintenshin';

const HERO_ALT =
  'Shintenshin no Jutsu — hands form a mind-transfer seal, ink-sketch style';

const BASE_CSS = `
  :root {
    color-scheme: light;
    --bg: #f7f7f5;
    --fg: #1a1a1a;
    --fg-dim: #5c5c5c;
    --border: #e0e0dc;
    --code-bg: #efefec;
    --danger: #b91c1c;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.65;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 40px 20px 56px;
    -webkit-font-smoothing: antialiased;
  }
  .container { width: 100%; max-width: 520px; }
  .badge {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fg-dim);
    margin-bottom: 16px;
  }
  .hero {
    margin: 0 0 28px;
  }
  .hero img {
    width: 100%;
    height: auto;
    display: block;
  }
  h1 {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.35;
    margin: 0 0 10px;
    color: var(--fg);
    letter-spacing: -0.01em;
  }
  .lore {
    color: var(--fg-dim);
    font-size: 14px;
    margin: 0 0 28px;
  }
  .card {
    border-top: 1px solid var(--border);
    padding-top: 24px;
    margin-bottom: 24px;
  }
  .notice {
    padding: 12px 0;
    margin-bottom: 24px;
    font-size: 14px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    color: var(--danger);
  }
  ol { padding-left: 18px; margin: 0; }
  li { margin-bottom: 20px; }
  li:last-child { margin-bottom: 0; }
  code, pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px;
  }
  code.inline {
    background: var(--code-bg);
    border-radius: 3px;
    padding: 1px 5px;
  }
  pre {
    background: var(--code-bg);
    border-radius: 4px;
    padding: 10px 12px;
    overflow-x: auto;
    margin: 8px 0 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .note { font-size: 13px; color: var(--fg-dim); margin-top: 6px; }
  .accent { font-weight: 500; }
  footer {
    margin-top: 36px;
    font-size: 12px;
    color: var(--fg-dim);
    text-align: center;
  }
  footer a { color: var(--fg-dim); text-decoration: none; }
  footer a:hover { color: var(--fg); }
  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 24px;
    margin: 0 0 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--border);
  }
  .stat { display: flex; flex-direction: column; gap: 2px; }
  .stat-value {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--fg);
  }
  .stat-label {
    font-size: 12px;
    color: var(--fg-dim);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
`;

function formatCount(n) {
  return Number(n || 0).toLocaleString('en-US');
}

function statsSection(stats) {
  return `
    <div class="stats" aria-label="Service statistics">
      <div class="stat">
        <span class="stat-value">${formatCount(stats.uploads)}</span>
        <span class="stat-label">Transfers sent</span>
      </div>
      <div class="stat">
        <span class="stat-value">${formatCount(stats.downloads)}</span>
        <span class="stat-label">Transfers received</span>
      </div>
    </div>
  `;
}

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

function page({ title, headerBadge, notice, statsSection: statsHtml, script }) {
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
    <div class="hero">
      <img src="/assets/hero.png" alt="${HERO_ALT}" width="1254" height="1254">
    </div>
    <div class="badge">${headerBadge}</div>
    <h1>Shintenshin &mdash; mind transfer awaits you</h1>
    <p class="lore">A forbidden jutsu, sealed in cipher, carries one mind's memory across the wire to another vessel.</p>
    ${notice || ''}
    ${statsHtml || ''}
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

export function renderLanding({ mode, stats }) {
  if (mode === 'transfer') {
    return page({
      title: 'Shintenshin — mind transfer awaits you',
      headerBadge: 'transfer ready',
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
      headerBadge: 'shintenshin',
      notice: `<div class="notice">This transfer has expired or was never here. Links are only valid for 7 days after creation.</div>`,
      script: '',
    });
  }

  return page({
    title: 'Shintenshin — mind transfer awaits you',
    headerBadge: 'shintenshin',
    notice: '',
    statsSection: stats ? statsSection(stats) : '',
    script: '',
  });
}
