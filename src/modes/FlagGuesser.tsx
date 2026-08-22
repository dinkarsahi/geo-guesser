import { useMemo } from "react";
import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { countryPool, flagUrl, type Country } from "../data/countries";
import { flagFame, flagLadderPool } from "../data/flagLadder";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import {
  anchorAt,
  countryNameAt,
  isInCountry,
  missedCountryCode,
  useWorldShapes,
  type WorldShapes,
} from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  /** The countries this game can ask for — see `FlagGuesser` below. */
  pool: Country[];
  shapes: WorldShapes;
  /** Deal the pool easiest-first rather than shuffled. Today's round only. */
  climbing: boolean;
}

function FlagGame({ onExit, settings, match, pool, shapes, climbing }: GameProps) {
  // The whole country is the target: click anywhere inside its borders for full
  // marks, and miss by however far the country picked is from the right one.
  const game = useGame<Country>(pool, (c) => c, 2000, {
    rounds: settings.rounds,
    // Today's round climbs and the rest of the game doesn't — see `flagLadder`.
    easierBy: climbing ? flagFame : undefined,
    // Counted in only on the globe, which is the one map with an arrival to
    // watch — see `intro`. The flat map is drawn by the time the round opens,
    // so a countdown in front of it is two seconds of nothing.
    intro: !settings.flat,
    hitTest: (guess, country) => isInCountry(shapes, country.code, guess),
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  // The country pressed instead, painted red under the green one — the "you
  // picked Bolivia" line in a form you can see from across the map.
  const missCode = missedCountryCode(shapes, game.lastResult, game.phase === "result");

  return (
    <GameFrame
      title="Flag Spotter"
      game={game}
      onExit={onExit}
      match={match}
      pickedLabel={(click) => {
        const name = countryNameAt(shapes, click);
        return name ? { name } : null;
      }}
      renderPrompt={(country) => (
        <div className="prompt-card">
          <span className="prompt-label">Where is this flag from?</span>
          <img
            className="flag"
            src={flagUrl(country.code)}
            alt="Flag to identify"
            width={168}
          />
        </div>
      )}
      answerLabel={(country) => country.name}
      renderResultExtra={(country) => (
        <FactCard title={country.name} fact={country.fact} />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
            missCode={missCode}
          />
        ) : (
          <GlobeMap
            {...props}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
            missCode={missCode}
          />
        )
      }
    />
  );
}

export default function FlagGuesser(props: ModeProps) {
  // The countries to guess come from the same map data the maps are drawn from,
  // so there's no game to start until it lands.
  const shapes = useWorldShapes();
  const everywhere = countryPool(shapes);

  /**
   * Today's round is dealt from a written ladder of flags, easiest first, and
   * every other way of playing this game is dealt from the whole world.
   *
   * It is the front door: most of the people who see it arrived on a link from
   * a friend and have never played, and a first round asking for a flag nobody
   * has seen is a tab that closes. Off the shelf and in a duel the game stays
   * what it was — somebody who picked Flag Spotter out of seven has chosen the
   * whole world, and a duel is two people who agreed to it.
   */
  const climbing = props.match?.kind === "daily";
  // Memoised because `useGame` keeps its "recently dealt" memory against the
  // identity of the array it was handed. Today's round is seeded and so skips
  // that memory outright, but a pool rebuilt every render is the kind of thing
  // that is only wrong once something else changes.
  const pool = useMemo(
    () => (climbing ? flagLadderPool(everywhere) : everywhere),
    [climbing, everywhere],
  );

  if (!shapes || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              Menu
            </button>
          </div>
          <h2>Flag Spotter</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <FlagGame {...props} pool={pool} shapes={shapes} climbing={climbing} />;
}
