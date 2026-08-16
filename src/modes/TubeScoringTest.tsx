import { useMemo, useState } from "react";
import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import LondonMap from "../components/LondonMap";
import NightToggle from "../components/NightToggle";
import {
  nearestStation,
  tubeStations,
  zoneLabel,
  type TubeStation,
} from "../data/tube";
import {
  markNearby,
  NEARBY_BOUNDARY_KM,
  NEARBY_FROM_ZONE,
  NEARBY_STEP_KM,
} from "../data/tubeNearby";
import { formatDistance, type Coord } from "../lib/geo";
import { creditNote, NO_RINGS, paidRing, reachRing } from "../lib/tubeReach";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/** What this bench is called wherever it's named. */
export const GAME_MAKER_TITLE = "Game Maker Test Version";

/**
 * The workshop where a way of marking a game is tried out on particular cases
 * before it is let anywhere near a score — see `src/data/tubeNearby.ts` for the
 * rule it was built for and why that rule exists.
 *
 * That rule has since graduated into Tube Station Spotter, so the two columns
 * are no longer a proposal against the status quo: they are the ride on its own
 * against what the game now charges, which is the comparison that shows what
 * the circle is buying. The bench outlives the argument it settled because the
 * working is the useful part — any later change to the marking is argued here
 * first, on this pair of stations and that mark.
 *
 * So both ends of a round are the tester's to choose: name the station being
 * asked for, then click stations around it and watch what each one pays. The
 * reach is drawn around the station that was pressed and around no other — it
 * is a claim about one click, and a hundred discs across outer London showed
 * the rule without showing the round.
 *
 * Five rounds of it can be played from the same screen, for the part a table of
 * numbers can't answer: whether it feels fair.
 */
export default function TubeScoringTest(props: Omit<ModeProps, "match">) {
  const [view, setView] = useState<"bench" | "play">("bench");
  return view === "play" ? (
    // Out of a game goes back to the bench rather than all the way to the menu:
    // whoever played it did so to judge the rule, and the next thing they want
    // is the case that bothered them.
    <TestGame {...props} onExit={() => setView("bench")} />
  ) : (
    <ScoringBench {...props} onPlay={() => setView("play")} />
  );
}

const byName = new Map(tubeStations.map((s) => [s.name.toLowerCase(), s]));

/** How much a zone adds to the reach, as the panel says it: "400 m". */
const PER_ZONE_KM_LABEL = formatDistance(NEARBY_STEP_KM);

/** And what a boundary station gives up for being half in the inner zone. */
const BOUNDARY_LABEL = formatDistance(NEARBY_BOUNDARY_KM);

/** "18 stops", "1 stop" — a count for a table cell, where the unit has to travel with it. */
const stopCount = (stops: number) =>
  Number.isFinite(stops) ? `${stops} ${stops === 1 ? "stop" : "stops"}` : "off the network";

/** The list every station box picks from, spelled the way the map spells them. */
const STATION_NAMES = tubeStations.map((s) => s.name).sort((a, b) => a.localeCompare(b));

