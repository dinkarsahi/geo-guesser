import { haversineKm } from "../lib/geo";
import {
  formatStops,
  scoreFromStops,
  stopsBetween,
  tubeStations,
  type TubeStation,
} from "./tube";

/**
 * The circle round a station, and half of how Tube Station Spotter marks a
 * guess. The other half is the ride — see `scoreFromStops` in `tube.ts`.
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
 *
 * It arrived as an experiment on a bench of its own and was judged there before
 * being let anywhere near a score. Having graduated it *replaced* the ride
 * rather than standing beside it — there is one tube rule, and the bench
 * (`src/modes/TubeScoringTest.tsx`) now exists to show its working.
 */

/**
 * What the circle is called out loud, on the one screen that has to name it.
 *
 * A rule with a name is a rule a player can hold on to: "the gap" is exactly
 * what it pays for — the space between two stations that are neighbours on the
 * ground and strangers on the network — and the announcement is the one every
 * passenger on the network has already heard. It is named only where it pays;
 * elsewhere the game goes on talking about stops, which is what it marks in.
 */
export const MIND_THE_GAP = "Mind the Gap";

/** The same words as the platform says them, for the line above the mark. */
export const MIND_THE_GAP_CALL = `${MIND_THE_GAP}!`;

/**
 * The innermost whole zone that gets a circle. Boundary stations one step in —
 * the zone 2/3 ones — get one too, at the reduced size below.
 */
export const NEARBY_FROM_ZONE = 3;

/**
 * The reach at zone 3, and what each zone further out adds.
 *
 * Sized off the map rather than off anything a person would do with it: the
 * circle is meant to hold the stations that could plausibly have been meant by
 * the click, which is the ones next along. Measured over stations actually
 * joined by track, the gap between neighbours runs 1.26 km at zone 3, 1.48 at
 * zone 4 and 1.99 at zone 6, so a reach of one gap covers the immediate
 * neighbours and stops there. It grows outwards because the network does; a
 * fixed radius would swallow half of zone 3 or nothing at all at Amersham,
 * depending which end it was set for.
 *
 * The exact figure matters less than it looks, because of how the reach is used
 * below: a bigger circle holds more stations and therefore charges more stops.
 * Widen it and the rule pays out more often but pays less each time, which is
 * the right way round for a number nobody can pick exactly.
 */
const BASE_KM = 1.2;
const PER_ZONE_KM = 0.4;
const MAX_KM = 2.4;

/** What a zone adds to the reach, for a screen that has to say so out loud. */
export const NEARBY_STEP_KM = PER_ZONE_KM;

/**
 * What a station on a zone boundary gives up against the outer of its two.
 *
 * A station billed as zone 3/4 is out where zone 4 is, near enough — the fares
 * say as much — so it takes zone 4's circle rather than zone 3's, and pays a
 * hundred metres for being only half in it. Which puts the boundaries at 1.1 km
 * for 2/3, 1.5 for 3/4, 1.9 for 4/5 and 2.3 for 5/6, stepping between the whole
 * zones instead of rounding down onto the inner one and sitting on top of it.
 *
 * It also brings the 2/3 boundary inside the rule at 1.1 km, where rounding
 * down left it with no circle at all — and those stations are on the same
 * sparse stretches of map as the zone 3 ones next to them.
 */
const BOUNDARY_KM = 0.1;

/** The boundary discount, for a screen that has to say so out loud. */
export const NEARBY_BOUNDARY_KM = BOUNDARY_KM;

/**
 * A station is in when its dot is in, and by nothing wider than that.
 *
 * There was a tolerance here for markers straddling the edge, and it went the
 * way of the reading before it: the dot on screen is worth about 150 m of
 * ground zoomed out, which let Preston Road — 1.74 km from Northwick Park,
 * plainly outside a 1.6 km circle — into the count, and the figure on the panel
 * stopped agreeing with what anyone could see in the circle. The rule is read
 * off the drawing, so the test has to be the one that can be checked against
 * the drawing: centre inside, and that's all.
 */

/**
 * How far a station's circle extends, or null for one too far in to have one.
 *
 * A boundary station is sized off the outer of its two zones and then docked
 * `BOUNDARY_KM`, so it lands between the whole zones either side of it rather
 * than on top of one of them. Rounding down did the latter, which made a zone
 * 3/4 station indistinguishable from a zone 3 one and gave the 2/3 stations
 * nothing at all.
 */
export function nearbyRadiusKm(station: TubeStation): number | null {
  const whole = Number.isInteger(station.zone);
  // The outer of the two for a boundary station, which is where it really sits.
  const zone = whole ? station.zone : Math.ceil(station.zone);
  if (zone < NEARBY_FROM_ZONE) return null;
  const reach = BASE_KM + (zone - NEARBY_FROM_ZONE) * PER_ZONE_KM - (whole ? 0 : BOUNDARY_KM);
  return Math.min(MAX_KM, reach);
}

/** Worked out once per station — the bench asks for this on every render. */
const reachOf = new Map<string, TubeStation[]>();

/**
 * Every other station inside this one's circle — the ones you can see in it.
 *
 * The whole rule is read off the drawing, so the test is the one the eye makes:
 * a station is in if its dot falls within the circle. Nothing about the
 * station's own circle enters into it — that was an earlier reading of
 * "touching", and it counted thirteen stations around a circle with three
 * visibly inside it.
 *
 * Empty for a station too far in to have a circle at all.
 */
export function stationsInReach(clicked: TubeStation): TubeStation[] {
  const cached = reachOf.get(clicked.name);
  if (cached) return cached;
  const radius = nearbyRadiusKm(clicked);
  const found =
    radius === null
      ? []
      : tubeStations.filter(
          (s) => s.name !== clicked.name && haversineKm(clicked, s) <= radius,
        );
  reachOf.set(clicked.name, found);
  return found;
}

/** A marked guess, with the working left in. */
export interface NearbyMark {
  /** The ride, as the network actually is. */
  stops: number;
  /** What the game charges: the ride, or the reach, whichever is kinder. */
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
  /** The mark. */
  score: number;
  /** What the ride alone would have paid, so the bench can show both. */
  rideScore: number;
  /** How the result panel words the verdict. */
  label: string;
}

/**
 * Mark a click.
 *
 * Where the circle covers the answer, the ride is replaced by how crowded the
 * circle is: one stop for the answer itself, plus one for every other station
 * inside. That is the rule doing its own calibration, in the units the game is
 * already marked in. A circle out at Chesham holds almost nothing, so landing
 * in it really does mean knowing where the place is and is paid like a near
 * miss; a circle over a busy corner of zone 3 holds three or four stations, and
 * landing in it narrows the answer to one of those — worth something, but not
 * worth what pointing at the station itself is worth.
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
    rideScore: scoreFromStops(stops),
    // How far the guess really was, always — and where the marks came from,
    // where that isn't the same thing. The ride is what the player wants to know
    // and the only figure the map can be checked against, so it stays on the
    // headline whatever was charged; what changes is the bracket after it, which
    // names the rule that paid rather than making the number smaller and leaving
    // the player to wonder which of the two the game believes.
    label: eased
      ? `${formatStops(stops)} (${MIND_THE_GAP} benefit)`
      : formatStops(stops),
  };
}
