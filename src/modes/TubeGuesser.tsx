import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import LondonMap from "../components/LondonMap";
import { nearestStation, tubeStations, type TubeStation } from "../data/tube";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

export default function TubeGuesser({ onExit, night, onToggleNight, settings }: ModeProps) {
  // Tiny scale: on the London map even a few hundred metres matters. Landing in
  // the right station's patch of the map is full marks, though — a station has
  // no borders, so its catchment is the area you're aiming at.
  const game = useGame<TubeStation>(tubeStations, (s) => s, 1.2, {
    endless: settings.endless,
    hitTest: (guess, station) => nearestStation(guess).name === station.name,
  });

  return (
    <GameFrame
      title="Tube Station Guesser"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      hitLabel={(station) => station.name}
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
