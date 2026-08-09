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
- **`seed`** — deal deterministically. This is the whole of how two devices play
  the same rounds without talking to each other. Seeded games deliberately skip
  the "recently seen" memory, which differs per device.

### The maps

Three of them, all satisfying `GuessMapProps` in `src/components/mapTypes.ts`:

- **`WorldMap.tsx`** — flat, plate carrée, `react-simple-maps` + `d3-geo` over a
  satellite texture.
- **`GlobeMap.tsx`** — `react-globe.gl` (three.js). Draws from a **coarsened**
  copy of the country shapes; at full 1:50m detail the globe is a slideshow.
  Never score against the coarse copy.
- **`LondonMap.tsx`** — bespoke SVG of the tube network.

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

## The seven games

| Game | `ModeId` | Question | Marked on |
|---|---|---|---|
| City Spotter | `city` | Name of a city | Distance to it, 50 km free |
| Flag Spotter | `flag` | A flag | Right country, else distance |
| Currency Spotter | `currency` | Code + symbol | Any country that spends it, else distance |
| Corporate HQ Spotter | `company` | A company logo | Right country, else distance |
| Population Spotter | `population` | A population figure | Ratio of populations — **not** distance |
| Tube Station Spotter | `tube` | A station name | Stops between, **not** metres |
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
  than a distance.
- **Time zone** must read a *live* clock (`serverNow`, ticking every second) —
  the answer can't be a screenshot of a minute that has passed. Countries that
  keep several clocks are cut into pieces (`src/lib/zoneShapes.ts`), so a press
  on Perth answers Perth's clock and not Sydney's, and the reveal says so: "in
  the part you clicked". **Not quite every one of them is cut** — the pieces
  file holds 20 countries and Ukraine keeps two clocks without being in it, so
  the "several clocks, no parts" path is real code and not just the
  failed-download case. There the round is marked against whichever of the
  country's clocks came closest, and the reveal names that same one; a sentence
  quoting a clock the score didn't use is a panel arguing with itself.
- **Tube** treats whichever station's patch of the map you clicked as your
  answer, and charges you the ride from there.

---

## Scoring

Every round is out of **100** (`MAX_ROUND_SCORE`), and a finished game is the
**average** of its rounds, not the total — so 78 means the same thing whether
the game was five rounds or ten. `finalScore` in `src/lib/geo.ts`.

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
| Population ratio | `PopulationGuesser.tsx` | 2 (natural logs) | ×2 → 89, ×5 → 52, ×10 → 27 |
| Tube stops | `scoreFromStops`, `data/tube.ts` | 6 stops | 1 stop → 97, 4 → 64, 12 → 2 |
| Clock gap | `scoreFromClockGap`, `data/timeZones.ts` | 3 half-hours | 1 h → 64, 2 h → 17, 3 h → 2 |

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

Two contests behind one menu door, and the difference is only where the code
comes from — see `src/lib/match.ts`.

**Today's Round** (`kind: "daily"`, code letter `D`). The code is *worked out*
from the game and the local calendar date, so it is never handed around: anyone
who opens today's game is already on it. One game a day for the whole world,
chosen by `gameOfDay` — a shuffled permutation of all seven per block of seven
days, so every game gets exactly one day in seven and none can turn up twice in
a week. No clock on a round — see above. Needs no server to work; falls back to
a device-local table.

**Duel a Friend** (`kind: "room"`, code letter `V`). A drawn code, a lobby, and
a moment when it starts. That moment is the only thing that travels — after it,
every device works out which round should be on screen from the shared clock, so
there is no connection to lose. Rooms need Supabase outright.

Code layout is `[mode letter][kind letter][5 chars]`. Mode letters: `C` city,
`F` flag, `M` currency, `H` company, `P` population, `T` tube, `Z` timezone.
**Adding a game means adding a letter here**, and it must be unique.

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
  heading sat a column out from what it described.
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
globe path.

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
