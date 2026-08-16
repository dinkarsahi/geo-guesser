import type { Country } from "./countries";
import { MAX_ROUND_SCORE } from "../lib/geo";
import { countryZones } from "./timeZoneData";

/** Minutes in a day. Nearly all the arithmetic here is modulo this. */
const DAY = 1440;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * A round of the time-zone game: one position on the 24-hour clock face, and
 * everywhere on Earth currently standing at it.
 *
 * A *position*, not a time. The time it reads moves on every minute, and if
 * rounds were dealt by the time they'd be a different five rounds a minute
 * later — which is fine alone and fatal in a duel, where two devices a second
 * apart have to deal the same game. The position is fixed: it's what the clocks
 * are set to, and the reading is worked out from it whenever the screen asks.
 */
export interface TimeTarget {
  /**
   * Where this clock stands, as minutes ahead of UTC's own reading, wrapped
   * into a day. Wrapped because the question is what a clock says and not what
   * date it says: Samoa on UTC+13 and Niue on UTC−11 are a day apart and read
   * the same hour, and both are the right answer to "where is it 09:00?".
   */
  clockOffset: number;
  /**
   * The same offset as it's conventionally written — +780 for UTC+13, where
   * `clockOffset` has no way to tell that from UTC−11. Only for labelling.
   */
  namedOffset: number;
  /** Every country reading this clock, alphabetically. */
  countries: Country[];
  /** Stand-in location, only used before a guess picks a nearer one. */
  lat: number;
  lng: number;
}

/**
 * The offset a zone is on, in minutes east of UTC, at a given moment.
 *
 * Worked out by asking `Intl` what the wall clock reads there and subtracting,
 * which is the one method that needs no table of its own and is right through
 * every summer-time change the browser knows about.
 *
 * Cached by the hour, since that's the coarsest bucket in which an offset can
 * never change — the clocks always go forward on the hour — and a game asks
 * this thousands of times while lasting minutes.
 */
const offsets = new Map<string, number>();

function zoneOffset(zone: string, at: number): number {
  const key = `${zone}|${Math.floor(at / 3_600_000)}`;
  const seen = offsets.get(key);
  if (seen !== undefined) return seen;

  const parts: Record<string, string> = {};
  for (const p of clockFormat(zone).formatToParts(new Date(at))) parts[p.type] = p.value;
  // What that reading would be if it were UTC, against what UTC actually is.
  // Seconds are floored off both sides so the difference lands on a whole
  // minute rather than a fraction of one.
  const asUtc = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    // Some engines write midnight as 24 in a 24-hour clock.
    +parts.hour % 24,
    +parts.minute,
    +parts.second,
  );
  const offset = Math.round((asUtc - Math.floor(at / 1000) * 1000) / 60_000);
  offsets.set(key, offset);
  return offset;
}

/** Formatters are expensive to build and every zone is asked about repeatedly. */
const formats = new Map<string, Intl.DateTimeFormat>();

function clockFormat(zone: string): Intl.DateTimeFormat {
  let f = formats.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formats.set(zone, f);
  }
  return f;
}

/**
 * A clock as both the things this game has to say about one: where it stands,
 * and how the offset it stands at is written.
 *
 * Carried together because neither can be recovered from the other. A position
 * on the face is what a guess is marked against and it is deliberately blind to
 * which side of the date line it came from — Samoa on UTC+13 and Niue on UTC−11
 * stand in the same place. Read an offset back off that position and Samoa is
 * labelled UTC−11, which is the same trap `TimeTarget.namedOffset` exists for.
 */
export interface ClockReading {
  /** Where the clock stands on the 24-hour face, wrapped into a day. */
  clock: number;
  /** The same offset as it's conventionally written: −660 for UTC−11. */
  named: number;
}

/**
 * Where one zone's clock stands, as a position on the 24-hour face. What
 * `countryReadings` reads for a whole country, read for a single part of one.
 */
export const zoneClock = (zone: string, at: number): number =>
  mod(zoneOffset(zone, at), DAY);

/** The same clock, with the offset that names it. */
export function zoneReading(zone: string, at: number): ClockReading {
  const named = zoneOffset(zone, at);
  return { clock: mod(named, DAY), named };
}

/**
 * Where a country's clocks stand — usually one position, eleven for Russia.
 * Empty for a country the zone table has never heard of, which takes it out of
 * the game rather than putting it on the wrong clock.
 */
export function countryReadings(code: string, at: number): ClockReading[] {
  const zones = countryZones[code];
  if (!zones) return [];
  // One entry per position on the face, since that is what a click answers
  // with. Two of a country's zones reading the same clock are one answer.
  const byClock = new Map<number, ClockReading>();
  for (const zone of zones) {
    const reading = zoneReading(zone, at);
    if (!byClock.has(reading.clock)) byClock.set(reading.clock, reading);
  }
  return [...byClock.values()];
}

/** What a clock standing at `clockOffset` reads now, in minutes past midnight. */
export function clockNow(clockOffset: number, at: number): number {
  const d = new Date(at);
  return mod(d.getUTCHours() * 60 + d.getUTCMinutes() + clockOffset, DAY);
}

