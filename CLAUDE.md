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

### The hint, and the cross on it

The pill along the bottom of every round — "Click the map to place your
guess.", or whatever the mode's `hint` says — **can be closed**, and stays
closed for the rest of the game rather than coming back at the next question.
It is a reminder, not a control: somebody who has dismissed it has read it, and
reprinting it every round is the game insisting. The reason it needs a cross at
all is the phone, where the pill lies across the bottom of the map and the map
is the thing being asked about — that is a real share of the world taken up by
a sentence already read. `hintClosed` in `GameFrame`, and `.hint-close`.

The cross is only ever drawn over the hint proper. "Getting your bearings…",
which stands in the same pill while the globe falls, is a state the game is in
rather than something being said to the player, and it takes itself off screen
a moment later; a cross on it offers to close something already closing.

### The arrival: `INTRO_MS`, and why a duel can afford it

**A game on the 3D globe waits five seconds before its first round opens** —
once a game, never between rounds. Press Start and the map is on screen before
its imagery is, so a round used to open on an empty rectangle or a world that
appeared a moment after the question. The pause covers that, there is a fall
through space to watch while it passes (`globeFlight.ts`), and the bar at the
top says nothing at all — see "The empty bar" below, which is where the last of
the jolt turned out to be hiding.

**Only the globe.** The flat map and the tube map are drawn by the time the
round opens, so a countdown in front of them is five seconds of nothing: they
begin the moment you press Start, exactly as they always did. `intro` on
`useGame` says which, and **defaults to true** so that a game added without a
thought about it gets the right answer — the globe is the default map, and the
two that don't want it say so.

`INTRO_MS` lives in `useGame.ts`, which owns when a round begins. It used to
have to be a whole number of seconds because it was counted out loud, and that
constraint went with the countdown — it stays a round number because nothing
now wants it otherwise. **Five rather than three**, because the distance covered and the time to
cover it are one knob: the same fall in less time is the same fall hurried, and
the honest measure of the two together is the rate the world swells at, which
is `ln(start / end) / ms` and nothing else. Ten radii over three seconds was
5.4 parts in ten thousand a millisecond; twelve over five is 3.6, a third
slower, and the last second of it is nearly still — which is where an arrival
is judged.

**What was making it look broken, and it wasn't the easing.** Building the
globe's 242 country outlines is **about three seconds** of geometry on the main
thread when a globe game starts — production build, warm, not just in dev — and
it was landing on exactly the seconds the fall needed. The camera froze at the
top and jumped most of the way down when the thread came back, which is what
"messy at the start and a jerk at the end" actually was. No easing can help
where there are no frames to ease.

The fix is `src/lib/polygonFeed.ts`: **the outlines are handed to the globe a
slice at a time**, and the slice size is measured rather than guessed — the gap
between frames is timed, and the slice halves when the last one cost more than
about a frame and a half and doubles when it cost little. It costs nothing,
because three-globe's polygon layer is a data join keyed on the feature: a
country already in the scene keeps its geometry, so slicing builds each country
exactly once, in the same total time, with the browser free to draw in between.
The freeze becomes a fall.

Both tidier fixes are worse and were tried. Holding the outlines back until the
fall lands moves the freeze to the moment the round opens, which in a duel is
answering time. Coarsening them further costs accuracy in the one place the
globe is already known to drift from the ground.

### The empty bar, and the jolt that was never the camera

**Nothing is shown in the prompt until the round actually opens**, and the box
it would fill keeps its full depth while it is empty
(`.game-topbar .prompt`, `min-height: 58px`, which is a flag — the tallest
question there is). `GameFrame` gates the prompt on `startingInMs === null`.

This is the fix for the last of the "weird jerk at the end", and the cause was
nothing to do with the fall. The bar used to print **"Starting in 3, 2, 1"** in
the corner the round clock uses — a *third* line in a two-line corner, so the
bar stood a line taller for the whole arrival and snapped back as the round
opened. The map is everything below the bar, so the bar losing a line shoved
the whole world up by twenty-odd pixels at the exact instant the camera was
landing. Three passes at the easing could never have touched it. **When
something in a round looks like an animation fault, measure the bar before
blaming the camera.**

The countdown is gone rather than moved. What it was telling the player is said
by "Getting your bearings…" under the map, which costs the bar no depth at all.

Two more things follow, and both are better than the reason they were done for:

- **The question can't be read before it can be answered.** A flag on screen
  during a fall that refuses clicks is a question asked and then not taken —
  the player decides their answer and sits on it for five seconds.
- **`startingInMs` is correct on the very first render**, not a tick later:
  `useGame` gives it a lazy initialiser rather than starting it at null. Null
  for one frame is one frame with the flag on screen.
- **Every game's bar is now the same depth.** It used to follow whichever
  question that game asks, so the map's top edge sat somewhere different in
  City Spotter than in Flag Spotter.

**Three smaller things the arrival is also made of**, and all worth keeping:

- **The camera is stood at the top of the fall synchronously, in
  `handleReady`** — `flightStart()` in `globeFlight.ts` — and not in the effect
  that flies it. An effect runs after the browser has painted and the globe
  draws on a loop of its own besides, so there were frames of react-globe.gl's
  own default view, a half-size Earth over the Gulf of Guinea, which then leapt
  out to a marble as the fall took over.
- **The fall is eased by smootherstep**, `t³(6t²−15t+10)`, which is the quintic
  with a zero *second* derivative at each end as well as a zero first. A cubic
  ease-in-out leaves no speed at the ends but still arrives with acceleration
  on, and a sudden change in acceleration reads as a jolt however slowly the
  thing is moving by then. That was the stop that could still be felt at the
  bottom.
- **There is a sea under the tiles** — `src/lib/globeGround.ts`, one unlit
  sphere at 0.998 of the radius, invisible to the raycaster so it cannot
  swallow a click. Given a tile engine, three-globe hides the photographed
  sphere outright, so until the first squares came back there was no Earth in
  the scene at all: a ring of atmosphere round nothing, filling in square by
  square. It stays for the whole game, so a gap when the zoom crosses a tile
  level shows sea rather than a hole through the planet.

**A duel has none of this**, and that is a decision rather than an oversight.
A room's rounds are worked out by arithmetic from `match.startAt` — every
device decides which round is on screen from the room's clock, which is why a
duel needs no connection once it has begun. A *local* pause therefore cannot
hold that clock: it would simply cost that player five seconds of a
thirty-second round, and only the player whose tiles were slow. It **can** be
afforded by moving the room's whole start back by the same constant, which was
built and worked; it came out again because it bought a nicety at the price of
the most delicate arithmetic in the app, where a mistake means one player
counting down while the rest are already answering. `matchOptions` passes
`intro: false` for a room and leaves `startAt` alone.

Today's round keeps the arrival: it has no timetable to disturb. It also now
has the draw in front of it, which is up to nine seconds of the world being
fetched and built behind a screen the player is reading — see "The way in". That is the
other half of why the arrival is worth five seconds there.

