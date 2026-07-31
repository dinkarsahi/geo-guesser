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
  /** How the miss is phrased when distance isn't the measure, e.g. "3 stops away". */
  label?: string;
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
  /**
   * Scores the round on something other than how far the click landed — the
   * tube map counts stops, where metres say little. Also supplies the wording
   * for the miss, since "800 m away" would be the wrong thing to report.
   */
  scoreGuess?: (guess: Coord, target: T) => { score: number; label: string };
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

/** Fisher-Yates shuffle, in place. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * What each pool has already dealt this session, oldest first. A fair shuffle
 * will still hand you the same city two games running often enough to feel
 * broken, so recent targets are held back until the pool has moved on. Keyed by
 * the pool array itself, and only for as long as it's alive.
 */
const dealtBefore = new WeakMap<object, unknown[]>();

/** How much of a pool is off-limits as "just seen" — never more than half. */
const recencyWindow = (poolSize: number) => Math.floor(poolSize / 2);

/** `n` targets from the pool, avoiding the ones dealt most recently. */
function pickTargets<T>(pool: T[], n: number): T[] {
  const key = pool as unknown as object;
  const history = dealtBefore.get(key) ?? [];
  const recent = new Set(history);

  let candidates = pool.filter((t) => !recent.has(t));
  // Asked for more than the pool has left to offer: everything's fair game
  // again, which is also how a free run gets to deal the whole pool.
  if (candidates.length < n) {
    candidates = [...pool];
    history.length = 0;
  }

  const picked = shuffle(candidates).slice(0, Math.min(n, candidates.length));
  dealtBefore.set(key, [...history, ...picked].slice(-recencyWindow(pool.length)));
  return picked;
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
  const { rounds = 5, endless = false, hitTest, scoreGuess } = options;
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
      const scored = scoreGuess?.(guess, target);
      const score =
        scored?.score ?? (hit ? MAX_ROUND_SCORE : scoreFromDistance(distanceKm, scaleKm));
      setCurrentGuess(guess);
      setResults((r) => [
        ...r,
        { guess, answer, distanceKm, score, hit, label: scored?.label },
      ]);
      setPhase("result");
    },
    [phase, target, getCoord, scaleKm, hitTest, scoreGuess],
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
