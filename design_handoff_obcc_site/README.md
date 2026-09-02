# Handoff: Ottawa Blues Charity Classic — Site Redesign

## Overview
A single-page redesign of the Ottawa Blues Charity Classic event page (currently a WordPress
page at https://ncbluesfoundation.org/ottawa-blues-charity-classic/). The Classic is a two-day
indoor 7v7 co-ed soccer tournament for emergency-service professionals in Ottawa, run by the
National Capital Blues Foundation (NCBF). Proceeds fund NCBF youth programs.

Goals of the redesign:
1. Contemporary, professional, sport-editorial presentation that drives registrations and sponsorships.
2. Content that is trivially easy for a non-technical volunteer to keep current year over year
   (dates, fees, registration open/closed state, documents, sponsor logos).
3. Clear conversion paths: register a team, sponsor, contact organizers.

## About the Design Files
The file in this bundle is a **design reference created in HTML** — a prototype showing intended
look and behaviour, not production code to copy directly. The task is to **recreate this design
in the target codebase's existing environment** (React/Next.js, Vue, Astro, a WordPress block
theme, etc.) using its established patterns, component library, and styling conventions.
If no environment exists yet, choose the most appropriate framework for the project — for this
project a statically-generated React/Next.js or Astro site backed by a small CMS is the natural
fit, since the page is content-heavy and updated a few times a year.

Note the prototype is authored as a single streaming component with **inline styles only** and
data arrays in a logic class. That is an artifact of the prototyping environment. In production,
lift the data arrays into CMS entries or a JSON/MDX content file, and express the styling in
whatever the codebase uses (Tailwind, CSS modules, styled-components).

## Fidelity
**High fidelity.** Colors, typography, spacing, radii, and shadows below are final and should be
matched closely. Photography is placeholder-grade only: the prototype hot-links images from the
existing WordPress media library, which must be replaced with properly optimized, self-hosted assets.

## Content Model (build this first)
Everything below is currently hard-coded in the prototype's logic class and should become editable content.

| Entity | Fields |
|---|---|
| `event` | edition ("14th"), startDate, endDate, dailyStart, dailyEnd, venueName, venueAddress, raisedToDate, format, divisions, eligibility |
| `registration` | `isOpen` (boolean — drives headline, tier badges, and all CTA buttons), closeDate |
| `tier[]` | window, name, price, status, features[], ctaLabel, ctaHref, emphasis (muted / primary / dark) |
| `detailCard[]` | kicker, title, body, meta |
| `document[]` | name, kind ("PDF · 2026"), href |
| `program[]` | num, name, body, tag |
| `sponsor[]` | name, logo (image), optional url, optional tier |
| `faq[]` | question, answer |
| `stat[]` | value, label, note |

`registration.isOpen` is the single most important flag: one boolean flips the registration
headline, subhead, every tier status pill, and every button label/style between open and closed
states. Keep that behaviour — it is the core "easy to maintain" argument for the redesign.

## Screens / Views
One page, ten stacked bands, in this order. Page background `#F6F4F1`; content max-width **1280px**
with **32px** horizontal gutters, centered. Section vertical padding **118px** top and bottom
(hero and CTA differ, noted below).

### 1. Sticky header
- Purpose: persistent nav + always-available Register CTA.
- Layout: `position: sticky; top: 0; z-index: 60`. Height **74px**. Background `rgba(10,20,36,0.94)`
  with `backdrop-filter: blur(14px)`; bottom border `1px solid rgba(255,255,255,0.09)`.
- Left: logo lockup — 38×38px rounded 9px tile, `linear-gradient(150deg, #2E6BFF, #0B3AAE)`,
  centered "NC" in Archivo 900 / 15px / letter-spacing -0.04em, white. Beside it, two stacked lines:
  "Ottawa Blues Charity Classic" (Archivo 800, 14.5px, white) and "National Capital Blues Foundation"
  (JetBrains Mono, 9.5px, letter-spacing 0.16em, uppercase, `rgba(255,255,255,0.48)`).
  Replace the "NC" tile with the real NCBF mark in production.
- Right: nav links — Tournament, Details, Register, Impact, Sponsors, FAQ. Public Sans 500 / 13.5px,
  `rgba(255,255,255,0.72)`, hover `#fff`, **30px** gap. Then the primary CTA button: background
  `#2E6BFF`, hover `#1B52DC`, white Archivo 700 / 13px, padding 11px 20px, radius 8px, label
  "Register a Team".