**The trap in that one line:** it is spread in only when false, never as
`intro: undefined`. `matchOptions` is spread *over* the mode's own `intro`, and
a key that is present and undefined still wins — it would take the option's
default of true and switch the arrival on for the flat map, which has nothing
to arrive from.

Two things follow, both load-bearing:

- **The fall takes however much of the intro is left, not a fixed five
  seconds.** A globe costs a second or two to build before it can animate
  anything, and a fixed fall started from there was still falling after the
  countdown had finished — the world rushing past while the clock ran. So
  `GuessMapProps.arriveAt` carries the *moment* the round opens and the map
  lands on it. Under `MIN_FLIGHT_MS` (400 ms) left, there is no fall at all,
  which is also how "every round after the first" is expressed: `arriveAt` is
  long past. The half-second fade on `.globe-wrap.is-arriving` is hung off the
  same test, which is why a duel never fades.
- **`submitGuess` refuses anything before that moment**, read off the stored
  timestamp rather than off the countdown's state so it can't be a render
  behind. Otherwise a click during the fall would be marked — and in a room,
  marked against a round that hadn't begun.



### The maps

Three of them, all satisfying `GuessMapProps` in `src/components/mapTypes.ts`:

- **`WorldMap.tsx`** — flat, plate carrée, `react-simple-maps` + `d3-geo`. Draws
  `WORLD_TILES` over the satellite texture, which is **served from this site**
  (`public/earth-blue-marble.jpg`, `src/lib/textures.ts`) rather than hotlinked
  from a package CDN. It is copied from `node_modules/three-globe` rather than
  imported: that package's `exports` field refuses deep imports, so Vite cannot
  reach `example/img` to bundle it. Nothing is owed for it beyond the NASA line
  the maps already print.
- **`GlobeMap.tsx`** — `react-globe.gl` (three.js). Draws from a **coarsened**
  copy of the country shapes; at full 1:50m detail the globe is a slideshow.
  Never score against the coarse copy. Skinned in `WORLD_TILES`, which also sets
  how close the camera may get. Wears the sky from `src/lib/globeSky.ts` — see
  below — and stands on the sea from `src/lib/globeGround.ts`. Its outlines are
  fed in by `src/lib/polygonFeed.ts` rather than handed over whole; both of
  those are explained under "The arrival".
- **`LondonMap.tsx`** — bespoke SVG of the tube network. **Its Thames is
  traced, not drawn** — `src/data/thames.ts`, by `tools/gen-thames.mjs`. The
  trap it fixes is worth keeping: the map draws the borough outlines *and* a
  river, London's borough boundaries run down the middle of the Thames, and the
  river was 29 points typed from memory. So the map drew the same river twice,
  in two places, about half a kilometre apart — 16 of those 29 points sat on
  dry land. The fix is that the boundary file the map already uses has a
  **full-extent** edition where the boroughs meet mid-water rather than stopping
  at the bank: Tower Hamlets and Southwark share 742 vertices along it, and
  those vertices *are* the river. Same ONS source, same licence. **A second
  trap inside the first:** the shared stretches must be chained by whichever
  loose end is nearest, not sorted west to east — the Thames loops round the
  Isle of Dogs, so neighbours in longitude can be miles apart on the water, and
  sorting drew a 12 km bar across London. It comes out as several polylines
  rather than one, because the boroughs meet mid-river in most places and not
  quite all, and one line would have to invent the joins. Takes an optional
  `data` bundle (`TubeData` in `src/data/tubeSources.ts`) so the bench can hand
  it a different network; defaults to `SHIPPED_TUBE`, so the game is unchanged.
  Its two big `useMemo`s now depend on that data — the projection is *fitted to
  the stations it holds*, so an empty dependency array there would draw one
  network through another's frame. Also takes `rings` —
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

### The sky: `src/lib/globeSky.ts`

A few thousand stars behind the globe, hung on the scene by `GlobeMap` and
taken down again when the round's map goes. `addSky` returns its own teardown.

**Why it can exist at all is the point.** The stars stand *beside* the globe
rather than being paint on its surface, so they don't care that the surface is
made of tiles — and a tiled surface can take nothing from a material:
three-slippy-map-globe builds every tile as a `MeshLambertMaterial`, which has
no specular term, and three-globe hides the photographed sphere (the Phong one,
which does) the moment a tile URL is set. **A shine on the ocean or relief on
the mountains is therefore impossible on this globe, permanently**, and no
amount of material work will get it.

**The stars are drawn, not downloaded.** `makeStars` scatters 2,200 points on a
sphere of radius 3,000. A starfield photograph is most of a megabyte, the one
every three.js example reaches for travels with no licence at all, and
stretched across the whole sky it is soft where fixed-size points stay crisp.

**There was a cloud layer and it has gone.** NASA's Blue Marble composite is a
real day's weather over the whole planet, far heavier than the tidy wisps a
globe usually wears: even thinned right down it laid haze over the coastlines
the game is asking about, and in a game whose answer *is* a coastline that had
stopped being decoration. It also cost 830 KB on every visit. It was judged on
the bench with and without, and without won — so `public/earth-clouds.jpg`, the
`CLOUD_TEXTURE` constant and the credit line for it are all gone. If clouds are
ever wanted again, they come back on a lighter image and with that trade
re-argued.

**The highlights are nearly opaque, and that is a fix rather than a taste.**
They were a 35–50% wash over the satellite imagery, which reads as one colour
on a country the size of Belgium and falls apart on a big one: the same red
over Siberian snow is bright pink and over dark taiga is muddy brown, so a
highlighted Russia looked **blotchy — as though the fill had failed in
patches**. It had not. One path, 101 subpaths, no holes; the ground underneath
simply changes. At about 0.73 the terrain still shows as texture and the colour
is what the eye reads, which is the whole job of a highlight: to say *this*
country at a glance, wherever it is. The values live in `WorldMap`'s `theme`
and `GlobeMap`'s `TONE_CAP`, and they should move together.

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

**The front door is today's round, and it draws it.** Land on `/` and the
seven games are laid out with a light going round them; it slows, stops on
today's, the other six fade back, the name is printed under the shelf, and
*then* the world is flown to. No name to type and no card to press — the only
thing between arriving and playing is being told what is being played.

It used to deal on sight, straight into the fall through space, with the name
of the game going past in the corner of a round that had already begun. That is
the one thing about today's round worth a moment of its own: it is a different
game every day, and a player dropped onto the globe without being told which
never learns that. `GameFrame` still prints "Today's Round: Currency Spotter"
where the title goes, and it is now the second time they are told rather than
the first.

