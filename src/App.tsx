import { useCallback, useEffect, useState, type ReactNode } from "react";
import About from "./components/About";
import Credits from "./components/Credits";
import Faq from "./components/Faq";
import DailyBoard from "./components/DailyBoard";
import Privacy from "./components/Privacy";
import Settings from "./components/Settings";
import SiteFooter from "./components/SiteFooter";
import TopBar from "./components/TopBar";
import { MODES, type GameCard } from "./data/gameCards";
import { type Match } from "./lib/match";
import { loadSettings, saveSettings } from "./lib/preferences";
import { dailyCode, gameOfDay, parseMatchCode } from "./lib/match";
import { spentOnThisDevice } from "./lib/leaderboard";
import { loadWorldShapes } from "./lib/worldShapes";
import { spellScreen, useRoute, type Route } from "./lib/useRoute";
import CityLocator from "./modes/CityLocator";
import CompanyGuesser from "./modes/CompanyGuesser";
import CurrencyGuesser from "./modes/CurrencyGuesser";
import FlagGuesser from "./modes/FlagGuesser";
import HeadToHead from "./modes/HeadToHead";
import PlayFriend from "./modes/PlayFriend";
import PopulationGuesser from "./modes/PopulationGuesser";
import TimeZoneGuesser from "./modes/TimeZoneGuesser";
import TubeGuesser from "./modes/TubeGuesser";
import type { GameSettings, ModeId, ModeProps } from "./modes/ModeProps";

type Mode = ModeId;

/* The bench has no card. It was never on the shelf — `/gamemakersscrapbook`
   is the whole of how it is reached — and now that it isn't a game at all,
   there is nothing for a card to offer. Putting it back is a `mode-card` in
   `AllGames` pressing `go({ at: "bench" })`. */

/** Choose how to play before a mode starts. */
function ModeSetup({
  mode,
  warmWorld,
  onStart,
  onBack,
}: {
  // A card rather than a mode id, so that something can have this screen
  // without being a game — a bench, next time there is one, which is a copy of
  // a game and wants the same screen in front of it.
  mode: GameCard;
  /** Whether this game will want the country shapes. The tube won't. */
  warmWorld: boolean;
  onStart: () => void;
  onBack: () => void;
}) {
  // Fetch and build the world while this screen is up, rather than at the
  // moment the round opens.
  //
  // The shapes are a megabyte of Natural Earth that has to be parsed, coarsened
  // for the globe and indexed by bounding box, and doing all of it on the first
  // frame of a round blocked the main thread for **four seconds** on a cold
  // start — long enough to swallow the count-in whole and skip the arrival
  // entirely, since by the time anything could animate there was nothing left
  // of the window to animate in. Started here it is usually finished before
  // Start is pressed, and the fall has a free thread to glide on.
  //
  // `loadWorldShapes` caches its own promise, so this is a warm-up and not a
  // second download however many times it is called.
  useEffect(() => {
    if (warmWorld) void loadWorldShapes().catch(() => {});
  }, [warmWorld]);

  return (
    <div className="menu setup">
      <div className="menu-bar">
        {/* Back, not Home: this screen was opened off the shelf of games and
            that is where it returns to — somebody who picked the wrong one of
            seven wants the other six, not the front door. */}
        <button className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
      </div>
      <h1>
        <span className="mode-emoji">{mode.emoji}</span> {mode.title}
      </h1>
      {mode.tagline && <p className="muted menu-sub mode-tagline">{mode.tagline}</p>}
      <p className="muted menu-sub">{mode.blurb}</p>
      {mode.smallprint && <p className="muted mode-smallprint">{mode.smallprint}</p>}

      {/* Nothing to choose here any more, and that is the point of the screen
          now: it names the game, says what a round is, prints the small print
          where one is owed, and gets out of the way. The map questions it used
          to ask are a preference rather than a decision about this round, so
          they are answered once on the settings screen — asked here, they were
          asked ten times over and answered the same way every time. Length was
          never a question either: every game is five rounds, so a score means
          one thing wherever it was got. */}

      <div className="button-row setup-start">
        <button className="btn btn-primary" onClick={onStart}>
          Start
        </button>
      </div>
    </div>
  );
}

/**
 * The globe with the swords crossed over it.
 *
 * Today's round is a fight, and the other side of it is everybody — which no
 * single emoji says, so it's said with two: the world first and biggest,
 * because that's who you're up against, and the swords hung off it to make
 * clear it isn't a geography lesson.
 */
function WorldDuelMark() {
  return (
    <span className="mode-emoji mode-mark" aria-hidden="true">
      🌍
      <span className="mode-mark-badge">⚔️</span>
    </span>
  );
}

