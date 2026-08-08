import { useEffect, useState } from "react";
import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import NightToggle from "../components/NightToggle";
import WorldMap from "../components/WorldMap";
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
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  pool: TimeTarget[];
  shapes: WorldShapes;
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
 * How far the clocks of whatever was clicked are from the one asked about, in
 * minutes — the nearest of them, for a country keeping more than one.
 *
 * Null for a click that found no country. Both maps turn those away before they
 * become a guess, so this is only the honest fallback.
 */
function gapFromClick(
  shapes: WorldShapes,
  click: Coord,
  when: TimeTarget,
  at: number,
): number | null {
  const feature = countryAt(shapes, click);
  if (!feature) return null;
  const clocks = countryClocks(codeOf(feature), at);
  if (!clocks.length) return null;
  return Math.min(...clocks.map((c) => clockGap(c, when.clockOffset)));
}

function TimeZoneGame({
  onExit,
  night,
  onToggleNight,
  settings,
  match,
  pool,
  shapes,
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
  const game = useGame<TimeTarget>(pool, (t) => t, 2000, {
    rounds: settings.rounds,
    hitTest: (click, when) => gapFromClick(shapes, click, when, now) === 0,
    scoreGuess: (click, when) => {
      const gap = gapFromClick(shapes, click, when, now);
      if (gap === null) return { score: 0, label: "not a country" };
      return { score: scoreFromClockGap(gap), label: formatClockGap(gap) };
    },
    answerFor: nearestOnTheClock,
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  const onTheClock = game.target.countries.map((c) => c.code);
  const asking = clockLabel(clockNow(game.target.clockOffset, now));

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
        const feature = countryAt(shapes, click);
        if (!feature) return null;
        const clocks = countryClocks(codeOf(feature), now);
        if (!clocks.length) return { name: nameOf(feature) };
        return {
          name: nameOf(feature),
          detail: `${clocks.map((c) => clockLabel(clockNow(c, now))).join(" / ")} there`,
        };
      }}
      hint="Click a country where it's that time right now."
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
            highlightCodes={onTheClock}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={onTheClock}
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
  const countries = countryPool(shapes);
  // Built once and kept, so the rounds don't reshuffle underneath a game in
  // progress. What's on each clock doesn't change within a sitting; only what
  // it reads does.
  const pool = timeZonePool(countries);

  if (!shapes || !pool.length) {
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

  return <TimeZoneGame {...props} pool={pool} shapes={shapes} />;
}
