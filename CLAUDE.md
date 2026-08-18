# SpotOn — working notes

A geography guessing game. React + TypeScript + Vite, no backend of its own:
the whole game runs client-side, and Supabase exists only so that scores from
different devices can meet on one table.

```
npm install --legacy-peer-deps   # react-simple-maps@3 has not heard of React 19
npm run dev                      # vite, usually :5173
npm run build                    # tsc -b && vite build — this is the typecheck
npm run lint
```

There is no test suite. `npm run build` and `npm run lint` are the gates, and
anything to do with the maps or the reveal has to be looked at in a browser —
most of what breaks here is visual or timing, and neither shows up in a type.

---

## The shape of it

Every game is the same machine with a different question bolted on. Three files
carry that and everything else is a variation:

| File | What it owns |
|---|---|
| `src/lib/useGame.ts` | The round loop: deal the targets, take a click, mark it, advance. Every mode calls this. |
| `src/components/GameFrame.tsx` | Everything the player sees around the map: prompt bar, clock, result panel, results table. |
| `src/lib/geo.ts` | Distance, and the curve a distance is marked on. |
| `src/lib/useRoute.ts` | Every URL the app answers to — see "The URLs". |

A mode (`src/modes/*.tsx`) is therefore quite thin: it picks a pool, says how to
score a click, and hands `GameFrame` some render props. If you find yourself
adding logic to a mode that another mode would want, it belongs in `useGame`'s
options or in `GameFrame`'s props instead.

### `useGame` options worth knowing

- **`hitTest`** — full marks for landing inside the target's own area (a
  country, a station's patch). Modes whose answer is a point don't have one.
- **`spotOnKm`** — a free radius around a point answer. Cities use 50 km: a
  city is one coordinate in the data and forty miles of streets in life.
- **`scoreGuess`** — replaces distance scoring outright, and supplies the
  wording for a miss. Tube, population and time zone all use this, because
  stops, people and hours are the things those games are actually about.
- **`answerFor`** — where the answer is, when there's more than one right place
  (a currency is spent in twenty countries; the nearest one is the one to fly to).
- **`guessAt`** — where a click counts as having been made. Country modes move
  every guess onto that country's anchor, so which part of India you pressed
  can't change the score. **The raw click is still kept** as `result.click`,
  and it is the only thing that can name the country picked — an anchor can sit
  in open water or inside a neighbour.
- **`easierBy`** — deal a game that climbs. The pool is ranked by this (**bigger
  is easier**), cut into as many bands as there are rounds, and one target taken
  at random from each, easiest first. Only Population Spotter sets it, ranking
  by population: a flat shuffle of every country on Earth deals mostly from the
  long tail, and five rounds of small islands is a fair deal and a rotten game.
  Nothing leaves the pool — every country is still reachable, in its own band.
  Works with `seed`, so a duel climbs identically on both devices.
- **`seed`** — deal deterministically. This is the whole of how two devices play
  the same rounds without talking to each other. Seeded games deliberately skip
  the "recently seen" memory, which differs per device.

### Three `GameFrame` props worth knowing

The first two are the tube's alone, and both exist because a round the circle
paid for is marked by a rule the map can't be read for. Top to bottom the panel
goes: the call, the mark, the note, the pick.

**`renderScoreCall`** — a line **above the mark**, naming the rule the mark came
from where that isn't the mode's usual one. The tube calls "Mind the Gap!" over
a round its circle paid for. Return null everywhere else: an announcement made
every round announces nothing.

**`renderScoreNote`** — a sentence **directly under the mark** saying where the
mark came from, given the target and the whole `RoundResult`. Only the tube has
one, and only because its marks can contradict its own figures: 37 points for a
guess the headline says was 22 stops out is generosity that has to account for
itself. It sits above "You picked", not below it, because it is the mark it
answers for and not the pick. Return null on a round with nothing to explain —
printed every round it stops being read, which is why the tube only prints it on
the rounds the circle paid for.

**`summaryMeasure`** — the middle cell of the **results table**, replacing the
mode's usual reading of it, given the `RoundResult` and that round's target. The
time zone game is the only one with one, and prints what was clicked beside how
far out it put them: "1 hour out (Gabon, UTC−1)". The map is gone by the time
that table is read, and there a column of gaps says which rounds went wrong
without a word about what was picked — which in that game is the whole lesson,
since the mistake is a clock and not a place. Return null to leave a round to
the ordinary reading, which is what an unanswered one wants.

### The maps

Three of them, all satisfying `GuessMapProps` in `src/components/mapTypes.ts`:

- **`WorldMap.tsx`** — flat, plate carrée, `react-simple-maps` + `d3-geo`. Draws
  `WORLD_TILES` over the satellite texture.
- **`GlobeMap.tsx`** — `react-globe.gl` (three.js). Draws from a **coarsened**
  copy of the country shapes; at full 1:50m detail the globe is a slideshow.
  Never score against the coarse copy. Skinned in `WORLD_TILES`, which also sets
  how close the camera may get.
- **`LondonMap.tsx`** — bespoke SVG of the tube network. Also takes `rings` —
  the circle a tube guess is marked against, from `src/lib/tubeReach.tsx`. The
  game only ever hands it a circle on a round the circle actually paid for. The
  array's identity must be stable, since the map re-projects the lot whenever
  it's handed a new one.

