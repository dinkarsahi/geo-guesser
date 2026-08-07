import type { ModeId } from "../modes/ModeProps";

/**
 * A head-to-head match, which is nothing but a code.
 *
 * There is no server behind this game and no lobby to sit in: the code *is*
 * the match. It carries the mode in its first letter and a seed in the rest,
 * and both players' devices deal the same five rounds from that seed without
 * ever having spoken to each other. Read a code out over the phone and you are
 * playing the same game as the person who made it.
 *
 * What that buys is a game anyone can start from a static page with no
 * account, no connection between the two devices and nothing to go down. What
 * it costs is that neither player can see the other play: the scores meet at
 * the end, by one player reading their result to the other.
 */
export interface MatchCode {
  /** The code as typed and shown, e.g. "FA4KQ7M". */
  code: string;
  mode: ModeId;
  /** The flat map rather than the globe — the maker's choice, everyone's game. */
  flat: boolean;
  /** Country outlines drawn on. */
  borders: boolean;
  /** The code, hashed — see `pickTargets`. */
  seed: number;
}

/** A match being played, by someone. */
export interface Match extends MatchCode {
  /** Who's playing, so the standings can name a leader rather than a line. */
  player: string;
}

/** Rounds in a match. Fixed, so that two players always play the same game. */
export const MATCH_ROUNDS = 5;

/** How long a player has to answer each round. */
export const MATCH_ROUND_MS = 30_000;

/**
 * How much of a round the clock can take off you: answer on the buzzer and
 * you keep 60% of what the guess was worth, answer instantly and you keep all
 * of it. Taken off the accuracy rather than added to it, so a match is marked
 * out of the same 100 a round as every other game here — and so a fast wrong
 * answer still loses to a slow right one, which is the point: the question is
 * who knows the map, with the clock deciding the near-run things.
 */
const SPEED_PENALTY = 0.4;

/**
 * The alphabet codes are drawn from: no O/0, no I/1/L, nothing else that gets
 * misheard or mistyped. A code has to survive being read out loud.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** How many characters follow the mode letter. */
const SEED_LENGTH = 5;

/** Every arrangement of those characters — the room a day's code has to land in. */
const SEED_SPACE = ALPHABET.length ** SEED_LENGTH; // 28,629,151

/** Room for every pair of leading letters, so a day's games can't tread on each other. */
const SLOTS = ALPHABET.length ** 2;

/**
 * Days each game gets before it comes back round to a code it has used — a
 * little over 81 years, which is long enough not to matter.
 */
const DAY_SPAN = Math.floor(SEED_SPACE / SLOTS);

/** Remainder that stays positive, so dates before 1970 don't fall out of the space. */
const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Shares no factor with the seed space, which is what makes multiplying by it a
 * one-to-one map of that space onto itself: every day gets its own code, and
 * every code belongs to one day. Large and awkward so that consecutive days
 * carry differently and today's code says nothing about tomorrow's.
 *
 * It wraps after `SEED_SPACE / SLOTS` days — a little over 81 years — which is
 * long enough that the repeat is somebody else's problem.
 */
const SCRAMBLE = 16_244_729;

/** The letter each mode is written as, and the mode each letter means. */
const MODE_LETTERS: Record<ModeId, string> = {
  city: "C",
  flag: "F",
  currency: "M",
  company: "H",
  population: "P",
  tube: "T",
};

const MODE_BY_LETTER = Object.fromEntries(
  Object.entries(MODE_LETTERS).map(([mode, letter]) => [letter, mode as ModeId]),
) as Record<string, ModeId>;

/** What the maker chose to play on, which the code has to carry to everyone else. */
export interface MatchSetup {
  flat: boolean;
  borders: boolean;
}

/**
 * The second letter of a code: which map, and whether it's drawn with borders.
 * Both players have to be looking at the same world for the same five rounds
 * to be the same test, so it travels with the code rather than being each
 * player's own setting.
 */
