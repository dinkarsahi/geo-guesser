import { useMemo } from "react";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import NightToggle from "../components/NightToggle";
import WorldMap from "../components/WorldMap";
import { countryPool, type Country } from "../data/countries";
import {
  populationOf,
  populationPool,
  POPULATION_AS_OF,
  POPULATION_NOTE,
  type PopulationTarget,
} from "../data/populations";
import { MAX_ROUND_SCORE, type Coord } from "../lib/geo";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import {
  anchorAt,
  codeOf,
  countryAt,
  isInCountry,
  nameOf,
  useWorldShapes,
  type WorldShapes,
} from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  pool: PopulationTarget[];
  shapes: WorldShapes;
}

/**
 * How forgiving the scoring is, in natural logs of the ratio between the two
 * populations. Every other mode marks a guess on how far away it landed, which
 * here would reward knowing that Japan is near Korea over knowing how many
 * people live in either. So the only thing that counts is the number: a country
 * with the right sort of population scores well wherever on Earth it is.
 *
 * At 1.5, being out by a factor of two still scores 63 and a factor of ten
 * scores 21 — right that Nigeria is huge, wrong that it's China.
 */
const RATIO_SCALE = 1.5;

/** "2.4", "17" — a multiplier, at a precision worth reading. */
const times = (ratio: number) =>
  ratio < 10 ? ratio.toFixed(1) : Math.round(ratio).toLocaleString();

/** Whichever country the click landed in, whether or not it's ever asked about. */
function pickedCountry(
  shapes: WorldShapes,
  byCode: Map<string, Country>,
  guess: Coord,
): { name: string; population: number | null } | null {
  const feature = countryAt(shapes, guess);
  if (!feature) return null;
  const code = codeOf(feature);
  return {
    name: byCode.get(code)?.name || nameOf(feature) || "there",
    population: populationOf(code),
  };
}

function PopulationGame({
  onExit,
  night,
  onToggleNight,
  settings,
  match,
  pool,
  shapes,
}: GameProps) {
  // The map's own name for whatever the click landed in, so the reveal calls a
  // country the same thing whether it was the answer or the mistake.
  const byCode = useMemo(
    () => new Map<string, Country>(pool.map((c) => [c.code, c])),
    [pool],
  );

  const scoreFor = (guess: Coord, target: PopulationTarget) => {
    const picked = pickedCountry(shapes, byCode, guess);
    // Somewhere with no figure on file — the sole case is the naval base in the
    // Indian Ocean, and there's nothing to compare against.
    if (!picked?.population) return { score: 0, label: "No figures for there" };
    const ratio = picked.population / target.population;
    const off = Math.abs(Math.log(ratio));
    return {
      score: Math.round(MAX_ROUND_SCORE * Math.exp(-off / RATIO_SCALE)),
      label:
        ratio >= 1
          ? `${times(ratio)}× too many people`
          : `${times(1 / ratio)}× too few people`,
    };
  };

  // The country is the answer, so anywhere inside its borders is full marks;
  // the coordinates only decide where the reveal flies to. Everything else in
  // the round — the score, and the wording of a miss — comes off the numbers.
  const game = useGame<PopulationTarget>(pool, (c) => c, 2000, {
    endless: settings.endless,
    hitTest: (guess, target) => isInCountry(shapes, target.code, guess),
    scoreGuess: (guess, target) =>
      isInCountry(shapes, target.code, guess)
        ? { score: MAX_ROUND_SCORE, label: "" }
        : scoreFor(guess, target),
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  return (
    <GameFrame
      title="Population Guesser"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      match={match}
      hint={`Click the country you think it is — anywhere inside it counts. Figures are ${POPULATION_AS_OF} estimates.`}
      renderPrompt={(target) => (
        <div className="prompt-card">
          <span className="prompt-label">Which country has a population of</span>
          <span className="prompt-population">
            <span className="prompt-population-count">
              {target.population.toLocaleString()}
            </span>
            <span className="prompt-population-note" title={POPULATION_NOTE}>
              as of {POPULATION_AS_OF}?
            </span>
          </span>
        </div>
      )}
      // The country picked carries a population of its own, and reading it
      // directly above the one that was asked for is what turns a wrong answer
      // into something learned — which is the whole of this mode.
      //
      // Off the click rather than where the marker ended up: the marker sits on
      // the country's anchor, and a handful of those are out at sea or inside a
      // neighbour, which would name the wrong country or none.
      pickedLabel={(click) => {
        const picked = pickedCountry(shapes, byCode, click);
        if (!picked) return null;
        return {
          name:
            picked.population === null
              ? `${picked.name}, which has no figures on file`
              : `${picked.name}, which has a population of ${picked.population.toLocaleString()} people`,
        };
      }}
      // The answer said the same way round as the guess above it, so the two
      // read as one sentence apiece and the figures land under one another.
      // Under it, the asterisk the number has carried since it was asked.
      renderResultExtra={(target) => (
        <div className="fact">
          <strong className="fact-title">
            The answer is {target.name}, which has a population of{" "}
            {target.population.toLocaleString()} people.
          </strong>
          <p className="pop-note muted">* {POPULATION_NOTE}</p>
        </div>
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
          />
        )
      }
    />
  );
}

export default function PopulationGuesser(props: ModeProps) {
  // The countries come from the map data, and a population is no question at
  // all until there's a shape on the map to click for it.
  const shapes = useWorldShapes();
  const pool = populationPool(countryPool(shapes));

  if (!shapes || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              ← Menu
            </button>
            <NightToggle night={props.night} onToggle={props.onToggleNight} />
          </div>
          <h2>Population Guesser</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <PopulationGame {...props} pool={pool} shapes={shapes} />;
}
