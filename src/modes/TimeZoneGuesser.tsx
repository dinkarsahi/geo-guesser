import { useEffect, useMemo, useState } from "react";
import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import NightToggle from "../components/NightToggle";
import WorldMap from "../components/WorldMap";
import type { MapHighlight } from "../components/mapTypes";
import { countryPool } from "../data/countries";
import {
  clockGap,
  clockLabel,
  clockNow,
  countryReadings,
  formatClockGap,
  scoreFromClockGap,
  timeZonePool,
  utcLabel,
  zoneClock,
  zoneReading,
  type ClockReading,
  type TimeTarget,
} from "../data/timeZones";
import { haversineKm, type Coord } from "../lib/geo";
import { matchOptions } from "../lib/match";
import { serverNow } from "../lib/supabase";
import { useGame } from "../lib/useGame";
import {
  anchorAt,
  codeOf,
  countryAt,
  useWorldShapes,
  nameOf,
  type WorldShapes,
} from "../lib/worldShapes";
import {
  pieceAt,
  piecesOf,
  useZonePieces,
  type ZonePieces,
} from "../lib/zoneShapes";
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  pool: TimeTarget[];
  shapes: WorldShapes;
  pieces: ZonePieces;
}

/**
 * The clock, live.
 *
 * The question is what time it is somewhere, so the answer cannot be a
 * screenshot of a minute that has passed. A duel's round runs thirty seconds
 * with ten on the answer after it, and today's round is not timed at all —
 * either is long enough to step over a minute boundary and leave the prompt
 * claiming a time nowhere on Earth is reading any more.
 *
 * The room's clock rather than this device's, so that two people in a duel are
 * asked the same minute — they're being asked about the same *offset* either
 * way, and the countries that answer it are the same countries, but a prompt
 * that says 14:29 on one screen and 14:30 on the other looks like a bug.
 */
