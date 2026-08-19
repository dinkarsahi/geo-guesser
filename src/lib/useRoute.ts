import { useCallback, useEffect, useState } from "react";
import type { ModeId } from "../modes/ModeProps";
import { parseMatchCode } from "./match";

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
 *
 * The one code that does appear in a path is a duel's, and it is an
 * *invitation* rather than a game: `/headtohead/CVKQ7M` is the link a host
 * sends, and it is only good while the room is still taking people. The moment
 * that room starts the code leaves the address bar for everyone in it, and
 * anyone opening the link afterwards is put on `/headtohead` with the room's
 * door shut in words. So the thing this file was protecting against — a path
 * that deals a round again — is still true of every path here: this one stops
 * meaning anything at exactly the moment it could have started replaying
 * something.
 */
export type Route =
  | { at: "home" }
  | { at: "daily" }
  /** Duel a Friend, optionally as an invitation to one particular room. */
  | { at: "duel"; code?: string }
  | { at: "games" }
  /** What the game is and how it's marked — and the page the footer links to. */
  | { at: "about" }
  /** Where the maps, the shapes, the logos and the code came from. */
  | { at: "credits" }
  /** What the game knows about the people who play it. */
  | { at: "privacy" }
  /** How this device likes its map — the two questions the games stopped asking. */
  | { at: "settings" }
  /** A game off the shelf: its setup screen, and the round itself. */
  | { at: "game"; mode: ModeId }
  /**
   * The bench — a copy of a game kept aside to try things on.
   *
   * A route of its own rather than a `ModeId` with a path, and that is the
   * whole arrangement: a mode letter would enter it in the daily rota and in
   * duel codes, so the address bar is the only thing here that knows it
   * exists. It comes out again with the bench.
   */
  | { at: "bench" };

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

/**
 * The two pages that aren't games.
 *
 * Short, ordinary words rather than the games' run-together names: these are
 * the addresses a reader guesses at and a reviewer looks for, and every site on
 * the web spells them this way.
 */
const ABOUT = "about";
const CREDITS = "credits";
const PRIVACY = "privacy";

/**
 * The map preferences. `settings` rather than `preferences` because it is the
 * word people type and the word the button says — one name for the screen, the
 * path and the link, so none of the three can drift from the others.
 */
const SETTINGS = "settings";

/**
 * The bench, spelled the way the games are — its own name run together. Not
 * `/bench` or `/test`, which read as somewhere the game is broken rather than
 * somewhere it is being made. Delete this line with the bench.
 */
const BENCH = "gamemakersscrapbook";

/** What a path means. Anything unrecognised is the front door. */
function parse(path: string): Route {
  const [at = "", second = ""] = path
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .split("/");
  if (at === DAILY) return { at: "daily" };
  // A code after the duel's path is an invitation to a room, and it is read
  // here rather than taken on trust: `parseMatchCode` is what says whether
  // seven characters are a room's code or somebody's typo, and a typo that
  // reached the join screen would be a lobby waiting on a room that never
  // existed. Anything it turns down is simply the duel screen, and the address
  // bar is tidied to match on the way in.
  if (at === DUEL) {
    const invited = second ? parseMatchCode(second) : null;
    return invited?.kind === "room" ? { at: "duel", code: invited.code } : { at: "duel" };
  }
  if (at === GAMES) return { at: "games" };
  if (at === ABOUT) return { at: "about" };
  if (at === CREDITS) return { at: "credits" };
  if (at === PRIVACY) return { at: "privacy" };
  if (at === SETTINGS) return { at: "settings" };
  if (at === BENCH) return { at: "bench" };
  const mode = (Object.keys(MODE_PATHS) as ModeId[]).find((m) => MODE_PATHS[m] === at);
  return mode ? { at: "game", mode } : { at: "home" };
}

/** Where a screen lives. */
export function spell(route: Route): string {
  switch (route.at) {
    case "daily":
      return `/${DAILY}`;
    case "duel":
      return route.code ? `/${DUEL}/${route.code}` : `/${DUEL}`;
    case "games":
      return `/${GAMES}`;
    case "about":
      return `/${ABOUT}`;
    case "credits":
      return `/${CREDITS}`;
    case "privacy":
      return `/${PRIVACY}`;
    case "settings":
      return `/${SETTINGS}`;
    case "bench":
      return `/${BENCH}`;
    case "game":
      return `/${MODE_PATHS[route.mode]}`;
    default:
      return "/";
  }
}

/**
 * The address of the *screen*, which is the path with any invitation taken off.
 *
 * A room code in the path is who sent you, not where you are: the duel screen
 * is the same screen whether or not one is on the end of it. Anything pinned to
 * "which screen is up" has to be pinned to this rather than to the literal
 * path — a game in progress most of all, since the code is dropped from the
 * address the moment the room starts, and compared against the whole path that
 * would read as the player having walked off the screen their round belongs to,
 * ending the duel a fraction of a second after it began.
 */
export const spellScreen = (route: Route): string =>
  spell(route.at === "duel" ? { at: "duel" } : route);

/**
 * The link a host sends, whole, since what goes in a message is a URL and not a
 * path. Built from the address bar's own origin so that it is right on the
 * deployment it was copied from — and on a preview build, or on somebody's
 * phone reading it off the local network.
 */
export const inviteLink = (code: string): string =>
  `${window.location.origin}${spell({ at: "duel", code })}`;

/**
 * Which screen the address bar is asking for, and how to move to another.
 *
 * The URL is the truth rather than a copy of some state kept beside it, which
 * is what makes the browser's own back button work without a line of wiring:
 * going back is the browser putting an old path up and this hook reading it,
 * the same way it read the first one.
 */
export function useRoute(): [Route, (next: Route, replace?: boolean) => void] {
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

  // `replace` for a move the back button has no business undoing. A room code
  // arriving in the bar and leaving it again are both that: the lobby is the
  // duel screen either way, and pushing them would put a dead invitation one
  // press of Back away from a player who is mid-duel.
  const go = useCallback((next: Route, replace = false) => {
    const path = spell(next);
    if (path !== window.location.pathname) {
      if (replace) window.history.replaceState(null, "", path);
      else window.history.pushState(null, "", path);
    }
    setRoute(next);
  }, []);

  return [route, go];
}