- All nav links are in-page anchors to the section ids (`#about`, `#details`, `#register`,
  `#impact`, `#sponsors`, `#faq`); `html { scroll-behavior: smooth }`.

### 2. Hero (`#top`)
- Purpose: establish the event, the date, and the two primary actions.
- Layout: `min-height: 640px`, flex, content bottom-aligned. Padding 132px top / 56px bottom.
- Background stack, back to front:
  1. Full-bleed photo, `object-fit: cover`, `opacity: 0.42`, `filter: saturate(0.85) contrast(1.05)`.
  2. `linear-gradient(180deg, rgba(10,20,36,0.86) 0%, rgba(10,20,36,0.55) 42%, rgba(10,20,36,0.97) 100%)`.
  3. `radial-gradient(1100px 520px at 12% 92%, rgba(46,107,255,0.30), transparent 70%)`.
- Status pill: 1px `rgba(255,255,255,0.22)` border, radius 999px, padding 7px 15px 7px 11px.
  Contains a 7px `#4ADE80` dot with `box-shadow: 0 0 0 4px rgba(74,222,128,0.18)`, then
  "14th Annual · October 22–23, 2026" in JetBrains Mono 10.5px / 0.16em / uppercase.
- H1: Archivo **900**, **92px**, line-height 0.92, letter-spacing -0.035em, white, max-width 15ch.
  Copy: "Frontline soccer." (with "soccer." in `#6E9BFF`) / line break / "Real impact."
- Subhead: Public Sans 19px / 1.6, `rgba(255,255,255,0.76)`, max-width 60ch.
- Buttons (14px gap): primary "Register a Team →" — `#2E6BFF`, radius 10px, padding 16px 28px,
  Archivo 700 / 15px, `box-shadow: 0 14px 40px -12px rgba(46,107,255,0.7)`. Secondary
  "Become a Sponsor" — 1px `rgba(255,255,255,0.26)` border, transparent, hover
  `rgba(255,255,255,0.08)`.
- Countdown row above a `1px rgba(255,255,255,0.14)` top border, 30px padding-top: four tiles
  (Days / Hours / Minutes / Seconds), min-width 118px, background `rgba(255,255,255,0.055)`,
  1px `rgba(255,255,255,0.11)` border, radius 12px, padding 16px 20px. Value in Archivo 800 /
  40px / letter-spacing -0.03em; label in JetBrains Mono 10px / 0.18em / uppercase /
  `rgba(255,255,255,0.5)`. Beside the tiles, venue line: mono label "Ben Franklin Superdome"
  + "191 Knoxdale Rd, Ottawa · 8:00 AM – 5:00 PM daily".
- Entry animation: `obccFade` — opacity 0→1, translateY 14px→0, 0.7s ease, once on load.

### 3. Stat band
- Dark `#0A1424`, top border `rgba(255,255,255,0.08)`. Four equal columns, each padded
  44px top / 26px sides / 48px bottom, separated by `border-left: 1px solid rgba(255,255,255,0.08)`.
- Per column: value in Archivo 900 / 52px / letter-spacing -0.04em / `#6E9BFF`; label Archivo 700 /
  14px / white; note Public Sans 13.5px / `rgba(255,255,255,0.48)`.
- Content: "14th — Annual edition — Running since 2012" · "$90K+ — Raised to date — Every dollar to
  youth programs" · "2 — Days of play — Round robin into playoffs" · "7v7 — Co-ed indoor — Rec &
  competitive divisions".

### 4. About (`#about`)
- Background `#F6F4F1`, **`border-top: 3px solid #0A1424`** (the heavy rule that separates hero
  block from body content). Background pattern:
  `repeating-linear-gradient(90deg, rgba(10,20,36,0.045) 0 1px, transparent 1px 104px)` (vertical
  pitch-line pinstripes) layered under
  `radial-gradient(900px 500px at 88% 4%, rgba(46,107,255,0.07), transparent 70%)`.
- **Section header pattern (identical in every section — see "Section header" below).**
  01 / The Tournament — "Fourteen years of first responders on the pitch."
