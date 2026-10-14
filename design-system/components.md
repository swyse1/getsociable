# Components

**Reuse before inventing.** Every entry below is live in `index.html` and in the console's
**Tools → Library** tab. If what you need is *almost* one of these, add a modifier class to
it — don't make a lookalike.

Each entry: **when** to use it, **how** to call it, **states**, **a11y**, and **known debt**
(existing gaps you must not copy).

**Library → Components is measured, not typed.** Each card renders its states with the real
classes and builders, then compares them with every screen and state (`compMeasure()`): font
size and weight, padding, radius, border, gap and, for single controls, height. The card says
**Matches the screens** or what differs, and lists any drift between screens.
`tests/library.js` fails if a demo matches nothing the screens render. How to add, change or
remove a component: [work-instructions.md](work-instructions.md).

---

## Quick lookup

| I need… | Use | Not |
| --- | --- | --- |
| Page header with back | `brandHeader(title, backAct)` | a custom `<h1>` row |
| Centred header with actions both sides | `.titlerow` | `brandHeader` with hacks |
| Bottom navigation | `tabbar(active)` / `liveTabbar(active)` | a new bar |
| Switch between 2–4 views | `viewSwitchHtml('seg', …)` → `.seg` | radio buttons, tabs styled by hand |
| Filter / sort / date controls | `.chip` inside `.chiprow` | a new pill |
| Multi-select options in a sheet | `.fchip` inside `.fchips` | checkboxes |
| Event / venue / listing row | `.result-row` (search/results) or `.lrow` (feeds). Image is always `--thumb-list-w` × `--thumb-list-h` (120×90, 4:3), content centred | a custom flex row, or any other thumbnail size |
| A plan in a list | `.myplan-row` | `.result-row` |
| Section "View all" link | `viewAllAction(attrs, label)` | a bare `<a>` |
| Add-to-plan | `.plusbtn` (on cards) | a bespoke round button |
| Primary / secondary full-width button | `.cbtn` / `.cbtn.active` | a new button class |
| Form field | `.field` > `.fl` + `.fi` | a raw `<input>` |
| Bottom sheet | `.scrim` + `.sheet` + `.grab` (+ `.stprow` rows, `.sheetfoot`) | a fixed `<div>` |
| Confirmation after an action | `flashToast('Added to Friday')` | `alert()`, an inline banner |
| Floating create button | `.fab` | a second plus in the header |
| Category label | `.catchip` | coloured text |
| Price / Free | `.pricetag` | inline coloured text |
| Count on a tab/avatar | `.countbadge` | a red dot with a number |
| Overlapping avatars | `.gac` + `.gac-av` | per-screen avatar stacks |
| Person row with action | `.conn-item` + `.conn-btn` | `.result-row` |
| Empty screen / empty section | `.hub-empty` / `.empty-copy` | lorem, a sad-face illustration |
| One-line hint under a section | `.inline-note` | a paragraph |
| Circle / group tile | `.circle-tile` | a card |
| Any icon | `ICONS.x`, `renderIcon(x, size)`, `ICON_PATHS.x` | pasted SVG, emoji |

---

## Headers

### `brandHeader(title, backAct, centered)`
Default header for pushed pages and tab roots. 22px/700 title (`--fs-page-title`), back chevron
at 24px in a 32px box (expand to 44 with `.tap-expand` in new work).
- `backAct` defaults to `liveTabBack`. `centered=true` centres the title with the back button
  absolutely positioned.
- One `<h2>` per screen. Trailing actions go in the same row, right-aligned, 24px icons.

### `.titlerow`
`display:flex; gap:10px; padding:2px 16px 12px`. Centred `h2` 18px/700. For utility screens
(filter, pickers, forms) where there's a leading *and* trailing action (Cancel · Title · Save).

**Debt:** some headers use `.pagetitle` (23px). Don't copy.

---

## Navigation

### Tab bar — `tabbar(active)`
58px, `--hair` top border, icon-only tabs at 24px, each `.tab` ≥ 44px tall. Active = `--ink`,
inactive = `--ink-2`. Top-level screens only; pushed pages hide it.
- a11y: `role="tablist"` container, each `.tab` `role="tab"` + `aria-selected` + `aria-label` (icons carry no text).

### Segmented control — `viewSwitchHtml('seg', items, active, attrFor, showLabels)`
`items = [[id, label, iconHtml], …]`. Track `--surface`, radius 12, 4px padding; selected
segment `--bg` + `--shadow-1`. 12px/600 labels.
- Used for List / Guide / Map and Listings / Plans. 2–4 options max.
- a11y: each segment `role="button"`, `aria-pressed`, `aria-label`.
- Other styles: `'icons'` (`.viset` / `.vi`) for icon-only toggles.