/**
 * Two gloves meeting in the middle: a fist bump rather than a pair of gloves.
 *
 * One emoji again, made of two — laid on their sides facing each other, and one
 * of them turned blue so the pair reads as two people rather than one person's
 * kit. Blue comes first because it stands on the left, and the turning that
 * gets each of them there is in the stylesheet.
 */
function DuelMark() {
  return (
    <span className="mode-emoji duel-mark" aria-hidden="true">
      <span className="duel-mark-blue">🥊</span>
      <span className="duel-mark-red">🥊</span>
    </span>
  );
}

/**
 * The shelf of games, behind the third door on the home page.
 *
 * Seven of them, and what's being built next at the end. They're a door rather
 * than the home page itself because the home page has one question to ask — who
 * are you playing — and seven cards in front of it made the answer "nobody"
 * look like the only one on offer.
 */
function AllGames({ onPick }: { onPick: (mode: Mode) => void }) {
  return (
    <div className="menu">
      {/* No Home button of its own any more: the bar across the top offers it,
          in the same place on every screen. This one only ever said Home. */}
      <h1>All Games</h1>
      <p className="muted menu-sub">
        Seven ways to be wrong about where things are.
      </p>
      <div className="mode-grid">
        {MODES.map((m) => (
          <button key={m.id} className="mode-card" onClick={() => onPick(m.id)}>
            <span className="mode-emoji">{m.emoji}</span>
            <span className="mode-title">{m.title}</span>
            <span className="mode-hook">{m.hook}</span>
            <span className="muted mode-blurb">{m.blurb}</span>
          </button>
        ))}
        {/* What's being built, on the shelf it will stand on. A div rather than
            a button because there is nothing behind it yet: a card that takes
            the press and does nothing reads as a broken game rather than an
            unfinished one, and this way it can't be tabbed to either. */}
        <div className="mode-card is-coming">
          <span className="mode-emoji">📦</span>
          <span className="mode-title">Export Spotter</span>
          <span className="mode-soon">Coming soon</span>
          <span className="mode-hook">Know your trade?</span>
          <span className="muted mode-blurb">
            With a country's biggest export, can you spot who it is?
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * A game in progress, and the address it belongs to.
 *
 * The path is carried along with it so that leaving the screen ends the game
 * without anything having to notice and tidy up: on any other path this simply
 * isn't the session any more. `path` is "" for no game at all, which no route
 * ever spells.
 */
interface Session {
  path: string;
  /** A game off the shelf, past its setup screen. */
  started: boolean;
  /** A round of today's game, or of a duel. */
  match: Match | null;
}

const NO_SESSION: Session = { path: "", started: false, match: null };

/**
 * The screens the footer is kept off, on top of a round — where it is off
 * because the map is pinned to the window and nothing scrolls, so a footer
 * would either be painted over the map or never reached.
 *
 * These are the contest screens: today's round, which is a draw that hands
 * straight over to a game; its table; and the duel, which is a lobby walking
 * through its own steps to a start. A footer under any of them is a row of
 * doors offered at the moment the player has already chosen one — and on the
 * draw it would be carried off by the fade seven seconds later, having never
 * been read. The table has the strongest claim of the three: there is
 * deliberately nothing under it but the table, and a row of links is one more
 * way of saying "and now what?" beneath something somebody came here to read.
 *
 * **The way out of them is the bar across the top**, which every screen has:
 * one press to home, and the footer is there in full. Nothing is unreachable
 * — including the privacy policy, which is the one link here with an outside
 * obligation attached to it. If a screen is ever added to this list, check
 * that it still has the bar.
 *
 * Written out rather than derived, so adding a route doesn't quietly join it.
 */
const FOOTERLESS: Route["at"][] = ["daily", "leaderboard", "duel"];

/** The mode itself, whichever it is, wired to the props they all share. */
function PlayMode({ mode, ...props }: ModeProps & { mode: Mode }) {
  if (mode === "city") return <CityLocator {...props} />;
  if (mode === "flag") return <FlagGuesser {...props} />;
  if (mode === "currency") return <CurrencyGuesser {...props} />;
  if (mode === "company") return <CompanyGuesser {...props} />;
  if (mode === "population") return <PopulationGuesser {...props} />;
  if (mode === "timezone") return <TimeZoneGuesser {...props} />;
  return <TubeGuesser {...props} />;
}

export default function App() {
  // Which screen is up is the address bar's business now — see `useRoute`. What
  // stays here is what a URL deliberately doesn't carry: whether a round is
  // under way, and which match it belongs to. Neither survives a refresh, and
  // that's the point of keeping them out of the path.
  const [route, go] = useRoute();
  // Read once, on the way in. A lazy initialiser rather than an effect: read
  // afterwards, the first render is on the defaults and a player who chose the
  // flat map watches the globe appear and be replaced.
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [session, setSession] = useState<Session>(NO_SESSION);
  // Where the settings screen sends you back to. Kept out of the URL on
  // purpose: `/settings` is one screen however it was reached, and a path that
  // carried its own origin would give the same screen two addresses. A refresh
  // loses it and lands on Home, which is the honest answer to "where was I?"
  // when the answer wasn't written down.
  const [settingsFrom, setSettingsFrom] = useState<Route>({ at: "home" });
  const openSettings = useCallback(
    (from: Route) => {
      setSettingsFrom(from);
      go({ at: "settings" });
    },
    [go],
  );

  const mode = route.at === "game" ? route.mode : null;
  // The screen's address rather than the literal path, which for a duel can
  // carry the room code an invitation was followed on. That code is dropped the
  // instant the room starts, and a session pinned to the whole path would read
  // that as the player having left the screen and end the duel on its first
  // round. See `spellScreen`.
  const path = spellScreen(route);

  // A game belongs to the address it was started from, and moving anywhere else
  // ends it — including when the move was the browser's own back button rather
  // than a press on ours. Read off the path rather than cleared by an effect
  // watching it: derived, there is no render where a finished game is still on
  // screen because the tidying-up hasn't run yet.
  const { started, match } = session.path === path ? session : NO_SESSION;

  // Out of a round and back to where the round was started from, which the path
  // already knows: a game off the shelf returns to the shelf, and a contest's
  // round returns to that contest's own screen by simply being let go of. This
  // used to be a `browsing` flag kept deliberately out of step with everything
  // else; the URL says it now.
  const toMenu = useCallback(() => {
    setSession(NO_SESSION);
    if (route.at === "game" || route.at === "bench") go({ at: "games" });
    // Out of today's round is *home*, not back to `/` — the front door deals
    // the round the moment it is looked at, so landing there again would put
    // the player straight back into the game they just left.
    if (route.at === "daily") go({ at: "home" });
  }, [route.at, go]);

  // Stable, because a room hands over on a timer that lists this among its
  // dependencies — rebuilt every render, it would tear down and reset that
  // timer on every render too.
  const startMatch = useCallback((m: Match) => setSession({ path, started: false, match: m }), [path]);

  // A room's code in the address bar, or out of it. Replaced rather than
  // pushed: an invitation appearing when a room is made and going again when it
  // starts are the same screen either way, and neither is a place the back
  // button should be able to return to — least of all the second, which by then
  // is a link that no longer lets anybody in.
  const showInvite = useCallback(
    (code: string | null) => go({ at: "duel", code: code ?? undefined }, true),
    [go],
  );

  const modeProps = { onExit: toMenu, settings };

  // Whether today's round has already been had on this device, which decides
  // where the home page's first card leads. Read on every render rather than
  // held: it changes the moment a game is filed, and that happens on a screen
  // this one doesn't own.
  const todaysCode = parseMatchCode(dailyCode(gameOfDay()));
  const spentToday = todaysCode ? spentOnThisDevice(todaysCode.code) : false;

  // A running game gets the whole window: the menu's fixed-width shell would
  // otherwise pen the map in well short of the screen edges.
  const playing = ((mode !== null || route.at === "bench") && started) || match !== null;
  useEffect(() => {
    document.body.classList.toggle("playing", playing);
    return () => document.body.classList.remove("playing");
  }, [playing]);

  // The screen, and under it the footer. Written as a wrapper rather than
  // dropped into each screen: there are ten of them, and a footer missing from
  // one is exactly the sort of thing nobody notices.
  //
  // Which screens go without it is decided from the route here rather than
  // passed in at each call site, for the same reason: a list can't forget, and
  // a call site can. See `FOOTERLESS`.
  const page = (screen: ReactNode) => (
    <>
      {/* Outside the reading column, so it runs the full width of the window
          the way a site header does. Everything else is inside it. */}
      <TopBar go={go} here={route.at} onSettings={() => openSettings(route)} />
      <div className="page-body">
        {screen}
        {!FOOTERLESS.includes(route.at) && <SiteFooter go={go} here={route.at} />}
      </div>
    </>
  );

  // A match names its own game and carries the map it's to be played on, so it
  // skips the setup screen entirely: everyone playing it is asked the same five
  // questions, and in a room they're looking at the same world as well. Where
  // the map came from differs — the player's own taste in today's round, the
  // host's choice in a room — but by here it's decided either way.
  if (match)
    return (
      <PlayMode
        {...modeProps}
        settings={{ ...settings, flat: match.flat, borders: match.borders }}
        mode={match.mode}
        match={match}
      />
    );

  // A contest's round keeps the contest's own address rather than taking the
  // game's: the round belongs to today's table or to a room, so a refresh
  // should land back where the guards are — one go a day, or a duel that lets
  // you rejoin the round in progress — and not on a casual game of the same
  // name, which would read as the contest being replayable at will.
  if (route.at === "about") {
    return page(
      <About
        onPlay={() => go({ at: "games" })}
        onCredits={() => go({ at: "credits" })}
        onFaq={() => go({ at: "faq" })}
      />,
    );
  }

  if (route.at === "faq") {
    return page(
      <Faq onAbout={() => go({ at: "about" })} onPrivacy={() => go({ at: "privacy" })} />,
    );
  }

  if (route.at === "credits") {
    return page(
      <Credits onAbout={() => go({ at: "about" })} />,
    );
  }

  if (route.at === "privacy") {
    return page(<Privacy />);
  }

  if (route.at === "settings") {
    return page(
      <Settings
        settings={settings}
        // Back to whichever screen sent you, which for a game's setup screen
        // is the difference between changing the map and losing your place.
        // Nothing at all when that screen is home: the bar above offers it.
        backLabel={settingsFrom.at === "home" ? null : "Back"}
        // Written through on every press rather than on a Save: the press is
        // the change, and a preference that needed confirming would be a
        // longer errand than the screen it replaced.
        onChange={(next) => {
          setSettings(next);
          saveSettings(next);
        }}
        onBack={() => go(settingsFrom)}
      />,
    );
  }

  if (route.at === "leaderboard") {
    return page(<DailyBoard />);
  }

  if (route.at === "daily") {
    return page(
      <HeadToHead onSpent={() => go({ at: "home" }, true)} onStart={startMatch} />,
    );
  }

  if (route.at === "duel") {
    return page(
      <PlayFriend
        invite={route.code}
        onInvite={showInvite}
        onBack={() => go({ at: "home" })}
        onStart={startMatch}
      />,
    );
  }

  if (mode && started) {
    return <PlayMode {...modeProps} mode={mode} />;
  }

  if (mode) {
    return page(
      <ModeSetup
        mode={MODES.find((m) => m.id === mode)!}
        warmWorld={mode !== "tube"}
        onStart={() => setSession({ path, started: true, match: null })}
        // Back to the shelf the game was picked off, not out to the home page:
        // somebody who opened the wrong one of seven wanted a different one.
        onBack={() => go({ at: "games" })}
      />,
    );
  }


  if (route.at === "games") {
    return page(
      <AllGames onPick={(m) => go({ at: "game", mode: m })} />,
    );
  }

  // Three doors, and the question they answer between them is who you're
  // playing: everybody, one person, or nobody. The games themselves are behind
  // the third of those, because listing all seven here answered the question
  // before it was asked — the two contests sat at the end of a row of games and
  // read as two more of them.
  return page(
    <div className="menu">
      <h1>SpotOn</h1>
      <p className="muted menu-sub">Play the world, play a friend, or just play.</p>
      <div className="mode-grid mode-grid-trio">
        {/* To the round, or to its table where the round has been had. The
            card says the same thing either way: this is where today's game
            lives, and what is left of it depends on whether you've played. */}
        <button
          className="mode-card"
          onClick={() => go({ at: spentToday ? "leaderboard" : "daily" })}
        >
          <WorldDuelMark />
          <span className="mode-title">Today's Round</span>
          {/* The game of the day is deliberately not named here any more: the
              door is the offer, and which game is behind it is the first thing
              the round itself says. */}
          <span className="muted mode-blurb">
            Play today's round — a daily pick from one of our SpotOn games. See where you
            stand against the world.
          </span>
        </button>
        <button className="mode-card" onClick={() => go({ at: "duel" })}>
          <DuelMark />
          <span className="mode-title">Duel a Friend</span>
          <span className="muted mode-blurb">
            Play against friends in one of our SpotOn games. Winner gets bragging rights.
          </span>
        </button>
        <button className="mode-card" onClick={() => go({ at: "games" })}>
          <span className="mode-emoji">🗺️</span>
          <span className="mode-title">All Games</span>
          <span className="muted mode-blurb">
            Play all games at your own pace — practice makes perfect.
          </span>
        </button>
      </div>
    </div>,
  );
}
