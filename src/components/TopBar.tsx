import type { Route } from "../lib/useRoute";

/**
 * The bar across the top of every screen that isn't a round.
 *
 * Home on the left, Settings on the right, and a surface of its own colour so
 * the page reads as a page rather than as a menu floating in black. Both of
 * those used to be loose buttons: Settings sat under the three cards on the
 * home page and again in the corner of a game's setup screen, and Home was
 * whatever each screen happened to call its own way out. A thing that appears
 * on every screen belongs in the same place on every screen, which is what a
 * bar is for.
 *
 * **The screen's own back button stays.** This bar is the way *out* — to the
 * front door, or to the settings — and several screens have a way *back* that
 * means something else entirely: a game's setup screen returns to the shelf it
 * was picked off, and the duel's steps back through its own screens rather
 * than leaving. Collapsing the two would lose the difference.
 *
 * Kept off a round in progress, like the footer. There the map is pinned to
 * the window, `GameFrame` draws its own header, and the map is already drawn —
 * changing it halfway through five questions would change the thing the player
 * is being marked on.
 */
export default function TopBar({
  go,
  here,
  onSettings,
}: {
  go: (route: Route) => void;
  /** Which screen is up, so the bar doesn't offer a way to where you are. */
  here: Route["at"];
  /** Opens the settings, and remembers this screen to come back to. */
  onSettings: () => void;
}) {
  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        {here === "home" ? (
          // The wordmark rather than a link, on the one screen where Home is
          // where you already are. A button that goes nowhere is worse than no
          // button, and the bar would look broken empty.
          <span className="top-bar-mark">SpotOn</span>
        ) : (
          <button className="top-bar-link" onClick={() => go({ at: "home" })}>
            SpotOn
          </button>
        )}
        <span className="top-bar-gap" />
        {here !== "settings" && (
          <button className="top-bar-link" onClick={onSettings}>
            Settings
          </button>
        )}
      </div>
    </header>
  );
}