### `.viewtabs` + `.vt` — not used
Only appears if the "List / Guide / Map style" decision is flipped to its unchosen chips
option (agreed: segmented pill). Upcoming / Past uses selection chips. Don't build with it.

---

## Controls

### Control chip — `controlChip()` (`.chip` in `.chiprow`)
Date, Sort, Filter, Venue type, plan role and the Home search chip. Live spec with every state:
**Library › Components › Controls & states**. Row: `padding:10px 16px; gap:8px`, scrolls
sideways when it doesn't fit (chips never wrap or truncate).
- **Empty:** outline (1px `--hair`, `--bg`), 12px icon + its name ("Date"). The whole chip is one
  button that opens the picker.
- **With a value:** `--ink` fill, `--bg` text, icon + the **value** + a 12px × (`renderIcon('close','xs')`).
  Two buttons in one pill (`.chip-set`): `.chip-main` edits (opens the same picker), `.chip-x`
  clears just that control (`data-act="chipClear"`) and stays on the screen. Never a button inside a button.
- **Value text:** Date = day or range ("Today", "Sat 10 Oct", "10 Oct – 12 Oct"); Sort = the order
  ("Latest first"; the default is never shown); Filter / Venue type = one selection by name, more as
  "{first} +{n}" (`chipValueList()`); Search = the query. The label is "Filter" everywhere (not "Filters").
- a11y: empty chip = one button; with a value = "Date: Today" + "Clear date", each 44×44.
- **Open (Peter):** corner radius (11 today vs 20 for selection chips) and height (28–30px).

### `.fchip` in `.fchips` — selection chip
Wrapping multi-select inside sheets and Upcoming / Past. 1.4px border, radius 20, 12px/600. `.on` inverts.
Near-copies to merge into this once Peter picks a look: `.obprefs-pill` (onboarding preferences:
grey, 400, 33px), `.brand-pill` (Account preferences: 11px corners), `.nfchip` / `.notif-pill`
(notification filters: 11px), `.obchip` (plan type: 36px), `.tp` (time pills: 19px).
- a11y: `role="checkbox"` + `aria-checked` (multi) or `role="radio"` (single).
- Tap target: 44px via the built-in hit area; the chip itself stays ~26px.

### `.cbtn` — full-width button
`margin:20px 16px 0; radius 24; min-height 44 (content centred); 13px/600`. States:
- default (`--surface-2`, `--ink-2`) = secondary / not yet valid
- `.active` (`--ink` fill, `--bg` text) = primary, ready
- `.disabled` (opacity .45, no pointer) — **also** set `aria-disabled="true"`
- Use a real `<button>` in new work. Destructive variant: `--danger` fill + `--on-solid` text.

### `.plusbtn` — add to plan
28px circle, `--ink` fill; `.added` = `--accent` + `--on-solid`; `.outline` variant. Hit area
expanded to 44×44 via `::before`. Opens the + sheet (Save for later / Add to a plan / Share);
shows the green tick once the item is saved, in a plan or shared. Render with `plusButton(item, kind)`.

### + sheet — `saveToPlanSheet()` (`.sheet.ish`)
Opened by any `.plusbtn` (`data-act="openItemSheet"` + `data-save-item`). Rows are `.stprow.ish-row`
with a 20px line icon (`.ish-ic`), title 13/700 and one line of `--ink-2` 11px. Section labels
`.ish-label` (caption, 700, `--ink-2`). Done rows (`.ish-done`) lead with a green tick and end in
text actions (`.ish-link`, accent, 44px tall). Unavailable plans are `.ish-off` (all `--ink-2`,
not tappable, reason in the meta line). Step two has a back arrow (`.ish-back`).

### Select row — `selRow(item, on, act, key)` (`.sel-row` + `.sel-tick`)
Multi-select in a list (Saved › Select, New plan checklist). The marker is the same green tick
as `.plusbtn.added`, an outline circle when off. `role="checkbox"` + `aria-checked`; whole row is
the target. Pair with `.select-bar` (count + `.plan-pill` actions) pinned above the tab bar.

### `.plan-pill` / `.plan-pill.primary`
Pill button, 44px tall, one line. Outline = secondary, `.primary` = filled `--ink`. Used for
pairs of actions (festival plan CTA, select bar, empty-state action).

