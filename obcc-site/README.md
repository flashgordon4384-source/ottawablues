# OBCC public event page — build

Implementation of the redesign specified in
[`../design_handoff_obcc_site/README.md`](../design_handoff_obcc_site/README.md), built against
the prototype at
[`../design_handoff_obcc_site/ottawa-blues-charity-classic.dc.html`](../design_handoff_obcc_site/ottawa-blues-charity-classic.dc.html).

**This is a separate Cloudflare project from the tournament tool in `../public/`**, per
`CLAUDE.md` §11 — public site and tournament tool stay decoupled so a bad commit during the
tournament can't take the public site down, even though they share this repo.

## What this is

A single self-contained HTML file — no build step, no framework, no dependencies — matching the
same convention `../public/index.html` already uses in this repo. Content that changes year to
year (dates, fees, registration state, documents, sponsor logos) lives in one `CONTENT`-style
block of plain JS objects near the top of the `<script>` at the bottom of `index.html`. That's
the one place a non-technical volunteer (or Claude, next year) needs to touch.

To flip registration open/closed for next year's window: change `REGISTRATION.isOpen` in
`index.html`. That one boolean drives the registration headline, subhead, every tier's status
pill, and every button label/style.

## What's implemented

All ten sections from the handoff spec: sticky header with mobile drawer nav, hero with a live
countdown (ticks toward `EVENT.startISO`, switches to a "see you next year" line once the event
has ended), the four-stat band, About, Details (documents card + host hotel card), Registration
(three pricing tiers), Impact (three program cards), Sponsors (logo wall), single-open FAQ
accordion, closing CTA, and footer with a newsletter capture. Section header pattern, design
tokens, background patterns and responsive breakpoints (1024px / 768px) all follow the handoff
spec's exact values.

Also done, beyond the visual spec, per the handoff's own "Production notes" section:
- `SportsEvent` JSON-LD structured data, Open Graph / Twitter card meta, a real `<title>`,
  meta description and canonical URL.
- FAQ rows are real `<button>` elements with `aria-expanded` / `aria-controls`, not the
  prototype's `div onClick` — matches the handoff's accessibility note.
- `prefers-reduced-motion` respected globally.
- Countdown computed from a fixed ISO instant so it's correct in any visitor timezone; interval
  cleared on `pagehide`.
- Lightweight scroll-spy on the nav links (IntersectionObserver) — called out in the handoff as
  a recommended production addition.
- `loading="lazy"` on below-the-fold images, explicit width/height to avoid layout shift.

## What's still open (flagged in the handoff, not addressed here)

- **Images are still hot-linked from the live WordPress media library.** Every `src` in
  `index.html` points at `ncbluesfoundation.org/wp-content/uploads/...`. These need to become
  self-hosted, optimized assets (responsive `srcset`, AVIF/WebP with JPEG fallback, real alt
  text where it's currently generic) before this goes live. Sponsor logos in particular are
  small raster PNG/JPG and will look soft at retina — SVG versions would be worth asking
  sponsors for.
- **EN/FR i18n.** Not implemented — the page is English-only right now. The handoff flags this
  as "likely a requirement" since the tournament already publishes French rules. Content is
  centralized in the `CONTENT`-style objects specifically so a translation pass has one place to
  work from, but the actual language-switch mechanism (route-based, or a toggle) isn't built.
- **Newsletter signup isn't wired to a mail provider.** The form validates client-side and shows
  a local confirmation message, but nothing is actually sent anywhere yet.
- **The "Sponsor a team" $750 tier is new** — per the handoff, confirm with the foundation
  before shipping; it isn't currently offered on the live WordPress page.
- No Cloudflare project wired up yet — see "Deploy" below for the exact dashboard steps once
  ready.

## Deploy

Not connected to anything live yet, on purpose — this is prep, not a switch-over. Devo still
owns `ncbluesfoundation.org` and its DNS; nothing here touches that. The goal is to have a
working preview link ready to hand him whenever he says "let's switch."

Assets-only, same as `../public/`, so no `wrangler.toml` is needed here either — same reasoning
CLAUDE.md §2 gives for the tournament tool: a config file would just be a second source of truth
for `name`/`--assets`, duplicating what the dashboard's deploy command already covers. Set up as
its own Cloudflare Workers & Pages project (Workers & Pages → Create → connect a repository →
pick `flashgordon4384-source/ottawablues`):

| Setting | Value |
|---|---|
| Project name | `obcc-site` |
| Git repository | `flashgordon4384-source/ottawablues` (same repo as the tournament tool) |
| Production branch | `main` |
| Root directory | `/` |
| Build command | none |
| Deploy command | `npx wrangler deploy --assets ./obcc-site --name obcc-site --compatibility-date 2026-09-04` |

That gives a real, presentable link — `obcc-site.obcc.workers.dev` (same account subdomain the
tournament tool uses, just a different project name) — instead of Cloudflare's generic
placeholder page, so there's something worth sending Devo once it's ready. No custom domain, no
DNS change, no effect on the live WordPress site or the tournament tool's own project.

Live at [obcc-site.obcc.workers.dev](https://obcc-site.obcc.workers.dev/), deployed 4 Sept 2026.
The account's `workers.dev` subdomain was renamed the same day from `gordon-perolli` to `obcc`
(Gord's name off the URL) — both this and the tournament tool's link moved together.

**If this project's next deploy fails** with `A compatibility_date is required when uploading a
Worker` — `npx` always fetches the latest `wrangler`, and a version released after this project's
first deploy started enforcing that. The Deploy command above already has `--compatibility-date`
baked in to prevent it; if the dashboard still shows the version without that flag, update it to
match this table before retrying.
