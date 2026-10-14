# Shape, elevation & motion

## Radius

| Token | px | Use |
| --- | --- | --- |
| `--radius-xs` | 4 | Price tags, tiny badges |
| `--radius-sm` | 8 | Segment thumb, small buttons, image overlay buttons |
| `--radius-md` | 10 | List thumbnails, sheet-row icon wells |
| `--radius-lg` | 12 | Cards, inputs, segmented track, toasts |
| `--radius-xl` | 14 | Hub tiles, avatar tiles |
| `--radius-2xl` | 16 | Large cards, hero images |
| `--radius-3xl` | 20 | Chips, filter chips |
| `--radius-sheet` | 24 | Bottom-sheet top corners (`24px 24px 0 0`) |
| `--radius-pill` | 999px | Primary buttons, pills, count badges |
| `--radius-circle` | 50% | Avatars, round icon buttons, FAB |

**Nested radius:** inner = outer − padding. A 12px card with 4px padding holds an 8px thumb.
Older rules carry 9, 11, 13, 22px — baselined debt, don't copy.

## Elevation

The UI is flat: borders (`--hair`) separate things, shadows only lift things that **float
over** content.

| Token | Light | Use |
| --- | --- | --- |
| `--shadow-1` | `0 1px 3px / .14` | Selected segment thumb |
| `--shadow-2` | `0 4px 14px / .14` | FAB, controls over imagery |
| `--shadow-3` | `0 -8px 32px / .20` | Bottom sheets (casts upward) |
| `--shadow-4` | `0 12px 40px / .22` | Dialogs, popovers, toasts |

Dark mode overrides alpha to .40–.60 — same token, no extra work.

### Scrim

| Token | Value | Use |
| --- | --- | --- |
| `--scrim` | `rgba(15,15,20,.45)` | The dim layer between a full-screen overlay and the page under it |
| `--blur-scrim` | `8px` | `backdrop-filter: blur()` on that layer, so the page reads as "behind" |

Used by full-screen search on Home. (Bottom sheets still use the older `.scrim` at .5 with no
blur — moving them onto `--scrim` is a follow-up, not done here.)

## Stacking (z-index)

| Token | Value | Layer |
| --- | --- | --- |
| `--z-raised` | 1 | Overlapping avatars, badges on thumbs |
| `--z-sticky` | 10 | Sticky section headers |
| `--z-fab` | 20 | Floating action button |
| `--z-tabbar` | 25 | Bottom tab bar |
| `--z-scrim` | 49 | Dimming layer behind a sheet |
| `--z-sheet` | 50 | Bottom sheets |
| `--z-toast` | 70 | Toasts / snackbars |
| `--z-modal` | 80 | Full dialogs above everything |

Never a bare `z-index: 999`. The eval flags literal z-index above 1.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 80ms | Press feedback |
| `--dur-fast` | 120ms | Hover, colour/opacity changes |
| `--dur-base` | 180ms | Toggles, chip state, small moves |
| `--dur-slow` | 240ms | Expanding sections, screen-level fades |
| `--dur-sheet` | 320ms | Sheets entering/leaving |
| `--ease-standard` | `cubic-bezier(.2,.8,.2,1)` | Default for enter/move |
| `--ease-emphasis` | `cubic-bezier(.22,.61,.36,1)` | Sheets, large surfaces |

- Motion explains a change (where did the sheet come from?). It never decorates.
- Animate `transform` and `opacity` only — never `width`, `height`, `top`.
- **Reduced motion is global.** `@media (prefers-reduced-motion: reduce)` zeroes every
  duration inside `.phone`. Don't add per-component overrides; don't rely on an animation
  to convey information.
