/** How the player chose to play, picked on the setup screen. */
export interface GameSettings {
  /** Free run: unlimited rounds instead of a scored five. */
  endless: boolean;
  /** City and flag modes only: the flat map instead of the 3D globe. */
  flat: boolean;
  /** Draw country borders (both map styles). */
  borders: boolean;
}

/** Props every game mode receives from App. */
export interface ModeProps {
  onExit: () => void;
  night: boolean;
  onToggleNight: () => void;
  settings: GameSettings;
}
