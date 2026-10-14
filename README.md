# GetSociable — design prototype and design system

This repository holds the **interactive prototype of the GetSociable consumer app** (Listings,
Plans, Hub, Account), the **design system** it is built on, and the **developer handoff**
(tokens, components, icons, accessibility rules).

It is not the production app. It is the agreed design: every screen, every state, and the
decisions behind them, in one place that both a founder and a developer can open.

- One file: `index.html`. No build step, no install, no server needed.
- 112 screens and states across 11 sections, light and dark.
- 40 documented components and 65 icons, all checked against the screens automatically.
- Accessibility (WCAG 2.2 AA) checked on every screen in both themes.

---

## For Peter and anyone who doesn't write code

### Open it

- **Online:** open the link you were sent. On the GetSociable GitHub account it is served by
  GitHub Pages (see [Hosting](#hosting)).
- **On your computer:** download the repository and double-click `index.html`. It opens in
  any browser.
- **On a phone:** open the link on the phone, or add `?mode=phone` to the end of the address.
  That shows just the app, full screen, the way testers saw it.

### Find your way round

| You want to… | Do this |
| --- | --- |
| Look at one screen | Pick a section in the top bar (Onboarding, Events, Festivals, Plans, Connections, Groups, Hub, Search, Notifications, Account, Brands) and choose the screen |
| See every screen at once | **Screens** (top right). Click any screen to enlarge it; the arrows step through them. **Compare with live** puts the live app's screen beside it once the screenshots are added (see the work instructions) |
| See what is decided and what is open | **Summary** (top right). Open items first, with the question, what's built, what's recommended and the latest note |
| Change a design option and see it on the phone | Left panel: each card is one decision. Pick an option and the phone changes |
| Mark a decision Agreed or Parked | On the decision card. It saves in your browser; the agreed baseline is built in |
| See the style guide | **Tools → Library**: colour, type, spacing, icons, every component in every state, accessibility |
| Get back to the prototype | **← Back to prototype** (top right), or press **Esc** |
| Send someone a screen | Enlarge it on the Screens page and press **Copy link** |
| Copy the decisions into notes | **Summary → Copy for notes** |

The tap-target overlay (**Tools → Spec overlay**, or **S**) shows the 44×44 touch areas and the
16px screen edges.

### What is settled and what isn't

- **Agreed** decisions are built in and show as agreed in every browser.
- **Open** decisions and the **8 style questions** (chip corners, chip height, one search field
  and so on) are listed on the Summary page and in [`design-system/decisions.md`](design-system/decisions.md).
  Each has an owner, mostly Peter.

### Asking for a change

The repository is set up so that an AI coding assistant (Claude Code, Cursor, Codex, Copilot,
Gemini) follows the same rules a designer would. You can describe what you want in plain
English. [`design-system/work-instructions.md`](design-system/work-instructions.md) has
ready-to-use requests for the common jobs: converting a live screen or pop-up, and adding,
changing or removing a component.

---

## For developers

### What's in the repository

| Path | What it is |
| --- | --- |
| `index.html` | Everything: the phone prototype, the decision panel, Screens, Summary, Library and handoff |
| `AGENTS.md` | **The rules.** Every contributor and AI tool reads this first (`CLAUDE.md` points to it) |
| `design-system/` | Foundations, components, patterns, accessibility, content, decisions, work instructions |
| `design-system/tokens.json` | Design tokens in W3C DTCG format. **Generated** from `index.html`, never edited by hand |
| `design-eval.js` | Static check: tokens, icon sizes, type, accessibility markup. Ratchet: `.design-baseline.json` |
| `tools/audit-runtime.js` | Rendered check of every screen in light and dark (11 rules). Ratchet: `.runtime-baseline.json`, which is empty |
| `tools/build-tokens.js` | Regenerates `tokens.json` (`--check` fails if it is stale) |
| `tests/` | `library.js` (Library, handoff, components match screens), `festival-navigation.js`, `map-policy.js` |
| `.claude/` | Claude Code hook (runs the design check after every edit) and skills (`new-screen`, `design-review`) |
| `.cursor/rules/` | The same pointers for Cursor |
| `graveyard/` | Directions explored and dropped, kept for reference (also on the Screens page) |

### How the prototype is built

- **Tokens are CSS custom properties** on `.phone{}` (light) and `.phone.dark{}` (dark) in
  `index.html`. Every colour, size, radius, shadow, duration and z-index in a phone rule is a
  `var(--token)`. `tokens.json`, the Library and every handoff export are generated from that
  block, so they cannot disagree with the screens.
- **Screens are functions** (`scrHub()`, `scrPlan()`…) that return HTML strings, routed in
  `buildPhone()`. State lives in two objects: `A` (design options and data conditions) and
  `UI` (where you are, what is open).
- **The screen list** is `SCREEN_GROUPS` (sections in Peter's order). Different data conditions
  of one screen are `SCREEN_STATES`; different layouts for the same job are `SCREEN_VARIANTS`.
- **Clicks** are one delegated handler: `data-act="…"` for actions, `data-screen="…"` for
  navigation.
- **Components** are shared CSS classes plus builder helpers (`controlChip()`, `sheetRow()`,
  `brandHeader()`, `typenav()`…). `componentSpecs()` documents each one for the Library, and
  `compMeasure()` measures the Library demos against every screen.

### Taking it into production

- **Tokens:** `design-system/tokens.json` loads into Style Dictionary, Tokens Studio or Figma
  variables. **Library → Developer handoff** gives the same values as CSS, SCSS, Tailwind,
  SwiftUI and Android XML.
- **Components:** **Library → Components** shows each one in every state, with its classes,
  where it is used, its accessibility contract and copyable markup. Each card says whether the
  demo matches what the screens render, and lists any size drift between screens.
- **Icons:** **Library → Icons**, 65 icons on a 24×24 grid with 1.8 stroke. Export as an SVG
  sprite, JSON, JSX or individual files. One icon per meaning; see
  [iconography](design-system/foundations/iconography.md).
- **Locked decisions and product rules:** **Library → Developer handoff** and
  [`design-system/decisions.md`](design-system/decisions.md).

### Checks

```bash
npm run check   # design eval + tokens in sync + tests (no install)
npm run audit   # rendered accessibility audit + Library test (needs Playwright)
```

Playwright, once: `npm i -D playwright && npx playwright install chromium`.
Both audits are ratchets: known old debt is recorded in a baseline, anything new fails.

### Keyboard (console)

| Key | Does | Key | Does |
| --- | --- | --- | --- |
| `G` | Screens page | `/` | Jump to a screen by name |
| `S` | Spec overlay | `D` | Phone dark mode |
| `H` | Hide / show side panels | `L` | Listings / Plans |
| `E` | Decision log as text | `Esc` | Back to the prototype |

### Links that open a specific view

- `?screen=plancomments` one screen · `?mode=index` the Screens page (`&dark=on` for dark)
- `?mode=library&lib=components` a Library tab · `?mode=phone&screen=home` the phone only

### Hosting

Any static host works; there is nothing to build.

- **GitHub Pages:** repository **Settings → Pages → Deploy from a branch → `main` / root**.
  The site updates on every push to `main`.
- **Vercel:** `vercel.json` sends the bare address to the phone-only view
  (`?mode=phone&screen=home`) for testers. Add any other `mode`, e.g. `?mode=console`, to get
  the full console.

### Contributing

Read [`AGENTS.md`](AGENTS.md), then
[`design-system/work-instructions.md`](design-system/work-instructions.md). Work on a branch,
run the checks, look at what you built in light and dark, and only merge to `main` when the
person who owns the change has seen it.
# getsociable
