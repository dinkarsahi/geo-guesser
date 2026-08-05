import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { cities, type City } from "../data/cities";
import { haversineKm, type Coord } from "../lib/geo";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/** The city on the map nearest a click. */
function cityNear(c: Coord): City {
  let best = cities[0];
  let bestKm = Infinity;
  for (const city of cities) {
    const km = haversineKm(c, city);
    if (km < bestKm) {
      bestKm = km;
      best = city;
    }
  }
  return best;
}

export default function CityLocator({ onExit, night, onToggleNight, settings }: ModeProps) {
  // Cities already carry lat/lng, so the target is its own coordinate. A city is
  // a point, not an area, so this mode scores purely on how close the click is.
  const game = useGame<City>(cities, (c) => c, 2000, { endless: settings.endless });

  return (
    <GameFrame
      title="City Locator"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      renderPrompt={(city) => (
        <div className="prompt-card">
          <span className="prompt-label">Locate this city:</span>
          {/* One phrase, not three lines: the city is picked out by colour
              rather than by being bigger than what follows it. */}
          <span className="prompt-place">
            <span className="prompt-place-name">{city.name}</span>, {city.country}
          </span>
        </div>
      )}
      // A click almost never lands on a city, so the nearest one on the map
      // stands in for what was picked.
      pickedLabel={(click) => {
        const city = cityNear(click);
        return { name: `${city.name} in ${city.country}` };
      }}
      renderResultExtra={(city) => (
        <FactCard title={`${city.name}, ${city.country}`} fact={city.fact} />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap {...props} night={night} borders={settings.borders} />
        ) : (
          <GlobeMap {...props} night={night} borders={settings.borders} />
        )
      }
    />
  );
}
