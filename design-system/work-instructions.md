# Work instructions

How to make the common changes to the GetSociable prototype — written so it works whether
you do it by hand or ask an AI coding assistant. Each job has:

- **Ask an AI** — a request you can paste into Claude Code, Cursor, Codex, Copilot or Gemini
  as it is (fill in the brackets). The assistant reads [`AGENTS.md`](../AGENTS.md) first and
  follows the design system.
- **By hand** — the steps in the code, for a developer.
- **Done when** — what to check before calling it finished.

Before any job: work on a **branch** (not `main`), and open the prototype so you can see the
screen you're changing.

---

## 1. Convert an existing live-app screen to the new design

Use this for any screen of the live app (`m.getsociable.app`) that the prototype doesn't have
yet, or still shows in the old style.

**Ask an AI**

> Convert the live app's **[screen name, e.g. "Venue opening hours"]** into the prototype.
> A screenshot is attached / is at `live_app_screenshots/[file].png`.
> It belongs in the **[section, e.g. Brands]** section, after **[nearest screen]**.
> Copy the structure of the nearest existing screen, use only existing components from
> `design-system/components.md`, and add states for **[empty / populated / error]**.
> Register it in SCREEN_GROUPS and buildPhone, add it to the live-screenshot map, run every
> check in AGENTS.md, and show me screenshots in light and dark.

**By hand**

1. **Find the nearest screen** in the same section (the top bar groups them) and copy its
   builder function (`scrXxxApp()`). Don't start from a blank page.
2. **Rebuild the content with existing components.** Look each one up in
   **Library → Components** (or `components.md`): headers (`brandHeader()` / `.titlerow`),
   rows (listing row, `sheetRow()`), controls (`controlChip()`, `.fchip`, `.cbtn`), fields
   (`.field`). Use `var(--token)` for every value. If something has no component, see job 3.
3. **Register it**: add `['myscreenapp', 'My screen']` to the right section in
   `SCREEN_GROUPS`, and route it in `buildPhone()`:
   `else if (UI.screen === 'myscreenapp') body = scrMyScreenApp();`