**The draw is theatre and says so.** `gameOfDay` settled today's game for the
whole world from the date, days ago, and nothing on this screen gets a vote —
`drawPlan` in `HeadToHead.tsx` builds a list of hops that ends on the answer.
Two rules make it read as a stop rather than a cut: the light never lands on
the same card twice running, and the hop before the last is never today's game,
so the landing is always a move the eye can follow. The holds grow as a cube,
so the last is ten times the first, and they are **scaled to `DRAW_MS` rather
than added up** — the draw is the same length on every device and however many
hops it is next tuned to. **The draw is three beats, the middle one is the point, and the last one says
nothing.** `DRAW_MS` (5.5 s) over `HOPS` (14) is the light going round, and the
two are one knob: hops over time is the rate the light travels at. Twenty-four
hops in four seconds was a fifty-millisecond flicker to begin with, which reads
as the page glitching rather than as a wheel spinning — a first-time player
could not work out what was being done to them before it was over. Fourteen
over five and a half seconds is still twice round the shelf, at a pace the eye
can follow every step of: an eighth of a second at the start, a little over a
second and a quarter at the end. **Nothing is said under the shelf while it goes round**
— a line under a shelf that is still deciding is a line nobody reads, because
the eye is on the movement, and a standing "Today's game is…" made the answer
feel already given rather than arriving. There is **nothing under the heading
either**: "One game a day, and the day picks it" was the rule being explained
in words above a shelf in the middle of demonstrating it, at the one moment the
eye should be on the light.
`READ_MS` (2.6 s) is the beat nothing moves in: the light has stopped, the six
it isn't have gone quiet, the name is printed **with the game's own `blurb`
under it**, and the player is left alone with the two long enough to actually
read them. The blurb is the same sentence the shelf prints in `AllGames`, out
of the one `GameCard` — a name alone answers only somebody who already knows
the seven, and this screen exists for the player who doesn't; without it they
meet the rules for the first time inside the round. Its box keeps the depth of
the longest of the seven, which is two lines, so the answer arriving doesn't
shove the shelf up the page — `SEEN_READ_MS` (2 s) where the device
has already had today's draw, which is a name being confirmed rather than
announced. Shortened but never dropped: a player reloads for a reason, and may
never have got as far as reading it. `LEAVE_MS` (0.7 s) is the screen
fading out **still showing that same answer**, while the globe behind it fades
in on its own (`.globe-wrap.is-arriving`), so the two read as one handover
rather than a cut.

**One line on that screen and nothing under it**, and both of the things that
were there have been tried and removed. "Let's begin" over the fade was a
second thing to read at the moment the first was being taken away, and it
pushed the name of the game off screen to make room for a line carrying no
news — faded out under its own answer, the last thing the player sees is the
thing they are about to play. "Five rounds, the same five as everyone else
today" was true, is said on the round itself anyway, and read as small print
beneath the one thing the screen exists to say.

Cut straight from the last hop to the globe and the name is on screen for a
tenth of a second, which is the same as not showing it — that was the first
version and it was too fast to land.

**The light is shown once a day a device**, which is what its seconds are
affordable out of. The draw teaches exactly one thing — *this is a different
game every day, and here is today's* — and once that has been taught it is a
wait rather than an explanation. Sharpest on a reload before playing, where the
player watches a wheel decide something they were told a moment ago. So
`SEEN_KEY` (`spoton.draw.v2`, and therefore **on the privacy page**) holds the
`localDay` the draw was last watched on, and a device whose day is today —
along with anybody who asked for reduced motion — is dropped at the last two
beats, where the game is still named and held.

**The day is stored rather than a flag**, and that is what makes this a day's
worth of memory rather than a device's: what the draw announces *is* the day's
news, so it is owed again when the news changes, and a device that watched it
last week has not been told about today. The turnover is `localDay`, the same
notion of today `dailyCode` is built from, so the draw and the round it opens
can never disagree about which day it is. Filed on arrival rather than on the
deal, so a reload halfway through the light counts as having watched it; a
device sent home unplayed never reaches that effect and so is still owed the
draw.

**The shorter read beat hangs off having been told, not off skipping.** A
player who asked for reduced motion skips the light but is being told today's
game for the first time, and that beat is the whole of the screen for them, so
they keep the full `READ_MS`. Only a device that genuinely had the draw today
gets `SEEN_READ_MS`.

**It also pays for itself.** `loadWorldShapes()` runs while the light goes
round — a megabyte of Natural Earth to download, parse, coarsen and index,
which on the first frame of a round used to swallow the count-in whole. Every
game off the shelf has a setup screen to do that behind; today's round had
nothing, because it dealt on arrival. Now it has this, which is why the arrival
after it is worth five seconds. See "The arrival". A device taking the shortcut
above still gets `READ_MS` + `LEAVE_MS` of it, which is the other reason the
shortcut stops at the last two beats rather than dealing outright.

A device that has already had its go is sent home before the draw rather than
after it: nine seconds of ceremony in front of "you have already played" is
nine seconds of being told nothing.

**The name is asked for at the end**, in `MatchResult`, where there is a score
to put it to. Two things follow that are better than they sound: a player who
starts and wanders off is never asked to name themselves for a game they didn't
finish, and nobody types anything before knowing whether it was worth typing.
The box is seeded with whatever this device last played under, so the regular is
one press from done, and the name-taken path that already existed handles a
collision — the score is made by then and cannot be lost by getting the name
wrong.

**Leaving today's round goes to `/home`, not back to `/`.** The front door
draws and deals on sight, so returning there would put the player straight back
into the game they just left. `toMenu` in `App` is where that is done.

**A device that has had its go is sent home from `/`, not to the table.** Being
shown the standings for a game you can't play, at the address that exists to
play it, reads as the site being broken. Home is a screen full of things you
*can* do — and its Today's Round card leads to `/leaderboard` instead of `/`
when the day is spent, so the table is reached by asking for it. There is
nothing under that table but the table: a refresh button, a line about the day
being rationed and a pair of buttons offering other games were three different
ways of saying "and now what?" beneath something somebody came to read, and the
bar across the top is where the way out lives.

The three doors moved to `/home`, and each of them is now one press away from
anywhere in its own right — they are named in the top bar. That page asks one question — **who are you playing** —
and answers it with three cards: `Today's Round`, `Duel a Friend`, and `All Games`. The games
themselves are behind the third of those, on a shelf that ends with whatever is
being built next. That card sits after the games rather than among them: it
isn't a game yet, and putting it in the row would offer it as one. Each card is three lines — the name, a `hook`
asking whether you fancy it, and a `blurb` saying what a round involves; eight
descriptions read as a list, where eight questions read as a dare. The shelf
used to *be* the home page, with the two contests tacked on as an eighth card;
seven games in front of the question answered it before it was asked, and the
contests read as two more games.

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

**Both live in `src/data/gameCards.ts`**, not in `App`, and the reason is a
second reader: the draw on Today's Round prints the `blurb` of whichever game
the day landed on, and `App` renders `HeadToHead`, so `HeadToHead` importing
from `App` would be a cycle. They are out of `lib/match` for a different
reason — `MATCH_MODES` there is the machinery a code is built from, and a
screen that wants the words shouldn't have to pull in the code format to get
them.

**A game's setup screen asks nothing any more.** It names the game, says what a
round involves, prints the small print where one is owed, and offers Start. The
globe-or-flat and borders-or-not it used to ask stood in front of all seven
games, in front of today's round and in front of a duel — the same two
questions, ten times over, answered the same way every time by anybody who had
a view. That is a **preference** wearing a decision's clothes, so it moved to a
screen of its own: `Settings`, reached from a **top-right button on the home
page and on every game's setup screen**, at `/settings`, and remembered in
`spoton.prefs.v1`
(`src/lib/preferences.ts`). **The defaults are the globe and no borders** — the
globe because it is the thing this game is, and no borders because the question
is where a place *is*, and an outlined world answers half of that before the
player has looked.

