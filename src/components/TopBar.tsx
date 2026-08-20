import { dailyCode, gameOfDay, parseMatchCode } from "../lib/match";
import { spentOnThisDevice } from "../lib/leaderboard";
import type { Route } from "../lib/useRoute";

/**
 * The bar across the top of every screen that isn't a round.
 *
 * The wordmark, then the ways to the parts of the site this screen isn't, then
 * Settings on the right. All of them used to be loose buttons: Settings sat
 * under the three cards on the home page and again in the corner of a game's
 * setup screen, and the way out was whatever each screen happened to call it.
 * A thing that appears on every screen belongs in the same place on every
 * screen, which is what a bar is for.
 *
 * **It offers the sections rather than a way back.** Home alone meant every
 * journey between two parts of the site went through the front door — the
 * leaderboard to the shelf was Home, then All Games — and the home page's
 * three cards were the only place the parts were named together. Named in the
 * bar, they are one press apart from anywhere.
 *
 * **The one you are on is shown but not offered** — marked, and not a button.
 * Two things come of that, and the second is the one worth having.
 *
 * The four are always all four, so the group never moves. Dropping the current
 * one instead left three links on some screens and four on others, and centred
 * that put the same "Home" 55px apart between All Games and Privacy — a link
 * travelling across the bar for no reason the reader can see.
 *
 * And absence is the weakest signal there is. A bar that quietly omits where
 * you are asks the reader to notice a gap and work out what filled it; a bar
 * that marks it *says* where they are, which is half of what a navigation is
 * for and the half a row of identical links can't do.
 *
 * **What counts as "where you are" is the link's own destination**, which is a
 * plain `l.route.at === here` and not a map of which screen belongs to which
 * section. There was such a map, and marking is what proved it wrong: it
 * folded a game's setup screen into All Games, so City Spotter's setup screen
 * announced that you were on the shelf — which is untrue, and took away the
 * one route the bar had back to it. Hiding could carry that fudge because
 * hiding claims almost nothing; marking makes a claim, and the claim has to be
 * true.
 *
 * It pays off at the table, too. On `/leaderboard` the daily link resolves to
 * `/leaderboard` for a device that has played — so it is marked, correctly —
 * and to `/` for one that hasn't, which leaves somebody who wandered onto
 * today's table without playing a live link to go and play. The old map marked
 * both alike and stranded the second.
 *
 * **The home page shows none of them.** Its three cards *are* the sections, at
 * full size with a line apiece saying what they are, so naming them again in a
 * strip above is the same offer twice on one screen — and the smaller, quieter
 * copy of it at that. The bar there is the wordmark and Settings, which is what
 * it was before the sections were added to it.
 *
 * **The screen's own back button stays where it means something else.** A
 * game's setup screen returns to the shelf it was picked off and the duel's
 * steps back through its own screens; those are not this bar's job. What has
 * gone is the button that only ever said **Home**, on the screens that had one
 * — the bar says it now, and in the same place every time.
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
  // Today's round leads to the table once this device has had its go, exactly
  // as the home page's card does. `/` sends a spent device home, so offered
  // bare this link would bounce the player straight back out — a door that
  // reads as broken. Read through `parseMatchCode` rather than off `dailyCode`
  // directly, because that is the form the played-here record is keyed on.
  const today = parseMatchCode(dailyCode(gameOfDay()));
  const daily: Route =
    today && spentOnThisDevice(today.code) ? { at: "leaderboard" } : { at: "daily" };

  const links: { route: Route; label: string }[] = [
    { route: { at: "home" }, label: "Home" },
    { route: daily, label: "Today's Round" },
    { route: { at: "duel" }, label: "Duel" },
    { route: { at: "games" }, label: "All Games" },
  ];

  // Three cells, always all three, so the middle one is centred on the *bar*
  // rather than on whatever is left over beside the wordmark — which is what a
  // flex spacer gave, and it put the sections off to one side whenever
  // Settings was missing. Two of the three are often empty; they are rendered
  // anyway so the grid keeps its shape. See `.top-bar-inner`.
  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="top-bar-brand">
          {here === "home" ? (
            // The wordmark rather than a link, on the one screen where Home is
            // where you already are. A button that goes nowhere is worse than
            // no button, and the bar would look broken empty.
            <span className="top-bar-mark">SpotOn</span>
          ) : (
            <button className="top-bar-link" onClick={() => go({ at: "home" })}>
              SpotOn
            </button>
          )}
        </div>
        <nav className="top-bar-nav" aria-label="Sections">
          {here !== "home" &&
            links.map((l) =>
              // Marked exactly when pressing it would land you where you
              // already are — see above. A span rather than a disabled button:
              // there is nothing to press, and a button that refuses the press
              // is a different message from a label that never was one.
              l.route.at === here ? (
                <span key={l.label} className="top-bar-here" aria-current="page">
                  {l.label}
                </span>
              ) : (
                <button
                  key={l.label}
                  className="top-bar-link"
                  onClick={() => go(l.route)}
                >
                  {l.label}
                </button>
              ),
            )}
        </nav>
        <div className="top-bar-right">
          {here !== "settings" && (
            <button className="top-bar-link" onClick={onSettings}>
              Settings
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