**Both world maps are tiled, in every game** — see `src/lib/mapTiles.ts`. The
imagery resolves as you zoom instead of being one 4096×2048 photograph
magnified, which is about ten kilometres to the pixel. There is **no day/night
toggle** any more: it was a second palette for every map — a grey globe, a dark
tube map, a second set of line colours — and once the world was tiled, night's
grey world was the one thing tiles couldn't replace, since a tile engine hides
the photographed globe that grey world *was*. It went rather than being carried.

Reveal colouring comes in two flavours, and they are not interchangeable:

- **`highlightCodes` + `missCode`** — green on the answer's country, red on the
  one the player picked. Pins and the line between them stay. Used by flag,
  currency, corporate HQ and population.
- **`highlights`** (`MapHighlight[]`) — paints arbitrary shapes and *suppresses*
  the pins, the arc and the dive onto a point. Only the time zone game wants
  this, because "where is it 14:30?" is answered by a band across the world and
  a pin can only stand on one of its forty-six answers.

`src/lib/worldShapes.ts` is the shared world: Natural Earth 1:50m fetched once
from jsDelivr, plus a coarse copy for the globe, per-landmass bounding boxes so
point-in-polygon isn't run over 242 coastlines per mouse move, and
`smallTargets` — countries under 12,000 km² get a 250 km reach so the Maldives
is answerable at all. That reach is only ever granted to the country being asked
for, so it can never cost anyone a round.

---

## The way in

The home page asks one question — **who are you playing** — and answers it with
three cards: `Today's Round`, `Duel a Friend`, and `All Games`. The games
themselves are behind the third of those, on a shelf that ends with whatever is
being built next. That card sits after the games rather than among them: it
isn't a game yet, and putting it in the row would offer it as one. Each card is three lines — the name, a `hook`
asking whether you fancy it, and a `blurb` saying what a round involves; eight
descriptions read as a list, where eight questions read as a dare. They used to be the home page, with the two
contests tacked on as an eighth card; seven games in front of the question
answered it before it was asked, and the contests read as two more games.

**TEMPORARY — the tap cheat.** Tapping the question itself six times in one
round answers that round correctly, in every game: the flag, the population
figure, the station name, whatever is being asked. It is `CHEAT_TAPS` and
`promptTap` in `GameFrame`, the `onClick` on the prompt, and `solveRound` /
`solvePoint` in `useGame` — four pieces, nothing else knows about it, and
deleting all four takes it out cleanly. It goes through `submitGuess` like a
real click, so a cheated round is marked, timed and filed like any other — which
also means it will file to a leaderboard if used in a duel or today's round.
`solvePoint` clicks the target's own coordinate, or where that fails the mode's
`hitTest` walks a widening ring until something passes: two countries in the
pool of 233, Equatorial Guinea and New Zealand, have a Natural Earth label point
outside their own borders.

All of it is `App.tsx`, and **which screen is up is the URL's** — see below.
`social` and `browsing` are gone: the path says which contest is open and which
menu is underneath, and coming out of Flag Spotter landing on the shelf while
coming out of today's round lands home is now just the path's own parent rather
than a flag held deliberately out of step with everything else.

A card's words are a `GameCard`, and `MODES` is that plus a `ModeId`. The split
is what lets something have the same setup screen as a game without being a
mode — a bench, next time there is one: `ModeSetup` takes a card, not an id.
`ownMap` on a card says the game
brings its own map and the world-map choices have nothing to offer it — the
tube's alone, and data rather than the `id !== "tube"` test it replaced.

### The footer, and the two pages that are read

`SiteFooter` is drawn under every screen **except a round in progress** — there
the map is pinned to the window and nothing scrolls, so a footer would either be
painted over the map or never reached. `App` wraps each screen in a `page()`
helper rather than each screen carrying its own, because there are ten of them
and the one that quietly lost its footer is exactly what nobody would notice.

It exists because there was nowhere for a credit, a copyright line or a policy
link to live, and it carries the two pages behind it:

- **`About`** — what the game is, how a round is marked, the three ways to play,
  and a table of all seven games saying what each is marked on. Its numbers come
  from `MAX_ROUND_SCORE` and `MATCH_ROUNDS`, and its list from `MATCH_MODES`, so
  a game added to the app appears here without anyone remembering to.
- **`Credits`** — the attributions, and four of them are **owed rather than
  offered**: NASA asks for its imagery line, TfL's open data asks for "Data
  provided by Transport for London", and the MIT and ISC licences on React,
  three.js, react-globe.gl, react-simple-maps, prop-types and d3-geo require
  their notices to travel with what ships. Take a dependency, add it there.
- **`Privacy`** — written from the code rather than from a template, and that
  is the point: it names the four `localStorage` keys because those are the
  four that exist, and says the scores sit in the EU because the Supabase
  project is in `eu-central-1`. **Change what the app stores and this page is
  part of the change** — a policy that lists storage the site doesn't use, or
  misses what it does, is the one document here that can be checked against the
  source. It also carries the erasure route, which is a person and an inbox
  rather than a button: nothing can delete a filed score by design, so removal
  is done by hand in the Supabase dashboard.

All three are `.doc` in the stylesheet, which is the one place in this app where
text is set left in a reading column rather than centred under a heading.

**`src/lib/site.ts`** holds the facts about the site as opposed to the game —
the contact address, the date the policy last moved, and where the data is kept.
They are in one place because they appear in several, and an address that says
one thing in the footer and another in the policy is a request that goes
nowhere.

The trademark disclaimer for the company logos is in **two** places on purpose:
the credits page, and `smallprint` on the Corporate HQ card, which prints it on
that game's setup screen. A disclaimer only on a page somebody has to go looking
for is not on the screen where the marks actually appear.

