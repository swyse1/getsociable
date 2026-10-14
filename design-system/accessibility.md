# Accessibility

Target: **WCAG 2.2 AA**. These are floors. Each rule lists how it's enforced — a rule with
no enforcement is marked *manual* and belongs on the [checklist](new-screen-checklist.md).

| Rule | Standard | Enforced by |
| --- | --- | --- |
| Tap targets ≥ 44×44 (`--tap-min`) | WCAG 2.5.8 AA (24px) — we use Apple HIG / 2.5.5's 44 | `audit-runtime` `tap-target` |
| Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24px or ≥ 18.66px bold) in light **and** dark | 1.4.3 | `audit-runtime` `contrast`; Library colour audit |
| Icons and control borders ≥ 3:1 | 1.4.11 | *manual* — use documented pairs in [color.md](foundations/color.md) |
| Nothing readable < 11px (`--font-min`) | legibility | `design-eval` + `audit-runtime` `font-min` |
| No clipped text — truncate with ellipsis/line-clamp | 1.4.10 / 1.4.12 | `audit-runtime` `clipped` |
| Clickable `div`/`span` has `role` | 4.1.2 | `design-eval` `a11y-role` |
| Anything with a role is focusable (`tabindex="0"`) | 2.1.1 | `design-eval` `a11y-focus` |
| Decorative SVG `aria-hidden="true" focusable="false"` | 1.1.1 | `design-eval` `a11y-svg` + `audit-runtime` `svg` |
| Every control has an accessible name (text, `aria-label`, or a `<label>`) | 4.1.2 | `audit-runtime` `name` |
| Tabs carry `aria-selected`; checkboxes / switches carry `aria-checked` | 4.1.2 | `audit-runtime` `state` |
| Bottom sheets are `role="dialog"` + `aria-modal="true"` + a name | 4.1.2 | `audit-runtime` `dialog` |
| One page heading per screen (`h1` Home / login, `h2` elsewhere) | 1.3.1 / 2.4.6 | `audit-runtime` `heading` |
| Every `<img>` has `alt` (`""` when decorative) | 1.1.1 | `audit-runtime` `img` |
| Visible focus ring (2px `--accent`, 2px offset) | 2.4.7 / 2.4.11 | global `:focus-visible` rule |
| Motion honours `prefers-reduced-motion` | 2.3.3 | global rule in `index.html` |
| Sheets rendered at `.phone` level | — (clipping) | `design-eval` `sheet-placement` |
| Every `var(--token)` is declared | — (silent fallback) | `design-eval` `undefined-token` |

## Semantics

- **Prefer real elements.** `<button>` for actions, `<a>`/`data-screen` for navigation,
  `<input>` + `<label>` for fields. A `div role="button"` also needs Enter/Space handling.
- **Icon-only controls** have `aria-label` on the control ("Save event", not "heart").
- **State is in ARIA, not colour:** `aria-pressed` (toggles, segments, chips),
  `aria-selected` (tabs), `aria-checked` (checkbox/radio chips), `aria-expanded` (disclosure),
  `aria-disabled` or `disabled` (never just a grey style — the old Preferences Save button did
  this and was fixed).
- **One page heading per screen:** `h1` on Home (the logo, alt "GetSociable") and login, `h2`
  elsewhere (the title in the header); section titles are `h3`. The image-only intro carousel
  has a visually hidden `h1`.
- **Images:** content photos get `alt` describing them ("Crowd at Belfast Mela"); decorative
  thumbnails next to a title get `alt=""`.
- **Live updates:** toasts are `role="status" aria-live="polite"`.

## Sheets & dialogs

`role="dialog" aria-modal="true" aria-labelledby="<h3 id>"`; focus moves to the sheet on open
and returns to the trigger on close; Escape and scrim tap dismiss; background doesn't scroll.

## Small visuals, big targets

Keep the glyph small and the target big: add `.tap-expand` (a centred 44×44 `::before`) to a
visually small control, or use padding. Never shrink the target to fit the visual.

## Where things stand

- **Rendered audit: 0 findings** on all 112 screens and states, light and dark, on all 11
  rules: tap targets, clipped text, contrast, nothing under 11px, accessible names, ARIA state,
  sheets as dialogs, one page heading, image alt, hidden icons, render errors.
  `.runtime-baseline.json` is empty, so *any* new finding fails. Still manual: focus moving
  into / out of sheets, Escape, `aria-pressed` on toggles, 3:1 for icons and borders.
- **Markup: every clickable `div`/`span` has a role and is focusable** (`a11y-role` 0). The
  static eval still records older visual debt (literal spacing, radii, shadows) in
  `.design-baseline.json`; it can only go down.
- **Hit areas** are built into the components — see
  [components.md → Hit areas](components.md#hit-areas).

## Running it

- Console: **Tools → Library → Accessibility** runs the audit as soon as it opens: every screen
  rendered off-screen, findings listed by rule, by component and by screen.
- Terminal / CI: `npm run audit` (same code, ratcheted against the baseline).

`accessibility_report.md` at the repo root is a historical snapshot, not the current state.
