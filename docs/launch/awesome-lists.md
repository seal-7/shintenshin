# Awesome-list submission research

Research note on where to submit Shintenshin as a PR to "awesome Claude Code"
style lists. Checked activity (last push, star count, open issues) as of
2026-07-04 via the GitHub API before shortlisting.

Ruled out: **hesreallyhim/awesome-claude-code** (the largest/most-starred list,
~48k stars, pushed same day) — it does **not** take PRs for resource
submissions. Its CONTRIBUTING.md is explicit: submissions go through a GitHub
issue form (`recommend-resource.yml`) only, "Do not open a PR," and
recommendations are currently paused while the list is redesigned. Worth
revisiting later, but not a PR target today.

---

## 1. ComposioHQ/awesome-claude-plugins

- **Repo:** https://github.com/ComposioHQ/awesome-claude-plugins
- **Activity:** 1,804 stars, 242 open issues, last pushed 2026-05-01 — active.
- **Submission mechanism:** Fork, add your plugin, update the README, open a
  PR (`Contributing` section in the README itself; no separate
  CONTRIBUTING.md). External (non-vendored) plugins are listed as plain
  links alongside vendored ones — e.g. `backlog`, `nano-banana`, and
  `context-mode` are all just linked out to their own repos.
- **Section it fits:** `## Plugins` → `### Developer Productivity` — sits
  naturally next to `backlog` ("Persistent, cross-session task management
  ... skills for planning, standups, and handoffs"), which is the closest
  existing entry in spirit (session continuity / handoff).
- **Entry format:** `- [name](url) - Description.`
- **Exact line to add:**
  ```
  - [shintenshin](https://github.com/seal-7/shintenshin) - Export your entire Claude Code conversation as an E2E-encrypted link (AES-256-GCM, key never touches the server); anyone can import it into their own Claude Code and resume exactly where you left off.
  ```

## 2. travisvn/awesome-claude-skills

- **Repo:** https://github.com/travisvn/awesome-claude-skills
- **Activity:** 13,923 stars, 583 open issues, last pushed 2026-04-28 — very
  active, high PR volume.
- **Submission mechanism:** Fork → branch → add entry → PR, per
  `CONTRIBUTING.md`. Note as of 2026 they've added a "social proof"
  requirement for skill submissions and explicitly reject "SaaS wrapper"
  skills that just funnel to a paid product — Shintenshin qualifies as a
  genuine standalone tool (self-hostable, MIT, no paid tier), so it should
  clear that bar.
- **Section it fits:** `## 🌟 Community Skills` → `### Individual Skills` —
  Shintenshin ships as a plugin with two skills (`send`/`receive`), which
  matches this section's scope (community-created skills, not just
  Anthropic's official ones).
- **Entry format:** `- **[Name](link)** - Clear, concise description of what
  it does`
- **Exact line to add:**
  ```
  - **[Shintenshin](https://github.com/seal-7/shintenshin)** - Export your entire Claude Code conversation as an E2E-encrypted link and resume it in someone else's Claude Code with one command; AES-256-GCM, server never sees the key or plaintext.
  ```

## 3. jmanhype/awesome-claude-code

- **Repo:** https://github.com/jmanhype/awesome-claude-code
- **Activity:** 21 stars, 57 open issues, last pushed 2026-03-25 — smaller
  and slower-moving than the two above, but its CONTRIBUTING.md explicitly
  welcomes PRs with a simple, low-friction format, so it's an easy second
  (third) submission with little extra effort once the PR for #1 exists.
- **Submission mechanism:** Fork → PR, per `contributing.md`: "Make an
  individual pull request for each suggestion," format is
  `[Title](link) - Description.`, end descriptions with a period, one PR per
  suggestion.
- **Section it fits:** `## Plugins & Extensions` — a markdown table with
  columns `Name | Maintainer | Description`, alongside entries like
  "Multi-Agent Intelligence Marketplace" and "Docker Claude Plugins."
- **Entry format (table row, matching existing rows in this section):**
  ```
  | [Shintenshin](https://github.com/seal-7/shintenshin) | seal-7 | Export your entire Claude Code conversation as an E2E-encrypted link; import it into another Claude Code and resume exactly where you left off. |
  ```

---

## Summary

| List | Stars | Last push | Format | Section |
|---|---|---|---|---|
| ComposioHQ/awesome-claude-plugins | 1,804 | 2026-05-01 | `- [name](url) - Description.` | Developer Productivity |
| travisvn/awesome-claude-skills | 13,923 | 2026-04-28 | `- **[Name](link)** - Description` | Community Skills → Individual Skills |
| jmanhype/awesome-claude-code | 21 | 2026-03-25 | Markdown table row | Plugins & Extensions |

Recommended order: submit to ComposioHQ and travisvn first (highest traffic,
most active review cadence); jmanhype is low-effort enough to bundle in the
same pass but is a smaller audience.