### The URLs

`src/lib/useRoute.ts` owns every address the app answers to, and the URL is the
truth rather than a copy of state kept beside it — which is the whole of why the
browser's own back button works without a line of wiring.

| Path | Screen |
|---|---|
| `/` | the three doors |
| `/dailyround` | Today's Round — the `HeadToHead` component |
| `/headtohead` | Duel a Friend — the `PlayFriend` component |
| `/headtohead/CVKQ7M` | an invitation to one room — see "The invite link" |
| `/allgames` | the shelf |
| `/about` | what the game is and how it's marked |
| `/credits` | where the maps, shapes, logos and code came from |
| `/privacy` | what the game knows about the people who play it |
| `/cityspotter`, `/flagspotter`, `/currencyspotter`, `/corporatehqspotter`, `/populationspotter`, `/tubestationspotter`, `/timezonespotter` | that game's setup screen, and the round itself |

**The names crossed over and the file says so:** `/headtohead` is Duel a Friend,
while `/dailyround` is the component *called* `HeadToHead`. The screens were
renamed, the paths were chosen afterwards from what players are shown, and the
components kept their old names. Follow `useRoute.ts`, not the file names.

**Adding a game means adding a path here**, as well as a mode letter in
`match.ts`. The paths are written down rather than derived from the titles: a
URL is a promise, and derived, a copy tweak to a game's name would silently
break every link to it.

Three things follow, and they're the point rather than side effects:

- **Nothing about a game in progress is in the URL** — no code, no seed, no
  round. So a refresh of `/cityspotter` hands back the setup screen and a *new*
  deal rather than another go at the round just played. A URL can't be made
  unrefreshable — F5 belongs to the browser, and `beforeunload` can only prompt
  — so the way to stop a path replaying a round is to not put the round in it.
  (Scores were never resting on this: `checkEntry` plus the unique index on
  `(code, player)` is what makes today's round one go, "however the player got
  there" — and see "One go a device" for what each of those two halves actually
  covers.) A room's code in `/headtohead/CVKQ7M` is the one exception and isn't
  really one: it is an invitation to a room that hasn't started, and it stops
  meaning anything at the exact moment it could have started replaying
  something — see below.
- **A contest's round keeps the contest's address**, not the game's. A refresh
  mid-daily lands on `/dailyround`, where the one-go guard is, and mid-duel on
  `/headtohead`, where `joinedHere` puts the player back in the round in
  progress. Sent to `/tubestationspotter` instead, a refresh would read as the
  contest being replayable at will.
- **A `Session` carries the path it belongs to**, and `App` reads the game off
  it only while the two agree. Derived rather than cleared by an effect watching
  the path — cleared, there'd be a render where a finished game is still on
  screen because the tidying-up hasn't run, and `react-hooks` refuses the
  `setState`-in-effect that would do it. The path it carries is
  **`spellScreen`'s**, not `spell`'s: an invitation's code is who sent you and
  not where you are, so `/headtohead/CVKQ7M` and `/headtohead` are one screen.
  Compared on the whole path instead, the code being dropped as the duel starts
  reads as the player having walked off the screen, and the round ends a
  fraction of a second after it begins.

**The trap, and it only bites in production:** the host serves `/allgames` as a
file that doesn't exist, so *clicking* to it works and refreshing or sharing the
link 404s. `vercel.json` rewrites everything to `index.html`, which is what makes
a deep link work at all. Vite's dev server already falls back, so this cannot be
caught locally. Anything that replaces that file has to keep the rewrite.

### The invite link

`/headtohead/CVKQ7M` is a room, as a link to send. It was deliberately not built
for a while — a path carrying a code is a path that could deal a round again —
and what made it safe is that **the link dies the moment the room starts**,
which is also the moment it could have become a way to replay anything.

The code appears in the address bar as soon as there is a room to point at, so
the host's link is the link they are looking at, and the lobby copies that
rather than the bare code (`inviteLink`, and the "Copy invite link" button). The
code is still printed large for reading out: a room fills up both ways.

What a fresh visitor to the link gets is decided in one place, the invitation
effect in `PlayFriend`, and it is decided against the room rather than the path:

| The room | What happens |
|---|---|
| still `waiting` | the invite screen — which duel this is, and a name box |
| already on this device's list (`joinedHere`) | straight back to the lobby or the round in progress; a reloaded lobby, a locked phone, the host reopening their own link |
| `starting`, `playing` or `over`, and not theirs | `/headtohead`, with "this duel started without you" |
| no such room, or a code the parser turns down | `/headtohead`, with a word about the code or none at all |

Two things this leans on, and both are load-bearing:

- **Everyone in the room loses the code from their bar when the round opens**,
  not just the people who were too late. The link has to be dead in the address
  bar of the players themselves, since they are the ones who might paste it on —
  and a round belongs at the contest's own address anyway.
- **The join is re-checked against the server** when the button is pressed, not
  trusted from the lookup that drew the screen. The host may well have started
  it in between, and the insert policy on `duel_players` refuses it a third time
  from inside Postgres.

**The trap, and it cost two rounds of debugging.** A `useRef` used as a
ran-once flag inside that effect is broken under React's strict mode, which
mounts every component twice in development: the first mount sets the flag and
has its work cancelled by its own cleanup, the second finds the flag set and
skips, and the invitation sits on "Looking up the room…" for ever. The ref there
records only the codes *this screen put in the bar itself* — which is a fact
about ownership rather than about having run — and that is what stops a host's
own lobby from reading its address bar as an invitation to the room they are
standing in.