### `.fab`
48px circle, right 16 / bottom 70, `--shadow-2`, `--z-fab`. One per screen, only for the
screen's primary create action. `role="button"` + `aria-label` naming the action.

### `viewAllAction(attrs, label)`
`<button class="view-all">` — 12px/600 `--accent`, 14px chevron, 44×44 min. Right side of a
section header.

---

## Lists & cards

### Listing row — the one row for anything you can go to
Full live spec (measured anatomy, every variant from the real screens, slot rules, photo and
behaviour rules): **Library › Components › Listing row**. Two class names, one spec:

- `.lrow` — built by `rowHtml(S, d, slot)` on Home feeds (Events, Experiences, Deals, Eat & Drink).
- `.result-row` — every other list: `listingResultRow(d, kind, after)` (Saved, festival programme),
  `festivalTabRow(f, past)` (festivals), `searchEventRow(r, thumb)` (search), `venueRow(v, thumb, opts)`
  (search venues, brand venues).

Anatomy (both measure identical): padding `--space-12` / `--gutter`, gap `--space-12`, centred, 1px
`--hair` divider. Photo `--thumb-list-w` × `--thumb-list-h` (120×90, 4:3), `--radius-md`, cover,
full colour, no filter. Text column: line 1 `--fs-caption`/500/`--lh-snug` `--ink-2` (one line, …);
title `--fs-card-title`/700/`--lh-tight` `--ink` (max 2 lines, …); line 3 as line 1; status slot
(Free is a green chip, `.pricetag` on `--free`; prices are text, `.pricetxt` 11.5/700; state tags: `--fs-caption`/700, padding 2 × 8, `--radius-xs`, 4 above). Brands are a grey `.catchip` under the venue (`brandTagBlock()`), one grey for every brand. Trailing `plusButton()`.

| Type | Line 1 | Title | Line 3 | Status slot |
| --- | --- | --- | --- | --- |
| Event | when | name | venue | green Free chip, or price text "£5" / "from £22" (+ Last few) |
| Brand activation | when | name | venue, then the brand as a grey `.catchip` | entry (Free chip / Walk-in / price) |
| Experience | schedule | name | meeting place | price |
| Deal | validity | offer | venue | Prepay / Booking / Walk-in |
| Eat & Drink | type | name | address | what's on |
| Festival | dates · length | name | location | On now / Starts tomorrow / In your plan, else "N events"; no countdown. Past: Past tab, no + |
| Festival event | when (amber "· Overlap" when it clashes with a plan) | name | stage | price |
| Search event | when | name | venue | `.sale-pill.available / .not-started / .sold-out` |
| Venue | type · distance | name | address | Google rating (+ serve tag) |

Pressed: row background `--surface` for `--dur-fast` (no scale). Anything already over (past festival,
past event) has no +.

