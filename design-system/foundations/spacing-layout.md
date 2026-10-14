# Spacing & layout

## The scale

A **2px grid**, favouring multiples of 4.

| Token | px | Typical use |
| --- | --- | --- |
| `--space-2` | 2 | Hairline nudges, title → subtitle |
| `--space-4` | 4 | Tight inner gaps, segmented track padding |
| `--space-6` | 6 | Icon ↔ label in chips and inline meta |
| `--space-8` | 8 | Icon ↔ label in buttons; gap between chips; stacked meta lines |
| `--space-10` | 10 | Chip row vertical padding; header bottom padding |
| `--space-12` | 12 | Row vertical padding; thumb ↔ text gap; card inner padding |
| `--space-14` | 14 | Hub tile padding; field top margin; sheet group gap |
| `--space-16` | 16 | **Screen gutter**; list horizontal padding; card padding |
| `--space-20` | 20 | Between sections; above a primary button |
| `--space-24` | 24 | Major section break; sheet bottom padding |
| `--space-32` | 32 | Large empty-state spacing |
| `--space-40` / `48` | 40 / 48 | Empty-state top padding, onboarding |

`--gutter` = **16px**, left and right, every screen. Nothing touches the phone edge except
full-bleed imagery and dividers.

Odd numbers (5, 7, 9, 11, 13, 15, 17) are off-grid. The eval flags new odd paddings, margins
and gaps. Older rules still carry some (e.g. `.chip` 7/11, `.sheet` 17) — that's baselined
debt, not a precedent.

## Rhythm cheat-sheet

| Thing | Spacing |
| --- | --- |
| List row | `12px 16px` padding, 12px thumb ↔ body gap, 1px `--hair` bottom border |
| Chip row | `10px 16px` padding, 8px between chips, horizontal scroll, no scrollbar |
| Section heading → content | 8–10px |
| Section → section | 20–24px |
| Page header | `4px 16px 10px` (back button sits in the 16px gutter at 6px) |
| Bottom sheet | 16px top, 16px sides, 24px bottom; 13px under the grab handle |
| Form field | 14px between fields; 6px label → input |
| Primary button | 20px above; full width minus gutters; 13–14px vertical padding |

## Screen anatomy (393 × 852 phone, iPhone 14 Pro)

```
┌──────────────────────────────┐
│ status bar                   │  fixed
│ header (brandHeader/titlerow)│  flex:none
│ controls (seg / chip row)    │  flex:none — optional
│ ┌──────────────────────────┐ │
│ │ scroll body  (.scroll)   │ │  flex:1, overflow-y:auto
│ │  sections …              │ │
│ └──────────────────────────┘ │
│ tab bar (58px)               │  top-level screens only
└──────────────────────────────┘
  FAB: right 16, bottom 70 (above tab bar)
  Toast: left/right 16, bottom 70
  Sheets / scrims: absolute, rendered at .phone level
```

- Only the body scrolls. Headers, control rows and the tab bar stay put.
- Content under the tab bar needs bottom padding so the last row isn't hidden.
- One scroll direction per region. Horizontal carousels were removed from the feed — one
  listing per row.

## List images

Every list row that shows a listing's image (Home, Festivals, a festival's events, search
results, venues, groups, saved lists, plan items, My plans) uses ONE thumbnail size:
`--thumb-list-w` × `--thumb-list-h` = 120 × 90, 4:3 so photos aren't cropped at the head.
Rows centre their content vertically. Don't set a thumbnail size on a screen; if a row needs
a different image treatment it isn't a list row (carousel card, avatar, notification icon).

## Density

The console and testing-link phone is an iPhone 14 Pro, 393px wide: 361px of content inside
the gutters. Real phones go down to 360px wide (328px of content), so before adding a fourth
item to a row, check it at 360px with a long real-world label ("Food & Drink",
"Belfast Mela Festival 2026"). If it doesn't fit, wrap or reduce items — never shrink text
below its role.
