import { useCallback, useEffect, useRef, useState } from "react";
import { haversineKm, scoreFromDistance, MAX_ROUND_SCORE, type Coord } from "./geo";

export type Phase = "guessing" | "result" | "done";

/**
 * How long a game waits before its first round opens.
 *
 * Once a game, not once a round. Press Start and the map is on screen before
 * its imagery is, so a round used to open on an empty rectangle or a world
 * that appeared a moment after the question — this is the pause that covers
 * the difference, and on the globe there is a fall through space to watch
 * while it passes (`globeFlight.ts`, whose animation runs exactly this long).
 * Between rounds there is nothing to wait for: the map is already drawn.
 *
 * **In a room it is part of the timetable rather than a pause in front of
 * it**, and that distinction is the whole design. Everyone's device works out
 * which round is on screen by arithmetic from the room's start time, so a
 * local pause cannot hold the clock — it would simply cost that player three
 * seconds of a thirty-second round, and only the player whose tiles were slow.
 * So `matchOptions` moves the room's start time back by this amount instead:
 * every device shifts by the same constant, the room stays in step, and
 * nobody's round is any shorter. Change this number and every player in every
 * room changes with it, which is the point.
 *
 * A whole number of seconds, because it is counted out loud on screen: 3.4
 * reads "Starting in 4" for the first tenth of a second, which is a countdown
 * that opens by lying about how long it is. Two rather than three because it
 * is a cover for a download and not a feature — long enough that the world has
 * usually arrived, short enough that somebody on their sixth game isn't
 * waiting on it.
 */
export const INTRO_MS = 2000;

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
  /**
   * What the guess itself was worth, before the clock was counted — the mark
   * for pointing at the right bit of the world and nothing else.
   *
   * Kept beside the score rather than folded into it because the difference is
   * the thing worth saying: a player who found the place and then sat on it
   * needs to see that the round cost them thirty of the hundred, or the mark
   * reads as a worse guess than they made.
   */
  accuracy: number;
  /** The mark the round actually counts for: the accuracy, once timed. */
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

/**
 * A timetable the rounds run to, rather than a game that waits for the player.
 *
 * A room full of friends has to be looking at the same question at the same
 * moment, and nothing else can decide when that is: the fastest player would
 * otherwise be three rounds ahead by the end. So every device works the round
 * out from one shared clock and the moment the room started — no messages pass
 * between them, and a player whose phone locks for a minute rejoins the room
 * where everybody else is rather than a minute behind it.
 */
export interface RoundSchedule {
  /** When round one opens, on whatever clock `now` reads. */
  startAt: number;
  /** How long each round stays open for answers. */
  roundMs: number;
  /** The pause on the answer between one round closing and the next opening. */
  revealMs: number;
  /**
   * The clock everyone in the room is on — the server's, carried onto this
   * device. Two phones disagreeing by a minute is normal and would otherwise
   * be a minute's head start.
   */
  now: () => number;
  /**
   * When everyone had answered round `n`, if they all have — which ends the
   * round early, because the thirty seconds is a limit and not a length.
   *
   * A moment agreed on by the room rather than decided here: everybody reads
   * the same one and lands on the same round. A device that hasn't heard it
   * yet runs to the full thirty and catches up, which is what makes this safe
   * to be late with.
   */
  answeredAt?: (round: number) => number | null;
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
   * A radius around the answer, in kilometres, that costs nothing — see
   * `scoreFromDistance`. For targets that are a point in the data and an area
   * on the ground, which is every city in the pool.
   *
   * Not the same thing as a `hitTest`, and deliberately not wired to one: a
   * click inside a country *is* the country and there's nothing further to
   * say about where in it you pressed, whereas a click 30 km from a city
   * centre is worth full marks and is still 30 km from the city centre. So
   * this pays out the marks without claiming the guess landed on the answer,
   * and the map goes on showing where it actually landed.
   */
  spotOnKm?: number;
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
   * Deal a climbing game rather than a flat one: rank the pool by this —
   * **bigger is easier** — cut it into as many bands as there are rounds, and
   * take one target at random from each, easiest band first.
   *
   * For a pool whose targets are wildly uneven in difficulty. Population
   * Spotter is the case: a flat shuffle of every country on Earth deals mostly
   * from the long tail of small islands, and a game of five rounds asking for
   * Tuvalu, Nauru, Palau, Dominica and San Marino is a fair deal and a rotten
   * game. Banding keeps every country reachable — nothing is dropped from the
   * pool, and each band is a fifth of it — while making the shape of a game
   * dependable: it opens somewhere everyone has heard of and ends somewhere
   * only the stubborn will get.
   *
   * Falls back to a plain shuffle where the pool is too thin for the bands to
   * mean anything (fewer than two targets a band).
   */
  easierBy?: (t: T) => number;
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
  /**
   * Turn the rounds over on a timetable rather than on the player's "next
   * round" button. Set only in a room, where everyone has to move together.
   */
  schedule?: RoundSchedule;
  /**
   * Hold the first round back by `INTRO_MS` and count the player in.
   *
   * **Only where there is something to watch while it passes**, which today
   * means the 3D globe and its fall through space. The flat map and the tube
   * map are drawn by the time the round opens, so a countdown in front of them
   * is two seconds of nothing — they keep what they always had, which is a
   * game that begins when you press Start.
   *
   * Defaults to true because the globe is the default map, so a game added
   * without a thought about this gets the right answer. The two that don't
   * want it say so.
   *
   * **A room has to agree with itself here.** `matchOptions` moves the room's
   * start back by the same `INTRO_MS`, and only when the room is on the globe
   * — if that test and this flag ever disagree, one device would be counting
   * in while the others were already playing.
   */
  intro?: boolean;
}

