const REPO_URL = 'https://github.com/seal-7/shintenshin';

const HERO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" style="width:100%;height:auto;display:block;" role="img" aria-label="Shintenshin mascot — a chibi shinobi casts the mind-transfer jutsu, sending a glowing heart-kanji orb to a waiting silhouette">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#1a1433"/>
      <stop offset="55%" stop-color="#0c0b16"/>
      <stop offset="100%" stop-color="#06060c"/>
    </radialGradient>
    <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c4b5fd" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f7dd8a"/>
      <stop offset="100%" stop-color="#e3b94f"/>
    </linearGradient>
    <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c2450"/>
      <stop offset="100%" stop-color="#171228"/>
    </linearGradient>
  </defs>

  <rect width="900" height="560" rx="24" fill="url(#bg)"/>
  <text x="450" y="340" text-anchor="middle" font-family="serif" font-size="380" fill="#8b5cf6" opacity=".05">心</text>

  <g fill="#c4b5fd">
    <circle cx="110" cy="90" r="2.2" opacity=".7"/><circle cx="182" cy="150" r="1.5" opacity=".5"/>
    <circle cx="770" cy="80" r="2.2" opacity=".7"/><circle cx="828" cy="160" r="1.5" opacity=".5"/>
    <circle cx="450" cy="52" r="1.6" opacity=".6"/><circle cx="620" cy="60" r="1.4" opacity=".45"/>
    <circle cx="250" cy="60" r="1.4" opacity=".45"/><circle cx="856" cy="300" r="1.6" opacity=".4"/>
    <circle cx="52" cy="280" r="1.6" opacity=".4"/>
  </g>

  <!-- transfer arc -->
  <path d="M330,190 C400,70 560,68 648,160" fill="none" stroke="#a78bfa" stroke-width="3.5" stroke-dasharray="2 12" stroke-linecap="round" opacity=".85"/>

  <!-- mind orb -->
  <g transform="translate(486,108)">
    <circle r="56" fill="url(#orbGlow)"/>
    <circle r="28" fill="#c4b5fd"/>
    <circle r="28" fill="none" stroke="#ede9fe" stroke-width="2"/>
    <text y="11" text-anchor="middle" font-family="serif" font-size="32" font-weight="bold" fill="#37246b">心</text>
  </g>

  <!-- sender: chibi Yamanaka-style shinobi -->
  <g transform="translate(295,330)">
    <ellipse cy="152" rx="70" ry="12" fill="#000" opacity=".35"/>
    <!-- ponytail (behind) -->
    <path d="M-38,-158 C-102,-142 -110,-40 -80,52 C-72,76 -52,74 -58,44 C-78,-28 -72,-116 -18,-152 Z" fill="url(#hair)"/>
    <!-- body -->
    <path d="M-72,145 C-72,22 -44,-12 0,-12 C44,-12 72,22 72,145 Z" fill="url(#suit)" stroke="#8b5cf6" stroke-opacity=".55" stroke-width="2.5"/>
    <path d="M-70,96 C-30,84 30,84 70,96" fill="none" stroke="#8b5cf6" stroke-opacity=".45" stroke-width="5"/>
    <!-- sleeves + seal hands -->
    <path d="M-58,26 C-40,52 -20,60 -8,58 L-8,78 C-30,80 -52,64 -64,42 Z" fill="#221b3e"/>
    <path d="M58,26 C40,52 20,60 8,58 L8,78 C30,80 52,64 64,42 Z" fill="#221b3e"/>
    <g transform="translate(0,62)">
      <circle r="21" fill="#f6cfa4"/>
      <path d="M-10,-14 L-10,10 M-3,-16 L-3,12 M4,-16 L4,12 M11,-14 L11,10" stroke="#d9a06b" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle r="30" fill="none" stroke="#c4b5fd" stroke-width="1.6" opacity=".7"/>
    </g>
    <!-- head -->
    <circle cy="-100" r="76" fill="url(#hair)"/>
    <circle cy="-92" r="66" fill="#f6cfa4"/>
    <!-- headband -->
    <rect x="-68" y="-140" width="136" height="17" rx="8.5" fill="#3b2f5c"/>
    <rect x="-27" y="-144" width="54" height="24" rx="6" fill="#c0bcd6" stroke="#8f8ab0" stroke-width="2"/>
    <text y="-126" text-anchor="middle" font-family="serif" font-size="16" font-weight="bold" fill="#4a4470">心</text>
    <!-- spiky bangs -->
    <path d="M-66,-96 L-68,-124 Q0,-176 68,-124 L66,-96 Q52,-116 34,-100 Q18,-120 0,-102 Q-20,-122 -42,-100 Q-56,-112 -66,-96 Z" fill="url(#hair)"/>
    <!-- face: closed eyes, blush, focus -->
    <path d="M-38,-70 q11,9 22,0 M16,-70 q11,9 22,0" fill="none" stroke="#3a2b1e" stroke-width="3.6" stroke-linecap="round"/>
    <ellipse cx="-44" cy="-54" rx="9" ry="5" fill="#f0a887" opacity=".55"/>
    <ellipse cx="44" cy="-54" rx="9" ry="5" fill="#f0a887" opacity=".55"/>
    <path d="M-7,-36 q7,5 14,0" fill="none" stroke="#3a2b1e" stroke-width="3" stroke-linecap="round"/>
    <!-- chakra wisps -->
    <path d="M-96,-40 q-14,-16 -4,-34 M96,-40 q14,-16 4,-34" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
  </g>

  <!-- receiver: ghosted silhouette awaiting the mind -->
  <g transform="translate(650,342) scale(.92)" stroke="#8b5cf6" stroke-opacity=".4" fill="#14122a">
    <ellipse cy="152" rx="66" ry="11" fill="#000" stroke="none" opacity=".25"/>
    <path d="M-72,145 C-72,22 -44,-12 0,-12 C44,-12 72,22 72,145 Z" stroke-width="2.5" stroke-dasharray="7 7"/>
    <circle cy="-96" r="70" stroke-width="2.5" stroke-dasharray="7 7"/>
    <path d="M-32,-92 q10,7 20,0 M12,-92 q10,7 20,0" fill="none" stroke="#8b5cf6" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>
    <circle cy="-215" r="26" fill="none" stroke="#c4b5fd" stroke-opacity=".55" stroke-width="2" stroke-dasharray="4 7"/>
  </g>

  <text x="450" y="532" text-anchor="middle" font-family="-apple-system,'Segoe UI',Roboto,sans-serif" font-size="14" letter-spacing="4" fill="#8e8ab0">SHINTENSHIN&#160;&#160;&#8226;&#160;&#160;MIND-BODY TRANSFER JUTSU</text>
</svg>`;

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
