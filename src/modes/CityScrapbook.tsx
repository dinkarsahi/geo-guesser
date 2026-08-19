import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import ScrapbookGlobe from "../components/ScrapbookGlobe";
import WorldMap from "../components/WorldMap";
import { cities, type City } from "../data/cities";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/**
 * The bench, and what it's called on the shelf.
 *
 * Named for what it is rather than for the game it copies, so nobody arrives
 * here expecting their score to go anywhere.
 */
export const SCRAPBOOK_TITLE = "Game Maker's Scrapbook";

/** How near a city's point counts as being in the city. */
const CITY_SPOT_ON_KM = 50;

/**
 * City Spotter again, kept aside to try things on.
 *
 * A **copy** and not a wrapper, which is the whole point: anything tried here
 * can be got wrong without a real game being got wrong with it. That it starts
 * identical to `CityLocator` is the starting position and not a property to
 * preserve — the two are meant to come apart, and a change made here is
 * expected to stay here until it has earned its way over.
 *
 * The rules a bench lives by, which are in CLAUDE.md and worth repeating where
 * they can be broken:
 *
 * - **It is not a `ModeId`.** It's reached by one route and one card, and
 *   nothing else knows it exists. A `ModeId` enters the daily rota, needs a
 *   letter in a duel code and a re-run of `schema.sql`, and an experiment is
 *   the last thing to hand somebody as their round of the day.
 * - **Nothing here is scored anywhere.** It takes no `match`, so there is no
 *   clock on a round, no seeded deal and no leaderboard to file to — see
 *   `matchOptions`, which the copy below deliberately doesn't call, and which
 *   is the one line of `CityLocator` this file leaves out.
 * - **It comes down when it's settled its argument.** A copy of a game kept
 *   around past the question it was built to answer collects dust and confusion
 *   in equal measure. The last one — the same file, trying the tiled maps
 *   before they went near a real game — came down at `4d95689`.
 *
 * When something in here graduates, it *replaces* what City Spotter does rather
 * than standing beside it: one city rule at a time, and it lives in
 * `CityLocator`.
 *
 * This one is back to try things on the **globe**, which is also the one place
 * an experiment can't be checked by driving the browser: the globe's canvas
 * raycasts from real pointer events, so an automated click on the world lands
 * nowhere. Its zoom buttons are ordinary DOM and can be. Everything else here
 * is judged by eye.
 */
export default function CityScrapbook({ onExit, settings }: ModeProps) {
  // Cities already carry lat/lng, so the target is its own coordinate, and the
  // round is marked on how close the click landed to it — with fifty
  // kilometres of that for nothing, since a city is one point in the data and a
  // sprawl in life.
  const game = useGame<City>(cities, (c) => c, 2000, {
    rounds: settings.rounds,
    // Counted in only on the globe, which is the one map with an arrival to
    // watch — see `intro`. The flat map is drawn by the time the round opens,
    // so a countdown in front of it is two seconds of nothing.
    intro: !settings.flat,
    spotOnKm: CITY_SPOT_ON_KM,
  });

  return (
    <GameFrame
      title={SCRAPBOOK_TITLE}
      game={game}
      onExit={onExit}
      targetNoun="city"
      renderPrompt={(city) => (
        <div className="prompt-card">
          <span className="prompt-label">Locate this city:</span>
          <span className="prompt-place">
            <span className="prompt-place-name">{city.name}</span>, {city.country}
          </span>
        </div>
      )}
      answerLabel={(city) => `${city.name}, ${city.country}`}
      renderResultExtra={(city) => (
        <FactCard title={`${city.name}, ${city.country}`} fact={city.fact} />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap {...props} borders={settings.borders} />
        ) : (
          <ScrapbookGlobe {...props} borders={settings.borders} />
        )
      }
    />
  );
}
