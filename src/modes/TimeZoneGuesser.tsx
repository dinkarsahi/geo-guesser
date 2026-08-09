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
  countryClocks,
  formatClockGap,
  scoreFromClockGap,
  timeZonePool,
  utcLabel,
  zoneClock,
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
 * screenshot of a minute that has passed. A round runs thirty seconds with ten
 * on the answer after it, which is long enough to step over a minute boundary
 * and leave the prompt claiming a time nowhere on Earth is reading any more.
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
): { name: string; clocks: number[] } | null {
  const feature = countryAt(shapes, click);
  if (!feature) return null;
  const code = codeOf(feature);
  const piece = pieceAt(pieces, code, click);
  const clocks = piece ? [zoneClock(piece.zone, at)] : countryClocks(code, at);
  return { name: nameOf(feature), clocks };
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
  return Math.min(...here.clocks.map((c) => clockGap(c, when.clockOffset)));
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
      pickedLabel={(click) => {
        const here = clocksAt(shapes, pieces, click, now);
        if (!here) return null;
        if (!here.clocks.length) return { name: here.name };
        return {
          name: here.name,
          detail: `${here.clocks.map((c) => clockLabel(clockNow(c, now))).join(" / ")} there`,
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
      // The clock the round was about, named rather than read: by the time this
      // list is looked at, the reading has moved on and the offset hasn't.
      answerLabel={(when) => utcLabel(when.namedOffset)}
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
