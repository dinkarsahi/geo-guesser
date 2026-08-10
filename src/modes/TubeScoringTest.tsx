import { useMemo, useState } from "react";
import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import LondonMap, { type MapRing } from "../components/LondonMap";
import NightToggle from "../components/NightToggle";
import {
  nearestStation,
  tubeStations,
  zoneLabel,
  type TubeStation,
} from "../data/tube";
import { markNearby, nearbyRadiusKm, NEARBY_FROM_ZONE } from "../data/tubeNearby";
import { formatDistance, type Coord } from "../lib/geo";
import { useGame } from "../lib/useGame";
import type { ModeProps } from "./ModeProps";

/** What this version is called wherever it's named. */
export const TUBE_TEST_TITLE = "Tube Station User Scoring Test Version";

/**
 * A copy of Tube Station Spotter for trying out a different way of marking it,
 * and nothing the real game touches — see `src/data/tubeNearby.ts` for the rule
 * and why it exists.
 *
 * It opens on the bench rather than on a game, because a scoring change is
 * argued about in particular cases: this pair of stations, that mark. So both
 * ends of a round are the tester's to choose — name the station being asked
 * for, then click stations around it and watch what each one would have paid,
 * under the new rule and under the one in the game today. Every station's reach
 * is drawn on the map at the same time, so the shape of the rule is visible
 * before a single guess is made.
 *
 * Five rounds of it can be played from the same screen, for the part a table of
 * numbers can't answer: whether it feels fairer.
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

/**
 * Every reach on the map, worked out once.
 *
 * Module-level rather than inside the component, and the strong ring layered on
 * top of it by identity below: the map re-projects the whole set whenever the
 * array it's handed is a new one, and the component re-renders every time the
 * pointer crosses a station.
 */
const REACHES: MapRing[] = tubeStations.flatMap((s) => {
  const km = nearbyRadiusKm(s);
  return km === null ? [] : [{ key: s.name, lat: s.lat, lng: s.lng, km }];
});

const byName = new Map(tubeStations.map((s) => [s.name.toLowerCase(), s]));

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

  // The reach belonging to the station that was pressed, picked out of the
  // hundred-odd faint ones, since it's the only one doing any work.
  const rings = useMemo(
    () =>
      clicked === null
        ? REACHES
        : REACHES.map((r) => (r.key === clicked.name ? { ...r, strong: true } : r)),
    [clicked],
  );

  const mark = answer && clicked ? markNearby(clicked, answer) : null;

  return (
    <div className="game game-play">
      <header className="game-topbar">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={onExit}>
            ← Menu
          </button>
          <NightToggle night={night} onToggle={onToggleNight} />
          <h2 className="lab-title">{TUBE_TEST_TITLE}</h2>
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
            ? `Now click the station a player might have pressed instead of ${answer.name}.`
            : "Click the station a round would ask for — then click what a player might press instead."}
          {" "}Every circle is a station's reach from zone {NEARBY_FROM_ZONE} outwards.
        </p>
      )}

      {mark && answer && clicked && (
        <div className="result-panel hud">
          <div className="result-body">
            <div className="result-headline">
              <span className="result-distance">{mark.label}</span>
              <span className="result-points">{mark.score.toLocaleString()} pts</span>
            </div>

            {/* The whole point of the bench: the same click marked both ways,
                and the difference between them named rather than left to be
                worked out from two numbers on different lines. */}
            <p className="lab-compare">
              <span>
                Today’s scoring: <strong>{mark.todayScore.toLocaleString()}</strong>
              </span>
              <span className={mark.eased ? "lab-delta is-up" : "lab-delta"}>
                {mark.eased
                  ? `+${(mark.score - mark.todayScore).toLocaleString()} from the radius`
                  : "the radius changed nothing here"}
              </span>
            </p>

            <p className="picked-line">
              <span className="picked-label">Clicked</span>
              <span className="picked-name">{clicked.name}</span>
              <span className="picked-detail">
                {zoneLabel(clicked.zone)} ·{" "}
                {mark.radiusKm === null
                  ? "no radius — too far in"
                  : `reach ${mark.radiusKm.toFixed(1)} km`}
              </span>
            </p>
            <p className="picked-line">
              <span className="picked-label">To find</span>
              <span className="picked-name">{answer.name}</span>
              <span className="picked-detail">
                {zoneLabel(answer.zone)} · {formatDistance(mark.km)} away
              </span>
            </p>
            <p className="picked-line">
              <span className="picked-label">The ride</span>
              <span className="picked-name">
                {Number.isFinite(mark.stops)
                  ? `${mark.stops} ${mark.stops === 1 ? "stop" : "stops"}`
                  : "off the network"}
              </span>
              <span className="picked-detail">
                {mark.eased
                  ? `inside the reach, so it counts as ${mark.countedStops}`
                  : "counted as it stands"}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The game itself, played under the test rules — the same five rounds Tube
 * Station Spotter deals, marked by `markNearby` instead of by stops alone, with
 * every station's reach drawn on so a player can see what they're being given.
 *
 * Deliberately not a `ModeId`: it is a copy for judging a rule by, and putting
 * it in the list of games would put it in the daily rota and in duel codes,
 * where half the world would be handed an experiment as their round of the day.
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

  return (
    <GameFrame
      title={TUBE_TEST_TITLE}
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      pickedLabel={(click) => {
        const station = nearestStation(click);
        const km = nearbyRadiusKm(station);
        return {
          name: station.name,
          detail:
            km === null
              ? zoneLabel(station.zone)
              : `${zoneLabel(station.zone)} · reach ${km.toFixed(1)} km`,
        };
      }}
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
      renderMap={(props) => <LondonMap {...props} night={night} rings={REACHES} />}
    />
  );
}
