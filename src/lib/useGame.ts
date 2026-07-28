import { useCallback, useState } from "react";
import { haversineKm, scoreFromDistance, MAX_ROUND_SCORE, type Coord } from "./geo";

export type Phase = "guessing" | "result" | "done";

export interface RoundResult {
  guess: Coord;
  answer: Coord;
  distanceKm: number;
  score: number;
  /** The guess landed inside the target's own area (country, station…). */
  hit: boolean;
}

export interface GameOptions<T> {
  /** Rounds in a scored game. Ignored when `endless` is set. */
  rounds?: number;
  /** Free run: keep dealing targets until the player calls it a day. */
  endless?: boolean;
  /**
   * Full marks when the guess lands inside the target's own area — anywhere in
   * the right country, anywhere in the right station's patch. Modes without one
   * (a city is a point) just score on distance.
   */
  hitTest?: (guess: Coord, target: T) => boolean;
}

export interface Game<T> {
  /** The target the player is currently trying to locate. */
  target: T;
  roundIndex: number;
  /** Rounds in this game, or null in a free run. */
  totalRounds: number | null;
  phase: Phase;
  /** The player's guess for the current round (shown as a marker). */
  currentGuess: Coord | null;
  /** Result of the round just played (valid during "result" and "done"). */
  lastResult: RoundResult | null;
  results: RoundResult[];
  totalScore: number;
  submitGuess: (c: Coord) => void;
  next: () => void;
  /** Ends a free run and shows the summary. */
  endRun: () => void;
  restart: () => void;
}

/** Fisher-Yates shuffle, then take the first `n`. */
function pickTargets<T>(pool: T[], n: number): T[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(n, arr.length));
}

/**
 * Drives a round-based game shared by every mode — either a fixed number of
 * scored rounds or an open-ended free run.
 *
 * @param pool     every possible target
 * @param getCoord maps a target to its true location
 * @param scaleKm  scoring forgiveness (see scoreFromDistance)
 */
export function useGame<T>(
  pool: T[],
  getCoord: (t: T) => Coord,
  scaleKm: number,
  options: GameOptions<T> = {},
): Game<T> {
  const { rounds = 5, endless = false, hitTest } = options;
  // A free run deals the whole pool, reshuffled again whenever it runs dry.
  const dealt = endless ? pool.length : rounds;

  const [targets, setTargets] = useState(() => pickTargets(pool, dealt));
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("guessing");
  const [currentGuess, setCurrentGuess] = useState<Coord | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);

  const target = targets[roundIndex];

  const submitGuess = useCallback(
    (guess: Coord) => {
      if (phase !== "guessing") return;
      const answer = getCoord(target);
      const distanceKm = haversineKm(guess, answer);
      const hit = hitTest?.(guess, target) ?? false;
      const score = hit ? MAX_ROUND_SCORE : scoreFromDistance(distanceKm, scaleKm);
      setCurrentGuess(guess);
      setResults((r) => [...r, { guess, answer, distanceKm, score, hit }]);
      setPhase("result");
    },
    [phase, target, getCoord, scaleKm, hitTest],
  );

  const next = useCallback(() => {
    if (phase !== "result") return;
    const upcoming = roundIndex + 1;
    if (upcoming >= targets.length) {
      if (!endless) {
        setPhase("done");
        return;
      }
      // Free run: deal another shuffled pass through the pool.
      setTargets((t) => [...t, ...pickTargets(pool, pool.length)]);
    }
    setRoundIndex(upcoming);
    setCurrentGuess(null);
    setPhase("guessing");
  }, [phase, roundIndex, targets.length, endless, pool]);

  const endRun = useCallback(() => setPhase("done"), []);

  const restart = useCallback(() => {
    setTargets(pickTargets(pool, dealt));
    setRoundIndex(0);
    setCurrentGuess(null);
    setResults([]);
    setPhase("guessing");
  }, [pool, dealt]);

  return {
    target,
    roundIndex,
    totalRounds: endless ? null : targets.length,
    phase,
    currentGuess,
    lastResult: results.length ? results[results.length - 1] : null,
    results,
    totalScore: results.reduce((sum, r) => sum + r.score, 0),
    submitGuess,
    next,
    endRun,
    restart,
  };
}
