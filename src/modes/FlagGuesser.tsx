import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { countryPool, flagUrl, type Country } from "../data/countries";
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
  /** Every country on the map — see `countryPool`. */
  pool: Country[];
  shapes: WorldShapes;
}

function FlagGame({ onExit, settings, match, pool, shapes }: GameProps) {
  // The whole country is the target: click anywhere inside its borders for full
  // marks, and miss by however far the country picked is from the right one.
  const game = useGame<Country>(pool, (c) => c, 2000, {
    rounds: settings.rounds,
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
  const pool = countryPool(shapes);

  if (!shapes || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              ← Menu
            </button>
          </div>
          <h2>Flag Spotter</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <FlagGame {...props} pool={pool} shapes={shapes} />;
}