The button is on the setup screen as well as home because that is the last
moment before a round when changing the map still means anything, and it is
where somebody realises they want to — they can see which game they are about
to play. It is **not** on a round in progress: the map is drawn by then, and
swapping the globe for the flat map halfway through five questions changes the
thing a player is being marked on. Which screen sent you is `settingsFrom` in
`App`, held in state rather than in the path — `/settings` is one screen
however it was reached, and a path carrying its own origin would give the same
screen two addresses. A refresh loses it and lands on Home, which is the honest
answer to "where was I?" when the answer wasn't written down.

**A third setting is the tube map's alone**: white, which is the paper map
everyone has seen, or dark for a dark room. It is the tube's because the tube's
map is the only one the app *draws* — every other map is a photograph of the
Earth, and there is no dark version of a photograph, which is exactly why the
old app-wide day/night toggle came out. Only the **ground** changes; line
colours are how a Londoner reads that map at a glance. The one exception is the
Northern line, which is black and simply vanishes on a dark ground, so
`darkGroundColor` in `data/tube.ts` paints it white — and every colour reaching
the screen goes through that one call, so the map and its key can't disagree.
In a duel the tube's colours stay each player's own, unlike the world map:
white or dark decides how comfortable it is to look at, not what the question
is.

It lives in Settings rather than as a button on the tube map for the same
reason the other two moved there — it's a preference, not a decision about this
round — and the tube's own setup screen has Settings one press away in the bar
above it.

**The settings rows are label-left, options-right**, and small. Three stacked
blocks each announcing itself was a setup screen's layout carried over from
when choosing the map *was* the errand and the two cards were the page; on a
screen whose job is to be left again quickly, three rows of questions with
their answers beside them is what it actually is. The buttons came down with
it — 200px cards with a bold 17px title apiece read as the most important
thing on screen.

**The trap:** `.setup-row`, `.setup-label` and `.setup-options` are **also the
duel's game picker**, where the label stands over a grid of seven cards and
belongs on top. So the new layout is scoped to `.settings-panel`, a second
class on this screen's panel alone. Style the bare `.setup-*` classes and you
will find "Game" sitting in a 104px column beside eight game cards.

Two consequences worth knowing. `HeadToHead` and `PlayFriend` now *read* that
preference instead of asking; in a duel it is the **host's** that the room
plays on, which is the one setting in the app reaching past the device that
chose it, and the **lobby** is where that is said. It used to be said on the
settings screen too, under the three rows: a footnote about a screen the
player is not on, printed beneath the settings it qualifies rather than beside
the one it belongs to. And
`GameCard.ownMap` is gone — it existed to tell the setup screen it had nothing
to offer the tube, and the setup screen now offers nothing to anybody.

### The chrome: one bar, one colour, no arrows

**A top bar across every screen that isn't a round** — `SiteFooter`'s opposite
number, and drawn by the same `page()` wrapper. SpotOn on the left (the way
home, and just a label on the home page itself), **the parts of the site this
screen isn't** across the middle, and Settings on the right. All of them were
loose buttons before, in a different place on each screen; a thing that appears
everywhere belongs in the same place everywhere.

**Three grid cells, not flex with a spacer.** `1fr auto 1fr` centres the middle
cell on the **bar**; a spacer only centres it in the room left over beside the
wordmark, so the sections drifted whenever the right-hand side changed width or
went missing — which it does, on `/settings`. All three cells are rendered even
when two of them are empty, so the grid keeps its shape.

**`html { scrollbar-gutter: stable }`** belongs to the same argument, and is in
`index.css`. Without it everything centred slides about seven pixels between a
page that scrolls and one that doesn't — the bar's links, every heading and the
whole reading column together, which reads as the page settling after it has
loaded. Free here, because the reserved strip is the same black as the page.

**It offers the four sections rather than only a way back**: Home, Today's
Round, Duel, All Games. With Home alone, every journey between two parts of the
site went out through the front door — the table to the shelf was Home, then
All Games — and the home page's three cards were the only place the parts were
named together.

**The one you are on is shown but not offered** — marked in the accent colour
and rendered as a `span`, not a disabled button: there is nothing to press, and
a button that refuses a press says something different from a label that never
was one. **The home page shows none of them**: its three cards *are* the
sections, at full size with a line apiece saying what each is, so a strip
naming them again above is the same offer twice on one screen — and the
smaller, quieter copy at that.

Two things come of marking rather than hiding, and the second is the one worth
having. The group is always four wide, so it never moves — dropped, it was
three links on some screens and four on others, which centred put the same
"Home" at x=623 on All Games and x=568 on Privacy, 55px of travel on a link
that hadn't changed. And **absence is the weakest signal there is**: a bar that
omits where you are asks the reader to notice a gap and work out what filled
it, where a marked one simply says.

**What counts as "where you are" is the link's own destination** — a plain
`l.route.at === here`, not a map of which screen belongs to which section.
There was such a map, and **marking is what proved it wrong**: it folded a
game's setup screen into All Games, so City Spotter's setup screen announced
you were on the shelf — untrue, and it took away the one route the bar had back
to it. Hiding could carry that fudge because hiding claims almost nothing.
Marking makes a claim, and a claim has to be true. The rule is also simply
smaller: one comparison instead of a table to keep in step with the routes.

It pays off at the table too. On `/leaderboard` the daily link resolves to
`/leaderboard` for a device that has played, so it is marked; and to `/` for
one that hasn't, which leaves somebody who wandered onto today's table without
playing a live link to go and play. The map marked both alike and stranded the
second. That is a **section** and not a route,
because several screens sit inside one: `sectionOf` in `TopBar` folds the
leaderboard into today's round, and a game's setup screen and the bench into
All Games. Without that fold, a setup screen would offer All Games in the bar
next to its own Back, which goes to the same shelf — the same door twice, which
is a reader wondering how they differ. The reading pages and the settings
belong to no section and are offered all four.

**Today's Round in the bar leads to the table once the device has had its go**,
exactly as the home page's card does. `/` sends a spent device home, so offered
bare it would bounce the player straight back out — a door that reads as
broken.

Four labels plus the wordmark and Settings will not sit on one line on a phone,
so under 700px the sections **drop to a centred row of their own** beneath the
other two: a bar that grows a second line is honest where one that clips a
destination is not. `.top-bar-nav:empty` is hidden there, or the home page —
which has no sections — would carry an empty row's worth of bar.

It is **outside the reading column** so it runs the full width of the window,
which is why `#root` is now full width and the 1126px column moved down to
`.page-body`. A round renders neither, and takes the whole window as it always
did.

