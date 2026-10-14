# Typography

**Poppins**, loaded at **400 / 500 / 600 / 700 / 800** only. Any other weight is faked by the
browser and won't match production.

## Type roles

Pick the role. The size follows.

| Token | Size | Weight | Line height | Role | Where it's used |
| --- | --- | --- | --- | --- | --- |
| `--fs-caption` | 11 | 500–600 | 1.45 | Meta, timestamps, tags, tab labels, sheet subtitle | `.ssub`, `.inline-note`, `.pricetag` |
| `--fs-label` | 11.5 | 600 | 1.25 | Chip and category labels, form group labels | `.chip`, `.catchip`, `.fglabel` |
| `--fs-small` | 12 | 600 | 1.35 | Segmented control, secondary actions, inline links, filter chips | `.seg > span`, `.fchip`, `.sheetfoot .clear` |
| `--fs-body` | 12.5 | 500 | 1.55 | Descriptions, field values, empty-state copy | `.fi`, `.empty-copy` |
| `--fs-body-strong` | 13 | 600–700 | 1.35 | Buttons, sheet row titles | `.cbtn`, `.stpbody b` |
| `--fs-card-title` | 13.5 | 700 | 1.35 | List-row / card titles | `.result-row` title, `.lrow` title |
| `--fs-lead` | 14 | 500–600 | 1.5 | Emphasised body, big empty states | `.hub-empty` |
| `--fs-row-title-lg` | 15 | 700 | 1.35 | Large row titles | `.myplan-row` title |
| `--fs-sheet-title` | 16 | 700 | 1.25 | Bottom-sheet heading | `.sheet h3` |
| `--fs-screen-title` | 18 | 700 | 1.25 | Compact centred header with actions either side | `.titlerow h2` |
| `--fs-page-title` | 22 | 700, `-0.3px` | 1.25 | Page header, left-aligned with back button | `brandHeader()` → `.brand-head h2` |
| `--fs-display-sm` | 28 | 700–800 | 1.25 | Onboarding / hero headline | onboarding carousel |
| `--fs-display` | 40 | 800 | 1 | Splash only | splash |

Line heights: `--lh-none` 1 · `--lh-tight` 1.25 · `--lh-snug` 1.35 · `--lh-normal` 1.45 ·
`--lh-relaxed` 1.55.

### Which header?

- **Top-level tab screens and pushed pages** → `brandHeader(title, backAct)` — 22px, left
  aligned, back chevron. This is the default.
- **Utility screens with actions on both sides** (filter, pickers, forms with Save) →
  `.titlerow` — 18px, centred.
- Legacy `.pagetitle` and `.search-top h1` use **23px**; that's baselined debt. Don't copy
  it — new headers use 22 (`--fs-page-title`).

## Rules

- **Nothing under 11px.** Not for badges, not for counts, not for legal. The eval and the
  runtime audit both fail on it.
- **No size off the scale.** 10.5, 15.5, 20, 21, 23 are all drift. Pick the nearest role.
- **Hierarchy through weight and colour before size.** Title 700 `--ink`, meta 500 `--ink-2`
  at the same size often reads better than two sizes.
- **Truncate, don't clip.** Titles that can grow get `-webkit-line-clamp:2` (cards) or
  `text-overflow:ellipsis; white-space:nowrap; overflow:hidden` (single-line meta). Never
  `overflow:hidden` alone — the runtime audit reports that as `clipped`.
- **Sentence case** everywhere. The GetSociable wordmark is the brand's logo image (`logoHtml()`, 32px in headers, 40px on login and the Home footer), never set in type. No ALL CAPS labels (screen readers and
  scanning both suffer); if you want a quiet eyebrow, use `--fs-caption` 600 `--ink-2`.
- **Numbers that update** (counts, prices, times) use `font-variant-numeric: tabular-nums`
  so rows don't jitter.
- **Letter-spacing** only on page titles (`-0.3px`) and tab labels
  (`0.2px`). Leave everything else at 0.

## In code

```css
.myrow-title{font-size:var(--fs-card-title);font-weight:var(--fw-bold);line-height:var(--lh-snug);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.myrow-meta{font-size:var(--fs-caption);font-weight:var(--fw-medium);color:var(--ink-2)}
```