## The seven games

(Seven playable, plus a card for a game that isn't built — see "Coming soon"
below.)

| Game | `ModeId` | Question | Marked on |
|---|---|---|---|
| City Spotter | `city` | Name of a city | Distance to it, 50 km free |
| Flag Spotter | `flag` | A flag | Right country, else distance |
| Currency Spotter | `currency` | Code + symbol | Any country that spends it, else distance |
| Corporate HQ Spotter | `company` | A company logo | Right country, else distance |
| Population Spotter | `population` | A population figure | Ratio of populations — **not** distance |
| Tube Station Spotter | `tube` | A station name | Stops between, or how crowded the clicked station's circle is — **not** metres |
| Time Zone Spotter | `timezone` | A live clock face | Hours off that clock, **not** distance |

Data lives in `src/data/`. Countries, currencies, populations and time zones are
all derived from the same country pool, which is derived from the map data — so
nothing can be asked about until the shapes have downloaded. Every mode that
does this renders a "Loading the world…" shell first; keep that pattern.

Pools are filtered against the map at runtime rather than hardcoded, so a
country missing from Natural Earth simply never comes up. `countries.ts` also
falls back to a generated fact for anywhere without a written one, which is what
lets the pool be *every* country rather than the ones someone got round to.

### Per-game nuances

- **City** has no "you picked" line. A click near Lima isn't a vote for some
  other city, so naming the nearest one would be inventing an answer the player
  never gave. The pin and the line say everything true.
- **Currency** scores to the *nearest* country that spends it, not to the
  centre of the currency zone — for the euro that would be a field in Austria,
  for the US dollar the middle of the Pacific.
- **Population** is scored purely on the number, so a guess can be a continent
  away and still be a good answer. This is why the red country matters most
  here, and why its results column is headed "Difference in population" rather
  than a distance. Two things follow from the number being the mark, and both
  were got wrong once:
  - **Nothing but the right country is worth 100** (`NEAR_COUNTRY_MAX`, above).
    A wrong country with the same population reads "The right sort of number,
    the wrong country" and takes 95 — the old "1.0× too many people" described
    a right number as a mistake in the number.
  - **A mode marked on something else must never quote kilometres.** Full marks
    on a wrong country used to print `GameFrame`'s near-miss line, "You were
    close enough — just 12,801 km away!", over a round where distance had
    nothing to do with anything. That line is now gated on the round having been
    marked on distance at all, which is `RoundResult.label === undefined`; any
    mode with a `scoreGuess` supplies a label and is excluded by construction.
  Rounds also **climb** — see `easierBy` above.
- **Time zone** must read a *live* clock (`serverNow`, ticking every second) —
  the answer can't be a screenshot of a minute that has passed. Countries that
  keep several clocks are cut into pieces (`src/lib/zoneShapes.ts`), so a press
  on Perth answers Perth's clock and not Sydney's, and the reveal says so: "in
  the part you clicked". **Not quite every one of them is cut** — the pieces
  file holds 20 countries and Ukraine keeps two clocks without being in it, so
  the "several clocks, no parts" path is real code and not just the
  failed-download case. There the round is marked against whichever of the
  country's clocks came closest, and the reveal names that same one; a sentence
  quoting a clock the score didn't use is a panel arguing with itself. The
  results table names that same clock again, for the same reason — see
  `markedAgainst`, which is the one place any of the three ask which clock a
  round was marked by. Its rows read "01:22 (UTC+9)" against "5½ hours out
  (Myanmar, UTC+6:30)": the reading is what the player was shown and is the only
  form they can recognise a round in, the offset is the durable half, and both
  halves are wanted because two rounds an hour apart read alike otherwise.
  **The readings in that table keep ticking**, like every other clock in this
  game: it is read minutes after the last round, and a reading held from when
  the round closed is a time nowhere on Earth is standing at any more. Every
  row then reports the same minute, which is not a fault to hide — they are one
  moment read in five places, which is the fact the whole game is about. (This
  was briefly frozen instead; that was wrong, and a stale clock is the worse of
  the two failures.) An offset can't be read back off a reading, which is why
  `ClockReading` carries both: a position on the face is deliberately blind to
  the date line, so UTC+13 read back off one comes out as UTC−11.
