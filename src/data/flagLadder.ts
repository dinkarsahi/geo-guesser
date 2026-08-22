import type { Country } from "./countries";

/**
 * Today's round's flags, easiest first.
 *
 * **Only Today's Round deals from this.** Flag Spotter off the shelf and in a
 * duel still draws from every country on the map, which is the game as it is
 * meant to be. Today's round is the one people arrive at from a link somebody
 * sent them, often having never played before, and a first round asking for the
 * flag of Nauru is a player who closes the tab. That is a decision about the
 * front door and not about the game.
 *
 * **Why a written list rather than a measurement.** `easierBy` wants a number,
 * and the obvious ones are all to hand — population, land area — but none of
 * them measures the thing being asked about, which is whether you have *seen
 * this flag before*. Ranked by population the first band is the top fifth of
 * the world by headcount, which is Burkina Faso and Malawi and Mozambique
 * alongside China: correct arithmetic, and a rotten first round. Switzerland is
 * a hundredth the size of any of them and everyone knows its flag. There is no
 * column in the data for fame, so fame is written down.
 *
 * **The order is what carries the difficulty, not a score.** `climbingDeal`
 * cuts by rank into as many bands as there are rounds and takes one from each,
 * so with 120 entries and five rounds a band is 24 flags — enough that today
 * and tomorrow are different games, and few enough that the bands mean
 * something. Anything added goes in the place it belongs rather than on the
 * end.
 *
 * **Nothing tiny is on it.** Not by a rule about area — Luxembourg and Malta
 * would pass a size test and fail a fame one, and Iceland would fail the size
 * test and deserves its place — but because the list is written and they are
 * simply not written on it. The hard end is real countries whose flags a keen
 * player has met: Chad and Burkina Faso, not Tuvalu and Palau.
 *
 * A code here that Natural Earth doesn't carry just drops out — the pool is
 * filtered against the map, as everywhere else in the app.
 */
const FLAG_LADDER = [
  // Band 1 — the flags almost nobody misses.
  "gb", "us", "fr", "jp", "ca", "de", "it", "br",
  "cn", "in", "au", "es", "ru", "mx", "ar", "ch",
  "ie", "nl", "se", "gr", "pt", "za", "kr", "tr",

  // Band 2 — known without having to think about it.
  "no", "dk", "fi", "pl", "be", "at", "il", "eg",
  "sa", "pk", "ng", "ke", "jm", "cu", "nz", "cl",
  "co", "pe", "th", "vn", "id", "ph", "my", "ua",

  // Band 3 — known if you follow a World Cup or a news bulletin.
  "cz", "hu", "ro", "hr", "rs", "bg", "is", "ir",
  "iq", "ae", "ma", "dz", "tn", "gh", "et", "tz",
  "bd", "lk", "np", "mm", "kh", "ve", "ec", "uy",

  // Band 4 — a keen player's flags.
  "bo", "py", "cr", "pa", "do", "gt", "hn", "ni",
  "sv", "sk", "si", "ee", "lv", "lt", "by", "al",
  "ba", "mk", "ge", "am", "az", "kz", "uz", "mn",

  // Band 5 — the hard end, and still somewhere with a football team.
  "jo", "om", "ye", "sy", "af", "la", "pg", "ao",
  "mz", "zm", "zw", "bw", "na", "mg", "sn", "ci",
  "cm", "ml", "bf", "ne", "td", "sd", "ug", "cd",
];

const RANK = new Map(FLAG_LADDER.map((code, i) => [code, i]));

/** Today's round's flags, out of every country on the map. */
export const flagLadderPool = (pool: Country[]): Country[] =>
  pool.filter((c) => RANK.has(c.code));

/**
 * How easy this flag is, for `easierBy` — which wants **bigger is easier**, so
 * the ladder's own order is turned round. Only ever asked about a country
 * `flagLadderPool` has already kept, so the rank is always there.
 */
export const flagFame = (c: Country): number => FLAG_LADDER.length - RANK.get(c.code)!;
