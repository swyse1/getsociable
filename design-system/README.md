# GetSociable Design System

One source of truth for how the GetSociable consumer app looks, reads and behaves — for
designers, for AI agents and for the developers building it.

**The CSS is the source of truth.** Tokens live in the `.phone{}` / `.phone.dark{}` blocks of
[`index.html`](../index.html). Everything else is derived from or checked against them:

```
index.html  .phone{ --tokens }  ──build-tokens.js──▶  design-system/tokens.json  (developers, Figma)
      │
      ├── Library + handoff     console pages, read the same tokens via dtcgTokens()
      ├── design-eval.js        static check: every new rule uses the scale        (ratchet)
      └── audit-runtime.js      rendered check: tap size, clipping, contrast       (ratchet)
```

`dtcgTokens()` lives in `index.html` and is the only CSS→token converter: the console's
Library and every handoff export call it in the browser, `tools/build-tokens.js` calls it in
node. The rendered audit is likewise one function (`a11yAuditAll()`), run from the console's
Accessibility tab or headless by `tools/audit-runtime.js`.

## Contents

| File | What's in it |
| --- | --- |
| [foundations/color.md](foundations/color.md) | Colour roles, light/dark values, contrast pairs, category tints |
| [foundations/typography.md](foundations/typography.md) | Type roles, weights, line heights, truncation |
| [foundations/spacing-layout.md](foundations/spacing-layout.md) | 2px grid, gutters, screen anatomy measurements |
| [foundations/shape-elevation-motion.md](foundations/shape-elevation-motion.md) | Radius, shadow, z-index, duration, easing, reduced motion |
| [foundations/iconography.md](foundations/iconography.md) | Icon sizes, stroke, how to add and use icons |
| [components.md](components.md) | Every reusable component: when to use, anatomy, states, a11y |
| [patterns.md](patterns.md) | Screen anatomy, headers, lists, sheets, empty states, forms, adding screens |
| [accessibility.md](accessibility.md) | The WCAG 2.2 AA floor and how each rule is enforced |
| [content.md](content.md) | Voice, tone, microcopy rules |
| [new-screen-checklist.md](new-screen-checklist.md) | The checklist to run before calling a screen done |
| [work-instructions.md](work-instructions.md) | Step by step, with requests for an AI assistant: convert a live screen or pop-up, add / change / remove a component, settle a decision |
| [decisions.md](decisions.md) | Locked product decisions and open questions (with owners) |
| [tokens.json](tokens.json) | Machine-readable tokens — **generated**, never edit by hand |

## Principles

1. **Role before value.** You never choose "13px" — you choose "button label", and the token
   gives you 13px. Roles survive redesigns; numbers don't.
2. **One of each.** One chip, one list row, one sheet, one header per screen type. Variation
   is a modifier class (`.chip.applied`), never a lookalike.
3. **Both themes, always.** Every screen is designed and checked in light and dark.
4. **Accessible is the default, not a pass.** 44px targets, AA contrast and 11px minimum are
   floors, not goals.
5. **Mirrors, not siblings.** Listings and Plans use the same components, positions and
   spacing. A user moving between them should feel no seam.
6. **Enforced, not advisory.** A rule that isn't checked by a script is a suggestion. Where a
   rule can be automated, it is.

## For developers

- **Tokens:** [`tokens.json`](tokens.json) follows the
  [W3C Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/)
  (stable). It loads straight into [Style Dictionary](https://styledictionary.com/),
  Tokens Studio, Terrazzo or Figma variables import. Colours are split `color.light` /
  `color.dark`; every token carries its role as `$description`.
- **Suggested naming in code:** keep the token names (`--ink`, `--surface`, `--fs-body`,
  `--radius-lg`). A Vue component that reads `var(--radius-lg)` will follow a future
  rebrand for free.
- **Components:** [components.md](components.md) is the spec — anatomy, measurements, states
  and ARIA per component. The console's **Tools → Library** tab shows each one live, and its
  **Developer handoff** page exports the tokens as W3C JSON, CSS, SCSS, Tailwind, SwiftUI and
  Android XML.
- **Staying in sync:** `node tools/build-tokens.js --check` exits 1 if `tokens.json` is out of
  date. Run it in CI next to `node design-eval.js`.

## Commands

```bash
npm run check          # design-eval + tokens sync + tests  (no dependencies needed)
npm run tokens         # regenerate tokens.json after changing a token
npm run audit          # runtime audit, needs Playwright (see ../CLAUDE.md)
```

## Changing the system

1. Propose it (a token, a component, a rule) — with the screen that needs it.
2. Add/change the token in `.phone{}` with a role comment; dark value in `.phone.dark{}` if
   it's a colour or shadow.
3. `npm run tokens`, update the matching foundation doc, update the eval's scale constants if
   it's a new size.
4. `npm run check` — then say what you changed and why in the commit.

## Research this is built on

- AGENTS.md as the cross-tool agent contract, imported by CLAUDE.md; short always-on rules
  with deeper docs loaded on demand —
  [agents.md](https://agents.md/),
  [AGENTS.md vs .cursorrules vs Claude Skills (2026)](https://blog.buildbetter.ai/agents-md-vs-cursorrules-vs-claude-skills-2026-comparison/),
  [Cursor rules vs CLAUDE.md](https://techsy.io/en/blog/cursor-rules-vs-claude-md),
  [mattpocock/agent-rules-books](https://github.com/mattpocock/agent-rules-books).
- Deterministic enforcement via hooks instead of hoping the model remembers —
  [Claude Code hooks](https://code.claude.com/docs/en/hooks),
  [hooks for production quality](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns).
- Token format —
  [Design Tokens spec reaches first stable version (W3C, Oct 2025)](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/).
- Accessibility floor — [WCAG 2.2](https://www.w3.org/TR/WCAG22/) AA; 44px target from
  Apple HIG / WCAG 2.5.5.