4. **States**: empty / populated / error / sheet open go in `SCREEN_STATES` (see
   [patterns.md](patterns.md#adding-a-screen--step-by-step)).
5. **Name it for Peter's sheet**: add its UI name and URL to `SCREEN_META_DEFAULTS`; if it is
   not in Peter's "All Screens Metadata" sheet yet, add it to `SCREEN_NOT_IN_SHEET` so the
   Screens page tags it **Check placement**.
6. **Live comparison**: put the live screenshot in `live_app_screenshots/` and map it in
   `LIVE_APP_SCREEN_MAP`. The Screens page lightbox then shows **Compare with live** side by
   side. Only map a true one-to-one equivalent.

**Converting a pop-up (modal)**: in the new design a pop-up that collects a choice becomes a
**bottom sheet**; a pop-up that asks to confirm something destructive stays a small centred
dialog. Sheets are rendered in `buildPhone()` at phone level (never inside the screen
function), their open flag goes in the `sheetOpen` list, and the sheet is
`role="dialog" aria-modal="true" aria-label="…"` with Escape and a tap on the dimmed area
closing it. Copy an existing sheet (`brandSortSheet()`, `festDateSheetHtml()`).

**Done when** the checks pass, the screen appears in the top bar, on the Screens page and in
the `/` jump list, and you've looked at it in light and dark with long names.

---

## 2. Change an existing component

Example: "make all selection chips 28 tall", "change the primary button corners".

**Ask an AI**

> Change the **[component, e.g. selection chip (.fchip)]** so that **[the change]**.
> Change it once, in its CSS rule or builder — no per-screen overrides. Use tokens only.
> Update its card in the Library (componentSpecs) and its section in
> design-system/components.md, check the Library card still says "Matches the screens",
> run every check in AGENTS.md and show me the screens that use it, light and dark.

**By hand**

1. **Find where it's used.** Its Library card (**Library → Components**) lists the screens,
   and the green line under the notes shows what the screens actually render.
2. **Change the shared rule**, never one screen. If a screen needs to look different, that is
   a new variant — discuss it first.
3. **Remove inline overrides** you find on the way (`style="padding:…"` on a component
   instance) — they are how screens drift apart.
4. **Update the docs**: the component's `notes` in `componentSpecs()` and its entry in
   `components.md`. Numbers in the notes must match what renders.
5. If you changed a **token** (in `.phone{}`), run `node tools/build-tokens.js` and say so.

**Done when** `node tests/library.js` passes (it fails if a Library demo no longer matches the
screens), the other checks pass, and the card shows no unexpected "Varies on the screens".

---

## 3. Add a new component

Only when nothing in the Library does the job. A near-copy of an existing component (a chip
that is "almost" `.fchip`) is the most common way the app drifts — use the existing one.

**Ask an AI**

> We need a new component: **[what it is and where it's used]**. First check
> design-system/components.md and the Library for something that already does this and tell
> me if one exists. If not: build it from tokens, 44×44 tap target, accessible name and state,
> light and dark; use it on **[screen]**; add it to the Library (componentSpecs, every state)
> and to components.md; run every check in AGENTS.md; show me light and dark.

**By hand**

1. **CSS** in the phone styles, using tokens only. Icons at the agreed sizes
   (12/14/16/20/24, stroke 1.8). If it is visually small, give it `.tap-expand` for a 44×44
   target.
2. **A builder function** if it has logic or is used more than once
   (`function myThing(o){ … return html; }`), like `controlChip()`.
3. **Use it** on the screen(s) that need it.
4. **Document it in the Library**: add an entry to `componentSpecs()` —
   `{ id, title, cat, cls, used, notes, a11y, states:[[label, html], …] }`. Build the demo
   states with the real builder. If it spans the screen width, add its id to `COMP_FRAME`
   (`'screen'`, or `'sheet'` if it lives in a sheet). Label an option that is not built into
   the screens `Alternative: …`.
5. **Document it in `components.md`** with the anatomy and rules.
6. **New icon?** Add it to `ICON_PATHS` + `ICON_META`, then look at it at 14px and 20px.

**Done when** the checks pass and its Library card says **Matches the screens**.

---

## 4. Remove a component

**Ask an AI**

> Remove **[component]** and replace every use with **[the component that replaces it]**.
> List every screen that used it first. Then delete its CSS, builder, Library entry
> (componentSpecs) and components.md section, run every check in AGENTS.md and show me the
> affected screens before and after.

**By hand**

1. **Find every use**: search `index.html` for its class and builder name. Its Library card
   lists the screens.
2. **Replace** each use with the component that takes over.
3. **Delete** its CSS rules, builder function, `componentSpecs()` entry and `components.md`
   section. If it was one of the near-copies flagged for Peter, update `STYLE_DECISIONS` and
   `decisions.md`.
4. `node tests/library.js` fails with "is not used on any screen" if you remove the last use
   but leave the Library entry — that's the reminder to delete it.

**Done when** the checks pass and a search for the class finds nothing.

---

## 5. Add or settle a design decision

**Ask an AI**

> Add a design decision: **[question]**, options **[A / B / C]**, recommended **[A]**,
> owner **[Peter]**. Build every option so it can be flipped in the left panel, on
> **[screen]**.

or

> Mark the decision **[name]** as **Agreed** with **[option]**, note: **[why, date]**.
> Update design-system/decisions.md.

**By hand**: add it to `DECISIONS` and `LOG` (status `open`), read it in the builder as
`S.key`, add its screen to `DECISION_CONTEXT`. To settle one, set `LOG[id].status` to
`agreed` or `parked` with a note and, if the default option changes, the default in `A`.
Statuses set in the browser are saved only in that browser — bake them into `LOG` (and bump
`LOG_BASELINE`) so everyone sees them.

---

## The checks (every job)

```bash
node design-eval.js                    # tokens, icons, type, accessibility markup
node tools/build-tokens.js --check     # tokens.json in sync
node tools/audit-runtime.js            # every screen, light + dark: tap size, clipping,
                                       # contrast, names, state, dialogs, headings, images
node tests/library.js                  # Library + handoff; component demos match the screens
node tests/festival-navigation.js && node tests/map-policy.js
```

`npm run check` and `npm run audit` run the same. The audits need Playwright once:
`npm i -D playwright && npx playwright install chromium`.

Then look at what you built in **light and dark**, with long names, empty and full. The
numbers pass long before the design is right.
