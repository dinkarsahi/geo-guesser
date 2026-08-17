import { useCallback, useEffect, useState } from "react";
import type { ModeId } from "../modes/ModeProps";

/**
 * Every address the app answers to, in one place.
 *
 * A URL is a promise: somebody bookmarks it, sends it, or types it back in a
 * week. So the paths are written down here rather than derived from the titles
 * on the menu — deriving them would mean a copy tweak to a game's name silently
 * breaking every link to it, which is the sort of thing nobody notices until a
 * link is already out there.
 *
 * **Adding a game means adding a path here**, alongside its mode letter in
 * `match.ts`.
 *
 * Nothing about a game *in progress* is in the URL, and that is deliberate:
 * a path carrying a code or a seed is a path that deals the same five questions
 * again on every refresh. Here `/cityspotter` says only which game, so
 * refreshing it hands back the setup screen and a new deal rather than another
 * go at the one just played. (The scores are protected regardless — a filed
 * result can't be filed twice, whatever the address bar says — but a URL that
 * can't replay a round is one fewer thing resting on that.)
 */
export type Route =
  | { at: "home" }
  | { at: "daily" }
  | { at: "duel" }
  | { at: "games" }
  /** A game off the shelf: its setup screen, and the round itself. */
  | { at: "game"; mode: ModeId };

/**
 * The seven games, as they're spelled in an address bar.
 *
 * The game's own name with the spaces taken out — long, but a URL somebody
 * reads aloud or sees in a link ought to say which game it is without being
 * decoded.
 */
const MODE_PATHS: Record<ModeId, string> = {
  city: "cityspotter",
  flag: "flagspotter",
  currency: "currencyspotter",
  company: "corporatehqspotter",
  population: "populationspotter",
  tube: "tubestationspotter",
  timezone: "timezonespotter",
};

/**
 * The two contests, and the trap in their names.
 *
 * `/headtohead` is **Duel a Friend**, and `/dailyround` is **Today's Round** —
 * which is the `HeadToHead` component. The words crossed over when the screens
 * were renamed and the paths were chosen afterwards; the components kept their
 * old names and these are the names players were given. Follow the mapping in
 * this file rather than the component names, which agree with neither.
 */
const DAILY = "dailyround";
const DUEL = "headtohead";
const GAMES = "allgames";

/** What a path means. Anything unrecognised is the front door. */
function parse(path: string): Route {
  const at = path.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (at === DAILY) return { at: "daily" };
  if (at === DUEL) return { at: "duel" };
  if (at === GAMES) return { at: "games" };
  const mode = (Object.keys(MODE_PATHS) as ModeId[]).find((m) => MODE_PATHS[m] === at);
  return mode ? { at: "game", mode } : { at: "home" };
}

/** Where a screen lives. */
export function spell(route: Route): string {
  switch (route.at) {
    case "daily":
      return `/${DAILY}`;
    case "duel":
      return `/${DUEL}`;
    case "games":
      return `/${GAMES}`;
    case "game":
      return `/${MODE_PATHS[route.mode]}`;
    default:
      return "/";
  }
}

/**
 * Which screen the address bar is asking for, and how to move to another.
 *
 * The URL is the truth rather than a copy of some state kept beside it, which
 * is what makes the browser's own back button work without a line of wiring:
 * going back is the browser putting an old path up and this hook reading it,
 * the same way it read the first one.
 */
export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parse(window.location.pathname));

  // A path we don't answer to lands on the home screen, so the address bar
  // shouldn't go on claiming otherwise. Replaced rather than pushed: a typo
  // isn't somewhere the back button should be able to return to.
  useEffect(() => {
    const home = spell(parse(window.location.pathname));
    if (home !== window.location.pathname) window.history.replaceState(null, "", home);
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(parse(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback((next: Route) => {
    const path = spell(next);
    if (path !== window.location.pathname) window.history.pushState(null, "", path);
    setRoute(next);
  }, []);

  return [route, go];
}