export interface Game<T> {
  /** The target the player is currently trying to locate. */
  target: T;
  /**
   * Every target this game will ask about, in order — so the results screen can
   * name what each round was, which a list of distances can't.
   */
  targets: T[];
  roundIndex: number;
  /** Rounds in this game. */
  totalRounds: number;
  /**
   * Milliseconds until the first round opens, or null once it has.
   *
   * Set for the first few seconds of a game and never again: the map needs a
   * moment to arrive, and this is what the player is shown instead of a blank
   * one. Nothing can be guessed while it is set.
   */
  startingInMs: number | null;
  /**
   * The moment the first round opens, as a timestamp.
   *
   * The map is given this rather than a duration so it can land its arrival
   * *on* it. A globe takes a second or two to build before it can animate
   * anything, and a fall that started when it was ready and ran for a fixed
   * three seconds would still be falling after the round had begun — the
   * player watching the world rush past while the clock ran. Given the moment,
   * the fall simply takes however long is left.
   */
  firstRoundAt: number;
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
  /**
   * When the round on screen gives way to the next — or to the results, on the
   * last of them. Only in a timetabled game, and only worth reading during the
   * pause on the answer, where it's the countdown everyone is waiting on.
   */
  roundClosesAt: number | null;
  /** How long the whole game has taken so far, summed over its rounds. */
  totalMs: number;
  /**
   * TEMPORARY — answer the round correctly, as though the player had clicked
   * the right place. Behind the tap cheat in `GameFrame`; see `solvePoint`.
   */
  solveRound: () => void;
}

/** Where a timetabled game is: which round, when it opened, when it gives way. */
interface Timing {
  index: number;
  openedAt: number;
  closesAt: number;
}

/**
 * The timetable, walked from the start rather than worked out in one step.
 *
 * It can't be a formula any more: a round ends either when its thirty seconds
 * are up or when the last player answers, whichever comes first, so where round
 * four begins depends on how quickly rounds one to three went. Walking it is a
 * handful of arithmetic over five rounds and needs no state of its own, which
 * is what lets a late-arriving fact about round one move every round after it
 * without anything having to be undone.
 *
 * A plain function rather than a hook: it's read both while rendering and from
 * inside the loop that drives the rounds, and those want the same answer.
 */
function timingAt(schedule: RoundSchedule | undefined, rounds: number): Timing {
  const now = schedule?.now() ?? Date.now();
  let openedAt = schedule?.startAt ?? now;
  if (!schedule) return { index: 0, openedAt, closesAt: openedAt };

  for (let round = 0; round < rounds; round++) {
    const everyone = schedule.answeredAt?.(round) ?? null;
    // The last round gets its pause on the answer like every other one. There's
    // nothing to turn over to, but there is something to read: the fact under
    // the answer is worth the same ten seconds at the end of the game as in the
    // middle of it, and dropping straight onto the table means nobody reads it.
    const closesAt = Math.min(
      openedAt + schedule.roundMs + schedule.revealMs,
      everyone === null ? Infinity : everyone + schedule.revealMs,
    );
    if (now < closesAt) return { index: round, openedAt, closesAt };
    openedAt = closesAt;
  }
  return { index: rounds, openedAt, closesAt: openedAt };
}

