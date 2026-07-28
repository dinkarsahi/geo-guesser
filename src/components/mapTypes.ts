import type { Coord } from "../lib/geo";

/** Common interface implemented by every clickable guessing map. */
export interface GuessMapProps {
  /** Called with the lat/lng of a map click while guessing is allowed. */
  onGuess: (c: Coord) => void;
  /** The player's current guess, drawn as a marker. */
  guess?: Coord | null;
  /** The true location, revealed as a marker after guessing. */
  answer?: Coord | null;
  /** When true, clicks are ignored (round already scored). */
  disabled?: boolean;
}
