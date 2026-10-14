# Iconography

One family: **outline, 24×24 grid, 1.8 stroke, round caps and joins**, `currentColor`.
All artwork lives in `ICON_PATHS` in `index.html`; `ICON_META` records each icon's style and
default size. Brand marks (Google, Apple…) are solid and never restyled.

## Sizes — five, no others

| Token | px | Use |
| --- | --- | --- |
| `--icon-xs` | 12 | Inside chips (`.chip svg`) and tiny inline badges |
| `--icon-sm` | 14 | Inline with meta/body text, icon chips, category chips |
| `--icon-md` | 16 | Inside text buttons, sheet rows, form fields, "View all" chevron |
| `--icon-lg` | 20 | **Standalone icon buttons**, section headers, hub tiles, weather |
| `--icon-xl` | 24 | **Tab bar, header actions** (back, share, more, close) |

**The glyph is not the target.** A 20px icon button is still a 44×44 tap area — pad the
button. Shrinking the tap area to the icon is how `.hbtn2` (33px) and `.plusbtn` (28px)
became debt.

If an icon looks too small, go **up** a step. Never 15, 18 or 22.

## How to use

**Default size, as a string** — `ICONS.pin` (complete `<svg>`, size from `ICON_META`).

**Specific size** — `renderIcon('pin', 'lg')` or `renderIcon('pin', 20)`.

**Sized by CSS** (preferred inside components) — `renderIcon('pin', null, {cssSized:true})`
or build the svg from raw paths, then size in the component rule:

```js
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
+ 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
+ ICON_PATHS.pin + '</svg>'
```

```css
.myrow svg{width:var(--icon-md);height:var(--icon-md);flex:none}
```

## Rules

- **Never nest `ICONS.x` inside another `<svg>`** — it's already a full svg with its own size.
  Use `ICON_PATHS.x` when building your own.
- **No `width`/`height` attributes on hand-built svgs.** Size comes from one place: CSS or
  `renderIcon`. Mixed sizing is how the scale drifted.
- **Icon next to text:** parent is `display:inline-flex; align-items:center; gap:6px` (8px in
  buttons). Inline-block svgs sit on the baseline and ride high.
- **Decorative** (next to a visible label): `aria-hidden="true" focusable="false"`.
  **Icon-only control:** the *button* gets `aria-label="Share"`; the svg stays hidden.
- **Active vs inactive** is colour (`--ink` vs `--ink-2`) plus `aria-selected` /
  `aria-pressed` — not a different icon weight.
- **New icon?** Add it to `ICON_PATHS` + `ICON_META`, draw on the 24 grid with 2px
  padding, stroke only. Then **render it at 14px and 20px and look at it.** The old `palette`
  (four dots in a blob) passed every numeric check and was mush at 14px.
- **No emoji as icons** in UI chrome. They don't theme, don't scale with the stroke family
  and read differently per platform.

## One icon per meaning

The same idea always gets the same glyph, on every screen (Dima's Hub feedback, Oct 2026):

| Meaning | Icon | Where |
| --- | --- | --- |
| Save / saved | `bookmark` (filled once saved) | + sheet "Save for later", photo headers, Hub "Saved & favourites" |
| Share | `upload` (box with an arrow) | + sheet, photo headers, Hub, Account "Share the App" |
| Back | `back` (chevron) | every header, including the round buttons on photos |
| Preferences | `sliders` | Hub, Account "Interests & Preferences" |
| Circles | `circles` (two overlapping rings) | Hub "Circles" heading |
| Dating events | `heart` | that category only — never "save" or "favourite" |

`share` (three linked dots) is kept in the set but not used.

## Open question

Product memory says **Phosphor (Regular / Fill)**; the prototype uses a custom set drawn to
match Phosphor's geometry. Whether production imports Phosphor directly is Martin's call —
see [decisions.md](../decisions.md). Either way the size scale and 1.8-equivalent weight
above hold.
