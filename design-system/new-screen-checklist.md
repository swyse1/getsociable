# New screen / feature checklist

Copy this into your PR description or summary and tick it honestly. An unticked box with a
reason is fine; a ticked box that isn't true is not.

## Before building
- [ ] I know which **family** this belongs to and which **existing screen** I'm copying structure from
- [ ] Every control I need is in [components.md](components.md), or I've flagged the new one
- [ ] I've checked [decisions.md](decisions.md) — nothing locked is being reopened; open items I touch are named

## Foundations
- [ ] Every new colour, size, weight, radius, shadow, duration, z-index is a `var(--token)`
- [ ] Icons: 12/14/16/20/24 only, stroke 1.8; header + tab icons 24, icon buttons 20
- [ ] Spacing on the scale; 16px gutter; rows `12px 16px`; sections 20–24 apart
- [ ] Type uses the role table — title 700, meta `--ink-2`; nothing under 11px
- [ ] Header is `brandHeader()` or `.titlerow` — not a new one

## Structure
- [ ] Registered in `SCREEN_GROUPS` and routed in `buildPhone()`
- [ ] Empty / filtered-empty / populated / long-content states exist (in `SCREEN_STATES`)
- [ ] Sheets rendered at `.phone` level and added to `sheetOpen`; Escape closes them
- [ ] Listings ↔ Plans mirror still holds if I touched either

## Accessibility
- [ ] All targets ≥ 44×44 (padding or `.tap-expand`)
- [ ] Contrast checked in **light and dark**
- [ ] Clickable non-buttons: `role` + `tabindex="0"`; icon-only controls: `aria-label`
- [ ] State in ARIA (`aria-pressed` / `-selected` / `-checked` / `-disabled`), not colour alone
- [ ] Decorative SVGs `aria-hidden="true" focusable="false"`

## Content
- [ ] Sentence case, verbs on buttons, UK English, real data (no lorem)
- [ ] Longest real label tested — truncates, doesn't clip

## Verify
- [ ] `node design-eval.js` → PASS
- [ ] `node tools/audit-runtime.js --screen=<id>` → PASS (or: couldn't run, and why)
- [ ] `node tools/build-tokens.js --check` → in sync
- [ ] `node tests/festival-navigation.js && node tests/map-policy.js` → PASS
- [ ] I **looked** at it in light and dark, at 393px and at 360px, and icons read at their size