const SETUP_LETTERS: [string, MatchSetup][] = [
  ["A", { flat: false, borders: true }],
  ["B", { flat: false, borders: false }],
  ["C", { flat: true, borders: true }],
  ["D", { flat: true, borders: false }],
];

const letterFor = (setup: MatchSetup) =>
  SETUP_LETTERS.find(([, s]) => s.flat === setup.flat && s.borders === setup.borders)![0];

const setupFor = (letter: string) => SETUP_LETTERS.find(([l]) => l === letter)?.[1];

/**
 * The setup a mode actually plays under.
 *
 * The tube has its own map, so the world-map choices change nothing a player
 * can see — but the letter still goes into the seed, which would quietly make
 * four tube rounds a day that read identically and deal differently. It pins to
 * one letter so there is one tube game a day, as there looks to be.
 */
const setupForMode = (mode: ModeId, setup: MatchSetup): MatchSetup =>
  mode === "tube" ? SETUP_LETTERS[0][1] : setup;

/** Strips the punctuation people add when writing a code down. */
const tidy = (input: string) => input.toUpperCase().replace(/[^0-9A-Z]/g, "");

/**
 * FNV-1a over the code. Any hash would do; what matters is that every device
 * computes the same one, so it's written out here rather than taken from a
 * library that might change under us.
 */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // FNV alone leaves codes that differ in one character close together in its
  // output, which matters here because this is what deals the rounds: two codes
  // landing on one number would be two days playing the same five questions.
  // Murmur3's finaliser spreads a one-bit change across the whole word.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Which day it is, by the player's own calendar.
 *
 * Built from the local calendar date rather than from an offset, so the clocks
 * going forward can't shift the turnover: whatever the date says on the device,
 * that's the day. Everyone reaches a given day at their own midnight — Auckland
 * finishes it before London starts — which is what makes the reset land at the
 * player's midnight rather than at one chosen for them.
 */
export function localDay(now: Date = new Date()): number {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
}

/**
 * Today's code for a game, e.g. "FA4KQ7M".
 *
 * Worked out rather than drawn: the same game on the same day is the same code
 * on every device in the world, so there is one round a day per game and one
 * table everybody lands on. Nobody has to be sent a code — two people who pick
 * the same game are already playing the same one.
 *
 * That's also what makes one go a day stick. A code used to be replayable by
 * minting another with the same settings; now there isn't another to mint until
 * tomorrow.
 */
export function dailyCode(mode: ModeId, setup: MatchSetup, day: number = localDay()): string {
  const letters = MODE_LETTERS[mode] + letterFor(setupForMode(mode, setup));
  // Which of the day's games this is, taken from the two letters themselves so
  // that it doesn't depend on the order anything happens to be listed in.
  const slot = ALPHABET.indexOf(letters[0]) * ALPHABET.length + ALPHABET.indexOf(letters[1]);
  // Scrambled rather than hashed: multiplying by a number sharing no factor
  // with the space is one-to-one over it, so no two days can ever come out as
  // the same code. A hash only makes that unlikely, and "unlikely" here means
  // a fortnight that quietly replays a round somebody has already seen.
  // The day is the part that moves, so it goes in the place that moves by one:
  // multiplying it up first would leave the low digits of every code untouched
  // from one day to the next, and a week of codes sharing their first two
  // characters looks broken however unrelated the rest of it is.
  let v = ((slot * DAY_SPAN + mod(day, DAY_SPAN)) * SCRAMBLE) % SEED_SPACE;
  let code = letters;
  for (let i = 0; i < SEED_LENGTH; i++) {
    code += ALPHABET[v % ALPHABET.length];
    v = Math.floor(v / ALPHABET.length);
  }
  return code;
}

/**
 * Whether a code is one of today's, which is the set of codes that can still be
 * played. Yesterday's rounds are still readable while their table lasts, but
 * they're over: the point of a daily code is that everyone is on the same one.
 */
export const isTodaysCode = (code: MatchCode, day: number = localDay()): boolean =>
  dailyCode(code.mode, code, day) === code.code;

