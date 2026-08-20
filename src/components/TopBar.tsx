import { dailyCode, gameOfDay, parseMatchCode } from "../lib/match";
import { spentOnThisDevice } from "../lib/leaderboard";
import type { Route } from "../lib/useRoute";

/**
 * Which of the four the screen belongs to, or none.
 *
 * A section rather than a route, because several screens are *inside* one:
 * the leaderboard is today's round's other face, and a game's setup screen was
 * opened off the shelf. Offering "All Games" in the bar of a screen reached
 * from All Games — next to that screen's own Back, which goes to the same
 * place — is the same link twice, which is a reader wondering whether the two
 * differ.
 *
 * The reading pages and the settings belong to no section, so they are offered
 * all four.
 */
function sectionOf(at: Route["at"]): Route["at"] | null {
  if (at === "home") return "home";
  if (at === "daily" || at === "leaderboard") return "daily";
  if (at === "duel") return "duel";
  if (at === "games" || at === "game" || at === "bench") return "games";
  return null;
}

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
 * **The one you are on is never offered**, which is what makes the bar a
 * statement of where you are as well as a way elsewhere.
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
  const section = sectionOf(here);

  // Today's round leads to the table once this device has had its go, exactly
  // as the home page's card does. `/` sends a spent device home, so offered
  // bare this link would bounce the player straight back out — a door that
  // reads as broken. Read through `parseMatchCode` rather than off `dailyCode`
  // directly, because that is the form the played-here record is keyed on.
  const today = parseMatchCode(dailyCode(gameOfDay()));
  const daily: Route =
    today && spentOnThisDevice(today.code) ? { at: "leaderboard" } : { at: "daily" };

  const links: { route: Route; label: string; section: Route["at"] }[] = [
    { route: { at: "home" }, label: "Home", section: "home" },
    { route: daily, label: "Today's Round", section: "daily" },
    { route: { at: "duel" }, label: "Duel", section: "duel" },
    { route: { at: "games" }, label: "All Games", section: "games" },
  ];

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
        <nav className="top-bar-nav" aria-label="Sections">
          {links
            .filter((l) => l.section !== section)
            .map((l) => (
              <button
                key={l.section}
                className="top-bar-link"
                onClick={() => go(l.route)}
              >
                {l.label}
              </button>
            ))}
        </nav>
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
