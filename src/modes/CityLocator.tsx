import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { cities, type City } from "../data/cities";
import { formatDistance, haversineKm, type Coord } from "../lib/geo";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/** The city on the map nearest the click, and how far off the click was. */
function cityNear(c: Coord): { city: City; km: number } {
  let city = cities[0];
  let km = Infinity;
  for (const candidate of cities) {
    const d = haversineKm(c, candidate);
    if (d < km) {
      km = d;
      city = candidate;
    }
  }
  return { city, km };
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
      // stands in for what was picked — with the distance to it alongside,
      // which is what keeps that honest. Land on Barcelona and it reads as
      // picking Barcelona; land in the Pyrenees and the figure says otherwise.
      pickedLabel={(click) => {
        const { city, km } = cityNear(click);
        return {
          name: `${city.name} in ${city.country}`,
          detail: `${formatDistance(km)} from your click`,
        };
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
