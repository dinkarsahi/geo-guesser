import type { ReactNode } from "react";
import type { MapRing } from "../components/LondonMap";
import { nearestStation, type TubeStation } from "../data/tube";
import {
  markNearby,
  nearbyRadiusKm,
  MIND_THE_GAP,
  MIND_THE_GAP_CALL,
} from "../data/tubeNearby";
import type { Coord } from "./geo";

/**
 * The circle a tube round can be marked on, made visible — drawn on the map,
 * announced over the mark, and explained in a sentence under it.
 *
 * All three live here rather than in the screen that shows them because the
 * whole rule is read off the drawing: the circle a player can see round their
 * click is what the round was marked on. A circle drawn on a round it had
 * nothing to do with, or a sentence about one the map never drew, would make
 * the picture disagree with the score — which is the one thing this rule cannot
 * afford.
 */

/** Nothing to draw, as one array rather than a fresh one each render. */
export const NO_RINGS: MapRing[] = [];

/**
 * The reach of the station that was pressed, and only that one.
 *
 * Every station's circle drawn at once is the shape of the rule but not the
 * shape of a round: a hundred-odd overlapping discs across the whole of outer
 * London, with the one actually being scored somewhere in the middle of them.
 * A radius is a claim about a particular click, so it's drawn when there's a
 * click to make it about.
 */
function reachRing(station: TubeStation): MapRing[] {
  const km = nearbyRadiusKm(station);
  return km === null
    ? NO_RINGS
    : [{ key: station.name, lat: station.lat, lng: station.lng, km, strong: true }];
}

/**
 * The circle to draw over a round, which is none unless the circle paid.
 *
 * A radius that appears on every guess is a radius the player learns to ignore,
 * and worse, one that seems to be claiming something on rounds where it did
 * nothing: a circle drawn round a click that was charged the full ride reads as
 * an offer that was made and then not honoured. So it is drawn exactly when it
 * is the reason the mark is what it is, and the sentence below appears with it.
 */
export function paidRing(click: Coord, answer: TubeStation): MapRing[] {
  const clicked = nearestStation(click);
  return markNearby(clicked, answer).eased ? reachRing(clicked) : NO_RINGS;
}

/**
 * The announcement over the mark, on a round the circle paid for.
 *
 * It arrives before the number rather than after it, and it is the platform's
 * own words: the player is about to read a figure that is nothing like the ride
 * they can see on the map, and being told first which rule they are being
 * marked by makes that figure an answer instead of a mistake. Null on every
 * other round, where the ride needs no announcing.
 */
export function gapCall(click: Coord, answer: TubeStation): string | null {
  return markNearby(nearestStation(click), answer).eased ? MIND_THE_GAP_CALL : null;
}

/**
 * Why the mark is kinder than the ride, when it is.
 *
 * Only ever printed on a round the circle paid for, and it names the two ends
 * of the thing the headline has just put in brackets: which station's area was
 * involved, and that the answer was inside it. **An** area rather than **the**
 * area — every station out here has one, and the player has landed in one of
 * them, not in some single feature of the map they were supposed to know about.
 *
 * It quotes no numbers. The ride is on the headline and the mark is beside it;
 * the radius, the count inside it and the arithmetic between them belong to
 * `tubeNearby.ts` and stay there — on a round they are three sentences of
 * workings between the player and the next question.
 *
 * Null on every other round, because there the stops on the headline are the
 * whole story and a note that never varies stops being read.
 */
export function creditNote(click: Coord, answer: TubeStation): ReactNode {
  const clicked = nearestStation(click);
  if (!markNearby(clicked, answer).eased) return null;

  return (
    <>
      {answer.name} is inside a {MIND_THE_GAP} Area around {clicked.name}, so we’re
      giving you some credit!
    </>
  );
}
