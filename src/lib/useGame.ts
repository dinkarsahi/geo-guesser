import { useCallback, useEffect, useRef, useState } from "react";
import { haversineKm, scoreFromDistance, MAX_ROUND_SCORE, type Coord } from "./geo";

export type Phase = "guessing" | "result" | "done";

export interface RoundResult {
  /** Where the guess counts as having been made — see `guessAt`. Null if the clock beat the player to it. */
  guess: Coord | null;
  /**
   * Where the player actually pressed. The same as `guess` unless the mode
   * moves it, and then still the only thing that says which country was picked
   * — an anchor can sit in open water (New Zealand's is in Cook Strait) or in
   * a neighbour (the Vatican's is inside Rome).
   */
  click: Coord | null;
  answer: Coord;
  distanceKm: number;
  score: number;
  /** The guess landed inside the target's own area (country, station…). */
  hit: boolean;
  /** How the miss is phrased when distance isn't the measure, e.g. "3 stops away". */
  label?: string;
  /** How long the round took. Only meaningful when there's a clock on it. */
  elapsedMs: number;
  /** The round ran out with nothing clicked: no guess, no marks. */
  timedOut: boolean;
}

export interface GameOptions<T> {
  /** Rounds the game runs to. */
  rounds?: number;
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
  /**
   * Where the answer is, when the target has more than one right place to be.
   * A currency is spent across twenty countries and the one worth showing is
   * whichever was nearest the guess — both to score against and to fly to.
   */
  answerFor?: (guess: Coord, target: T) => Coord;
  /**
   * Where a click counts as having been made. Modes that ask for a country
   * rather than a place put every guess on that country's anchor, so the round
   * is marked on which country was picked and not on where in it the cursor
   * landed. The marker moves there too: the pin belongs on the country the
   * player chose, not on the pixel they chose it with.
   *
   * Only distance uses it. `hitTest` and `scoreGuess` still see the raw click,
   * which is what the player actually pointed at and the only thing that can
   * tell a click on Malaysia apart from one on the Singapore marker beside it.
   */
  guessAt?: (guess: Coord) => Coord;
  /**
   * Deal from this seed rather than at random. Two devices given the same seed
   * deal the same rounds in the same order, which is the whole of how a
   * head-to-head match works without a server between them. Seeded games skip
   * the "recently seen" memory below — it differs from device to device, and
   * two players must be asked the same questions above all else.
   */
  seed?: number;
  /** Milliseconds allowed per round. The round scores nothing if it runs out. */
  roundLimitMs?: number;
  /** Reshapes a round's score once it's known — a match pays for speed here. */
  adjustScore?: (score: number, elapsedMs: number) => number;
}

export interface Game<T> {
  /** The target the player is currently trying to locate. */
  target: T;
  roundIndex: number;
  /** Rounds in this game. */
  totalRounds: number;
  phase: Phase;
  /** The player's guess for the current round (shown as a marker). */
  currentGuess: Coord | null;
  /** Result of the round just played (valid during "result" and "done"). */
  lastResult: RoundResult | null;
  results: RoundResult[];
  totalScore: number;
  submitGuess: (c: Coord) => void;
  next: () => void;
  restart: () => void;
  /** Milliseconds left in this round, or null when nothing is timing it. */
  timeLeftMs: number | null;
  /** How long the whole game has taken so far, summed over its rounds. */
  totalMs: number;
}

/** Fisher-Yates shuffle, in place, from whichever source of chance is given. */
function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Mulberry32: a seeded generator small enough to read, which matters more here
 * than the quality of its randomness. Both players' devices run this same
 * arithmetic on the same seed and must come out with the same five rounds, so
 * it's written out rather than depended upon.
 */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
function pickTargets<T>(pool: T[], n: number, seed?: number): T[] {
  // A seeded deal is a promise to another device that it will get these same
  // targets, so nothing local — least of all what this browser happens to have
  // seen lately — is allowed a say in it.
  if (seed !== undefined) {
    return shuffle([...pool], seededRandom(seed)).slice(0, Math.min(n, pool.length));
  }

  const key = pool as unknown as object;
  const history = dealtBefore.get(key) ?? [];
  const recent = new Set(history);

  let candidates = pool.filter((t) => !recent.has(t));
  // Asked for more than the pool has left to offer: everything's fair game
  // again, rather than a game cut short for want of an unseen target.
  if (candidates.length < n) {
    candidates = [...pool];
    history.length = 0;
  }

  const picked = shuffle(candidates).slice(0, Math.min(n, candidates.length));
  dealtBefore.set(key, [...history, ...picked].slice(-recencyWindow(pool.length)));
  return picked;
}

