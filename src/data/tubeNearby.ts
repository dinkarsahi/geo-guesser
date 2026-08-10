import { formatDistance, haversineKm } from "../lib/geo";
import { formatStops, scoreFromStops, stopsBetween, type TubeStation } from "./tube";

/**
 * An experimental way of marking the tube game, kept apart from the one that
 * counts. Nothing in `Tube Station Spotter` reads this file — see
 * `src/modes/TubeScoringTest.tsx`, which is the whole of what does.
 *
 * The complaint it answers: out in the suburbs two stations can be a few
 * minutes' walk apart and nineteen stops apart, because the only train between
 * them goes into town and comes back out on another branch. Marked in stops
 * alone, a player who put their finger within half a mile of the answer is
 * charged the same as one who pointed at the wrong side of London — and the
 * thing they got wrong was which branch, not where the place is.
 *
 * So from zone 3 outwards each station is given a radius, and an answer inside
 * that radius is marked as though it were a stop or two away rather than the
 * ride it really is. Inside the city that would be nonsense: in zone 1 the
 * stations are a few hundred metres apart, everything is near everything, and
 * a radius would hand out full marks for knowing roughly where the middle of
 * London is. It's the outer network that is sparse enough for closeness to
 * mean something, and sparse enough for the ride to be silly.
 */

/** The innermost zone that gets a radius. Zone 2/3 boundary stations don't. */
export const NEARBY_FROM_ZONE = 3;

/**
 * The radius at zone 3, and how much each zone further out adds.
 *
 * Roughly one stop's worth of walking, growing as the stops themselves do:
 * adjacent stations are about 1.2 km apart in zone 3 and better than twice
 * that by zone 6, so a fixed radius would be generous out at Amersham and
 * mean at Turnham Green. Capped, because past a point "near" stops being a
 * walk and starts being a bus ride.
 */
const BASE_KM = 1.2;
const PER_ZONE_KM = 0.4;
const MAX_KM = 2.4;

/**
 * What a guess inside the radius is counted as: one stop from the middle of it,
 * two from the edge.
 *
 * Not zero. Landing near the answer is knowing the area, and this is meant to
 * pay it like a near miss rather than like the answer itself — the player who
 * clicked the station is still ahead of the player who clicked its neighbour,
 * which is the distinction the game exists to draw.
 */
const INNER_STOPS = 1;
const OUTER_STOPS = 2;

/** How far a station's radius reaches, or null for one too far in to have one. */
export function nearbyRadiusKm(station: TubeStation): number | null {
  if (station.zone < NEARBY_FROM_ZONE) return null;
  const beyond = Math.floor(station.zone) - NEARBY_FROM_ZONE;
  return Math.min(MAX_KM, BASE_KM + beyond * PER_ZONE_KM);
}

/** A guess marked under the test rules, with the working left in. */
export interface NearbyMark {
  /** The ride, as the network actually is. */
  stops: number;
  /** What it's marked as — the ride, unless the radius bettered it. */
  countedStops: number;
  /** How far apart the two stations are on the ground. */
  km: number;
  /** The clicked station's reach, or null if it's too far in to have one. */
  radiusKm: number | null;
  /** The radius is what the mark came from, rather than the ride. */
  eased: boolean;
  /** The mark under these rules. */
  score: number;
  /** And under the ones the game uses today, so the two can be compared. */
  todayScore: number;
  /** How the result panel words it. */
  label: string;
}

/**
 * Mark a click under the test rules.
 *
 * The radius belongs to the station the player clicked, not to the answer,
 * because it's the player's click the circle is drawn around: what's on screen
 * has to be what's being scored. It only ever helps — a guess already closer
 * than the radius would make it keeps the better of the two, so the rule can't
 * cost anybody a round.
 */
export function markNearby(clicked: TubeStation, answer: TubeStation): NearbyMark {
  const stops = stopsBetween(clicked.name, answer.name);
  const km = haversineKm(clicked, answer);
  const radiusKm = nearbyRadiusKm(clicked);

  const granted =
    radiusKm !== null && km <= radiusKm
      ? km <= radiusKm / 2
        ? INNER_STOPS
        : OUTER_STOPS
      : null;
  const countedStops = granted === null ? stops : Math.min(stops, granted);
  const eased = countedStops < stops;

  return {
    stops,
    countedStops,
    km,
    radiusKm,
    eased,
    score: scoreFromStops(countedStops),
    todayScore: scoreFromStops(stops),
    // Where the radius did the work, the ride is named as well as the mark:
    // "1 stop away" over a journey the player can see is nineteen looks like
    // the game has lost count of its own network.
    label: eased
      ? `${formatDistance(km)} away — counted as ${formatStops(countedStops)}`
      : formatStops(stops),
  };
}
