import type { Feature, Geometry } from "geojson";
import type { Coord } from "../lib/geo";

/**
 * A patch of the world painted on once the round is scored: green where the
 * answer was, red where the player went instead.
 *
 * For the clock game, which has no single place to point at. "Where is it
 * 14:30?" is answered by a band across the map rather than by a pin, and half
 * a country can be the answer while the other half isn't — so the reveal is
 * the shape itself, and there's nothing for a pin to mark.
 */
export interface MapHighlight {
  /** Stable across renders, so neither map rebuilds a shape it already has. */
  key: string;
  feature: Feature<Geometry>;
  tone: "right" | "wrong";
}

/** Common interface implemented by every clickable guessing map. */
export interface GuessMapProps {
  /**
   * When the first round opens, as a timestamp — see `useGame`'s
   * `firstRoundAt`. A map with an arrival to play has until then and not a
   * moment longer; one without ignores it. Already past on every round after
   * the first, which is how "only at the start" is expressed.
   */
  arriveAt?: number;
  /** Called with the lat/lng of a map click while guessing is allowed. */
  onGuess: (c: Coord) => void;
  /** The player's current guess, drawn as a marker. */
  guess?: Coord | null;
  /** The true location, revealed as a marker after guessing. */
  answer?: Coord | null;
  /** When true, clicks are ignored (round already scored). */
  disabled?: boolean;
}
