import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { cities, type City } from "../data/cities";
import { haversineKm, type Coord } from "../lib/geo";
import { useGame } from "../lib/useGame";
import { countryNameAt, useWorldShapes } from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

/**
 * How near a city has to be for the click to count as having landed by it.
 * The pool is 196 cities for the whole world, so the nearest one to a click is
 * routinely a country or two away and naming it would be worse than saying
 * nothing. Inside this, "near" is honest at the scale of a world map.
 */
const NEAR_KM = 300;

/** The pool city the click landed beside, if it landed beside one at all. */
function cityNear(c: Coord): City | null {
  let best: City | null = null;
  let bestKm = NEAR_KM;
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
  // Only to name the country a click landed in — this mode asks for a point,
  // so the shapes have no part in the scoring and a round plays fine without
  // them. The line below is simply left off until they arrive.
  const shapes = useWorldShapes();

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
      // A city is a point and a click almost never lands on one, so what the
      // player picked is really the country they pointed at — with the nearest
      // city named too on the occasions there's one close enough to mean it.
      pickedLabel={(click) => {
        const country = countryNameAt(shapes, click);
        if (!country) return null;
        const near = cityNear(click);
        return { name: country, detail: near ? `near ${near.name}` : undefined };
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