function ScoringBench({
  onExit,
  night,
  onToggleNight,
  onPlay,
}: Omit<ModeProps, "match" | "settings"> & { onPlay: () => void }) {
  /** The station the round would have asked for. */
  const [answer, setAnswer] = useState<TubeStation | null>(null);
  /** And the one a player pressed instead. */
  const [clicked, setClicked] = useState<TubeStation | null>(null);
  // What's in the two boxes, which isn't the same thing as what's been chosen:
  // half a name typed is not a station yet, and mustn't clear the one on screen.
  const [answerText, setAnswerText] = useState("");
  const [clickedText, setClickedText] = useState("");

  const chooseAnswer = (s: TubeStation) => {
    setAnswer(s);
    setAnswerText(s.name);
  };
  const chooseClicked = (s: TubeStation) => {
    setClicked(s);
    setClickedText(s.name);
  };

  /**
   * A press on the map fills whichever end is still empty, and after that keeps
   * replacing the guess — which is the way the bench is actually used: one
   * station to find, then station after station around it.
   */
  const onMapPress = (c: Coord) => {
    const station = nearestStation(c);
    if (!answer) chooseAnswer(station);
    else chooseClicked(station);
  };

  const typed = (text: string, choose: (s: TubeStation) => void) => {
    const found = byName.get(text.trim().toLowerCase());
    if (found) choose(found);
  };

  const clear = () => {
    setAnswer(null);
    setClicked(null);
    setAnswerText("");
    setClickedText("");
  };

  // Held across renders rather than rebuilt: the map re-projects every circle
  // it's handed a new array of, and this component draws again whenever the
  // pointer crosses a station.
  const rings = useMemo(() => (clicked === null ? NO_RINGS : reachRing(clicked)), [clicked]);

  const mark = answer && clicked ? markNearby(clicked, answer) : null;

  return (
    <div className="game game-play">
      <header className="game-topbar">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={onExit}>
            ← Menu
          </button>
          <NightToggle night={night} onToggle={onToggleNight} />
          <h2 className="lab-title">{GAME_MAKER_TITLE}</h2>
        </div>

        <div className="prompt lab-picks">
          <label className="lab-pick">
            <span className="prompt-label">Station to find</span>
            <input
              className="lab-input"
              list="tube-station-names"
              value={answerText}
              placeholder="King's Cross St. Pancras"
              onChange={(e) => {
                setAnswerText(e.target.value);
                typed(e.target.value, chooseAnswer);
              }}
            />
          </label>
          <label className="lab-pick">
            <span className="prompt-label">Player clicked</span>
            <input
              className="lab-input"
              list="tube-station-names"
              value={clickedText}
              placeholder="…or click the map"
              onChange={(e) => {
                setClickedText(e.target.value);
                typed(e.target.value, chooseClicked);
              }}
            />
          </label>
          <datalist id="tube-station-names">
            {STATION_NAMES.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>

        <div className="game-stats lab-actions">
          <button className="btn btn-ghost" onClick={clear} disabled={!answer && !clicked}>
            Clear
          </button>
          <button className="btn btn-primary" onClick={onPlay}>
            Play 5 rounds ▸
          </button>
        </div>
      </header>

      <div className="map-layer">
        <LondonMap
          onGuess={onMapPress}
          guess={clicked}
          answer={answer}
          disabled={false}
          night={night}
          rings={rings}
          // The view is the tester's: they zoom into the corner of the map they
          // are arguing about and stay there while they try stations in it.
          autoView={false}
        />
      </div>

      {!mark && (
        <p className="hint muted hud">
          {answer
            ? `Now click the station a player might have pressed instead of ${answer.name} — its reach is drawn around it.`
            : "Click the station a round would ask for — then click what a player might press instead."}
          {" "}Stations from zone {NEARBY_FROM_ZONE} outwards have a reach.
        </p>
      )}

      {mark && answer && clicked && (
        <div className="result-panel hud">
          <div className="result-body">
            <p className="lab-pair">
              <strong>{clicked.name}</strong> clicked, <strong>{answer.name}</strong> wanted
              <span className="muted"> · {formatDistance(mark.km)} apart</span>
            </p>

            {/* The whole point of the bench: the same click marked both ways,
                side by side, so the two are read against each other rather
                than found on two different lines. A real table, because the
                columns have to line up with the heading that names them.

                The left column is the ride on its own — what the game charged
                before the circle, and still the fallback wherever the circle
                doesn't reach. The right is what it charges now. */}
            <table className="lab-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Measure</span>
                  </th>
                  <th scope="col">Ride alone</th>
                  <th scope="col">With the circle</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Stops</th>
                  <td>{stopCount(mark.stops)}</td>
                  <td className={mark.eased ? "is-up" : undefined}>
                    {stopCount(mark.countedStops)}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Points</th>
                  <td className="lab-points">{mark.rideScore.toLocaleString()}</td>
                  {/* Green on the marks, not on the stops: a rule that took
                      fourteen stops off the ride and left the score where it
                      was has changed nothing worth colouring. */}
                  <td className={`lab-points${mark.score > mark.rideScore ? " is-up" : ""}`}>
                    {mark.score.toLocaleString()}
                    {mark.score > mark.rideScore && (
                      <span className="lab-delta">
                        {" "}
                        +{(mark.score - mark.rideScore).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* How the right-hand column got its number, in words, including
                how big the reach is and why that size — the two questions the
                figure raises the moment it differs from the one beside it. */}
            <p className="lab-working">
              {mark.radiusKm === null ? (
                <>
                  {clicked.name} is in {zoneLabel(clicked.zone)}, too far in to have a
                  circle — inside the zone {NEARBY_FROM_ZONE - 1}/{NEARBY_FROM_ZONE}
                  {" "}boundary the stations sit on top of one another and being near one
                  narrows nothing down. So the ride stands.
                </>
              ) : (
                <>
                  {clicked.name} is in {zoneLabel(clicked.zone)}, so its circle has a
                  radius of <strong>{mark.radiusKm.toFixed(1)} km</strong> — about one
                  station’s gap on this part of the map, so it holds the stations that
                  could plausibly have been meant and stops there. It widens{" "}
                  {PER_ZONE_KM_LABEL} a zone because the gaps do
                  {Number.isInteger(clicked.zone)
                    ? ""
                    : `, and a boundary station takes the outer zone's circle less ${BOUNDARY_LABEL} for being only half in it`}
                  .{" "}
                  {mark.covered ? (
                    <>
                      {mark.neighbours === 0
                        ? "No other station is inside it"
                        : `${mark.neighbours} other ${
                            mark.neighbours === 1 ? "station is" : "stations are"
                          } inside it`}
                      , so an answer inside counts as <strong>{mark.reachStops}</strong>{" "}
                      {mark.reachStops === 1 ? "stop" : "stops"} — and{" "}
                      {mark.countedStops === mark.reachStops
                        ? "that beats the ride."
                        : "the ride was already better."}
                    </>
                  ) : (
                    <>{answer.name} falls outside it, so the ride stands.</>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The game itself — the same five rounds Tube Station Spotter deals, marked the
 * same way, with the pressed station's reach drawn on so a player can see what
 * they're being given.
 *
 * It is a copy rather than the game, so the next rule to be tried can be tried
 * on it without anybody's score depending on the answer. Deliberately not a
 * `ModeId`: putting it in the list of games would put it in the daily rota and
 * in duel codes, where half the world would be handed an experiment as their
 * round of the day.
 */
function TestGame({ onExit, night, onToggleNight, settings }: Omit<ModeProps, "match">) {
  const game = useGame<TubeStation>(tubeStations, (s) => s, 1.2, {
    rounds: settings.rounds,
    hitTest: (guess, station) => nearestStation(guess).name === station.name,
    scoreGuess: (guess, station) => {
      const mark = markNearby(nearestStation(guess), station);
      return { score: mark.score, label: mark.label };
    },
  });

  // A round shows the circle exactly where the game does — on the rounds it
  // paid for. The bench above draws it for any pick, because up there the
  // circle is the thing being examined; down here it is a round being played,
  // and it has to look like one.
  const rings = useMemo(
    () => (game.currentGuess ? paidRing(game.currentGuess, game.target) : NO_RINGS),
    [game.currentGuess, game.target],
  );

  return (
    <GameFrame
      title={GAME_MAKER_TITLE}
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      pickedLabel={(click) => {
        const station = nearestStation(click);
        return { name: station.name, detail: zoneLabel(station.zone) };
      }}
      // The same sentence the game gives, since this is meant to be the game:
      // a bench whose rounds explain themselves differently is a bench that
      // can't be trusted about the thing it's a copy of. The radius and the
      // arithmetic are still a click away, on the bench itself.
      renderScoreNote={(station, result) =>
        result.click && !result.hit ? creditNote(result.click, station) : null
      }
      hint="Click a station to place your guess."
      measureLabel="Stops to destination"
      renderPrompt={(station) => (
        <div className="prompt-card">
          <span className="prompt-label">Find this station:</span>
          <span className="prompt-title">{station.name}</span>
        </div>
      )}
      answerLabel={(station) => station.name}
      renderResultExtra={(station) => <FactCard title={station.name} fact={station.fact} />}
      renderMap={(props) => <LondonMap {...props} night={night} rings={rings} />}
    />
  );
}
