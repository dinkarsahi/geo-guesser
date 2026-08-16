import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { cities, type City } from "../data/cities";
import { NASA_BLUE_MARBLE } from "../lib/mapTiles";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/**
 * The bench, and what it's called on the shelf.
 *
 * Named for what it is rather than for the game it copies, so nobody arrives
 * here expecting their score to go anywhere.
 */
export const SCRAPBOOK_TITLE = "Game Maker's Scrapbook";

/**
 * City Spotter again, kept aside to try things on.
 *
 * A **copy** and not a wrapper, which is the whole point: anything tried here
 * can be got wrong without a real game being got wrong with it. That it is
 * currently identical to `CityLocator` is the starting position and not a
 * property to preserve — the two are meant to come apart, and a change made
 * here is expected to stay here until it has earned its way over.
 *
 * The rules the last bench was built by, which are in CLAUDE.md and worth
 * repeating where they can be broken:
 *
 * - **It is not a `ModeId`.** It's reached by a flag in `App.tsx` and nothing
 *   else. A `ModeId` enters the daily rota, needs a letter in a duel code and a
 *   re-run of `schema.sql`, and an experiment is the last thing to hand
 *   somebody as their round of the day.
 * - **Nothing here is scored anywhere.** It takes no `match`, so there is no
 *   clock on a round, no seeded deal and no leaderboard to file to — see
 *   `matchOptions`, which the copy below deliberately doesn't call.
 * - **It comes down when it's settled its argument.** A copy of a game kept
 *   around past the question it was built to answer collects dust and confusion
 *   in equal measure.
 *
 * When something in here graduates, it *replaces* what City Spotter does rather
 * than standing beside it: one city rule at a time, and it lives in
 * `CityLocator`.
 */

/** How near a city's point counts as being in the city. */
const CITY_SPOT_ON_KM = 50;

export default function CityScrapbook({
  onExit,
  night,
  onToggleNight,
  settings,
}: ModeProps) {
  // Cities already carry lat/lng, so the target is its own coordinate, and the
  // round is marked on how close the click landed to it.
  //
  // With fifty kilometres of that for nothing. A city is one point in the data
  // and a sprawl in life — Greater London is fifty across, and its coordinate
  // is a spot in Westminster somebody had to choose.
  //
  // No `matchOptions` here, unlike the game this copies: a bench can't be
  // played as a duel or as today's round, so there is nothing to hand it.
  const game = useGame<City>(cities, (c) => c, 2000, {
    rounds: settings.rounds,
    spotOnKm: CITY_SPOT_ON_KM,
  });

  return (
    <GameFrame
      title={SCRAPBOOK_TITLE}
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      targetNoun="city"
      renderPrompt={(city) => (
        <div className="prompt-card">
          <span className="prompt-label">Locate this city:</span>
          <span className="prompt-place">
            <span className="prompt-place-name">{city.name}</span>, {city.country}
          </span>
        </div>
      )}
      // No "you picked" line, for the same reason City Spotter has none: a click
      // near Lima isn't a vote for some other city, and naming the nearest one
      // would be inventing an answer the player never gave.
      answerLabel={(city) => `${city.name}, ${city.country}`}
      renderResultExtra={(city) => (
        <FactCard title={`${city.name}, ${city.country}`} fact={city.fact} />
      )}
      // The globe on tiles rather than on one photograph, which is what's being
      // tried here: zooming in should show you more of a place, not more pixels
      // of the same picture. City Spotter is the same round on the plain globe,
      // which is what to hold this against.
      //
      // NASA's, because it's the one that could actually be shipped: public
      // domain, no key, no meter, commercial use fine, and it asks only for the
      // credit line. It stops at level 8 where Esri goes to 17 — the question
      // this bench is now here to answer is whether that's enough for a game
      // about where a city is. Swapping `NASA_TRUE_COLOUR` or
      // `ESRI_WORLD_IMAGERY` in here is the whole of trying the other two.
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            night={night}
            borders={settings.borders}
            tiles={NASA_BLUE_MARBLE}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            tiles={NASA_BLUE_MARBLE}
          />
        )
      }
    />
  );
}
