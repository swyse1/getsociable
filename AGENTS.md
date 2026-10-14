# GetSociable — rules for every AI agent and every contributor

This file is the **contract**. Claude Code, Cursor, Codex, Copilot, Gemini — any tool that
touches this repo reads this first. Humans too. It is deliberately short: it holds the rules
that get broken, and points to the design system for everything else.

- **Repo:** single-file design prototype, `index.html`. No build step, no dependencies.
- **Scope of these rules:** the mobile phone prototype — everything inside `.phone`. The
  design console around it (top bar, side panel, rail, stage) is tooling and is exempt.
- **Full design system:** [`design-system/`](design-system/README.md). Tokens for developers:
  [`design-system/tokens.json`](design-system/tokens.json) (generated — never hand-edit).
- **How to do the common jobs** (convert a live screen or pop-up, add / change / remove a
  component, settle a decision): [`design-system/work-instructions.md`](design-system/work-instructions.md).

---

## The five rules that cause 90% of the rework

1. **Tokens, never numbers.** Every colour, font size, weight, radius, shadow, duration and
   z-index in a new or changed rule is a `var(--token)` from the `.phone{}` block. If no
   token fits, you are either picking the wrong role or you need a new token — **ask, don't
   invent a value.** → [foundations](design-system/foundations/)
2. **Icons are 12 / 14 / 16 / 20 / 24 px, stroke 1.8, viewBox 0 0 24 24.** Header actions
   and tab bar **24**, standalone icon buttons **20**, icons inside text buttons / sheet rows /
   fields **16**, inline with meta text **14**, inside chips **12**.
   *Too-small icons are the #1 complaint — when unsure, go one step up, not down.* The icon
   is small; its **tap target is still 44×44** — reuse a component with a built-in hit area
   or add class `tap-expand`. **One icon per meaning** (save = bookmark, share = upload,
   back = chevron) — see the table in iconography.md.
   → [iconography](design-system/foundations/iconography.md)
3. **Spacing is the scale:** 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 32 · 40 · 48.
   Screen gutter is **16px, always**. Rows 12px vertical / 16px horizontal. Gap between
   icon and label 6–8px. Section gap 20–24px. → [spacing & layout](design-system/foundations/spacing-layout.md)
4. **Reuse the component.** Before writing a new class, look it up in
   [components.md](design-system/components.md). A near-copy of `.chip` or `.result-row`
   is the most common source of "why is this screen slightly different". Change a component
   in its shared rule, never with an inline `style=` on one screen.
5. **Accessible by default.** Every tap target ≥ 44×44. Text contrast ≥ 4.5:1 in **both**
   light and dark. Nothing readable under 11px. Clickable non-buttons get `role="button"`
   + `tabindex="0"`. Every control has a name (icon-only → `aria-label`). Decorative SVGs get
   `aria-hidden="true" focusable="false"`. Sheets are `role="dialog" aria-modal="true"` with a
   name. One page heading per screen (`h2`; `h1` on Home and login).
   → [accessibility](design-system/accessibility.md)

## Token cheat-sheet (pick by role)

| Need | Token |
| --- | --- |
| Main text / secondary text | `--ink` / `--ink-2` |
| Page / raised surface / pressed-or-inactive fill | `--bg` / `--surface` / `--surface-2` |
| Divider / card border | `--hair` |
| Active, selected, primary, "free" | `--accent` (`--free` for the Free badge) |
| Text on a solid accent/danger fill | `--on-solid` (never `--bg`) |
| Urgent / destructive | `--warn` / `--danger` |
| Category tile / tag / calendar bar | `catTint(category)` → `--tint-{pink,purple,orange,amber}` + `-ink` (blue tint = On now only) |
| Meta, timestamp, tab label | `--fs-caption` 11 |
| Chip label | `--fs-label` 11.5 |
| Body / description / field text | `--fs-body` 12.5 |
| Buttons, sheet rows | `--fs-body-strong` 13 |
| List-row title | `--fs-card-title` 13.5 |
| Sheet title | `--fs-sheet-title` 16 |
| Compact header (`.titlerow`) / page header (`brandHeader`) | `--fs-screen-title` 18 / `--fs-page-title` 22 |
| Cards, inputs / chips / primary buttons / sheet top | `--radius-lg` / `--radius-3xl` / `--radius-pill` / `--radius-sheet` |
| Floating control / sheet / dialog | `--shadow-2` / `--shadow-3` / `--shadow-4` |
| Hover/press / state change / sheet in-out | `--dur-fast` / `--dur-base` / `--dur-sheet` + `--ease-*` |

