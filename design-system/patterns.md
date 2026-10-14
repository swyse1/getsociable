# Patterns

How components combine into screens. When building something new, find the closest pattern
here and the closest existing screen in the same family, and copy their structure.

## Screen families

Sections and their order are Peter's screen-metadata sheet (Oct 2026). A new screen goes in
one of these; a state can sit in another section with `section:'<id>'` in `SCREEN_STATES`.
UI names and URLs live in `SCREEN_META_DEFAULTS`.

| # | Section (`SCREEN_GROUPS` id) | Examples | Header | Tab bar |
| --- | --- | --- | --- | --- |
| 1 | Onboarding (`onboarding`) | Intro carousel, login, optionals, preferences | none / wordmark | no |
| 2 | Listings \| Events (`events`) | Home, event list, event detail, filters, dates | wordmark on Home, `brandHeader` | yes on roots |
| 3 | Listings \| Festivals (`festivals`) | All festivals, festival detail, festival events | hero / `brandHeader` | yes |
| 4 | Plans (`plans`) | My plans, plan detail, create, import, plan connections | `brandHeader` + `.seg` | yes on roots |
| 5 | Connections (`connections`) | My connections, pending | `brandHeader` | yes |
| 6 | Groups (`groups`) | Group results, groups, create, detail | `brandHeader` | yes |
| 7 | Hub (`hub`) | Hub, profile, share, preferences, saved | `brandHeader` | yes |
| 8 | Search (`search`) | Search, results, location | `brandHeader` | yes |
| 9 | Notifications (`notifications`) | Notifications, plan import | `brandHeader` | yes |
| 10 | Account (`account`) | Account, communication prefs, legal, FAQ | `brandHeader` | yes on roots |
| 11 | Brands (`brands`) | Brand list, profile, brand venues, venue | hero / `brandHeader` | yes |

**Listings and Plans mirror each other** (locked): same header height, control row
position, row component and spacing.

## Anatomy of a list screen

```
brandHeader('Saved events')                          22/700, back 24px
.seg   Upcoming | Past                               optional view switch, 16px gutter
.chiprow  [Date ▾] [Sort ▾] [Filters] [⌕]            10px 16px, chips 8px apart
.scroll
   section head: 13.5/700 title ······ View all ›    viewAllAction()
   .lrow / .result-row × n                           12px 16px, 1px --hair divider
   (20–24px)  next section
tabbar(active)                                       roots only
```

## Anatomy of a detail screen

```
hero image (full-bleed, radius 0) + overlay buttons (.hbtn2 → 44px hit area)
title block   22/700 title, 12.5 meta in --ink-2, .catchip / .pricetag row
primary action row  (.cbtn.active full width, or save + add pair)
sections      description · when & where · lineup · related  (20–24px apart)
```
Sticky primary action at the bottom only if the screen scrolls more than ~1.5 screens.

## Sheets vs pushed screens

| Use a **bottom sheet** when… | Use a **pushed screen** when… |
| --- | --- |
| Choosing from options (sort, date, save to plan) | Content the user reads or navigates within |
| The task takes < ~3 taps and returns to context | It has its own sub-navigation or scrolls long |
| Confirming a destructive action | It needs a shareable URL |

Sheets: one at a time, never a sheet on a sheet. Title says what's being chosen ("Sort
events"), footer has Clear + Apply only when changes are batched; single choices apply on tap.

## Empty, loading and edge states

Every list screen designs **four** states: empty (first-run), empty (filtered to nothing),
normal, and lots of data (long names, 3-line titles, 99+ counts).

- Empty first-run: say what will appear here + one action. "Events you save show up here.
  **Browse events**"
- Empty filtered: say why + how to undo. "No events match these filters. **Clear filters**"
- No spinners in the prototype; if a loading state matters, use a skeleton of the row shape
  in `--surface`.

Register states in `SCREEN_STATES` so they show up in the gallery (see below).

## Feedback

- Adding / saving: the control changes state in place (`.plusbtn.added`) **and** a toast
  confirms where it went.
- Destructive: confirmation sheet with the consequence in the title ("Leave Friday
  night?"), `--danger` button, Cancel as secondary.
- Errors: inline, next to the cause, in words; never a toast for a field error.

## Adding a screen — step by step

1. **Builder.** `function scrSavedEventsApp(){ … return html; }` — read state from `A` (and
   `UI` for navigation). Start by copying the nearest existing builder in the same family.
2. **Register.** Add `['savedeventsapp', 'Saved events']` to the right group in
   `SCREEN_GROUPS`.
3. **Route.** In `buildPhone()`:
   `else if (UI.screen === 'savedeventsapp') body = scrSavedEventsApp();`
4. **States.** In `SCREEN_STATES`:
   ```js
   savedeventsapp: [
     { sid:'savedeventsapp', note:'[empty]',     params:{ savedEventsSeed:'none' } },
     { sid:'savedeventsapp', note:'[populated]', params:{} }
   ]
   ```
   `params` only set `A.*` keys. A state that opens a sheet, step or prompt sets the
   flag through `ui` instead (`{ note:'[sort sheet]', ui:{ brandSortOpen:true } }`) — the
   gallery applies it for the render and restores it after.

   **State vs version.** A *state* is the same layout with different data or an overlay
   open (My plans empty vs with plans). A *version* is a different layout for the same job
   (Location as full screen / bottom sheet / dropdown). Versions go in `SCREEN_VARIANTS`,
   ordered by preference — the first is the recommended one and shows as "1 of y" on the
   Screens page.
5. **Sheets.** Render in `buildPhone()` next to the other sheets; add the flag to
   `sheetOpen`; wire Escape.
6. **Events.** `data-act="savedToggle"` + a branch in the delegated click handler;
   navigation via `data-screen="detail"`.
7. **Check.** `node design-eval.js`, `node tools/audit-runtime.js --screen=savedeventsapp`,
   look at it in light and dark. Then the [checklist](new-screen-checklist.md).

## Adding a design decision (Build mode)

1. Add to `DECISIONS` + matching `LOG[id]`.
2. Read it in the builder as `S.key`.
3. Add `DECISION_CONTEXT[id]` so the decision card and the Summary page open the right screen.
4. Flip every option and confirm the phone changes.
5. Mark status in `LOG` only once the room has decided.
