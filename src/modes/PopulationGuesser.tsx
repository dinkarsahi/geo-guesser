import { useMemo } from "react";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
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
  missedCountryCode,
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
 * Squared in the exponent, like the distance modes and the tube map: the curve
 * leaves its top slowly and then falls off, rather than charging most for the
 * first step away from the answer. At 2, and marked out of `NEAR_COUNTRY_MAX`,
 * being out by half again scores 91 and a factor of two 84 — both of which are
 * knowing roughly how many people live there, which is most of what the
 * question asked. A factor of ten is 25 and a factor of fifty near enough
 * nothing.
 */
const RATIO_SCALE = 2;

/**
 * The most a country that isn't the answer can be worth.
 *
 * The question is which country has that many people in it, and there is one
 * right answer to it. Marked on the number alone, a guess at the wrong country
 * with a population within a few per cent of the right one rounded to a full
 * hundred — the game's word for "you found it" — handed out for not finding it.
 *
 * So the whole curve is marked out of this instead, and the last five points
 * belong to the country. Nothing else changes: knowing that about 12 million
 * people live somewhere is still nearly all of the question, and is still paid
 * as such. What it stops is the panel calling a miss a perfect answer.
 */
const NEAR_COUNTRY_MAX = 95;

/**
 * What makes one of these rounds easier than another, for `useGame`'s climbing
 * deal: how many people live there. Held at module scope so the game is handed
 * the same function every render rather than a fresh one.
 *
 * The pool is every country on the map, and most countries are small — dealt
 * flat, a game was as likely to ask for five islands nobody could place as for
 * anywhere anyone had heard of. Nothing has been taken out of the pool; the
 * rounds are just dealt from the big end first, so a game climbs.
 */
const byPopulation = (c: PopulationTarget) => c.population;

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
    const off = Math.abs(Math.log(ratio)) / RATIO_SCALE;
    const factor = ratio >= 1 ? ratio : 1 / ratio;
    return {
      score: Math.round(NEAR_COUNTRY_MAX * Math.exp(-off * off)),
      // A factor that prints as "1.0×" is a country with the same population as
      // the answer, and "1.0× too many people" describes that as a mistake in
      // the number when the number was right and the country wasn't.
      label:
        times(factor) === "1.0"
          ? "The right sort of number, the wrong country"
          : ratio >= 1
            ? `${times(ratio)}× too many people`
            : `${times(1 / ratio)}× too few people`,
    };
  };

  // The country is the answer, so anywhere inside its borders is full marks;
  // the coordinates only decide where the reveal flies to. Everything else in
  // the round — the score, and the wording of a miss — comes off the numbers.
  const game = useGame<PopulationTarget>(pool, (c) => c, 2000, {
    rounds: settings.rounds,
    hitTest: (guess, target) => isInCountry(shapes, target.code, guess),
    scoreGuess: (guess, target) =>
      isInCountry(shapes, target.code, guess)
        ? { score: MAX_ROUND_SCORE, label: "" }
        : scoreFor(guess, target),
    guessAt: (guess) => anchorAt(shapes, guess),
    // Rounds that get harder as the game goes on: the first is dealt from the
    // most populous fifth of the world and the last from the least.
    easierBy: byPopulation,
    ...matchOptions(match),
  });

  // The country pressed instead, painted red under the green one. It matters
  // more here than anywhere: the guess is scored on a number rather than on
  // where it landed, so the pin can be a continent away from the answer and
  // still have been a decent answer, and the two countries want comparing.
  const missCode = missedCountryCode(shapes, game.lastResult, game.phase === "result");

  return (
    <GameFrame
      title="Population Spotter"
      game={game}
      onExit={onExit}
      match={match}
      hint={`Click the country you think it is — anywhere inside it counts. Figures are ${POPULATION_AS_OF} estimates.`}
      // Not a distance, whatever the other world modes head this column with:
      // the round is marked on the number of people and never on where the
      // click landed, and the column holds "17× too many people".
      measureLabel="Difference in population"
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
      // The question was a number, so the country is the whole of the answer.
      answerLabel={(target) => target.name}
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
            borders={settings.borders}
            highlightCodes={[game.target.code]}
            missCode={missCode}
          />
        ) : (
          <GlobeMap
            {...props}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
            missCode={missCode}
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
          </div>
          <h2>Population Spotter</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <PopulationGame {...props} pool={pool} shapes={shapes} />;
}