**A screen's own back button stays only where it means something the bar
doesn't already offer.** A game's setup screen returns to the shelf it was
picked off, the duel's steps back through its own screens without leaving, and
Settings reached from a setup screen goes back to it — those are not the bar's
job. What has gone is every button that only ever said **Home**: All Games,
Credits, Privacy, Settings-from-home and the duel's first screen each had one,
and a Home button under a bar with Home in it is the same door twice. The
`onBack` props behind them went with them.

**One palette, and it is dark.** The app used to carry two and let
`prefers-color-scheme` choose, so a player whose laptop was set to light got a
white page around a black globe. `--bg` is `#000` on `:root` with no media
query, `color-scheme: dark` so the browser draws scrollbars and form fields to
match, and `html, body` painted too — `:root` alone leaves the area past the
last element to the browser's default, which is white.

**No arrows in button labels.** "← Home" and "Start ▸" are gone; the words say
where they lead.

### The footer, and the two pages that are read

`SiteFooter` is drawn under the screens that are **read** rather than played.
`App` wraps each screen in a `page()` helper rather than each screen carrying
its own, because there are ten of them and the one that quietly lost its footer
is exactly what nobody would notice.

Three kinds of screen go without it, and the reasons are not the same:

- **A round in progress**, which is not negotiable: the map is pinned to the
  window and nothing scrolls, so a footer would either be painted over the map
  or never reached. That one is `body.playing` and the fact that a round never
  calls `page()` at all.
- **Today's round and the duel** — `FOOTERLESS` in `App`. Both are flows on
  their way into a game rather than pages, so a row of doors under them is an
  offer made at the moment the player has already chosen one. On the draw it
  would be carried off by the fade seven seconds later, having never been read.
- Nothing else. **The doc pages keep it**, and that is load-bearing rather than
  an omission: the footer is how About reaches Privacy and the only place
  Contact appears at all, so a doc page without one is a dead end.

**The list is read off the route in `page()`, not passed in at each call
site.** Same reasoning as the wrapper itself — a call site can forget, a list
can't.

**What this costs, and why it is still safe.** The footer is where the privacy
policy lives, and a policy has an outside obligation on it: it must be easily
accessible, and an AdSense reviewer looks for it. Today's round is `/`, the
front door. What holds it up is the **bar across the top**, which every one of
these screens has — one press to home, where the footer is in full. **Add a
screen to `FOOTERLESS` and check it still has that bar**, or the policy becomes
genuinely unreachable from somewhere.

It exists because there was nowhere for a credit, a copyright line or a policy
link to live. It holds Home, About, Credits, Privacy and Contact — and
deliberately **not** All Games, which is one of the three cards the home page is
made of: a footer is where a site keeps what it has to say, and the shelf listed
down there read as paperwork too.

**The attributions are on Credits alone** — not in the footer, and not on the
map. They were in all three, and the two extra copies were owed to nobody:
NASA's GIBS asks to be acknowledged without saying where, Natural Earth asks
for nothing, so one page discharges both. What NASA does insist on is the other
half — that its name never imply it endorses this — and that sentence is on
Credits with the rest. Mounting a source that does want its line where the
imagery is drawn (Esri does) means putting `.map-credit` back in `WorldMap` and
`GlobeMap`; `TileSource.credit` is still per-source for exactly that reason.

The pages behind it:

- **`About`** — what SpotOn is, the table of games, the three ways to play, and
  where the idea came from. **Deliberately short**, and it used to be long: it
  carried the scoring curve, every marking rule and the storage policy at once,
  which is everything true about the app on one page, read by nobody.