- Below the header: two-column grid `1.05fr 1fr`, 88px gap, center-aligned.
  - Left: two paragraphs, Public Sans 17.5px / 1.68 / `#3D4757`, max-width 56ch,
    `text-wrap: pretty`; "$90,000" bolded in `#0A1424`. Then a spec row above a
    `1px rgba(10,20,36,0.12)` top border, 28px padding-top, 40px gaps: Format / Divisions /
    Eligibility — mono 10px uppercase `#7C8798` label over Archivo 700 / 16px value.
  - Right: photo card, `aspect-ratio: 4/5`, radius 18px, `box-shadow: 0 40px 80px -40px rgba(10,20,36,0.5)`,
    with an overlapping stat chip at `bottom: -26px; left: -26px` — `#0A1424`, radius 14px,
    padding 22px 26px, "$90K+" in Archivo 900 / 34px over mono caption "Raised for youth programs".

### 5. Details (`#details`)
- Background `#fff`, top border `1px rgba(10,20,36,0.14)`, dot-grid pattern:
  `radial-gradient(rgba(10,20,36,0.09) 1.1px, transparent 1.1px)` at `background-size: 28px 28px`.
- Header: 02 / Logistics — "Everything you need to know", followed by a "Read the full FAQ →"
  link (Archivo 600 / 15px / `#2E6BFF`) with 44px bottom margin.
- Row A: three equal cards (`repeat(3, minmax(0, 1fr))`, 20px gap), background `#F6F4F1`,
  1px `rgba(10,20,36,0.07)` border, radius 16px, padding 32px. Each: mono kicker (10px / 0.18em /
  uppercase / `#7C8798`), Archivo 800 / 25px title, 15.5px body `#4C5665`, 14px meta `#7C8798`.
  Cards: Dates & times / Venue / Format & eligibility.
- Row B: `1.4fr 1fr` grid, 20px gap, min-height 240px.
  - Documents card: `#0A1424`, radius 16px, padding 38px 40px, white. Mono eyebrow "Tournament
    documents", Archivo 800 / 26px "Rules & forms", then a list of document rows — each a flex
    row with `border-top: 1px solid rgba(255,255,255,0.12)`, 15px vertical padding, name in
    Archivo 600 / 15.5px, kind in mono 10.5px `rgba(255,255,255,0.5)`, hover color `#6E9BFF`.
  - Host hotel card: radius 16px, photo at `opacity: 0.55` under
    `linear-gradient(180deg, rgba(10,20,36,0.25), rgba(10,20,36,0.92))`, content bottom-aligned,
    padding 32px: mono "Host hotel", Archivo 800 / 22px "Hard Rock Hotel & Casino", outline
    button "Group rate reservations →".

### 6. Registration (`#register`)
- Background `#F6F4F1`, top border `1px rgba(10,20,36,0.14)`, diagonal hatch:
  `repeating-linear-gradient(-45deg, rgba(10,20,36,0.035) 0 1.5px, transparent 1.5px 14px)`.
- Header: 03 / Registration — title is **state-driven**: "Registration is open" when
  `registration.isOpen`, else "Registration is closed for 2026". Subhead paragraph likewise
  (18px / 1.65 / `#4C5665` / max-width 62ch), 48px bottom margin.
- Three pricing cards (`repeat(3, minmax(0, 1fr))`, 20px gap, `align-items: start`): white,
  1px `rgba(10,20,36,0.08)` border, radius 18px, padding 34px, min-height 420px,
  `box-shadow: 0 24px 50px -40px rgba(10,20,36,0.45)`, flex column with the CTA pinned by
  `margin-top: auto`.
  - Top row: mono window label left, status pill right (mono 9.5px / 0.12em / uppercase,
    radius 999px, padding 5px 10px). Pill palettes: closed = bg `rgba(10,20,36,0.06)` / fg `#7C8798`;
    open = bg `rgba(74,222,128,0.16)` / fg `#15803D`; available = bg `rgba(46,107,255,0.12)` / fg `#1B52DC`.
  - Name Archivo 800 / 24px. Price Archivo 900 / **46px** / letter-spacing -0.04em, with "per team"
    in 14px `#7C8798` on the baseline.
  - Feature list: 11px gaps, each row a 6px `#2E6BFF` dot (margin-top 7px) + 15px `#3D4757` text.
  - CTA: full-width, radius 10px, padding 15px, Archivo 700 / 15px, hover `opacity: 0.88`.
    Three treatments: muted (`#F6F4F1` bg / `#7C8798` text / `rgba(10,20,36,0.1)` border),
    primary (`#2E6BFF` bg / white), dark (`#0A1424` bg / white).
  - Cards: **Earlybird** `$525` (May 1 – July 31, closed) · **Late registration** `$575`
    (Aug 1 – Aug 14, tracks `isOpen`) · **Sponsor a team** `$750` (always available, dark CTA
    "Talk to us →" → mailto). The third card is new in this redesign — a revenue path the current
    site lacks.
