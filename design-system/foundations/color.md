# Colour

Monochrome UI, one accent. Colour carries **meaning** (active, free, urgent, destructive),
never decoration. Every colour is a token on `.phone`; dark values override on `.phone.dark`.

## Roles

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--ink` | `#1a1a1a` | `#f4f4f4` | Primary text and icons; solid primary button fill |
| `--ink-2` | `#5c5c5c` | `#a2a2a8` | Secondary text: meta, subtitles, placeholders, inactive tabs |
| `--bg` | `#ffffff` | `#121215` | Screen background; text on an `--ink` fill |
| `--surface` | `#f4f4f4` | `#212127` | Raised containers: inputs, segmented track, icon wells |
| `--surface-2` | `#e9e9e9` | `#2a2a31` | Pressed / inactive fills, disabled button, grab handle |
| `--hair` | `#e6e6e6` | `#2a2a31` | 1px dividers and 1.4px component borders |
| `--accent` | `#1e7b64` | `#77c8b1` | Active / selected / primary emphasis, links in accent |
| `--free` | `#1e7b64` | `#77c8b1` | The Free chip fill (`--on-solid` text on it); same value as `--accent`, separate role |
| `--warn` | `#a8541c` | `#e0a668` | Caution about a listing: "Last few", "Sale not started" |
| `--danger` | `#c23b57` | `#e2637c` | Negative / destructive: sold out, cancelled, delete, leave. Nothing else is red |
| `--on-solid` | `#ffffff` | `#10231e` | Text/icons **on** an accent, free or danger fill |

### What each colour means (one job each)

| Meaning | Tokens | Examples |
| --- | --- | --- |
| Yours / positive | `--accent`, `--free` | Free chip, Tickets available, the added tick, "In your plan" |
| On today | `--tint-blue` + `-ink` | Festival "On now" |
| Caution | `--tint-amber` + `-ink` | Overlap with a plan item (never red) |
| Listing warning | `--warn` | Sale not started, Last few |
| Negative / destructive | `--danger` | Sold out, cancelled, delete / leave |
| Category | `--tint-*` | Category labels and calendar bars; information, never status |
| Neutral | `--ink`, `--ink-2`, `--surface`, `--hair` | Everything else; upcoming (outlined), past (grey) |

Live version with rendered examples: **Library › Colour › What each colour means**.

### Tints

| Token pair | Use |
| --- | --- |
| `--tint-{pink,purple,orange,amber}` + `-ink` | **Category colours** — Search tiles, category tags, festival calendar bars |
| `--tint-blue` + `-ink` | **On now** status only. Never a category |

One map, `CAT_TINT` (read through `catTint()` / `catTintName()`), gives every category its tint, so
"Live Music" is the same purple on a Search tile, a tag and a calendar bar. Unlisted categories
are purple. There is no green tint: green is `--accent` / `--free` (Free / yours). Amber also marks
an overlap, always with the word "Overlaps" and an alert icon. Every `-ink` passes
4.5:1 on its own tint and on `--bg` in both themes (light orange ink is `#b83d0b`, amber ink
`#925d05` since Oct 2026), so a tint ink can carry a short label: category tags, the On now
pill, the amber overlap line.

## Measured contrast (WCAG 2.2)

| Pair | Light | Dark |
| --- | --- | --- |
| `--ink` on `--bg` | 17.40 | 17.00 |
| `--ink-2` on `--bg` | 6.69 | 7.36 |
| `--ink-2` on `--surface` | 6.08 | 6.31 |
| `--ink-2` on `--surface-2` | 5.51 | 5.61 |
| `--accent` on `--bg` | 5.16 | 9.51 |
| `--warn` on `--bg` | 5.32 | 8.75 |
| `--danger` on `--bg` | 5.18 | 5.62 |
| `--on-solid` on `--accent` | 5.16 | 8.34 |
| `--on-solid` on `--danger` | 5.18 | 4.92 |

Every documented pair passes AA (4.5:1) for body text in both themes. Pairs **not** in this
table are not approved — check them (console **Tools → Library → Colour tokens** runs a live
audit) or use a listed pair.

## Rules

- **No hex in a mobile rule or builder.** `design-eval.js` fails on new raw colours.
- **Mint is never text on white.** `#77c8b1` on `#ffffff` is 1.97:1. Use `--accent`; it
  resolves to the dark green in light mode.
- **On a solid fill, use `--on-solid`.** Not `--bg`, not `#fff` — `#fff` on dark-mode mint is
  1.97:1 (this exact bug shipped on `.pricetag` and was fixed).
- **Colour never carries state alone.** Selected chips also invert fill; errors also have
  text; toggles also set `aria-pressed`/`aria-checked`.
- **Photos get a scrim, not a colour guess.** Text over imagery sits on a gradient scrim
  (`rgba(0,0,0,.55)` → transparent) and is white; that is one of the documented `ALLOW`
  exceptions.
- **Brand colours are data.** `LIVE_BRANDS[].bg/.fg` appear only on that brand's hero and
  circle surfaces. Never reuse one for app chrome.
- **Need a new colour?** It's a new token with a light *and* dark value and a role comment,
  agreed first. See [decisions.md](../decisions.md) — the final brand teal is still open.

## Dark mode

Dark is designed, not inverted: fills go deep and low-chroma, text goes light, the accent
shifts to mint and `--on-solid` flips to near-black so text on mint stays legible. Shadows get
heavier alpha (they barely register on `#121215`). Check every screen in both.
