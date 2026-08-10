import { formatDistance, haversineKm } from "../lib/geo";
import {
  formatStops,
  scoreFromStops,
  stopsBetween,
  tubeStations,
  type TubeStation,
} from "./tube";

/**
 * An experimental way of marking the tube game, kept apart from the one that
 * counts. Nothing in `Tube Station Spotter` reads this file — see
 * `src/modes/TubeScoringTest.tsx`, which is the whole of what does.
 *
 * The complaint it answers: out in the suburbs two stations can be a few
 * minutes' walk apart and eighteen stops apart, because the only train between
 * them goes into town and comes back out on another branch. Marked in stops
 * alone, a player who put their finger within 400 m of the answer is charged
 * the same as one who pointed at the wrong side of London — and the thing they
 * got wrong was which branch, not where the place is.
 *
 * So from zone 3 outwards each station is given a reach, and an answer inside
 * the reach of the station that was clicked is marked on how crowded that reach
 * is rather than on the ride. Inside the city a reach would be nonsense: in
 * zone 1 the stations are a few hundred metres apart, everything is near
 * everything, and a radius would hand out marks for knowing roughly where the
 * middle of London is. It's the outer network that is sparse enough for
 * closeness to mean something, and sparse enough for the ride to be silly.
 */

/** The innermost zone that gets a reach. Zone 2/3 boundary stations don't. */
export const NEARBY_FROM_ZONE = 3;

/**
 * The reach at zone 3, and what each zone further out adds.
 *
 * BASE_KM is a stop's worth of ground: adjacent stations are about 1.2 km apart
 * out there, so a click inside the reach is at most about one stop's walk from
 * the answer, which is exactly the near miss the rule exists to pay for. It
 * grows because the stops themselves do — the gaps are better than twice that
 * by zone 6, so a fixed radius would be generous at Amersham and mean at
 * Turnham Green. The cap is roughly half an hour on foot, past which "near"
 * has stopped describing anything.
 *
 * The size matters less than it looks, because of how the reach is used below:
 * a bigger circle catches more stations and so charges more stops. Widen it and
 * the rule pays out more often but pays less each time, which is the right way
 * round for a number nobody can pick exactly.
 */
const BASE_KM = 1.2;
const PER_ZONE_KM = 0.4;
const MAX_KM = 2.4;

/** What a zone adds to the reach, for a screen that has to say so out loud. */
export const NEARBY_STEP_KM = PER_ZONE_KM;

/** How far a station's reach extends, or null for one too far in to have one. */
export function nearbyRadiusKm(station: TubeStation): number | null {
  if (station.zone < NEARBY_FROM_ZONE) return null;
  const beyond = Math.floor(station.zone) - NEARBY_FROM_ZONE;
  return Math.min(MAX_KM, BASE_KM + beyond * PER_ZONE_KM);
}

/** Two stations are in reach of each other when their circles meet at all. */
const inReach = (a: TubeStation, b: TubeStation, radiusA: number) =>
  haversineKm(a, b) <= radiusA + (nearbyRadiusKm(b) ?? 0);

/** Worked out once per station — the bench asks for this on every render. */
const reachOf = new Map<string, TubeStation[]>();

/**
 * Every other station within reach of this one.
 *
 * "Within reach" is circle meeting circle rather than centre falling inside
 * circle: a station whose own reach so much as touches this one is counted, not
 * only one sitting well inside it. Being on the edge of somewhere is still
 * being there, and a hard boundary would put two stations either side of a line
 * a hundred metres apart into different worlds.
 *
 * Empty for a station too far in to have a reach at all.
 */
export function stationsInReach(clicked: TubeStation): TubeStation[] {
  const cached = reachOf.get(clicked.name);
  if (cached) return cached;
  const radius = nearbyRadiusKm(clicked);
  const found =
    radius === null
      ? []
      : tubeStations.filter((s) => s.name !== clicked.name && inReach(clicked, s, radius));
  reachOf.set(clicked.name, found);
  return found;
}

/** A guess marked under the test rules, with the working left in. */
export interface NearbyMark {
  /** The ride, as the network actually is — what the game charges today. */
  stops: number;
  /** What the test rule charges: the ride, or the reach, whichever is kinder. */
  countedStops: number;
  /** How far apart the two stations are on the ground. */
  km: number;
  /** The clicked station's reach, or null if it's too far in to have one. */
  radiusKm: number | null;
  /** How many other stations are within that reach. */
  neighbours: number;
  /** The answer is one of them. */
  covered: boolean;
  /** What the reach would charge — null when it doesn't cover the answer. */
  reachStops: number | null;
  /** The reach is what the mark came from, rather than the ride. */
  eased: boolean;
  /** The mark under the test rules. */
  score: number;
  /** And under the ones the game uses today, so the two can be compared. */
  todayScore: number;
  /** How a result panel words the test rule's verdict. */
  label: string;
}

/**
 * Mark a click under the test rules.
 *
 * Where the reach covers the answer, the ride is replaced by how crowded the
 * reach is: one stop for the answer itself, plus one for every other station
 * whose circle the click's circle meets. That is the rule doing its own
 * calibration. A reach out at Chesham holds almost nothing, so landing in it
 * really does mean knowing where the place is and is paid like a near miss; a
 * reach over a busy corner of zone 3 holds half a dozen stations, and landing
 * in it narrows the answer down to one of six — worth something, but not worth
 * what pointing at the station itself is worth.
 *
 * The reach belongs to the station the player clicked, not to the answer,
 * because it's the player's click the circle is drawn around: what's on screen
 * has to be what's being scored. And it only ever helps — the better of the two
 * counts, so the rule can't cost anybody a round.
 */
export function markNearby(clicked: TubeStation, answer: TubeStation): NearbyMark {
  const stops = stopsBetween(clicked.name, answer.name);
  const km = haversineKm(clicked, answer);
  const radiusKm = nearbyRadiusKm(clicked);

  const near = stationsInReach(clicked);
  const covered = near.some((s) => s.name === answer.name);
  const reachStops = covered ? near.length + 1 : null;
  const countedStops = reachStops === null ? stops : Math.min(stops, reachStops);
  const eased = countedStops < stops;

  return {
    stops,
    countedStops,
    km,
    radiusKm,
    neighbours: near.length,
    covered,
    reachStops,
    eased,
    score: scoreFromStops(countedStops),
    todayScore: scoreFromStops(stops),
    // Where the reach did the work, the ride is named as well as the mark:
    // "2 stops away" over a journey the player can see is eighteen looks like
    // the game has lost count of its own network.
    label: eased
      ? `${formatDistance(km)} away — counted as ${formatStops(countedStops)}`
      : formatStops(stops),
  };
}