- Below: contact strip — white, `1px dashed rgba(10,20,36,0.18)`, radius 14px, padding 22px 28px,
  mono "Questions" label + line ending in a mailto link to `Sable.Top@ottawa.ca`.

### 7. Impact (`#impact`)
- Background `#0A1424`, white text, padding 124px. Pitch-marking pattern, layered:
  `repeating-radial-gradient(circle at 50% 46%, transparent 0 236px, rgba(110,155,255,0.13) 236px 238px, transparent 238px 470px)`
  (centre circle), a halfway line via
  `linear-gradient(90deg, transparent calc(50% - 1px), rgba(110,155,255,0.08) calc(50% - 1px), rgba(110,155,255,0.08) 50%, transparent 50%)`,
  and `radial-gradient(700px 380px at 8% 100%, rgba(46,107,255,0.16), transparent 70%)`.
- Header: 04 / Where the money goes — "Two days of soccer." / "A year of programs." (accent color
  `#6E9BFF` for the eyebrow and rule). Intro paragraph 18px / `rgba(255,255,255,0.66)` / 60ch,
  52px bottom margin.
- Three program cards (`repeat(3, minmax(0, 1fr))`, 20px gap): `rgba(255,255,255,0.045)` background,
  1px `rgba(255,255,255,0.1)` border, radius 16px, padding 34px, min-height 250px, flex column.
  Number in Archivo 900 / 13px / `#6E9BFF`; name Archivo 800 / 25px; body 15.5px /
  `rgba(255,255,255,0.62)`; tag pinned bottom (`margin-top: auto`, 24px padding-top) in mono 10px
  uppercase `rgba(255,255,255,0.4)`.
- Programs: 01 Resilience Lab (Mentorship) · 02 Grow A Writer (Literacy) · 03 Junior Blues Sports
  (Sport access). These map to real NCBF program pages — link each card through in production.

### 8. Sponsors (`#sponsors`)
- Background `#fff`, top border `1px rgba(10,20,36,0.14)`, horizontal rule pattern:
  `repeating-linear-gradient(0deg, rgba(10,20,36,0.04) 0 1px, transparent 1px 72px)`.
- Header: 05 / Partners — "Made possible by" + 18px intro, 48px bottom margin.
- Logo wall: `repeat(4, minmax(0, 1fr))` with **1px gap over a `rgba(10,20,36,0.09)` background**
  so the gaps read as hairline rules; outer 1px border of the same color, radius 16px,
  `overflow: hidden`. Each cell: white, `aspect-ratio: 16/9`, contents centered, padding 34px.
  Logo rendered as a contained background image, height 74px, `filter: grayscale(1); opacity: 0.62`,
  going to `filter: none; opacity: 1` on hover.
  - **Important:** use `minmax(0, 1fr)` (not `1fr`) and never let intrinsic logo width set the
    track floor — the first build of this grid overflowed its container because wide PNG logos
    refused to shrink.
- Below: a centered row — "Want your brand in front of 400+ frontline personnel and families?"
  (16.5px `#3D4757`) + dark button "Sponsorship package →" (`#0A1424`, hover `#14243D`,
  radius 9px, Archivo 700 / 14px).

### 9. FAQ (`#faq`)
- Background `#F6F4F1`, top border `1px rgba(10,20,36,0.14)`, dot grid
  `radial-gradient(rgba(10,20,36,0.075) 1.1px, transparent 1.1px)` at 34px × 34px.
  Content max-width **1040px** (narrower than the other sections).