Weights: **400 / 500 / 600 / 700 / 800 only** (`--fw-*`). Titles 700, labels 600, body 500.

## Before you write code

1. Read the story/brief. Identify the **section** (Onboarding / Listings | Events / Listings |
   Festivals / Plans / Connections / Groups / Hub / Search / Notifications / Account / Brands —
   see patterns.md) and the nearest existing screen — **copy its structure**, don't start
   blank.
2. Look up every control you need in [components.md](design-system/components.md).
3. Check [decisions.md](design-system/decisions.md) — locked product decisions are not
   yours to reopen; open ones must be flagged, not silently resolved.

## Adding a screen (mechanics)

1. Builder `scrMyThingApp()` returns an HTML string, using `brandHeader()` or `.titlerow`,
   existing components and `var(--…)` tokens.
2. Register it in `SCREEN_GROUPS` **and** route it in `buildPhone()` — otherwise it's missing
   from the nav, the gallery and the `/` palette.
3. Extra data conditions (empty / populated / sheet open / error) go in `SCREEN_STATES`:
   `params` set `A.*`, `ui` sets overlay/step flags on `UI.*`. A different layout of the
   same screen (the "x of y" alternatives) goes in `SCREEN_VARIANTS`, ordered by preference.
4. Sheets render at `.phone` level, never inside the screen builder, and their open-flag is
   added to the `sheetOpen` condition in `buildPhone()`.
5. Events: `data-act="…"` and a branch in the delegated click handler. Navigation:
   `data-screen="id"`.
6. New or changed component: update its `componentSpecs()` entry (the Library card) and
   `components.md`. The Library measures every demo against the screens; `tests/library.js`
   fails if they disagree.

Full walkthrough: [patterns.md](design-system/patterns.md).

## Definition of done — run these, every time

```bash
node design-eval.js              # static: tokens, icons, type, a11y markup. Must PASS.
node tools/build-tokens.js       # only if you changed a token — regenerates tokens.json
node tools/audit-runtime.js      # rendered: tap targets, clipping, contrast, light + dark
node tests/festival-navigation.js && node tests/map-policy.js
node tests/library.js            # Library + handoff work, match tokens.json, and every
                                 # component demo matches what the screens render
```

Both audits are **ratchets**: known old debt is baselined, anything *new* fails. The rendered
audit's baseline is **empty** — every screen passes all 11 rules today (tap size, clipping,
contrast, font size, names, ARIA state, dialogs, headings, image alt, hidden icons, errors),
so any finding is yours. Never
re-baseline to hide something you added — only after you *removed* findings
(`--baseline`). Then check what no script can:

- [ ] Rendered the screen in **light and dark** and looked at it
- [ ] Icons read at their size (look at 14px and 20px, don't pick a path by name)
- [ ] No label clipped, no text wrapping into an icon, long names tested
- [ ] Empty, loading-free and "lots of data" states considered
- [ ] Copy follows [content.md](design-system/content.md) (sentence case, no jargon)
- [ ] Nothing in the console/tooling changed by accident

Full checklist: [new-screen-checklist.md](design-system/new-screen-checklist.md).

## When a rule doesn't fit

Don't work around it. Either (a) the right token/component exists and you missed it, or
(b) the system needs to grow. For (b): add the token to `.phone{}` with a role comment,
run `node tools/build-tokens.js`, document it in the foundation file, and say so in your
summary. A deliberate exception goes in `ALLOW` in `design-eval.js` **with a written reason**.

## Git

- Branch names are descriptive, **no `claude/` prefix** (e.g. `saved-events-toggle`).
- **Never merge to `main` without being asked explicitly.**
- Commit messages say what changed and why. No model identifiers.
