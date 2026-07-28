import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { countries, flagUrl, type Country } from "../data/countries";
import { useGame } from "../lib/useGame";
import { isInCountry, useWorldShapes } from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

export default function FlagGuesser({ onExit, night, onToggleNight, settings }: ModeProps) {
  // The whole country is the target: click anywhere inside its borders for full
  // marks, and fall back to distance from its centre if you miss.
  const shapes = useWorldShapes();
  const game = useGame<Country>(countries, (c) => c, 2000, {
    endless: settings.endless,
    hitTest: (guess, country) => isInCountry(shapes, country.code, guess),
  });

  return (
    <GameFrame
      title="Flag Guesser"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      hitLabel={(country) => country.name}
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
            highlightCode={game.target.code}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCode={game.target.code}
          />
        )
      }
    />
  );
}
