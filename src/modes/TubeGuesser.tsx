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
import { markNearby } from "../data/tubeNearby";
import { matchOptions } from "../lib/match";
import { creditNote, gapCall, NO_RINGS, paidRing } from "../lib/tubeReach";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

export default function TubeGuesser({
  onExit,
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
    // No arrival to wait for: the tube map is drawn from coordinates the
    // moment the round opens, so a countdown in front of it would be two
    // seconds of looking at a map you could already have been reading.
    intro: false,
    hitTest: (guess, station) => nearestStation(guess).name === station.name,
    scoreGuess: (guess, station) => {
      const mark = markNearby(nearestStation(guess), station);
      return { score: mark.score, label: mark.label };
    },
    ...matchOptions(match),
  });

  // The circle, on the rounds it paid for and no others: it is there to explain
  // a mark that is kinder than the ride, and on a round charged as the ride
  // there is nothing for it to explain. Held across renders rather than rebuilt,
  // since the map re-projects every circle it is handed a new array of and this
  // draws again whenever the pointer crosses a station.
  const rings = useMemo(
    () => (game.currentGuess ? paidRing(game.currentGuess, game.target) : NO_RINGS),
    [game.currentGuess, game.target],
  );

  return (
    <GameFrame
      title="Tube Station Spotter"
      game={game}
      onExit={onExit}
      match={match}
      // The right station gets the announcement rather than "Spot on!" — the
      // same words the card and the setup screen promised, paid out.
      fullMarksLabel={TUBE_SPOT_ON}
      // The station whose patch was clicked — the same one the round was
      // scored against, so "6 stops away" above finally says from where. Its
      // zone and nothing else: the radius belongs to the rounds the circle
      // actually paid for, and printed on every miss it was a measurement in
      // search of a reason.
      pickedLabel={(click) => {
        const station = nearestStation(click);
        return { name: station.name, detail: zoneLabel(station.zone) };
      }}
      renderScoreCall={(station, result) =>
        result.click && !result.hit ? gapCall(result.click, station) : null
      }
      renderScoreNote={(station, result) =>
        result.click && !result.hit ? creditNote(result.click, station) : null
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
      renderMap={(props) => (
        <LondonMap {...props} rings={rings} dark={settings.tubeDark} />
      )}
    />
  );
}