- Header: 06 / FAQ — "Common questions".
- Accordion: white container, 1px `rgba(10,20,36,0.08)` border, radius 16px, `overflow: hidden`.
  Each item separated by `border-top: 1px solid rgba(10,20,36,0.07)`. Question row: flex,
  space-between, padding 26px 32px, cursor pointer, hover background `#FAF9F7`; question in
  Archivo 700 / 18px; toggle glyph "+" / "−" in Archivo 400 / 26px / `#2E6BFF`.
  Answer: padding 0 32px 28px, 16.5px / 1.7 / `#4C5665`, max-width 74ch.
- Single-open accordion; first item open by default; clicking the open item closes it.
- Six questions: who can register · is it co-ed · dates and times · team fees · what the fee
  supports · host hotel.

### 10. Closing CTA + footer
- CTA band: `#0A1424`, padding 120px, centered text (the one intentionally centered block).
  Background photo at `opacity: 0.18` plus
  `radial-gradient(800px 400px at 80% 20%, rgba(46,107,255,0.35), transparent 70%)`.
  H2 Archivo 900 / **62px** / line-height 1 / letter-spacing -0.035em, "Ready to play for a cause?";
  19px subhead `rgba(255,255,255,0.7)` / 54ch; primary + outline buttons (17px padding, 16px type).
- Footer: `#060E1A`, padding 72px 32px 36px. Four columns `1.4fr 1fr 1fr 1.2fr`, 48px gap,
  52px bottom padding over a `1px rgba(255,255,255,0.1)` divider.
  - Col 1: logo lockup, 14.5px description `rgba(255,255,255,0.5)`, and
    "Charitable Reg. No. 77069 6883 RR0001" in mono 10.5px `rgba(255,255,255,0.35)` — keep this,
    it is a compliance requirement for a registered charity.
  - Col 2 "Tournament": About, Details, Registration, FAQ (in-page anchors).
  - Col 3 "Foundation": Programs, Rising Stars Gala, Get Involved, Donate (links to the main
    ncbluesfoundation.org site).
  - Col 4 "Tournament updates": short line + email capture — input
    (`rgba(255,255,255,0.07)` bg, `rgba(255,255,255,0.16)` border, radius 8px, padding 12px 14px)
    and "Join" button (`#2E6BFF`, radius 8px). **Not wired up in the prototype** — connect to the
    foundation's mail provider and add validation + success/error states.
  - Bottom bar: copyright left, "Concept redesign — draft" right (remove in production), both
    mono 10.5px `rgba(255,255,255,0.32)`.

## Section header (repeat verbatim in every section)
This is deliberately identical and **left-aligned at the container's left edge in every section** —
consistency of position was an explicit requirement.
1. Eyebrow row: flex, `align-items: center`, 14px gap, 24px bottom margin.
   - A **40px × 3px** solid bar in the section accent color.
   - Label: JetBrains Mono, **11px**, letter-spacing **0.22em**, uppercase, accent color,
     formatted `"NN / Section Name"` (e.g. `01 / The Tournament`).
2. H2: Archivo **900**, **78px**, line-height **0.94**, letter-spacing **-0.042em**,
   margin `0 0 30px`, max-width 20–24ch, `text-wrap: balance`.
3. Accent color: `#2E6BFF` on light sections, `#6E9BFF` on the dark Impact section.

## Interactions & Behavior
- **Countdown**: ticks every 1000ms toward `2026-10-22T08:00:00-04:00`; clamped at zero; each unit
  zero-padded to 2 digits. Clear the interval on unmount. Compute in the user's local time from a
  fixed ISO instant so the number is correct regardless of visitor timezone. Consider hiding the
  countdown (or swapping to a "results / next year" state) once the event has passed.
- **FAQ accordion**: single-open. Clicking the active item collapses it (state → -1). Glyph swaps
  + / −. Add `aria-expanded` and a `<button>` element in production — the prototype uses a div
  with an onClick, which is not accessible.
- **Registration state**: `registration.isOpen` drives headline, subhead, tier status pills,
  and CTA labels/styles as described in section 6.
- **Nav**: in-page anchor links with smooth scrolling. In production add scroll-spy to highlight
  the active section, and account for the 74px sticky header with `scroll-margin-top`.
- **Hover states**: buttons darken (`#2E6BFF` → `#1B52DC`; `#0A1424` → `#14243D`); ghost buttons
  fill to `rgba(255,255,255,0.08)`; nav links go to full white; sponsor logos go from grayscale
  62% opacity to full color; FAQ rows tint to `#FAF9F7`; document rows go `#6E9BFF`.
