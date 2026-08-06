import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import NightToggle from "../components/NightToggle";
import WorldMap from "../components/WorldMap";
import { countryPool, flagUrl, type Country } from "../data/countries";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import {
  anchorAt,
  countryNameAt,
  isInCountry,
  useWorldShapes,
  type WorldShapes,
} from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  /** Every country on the map — see `countryPool`. */
  pool: Country[];
  shapes: WorldShapes;
}

function FlagGame({ onExit, night, onToggleNight, settings, match, pool, shapes }: GameProps) {
  // The whole country is the target: click anywhere inside its borders for full
  // marks, and miss by however far the country picked is from the right one.
  const game = useGame<Country>(pool, (c) => c, 2000, {
    rounds: settings.rounds,
    hitTest: (guess, country) => isInCountry(shapes, country.code, guess),
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  return (
    <GameFrame
      title="Flag Guesser"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
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
      renderResultExtra={(country) => (
        <FactCard title={country.name} fact={country.fact} />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
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
            <NightToggle night={props.night} onToggle={props.onToggleNight} />
          </div>
          <h2>Flag Guesser</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <FlagGame {...props} pool={pool} shapes={shapes} />;
}
