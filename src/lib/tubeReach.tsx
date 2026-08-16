import type { ReactNode } from "react";
import type { MapRing } from "../components/LondonMap";
import { nearestStation, type TubeStation } from "../data/tube";
import { markNearby, nearbyRadiusKm, MIND_THE_GAP_CALL } from "../data/tubeNearby";
import type { Coord } from "./geo";

/**
 * The circle a tube round is half marked on, made visible — drawn on the map,
 * and said in words under the score.
 *
 * Both live here rather than in the screens that use them because the whole
 * rule is read off the drawing: the number of stations a player can count
 * inside the circle is what the round cost them. A circle that differed by a
 * hair between the game and the bench, or a circle drawn on a round it had
 * nothing to do with, would make the picture disagree with the printed number
 * — which is the one thing this rule cannot afford.
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
export function reachRing(station: TubeStation): MapRing[] {
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
 * Only ever printed on a round the circle paid for, and it says the one thing
 * the player can't work out from the panel: that the ride really was that long
 * and they are being let off some of it. The circle's radius, its population
 * and the arithmetic between them are the bench's business — on a round they
 * are three sentences of workings between the player and the next question, and
 * everything they explain is already drawn on the map.
 *
 * Null on every other round, because there the stops on the headline are the
 * whole story and a note that never varies stops being read.
 */
export function creditNote(click: Coord, answer: TubeStation): ReactNode {
  const clicked = nearestStation(click);
  const mark = markNearby(clicked, answer);
  if (!mark.eased) return null;

  // Two stations can sit a street apart with no train between them at all, and
  // "You were Infinity stops away" is not the sentence for it.
  const ride = Number.isFinite(mark.stops) ? (
    <>
      You were <strong>{mark.stops}</strong> stops from {answer.name}
    </>
  ) : (
    <>There’s no ride from {clicked.name} to {answer.name} at all</>
  );

  return (
    <>
      {ride}, but you clicked close by — so we’re giving you some credit!
    </>
  );
}
