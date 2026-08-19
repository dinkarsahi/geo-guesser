import type { ModeId } from "../modes/ModeProps";
import { roundClosedAt } from "./roomClock";
import { serverNow } from "./supabase";
import { INTRO_MS, type RoundSchedule } from "./useGame";

/**
 * A game played against other people, which is nothing but a code.
 *
 * The code carries the game in its first letter, what kind of contest it is in
 * its second, and a seed in the rest. Every device deals the same five rounds
 * from that seed, so two people holding one code are asked the same questions
 * in the same order without their devices ever having spoken.
 *
 * There are two kinds, and the difference is only where the code comes from:
 *
 * - `daily` — worked out from the game and the date, so it isn't sent to
 *   anybody. Everyone in the world who picks City Spotter today is already on
 *   it, and on the table it leads to. Played whenever suits you.
 * - `room` — drawn at random when someone makes a room for their friends. This
 *   one does need a server, because the players have to start together: the
 *   room row carries the moment the first round opens, and every device runs
 *   the rounds off that one clock.
 *
 * The map settings used to travel in the code as well, which meant four City
 * Spotter tables a day and four ways to be alone on one. They're a matter of
 * taste rather than of difficulty, so they're each player's own now, and one
 * game a day means one table.
 */
export interface MatchCode {
  /** The code as stored and read out, e.g. "CD4KQ7M". */
  code: string;
  mode: ModeId;
  kind: MatchKind;
  /** The code, hashed — see `pickTargets`. */
  seed: number;
}

/** Where a code came from, which is also what it commits the player to. */
export type MatchKind = "daily" | "room";

/** A match being played, by someone. */
export interface Match extends MatchCode {
  /** Who's playing, so the standings can name a leader rather than a line. */
  player: string;
  /** The flat map rather than the globe. */
  flat: boolean;
  /** Country outlines drawn on. */
  borders: boolean;
  /**
   * Rooms only: when round one opens, on the shared clock (see `duel.ts`).
   * Its presence is what turns the rounds over on a timetable rather than on
   * the player's own "next round" button.
   */
  startAt?: number;
}

/** Rounds in a match. Fixed, so that two players always play the same game. */
export const MATCH_ROUNDS = 5;

/**
 * How long a player has to answer each round of a duel.
 *
 * Duels only. A room turns its rounds over on everyone's screen at once, so a
 * round there has to end at a moment rather than when its player is ready, and
 * that moment is this. Today's round has no clock at all — see `matchOptions`.
 */
export const MATCH_ROUND_MS = 30_000;

/**
 * How long the answer stays up between rounds in a room, where nobody presses
 * "next" — long enough to read the reveal, and long enough for everyone's score
 * for the round just played to have reached everyone else's screen.
 */
export const MATCH_REVEAL_MS = 10_000;

/**
 * The clock costs nothing for the first ten seconds of a round. Duels only,
 * like the clock it discounts.
 *
 * Somebody who knows where Lima is takes a couple of seconds to find it on a
 * globe they still have to spin, and taking that off them was marking dexterity
 * rather than geography. Past the grace the discount comes on gradually, so the
 * clock only separates people who are still thinking about it.
 */
export const MATCH_GRACE_MS = 10_000;

/**
 * How much of a round the clock can take off you once the grace is up: sit on a
 * round to the buzzer and you keep 70% of what the guess was worth. Taken off
 * the accuracy rather than added to it, so a match is marked out of the same
 * 100 a round as every other game here — and so a fast wrong answer still loses
 * to a slow right one, which is the point: the question is who knows the map,
 * with the clock deciding the near-run things.
 */
const SPEED_PENALTY = 0.3;

/**
 * The alphabet codes are drawn from: no O/0, no I/1/L, nothing else that gets
 * misheard or mistyped. A code has to survive being read out loud.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** How many characters follow the two leading letters. */
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
  timezone: "Z",
};

const MODE_BY_LETTER = Object.fromEntries(
  Object.entries(MODE_LETTERS).map(([mode, letter]) => [letter, mode as ModeId]),
) as Record<string, ModeId>;

/**
 * The second letter: which of the two contests this code is for. It's in the
 * code rather than worked out from context because a code is the only thing
 * handed around, and a room code that read as a daily one would send its
 * players to the wrong table — and to rounds dealt for the whole world.
 */
const KIND_LETTERS: Record<MatchKind, string> = { daily: "D", room: "V" };

