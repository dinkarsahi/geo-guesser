import type { GameSettings } from "../modes/ModeProps";

/**
 * How the player likes their map, kept between visits.
 *
 * These used to be asked on the way into every game — a globe-or-flat and a
 * borders-or-not in front of each of the seven, and again in front of today's
 * round, and again in front of a duel. Ten screens asking the same two
 * questions, and answering them was the last thing between wanting to play and
 * playing. They are a **preference**, not a decision about this round: a
 * player who likes the globe likes it every time, and being asked implies
 * otherwise. So they are answered once, on their own screen, and remembered.
 *
 * Kept here rather than in `App`'s state alone so a refresh doesn't quietly
 * put somebody back on a map they turned off — which, borders being the
 * difference between a hard game and an easy one, would change what they were
 * playing without saying so.
 *
 * **This is storage, so it is on the privacy page** — see `Privacy.tsx`, which
 * names every key this app writes. Add one here and it is part of the change.
 */
const KEY = "spoton.prefs.v1";

/**
 * What a player gets before they have said otherwise: the **globe**, and
 * **no borders**.
 *
 * The globe because it is the thing this game is, and a flat map is the
 * fallback for people who find one hard to read. No borders because the
 * question is where a place *is*, and an outlined world answers a good part of
 * that before the player has looked — the coastline is the game, and the
 * political map is a hint printed over it.
 */
export const DEFAULT_SETTINGS: GameSettings = {
  rounds: 5,
  flat: false,
  borders: false,
};

/**
 * What this device last chose, or the defaults.
 *
 * Every field is checked rather than trusted. What comes back is whatever was
 * in localStorage — an older shape, a half-written string, something another
 * tab left behind — and a `borders` that is the string "false" is `true` to an
 * `if`, which would turn the setting on by reading it.
 */
export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<GameSettings>;
    return {
      ...DEFAULT_SETTINGS,
      flat: typeof saved.flat === "boolean" ? saved.flat : DEFAULT_SETTINGS.flat,
      borders:
        typeof saved.borders === "boolean" ? saved.borders : DEFAULT_SETTINGS.borders,
    };
  } catch {
    // A browser with storage turned off, or a private window that refuses it.
    // The game is still perfectly playable on the defaults; it just won't
    // remember. Nothing here is worth failing a page load over.
    return DEFAULT_SETTINGS;
  }
}

/** Remember a change. Silent if the browser won't have it — see above. */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ flat: settings.flat, borders: settings.borders }),
    );
  } catch {
    // Ignored deliberately: see `loadSettings`.
  }
}