### Detail header — `detailHeaderHtml(title, tags, rows)`
Event and festival pages. Title `--fs-page-title`/700/`--lh-tight`; tag row 8 below (category
`categoryTagHtml()` with a 12px icon, then price / Free / status, all 24 high); meta rows via
`detailMetaRow(icon, text, {strong, trailing})`: 16px `--ink-2` icon, 8 gap, `--fs-body`, 12 below
the tags and 8 between rows. Wording comes from the same helpers as the list row
(`festWhenLine`, `festWhereLine`, the item's `when` / `venue` / price), so the row and the page
always say the same thing. Past festival: photo 55%,
title `--ink-2` (text stays 4.5:1). Short month names, 24-hour times, sentence case.

### `.myplan-row`
Plan list row. `padding:14px 16px; gap:12px`, 15px/700 title (`--fs-row-title-lg`), RAG status
tag, avatar stack.

### `.pcard`
Small horizontal card (min-width 132, radius 11, 1.4px border). Only in legacy carousels —
the feed is one listing per row (locked). Don't add new carousels.

### `.circle-tile`
Group/circle tile: `--surface-2` (dark: `--surface`), radius 14, padding 14, 8px gap.

### `.conn-item` + `.conn-btn`
Person row: avatar, `.meta` (name + mutuals), trailing outline pill button (radius 20, 12px/600).
`.reqsent-pill` replaces the button after "Add".

---

## Tags & badges

| Component | Spec | Notes |
| --- | --- | --- |
| `.catchip` | 11.5/600, 14px icon, 6px gap | `.event-type` = solid `--accent` + `--on-solid` |
| `.pricetag` | 11/700, padding 3×8, radius 4 | Free = `--free` fill + `--on-solid` text |
| `.countbadge` | min 20×20, radius 10, `--ink` fill | Numbers only, `tabular-nums` |
| `.gac` / `.gac-av` | 22px avatars, −7px overlap, `--z-raised` | Max 3 + "+N" |
| RAG status | green `--accent` · amber `--warn` · red `--danger` · grey `--ink-2` | Always with a text label |

---

### Festival calendar — `festivalCalendarHtml()` (`.fcal`)

US19, Festivals tab. Apple Calendar's month "details" view: each week is a row (`.fcw`), and each
festival is a named bar (`.fcb`) spanning its days in that week, in its own `--tint-*` colour; bars
that continue across a week break have square ends (`.cl` / `.cr`). Overlapping festivals stack one
below another, up to three per week, then "+N" on the busy days (`.fcb-more`). Past festivals are grey.
Each day column (`.fcd`) is the full-height 44px tap target; tapping a day lists that day's festivals
underneath as `.result-row` cards ("Coming up in <month>" when no day is picked). Today's number is in
an `--ink` circle. List and calendar rows share `festivalTabRow()` and its `.fest-status` pill
(`.on` blue = on today, outlined = coming up, grey = past).

### Colour roles (Anna testing, Oct 2026)

Each colour has one job: **green** (`--accent` / `--free`) = Free, and "yours" (the ✓ tick, "In your
plan" in a guide); **blue** (`--tint-blue`) = on today; **amber** (`--tint-amber`) = time clash;
**red** (`--danger`) = delete / remove only. Categories ("Arts & Culture") use the category tints
(`catTint()`: pink, purple, orange, amber only; never blue, never the accent); prices are plain labels. A listing
that overlaps your plan says "Overlaps your plan" (amber, ⚠) in a guide block and in list rows on line 1, the time: amber with a 14px alert, "Sat 10 Oct 18:30 · Overlap" (`whenLineHtml()`, `.when-olap`), on every list the event appears in. The event page adds a row under the date: "Overlaps {item} in {plan}" (`detailOverlapRow()`).
In a guide, a block's left edge is `--hair` unless it is in your plan (`.mine`, accent) or clashes
(`.clash`, amber), and `guideKeyHtml()` shows the key above the grid.

### Sort line — `sortLine(what, latest)`

Shown only once a sort is applied (the default earliest-first order needs no line): "Sorted by date
and time: latest first", above the results on Home, the Festivals tab, a festival's events and the
festivals list. At the same time the Sort chip turns black (`.applied`); tapping it again (or picking
"Earliest first" in the sort sheet) goes back to the default and the line disappears.

### Hero Save + Share — `heroSaveShare(kind, item)`

Event and festival detail: a bookmark (Save for later, the same icon as the + sheet) and Share
(`upload` icon), 20px in 44px `.hbtn2`. Share opens `shareSheetHtml()`: Copy link / Send to a
connection / More options (the system share sheet where available).

### Guide matrix — `guideMatrixHtml(dayEvents, opts)` (`.fguide-*`)

US55. One horizontal day matrix shared by Festival › Guide and Plan › Guide: a sticky venue column,
hour columns (`GUIDE_COL_W`), and blocks placed by start/end time. `opts.block(ev)` returns the
block's `{cls, html}`. Block content (`.fguide-evt-in`) sticks beside the venue column, so a long
event keeps its title in view while you scroll. It opens on the earliest clash, otherwise the
earliest event. Plan › Guide and Plan › Map take the whole screen: a compact `.titlerow`, the
List / Guide / Map `.seg`, and the type tabs, as on Home.

### Time clash — `.fguide-evt.clash` + `clashSheetHtml()`

US53. A listing clashes with a plan when it's on the same day and its time overlaps something in
that plan (`planClash()`; no end time means two hours, and untimed items never clash). In a guide,
the block turns amber (`--tint-amber`, not red: red read as "something went wrong" in testing) with a
"⚠ Overlaps your plan" label (`.fguide-clash`), and its + opens the clash step of the + sheet directly. Adding through + › Add to a plan › <plan> also stops at the clash step.
The clash step has an amber banner (`.clash-banner`, `--tint-amber`), "In your plan" and "Adding now"
cards side by side, then **Add anyway** (the normal `.cbtn.active`) and **Cancel**.

## Sheets & overlays

### Bottom sheet — `.scrim` + `.sheet`
```
.scrim   absolute inset 0, rgba(15,15,20,.5), --z-scrim      (tap = dismiss)
.sheet   bottom 0, --bg, radius 24 24 0 0, padding 16, max-height 86%, --z-sheet
  .grab        36×4 handle, --surface-2, 13px below
  h3           16/700 (--fs-sheet-title)
  .ssub        11px --ink-2 subtitle
  .fgroup      14px apart; .fglabel 11.5/700; .fchips
  .stprow      option rows: 38px .stpicon well (radius 10) + .stpbody (13/700 + 11 meta)
  .sheetfoot   Clear (underlined 12/600) + Apply (flex:1 pill, --ink fill)
```
**Rules:** render at `.phone` level inside `buildPhone()` (never in a screen builder — it gets
clipped), add its flag to `sheetOpen`, dismiss on scrim tap **and** Escape, focus moves into the
sheet on open and back to the trigger on close, `role="dialog" aria-modal="true"
aria-labelledby` the `h3`.

### Full-screen search — `homeSearchHtml(S)` (`.hsearch`)
```
.hsearch-btn    20px search icon left of the city pill, 44 target (searchPos = header)
.hsearch        absolute inset 0 at .phone level, --z-modal, role=dialog aria-modal
  .hsearch-scrim  --scrim + backdrop blur(--blur-scrim) over Home; tap = close
  .hsearch-panel  --bg, drops from the top, radius 0 0 24 24, --shadow-4, --dur-sheet
    .hs-bar       .searchfield.hs-field (input focused, × when typed) + Cancel 13/600
    .hs-body      homeSearchBodyHtml(q):
                  empty  → Recent (.hs-row: 40px well + 16px clock, 44 tall) + Popular (.fchip)
                  typing → events / venues (.hs-row: 40px thumb, 13.5/600 + 11 meta),
                           matching categories (.fchip), "See all results for …"
```
**Rules:** typing only swaps `.hs-body`, so the field keeps focus. Enter / See all → the results
screen; Cancel, Escape or a tap on the dimmed Home → close, Home as it was. What the icon opens is
decision #24 (`searchTap`: this overlay, or the Search tab).

### Toast — `flashToast(msg, action)`
Bottom 70, left/right 16, radius 12, `--z-toast`, auto-dismiss. One short sentence, past tense:
"Added to Friday night". Rendered with `role="status" aria-live="polite"` so screen readers announce it. Never the
only feedback for something the user must act on.
Optional `action` `{ label, act, attrs }` adds one underlined text button on the right
(`.has-act`), e.g. "Added to Birthday weekend · View plan".

### Empty states
- Whole screen: `.hub-empty` — 48px top padding, 14px `--ink-2`, centred, one line of what
  this is + one action.
- Inside a section: `.empty-copy` — 12.5px/1.55 `--ink-2`, inline link in `--ink` underlined.
- Hint line: `.inline-note` — 11px `--ink-2`.

---

## Forms

`.field` (16px gutter, 14px top) > `.fl` label (12.5/700, optional hint `span` 11px `--ink-2`)
+ `.fi` value box (1.5px `--hair`, radius 11, padding 12×13, 12.5px).
- A real `<input>`/`<label for>` pair in new work; `.fi` is the visual shell.
- Errors: `--danger` border + text message below (never colour alone), `aria-invalid="true"`,
  `aria-describedby` the message.
- Placeholders are examples ("e.g. Belfast"), never labels.
- `.fi` has `min-height: var(--tap-min)`. **Debt:** radius 11 is off-scale.

---

## Hit areas

Visual size and tap size are separate. These components keep their compact look and get an
invisible, centred hit area of **at least 44×44** (`width/height: max(100%, 44px)` on a
`::before`, or `::after` where `::before` already draws something):

`.back` · `.chip` · `.fchip` · `.obchip` · `.obprefs-pill` · `.vt` · `.tp` · `.tn` ·
`.seg > span` · `.citypill` · `.search-city` · `.nfchip` · `.notif-pill` ·
`.plusbtn` · `.hbtn` · `.hbtn2` · `.conn-btn` · `.addimg` · `.avc` · `.toggleknob` ·
`.obsw-dot` · `.swk-save` · `.itemdots` · `.tsave` · `.clear` · `.sheetfoot .apply` ·
`.wx-locchip` · small text links (`.empty-copy a`, `p > a`)

Full-width controls grow instead: `.cbtn`, `.field .fi`, `.brand-input`, `.brand-save`,
`.ip-next`, the search field and form `select`s all have `min-height: var(--tap-min)`.

**New small control?** Add class `tap-expand` — don't add another selector to the list, and
don't pad the glyph. The control must not have `overflow:hidden` (it would clip the hit area;
put the clip on the image inside instead, as `.avc` does). `node tools/audit-runtime.js`
checks every screen and fails on any new target under 44×44.