- **Hero animation**: one-shot fade-and-rise, 0.7s ease. Respect `prefers-reduced-motion`.
- **Responsive**: the prototype is desktop-only (1280px canvas) — **responsive work is required**.
  Recommended breakpoints: ≥1024px as designed; 768–1023px → 2-column grids, hero H1 to ~60px,
  section H2 to ~52px, stat band to 2×2; <768px → single column, hero H1 to ~44px, section H2
  to ~38px, countdown tiles to a 2×2 grid, sponsor wall to 2 columns, header nav to a drawer.
  Keep tap targets ≥44px.

## State Management
Trivial — no server state needed for the page itself.
- `now: number` — ticking clock for the countdown (1s interval).
- `openFaq: number` — index of the expanded FAQ item, `-1` for none, initial `0`.
- `registration.isOpen: boolean` — content-level flag, not UI state; should come from the CMS.
- Newsletter form (if wired): `email`, `status: idle | submitting | success | error`.

## Design Tokens
Colors
| Token | Value | Use |
|---|---|---|
| navy-900 | `#060E1A` | footer |
| navy-800 | `#0A1424` | header, dark sections, dark buttons |
| navy-700 | `#14243D` | dark button hover |
| blue-600 | `#1B52DC` | primary button hover, accent pill text |
| blue-500 | `#2E6BFF` | primary accent, links, eyebrows |
| blue-400 | `#6E9BFF` | accent on dark backgrounds, stat values |
| blue-800 | `#0B3AAE` | logo gradient end |
| paper | `#F6F4F1` | page and alternating section background |
| white | `#FFFFFF` | alternating section background, cards |
| paper-hover | `#FAF9F7` | FAQ row hover |
| ink-900 | `#0A1424` | body headings |
| ink-700 | `#3D4757` | body copy |
| ink-600 | `#4C5665` | secondary copy |
| ink-400 | `#7C8798` | mono labels, muted text |
| green-400 | `#4ADE80` | live status dot |
| green-700 | `#15803D` | "open" pill text |

Typography
- Display / UI: **Archivo** (400, 500, 600, 700, 800, 900) — Google Fonts.
- Body: **Public Sans** (300, 400, 500, 600) — Google Fonts.
- Labels / meta: **JetBrains Mono** (400, 500) — Google Fonts.
- Scale: hero H1 92/0.92/-0.035em · section H2 78/0.94/-0.042em · CTA H2 62/1.0/-0.035em ·
  stat value 52/1/-0.04em · price 46/-0.04em · card title 25–26/1.15/-0.02em · lede 19 ·
  body 17.5/1.68 · card body 15.5/1.6 · nav 13.5 · mono label 10–11 with 0.16–0.22em tracking.
- `text-wrap: balance` on display headings, `text-wrap: pretty` on paragraphs.

Spacing / geometry
- Container 1280px (FAQ 1040px), gutters 32px, section padding 118px (hero 132/56, impact 124, CTA 120).
- Grid gaps: 20px cards, 88px about split, 48px footer, 1px sponsor wall.
- Radii: 8px small buttons/inputs · 9–10px buttons · 12px countdown tiles · 14px chips ·
  16px cards · 18px feature cards and photo · 999px pills.
- Shadows: `0 14px 40px -12px rgba(46,107,255,0.7)` primary button ·
  `0 24px 50px -40px rgba(10,20,36,0.45)` pricing card ·
  `0 40px 80px -40px rgba(10,20,36,0.5)` hero photo card ·
  `0 24px 50px -20px rgba(10,20,36,0.55)` overlapping stat chip.
- Borders: hairlines at `rgba(10,20,36,0.07–0.14)` on light, `rgba(255,255,255,0.08–0.16)` on dark.
  Section dividers are 1px except About's deliberate `3px solid #0A1424`.

Section background patterns (all pure CSS gradients — no image assets, no SVG)
| Section | Pattern |
|---|---|
| About | vertical pitch pinstripes, 104px pitch, `rgba(10,20,36,0.045)` + soft blue corner glow |
| Details | dot grid, 28px, `rgba(10,20,36,0.09)` |
| Register | 45° hatch, 14px pitch, `rgba(10,20,36,0.035)` |
| Impact | centre-circle ring + halfway line + corner glow in `rgba(110,155,255,0.08–0.13)` |
| Sponsors | horizontal rules, 72px pitch, `rgba(10,20,36,0.04)` |
| FAQ | dot grid, 34px, `rgba(10,20,36,0.075)` |
These are intentionally near-threshold — they should read as texture, not decoration. Exact values
matter; nudging opacity up makes the page look busy fast.

