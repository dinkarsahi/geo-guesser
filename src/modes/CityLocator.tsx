import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { cities, type City } from "../data/cities";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/** How near a city's point counts as being in the city. */
const CITY_SPOT_ON_KM = 50;

export default function CityLocator({
  onExit,
  settings,
  match,
}: ModeProps) {
  // Cities already carry lat/lng, so the target is its own coordinate, and the
  // round is marked on how close the click landed to it.
  //
  // With fifty kilometres of that for nothing. A city is one point in the data
  // and a sprawl in life — Greater London is fifty across, and its coordinate
  // is a spot in Westminster somebody had to choose. Docklands is London by any
  // reading, and marking it down against Westminster was scoring which part of
  // the city was picked, in a game that asked where the city is. Fifty covers
  // the sprawl of the largest of them, and on the globe it's under a pixel.
  const game = useGame<City>(cities, (c) => c, 2000, {
    rounds: settings.rounds,
    // Counted in only on the globe, which is the one map with an arrival to
    // watch — see `intro`. The flat map is drawn by the time the round opens,
    // so a countdown in front of it is two seconds of nothing.
    intro: !settings.flat,
    spotOnKm: CITY_SPOT_ON_KM,
    ...matchOptions(match),
  });

  return (
    <GameFrame
      title="City Spotter"
      game={game}
      onExit={onExit}
      match={match}
      targetNoun="city"
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
      // No "you picked" line here, unlike the modes that ask for a country or a
      // station. Those are answered by choosing a thing off a list, and naming
      // the wrong thing you chose is the other half of the answer. A city is a
      // point on a map: a click near Lima isn't a vote for some other city, so
      // the nearest one to it was a place you'd never heard of, dug up and
      // announced as your answer. The pin and the line to the real city already
      // say everything true about where you clicked.
      answerLabel={(city) => `${city.name}, ${city.country}`}
      renderResultExtra={(city) => (
        <FactCard title={`${city.name}, ${city.country}`} fact={city.fact} />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap {...props} borders={settings.borders} />
        ) : (
          <GlobeMap {...props} borders={settings.borders} />
        )
      }
    />
  );
}
