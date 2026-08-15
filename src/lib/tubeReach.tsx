import type { ReactNode } from "react";
import type { MapRing } from "../components/LondonMap";
import { nearestStation, type TubeStation } from "../data/tube";
import { markNearby, nearbyRadiusKm } from "../data/tubeNearby";
import type { Coord } from "./geo";

/**
 * The circle a tube round is half marked on, made visible — drawn on the map,
 * and said in words under the score.
 *
 * Both live here rather than in the screens that use them because the whole
 * rule is read off the drawing: the number of stations a player can count
 * inside the circle is what the round cost them. A circle that differed by a
 * hair between the game and the bench, or a sentence that quoted a radius the
 * map didn't draw, would make the printed number disagree with the picture —
 * which is the one thing this rule cannot afford.
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
 * Where the mark came from, when the circle had anything to do with it.
 *
 * It names the same three things the eye can check on the map: how wide the
 * circle is, what is inside it, and what that came to against the ride. Silent
 * where the clicked station has no circle at all, because then nothing happened
 * that the stops don't already say — and a note printed every round is a note
 * nobody reads.
 */
export function reachNote(click: Coord, answer: TubeStation): ReactNode {
  const clicked = nearestStation(click);
  const mark = markNearby(clicked, answer);
  if (mark.radiusKm === null) return null;

  const radius = <strong>{mark.radiusKm.toFixed(1)} km</strong>;

  if (!mark.covered) {
    return (
      <>
        {clicked.name}’s circle reaches {radius}, and {answer.name} falls outside it — so
        this one was charged as the ride.
      </>
    );
  }

  const inside =
    mark.neighbours === 0
      ? "no other station stands inside it"
      : `${mark.neighbours} other ${
          mark.neighbours === 1 ? "station stands" : "stations stand"
        } inside it`;

  return (
    <>
      {clicked.name}’s circle reaches {radius} and {inside}, so anywhere inside it counts
      as <strong>{mark.reachStops}</strong> {mark.reachStops === 1 ? "stop" : "stops"}
      {mark.eased ? (
        <>
          {" "}
          — cheaper than the {mark.stops}-stop ride, and the kinder of the two is what
          you pay.
        </>
      ) : (
        <>. The ride was shorter still, so that stood.</>
      )}
    </>
  );
}