- **`FAQ`** — the long answer, in question-and-answer cards, with a **graph for
  every scoring curve** and a diagram of the middle-to-middle rule. Its curves
  are drawn by `ScoreCurve`, which is handed **the game's own scoring function**
  — `scoreFromDistance`, `scoreFromStops`, `scoreFromClockGap`,
  `scoreFromPopulationRatio` — so a graph here cannot quietly disagree with the
  game. Change a scale and these redraw. **Never write a curve out by hand on
  that page**: a copy is right on the day it is written and wrong ever after.
  (`scoreFromPopulationRatio` was moved into `data/populations.ts` for this —
  exporting it from the mode's own file breaks fast refresh.)

  It also carries **"Can I turn the animations down?"**, which is the app's
  answer to reduced motion: the setting stays the **device's**, not a switch in
  Settings, because it is set once and every site obeys it — a per-site toggle
  asks the same person to solve the same problem again, and would mean every
  animated thing reading a React preference instead of a media query, three.js
  included. What the FAQ owes in exchange is teaching people the setting
  exists, which is what that card does, per platform.

  **It names what reduced motion does not cover, and that list has to be kept
  honest.** `prefers-reduced-motion` is read in seven places — `HeadToHead`,
  `WorldMap`, `LondonMap` and four blocks in `game.css` — and **not** by
  `globeFlight.ts` or `GlobeMap`'s reveal flight, so the globe's camera still
  falls and still swings onto the answer. The card says so and points at the
  flat map. Honour it there and that paragraph comes out.
- **`Credits`** — the attributions, and four of them are **owed rather than
  offered**: NASA asks for its imagery line, TfL's open data asks for "Data
  provided by Transport for London", and the MIT and ISC licences on React,
  three.js, react-globe.gl, react-simple-maps, prop-types and d3-geo require
  their notices to travel with what ships. Take a dependency, add it there.
- **`Terms`** — the rules for using the site. Not an AdSense requirement, and
  here because every site with a privacy policy has one, and because it is the
  only place the rule about **leaderboard names** can live: the game asks for a
  name and puts it on a table the whole world reads, and without a line saying
  we may remove an offensive one there is nothing but manners in the way.
  Everything on it is either true of the app today or something we would
  actually do — a term nobody intends to enforce is worse than no term.
- **`Privacy`** — written from the code rather than from a template, and that
  is the point: it names the `localStorage` keys one by one because those are
  the ones that exist, and says the scores sit in the EU because the Supabase
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
| `/` | **Today's Round** — the draw, then the round, or a redirect home if this device has played |
| `/dailyround` | the same screen, kept so older links still work |
| `/leaderboard` | today's table |
| `/home` | the three doors |
| `/headtohead` | Duel a Friend — the `PlayFriend` component |
| `/headtohead/CVKQ7M` | an invitation to one room — see "The invite link" |
| `/allgames` | the shelf |
| `/about` | what the game is, in the time somebody will give it |
| `/faq` | every rule, with the curve behind each one |
| `/credits` | where the maps, shapes, logos and code came from |
| `/privacy` | what the game knows about the people who play it |
| `/terms` | the rules for using the site — and the one about leaderboard names |
| `/settings` | how this device likes its map |
| `/gamemakersscrapbook` | the bench — see "The bench" below. Goes when it does |
| `/gamemakersscrapbook/exportspotter` | Export Spotter, being built — see "The last cards" |
| `/gamemakersscrapbook/subwayspotter` | Subway Spotter, being built — same |
| `/cityspotter`, `/flagspotter`, `/currencyspotter`, `/corporatehqspotter`, `/populationspotter`, `/tubestationspotter`, `/timezonespotter` | that game's setup screen, and the round itself |

**The names crossed over and the file says so:** `/headtohead` is Duel a Friend,
while `/dailyround` is the component *called* `HeadToHead`. The screens were
renamed, the paths were chosen afterwards from what players are shown, and the
components kept their old names. Follow `useRoute.ts`, not the file names.

**Adding a game means adding a path here**, as well as a mode letter in
`match.ts`, **and re-running `node tools/gen-sitemap.mjs`** — the sitemap is
generated from this file, and a route not in it is a page search engines never
learn exists. The paths are written down rather than derived from the titles: a
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

### What a crawler sees

Three things, all of them added because **the site is one page that builds
itself in JavaScript**, and anything that reads it without executing it used to
see a blank white rectangle. That is the shape of an AdSense refusal —
"low value content", "site under construction" — as well as being worth real
traffic.

- **`index.html` carries the game in plain HTML**, inside `#root`. React's
  `createRoot` clears the container it is handed, so no player ever sees it; a
  crawler, a link previewer and a reader with JavaScript off all do.

  **It has to be hidden the moment JavaScript runs, and that is not automatic.**
  Left to React, the shell paints from the first frame and stays until 744 KB
  of bundle has downloaded and mounted — so a player on a slow connection is
  shown a page telling them to turn on the JavaScript they already have. An
  inline script in the head adds `js` to the root element before the body is
  even parsed, and `.js .boot-shell` in `index.css` hides it. Inline and in the
  head on purpose: an external script is a second round trip and anything
  deferred is too late, which is to say the flash is exactly the gap. Nothing
  that reads a page without executing it ever sets that class, so the shell
  stays visible for precisely the readers it was written for.
  Deliberately **not** a `<noscript>` block: content inside the root does the
  same job for a crawler *and* stays on screen for the reader whose JavaScript
  never runs, where `<noscript>` only does the second. Keep it honest — it
  describes the game as it is and links only to pages that exist.
- **`index.html` also carries the metadata** — a description, a canonical URL,
  and the Open Graph and Twitter tags that decide what a pasted link looks
  like. The image is the square app icon, which is why the card is `summary`
  and not `summary_large_image`; the latter wants a 1200×630 banner and crops a
  square one badly. **A real banner is the one thing here still worth making.**
- **`public/robots.txt` and `public/sitemap.xml`.** The sitemap is generated by
  `tools/gen-sitemap.mjs`, which **reads the routes out of `useRoute.ts`**
  rather than listing them again: a URL is a promise, and a sitemap promising
  one the app does not answer teaches a crawler to distrust the rest. It leaves
  out `/settings` (three toggles about this device, nothing to find) and the
  bench (not for players).

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
(`inviteLink`). The code is still printed large for reading out: a room fills up
both ways.

**Two buttons hand it out: Share URL, then Copy code.** Share URL is the
phone's own sheet, `navigator.share`, and it is first because it is the one that
does the most: the sheet lists the apps that person actually has, offers Copy at
the top of them, and is the **only** route to several — Instagram publishes no
web URL that opens a message with a link in it, so a hand-built row of buttons
can never reach it however many buttons it has. Copy code is for the person
reading it out, or typing it into a second device; it was only the large type
before, which cannot be pasted.

**There was a Copy invite link button and it came out**, because the sheet
copies the link itself and two buttons for one job is a choice the host has to
stop and make. What that costs is paid below rather than left lying: the
fallback row leads with **Copy link** for exactly this reason — a browser with
no sheet would otherwise have no way to get the link at all, only four ways to
send it somewhere.

`HAS_SHARE_SHEET` in `PlayFriend` is read once at module level, and by `typeof`
rather than truthiness — TypeScript's own DOM types declare `navigator.share` as
always defined, so a plain `if (navigator.share)` is a build error (TS2774).
Where there is no sheet, which is most desktop browsers, Share URL toggles that
fallback row instead: Copy link, then `shareTargets`, the four services that
publish a share URL. A fallback rather than the main event because four is all
there are, and on the phone this feature is for that is the wrong four as often
as not. **Mail is the one in that row without `target="_blank"`** — the browser
hands a `mailto:` to the mail client and never navigates, so a new tab is one
left blank and sitting there. That row also mixes a `button` with four `a`s,
which the browser lays out to different heights on identical padding, so
`.room-share-links .btn` makes both blocks on one line-height.

**Start the game is refused until somebody else is on the list.** A duel of one
is not a duel, and starting one is not a harmless mistake: the code shuts on
start, so the friend who was still typing their name arrives at a room that has
gone. The hint under the button says which of the two things it is waiting for
rather than only refusing.

That refusal is also what turned up **`.btn:disabled` never existing**. Every
disabled button in the app sat at full opacity with a pointer cursor over it and
a hover that still lit — a Start that reads as pressable and does nothing reads
as the screen being broken. The rule is in `game.css` beside `.btn`, and the two
hovers are gated `:hover:not(:disabled)` for the same reason.

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

### Where the tube data comes from

**Transport for London's own open data**, rebuilt by `tools/gen-tube-tfl.mjs`
into `src/data/tubeData.ts`. Run `node tools/gen-tube-tfl.mjs`; it writes that
file and is the only thing that should. No key is needed at this volume, though
TfL ask you to register for one.

It used to come from a third-party GitHub dataset that declared **no licence**,
which granted no permission to redistribute it and put UK database right on top
of copyright for the compilation. That was item C1 of the ad-readiness
register, and the swap was judged on a bench before it was made — the bench
came down with it. `public/london-boroughs.json` is the other half, C2: the ONS
boundary set under the Open Government Licence, vendored rather than fetched
live from `raw.githubusercontent.com`, which was both unlicensed and not a CDN.

**The attribution is the licence's, word for word**, and it is on `/credits`:
"Powered by TfL Open Data", plus the Crown copyright and Geomni lines TfL's
terms require, plus the ONS line for the boroughs. The year in them is read
from the clock, not typed. **The page used to say "Data provided by Transport
for London"** — TfL's wording for the live bus arrivals feed, and crediting
them for data that had come from somewhere else entirely. If the source ever
changes again, this page changes with it.

**TfL's terms, read rather than assumed**
(`/corporate/terms-and-conditions/transport-data-service`): Open Government
Licence v2.0 with TfL's amendments, and **commercial use is expressly
permitted** — "by including it in Your own product or application". The licence
**transfers no intellectual property** and asks that logos and trade marks be
respected per TfL's branding guidelines, so it does not cover the roundel,
"Mind the Gap" (register item D1) or the line names and colours (D4). Those
stand or fall on nominative use.

What the swap changed, measured rather than assumed:

- **Four stations were simply missing** — Battersea Power Station, Nine Elms,
  Wood Lane and Heathrow Terminal 5. The old set predated the 2021 Northern
  line extension.
- **Two names were misspelled** on screen ("Harrow & Wealdston",
  "Bromley-By-Bow") and one was stale (Heathrow Terminal 1 closed in 2015).
- **Stations moved about 30 m** typically, 367 m at worst (Southwark) —
  platform centroid against entrance.
- **Sixteen fare zones changed**, and that is the one that reaches the score:
  `tubeNearby.ts` sizes the Mind the Gap circle off the zone, so a zone that
  moves moves a radius. Several are TfL correcting the old set outright —
  Amersham and Chesham are zone 9, not 10.

**The trap, and it was visible on the map within a minute.** Zones do not come
from `Route/Sequence` — that endpoint carries a `zone` on each stop but leaves
it off some, Stratford, West Ham and North Greenwich among them. The first
version fell back to zone 1, which put three east London stations in the middle
of the city; the **zone bands are convex hulls of the stations in each zone**,
so zone 1's hull stretched east across the map and merged into the outer bands.
A wrong zone here is not a mislabelled station, it is a band drawn across half
of London. Zones now come from `StopPoint/Mode/tube`, which has one for every
station — "3", or "2/3" for a boundary, which is the same half the game already
keeps — matched on the Naptan id, because the two endpoints spell station names
differently. **There is no fallback**: a station with no zone throws and stops
the build, because something plausible is exactly what hid this.

**The generator follows the game's naming policy, not TfL's.** TfL lists
Hammersmith, Paddington and Edgware Road twice each, because they are
operationally separate stations — right for a journey planner and wrong for a
guessing game, where two right answers to "Hammersmith" is a question with no
answer. `RENAME` in the generator merges them, which is also where the
connections get re-pointed. `stationNames` in `tube.ts` is now **empty**: it
existed to fix the old dataset's misspellings and its "(C)"/"(B)" initials, and
TfL spells its own stations correctly.

**The colours are a separate argument and were settled long before this.**
`lineColors` in `tube.ts` is a hand-tuned palette, deliberately pushed further
apart than TfL's own so each line reads as its own hue at map scale, and it
overrides whatever the generator emits. Don't conflate the two: the licence
question was about the station table, and recolouring could never have answered
it.

**The zone bands carry no numbers.** They were numbered circles once, and they
went for two reasons at once. Nobody looking for a station needs to be told
which zone they are looking at, and the numbers were the only thing making
`MAX_ZONE_BAND` a lie: zones past 6 share the outermost ring, so the eight
stations beyond Rickmansworth, which are zones 7 to 9, all sat inside a ring
that said **6**. Unlabelled, the rings say the true thing and only the true
thing — further out is further out. The real zone is still on the station in
the reveal. `findClearSpot` and `rayExitRadius` went with them: ninety lines
whose only customer was placing those circles.

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
tube rule and it is that file. Benches come and go this way — see "The bench"
below, which is about the one standing now.

**The trap, and it cost a round trip:** membership is the station's dot inside
the circle, and it has to stay something a player can *count off the screen*.
Reading "a station whose circle touches" as the station's own reach circle put
13 stations in Kenton's count instead of the 3 visibly inside it; a 150 m
tolerance for dots straddling the edge then let in Preston Road, 1.74 km from a
1.6 km circle. Both made the printed number disagree with the picture, which is
the one thing this rule cannot afford. If the test ever grows a tolerance again,
the circle on the map has to grow with it.

### The company logos

**Served from `public/logos/`, not from Simple Icons' CDN.** 486 SVGs, 790 KB,
fetched by `tools/gen-company-logos.mjs`. That was item C3 of the ad-readiness
register: every round of Corporate HQ Spotter used to fetch its mark from a
volunteer-run service on the round it was asked for, so the question was
unreadable if that service was slow, and a game carrying advertising was
leaning on somebody else's bandwidth for the one image it is made of. The icons
are CC0, so copying them is expressly permitted.

**The trap, and the bench existed to catch it.** Simple Icons keeps each mark
as a single black path and **the CDN paints it** — ask GitHub for `nvidia.svg`
and there is no `fill` at all, ask the CDN and you get `fill="#76B900"`.
Vendoring from the repository, which is the obvious thing to do, would have
turned all 486 logos black — a visible change to the game and a bad one, since
the colour is half of what makes a mark recognisable. The script fetches the
CDN's own output and **refuses any file that comes back without a fill**, so
this cannot regress quietly.

**Adding a company means adding a row to `companies.ts` and re-running the
script.** The `slug` is Simple Icons' own identifier and there is no longer a
CDN to fall back on, so a slug with no file behind it is a broken image where
the question should be.

What this does *not* settle is register item **C4**: Simple Icons' disclaimer
says they cannot answer for a brand's objection and that permissions are the
user's to seek. Showing a mark to ask which country it comes from is nominative
use, and the trademark disclaimer on `/credits` and on that game's setup screen
is what rebuts any suggestion of endorsement — but a brand whose guidelines
forbid use in games is a brand to drop if it ever asks.

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

### The bench

**Nothing is on the bench itself, and there is no bench screen** — though two
games are being built under its path, at `/gamemakersscrapbook/exportspotter`
and `/gamemakersscrapbook/subwayspotter`. `/gamemakersscrapbook`
is still a route and nothing renders for it. The arguments it has settled, most
recent first: where the company logos are served from, where the tube data
comes from, and the fall through space and the sky.

Putting one back is a component and one line in `App`'s route table. One thing
from the last two is worth reusing rather than rebuilding: `TubeData` and
`SHIPPED_TUBE` in `src/data/tubeSources.ts` with `LondonMap`'s `data` prop,
which together let a bench hand the map a different network. That seam is kept
deliberately — it defaults to the shipped bundle, so it costs the game nothing,
and it is what let the tube comparison judge **the real renderer** rather than
a copy of it. Which is a departure from the "a bench is a copy" rule below, and
the right one where what is on trial is data.

**A lesson from the logo bench, worth having before building the next one.** It
drew all 486 marks twice, from each source, one pair per company — a *diff*,
and a good one: a single mark that had come out wrong would have been findable
by scanning, which two full screens to flip between could not have done. But it
was not self-explanatory, and had to be explained before it could be read. A
bench that needs a covering note has failed at half its job. **Say what a
correct result looks like on the screen itself**, in a sentence, before the
thing being compared.

The rules a bench lives by, all of them load-bearing:

- **Never a `ModeId`** — a route, and a card only if it is on the shelf. A `ModeId`
  enters the daily rota, needs a letter in a duel code and a re-run of
  `schema.sql`, and an experiment is the last thing to hand somebody as their
  round of the day. The route is the concession the URL era forces, since every
  screen needs an address; keep it out of `MODE_PATHS`.
- **Nothing on it is scored anywhere**: pass it no `match`, so there's no
  clock, no seeded deal and no leaderboard to file to.
- **It is a copy, not a flag inside the real thing.** `ScrapbookGlobe` is
  `GlobeMap` duplicated, and everything below what is being tried is meant to
  stay verbatim — a copy that drifts is a copy that gets judged instead of the
  thing it stands in for.
- **Put the comparison on the bench itself**, as a switch in the corner of the
  map: two looks have to be judged in the same second on the same view, and a
  choice made on a setup screen is judged from memory.
- **What graduates replaces**, rather than standing beside what it replaced,
  and the bench comes down with the argument it settled. The last one did, at
  `669f41f`, which is where the three-skinned globe (tiles, tiles + sky, and an
  8k flat-ocean photograph) still lives.

### The last cards: coming soon

`Export Spotter`, on the end of the shelf in `AllGames`. A `div` rather than a
`button` and dimmed by `.mode-card.is-coming`: **there is something behind it
now, and it is still not for players.** It is not a `ModeId`, and nothing in
`match.ts`, `duel.ts` or the database knows it exists.

**It is playable at `/gamemakersscrapbook/exportspotter` and nowhere else.**
The route is `{ at: "workshop" }` — under the bench's path rather than beside
the games, and deliberately out of `MODE_PATHS`, because a `ModeId` enters the
daily rota and needs a letter in a duel code, and neither belongs to a game
whose answers have not been checked. It gets the ordinary `ModeSetup` screen,
so it is judged exactly as a player would meet it, but no `match` is passed on:
nothing it scores can reach a leaderboard.

The card's words are read from `EXPORT_SPOTTER` in `App`, which is also what
the setup screen behind the bench path uses — so the promise on the shelf and
the game behind it cannot describe themselves differently.

**The question is the currency round's shape**: it names a *thing* rather than
a place, several countries are right, and the reveal paints all of them. The
mode is `ExportGuesser`, and it is `CurrencyGuesser` with the pool swapped —
same `hitTest` across a group, same `answerFor` picking the nearest member,
same `guessAt` anchoring, so a miss is charged to the nearest country that
really does sell it rather than to the middle of a group, which for crude
petroleum would be a spot in the Arabian desert and for fish the open sea.

**What is keeping it off the shelf is the data, not the code** — see the
warning at the top of `src/data/exports.ts`. "Main export" is a moving target:
it depends on the year, on how finely goods are categorised, and on whether
services count. 106 countries and 28 goods are in, and the ones whose answer
flips year to year are deliberately out — Thailand is famous for rubber and
exports more cars, Costa Rica is famous for bananas and exports more medical
instruments, Rwanda is famous for coffee and exports more gold. The data is
hand-written from general knowledge rather than lifted from a trade database,
which is also what keeps it the right side of the line the tube data was on the
wrong side of: individual facts belong to nobody, a compiled dataset can belong
to somebody.

**Graduating either** means: a `ModeId` in `ModeProps.ts`, a unique mode letter
in `match.ts`, an ordinary path in `useRoute.ts` (and its `workshop` entry
deleted), a row in the games table above, the scoring row below, a re-run of
`supabase/schema.sql` against the live project, and the coming-soon `div` in
`AllGames` becoming a `button`.

**Subway Spotter** is the second, at `/gamemakersscrapbook/subwayspotter`:
Tube Station Spotter in New York, marked the same way — whichever station's
patch of the map you clicked is your answer, and the ride from there is what
costs you. It imports `scoreFromStops` **from the tube's own module** rather
than copying it, so both station games are marked on one curve; a second copy
would be right the day it was written and free to drift after.

`NewYorkMap` is `LondonMap` copied, which is the bench rule applied properly —
the tube game is live and scored, and a flag inside its map is the last thing
that should carry an experiment. The copy keeps London's variable names so the
two can still be diffed. Three things it drops, and all three are facts about
the networks rather than features left out:

- **No fare zones.** New York has a flat fare. `MAX_ZONE_BAND` is 0, and that
  is the second answer rather than the first: one hull round every station was
  tried, and a single convex wedge across the harbour says nothing and pulls
  the eye off the network. The borough outlines are the ground.
- **No river ribbon.** London draws the Thames because it is the one
  unmistakable thing on that map. New York's shoreline is already drawn — the
  water *is* the gap between five borough shapes, from a boundary file. A
  hand-drawn Hudson on top was redundant and, on screen, visibly wrong: it ran
  diagonally across Manhattan, because it had been guessed at rather than
  traced.
- **No Mind the Gap.** That circle is sized off the fare zone, and there is no
  zone here to size it from.

**The data is the MTA's own**, by `tools/gen-subway-mta.mjs`: the Subway
Stations dataset on data.ny.gov for the places and `complex_id` (Times Sq-42 St
is several platform rows and one place to point at), and the GTFS static feed
for what joins what and for `route_color`. It carries a small zip reader —
forty lines of `inflateRawSync` — rather than a dependency for one build
script.

**The trap it recorded, because it cost a full rebuild.** MTA stop ids run in
order along each physical line (R01, R03, R04 down the Astoria line), so
building edges by sorting each line's stops looks right and *is* right within a
line. It leaves the lines unjoined: 81 stations came out unreachable, whole
branches of Brooklyn and Queens floating free, because a line that continues
into another is two `line` values with two separate id blocks. "How many stops
away" is a walk over that graph, so an unreachable station is a round with no
answer. Real adjacency comes from the trip sequences in `stop_times.txt`, and
**the generator now throws rather than writing a file with a stranded station
in it**. Staten Island is excluded for the same reason: its railway is part of
the MTA and no part of the subway graph.

**Repeated names are the other thing London never had to solve.** London has no
two stations called the same thing; New York has four called 86 St. Merging
them would be a lie and leaving them bare is a question with several unmarked
answers, so a repeated name carries its routes — "86 St (4·5·6)" — which is how
New Yorkers tell them apart. Where name *and* routes collide, the borough
follows.

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

**A day can be pinned by hand** — `PINNED_DAYS` in `match.ts`, a day number from
`localDay` to a `ModeId`, consulted before the shuffle and winning outright. It
is an override rather than a re-deal: the block around it is left as dealt, so a
pin **costs that block its permutation** — the game it displaces loses its turn,
and the game pinned on gets two days if it already had one in that block. That
is the price of moving one day and only one day; swapping instead keeps the
promise but moves a second day nobody asked to move. Nothing checks a pin
against its neighbours, so two of the same game running back to back is a thing
to catch while writing the pin down.

**Only pin a day that hasn't happened.** A played day has a table filed under
its `dailyCode`, which is built from the mode *and* the day — change the mode
and the old scores are still filed under the old code, so the day quietly grows
a second leaderboard nobody can reach and the players on the first one are
marked at a game that day no longer is.

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
at today's round, whoever picks it up.

`Leaderboard`'s locked line used to be written for that person — "This device
has already played", never "you have", so the second person in a household
wasn't read an accusation about a game they never had. **It now says "You have
already played today's round. See where you stand on the leaderboard."**, by
decision rather than by drift. The honest note is that on a shared device it
tells the wrong person they played; the judgement is that the ordinary case is
one person one device, and that "this device" reads as machinery to everybody
else. If the shared-laptop case ever comes back up, this is the line to change
and this paragraph is why.

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

**The arrival cannot be checked this way at all**, and it cost part of a
session to establish. A tab driven by the browser extension is
`document.hidden`, and Chrome freezes `requestAnimationFrame` in a hidden tab
and clamps its timers to about one a second. So the fall through space never
animates, a recorder hung off `rAF` collects exactly one frame, and the draw's
timings are nothing like the ones the code asks for. Screenshots still work,
because a screenshot forces a paint — which is why the *result* of a sequence
can be checked here even though the motion between the frames cannot. Anything
about how the arrival **feels** has to be looked at by hand, in a real window.

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
