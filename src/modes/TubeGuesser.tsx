import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import LondonMap from "../components/LondonMap";
import {
  formatStops,
  nearestStation,
  scoreFromStops,
  stopsBetween,
  tubeStations,
  zoneLabel,
  type TubeStation,
} from "../data/tube";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

export default function TubeGuesser({
  onExit,
  night,
  onToggleNight,
  settings,
  match,
}: ModeProps) {
  // Scored in stops, not metres: distance on the London map is a poor guide to
  // whether you knew where a station was. Whichever station's patch of the map
  // you clicked counts as your answer, and the ride from there to the right one
  // is what costs you. The right station is full marks.
  const game = useGame<TubeStation>(tubeStations, (s) => s, 1.2, {
    rounds: settings.rounds,
    hitTest: (guess, station) => nearestStation(guess).name === station.name,
    scoreGuess: (guess, station) => {
      const stops = stopsBetween(nearestStation(guess).name, station.name);
      return { score: scoreFromStops(stops), label: formatStops(stops) };
    },
    ...matchOptions(match),
  });

  return (
    <GameFrame
      title="Tube Station Guesser"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      match={match}
      // The station whose patch was clicked — the same one the round was
      // scored against, so "6 stops away" below finally says from where.
      pickedLabel={(click) => {
        const station = nearestStation(click);
        return { name: station.name, detail: zoneLabel(station.zone) };
      }}
      hint="Click a station to place your guess."
      renderPrompt={(station) => (
        <div className="prompt-card">
          <span className="prompt-label">Find this station:</span>
          <span className="prompt-title">{station.name}</span>
        </div>
      )}
      renderResultExtra={(station) => (
        <FactCard title={station.name} fact={station.fact} />
      )}
      renderMap={(props) => <LondonMap {...props} night={night} />}
    />
  );
}
