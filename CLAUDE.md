# CLAUDE.md — Ottawa Blues Charity Classic

Read this before touching anything. It carries the decisions that are
not visible in the code, and the reasons behind them.

Maintained by Gord Perolli. Last updated 31 August 2026.

---

## 1. What this is

A tournament operations tool for the **Ottawa Blues Charity Classic
(OBCC)**, run by the **National Capital Blues Foundation** — a
registered Canadian charity, Charitable Registration No. 77069 6883
RR0001. The tournament is in its 14th year and has raised more than
$90,000 to date.

**2026 event:** Ben Franklin Superdome, Ottawa. Two days, three
fields, roughly 20 teams drawn from emergency services — police, fire,
paramedic, corrections, CBSA, RCMP — plus guest sides.

The tool replaces two things:

1. **The paper game sheet.** 2025's sheet is a per-team, per-game
   form: player rows with goals, yellow and red columns, plus actual
   kick-off, a shortened-game question, and an injury question.
2. **A paid third-party platform.** The tournament currently rents
   schedule and standings pages from Ottawa Footy Sevens. Replacing it
   is a direct cost saving and part of the pitch.

There is a wider plan (section 11) to replace the foundation's
WordPress site as well. **That is not this year's job.** This year the
tournament tool ships and nothing else.

---

## 2. Repository and deployment

- **Repo:** `flashgordon4384-source/ottawablues`, branch `main`
- **App:** `public/index.html` — a single self-contained file. No
  build step, no framework, no package.json, no dependencies.
- **Headers:** `public/_headers`
- **Backend:** `worker/index.js` — a Durable Object holding shared
  game-sheet entries. See "Shared state" below. **Live as of 4 Sept 2026.**
- **Host:** Cloudflare, project `ottawablues`. Deploys automatically
  on push to `main`.

The masthead logo is the real OBCC 2026 crest, supplied by Devo
31 August 2026 (a phone photo, background removed and cropped). It
replaced an earlier estimated reconstruction of the Ottawa Blues FC
club logo pulled off Facebook — that estimate is gone from the live
page; it's still in git history (commit `2662758`) if it's ever
useful as a reference for the club logo specifically, which this
crest doesn't replace, since it's the tournament's own mark.

### Rules for this repo

**Keep it a single file.** The whole app is one HTML file with inline
CSS and JavaScript. This is deliberate — it deploys anywhere, has no
supply chain, and can be opened and read in five years by someone who
has never seen the project. Do not introduce a bundler, a framework,
or npm dependencies without asking Gord first.

**Never rename `_headers`.** Leading underscore, no extension, must
sit at the root of the served assets directory. It stops browsers
caching the HTML. Without it, phones serve stale builds after a deploy
and people conclude the tool is broken. This actually happened.

**Bump the build stamp on every change.** It appears in the masthead
and the footer, in the form `2026-08-30 · b3`. It is how anyone
confirms which build they are looking at. A stale stamp on a phone
means a caching problem, not a code problem.

**Watch the filename on uploads.** A previous manual upload landed as
`public/index_1.html` because the browser had renamed the download.
The live site was unchanged for a day and the cause was invisible.
When committing from Claude Code this cannot happen, but verify the
path after any manual upload.

### Deploy

Commit to `main`. Cloudflare picks it up within a minute or two. Then
load the site and check the build stamp matches.

### Rollback

Every commit is a restore point. Reverting the previous commit and
pushing restores the last working build in under a minute. **Practise
this once before the tournament** so it is familiar under pressure.

### Known gap — closed 31 August 2026

There is no `wrangler.toml`, and there doesn't need to be one. This
project's Git integration runs an explicit deploy command instead of
reading a config file, confirmed against Workers & Pages →
ottawablues → Settings:

| Setting | Value |
|---|---|
| Git repository | `flashgordon4384-source/ottawablues` |
| Production branch | `main` (builds for non-production branches also on) |
| Root directory | `/` |
| Build command | none |
| Deploy command | `npx wrangler deploy --assets ./public --name ottawablues` |
| Version command | `npx wrangler versions upload` |
| Build watch paths | include `*`, exclude `node_modules/**, .git/` |
| API token | a scoped "ottawablues build token" (in the dashboard, not the repo) |
| Compatibility date | none set — fine, since this is assets-only with no Worker script |
| Custom domain | none — only the `workers.dev` subdomain (see §8) |
| Bindings | none |

A `wrangler.toml` was tried and deliberately dropped: it would have
duplicated `name`/`--assets` from a second source instead of the
dashboard's explicit flags, adding a way for the two to disagree
rather than fixing anything. This table is the backup — if the
dashboard config is ever lost, it's a paste back into Settings, not a
reconstruction from memory.

