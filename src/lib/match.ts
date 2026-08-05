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
  /** The code as typed and shown, e.g. "F4KQ7M". */
  code: string;
  mode: ModeId;
  /** Everything after the mode letter, hashed — see `pickTargets`. */
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
  return h >>> 0;
}

/** A fresh code for a mode, e.g. "F4KQ7M". */
export function createMatchCode(mode: ModeId): string {
  let code = MODE_LETTERS[mode];
  const bytes = new Uint32Array(SEED_LENGTH);
  crypto.getRandomValues(bytes);
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return code;
}

/** The match a code describes, or null if it isn't one. */
export function parseMatchCode(input: string): MatchCode | null {
  const code = tidy(input);
  if (code.length !== SEED_LENGTH + 1) return null;
  const mode = MODE_BY_LETTER[code[0]];
  if (!mode) return null;
  // Every character has to be one we'd have dealt, or the code is a typo of
  // some other game and would quietly deal a different five rounds.
  for (const c of code.slice(1)) if (!ALPHABET.includes(c)) return null;
  return { code, mode, seed: hash(code) };
}

/** Formatted for reading out: "F4K Q7M". */
export const spellCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

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
  endless: false;
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
    endless: false,
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
