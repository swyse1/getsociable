# GetSociable — Claude Code

@AGENTS.md

---

## Claude Code specifics

**Hooks are on** (`.claude/settings.json`). After every edit to `index.html` the design eval
runs automatically; if it reports a new violation you'll see it straight away — fix it before
moving on rather than batching fixes at the end. Don't disable the hook to get past it.

**Skills in this repo** (`.claude/skills/`):

- `new-screen` — use whenever you're adding a screen, a state, or a sheet.
- `design-review` — use before saying a UI change is done, or when asked to review a screen.

**Runtime audit needs Playwright.** In the cloud container:

```bash
PLAYWRIGHT_MODULE=/opt/node22/lib/node_modules/playwright \
  node tools/audit-runtime.js            # add --screen=<id> for one screen
PLAYWRIGHT_MODULE=/opt/node22/lib/node_modules/playwright \
  node tests/library.js                  # after touching the Library / handoff / tokens
```

The Library (console → Tools → Library) reads the same `.phone{}` tokens through
`dtcgTokens()`; never retype a token value into Library or handoff code.

Locally: `npm i -D playwright && npx playwright install chromium` once, then `npm run audit`.
If it can't run, say so in your summary — don't claim it passed.

**Look at what you built.** Take a screenshot of the phone (light and dark) with Playwright
before reporting a UI change as finished. The numbers pass long before the design is right.

**Answer first, explain second.** The person reviewing this works from the interactive
prototype, not long write-ups. Lead with what changed and where to see it.