`_headers` was added 31 August 2026 and confirmed live against
`ottawablues.gordon-perolli.workers.dev`: `/` and the `/index.html`
redirect both carry `Cache-Control: no-cache, must-revalidate`, plus
`nosniff` and the referrer-policy header. Workers static assets do
honour it here — that question is closed.

**Deploy command switched 4 Sept 2026** from the explicit
`--assets ./public --name ottawablues` flags to plain
`npx wrangler deploy`, so it now reads this file — the Durable
Object binding and migration below are live (see "Shared state"
further down; confirmed with a real read/write round-trip against
`/api/state` and `/api/sheet` the same day).

**Account `workers.dev` subdomain renamed 4 Sept 2026**, `gordon-perolli`
→ `obcc` (Gord's name off the URL). Both projects moved with it —
`ottawablues.gordon-perolli.workers.dev` → `ottawablues.obcc.workers.dev`,
`obcc-site.gordon-perolli.workers.dev` → `obcc-site.obcc.workers.dev`.
The old URLs are gone, not redirected — anyone with the old link
(Babak, Sable) needs the new one. A real custom domain is still the
better long-term answer (see §11) but wasn't done here — this was
the free, five-minute fix.

### Shared state — live since 4 Sept 2026

`wrangler.toml` and `worker/index.js` were added 31 August 2026 to
start on the database (§7's "actual blocker"). A Durable Object holds
`state.sheets` — marshal and referee game-sheet entries — so three
phones stop producing three records that never meet. Nothing else
moved server-side: standings, cards, rosters and tie-breakers are
still computed client-side in `public/index.html` exactly as before,
reading whatever sheets that tab has synced.

Deliberately scoped to just this one piece rather than the whole
`state` object — see the comment at the top of `worker/index.js` for
why (schemaless Durable Object storage means extending it later, for
penalty entry or forfeits or whatever comes next, is cheap; there was
no reason to wait for the rest of §7 to settle before starting).

**Turned on 4 September 2026.** The dashboard's Deploy command was
changed from the explicit `--assets`/`--name` flags to plain
`npx wrangler deploy`, which reads this `wrangler.toml` and provisions
the Durable Object binding and migration. Verified live the same day
with a real read/write/round-trip against `/api/state` and
`/api/sheet` — a marshal or referee submitting a sheet on one phone
now actually reaches every other phone within the ~7-second poll
interval, not just the tab it was entered on. Target was well before
20 September 2026 (Abdel's schedule is due the 15th) — this is done
with room to spare.

Still true and unchanged: standings, cards, rosters and tie-breakers
are computed client-side exactly as before, reading whatever sheets
have synced. The database only carries `state.sheets` — nothing else
moved server-side.

---

## 3. The rules the code implements

All of these come from **OBCC Tournament Rules, Revised 2026**. Do not
change any of them without a source document. They are encoded in the
`RULES` object at the top of the script.

| Rule | Value |
|---|---|
| Game length, preliminary | **50 minutes, no exceptions** |
| Points | 3 win / 1 draw / 0 loss |
| Squad registration cap | 15 players |
| Minimum to constitute a team | 5 players at scheduled kick-off |
| Women on the field | **Minimum 2 at all times**, keeper counts |
| Team registration | A player may register with **only one team** for the tournament |
| Master list deadline | Submitted **no less than 30 minutes** before that team's first game |
| Yellow card | Team plays a player short for **2 minutes** |
| Red card | Team plays a player short for **5 minutes** |
| Two yellows in the tournament | Suspended for the next game |
| Red card | Suspended for the next game |
| Two red cards | Suspended from the tournament |
| Yellow counts | **Reset entering the semi-final.** Reds do not reset |
| Failure to show | Recorded 2:0 forfeit in favour of the other team |
| Protests | Written, within 15 minutes, $50 cash, refundable if upheld |
| Semi and final ties | 3 penalties, then sudden death, with gender alternation rules |
| Restart | Kick-in, no throw-in |
| Offside | None |
| Slide tackling | Not permitted except the keeper in his area |

### Tie-breakers, in this exact order

1. Most points
2. Head-to-head — **void for ties of three or more teams**
3. Goal difference
4. **Goals against** (fewest) — note this ranks above goals for
5. Goals for (most)
6. Fewest red cards
7. Fewest yellow cards
8. Coin toss

The coin toss cannot be automated. The app flags it and a person
records the outcome.

### The three roster exceptions

There are no routine call-ups. There are three narrow exceptions,
each an approvable, loggable event rather than a roster edit:

1. A team reduced to two female players may recruit one female player
   from a team in the division below. In recreational, from another
   recreational team.
2. A team out of male or female substitutions may recruit one male and
   one female from a lower division, to a maximum of two substitutes.
3. During playoffs, a team badly depleted by injury may recruit from a
   team already eliminated. No new players enter the tournament at
   that point.

A player must have played with the team at least once during group
stage to be eligible for playoff games.

**Note the asymmetry:** competitive is the top division, so
competitive teams can recruit from recreational. Recreational has no
division below it, so recreational teams out of substitutions have
nowhere to go.

---

## 4. Structure, and what is still unsettled

### 2025, which worked

18 teams. Competitive ran as a single group of six. Recreational ran
as **four pools of three** (A/B/C/D). Everyone played three games.
Both 12 and 6 divide evenly, which is why it worked.

The app is currently seeded with these real 2025 teams and this pool
structure, so demos show names people recognise.

### 2026, which does not yet work

20 teams registered as of the 14 August close: **5 competitive, 15
recreational**.

Every game consumes two team-slots, so **teams × games-each must be
even**. 5 × 3 = 15 and 15 × 3 = 45 are both odd. Neither division can
produce a legal round robin as registered. Devo is working on evening
the counts. 6/14 or 4/16 both work.

A pool of three only produces two games a team, but the master team
sheet has three columns. In 2025 the gap was closed with a crossover
game against another pool. **The app does not generate crossovers.**

### Capacity

50-minute games plus a 10-minute changeover is one game per field per
hour. The foundation's own page says 8:00 AM – 5:00 PM. With a
ceremony hour blocked across all fields — as in 2022 — that is 8 slots
on 3 fields, or 24 games. 20 teams × 3 games needs 30. The Structure
tab computes this and states the shortfall.

**Abdel owns the schedule**, not us. Deadline was 15 September 2026.
Babak needs it to book referees, though he can book on slot count and
time blocks without fixtures. The Structure tab exists as evidence for
that conversation, not as a replacement for Abdel's work.

### Playoffs

Not confirmed for 2026. In 2022 every team qualified: seeds 2v3, 4v5
and 6v7 played first, the top seed then met the winner of 6v7, winners
met, and a consolation and championship closed the day. Three playoff
games maximum per team.

The app ships shapes for 4, 6, 7 and 8 qualifiers, selectable per
division on the Structure tab. Placeholders read "Recreational 2nd v
Recreational 3rd" and resolve to real names once **every** pool game
is final.

---

## 5. Roles and access

| Role | Can do | Demo code |
|---|---|---|
| Public | Schedule, scores, standings | — |
| Field marshal | Run the pre-game check with each captain, then enter the one game sheet at their field, with the referee confirming at the end | 1111 |
| Head referee (Babak) | No sheet entry — confirms what goes on the marshal's sheet at the end of each game, in person. Assigns referees on Officials, unlocks a submitted sheet to fix a mistake, sees filed protests | 2222 |
| Organizer (Gord, Sable) | Everything, including marshal notes, rosters, and running a sheet themselves | 3333 |
| Team captain | Their own team's roster, waivers, check-in and logo only — sees the check-in overview for every team but can only open their own | one code per team, derived from the team id (`captainCode()`), organizer looks it up on Rosters and hands it to the captain |

**Roles and permissions are due a proper pass** (Gord, 5 Sept 2026) —
the table above is "for now," reflecting only what the single-sheet
change actually required. Don't take it as a settled, final
permission model.

**The codes are in the page source.** Acceptable for a demo,
unacceptable once a code controls the official record. This must be
fixed before the event. Now applies to captain codes too, same
caveat, same fix needed before the event.

**Team captain, added 31 Aug 2026.** From a three-perspectives review
(player / coach / organizer) — the coach was the one persona with
nothing between "read-only public" and "full organizer," even though
CLAUDE.md's own description of the workflow ("a captain pastes the
squad") assumes a captain acts directly. Now they can, scoped to just
their own team.

**Be honest about what this does and doesn't fix yet.** It's built on
top of the same local-only state as the rest of the roster editor —
see "Shared state" in section 2. A captain editing their roster on
their own phone doesn't put anything anywhere Gord's phone can see
until that work ships. Right now this mainly helps in one browser at
a time (e.g. handing a laptop to a captain at check-in), not "captains
use this from home." Don't oversell it as more than that.

### One game sheet, entered together — changed 5 Sept 2026

**This replaces "why two records" below**, which described the
original design: a marshal entry and a referee entry, captured
independently and blind to each other, compared for agreement, with
an organizer settling any disagreement. That was never actually how
it happened on the ground — see the "dual capture does not exist
today" note preserved below, which said as much before this change
landed. Gord's correction: the marshal carries the one phone, and
only opens it at the **end** of the game, when they find the referee
and the two of them fill in the single sheet together — the referee
tells the marshal what to write, the marshal is the one who types.
There was never a second device entering a second record, so
building the app around comparing two records was solving a problem
that didn't exist, at the cost of workflow no volunteer was actually
going to follow.

What changed in the code: `state.sheets[gameId]` now holds one
`marshal` entry (the shared record) instead of `marshal` + `ref` +
`resolved`-as-tiebreak. `result()`, `sheetStatus()` and
`agreedLines()` all read that one entry — no more "agreed"/
"disputed"/"part" states, no Marshal/Referee toggle on the sheet, no
"records disagree, pick one" flow. `resolved` survives as a manual
correction path (forfeits, fixing a mistake after the fact via
**Unlock**), not for settling a disagreement that can't happen
anymore. Old sheets already in the shared database (a real `g1`
predates this) still read fine — `.marshal` was always the field
that mattered, `.ref` just goes unused now.

**New: the pre-game check.** Before the end-of-game sheet unlocks,
the marshal confirms roster, jersey numbers and eligibility with
each captain — two independent confirmations (`sheet(id).precheck.
home` / `.away`), since they're two different captains. This is a
new required step, not just the eligibility warnings the sheet
already showed in passing — it creates an actual record that the
check happened, synced the same way as everything else (`POST
/api/sheet` with `side:"precheck"`). Skipped entirely for sheets
that predate this feature (checked via whether the entry was *ever*
submitted, not just currently locked, so reopening an old sheet with
**Unlock** doesn't retroactively demand a pre-game check).

**Roles, only adjusted as far as this required** — see the note under
section 5's table. The referee still has no game-sheet typing
access, same as before, but for a different reason: not "deliberately
no access" as a reporting-line choice, but literally nothing to type,
since there's one entry and the marshal is the one entering it. Babak
(head referee) keeps the app open mainly for Officials (assigning
referees) and Unlock (fixing a mistake) — Gord flagged that the full
permission model needs a real pass, this is "for now."

#### Why two records *(superseded above, kept for the record)*

Each game has a marshal entry and a referee entry, entered
independently and blind to each other. Where they agree, the score
publishes. Where they disagree, nothing publishes until an organizer
picks one.

Be accurate about this when describing it: **dual capture does not
exist today.** In practice the marshal takes the sheet at kick-off,
marks the score during play, and runs it to Babak. Referees keep their
own notebooks. So the app *adds* verification rather than preserving
it. That is a better pitch, not a worse one, but do not describe it as
like-for-like.

The blind rule matters. Two records that can see each other are not
two records.

---

## 6. What is built

**Batch one** — the game record, the digital game sheet against the
real 2025 fields, standings with all eight tie-breakers, the card and
suspension engine including the semi-final reset, the sin-bin timer
(2:00 yellow, 5:00 red), team sheet validation, and the Structure tab.

**Batch two** — roster editor with paste import, bilingual waiver page,
check-in gate against the 30-minute rule, duplicate-email detection,
per-game shirt numbers, the resolving Friday bracket, and a team
editor.

**Batch three (31 Aug 2026)** — team badges and a visual refinement
pass, from a Gord + ChatGPT-drafted design brief.

*Team badges:* every team gets a small shield next to its name,
everywhere a name appears (schedule cards, standings, teams tab). A
team's own logo if the organizer has uploaded one via the roster
editor's "Team logo" card (resized client-side to 96×96 before
storing, so a phone photo doesn't bloat the save file); otherwise a
generated shield — initials plus a colour, both deterministic from the
team id, so the same team always looks the same. **Logos are local to
this tab for now**, same as rosters and waivers — they need the same
shared-state work in progress (see "Shared state" above) before a
captain's upload shows up on anyone else's device.

*Visual pass* — kept the existing layout, workflow and palette exactly
as instructed; the changes are: stat pills under the title (games /
fields / teams / days, computed live, not hardcoded); a pitch-green
accent bar and tab-underline for wayfinding; heavier team-name
weighting in cards and tables; a chip treatment for the field label;
subtle card elevation and hover states (150–200ms transitions
throughout, nothing dramatic); each time-slot now reads as one grouped
block instead of a header floating over loose cards; the "Signed in
as / Change" control was quieted down so it reads as a minor utility
rather than competing with the tournament identity. Checked against
mobile (375px) and it holds up — header, stats, filters and cards all
stack correctly.

Remaining opportunities, not done in this pass: team badges in the
game-sheet modal header and the Structure tab's qualifier pickers;
long team names on narrow screens wrap instead of truncating in table
cells (not broken, just not tight); a full WCAG contrast/keyboard
audit beyond what already existed.

*Palette follow-up, same day:* Gord flagged the warm beige base as
the one thing actively bothering him about the look, so `--oyster`/
`--rule`/`--rule-soft` moved from a cream tone to a cool blue-grey —
"subtle emergency colours," reading closer to a dispatch console than
an editorial magazine. Everything that already used those tokens (the
page background, chips, the field-label badge, the sign-in modal)
picked it up automatically. Ink navy, alarm red and whistle amber —
already the tournament's actual emergency-service-coded colours —
weren't touched; they just read more clearly now that they're not
competing with a warm neutral.

**Batch four (31 Aug 2026)** — a "Now" landing tab, replacing Schedule
as the default view. Gord's ask: the app opened straight onto the
full schedule with no sense of what actually mattered at that moment,
and a dashboard would give people a reason to check back rather than
look once. It's a pure read of state that already exists elsewhere —
`sheetStatus`, `result`, `agreedLines`, `standings` — nothing new is
tracked:

- **Up next**, with a countdown. This needed a real calendar
  timestamp per game, which nothing had before — day/time were just
  display strings ("Thu," "09:00"). Added `gameDate(g)`, anchored to
  the actual 22–23 October 2026 dates, compared against the real
  device clock. During the tournament this counts down correctly;
  right now, pre-event, it correctly says "in 51 days" rather than
  faking urgency — that's intended, not a bug to fix.
- **In progress** and **just finished**, both reusing `fixtureCard`
  directly rather than inventing new markup.
- **Standings snapshot** — top 3 per division, linking to the full
  Standings tab.
- **Leading scorers** — new: nobody had aggregated goals across teams
  before. Only counts games with an agreed result, same rule
  `standings()` already uses for cards.

Scoped to pool games only — the resolving playoff bracket already has
its own view on Schedule, and folding it in felt like scope creep for
a first pass.

**Batch five (31 Aug 2026)** — team detail page, and player name
privacy.

*Team detail*, from Gord's "single player / full team" perspective:
clicking a team's Roster link now opens all of its games across both
days (reusing `fixtureCard`, same as Now), its full division standings
table with its own row highlighted, and the squad — one screen instead
of cross-referencing Schedule, Standings and Teams separately.
Read-only, public, no sign-in, same `showRoster()` entry point as
before, just richer.

*Player name privacy*, because some of the police teams have officers
whose posting means they can't be publicly named. `p.private` is a
per-player flag. When set, every public-facing surface — the team
detail roster, Cards &amp; suspensions, Leading scorers, the sin-bin bar,
and the game sheet as seen by a marshal or referee entering it —
shows "Player #N" instead of the real name. Only the organizer and
that player's own team captain (see §5) see the real name, since
neither a marshal nor a referee actually needs off-field identity to
record which numbered player took a card. The waiver itself, and the
roster editor for admin/captain, always show the real name — a legal
document and a team's own management screen aren't the "public"
surface this protects.

**Two ways to set it, both live:** the organizer or the team's own
captain can tick **Private** per player in the roster editor: or the
player can tick it themselves on their own waiver form when signing —
unticked by default, so a player who does nothing is shown normally.
Both write the same flag.

**This is a draft, not a settled policy.** Gord's own framing: "we
just have to draft it, Devo will give us the answer." Open questions
Devo should weigh in on before the event: should the default be
opt-in (as built) or opt-out for certain teams entirely; should
`private` be settable by the roster editor at all versus waiver-only;
and whether "Player #N" is the right public label versus something
else. Don't treat the current behaviour as final without checking
back.

*Photo/media consent*, added same day, deliberately kept as its own
flag rather than folded into name privacy — a player might be fine
being named but not photographed, or the reverse, and it's a
different legal question (the proper term is a photo/media release,
usually a clause inside the same liability waiver, which is where
it lives here). `p.noPhoto`, set the same two ways as `private` (the
player's own waiver checkbox, or the organizer/captain in the roster
editor). It doesn't change anything the app displays — this app
doesn't publish photos — it just records the consent and gives
whoever's on cameras a **No photos** list on the Rosters tab
(admin-only, real names, on purpose: the point of that list is for a
human to recognize a face, so anonymizing it would defeat it). Same
draft-not-policy caveat as name privacy above.

**Batch six (31 Aug 2026)** — a design-critique follow-through: Gord
asked for an honest design assessment (strengths/weaknesses, visual
only), then worked through the findings point by point and asked for
all of it built in one pass, plus a few fresh asks that came in mid-build.

*Masthead rebuilt as a grid*, not a flex row, specifically so "Signed
in as" lines up with the venue/address line instead of floating
between the title and subtitle the way it used to. Subtitle is now
two lines — date, then the real venue and address (Superdome at Ben
Franklin Park, 191 Knoxdale Rd, Ottawa — confirmed against the City of
Ottawa's own page, not guessed). "3 fields" dropped from the subtitle
(it's already a stat pill) and the build stamp moved out entirely —
footer-only now. Title bumped up a size. Spacing normalized to 14px
between title block / stat pills / tab bar, so the rhythm reads as
one deliberate spacing scale instead of tight-then-loose.

*Slot grid now lives in two places* — Structure (the full breakdown)
and Now (the at-a-glance version Gord asked for) — both calling the
same `renderSlotGridCard()` so there's one source of truth, not two
copies to keep in sync. Worth knowing: it only ever shows Thursday
(`day==="thu"` is hardcoded in the underlying query) — a pre-existing
limit, not something this pass touched. Worth fixing whenever Friday's
playoff slots need the same treatment.

*Structure's headline moved to the top*, styled as a hero box (`.msg.hero`) —
whichever applies, "the day is short," "counts are odd," or "the day
works," now leads the page instead of sitting between two data tables.
Gord's own caveat holds: this becomes moot the moment Devo's counts
settle into something legal, but the tab should lead with its
conclusion regardless of what that conclusion currently is.

*How To — new tab*, second from the left. Pick a role (Public, Field
marshal, Head referee, Team captain, Organizer), get a numbered,
click-by-click walkthrough of exactly what that role does on this
tool and what it gets back. Written against what the code actually
lets each role do — not aspirational copy. Gord's framing: nobody,
including him, should have to guess how to use this.

*Fixture cards redesigned as a matchup*, not a stacked list — bigger
badges (40px, doubled from 20px, after Gord flagged them as too small
to read), a "vs" divider between the two sides, bigger score type. A
team's pool letter (A–D, real data already on the team record) shows
under its name when it has one, as an honest way to fill the space
rather than inventing fields the app doesn't track. **City and team
captain name were asked for and deliberately left out** — this app
has no data for either today, and fabricating placeholder values on
a real charity site's schedule would be actively wrong, not just
incomplete. Real fields for both are a reasonable follow-up if
wanted, editable the same way the logo is.

*Fields got their own colours* — three new tokens (`--f1` violet,
`--f2` teal, `--f3` rust) distinct from every existing semantic
colour (ink/pitch/whistle/alarm/comp/rec), so "Field 2" never reads
as a status or a division. The small inline badges elsewhere
(Standings, Teams, Leading scorers) went from 16–18px to 20px —
noticeably more legible without blowing out table row height the way
literally doubling them would have.

*Two suggestions from the critique, both implemented*: on mobile, a
modal (game sheet, roster editor, waiver) now goes full-bleed instead
of floating as a dialog over a dimmed backdrop — the idea being it's
where the work happens, not a popup to dismiss. And cards whose main
content is something to *do* (Team logo, Add players, Master list in
the roster editor; Save and load on Data) get a `.card.action`
treatment — amber top border, small "ACTION" label — so they're
visually distinct from cards that are just reference.

**Batch seven (2 Sept 2026)** — the public event page, first build.

A design handoff (`design_handoff_obcc_site/README.md` + a `.dc.html` prototype) had been
uploaded to this repo's root via GitHub's web uploader, which clobbered `README.md` (replacing
the actual project readme with the handoff doc) and left the prototype file sitting loose with a
space in its name. Fixed: moved both into `design_handoff_obcc_site/`, restored the original
`README.md`, renamed the prototype to `ottawa-blues-charity-classic.dc.html`.

Built the redesign at `obcc-site/index.html` — single self-contained HTML file, no build step,
matching the same convention `public/index.html` already uses, per §11's decision to keep the
public site and the tournament tool as separate Cloudflare projects even though they share this
repo. See `obcc-site/README.md` for what's implemented and what's still open (mainly: images are
still hot-linked from the live WordPress site and need to become self-hosted assets, and EN/FR
isn't built yet even though content is centralized for it). Not deployed anywhere yet — it's a
file you can open directly in a browser.

**Batch eight (5 Sept 2026)** — officials, protests, and the single-sheet redesign.

Extended the shared database three more times, same pattern each time (a narrow `/api/*`
endpoint, a master list and/or a per-game assignment): **referees** (master list + one assigned
per game), **field marshals** (same, mirrored — no separate "head marshal" role exists to split
assignment to, so it's organizer-only there, unlike referees where the head referee can also
assign), and **card protests** (captains file one from Cards — team, game, player, yellow/red,
narrative, who they've talked to, an "other" option; append-only log, visible to organizer/head
referee; the confirmation message sends the captain to find the Head Marshal in person, since
this digitizes CLAUDE.md's existing protest rule rather than replacing its in-person requirement).
Both assignments show as a neutral tag on every fixture card ("Ref: Alex Nguyen" / "Marshal:
Jamie Fox"). The Referees tab was renamed **Officials** and redesigned as two side-by-side
master-list cards plus one combined assignments table (Referee and Marshal as adjacent columns
per game, not the same game list shown twice), Field 1/2/3 coloured to match the schedule, rows
shaded in bands per kick-off slot.

Fixed a real bug found while adding referee assignments to the Cards tab (which now shows which
game and which ref for every card): `suspendedFor()` had an unconditional "if expelled, suspended
everywhere" check that flagged a player as unable to play the very game they got their second red
in. Fixed by routing expulsion through the same pending-queue mechanism single-game suspensions
already used correctly.

**Then the bigger change: one game sheet instead of two.** See "One game sheet, entered
together" in section 5 for the full reasoning — the short version is that the original
dual-blind-capture design assumed two people would each open the app independently, which was
never how it actually happened; the marshal carries the one phone and only opens it at the end of
the game, with the referee right there consulting on what to write. Rebuilt `result()`,
`sheetStatus()`, `agreedLines()` and the whole sheet UI around one shared entry, removed the
Marshal/Referee toggle and the "records disagree" flow, and added a new required pre-game
check (roster/numbers/eligibility, confirmed independently with each captain) that gates the
sheet until both are done — except for a sheet that's *ever* been submitted, so re-opening an old
one via Unlock doesn't retroactively demand a pre-game check that already happened for real.
Verified against the real `g1` entry already sitting in the live database (predates this change)
to confirm old data still reads correctly with no crash.

**Roles are "for now," not settled.** Gord's own framing: a real permissions pass is coming later
across every role, not just the two this change touched. Don't treat the roles table in section 5
as final.

### Design decisions worth preserving

**The paste creates the player, not the waiver.** A captain pastes name
and email; the player exists immediately with the waiver outstanding.
Signing flips it to cleared. If signing created the record, there
would be no way to see who has not signed — which is the one thing
actually needed at 30 minutes to kick-off.

**Waiver attaches to the person, not the roster row.** This means a
player loaned under one of the three exceptions is already cleared.

**Tick box plus typed name**, not a drawn signature. Simpler, and good
enough per Gord. Be clear-eyed that this records agreement, not
identity — anyone with the link can type any name. What makes it hold
up is the stored token, timestamp and waiver version, not the typed
name. The 2022 waiver required a witness; the 2025 team sheet does
not. **2026 is proceeding on the no-witness model.** Whoever owns
liability for the foundation should confirm that in writing.

**Shirt number is a game attribute.** Set on the roster as a default,
overridable per game on the sheet. Players change numbers between
games; stats follow the person.

**Marshal notes are never public.** The 2026 field marshal role
document already asks marshals for a post-game report on incidents and
interventions, so the incident log is existing policy, not a new ask.
It has to be better than the volunteer group chat or it will lose to
the group chat.

**Injury capture matters.** The paper sheet has always asked whether a
player was injured and left the game. Nobody has ever aggregated it.

---

## 7. What is not built

**The shared database — closed 4 Sept 2026.** Was the blocker: every
phone held its own copy of the data, so three marshals on three
phones produced three records that never met. A Durable Object now
carries `state.sheets` (marshal and referee game-sheet entries)
shared across every device — see "Shared state" in §2 for how it
works and how it was verified live.

**Only game-sheet entries moved server-side. Everything else in
`state` is still local to one browser tab** — rosters, waivers,
check-in, team logos, shirt numbers. The waiver link still only
works in the same browser a captain cannot send a player a link
that reaches Gord's copy; waivers are still done at a laptop. This
was deliberately scoped narrow (see §2) — the schemaless Durable
Object storage makes extending it to the next piece cheap whenever
that's the priority, but nothing beyond `sheets` has been done yet.

Also outstanding:

- **Penalty entry** for semis and finals. A drawn playoff game
  currently leaves the bracket stuck with no way to record who
  advanced.
- **Crossover games** for pools of three.
- **Shared team logos** — uploads via the roster editor are local to
  that tab; not part of the `sheets`-only database above.
- **Access codes out of the page source.**
- **Forfeit as a result type** (2:0, recorded, not a normal score).
- **Real 2026 teams and rosters**, once Devo settles the counts.
- **Public site wrapper** — tournament page content, sponsor logos,
  documents, registration status.
- **Email sending.** A static site cannot send. Options are a mail
  service wired to a Worker, or captains sending links themselves. The
  copy-paste-link flow works today with no account and no decisions.

---

## 8. Open questions

- **The `ID` column** on the 2025 game sheet. Unknown. Possibly the
  check against the master list under rule 3. Gord is finding out.
- **Playoff format** for 2026.
- **Division counts** — 5/15 does not work.
- **Which site the tournament tool lives on**: `ottawabluesfc.ca`,
  a subdomain, or `ncbluesfoundation.org`. These are different sites
  and the tournament content currently sits on the foundation one.
- **Whether the foundation accepts the no-witness waiver.**
- **Player name privacy policy** — Devo to confirm. Current build:
  opt-in per player at waiver signing (or set by the organizer/
  captain), unticked by default. See §6, "Player name privacy."

---

## 9. People

- **Gord Perolli** — building this. Field marshal lead; point of
  contact for marshals on the day.
- **Sable Top** — organizer. Currently uses a City of Ottawa work
  email publicly on the foundation site.
- **Babak** — head referee. Game sheets flow to him. Should be
  consulted before the referee-entry side is finalised; he has not
  been in the design conversations.
- **Devo** — owner and sole operator of the Ottawa Blues FC website
  and the Ottawa Footy Sevens league. Holds the keys to everything.
  Was looking to hand the site to someone cheap.
- **Abdel** — writes the schedule.

---

## 10. Governance and data

These are not technical problems but they shape the build.

**Single points of failure everywhere.** The GoDaddy login, the
Instagram account, the Cloudflare dashboard config, Sable's work email
— each currently sits with one person. Sable's address is on a public
charity site and belongs to her employer, not the foundation. A
dedicated foundation mailbox solves ownership and continuity, and
would also be the domain to authenticate if automated email is ever
wired up.

**Personal data.** Full rosters mean roughly 260 names and email
addresses the foundation has never held before. Someone should own
that list and decide what happens to it after October. Waiver records
are legal documents and should not simply evaporate when a browser tab
closes — another reason the database matters.

**Registration fees are not donations.** A team pays and receives
entry, so under CRA split-receipting the eligible amount is normally
nil. No charitable receipt is issued for registration. State that
plainly on any registration page. Confirm with whoever files the
foundation's T3010.

**Board approval.** Get it in writing even though the board is
friendly. Moving a registered charity's website, donation flow and
participant data onto new infrastructure is worth a recorded decision.

---

## 11. Wider plan, in order

1. **Tournament tool** — ships for real, 2026.
2. **Ottawa Blues FC site** — demo only this year.
3. **Foundation site** — demo only this year.

Goal is to retire WordPress and point GoDaddy at Cloudflare. GoDaddy
stays as registrar; Devo keeps the domain. Static hosting removes the
core, plugin and theme update burden entirely, which is the ongoing
work Devo is currently trying to hand off.

**Build the public site and the tournament tool as separate Cloudflare
projects**, even if they share a repo and a look. During the
tournament, changes get pushed under time pressure. A bad commit
should not be able to take down the public site in front of sponsors.

Donations go to Square. Hosted checkout, no backend, consistent with a
static site.

Social feeds: the Instagram account `ottawa.police.blues` is already a
professional account with a linked Facebook page, so the Graph API
path is available. Tokens expire roughly every 60 days, so any embed
needs a scheduled refresh — a Cloudflare cron Worker caching recent
posts is the fitting approach. **Build it so a broken feed degrades to
a tidy "Follow us" panel rather than an empty hole**, because it will
break eventually. This is the one part of the site that is not
maintenance-free.

---

## 12. Working with Gord

- Metric. No imperial conversions unless asked.
- Say "paramedic" or "paramedic services". Never "EMS", never
  "ambulance service", even when a source uses those terms.
- Lead with the most consequential thing. Never bury the hard part.
- Verify before asserting. Label unverified checkable claims.
- Disagree with structure, and hold position under pushback unless the
  reasoning actually changes.
- Own errors cleanly and immediately, and say what the correction
  changes.
- On build work: he supplies the full wish list at once, it gets
  grouped into themes and confirmed back, then actioned in batches.
- Present-but-lower coverage is not a "gap" — say "coverage present,
  below recommendation".

---

## 13. Before the tournament

- [x] Shared database built and tested — §2, 4 Sept 2026: live, verified
      read/write/round-trip against `/api/state` and `/api/sheet`
- [ ] Access codes out of the page source
- [ ] Penalty entry for semis and finals
- [ ] Real 2026 teams, divisions and pools loaded
- [ ] Rosters entered and waivers signed
- [x] Cloudflare dashboard configuration captured somewhere off-laptop — §2, 31 Aug 2026
- [ ] Rollback practised once
- [ ] **Rehearsal** with Gord, Sable and Babak on their own phones,
      entering a full fake game end to end — about a week out
- [ ] Code freeze after the rehearsal
- [ ] **Paper game sheets printed anyway.** Year one runs alongside
      paper, not instead of it. It costs nothing and it's the
      fallback if a phone dies or the app misbehaves mid-tournament
      — not, as originally written here, a way to cross-check two
      digital records against each other; there's only one now (see
      section 5, 5 Sept 2026).