- **Tube** treats whichever station's patch of the map you clicked as your
  answer, and charges you the ride from there — **unless the answer is inside
  that station's own circle**, where the ride is replaced by how crowded the
  circle is. The circle, its sizes and the reason for both are in
  `src/data/tubeNearby.ts`. **Both the circle and the sentence about it appear
  only on the rounds the circle paid for** — `paidRing` and `creditNote` in
  `src/lib/tubeReach.tsx`, which is where all three of the circle's appearances
  are decided from one `markNearby` call so they can never disagree. A round charged as the ride says what
  it always said, "18 stops away", with nothing drawn and nothing explained: a
  circle round a click that got no credit reads as an offer made and then not
  honoured, and a radius printed under every pick is a measurement in search of
  a reason. On the rounds it did pay, the circle has a name — a **Mind the Gap
  Area**, `MIND_THE_GAP` in `tubeNearby.ts` — and the panel reads: the name
  called over the mark ("MIND THE GAP!"), the ride with the rule in brackets
  after it ("22 stops away (Mind the Gap benefit)  +37 pts"), then which area
  it was ("Hillingdon is inside a Mind the Gap Area around West Ruislip, so
  we're giving you some credit!"). **A** Mind the Gap Area, never *the* — every
  station out there has one, and the player has landed in one of them rather
  than in some single feature of the map they were meant to know about.

  The headline stays the **ride** even when the ride isn't what was charged: it
  is the only figure on the panel the map can be checked against, and a headline
  that quietly shrank to the number the circle charged left the score agreeing
  with nothing the player could see. What the circle actually charged is the
  `tubeNearby.ts`'s business, along with the radius and the count inside it. The
  panel's job is to say how far out the guess was and why it was forgiven.
  The kinder of the ride and the circle
  counts, so the rule can only ever help. It is also the one game with a
  line of its own — `TUBE_TAGLINE` in `data/tube.ts`, "See it. Say it. Spot
  it.". Every card on the shelf now carries a `hook`, and the tube's *is* that
  line, from the one constant; the `tagline` field it also sets is what puts the
  line on the setup screen, which no other game has. And it replaces "Spot on!"
  on a round worth full marks, via `GameFrame`'s `fullMarksLabel`. The reveal uses
  `TUBE_SPOT_ON`, which is the tagline with its last full stop turned into an
  exclamation mark — **derived, not written out again**, so the words stay in
  one place and only the punctuation differs. Only the wording moves — what
  counts as full marks is still scoring's business.

### The circle the tube marks by

Sized in `src/data/tubeNearby.ts`: from zone 3 outwards every station gets one,
1.2 km at zone 3, +0.4 km a zone, capped at 2.4 — about one station's gap, which
the data agrees with (neighbours joined by track sit 1.26 km apart in zone 3,
1.48 in zone 4, 1.99 in zone 6). A station billed for two zones is sized off the
**outer** of them and docked 100 m for being only half in it, so 2/3 is 1.1 km,
3/4 is 1.5 and 5/6 is 2.3. That also brings the ten zone 2/3 stations into the
rule, which rounding down left with no circle at all despite their sitting on
the same sparse stretches of map as the zone 3 ones beside them. Where the
clicked station's circle covers the answer, the ride is replaced by **how
crowded the circle is**: one stop for the answer, plus one for every other
station inside it. Northwick Park's circle holds three stations, so a click
there for Kenton — 18 stops by train — is marked 4 stops: nothing on the ride
alone, 64 with the circle.

This arrived on a bench of its own — `Game Maker Test Version`, a second copy of
the tube game that marked a click both ways side by side — and was judged there
before it was let near a score. Having graduated it **replaced** the ride rather
than standing beside it, and that bench has since been taken down: there is one
tube rule and it is that file. Benches come and go this way — see "The bench,
when one is next wanted" below.

**The trap, and it cost a round trip:** membership is the station's dot inside
the circle, and it has to stay something a player can *count off the screen*.
Reading "a station whose circle touches" as the station's own reach circle put
13 stations in Kenton's count instead of the 3 visibly inside it; a 150 m
tolerance for dots straddling the edge then let in Preston Road, 1.74 km from a
1.6 km circle. Both made the printed number disagree with the picture, which is
the one thing this rule cannot afford. If the test ever grows a tolerance again,
the circle on the map has to grow with it.

### The imagery: `src/lib/mapTiles.ts`

Both maps draw **map tiles** in daylight rather than one photograph of the
Earth: the world cut into squares at every zoom level, each level twice the
detail of the last, only the ones in view fetched. The globe has the engine
built in (`globeTileEngineUrl`, which tracks the camera itself); the flat map
lays its own out (`tilesInView` in `WorldMap`).

A **`TileSource`** says where imagery comes from and how far it can be trusted.
Three are defined and `WORLD_TILES` picks the one the game draws, so swapping is
one line:

| Source | Deepest | Costs |
|---|---|---|
| `NASA_BLUE_MARBLE` — **what the game draws** | globe 8, flat 7 | nothing: public domain, no key, no meter, commercial use expressly fine, credit line only |
| `NASA_TRUE_COLOUR` | globe 9, flat 8 | same terms, but it's yesterday's actual satellite pass — real cloud over whichever country it was cloudy over, and a dark polar winter |
| `ESRI_WORLD_IMAGERY` | globe 17, **no flat** | the legacy anonymous endpoint, which their terms don't cover commercially. Doing it properly is their keyed service and a bill — and their *tile* meter works out at pennies a game, which no ad-supported game survives, so it would have to be the session meter |

**NASA is the one a shipped game can stand on**, which is why it's mounted:
nothing is owed for it but the credit the maps print, and that matters now the
game is meant to earn. Esri is far deeper and could not be shipped as wired.
Level 8 is still sixteen times sharper than the single photograph, and SpotOn
asks where a *city* is — a question settled by coastlines and mountain ranges
rather than by rooftops. The other two are kept as the alternatives, with what
each would cost written beside it.

**The two maps need separately-cut tiles**, which is why a source has both a
`url` and a `flat`: the globe wants Web Mercator, which is what "slippy map"
means everywhere on the web, while the flat map is plate carrée, and Mercator
tiles laid on it would stretch further wrong the nearer they got to the poles.
NASA publishes both. Esri's is Mercator alone, so choosing it would tile the
globe and leave the flat map on its photograph.

Two traps, both paid for:

- **`maxLevel` is not optional.** Asked for a level past its last, every one of
  these services answers **400**, and the engine draws nothing where no tile
  arrived. So a generous `maxLevel` doesn't buy detail off a shallow service —
  it strips the globe bare the moment you go too close. Each source carries the
  depth it was *checked* to have, and `minAltitude` with it, so the zoom stops
  where the pictures stop instead of magnifying the deepest tiles into the same
  mush this was meant to escape.
- **How much world a plate carrée tile holds comes off the service's ladder,
  never from counting its columns.** A tile is 512 pixels of 0.5625° at level 0
  — 288° square — and every level halves it (`flatTileSpan`). The columns and
  rows follow: as many as it takes to cover 360° and 180°, with the last of them
  hanging past the date line or the pole and clipped by the map.

  The inference to avoid, because it was made and cost a round trip: a level's
  column count looks like it should give the span, and `360 / cols` *is* right
  from level 3 down, where the grid divides the world exactly. At the top it
  isn't. Level 1 is three columns of **144°**, covering 432° — half a world of
  padding — and treating them as 120° squeezes every coastline to 83% of where
  it belongs. What that looks like is the imagery sliding out from under the
  borders at the start of a game and snapping into place when you zoom in,
  because zooming reaches the levels that do divide evenly. It reads as a
  rendering fault and it is arithmetic.

The flat map, unlike the globe, **never runs out**: 160 columns of 512 pixels is
82,000 across the world where the deepest zoom asks for about 23,000. The
pictures outlast the zoom rather than the other way round.

Two things left open, both seen rather than guessed at:

- **The globe's coarse borders drift from the ground at depth.** The 1:50m
  outlines drawn over sharp imagery are visibly in the wrong place when you go
  right in: on Esri, New Caledonia's ran across the island rather than round it.
  The fine shapes exist (`shapes.features`) and are what the flat map draws;
  they're kept off the globe because 242 of them at full detail is a slideshow.
  Much less pressing on NASA, whose floor is shallower than the point where the
  outlines embarrass themselves — but it is the trade to revisit if the imagery
  ever gets deeper.
- **The answer pin doesn't shrink.** `pointRadius` is in globe-radius units, so
  the green disc that looks right at reveal altitude swallows the city once you
  zoom past it. Pre-existing, and invisible until deep zoom was worth doing.

### The bench, when one is next wanted

There isn't one on the shelf. `Game Maker's Scrapbook` — a copy of City Spotter
that the tiled maps above were tried on before they went near a real game — came
down once they graduated, which is the rule benches live by: a copy of a game
kept past the question it was built to answer collects dust and confusion in
equal measure. It is `src/modes/CityScrapbook.tsx` at **`4d95689`**, and
`git show 4d95689 -- src/modes/CityScrapbook.tsx` brings it back.

Build the next one the same way, and the reasons are worth repeating:

- **Never a `ModeId`** — a flag in `App.tsx` and nothing else. A `ModeId` enters
  the daily rota, needs a letter in a duel code and a re-run of `schema.sql`,
  and an experiment is the last thing to hand somebody as their round of the day.
- **Nothing on it is scored anywhere**: pass it no `match`, so there's no clock,
  no seeded deal and no leaderboard to file to.
- **Give it the games' setup screen** where what's being tried touches the map —
  that's what `GameCard` is for, and it's why `ModeSetup` takes a card and not a
  mode id.
- **What graduates replaces**, rather than standing beside what it replaced.

### The last card: coming soon

`Export Spotter`, on the end of the shelf in `AllGames`. A `div` rather than a
`button` and dimmed by `.mode-card.is-coming`: there is nothing behind it, and a
card that takes the press and does nothing reads as a broken game rather than an
unfinished one. It is not a `ModeId` and nothing in `match.ts`, `duel.ts` or the
database knows it exists — when it is built, it becomes one, and that means a
row in the table above, a unique mode letter, and a re-run of `schema.sql`.

---

## Scoring

Every round is out of **100** (`MAX_ROUND_SCORE`), and a finished game is the
**average** of its rounds, not the total — so 78 means the same thing however
many rounds were played. `finalScore` in `src/lib/geo.ts`.

**Every game is five rounds.** The setup screen used to offer ten as well;
`settings.rounds` is still the knob and modes still read it, but nothing sets it
to anything but 5 any more, so a score off the shelf and a score from a duel are
the same measurement.

**All four curves are Gaussian**: `100 · exp(−(off/scale)²)`, not a plain decay.
This is deliberate and shared, and it is the single most important thing to
preserve when touching scoring. A plain decay falls hardest at the very first
step away from the answer, which charges the player who was nearly right at the
rate of one who wasn't. Squared, the curve leaves full marks slowly and then
drops away — at a fifth of the scale it's still 96, at half 78, and at twice the
scale it's 2 rather than 14.

| Curve | Where | Scale | Reads as |
|---|---|---|---|
| Distance | `scoreFromDistance`, `geo.ts` | 2000 km (all four world modes) | 500 km → 94, 1,200 km → 70, 3,000 km → 11 |
| Population ratio | `PopulationGuesser.tsx` | 2 (natural logs), out of 95 | ×1.5 → 91, ×2 → 84, ×5 → 50, ×10 → 25 |
| Tube stops | `scoreFromStops`, `data/tube.ts` | 6 stops | 1 stop → 97, 4 → 64, 12 → 2 |
| Clock gap | `scoreFromClockGap`, `data/timeZones.ts` | 3 half-hours | 1 h → 64, 2 h → 17, 3 h → 2 |

The tube's *stops* are the ride or the crowding of the clicked station's circle,
whichever is fewer — `markNearby` in `data/tubeNearby.ts` decides which, and the
curve above marks whatever comes out of it.

Population is the one curve **not** marked out of 100: a country that isn't the
answer is marked out of `NEAR_COUNTRY_MAX` (95), so the last five points belong
to picking the right country and nothing else. Marked out of 100 the curve
handed a full hundred — the game's word for "you found it" — to any country
within a few per cent of the answer's population, which is a miss, and the panel
then congratulated it as a hit. Full marks still come from `hitTest` alone.

The clock game is tuned **tighter** than the rest on purpose — there are only
thirty-five answers in the world and forty-six countries share the busiest one,
so being roughly right is much easier there than it is anywhere else.

### The match clock

**Duels only** — `matchOptions` hands out `roundLimitMs` and `adjustScore` when
`kind === "room"` and withholds both otherwise. A room cannot do without a
clock, because its rounds turn over on everyone's screen at once and so have to
end at a moment rather than when the player is ready. Today's round is played
alone whenever it suits you, so it has no clock, no `MATCH_ROUND_MS` limit and
no speed penalty: nothing is on screen counting down, and the mark is the guess.

In a duel, `matchPoints` in `src/lib/match.ts`: the first `MATCH_GRACE_MS`
(10 s) of a round are free, after which sitting on it costs up to
`SPEED_PENALTY` (30%) of what the guess was worth. Taken **off** the accuracy
rather than added on, so a duel is marked out of the same 100 as everything
else, and a fast wrong answer still loses to a slow right one.

A daily result is still filed with the milliseconds it took, and `rankResults`
still settles level scores on them. It just isn't shown anywhere: `Standings`
draws its Time column only when passed `timed`, which only `RoomResult` does.

**`ms` means two different things**, and the column heading is the giveaway.
On a daily result it is the whole game. On a `RoomStanding` it is the player's
**average round** — `fetchRoomBoard` divides by the rounds they have filed,
because a room table is read mid-match, where a total says more about how far
somebody has got than about how long they take. The room's ranking settles
level scores on that average.

`RoundResult` keeps `accuracy` (the guess alone) and `score` (once timed)
separately, and the result panel shows the subtraction. A player who pointed
straight at the place and was handed 70 has been marked on two things and must
be told about both.

---

## Playing other people

Two contests, one home-page door each, and the difference between them is only
where the code comes from — see `src/lib/match.ts`.

**Today's Round** (`kind: "daily"`, code letter `D`). The code is *worked out*
from the game and the local calendar date, so it is never handed around: anyone
who opens today's game is already on it. One game a day for the whole world,
chosen by `gameOfDay` — a shuffled permutation of all seven per block of seven
days, so every game gets exactly one day in seven and none can turn up twice in
a week. No clock on a round — see above. Needs no server to work; falls back to
a device-local table.

### One go a device

Two layers, and they are locks on different things — which is the whole of why
both are needed:

- **`playedOnThisDevice`** (`matchHistory.ts`, read by `checkEntry`) — has *this
  browser* finished today's code, under **any** name. Answered from
  localStorage, so no network is involved and pulling the plug is not a way
  round it.
- **The unique index on `(code, lower(btrim(player)))`** — has this *name*
  already been filed for today, by anybody in the world. Postgres refuses the
  second row, so it holds across devices.

The first used to ask about the name as well, and that was the hole: typing
something else was a fresh go at a table the whole world is on, and nothing but
manners stopped it. Keyed on the device it takes a private window to get past.

**Be honest about the ceiling.** No web page can identify a device — everything
a browser stores, a browser can drop. A private window, a second browser or
"clear site data" all buy another go, and a `device` column in Postgres would
not change that, since the ID it keyed on would live in the same localStorage
the private window doesn't have. The only version that actually holds is
accounts, which is what GeoGuessr's daily challenge does and what this would
need to become if the table ever matters that much. Wordle gets away with
storing state in the browser and nothing else because it has **no leaderboard** —
cheating it only cheats you. This game has a table, so it is one notch tighter,
and that notch is all it is.

**What it costs, knowingly:** the shared laptop. One household tablet is one go
at today's round, whoever picks it up. So the block is written for a person who
may not be the one who played — `Leaderboard`'s locked line says "This device
has already played", never "you have" — and `HeadToHead` puts All Games and Duel
a Friend under the table, since neither is rationed by the day. That offer only
appears under a table the player was *sent* to, never one they asked to see.

**Duel a Friend** (`kind: "room"`, code letter `V`). A drawn code, a lobby, and
a moment when it starts. That moment is the only thing that travels — after it,
every device works out which round should be on screen from the shared clock, so
there is no connection to lose. Rooms need Supabase outright. The code is also a
link while the room is open — see "The invite link" above, which is where the
rule that shuts it is written down.

**A room takes its players before it starts, and never during.** Pressing start
shuts the code: `PlayFriend`'s join screen refuses anything whose `roomPhase`
isn't `waiting`, and the insert policy on `duel_players` refuses it again in the
database, because the join screen is working from a room it fetched up to a poll
and a half ago. This is not tidiness — a round only closes early once *everyone
in the room* has filed it (`fetchRoomBoard`), so a player who arrives at round
three is two rounds nobody can close, and the rest of the room sits out the full
thirty seconds of every remaining round waiting on answers that aren't coming.
The one way back in is `joinedHere` in `duel.ts`: a name this device already
holds for that code is a locked phone or a reloaded tab, and it goes straight to
the round in progress without inserting anything.

Code layout is `[mode letter][kind letter][5 chars]`. Mode letters: `C` city,
`F` flag, `M` currency, `H` company, `P` population, `T` tube, `Z` timezone.
**Adding a game means adding a letter here**, and it must be unique. It also
means a path in `useRoute.ts` — see "The URLs" above.

The room clock is the *server's*, not the device's: `serverNow()` in
`supabase.ts` corrects the local clock using the `Date` header on every reply.
Two phones a minute apart would otherwise be a minute's head start. Round times
are rounded to whole milliseconds before filing — the column is an integer, and
a round timed at 3716.5 ms was once refused outright, silently costing the
player their score and the room its round closing.

---

## Supabase

Four tables — `match_results`, `duel_rooms`, `duel_players`, `duel_scores` —
defined in `supabase/schema.sql`. The anon key is public by design; the policies
are what protect the data. Nothing can update or delete a filed score, which is
what makes it final.

**The trap, and it has bitten already:** `schema.sql` is applied *by hand* in
the Supabase SQL Editor. Nothing runs it for you, so the live database drifts
behind the repo the moment the file changes. `duel_rooms.mode` carries a CHECK
listing every game, so a database set up before a game was added refuses rooms
for that game — from inside Postgres, before the app sees anything. Time Zone
Spotter was unplayable as a duel for exactly this reason.

So: **after adding a mode, re-run `supabase/schema.sql` against the live
project.** It is written to be safe to re-run, and it drops and re-adds the mode
CHECK precisely so that re-running fixes drift.

The same goes for the policies, which is the other thing in that file that
changes. `duel_players` has its own insert policy — a room that has started
takes no more names — where `duel_rooms` and `duel_scores` share the open one.
Until the file is re-run, a live project keeps whatever it was last given, and
the door is only shut on the join screen.

`roomProblem` in `src/lib/duel.ts` now separates the three ways a room screen
can fail — refused by the server, given up on by us, never answered — because
reporting all three as "check your connection" is what let the above go
unnoticed. Keep that distinction if you touch the error handling.

Also note `.env` is gitignored, so setting the variables locally does **not**
set them for anyone you send a code to; the host needs them too, for Preview as
well as Production. README has the details.

---

## Conventions

- **Comments explain the decision, not the mechanism.** The house style is prose
  that says why a thing is the way it is and what the alternative got wrong.
  Match it. A comment restating the code is worse than none.
- **British spelling** in user-facing copy and comments.
- **Names say what a thing is for**, not what type it is.
- The results table in `GameFrame` must stay a real `<table>`. It was a header
  `div` over an `<ol>` once — two grids sized to their own contents — and every
  heading sat a column out from what it described. It also **sizes itself to
  its contents and centres itself on the page** rather than filling the panel
  around it: no fixed panel width holds a row like "3 hours out (United States
  of America, UTC−6)", and fitted to one, cells split over two lines. That it
  can end up wider than its parent is why it's centred with `left`/`transform`
  — auto margins give up and align left the moment a box outgrows its
  container.
- Accessors handed to `GlobeMap` (`polygonCap`, `polygonStroke`,
  `polygonAltitude`) and the arrays behind them **must keep their identity
  between renders**. The globe re-styles all 242 countries whenever it is handed
  a new one, and something as ordinary as the pointer crossing a coastline
  re-renders the component. Written inline, they stamp all over the reveal
  flight.

### Browser automation, when checking work

The flat map takes synthetic clicks fine. The **globe does not** — its WebGL
canvas raycasts from real pointer events, so automated clicks land nowhere.
Verify globe-specific work by hand, or check it on the flat map and read the
globe path. The globe's **zoom buttons are ordinary DOM**, so zoom behaviour can
be driven and screenshotted even though clicks on the world can't.

**The trap, and it wasted most of a session:** `npm run dev` does not fail when
5173 is taken — it says "Port 5173 is in use, trying another one…" in among its
startup lines and quietly serves the new code on 5176, while the browser at 5173
carries on being served by a **previous** dev server that is still alive. Every
observation is then of stale code, and the change under test looks like it did
nothing. Worse, stopping a background `npm run dev` doesn't reliably kill the
vite child, so these accumulate across a session. So: **read the port off the
dev server's own output before trusting a screenshot**, and if anything looks
impossibly unchanged, check for strays —
`Get-CimInstance Win32_Process -Filter "Name = 'node.exe'"` — and kill the lot
before starting one.

Related, and the reason a reload is not optional: **hot reload has not been
applying edits here**. A page loaded before a change keeps running the old
module however long you wait, so reload the page after every edit rather than
watching for it to update itself.

---

## Keeping this file current

**Update this file as part of any structural change, without being asked.** It
is the first thing read in a new session, and a stale line here costs more than
no line at all — it sends the next session confidently in the wrong direction.

Treat it as part of the change, in the same commit, whenever you:

- **add, remove or rename a game** — the table, the mode letter, the scoring
  row, and the reminder to re-run `schema.sql`;
- **change a scoring curve, scale or constant** — the numbers in the scoring
  tables are quoted, so they go stale silently;
- **change the database schema**, the tables, or how failures are reported;
- **add or change a shared abstraction** — a `useGame` option, a `GameFrame`
  prop, a new map, a new file under `lib/`;
- **change how matches, rooms, codes or the daily rota work**;
- **learn something the hard way** — a trap, a footgun, a thing that looked
  broken and wasn't. Those are the highest-value lines in this file. The
  schema-drift section exists because a whole debugging session was spent
  looking at a network that was fine.

Not for ordinary work: a fixed bug, a copy tweak, a new city in the pool, a
refactor that leaves the shape unchanged. If someone reading this file would
have been *misled* by not knowing, write it down; otherwise leave it.

When you do change something documented here, check the surrounding claims too
rather than only the line you came for — counts, constants and cross-references
drift together.
