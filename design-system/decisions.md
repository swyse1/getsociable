# Decisions

Product decisions that shape the design. **Locked** ones are not reopened without Peter's
agreement. **Open** ones must be flagged in your summary when your work touches them —
never silently resolved.

Product context, team and sprint live in `.cursor/rules/getsociable-product.mdc`.

## Locked

**Navigation & layout**
- Listings / Plans toggle (not time-based wording like Now / Later)
- Underline nav style
- No plan strip on the listings screen — the plus action on cards replaces it
- Search as a borderless icon chip in the filter row
- Chip row for date / sort / filter / search; date is a chip, not its own row
- Filters reset when switching listing type

**Feed & cards**
- Chronological default feed order
- Wide card thumbnails, full colour (changed from monochrome, Oct 2026), no category colour tints
- One listing per row — carousels removed
- One listing row everywhere (Oct 2026): every list uses the same row, 120×90 (4:3) photo, same
  type and slots; only slot content changes by listing type. Spec: Library › Components › Listing row
- Free is a green chip; prices are text ("£8", "Walk-in"). A brand activation shows
  the brand as a grey chip under the venue, one grey for every brand, never brand colours (Oct 2026)

**Colour & brand**
- Single accent for plus icons, active states, free tags
- RAG status tags retained (green / amber / red / grey), always with a text label

**Plans**
- Plans and Listings mirror each other — same components, positions, spacing
- **Save vs Plans (Oct 2026, replaces "plus adds directly to a plan, no menu"):** one + on every
  listing opens a sheet: Save for later (private, Hub › Saved) / Add to a plan › / Share. Add to a
  plan lists plans that cover the item's day first; others are greyed with the reason. The +
  becomes a green tick once anything is done; tapping the tick shows "What you've done with this"
  (Open / Remove) plus More. Hub › Saved Events has Select (pick several → Add to plan / New plan
  filled in from the picks) and a "Make them into a plan?" nudge. Starting a plan from Plans offers
  saved events on its dates. Explored-but-not-chosen screens: Screens page › Screen graveyard.
- Segmented pill for List / Guide / Map

## Open — where the docs and the code disagree

These were found while building this design system. The **code** (and therefore
`tokens.json`) reflects what's built today; the product memory reflects earlier intent.
Resolve each with the owner, then update tokens + this file.

| # | Question | Product memory says | Built today | Owner |
| --- | --- | --- | --- | --- |
| 1 | Final accent / teal hex | Pending Sarah; placeholder `#00c4b4` | `--accent` `#1e7b64` light / `#77c8b1` dark (both pass AA; `#00c4b4` on white is 2.2:1 and would fail as text) | Sarah |
| 2 | Dark background | `#121212`, text `#ffffff` | `#121215`, text `#f4f4f4` | Sarah / Peter |
| 3 | Dark-only vs light + dark | "Not discussed" | Both themes built and audited | Peter |
| 4 | Icon library | Phosphor, Regular / Fill for active | Custom outline set on Phosphor-like geometry; active = colour, not Fill | Martin / Sarah |
| 5 | Base spacing unit | 4px | 2px grid, multiples of 4 preferred | Martin |
| 6 | Plans tabs | Draft / Upcoming / Past with sub-row | Build-mode decision `plansTabs` (2 or 3 tabs, recommended 3); `LOG` still marks it open and "Draft" as a placeholder word | Peter |
| 7 | CTA button style | Not discussed | `.cbtn` pill, `--ink` fill when active | Peter / Sarah |
| 8 | View toggle position | Pending team poll | `.seg` under header | Peter + team |
| 9 | Clash colour (US53) | Mock shows red block + red "Add anyway" | Amber block + "⚠ Time clash" label, normal primary "Add anyway". Anna (testing): red reads as "something went wrong with the booking". Red is kept for delete / remove. | Peter / Sarah |
| 11 | Accent vs Free green | — | `--accent` and `--free` are the same green, so Free and "yours" still share a hue; labels separate them. Worth a distinct brand accent (Anna: "needs colour"; ties to #1). | Sarah |
| 10 | Plan Guide shape (US55) | Story text: vertical timeline with gap indicators | Same horizontal matrix as Festival › Guide (asked for in testing) | Peter |
| 12 | "Exclusive" deals label | FAQ: some deals are only on GetSociable | Nothing on the row marks them. Proposal: neutral `.catchip` "Exclusive" in the brand-tag position, no new colour | Peter |
| 13 | Brand filter on Deals / Experiences | — | Not built (commercial decision) | Peter |
| 14 | Brand stock freshness window | — | "Bottle / Draught" tag on brand venues hidden until the window is agreed | Peter / legal |
| 15 | Alcohol marketing compliance | — | Brand pages and brand-tagged rows need legal review before production | Client legal |
| 16 | Chip corners | Tokens say chips are `--radius-3xl` (20) | Control chips (Date / Sort / Filter) 11px; selection chips 20px. Options: all 20, all 12, or two on purpose | Peter |
| 17 | Chip height | — | Control 28–30px, selection 25–28, onboarding 33–36, time pills 32 | Peter |
| 18 | Preference chip look | — | Onboarding grey / 400 vs Account white / 600 vs filter sheets white / 600 | Peter |
| 19 | Selected colour | — | `--ink` everywhere except the Saved › Select tick (green) | Peter |
| 20 | Switch on colour | — | `--ink`; native switches are green, our green means Free / yours | Peter |
| 21 | Sort said twice | — | Sort chip now shows "Latest first ×"; the "Sorted by …" line repeats it | Peter |
| 22 | One search field | — | Rounded grey field (Home, Search) vs outlined field + button (festival screens) | Peter |
| 23 | Field corners | — | Forms 11–12px, date-of-birth selects 10px, festival search 8px | Peter |
| 24 | What tapping search on Home opens | Peter (style-guide call): "the full search bar and … shading over the rest of the screen" | Search icon now sits left of the city pill (agreed). Tapping it opens **full-screen search** over a dimmed, blurred Home (Recent + Popular, live results as you type). Alternative: go to the Search tab. Toggle: decision *What tapping search opens* | Peter |

When one is decided: change the token in `.phone{}`/`.phone.dark{}`, run
`node tools/build-tokens.js`, update the foundation doc, move the row to **Locked**.