/**
 * TEMPORARY — the tap cheat. Delete this, `solveRound` below and the tap
 * counter in `GameFrame` together, and nothing else knows about any of it.
 *
 * Where to click to be right. The target's own coordinate almost always is:
 * a city is its coordinate, a station is its dot, and a country's is Natural
 * Earth's label point, which is chosen to sit inside the country. Almost —
 * New Zealand's label sits in Cook Strait, and a mode that scores off the
 * country under the click would mark that as open water and pay nothing. So
 * where the mode has a `hitTest` and the coordinate fails it, this walks a
 * widening ring around it until something passes.
 */
function solvePoint<T>(
  target: T,
  getCoord: (t: T) => Coord,
  hitTest?: (guess: Coord, target: T) => boolean,
): Coord {
  const at = getCoord(target);
  if (!hitTest || hitTest(at, target)) return at;
  for (let radius = 0.25; radius <= 8; radius *= 2) {
    for (let step = 0; step < 16; step++) {
      const angle = (step / 16) * 2 * Math.PI;
      const near = {
        lat: at.lat + radius * Math.sin(angle),
        lng: at.lng + radius * Math.cos(angle),
      };
      if (hitTest(near, target)) return near;
    }
  }
  return at;
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

/**
 * One target from each band of the pool, easiest band first — see `easierBy`.
 *
 * The bands are cut by rank rather than by value, so they hold equal numbers of
 * targets rather than equal spans of whatever is being ranked. Population is
 * why: cut by value, the first band would be China and India and the last one
 * two hundred countries, and four rounds in five would come from the tail the
 * banding was meant to spread out.
 */
function climbingDeal<T>(
  pool: T[],
  n: number,
  easierBy: (t: T) => number,
  random: () => number,
): T[] {
  // Bands of one are not bands: with nothing to choose inside them the game
  // would deal the same targets in the same order every time.
  if (pool.length < n * 2) return shuffle([...pool], random).slice(0, n);

  const ranked = [...pool].sort((a, b) => easierBy(b) - easierBy(a));
  const band = ranked.length / n;
  const picked: T[] = [];
  for (let i = 0; i < n; i++) {
    const from = Math.floor(i * band);
    // The last band takes the remainder, so nothing at the hard end is cut off
    // by the rounding.
    const to = i === n - 1 ? ranked.length : Math.floor((i + 1) * band);
    picked.push(ranked[from + Math.floor(random() * (to - from))]);
  }
  return picked;
}

/** `n` targets from the pool, avoiding the ones dealt most recently. */
function pickTargets<T>(
  pool: T[],
  n: number,
  seed?: number,
  easierBy?: (t: T) => number,
): T[] {
  const random = seed === undefined ? Math.random : seededRandom(seed);
  const deal = (from: T[]) =>
    easierBy
      ? climbingDeal(from, n, easierBy, random)
      : shuffle([...from], random).slice(0, Math.min(n, from.length));

  // A seeded deal is a promise to another device that it will get these same
  // targets, so nothing local — least of all what this browser happens to have
  // seen lately — is allowed a say in it.
  if (seed !== undefined) return deal(pool);

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

  const picked = deal(candidates);
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
    spotOnKm,
    scoreGuess,
    answerFor,
    guessAt,
    easierBy,
    seed,
    roundLimitMs,
    adjustScore,
    schedule,
    intro = true,
  } = options;

  // The clock the game is timed against: the room's, where there is one, and
  // this device's otherwise. Held in a ref because it arrives in a fresh object
  // every render and nothing below should restart when it does.
  const nowRef = useRef<() => number>(Date.now);
  // The timetable, held where the loop below can read it without depending on
  // the identity of an object that arrives fresh every render — the countdown
  // re-renders ten times a second, and an interval that restarted that often
  // would never come round to firing.
  const scheduleRef = useRef(schedule);
  useEffect(() => {
    nowRef.current = schedule?.now ?? Date.now;
    scheduleRef.current = schedule;
  });

  // Pulled out of the schedule so the effects below depend on a number rather
  // than on that identity.
  const startAt = schedule?.startAt;

  const [targets, setTargets] = useState(() => pickTargets(pool, rounds, seed, easierBy));
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("guessing");
  const [currentGuess, setCurrentGuess] = useState<Coord | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  // When the round on screen began. A ref rather than state: the clock reads it
  // constantly and nothing on screen depends on the moment it changed. Set in
  // an effect below rather than here, since what the time is isn't a question
  // rendering is allowed to ask.
  // When the first round actually opens. In a room that is the timetable's own
  // start, which has already been pushed back by `INTRO_MS` — so the wait is
  // the same wait for everybody and is over at a moment they all agree on. In
  // a solo game there is no timetable, so it is counted from the deal.
  // Worked out once, in a lazy initialiser rather than in the render body:
  // reading the clock while rendering is the impurity React's own lint rule
  // objects to, and this genuinely only wants answering the first time.
  const [introEndsAt] = useState(() =>
    intro ? (startAt ?? Date.now() + INTRO_MS) : 0,
  );
  const [startingInMs, setStartingInMs] = useState<number | null>(null);

  const startedAt = useRef(0);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(roundLimitMs ?? null);

  const target = targets[roundIndex];

  /** Where the timetable says the game is, from inside the loop that drives it. */
  const dueRound = useCallback(
    (): Timing => timingAt(scheduleRef.current, targets.length),
    [targets.length],
  );

  const submitGuess = useCallback(
    (click: Coord) => {
      if (phase !== "guessing") return;
      // Nothing counts until the first round has opened. Read off the ref
      // rather than off the countdown's state so this can't be one render
      // behind the moment it is guarding — a click during the fall would
      // otherwise be marked, and in a room marked against a round that hadn't
      // begun.
      if (nowRef.current() < introEndsAt) return;
      const elapsedMs = nowRef.current() - startedAt.current;
      const guess = guessAt?.(click) ?? click;
      const answer = answerFor?.(guess, target) ?? getCoord(target);
      const distanceKm = haversineKm(guess, answer);
      const hit = hitTest?.(click, target) ?? false;
      const scored = scoreGuess?.(click, target);
      const accuracy =
        scored?.score ??
        (hit ? MAX_ROUND_SCORE : scoreFromDistance(distanceKm, scaleKm, spotOnKm));
      setCurrentGuess(guess);
      setResults((r) => [
        ...r,
        {
          guess,
          click,
          answer,
          distanceKm,
          accuracy,
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
      introEndsAt,
      target,
      getCoord,
      scaleKm,
      hitTest,
      spotOnKm,
      scoreGuess,
      answerFor,
      guessAt,
      adjustScore,
    ],
  );

  /** A round nobody answered: no guess, no marks. */
  const missed = useCallback(
    (t: T): RoundResult => ({
      guess: null,
      click: null,
      answer: getCoord(t),
      distanceKm: 0,
      accuracy: 0,
      score: 0,
      hit: false,
      label: "Out of time",
      elapsedMs: roundLimitMs ?? 0,
      timedOut: true,
    }),
    [getCoord, roundLimitMs],
  );

  /** The clock ran out with nothing clicked: no guess, no marks, next round. */
  const timeOut = useCallback(() => {
    setResults((r) => [...r, missed(target)]);
    setPhase("result");
  }, [target, missed]);

  // The moment the round on screen was put in front of the player, which is
  // what everything below times from. Declared before the clock so that the
  // clock always reads a start that has already been marked.
  //
  // In a room that moment isn't when this device got here — it's when the round
  // opened for everybody, so a player whose page was slow to draw is marked on
  // the same thirty seconds as the rest of them rather than a fresh thirty.
  useEffect(() => {
    if (phase !== "guessing") return;
    startedAt.current =
      startAt === undefined
        ? // Never before the first round has actually opened: timed from the
          // deal instead, a solo game would count the intro against the
          // player. It only bites on round one — by round two the intro is
          // long past and this is simply now.
          Math.max(nowRef.current(), introEndsAt)
        : dueRound().openedAt;
  }, [phase, roundIndex, startAt, dueRound, introEndsAt]);

  // The count into the first round, which is also what tells the player the
  // wait is a wait rather than a game that hasn't loaded. Read off the clock
  // rather than counted down, for the same reason the round timer is: a tab
  // that was throttled or asleep comes back to the right answer.
  useEffect(() => {
    const remaining = () => introEndsAt - nowRef.current();
    if (remaining() <= 0) return;
    setStartingInMs(remaining());
    const id = setInterval(() => {
      const left = remaining();
      if (left > 0) {
        setStartingInMs(left);
        return;
      }
      clearInterval(id);
      setStartingInMs(null);
    }, 100);
    return () => clearInterval(id);
  }, [introEndsAt]);

  // The countdown, which only exists in a timed game. A tenth of a second is
  // finer than the bar can show but keeps the seconds honest as they turn over.
  // The interval stops itself the moment it runs out rather than waiting to be
  // cleaned up, so a round can only ever time out once.
  useEffect(() => {
    if (!roundLimitMs) return;
    if (phase !== "guessing") return;
    const id = setInterval(() => {
      const left = roundLimitMs - (nowRef.current() - startedAt.current);
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

  /**
   * Jump to whichever round the timetable says is open, filling in any that
   * went by unanswered.
   *
   * Usually that's the very next one and the fill does nothing, since the
   * round's own clock has already marked it. The fill is for the phone that
   * was in a pocket for two rounds: it comes back to the round everyone else
   * is on, with the ones it slept through marked zero, rather than picking up
   * where it left off and finishing a minute after the room has gone.
   */
  const advanceTo = useCallback(
    (due: number) => {
      setResults((r) => {
        const filled = [...r];
        while (filled.length < Math.min(due, targets.length)) {
          filled.push(missed(targets[filled.length]));
        }
        return filled;
      });
      if (due >= targets.length) {
        // Kept in range so the round on screen stays a real one; the results
        // screen is what draws from here on.
        setRoundIndex(targets.length - 1);
        setPhase("done");
        return;
      }
      setRoundIndex(due);
      setCurrentGuess(null);
      setTimeLeftMs(roundLimitMs ?? null);
      setPhase("guessing");
    },
    [targets, missed, roundLimitMs],
  );

  // The timetable itself. Read off the clock rather than counted up, so it
  // survives a tab that was throttled or asleep — which is the case a counter
  // would get wrong, and the case that happens.
  useEffect(() => {
    if (startAt === undefined || phase === "done") return;
    const tick = () => {
      const due = dueRound().index;
      if (due > roundIndex) advanceTo(due);
    };
    tick();
    const id = setInterval(tick, 150);
    return () => clearInterval(id);
  }, [startAt, phase, roundIndex, dueRound, advanceTo]);

  const next = useCallback(() => {
    // A room's rounds turn over on the clock; there is no button, and nothing
    // this could do that wouldn't put this player out of step with the others.
    if (startAt !== undefined) return;
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
  }, [phase, roundIndex, targets.length, roundLimitMs, startAt]);

  const restart = useCallback(() => {
    // A seeded game replays the same five rounds, which is the point of it:
    // the code names one game, not one sitting of it.
    setTargets(pickTargets(pool, rounds, seed, easierBy));
    setRoundIndex(0);
    setCurrentGuess(null);
    setResults([]);
    setTimeLeftMs(roundLimitMs ?? null);
    setPhase("guessing");
  }, [pool, rounds, seed, easierBy, roundLimitMs]);

  // TEMPORARY — the tap cheat's half of the bargain. It goes through
  // `submitGuess` like any other click, so the round is marked, timed and filed
  // exactly as a played one: a cheat that took a different route through the
  // scoring would be a second way of finishing a round, and the first thing to
  // break next time the first one changes.
  const solveRound = useCallback(() => {
    if (phase !== "guessing") return;
    submitGuess(solvePoint(target, getCoord, hitTest));
  }, [phase, submitGuess, target, getCoord, hitTest]);

  return {
    target,
    targets,
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
    startingInMs,
    firstRoundAt: introEndsAt,
    // Worked out on the spot rather than kept: it changes when the room's word
    // on the round changes, which is exactly when this renders again.
    roundClosesAt:
      startAt === undefined ? null : timingAt(schedule, targets.length).closesAt,
    totalMs: results.reduce((sum, r) => sum + r.elapsedMs, 0),
    solveRound,
  };
}