/**
 * Drives the round-based game shared by every mode: a fixed number of scored
 * rounds, dealt up front, ending on a total.
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
  const {
    rounds = 5,
    hitTest,
    scoreGuess,
    answerFor,
    guessAt,
    seed,
    roundLimitMs,
    adjustScore,
  } = options;

  const [targets, setTargets] = useState(() => pickTargets(pool, rounds, seed));
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("guessing");
  const [currentGuess, setCurrentGuess] = useState<Coord | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  // When the round on screen began. A ref rather than state: the clock reads it
  // constantly and nothing on screen depends on the moment it changed. Set in
  // an effect below rather than here, since what the time is isn't a question
  // rendering is allowed to ask.
  const startedAt = useRef(0);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(roundLimitMs ?? null);

  const target = targets[roundIndex];

  const submitGuess = useCallback(
    (click: Coord) => {
      if (phase !== "guessing") return;
      const elapsedMs = Date.now() - startedAt.current;
      const guess = guessAt?.(click) ?? click;
      const answer = answerFor?.(guess, target) ?? getCoord(target);
      const distanceKm = haversineKm(guess, answer);
      const hit = hitTest?.(click, target) ?? false;
      const scored = scoreGuess?.(click, target);
      const accuracy =
        scored?.score ?? (hit ? MAX_ROUND_SCORE : scoreFromDistance(distanceKm, scaleKm));
      setCurrentGuess(guess);
      setResults((r) => [
        ...r,
        {
          guess,
          click,
          answer,
          distanceKm,
          score: adjustScore?.(accuracy, elapsedMs) ?? accuracy,
          hit,
          label: scored?.label,
          elapsedMs,
          timedOut: false,
        },
      ]);
      setPhase("result");
    },
    [
      phase,
      target,
      getCoord,
      scaleKm,
      hitTest,
      scoreGuess,
      answerFor,
      guessAt,
      adjustScore,
    ],
  );

  /** The clock ran out with nothing clicked: no guess, no marks, next round. */
  const timeOut = useCallback(() => {
    setResults((r) => [
      ...r,
      {
        guess: null,
        click: null,
        answer: getCoord(target),
        distanceKm: 0,
        score: 0,
        hit: false,
        label: "Out of time",
        elapsedMs: roundLimitMs ?? 0,
        timedOut: true,
      },
    ]);
    setPhase("result");
  }, [target, getCoord, roundLimitMs]);

  // The moment the round on screen was put in front of the player, which is
  // what everything below times from. Declared before the clock so that the
  // clock always reads a start that has already been marked.
  useEffect(() => {
    if (phase === "guessing") startedAt.current = Date.now();
  }, [phase, roundIndex]);

  // The countdown, which only exists in a timed game. A tenth of a second is
  // finer than the bar can show but keeps the seconds honest as they turn over.
  // The interval stops itself the moment it runs out rather than waiting to be
  // cleaned up, so a round can only ever time out once.
  useEffect(() => {
    if (!roundLimitMs) return;
    if (phase !== "guessing") return;
    const id = setInterval(() => {
      const left = roundLimitMs - (Date.now() - startedAt.current);
      if (left <= 0) {
        clearInterval(id);
        setTimeLeftMs(0);
        timeOut();
        return;
      }
      setTimeLeftMs(left);
    }, 100);
    return () => clearInterval(id);
  }, [phase, roundIndex, roundLimitMs, timeOut]);

  const next = useCallback(() => {
    if (phase !== "result") return;
    const upcoming = roundIndex + 1;
    if (upcoming >= targets.length) {
      setPhase("done");
      return;
    }
    setRoundIndex(upcoming);
    setCurrentGuess(null);
    setTimeLeftMs(roundLimitMs ?? null);
    setPhase("guessing");
  }, [phase, roundIndex, targets.length, roundLimitMs]);

  const restart = useCallback(() => {
    // A seeded game replays the same five rounds, which is the point of it:
    // the code names one game, not one sitting of it.
    setTargets(pickTargets(pool, rounds, seed));
    setRoundIndex(0);
    setCurrentGuess(null);
    setResults([]);
    setTimeLeftMs(roundLimitMs ?? null);
    setPhase("guessing");
  }, [pool, rounds, seed, roundLimitMs]);

  return {
    target,
    roundIndex,
    totalRounds: targets.length,
    phase,
    currentGuess,
    lastResult: results.length ? results[results.length - 1] : null,
    results,
    totalScore: results.reduce((sum, r) => sum + r.score, 0),
    submitGuess,
    next,
    restart,
    timeLeftMs: phase === "guessing" ? timeLeftMs : null,
    totalMs: results.reduce((sum, r) => sum + r.elapsedMs, 0),
  };
}