/** The match a code describes, or null if it isn't one. */
export function parseMatchCode(input: string): MatchCode | null {
  const code = tidy(input);
  if (code.length !== SEED_LENGTH + 2) return null;
  const mode = MODE_BY_LETTER[code[0]];
  const setup = setupFor(code[1]);
  if (!mode || !setup) return null;
  // Every character has to be one we'd have dealt, or the code is a typo of
  // some other game and would quietly deal a different five rounds.
  for (const c of code.slice(2)) if (!ALPHABET.includes(c)) return null;
  return { code, mode, ...setup, seed: hash(code) };
}

/** Formatted for reading out: "FA4 KQ7M". */
export const spellCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

/** The modes a match can be played in, as they're named on the menu. */
export const MATCH_MODES: { id: ModeId; title: string; emoji: string }[] = [
  { id: "city", title: "City Spotter", emoji: "🏙️" },
  { id: "flag", title: "Flag Spotter", emoji: "🚩" },
  { id: "currency", title: "Currency Spotter", emoji: "💱" },
  { id: "company", title: "Corporate HQ Spotter", emoji: "🏢" },
  { id: "population", title: "Population Spotter", emoji: "👥" },
  { id: "tube", title: "Tube Station Spotter", emoji: "🚇" },
];

const titleOf = (mode: ModeId) => MATCH_MODES.find((m) => m.id === mode)!.title;

/**
 * What a code commits everyone to, in words. Read on the way in by the player
 * who chose it, on the way out by the players who didn't, and again over the
 * leaderboard — where it says which of the six games these scores were got at,
 * which the numbers alone can't.
 */
export function describeCode(code: MatchCode): string {
  const parts = [titleOf(code.mode), `${MATCH_ROUNDS} rounds`];
  // The tube has its own map, and the world-map choices say nothing about it.
  if (code.mode !== "tube") {
    parts.push(code.flat ? "flat map" : "3D globe");
    parts.push(code.borders ? "borders on" : "no borders");
  }
  return parts.join(" · ");
}

/**
 * A round's score once the clock is counted. Both players answer the same
 * question with the same time, so this needs no state — only how good the
 * guess was and how long it took.
 */
export function matchPoints(accuracy: number, elapsedMs: number): number {
  const spent = Math.min(1, Math.max(0, elapsedMs) / MATCH_ROUND_MS);
  return Math.round(accuracy * (1 - SPEED_PENALTY * spent));
}

/** What a match changes about a round, ready to spread into `useGame`. */
export interface MatchGameOptions {
  rounds: number;
  seed: number;
  roundLimitMs: number;
  adjustScore: (score: number, elapsedMs: number) => number;
}

/**
 * The rules a match imposes on whichever mode it's played in — a fixed five
 * rounds dealt from the code, a clock on each, and a score that pays for
 * speed. Undefined outside a match, so it spreads into the options harmlessly.
 */
export function matchOptions(match?: Match): MatchGameOptions | undefined {
  if (!match) return undefined;
  return {
    rounds: MATCH_ROUNDS,
    seed: match.seed,
    roundLimitMs: MATCH_ROUND_MS,
    adjustScore: matchPoints,
  };
}

/** "1:43", "0:07" — a match total, which never runs to hours. */
export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** One player's finished match, as the standings hold it. */
export interface SharedResult {
  code: string;
  player: string;
  score: number;
  ms: number;
}

/** A name a standings table can hold: one line of it, and not too much. */
export const cleanName = (input: string) => input.replace(/[\n\r]/g, "").slice(0, 16);

/**
 * The standings: most points first, and level scores settled by whoever spent
 * less time getting them. One entry per player — a name pasted twice is the
 * same person's result arriving by two routes, not two players.
 */
export function rankResults(results: SharedResult[]): SharedResult[] {
  const byName = new Map<string, SharedResult>();
  for (const r of results) {
    const key = r.player.toLowerCase();
    if (!byName.has(key)) byName.set(key, r);
  }
  return [...byName.values()].sort((a, b) => b.score - a.score || a.ms - b.ms);
}