## Assets
All imagery in the prototype is **hot-linked from the live WordPress media library** and must be
replaced with self-hosted, optimized assets before launch:
- Hero: `/wp-content/uploads/2026/04/IMG_4498-1024x682.jpeg` (tournament action)
- About: `/wp-content/uploads/2026/04/IMG_4526.jpeg` (tournament action, 4:5 crop needed)
- CTA band: `/wp-content/uploads/2026/04/blues-silver-1024x512.webp`
- Host hotel: `/wp-content/uploads/2026/05/Hard-Rock.avif`
- Eight sponsor logos: TMSI, Ottawa Police Service, Footey Sevens, Ottawa Police Association,
  National Capital Blues Foundation, Nobility Performance, BFP, Baico
- The NCBF logo (`/wp-content/uploads/2026/07/New-Logo.png`) should replace the placeholder
  "NC" gradient tile in the header and footer.
Production needs: responsive `srcset` (hero at 2× for wide displays), AVIF/WebP with JPEG
fallback, `loading="lazy"` below the fold, explicit dimensions to avoid layout shift, real alt
text, and sponsor logos as SVG where obtainable (they are currently small raster PNG/JPG and will
look soft at 74px on retina).

## Real content, links and copy in the prototype
- Dates: Thursday & Friday, **October 22–23, 2026**, 8:00 AM – 5:00 PM daily.
- Venue: **Ben Franklin Superdome**, 191 Knoxdale Rd, Ottawa.
- Fees: **$525** earlybird (May 1 – Jul 31), **$575** late (to Aug 14); "Sponsor a team" $750 is
  a proposed new tier, not currently offered — confirm before shipping.
- Raised to date: **$90,000+**; 14th annual edition.
- Registration form: the existing Google Form
  (`docs.google.com/forms/d/e/1FAIpQLSdv95oXsupx2V-6TcLqkajRV3LLDJXu8EG4pbxzJsF-gMH41Q/viewform`).
  Recommend replacing with a native form + payment, but the Google Form is an acceptable v1.
- Contact: `Sable.Top@ottawa.ca`.
- Documents: EN rules PDF and FR rules PDF (both live on the current site); a roster/waiver form
  is listed as "Coming soon".
- Bilingual note: the tournament publishes FR rules, so **EN/FR i18n is likely a requirement** —
  structure copy for translation from the start rather than retrofitting.

## Production notes beyond the visual build
- SEO / discoverability was a stated goal: add `Event` and `SportsEvent` JSON-LD structured data
  (name, dates, venue, offers/pricing, organizer), Open Graph and Twitter card images, a real
  `<title>` and meta description, and a canonical URL. This is the highest-leverage change for
  the "more site visits" objective.
- Accessibility: convert accordion rows to buttons, verify contrast on `rgba(255,255,255,0.48)`
  and `#7C8798` text (both are borderline at small sizes — bump if they fail 4.5:1), add visible
  focus rings, ensure the countdown is announced politely or marked `aria-hidden` with a text
  fallback date.
- Performance: three Google Font families is the main weight — subset to Latin, preload the two
  display weights actually used (Archivo 800/900), and self-host if the codebase already does.
- Analytics: instrument the two primary conversions (Register click, Sponsor click) so the
  "more traffic" claim can be measured against something.

## Files
- `ottawa-blues-charity-classic.dc.html` — the complete design prototype (renamed from
  `Ottawa Blues Charity Classic.dc.html` — the space in the original name didn't survive a
  GitHub web upload cleanly). Opens directly in a browser. Markup and inline styles carry every
  value documented above; the data arrays and the countdown / accordion / registration-state
  logic live in the `<script>` logic class at the bottom of the file. Read it alongside this
  README.

## Build status
Implemented at [`../obcc-site/index.html`](../obcc-site/index.html) — a single self-contained
HTML file (no build step, no framework), matching this repo's existing convention for
`public/index.html`. See that folder's own README for what's done and what's still open.
