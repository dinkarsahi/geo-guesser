import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import NewYorkMap from "../components/NewYorkMap";
import { scoreFromStops } from "../data/tube";
import {
  formatStops,
  nearestStation,
  stopsBetween,
  subwayStations,
  type SubwayStation,
} from "../data/subway";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/**
 * Subway Spotter — Tube Station Spotter, in New York.
 *
 * The same game and the same marking: whichever station's patch of the map you
 * clicked counts as your answer, and the ride from there to the right one is
 * what costs you. Distance across the ground is a poor guide in both cities —
 * two stations either side of the East River are a few hundred metres and half
 * an hour apart — which is why this is counted in stops and not in metres.
 *
 * `scoreFromStops` is imported from the tube's own module rather than copied,
 * so both games are marked on **one curve**. A second copy of that curve would
 * be right on the day it was written and free to drift after it, and two
 * station games scored differently is two games nobody can compare.
 *
 * **Three things London has that this does not**, and all three are facts about
 * the networks rather than features left out:
 *
 * - **No fare zones**, so no bands to shade the map in and nothing to size a
 *   circle from. New York has a flat fare.
 * - **No Mind the Gap.** London's rule is sized off the zone; there is no zone
 *   here to size it from. This is marked on the ride alone.
 * - **Repeated names.** London has no two stations called the same thing. New
 *   York has four called 86 St, so a repeated name carries its routes —
 *   "86 St (4·5·6)" — which is how New Yorkers tell them apart.
 *
 * **Not a `ModeId`, and not on the shelf.** Reached only at
 * `/gamemakersscrapbook/subwayspotter`. Graduating it is the same list as
 * Export Spotter's — see `ExportGuesser`.
 */
export default function SubwayGuesser({ onExit, settings, match }: ModeProps) {
  const game = useGame<SubwayStation>(subwayStations, (s) => s, 1.2, {
    rounds: settings.rounds,
    // No arrival to wait for: the map is drawn from coordinates the moment the
    // round opens, so a countdown in front of it would be seconds spent
    // looking at a map you could already have been reading.
    intro: false,
    hitTest: (guess, station) => nearestStation(guess).name === station.name,
    scoreGuess: (guess, station) => {
      const stops = stopsBetween(nearestStation(guess).name, station.name);
      return { score: scoreFromStops(stops), label: formatStops(stops) };
    },
    ...matchOptions(match),
  });

  return (
    <GameFrame
      title="Subway Spotter"
      game={game}
      onExit={onExit}
      match={match}
      // Stops rather than kilometres, in the table as on the panel: this game
      // is not marked on distance and a column of distances would be a
      // measurement of something nobody was scored on.
      measureLabel="Stops away"
      hint="Click the station on the map."
      // What was pressed instead. The tube names the station you landed on for
      // the same reason: being told the answer was Astor Place teaches half as
      // much as also being told you pointed at Bleecker Street.
      pickedLabel={(click) => {
        const at = nearestStation(click);
        return { name: at.name, detail: `${at.borough} · ${at.routes.join("·")}` };
      }}
      renderPrompt={(station) => (
        <div className="prompt-card">
          <span className="prompt-label">Find this station:</span>
          <span className="prompt-station">{station.name}</span>
        </div>
      )}
      answerLabel={(station) => station.name}
      renderResultExtra={(station) => (
        <FactCard title={station.name} fact={station.fact} />
      )}
      renderMap={(props) => <NewYorkMap {...props} dark={settings.tubeDark} />}
    />
  );
}