const KIND_BY_LETTER: Record<string, MatchKind> = { D: "daily", V: "room" };

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
 * Today's code for a game, e.g. "CD4KQ7M".
 *
 * Worked out rather than drawn: the same game on the same day is the same code
 * on every device in the world, so there is one round a day per game and one
 * table everybody lands on. Nobody has to be sent a code — two people who pick
 * the same game are already playing the same one, whatever map each of them
 * chose to play it on.
 *
 * That's also what makes one go a day stick. There is no second code to mint
 * with different settings and play again.
 */
export function dailyCode(mode: ModeId, day: number = localDay()): string {
  const letters = MODE_LETTERS[mode] + KIND_LETTERS.daily;
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
 * A fresh code for a room, drawn rather than worked out.
 *
 * This one *is* handed around, and it has to be unguessable in the small: a
 * room is four friends who all start together, and a stranger who could type
 * their way into it would be playing in their game. Five characters of a
 * 31-letter alphabet is 28 million, against the handful of rooms alive at once.
 */
export function roomCode(mode: ModeId): string {
  const bytes = new Uint8Array(SEED_LENGTH);
  crypto.getRandomValues(bytes);
  let code = MODE_LETTERS[mode] + KIND_LETTERS.room;
  // Rejection-free and near enough uniform: 256 isn't a multiple of 31, so the
  // first few letters come up about 1.03 times as often as the last few. That
  // matters to a cryptographer and to nobody sitting in a lobby.
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return code;
}

/**
 * Whether a code is one of today's, which is the set of codes that can still be
 * played. Yesterday's rounds are still readable while their table lasts, but
 * they're over: the point of a daily code is that everyone is on the same one.
 */
export const isTodaysCode = (code: MatchCode, day: number = localDay()): boolean =>
  code.kind === "daily" && dailyCode(code.mode, day) === code.code;

/** The match a code describes, or null if it isn't one. */
export function parseMatchCode(input: string): MatchCode | null {
  const code = tidy(input);
  if (code.length !== SEED_LENGTH + 2) return null;
  const mode = MODE_BY_LETTER[code[0]];
  const kind = KIND_BY_LETTER[code[1]];
  if (!mode || !kind) return null;
  // Every character has to be one we'd have dealt, or the code is a typo of
  // some other game and would quietly deal a different five rounds.
  for (const c of code.slice(2)) if (!ALPHABET.includes(c)) return null;
  return { code, mode, kind, seed: hash(code) };
}

/** Formatted for reading out: "CD4 KQ7M". */
export const spellCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

/**
 * The modes a match can be played in, as they're named on the menu.
 *
 * `noun` is what the round asks you to find, in one word — what a player is
 * still looking for while the room waits on them. It's what the click has to
 * land on rather than what the question showed: a flag, a currency and a
 * population are all answered by picking a country.
 */
export const MATCH_MODES: { id: ModeId; title: string; emoji: string; noun: string }[] = [
  { id: "city", title: "City Spotter", emoji: "🏙️", noun: "city" },
  { id: "flag", title: "Flag Spotter", emoji: "🚩", noun: "country" },
  { id: "currency", title: "Currency Spotter", emoji: "💱", noun: "country" },
  { id: "company", title: "Corporate HQ Spotter", emoji: "🏢", noun: "country" },
  { id: "population", title: "Population Spotter", emoji: "👥", noun: "country" },
  { id: "tube", title: "Tube Station Spotter", emoji: "🚇", noun: "station" },
  { id: "timezone", title: "Time Zone Spotter", emoji: "🕰️", noun: "time" },
];

/**
 * The order the games come round in, for a block of as many days as there are
 * games — seven of each, since the clock joined the other six.
 *
 * A shuffle rather than a fixed rota, so the week doesn't become "Tuesday is
 * flags" — but a shuffle of all of them at once, so every game gets exactly one
 * day in every block however that block falls. Drawn from the hash rather than a
 * generator, since all this needs is the same answer on every device forever.
 */
function dayOrder(block: number): ModeId[] {
  const order = MATCH_MODES.map((m) => m.id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = hash(`${block}:${i}`) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Which game today is.
 *
 * Nobody picks any more: the day does, and it's the same day's game for
 * everyone. That's what makes a single table worth looking at — a table apiece
 * for the handful of people who chose each game is seven lonely tables, and one
 * game everybody is on today is a leaderboard.
 *
 * Evenly spread by construction. Every run of seven days is a permutation of
 * the seven, so no game can go a fortnight unplayed or turn up twice in a week,
 * which is what an unconstrained draw would do often enough to look broken.
 */
export function gameOfDay(day: number = localDay()): ModeId {
  const size = MATCH_MODES.length;
  const block = Math.floor(day / size);
  const index = mod(day, size);
  const order = dayOrder(block);
  // Two blocks can meet on the same game — the last of one and the first of the
  // next — which is the one way an even spread still reads as a repeat. Swapped
  // rather than redrawn, so the block stays a permutation of all of them.
  //
  // Decided for the block, not for the day being asked about: a swap applied
  // only on the first of the six would leave the second day still handing back
  // the game that was moved onto it, which is a fortnight with one game twice
  // and another missing.
  if (order[0] === dayOrder(block - 1)[size - 1]) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order[index];
}

/** What a game is called, given only its id. */
export const modeTitle = (mode: ModeId) => MATCH_MODES.find((m) => m.id === mode)!.title;

export const modeEmoji = (mode: ModeId) => MATCH_MODES.find((m) => m.id === mode)!.emoji;

/** What a round of this game asks you to click on: a city, a country, a station. */
export const modeNoun = (mode: ModeId) => MATCH_MODES.find((m) => m.id === mode)!.noun;

/**
 * What a code commits everyone to, in words — read over a leaderboard, where it
 * says which of the six games these scores were got at, which the numbers alone
 * can't. The map isn't in it: everyone on this table played the same questions,
 * and how each of them chose to draw the world is their own business.
 */
export const describeCode = (code: MatchCode): string =>
  `${modeTitle(code.mode)} · ${MATCH_ROUNDS} rounds`;

/**
 * A round's score once the clock is counted, in a duel. Every player answers
 * the same question with the same time, so this needs no state — only how good
 * the guess was and how long it took.
 */
export function matchPoints(accuracy: number, elapsedMs: number): number {
  const over = Math.max(0, elapsedMs - MATCH_GRACE_MS);
  const spent = Math.min(1, over / (MATCH_ROUND_MS - MATCH_GRACE_MS));
  return Math.round(accuracy * (1 - SPEED_PENALTY * spent));
}

/** What a match changes about a round, ready to spread into `useGame`. */
export interface MatchGameOptions {
  rounds: number;
  seed: number;
  roundLimitMs?: number;
  adjustScore?: (score: number, elapsedMs: number) => number;
  schedule?: RoundSchedule;
}

/**
 * The rules a match imposes on whichever mode it's played in — a fixed five
 * rounds dealt from the code, and in a duel a clock on each and a score that
 * pays for speed. Undefined outside a match, so it spreads into the options
 * harmlessly.
 *
 * The clock belongs to the duel and not to the daily. A room cannot do without
 * one: its rounds turn over together on everyone's screen whether or not
 * they've answered, and that is the whole of what makes it a race rather than
 * two people playing the same questions apart. Today's round is the opposite
 * kind of contest — played alone, whenever it suits you, against everybody who
 * gets to it today — and there thirty seconds only hurried people through a
 * game they had all day for. What its table is for is who knows the map, so
 * that is the only thing it now marks.
 *
 * A room also adds the timetable it runs to.
 */
export function matchOptions(match?: Match): MatchGameOptions | undefined {
  if (!match) return undefined;
  const timed = match.kind === "room";
  return {
    rounds: MATCH_ROUNDS,
    seed: match.seed,
    roundLimitMs: timed ? MATCH_ROUND_MS : undefined,
    adjustScore: timed ? matchPoints : undefined,
    schedule:
      match.startAt === undefined
        ? undefined
        : {
            // The room's own start, moved back by the intro. This is the whole
            // of how a duel affords the fall through space: the pause is *in*
            // the timetable rather than in front of it, so every device shifts
            // by the same constant, they stay in step, and no player's thirty
            // seconds is any shorter. A local pause could not do this — the
            // rounds are worked out by arithmetic from this number, so a
            // device that waited would simply lose the time it waited.
            startAt: match.startAt + INTRO_MS,
            roundMs: MATCH_ROUND_MS,
            revealMs: MATCH_REVEAL_MS,
            // The room's clock, not this device's: see `serverNow`.
            now: serverNow,
            // And the room's own word for when a round was done with.
            answeredAt: (round) => roundClosedAt(match.code, round),
          },
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
