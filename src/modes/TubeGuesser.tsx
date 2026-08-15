import { useMemo } from "react";
import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import LondonMap from "../components/LondonMap";
import {
  nearestStation,
  TUBE_SPOT_ON,
  tubeStations,
  zoneLabel,
  type TubeStation,
} from "../data/tube";
import { markNearby, nearbyRadiusKm } from "../data/tubeNearby";
import { matchOptions } from "../lib/match";
import { NO_RINGS, reachNote, reachRing } from "../lib/tubeReach";
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
  // is what costs you — unless the answer is inside that station's own circle,
  // where the ride is replaced by how crowded the circle is. Out in the suburbs
  // the two can be a walk apart and eighteen stops apart, and the thing the
  // player got wrong there was which branch, not where the place is. The right
  // station is full marks either way.
  const game = useGame<TubeStation>(tubeStations, (s) => s, 1.2, {
    rounds: settings.rounds,
    hitTest: (guess, station) => nearestStation(guess).name === station.name,
    scoreGuess: (guess, station) => {
      const mark = markNearby(nearestStation(guess), station);
      return { score: mark.score, label: mark.label };
    },
    ...matchOptions(match),
  });

  // The circle of whatever was just pressed, and nothing before that: it is
  // there to explain the mark, so it arrives with the mark. Held across renders
  // rather than rebuilt, since the map re-projects every circle it is handed a
  // new array of and this draws again whenever the pointer crosses a station.
  const rings = useMemo(
    () => (game.currentGuess ? reachRing(nearestStation(game.currentGuess)) : NO_RINGS),
    [game.currentGuess],
  );

  return (
    <GameFrame
      title="Tube Station Spotter"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      match={match}
      // The right station gets the announcement rather than "Spot on!" — the
      // same words the card and the setup screen promised, paid out.
      fullMarksLabel={TUBE_SPOT_ON}
      // The station whose patch was clicked — the same one the round was
      // scored against, so "6 stops away" below finally says from where. Its
      // circle is named with it, since that circle is drawn on the map and is
      // half of what the round was marked on.
      pickedLabel={(click) => {
        const station = nearestStation(click);
        const km = nearbyRadiusKm(station);
        return {
          name: station.name,
          detail:
            km === null
              ? zoneLabel(station.zone)
              : `${zoneLabel(station.zone)} · circle ${km.toFixed(1)} km`,
        };
      }}
      renderScoreNote={(station, result) =>
        result.click && !result.hit ? reachNote(result.click, station) : null
      }
      hint="Click a station to place your guess."
      measureLabel="Number of stops to destination"
      renderPrompt={(station) => (
        <div className="prompt-card">
          <span className="prompt-label">Find this station:</span>
          <span className="prompt-title">{station.name}</span>
        </div>
      )}
      answerLabel={(station) => station.name}
      renderResultExtra={(station) => (
        <FactCard title={station.name} fact={station.fact} />
      )}
      renderMap={(props) => <LondonMap {...props} night={night} rings={rings} />}
    />
  );
}