/** "14:30" — 24-hour, which is the form the question is asked in. */
export const clockLabel = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(mod(minutes, 60)).padStart(2, "0")}`;

/** "UTC", "UTC+1", "UTC−3:30" — an offset named rather than read. */
export function utcLabel(namedOffset: number): string {
  if (namedOffset === 0) return "UTC";
  const sign = namedOffset < 0 ? "−" : "+";
  const total = Math.abs(namedOffset);
  const minutes = total % 60;
  return `UTC${sign}${Math.floor(total / 60)}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

/**
 * How far apart two clock positions are, in minutes, the short way round.
 *
 * Round, because a clock face is round: 23:30 and 00:30 are an hour apart and
 * not twenty-three. Nothing on Earth is ever more than twelve hours from
 * anything else by this measure.
 */
export function clockGap(a: number, b: number): number {
  const d = mod(a - b, DAY);
  return Math.min(d, DAY - d);
}

/**
 * How wide the "you were nearly there" shoulder is, in half-hours. Three is an
 * hour and a half: two thirds at an hour out, a third at ninety minutes, and
 * nothing to speak of past three hours.
 */
const GAP_SCALE = 3;

/**
 * Score a guess by how far its clock is from the one asked about — in
 * half-hours, since that's the unit the world's clocks are actually offset in.
 *
 * Tighter than the other games on purpose, because this one is easier than the
 * other games. There are thirty-five answers in the world rather than two
 * hundred cities, five countries share the median clock and forty-six share the
 * busiest, and a player who knows only that Europe is ahead of London has a
 * third of the map to be right with. A curve that paid well for being close
 * would pay well for knowing almost nothing.
 *
 * Still squared rather than a plain decay, but for the opposite half of the
 * reason it is on the tube map. There the flat start was the point; here it's
 * the cliff after it. A plain decay charges a fixed fraction per hour, so the
 * second hour costs less than the first and the fifth costs almost nothing —
 * exactly backwards for a game where the first hour is a near miss and the
 * fifth is a different continent. Squared, each of the first two hours costs
 * more than the one before it: thirty-six points, then forty-seven.
 *
 * The sub-hour end stays gentle, since it has to be. A handful of the world's
 * clocks sit on the half hour and three of them on the quarter, and being
 * thirty minutes out means picking Pakistan for India — the right part of the
 * world, on a clock almost nobody could name.
 */
export function scoreFromClockGap(minutes: number): number {
  const halfHours = minutes / 30;
  const out = halfHours / GAP_SCALE;
  return Math.round(MAX_ROUND_SCORE * Math.exp(-out * out));
}

/** "spot on", "30 minutes out", "1 hour out", "2½ hours out". */
export function formatClockGap(minutes: number): string {
  if (minutes === 0) return "spot on";
  if (minutes < 60) return `${minutes} minutes out`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  // Quarters and halves, because a handful of the world's clocks are offset by
  // them and "1.75 hours out" is not something anybody says.
  const fraction = rest === 30 ? "½" : rest === 15 ? "¼" : rest === 45 ? "¾" : "";
  const whole = fraction ? `${hours}${fraction}` : `${hours}`;
  return `${whole} ${hours === 1 && !fraction ? "hour" : "hours"} out`;
}

let cachedFor: Country[] | null = null;
let cached: TimeTarget[] = [];

/**
 * Every clock position in the world right now, each carrying the countries
 * standing at it.
 *
 * Built from the same country pool the flag round uses, so a time can never be
 * asked about unless there's somewhere on the map to click for it. Ordered by
 * the position itself, which is fixed and the same everywhere — a duel deals
 * its rounds by shuffling this, and two players must be shuffling the same
 * list. Cached by pool identity, which keeps the array stable and with it the
 * game's memory of what it has already dealt.
 *
 * Reads the clock itself rather than being handed a moment, because the moment
 * only decides which side of a summer-time change the world is on — and once
 * the pool is built it's kept, so a game in progress can't have its rounds
 * reshuffled underneath it by the minute turning over.
 */
export function timeZonePool(countries: Country[]): TimeTarget[] {
  if (!countries.length) return [];
  if (countries === cachedFor) return cached;
  const at = Date.now();

  const groups = new Map<number, { countries: Country[]; named: Map<number, number> }>();
  for (const c of countries) {
    const zones = countryZones[c.code];
    if (!zones) continue;
    // A country appears under each clock it keeps, so Russia is the answer to
    // eleven different times and is once, correctly, its own near miss.
    const seen = new Set<number>();
    for (const zone of zones) {
      const signed = zoneOffset(zone, at);
      const clock = mod(signed, DAY);
      let group = groups.get(clock);
      if (!group) {
        group = { countries: [], named: new Map() };
        groups.set(clock, group);
      }
      if (!seen.has(clock)) {
        seen.add(clock);
        group.countries.push(c);
      }
      // Which way round to write this clock, decided by how many zones use each
      // reading of it — UTC+13 has Samoa and Tokelau, UTC−11 has Niue, and one
      // of the two has to go on the label.
      group.named.set(signed, (group.named.get(signed) ?? 0) + 1);
    }
  }

  cachedFor = countries;
  cached = [...groups]
    .sort(([a], [b]) => a - b)
    .map(([clockOffset, { countries: here, named }]) => {
      const namedOffset = [...named].sort(
        (a, b) => b[1] - a[1] || Math.abs(a[0]) - Math.abs(b[0]),
      )[0][0];
      return {
        clockOffset,
        namedOffset,
        countries: here,
        lat: here[0].lat,
        lng: here[0].lng,
      };
    });
  return cached;
}