function useMinute(): number {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const id = setInterval(() => setNow(serverNow()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** The country on this clock that the guess landed nearest. */
function nearestOnTheClock(guess: Coord, when: TimeTarget): Coord {
  let best = when.countries[0];
  let bestKm = Infinity;
  for (const c of when.countries) {
    const km = haversineKm(guess, c);
    if (km < bestKm) {
      bestKm = km;
      best = c;
    }
  }
  return { lat: best.lat, lng: best.lng };
}

/**
 * Where a click stands on the 24-hour face, in minutes.
 *
 * The clock of the *part* of the country pressed, where the country is cut
 * into parts. Which is the whole of what those parts are for: Australia keeps
 * three clocks and a press on Perth answers one of them, so taking the
 * country's nearest clock would have marked a guess at Sydney's time full
 * marks for pointing at Western Australia. Where a country isn't cut up its
 * own clocks are the answer, and the nearest of them where it keeps more than
 * one the file doesn't divide.
 *
 * Null for a click that found no country. Both maps turn those away before
 * they become a guess, so this is only the honest fallback.
 */
function clocksAt(
  shapes: WorldShapes,
  pieces: ZonePieces,
  click: Coord,
  at: number,
): { name: string; clocks: ClockReading[]; ofPiece: boolean } | null {
  const feature = countryAt(shapes, click);
  if (!feature) return null;
  const code = codeOf(feature);
  const piece = pieceAt(pieces, code, click);
  const clocks = piece ? [zoneReading(piece.zone, at)] : countryReadings(code, at);
  // Whether that one clock is the clock of a *place* or of a whole country.
  // The difference is the difference between "it is 21:47 where you pressed"
  // and "it is 21:47 in Nigeria", and only the first is worth claiming.
  return { name: nameOf(feature), clocks, ofPiece: piece !== null };
}

/**
 * Whichever of a place's clocks stands nearest the one being asked about.
 *
 * The round was marked against this one — see `gapFromClick` — so it is the
 * only one the panel and the table are allowed to name. Anything else is a
 * sentence quoting a clock the score didn't use.
 */
function markedAgainst(clocks: ClockReading[], when: TimeTarget): ClockReading {
  return clocks.reduce((best, c) =>
    clockGap(c.clock, when.clockOffset) < clockGap(best.clock, when.clockOffset) ? c : best,
  );
}

/** How far the clock of whatever was clicked is from the one asked about. */
function gapFromClick(
  shapes: WorldShapes,
  pieces: ZonePieces,
  click: Coord,
  when: TimeTarget,
  at: number,
): number | null {
  const here = clocksAt(shapes, pieces, click, at);
  if (!here?.clocks.length) return null;
  return Math.min(...here.clocks.map((c) => clockGap(c.clock, when.clockOffset)));
}

function TimeZoneGame({
  onExit,
  night,
  onToggleNight,
  settings,
  match,
  pool,
  shapes,
  pieces,
}: GameProps) {
  const now = useMinute();

  // Anywhere on the right clock is the right answer, so every country reading
  // that time is full marks — Nigeria and Norway are both 14:30, and a player
  // who names either has answered the question that was asked.
  //
  // Marked in half-hours rather than in kilometres, which is the whole point of
  // the mode: Lisbon and Warsaw are close on the map and an hour apart on the
  // clock, and Norway and South Africa are four thousand kilometres apart and
  // on the same one. Distance would mark this game backwards.
  //
  // And marked hard — see `scoreFromClockGap`. With forty-six countries on the
  // busiest clock, being roughly right here is much easier than being roughly
  // right about where a city is, and the marks have to say so.
  const game = useGame<TimeTarget>(pool, (t) => t, 2000, {
    rounds: settings.rounds,
    hitTest: (click, when) => gapFromClick(shapes, pieces, click, when, now) === 0,
    scoreGuess: (click, when) => {
      const gap = gapFromClick(shapes, pieces, click, when, now);
      if (gap === null) return { score: 0, label: "not a country" };
      return { score: scoreFromClockGap(gap), label: formatClockGap(gap) };
    },
    answerFor: nearestOnTheClock,
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  const asking = clockLabel(clockNow(game.target.clockOffset, now));
  const { lastResult, phase } = game;
  // The minute for reading a clock, the hour for placing one. Which offset a
  // zone is on can only change on the hour, so the shapes below are worked out
  // against the hour — otherwise they'd be worked out afresh every second, and
  // handing the globe a new set of polygons every second is what makes the
  // flight out to the answer stutter.
  const thisHour = Math.floor(now / 3_600_000) * 3_600_000;

  /**
   * The round, painted on the map: green over everywhere keeping the clock
   * that was asked about, red over the part of the world the player picked
   * instead.
   *
   * Countries rather than pins, because "where is it 14:30?" has forty-six
   * right answers and a pin can only stand on one of them — and parts of
   * countries where a country keeps more than one clock, because Queensland
   * is not an answer to a question about Perth.
   *
   * Held still between renders, and not only for the sake of it: the globe
   * rebuilds a polygon the moment it's handed a new object, and the minute
   * ticking over re-renders this every second.
   */
  const highlights = useMemo<MapHighlight[] | null>(() => {
    if (phase !== "result" || !lastResult) return null;
    const when = game.target;
    const out: MapHighlight[] = [];

    /** The parts of a country on a given clock — or the whole of it. */
    const paint = (code: string, tone: "right" | "wrong", clock?: number) => {
      const parts = piecesOf(pieces, code);
      const wanted =
        parts && clock !== undefined
          ? parts.filter((p) => zoneClock(p.zone, thisHour) === clock)
          : [];
      if (wanted.length) {
        for (const part of wanted)
          out.push({ key: `${tone}-${code}-${part.zone}`, feature: part.feature, tone });
        return;
      }
      // No part of it matches, which happens where a country's claim to a
      // clock is an island too small to have survived being cut out — Lord
      // Howe is Australia's, and it's fourteen square kilometres. The answer
      // list says the country is on this clock, so the map says so too rather
      // than leaving it blank and contradicting the list beneath it.
      const feature = shapes.byCode[code];
      if (feature) out.push({ key: `${tone}-${code}`, feature, tone });
    };

    for (const country of when.countries) paint(country.code, "right", when.clockOffset);

    // And where they actually pressed, if it wasn't one of them. Drawn last so
    // it sits on top: a country can be both, one part of it right and another
    // part wrong, and what the player did is the thing to see.
    if (lastResult.click && !lastResult.hit) {
      const missed = countryAt(shapes, lastResult.click);
      if (missed) {
        const code = codeOf(missed);
        const piece = pieceAt(pieces, code, lastResult.click);
        if (piece) out.push({ key: `wrong-${code}-${piece.zone}`, feature: piece.feature, tone: "wrong" });
        else paint(code, "wrong");
      }
    }
    return out;
  }, [phase, lastResult, game.target, pieces, shapes, thisHour]);

  return (
    <GameFrame
      title="Time Zone Spotter"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      match={match}
      targetNoun="time"
      // What time it is where you pointed, which is the whole lesson of a miss.
      // Being told the answer was 14:30 teaches nothing on its own; being told
      // you picked Brazil, and that Brazil is on 10:30, is the round.
      //
      // Said in the same breath as the country rather than set out to the right
      // as a figure. A clock is only about the place it belongs to, and read as
      // a sentence — "Nigeria, where the local time is 21:29" — it says whose
      // 21:29 that is. Out on its own it was a second number on a screen that
      // already had one, with nothing to say which country it answered for.
      //
      // One time, always. A country keeping several of them was answered with
      // the lot, which is the one thing this game must never do: "Australia,
      // 21:47 / 22:47 / 23:47" is three answers where the player gave one, and
      // it hides the one they actually gave. So where the country is cut up the
      // sentence names the part's clock and says so — the whole reason those
      // parts exist is that a press on Perth is a press on Perth.
      pickedLabel={(click) => {
        const here = clocksAt(shapes, pieces, click, now);
        if (!here) return null;
        if (!here.clocks.length) return { name: here.name };
        const reads = (c: ClockReading) => clockLabel(clockNow(c.clock, now));
        if (here.ofPiece) {
          return {
            name: `${here.name}, where the local time is ${reads(here.clocks[0])} in the part you clicked`,
          };
        }
        if (here.clocks.length === 1) {
          return { name: `${here.name}, where the local time is ${reads(here.clocks[0])}` };
        }
        // Several clocks and no parts to tell them apart: Ukraine, which the
        // boundary file doesn't divide, and every divided country if that file
        // failed to download. The round was marked against whichever of them
        // came closest, so that is the one named — a sentence quoting a clock
        // the score didn't use is a panel arguing with itself.
        return {
          name:
            `${here.name}, which keeps more than one clock — the nearest reads ` +
            reads(markedAgainst(here.clocks, game.target)),
        };
      }}
      hint="Click a country where it's that time right now."
      measureLabel="Difference in hours"
      renderPrompt={(when) => (
        <div className="prompt-card">
          <span className="prompt-label">Where in the world is it</span>
          <span className="prompt-clock">{clockLabel(clockNow(when.clockOffset, now))}</span>
        </div>
      )}
      // The clock the round was about, as it reads and as it is named:
      // "21:11 (UTC+4)". The reading is what the player was shown and is the
      // only form in which they can recognise the round; the offset is what
      // that reading came from, and it's what tells two rows an hour apart
      // apart once the reading is only a number.
      //
      // Still ticking, like everything else in this game — the table is read
      // minutes after the last round, and a reading held from when the round
      // closed would be a time nowhere on Earth is standing at any more. That
      // every row then reports the same minute is not a coincidence to hide:
      // they are one moment read in five places, which is the fact the whole
      // game is about.
      answerLabel={(when) =>
        `${clockLabel(clockNow(when.clockOffset, now))} (${utcLabel(when.namedOffset)})`
      }
      // What was clicked instead, beside how far out it put them: "1 hour out
      // (Gabon, UTC−1)". The map is gone by the time this is read, and a
      // column of gaps on their own says which rounds went wrong without
      // saying what was picked — which in this game is the whole lesson, since
      // the mistake is a clock and not a place.
      //
      // Named against the clock the round was marked by, the same one the
      // reveal quotes, so a country keeping several of them can't be given a
      // different offset here than it was given there.
      summaryMeasure={(result, when) => {
        if (!result.click || !result.label) return null;
        const here = clocksAt(shapes, pieces, result.click, now);
        if (!here?.clocks.length) return null;
        return `${result.label} (${here.name}, ${utcLabel(markedAgainst(here.clocks, when).named)})`;
      }}
      renderResultExtra={(when) => (
        <FactCard
          title={`${asking} — ${utcLabel(when.namedOffset)}`}
          fact={
            when.countries.length === 1
              ? `Only ${when.countries[0].name} is on this clock.`
              : `${when.countries.length} countries are on this clock, among them ` +
                `${when.countries[0].name} and ${when.countries[when.countries.length - 1].name}.`
          }
        />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            night={night}
            borders={settings.borders}
            highlights={highlights}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            highlights={highlights}
          />
        )
      }
    />
  );
}

export default function TimeZoneGuesser(props: ModeProps) {
  // The clocks are grouped from the same country pool the flag round uses, so
  // nothing can be asked about until the map data lands.
  const shapes = useWorldShapes();
  // And the countries that keep more than one clock have to arrive before the
  // first round rather than during it: they decide what a click is worth, and
  // a game that started without them would mark its early rounds by one rule
  // and its later ones by another.
  const pieces = useZonePieces();
  const countries = countryPool(shapes);
  // Built once and kept, so the rounds don't reshuffle underneath a game in
  // progress. What's on each clock doesn't change within a sitting; only what
  // it reads does.
  const pool = timeZonePool(countries);

  if (!shapes || !pieces || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              ← Menu
            </button>
            <NightToggle night={props.night} onToggle={props.onToggleNight} />
          </div>
          <h2>Time Zone Spotter</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <TimeZoneGame {...props} pool={pool} shapes={shapes} pieces={pieces} />;
}
