import { MATCH_ROUNDS } from "../lib/match";
import { CONTACT_EMAIL } from "../lib/site";
import type { Route } from "../lib/useRoute";

interface SiteFooterProps {
  /** Where the links go. The footer never routes itself — see `useRoute`. */
  go: (route: Route) => void;
  /** Which page is up, so its own link isn't offered again. */
  here: Route["at"];
}

/** Written out rather than built from `at`, so the union's shape is respected. */
const LINKS: { route: Route; label: string }[] = [
  { route: { at: "home" }, label: "Home" },
  { route: { at: "games" }, label: "All Games" },
  { route: { at: "about" }, label: "About" },
  { route: { at: "credits" }, label: "Credits" },
  { route: { at: "privacy" }, label: "Privacy" },
];

/**
 * The line at the bottom of every screen that isn't a round.
 *
 * The app had no footer at all, which meant there was nowhere for a credit, a
 * copyright line or a policy link to live — and nowhere for a reader who wants
 * to know where the satellite imagery came from to look. It is deliberately
 * plain: a row of links and a copyright, quiet enough that a menu still reads
 * as the offer of a game rather than as the bottom of a document.
 *
 * Kept off a round in progress. There the map is pinned to the window and the
 * page doesn't scroll, so a footer would either be drawn over the map or never
 * reached — see `body.playing` in the stylesheet.
 */
export default function SiteFooter({ go, here }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <nav className="site-footer-links" aria-label="Site">
        {LINKS.filter((l) => l.route.at !== here).map((l) => (
          <button
            key={l.route.at}
            className="site-footer-link"
            onClick={() => go(l.route)}
          >
            {l.label}
          </button>
        ))}
        {/* A real address rather than a form: there is no server here to take
            one, and a game this small is better answered from an inbox. */}
        <a className="site-footer-link" href={`mailto:${CONTACT_EMAIL}`}>
          Contact
        </a>
      </nav>
      {/* The one line that has to be here whatever else is: who the game
          belongs to, and the year it says so in. */}
      <p className="site-footer-note">
        © {new Date().getFullYear()} SpotOn · {MATCH_ROUNDS} rounds, one world.
      </p>
      {/* Named here as well as on the maps themselves. A credit drawn on a map
          is on screen for the length of a round; this is where somebody who
          went looking for it afterwards will actually look. */}
      <p className="muted site-footer-note">
        Satellite imagery courtesy of NASA EOSDIS GIBS. Country shapes from Natural
        Earth.{" "}
        <button className="site-footer-inline" onClick={() => go({ at: "credits" })}>
          Full credits
        </button>
      </p>
    </footer>
  );
}
