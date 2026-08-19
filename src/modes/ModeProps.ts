import type { Match } from "../lib/match";

/** The games on the menu. */
export type ModeId =
  | "city"
  | "flag"
  | "currency"
  | "company"
  | "population"
  | "tube"
  | "timezone";

/** The lengths a game comes in, chosen on the setup screen. */
export const ROUND_CHOICES = [5, 10] as const;

/** How the player chose to play, picked on the setup screen. */
export interface GameSettings {
  /** How many rounds the game runs to — one of `ROUND_CHOICES`. */
  rounds: number;
  /** City and flag modes only: the flat map instead of the 3D globe. */
  flat: boolean;
  /** Draw country borders (both map styles). */
  borders: boolean;
  /**
   * Tube Station Spotter only: the network on a dark ground instead of the
   * white one the paper map is known by.
   *
   * The tube's alone because the tube's map is the only one the app *draws*.
   * Every other map is a photograph of the Earth, and there is no dark version
   * of a photograph — which is exactly why the old app-wide day/night toggle
   * came out. This is what was worth keeping from it.
   */
  tubeDark: boolean;
}

/** Props every game mode receives from App. */
export interface ModeProps {
  onExit: () => void;
  settings: GameSettings;
  /**
   * Set when the mode is being played as a head-to-head match: five rounds
   * dealt from the code's seed, a clock on each of them, and a score that pays
   * for speed. Absent for an ordinary solo game.
   */
  match?: Match;
}
