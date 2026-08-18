import { useCallback, useEffect, useState, type ReactNode } from "react";
import About from "./components/About";
import Credits from "./components/Credits";
import SiteFooter from "./components/SiteFooter";
import { TUBE_TAGLINE } from "./data/tube";
import { type Match } from "./lib/match";
import { spellScreen, useRoute } from "./lib/useRoute";
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

// Every card says three things: the game's name, a line asking whether the
// player fancies it, and a sentence saying what a round actually involves. The
// `hook` is the middle one, and it is a question rather than a description —
// eight descriptions on a shelf are read as a list, eight questions as a dare.
//
// `tagline` is a different thing and still the tube's alone: the line that game
// is known by, printed on its setup screen and paid out as its full-marks
// announcement. The tube's hook is that same line, so both come from the one
// constant and can't drift apart.
interface GameCard {
  title: string;
  hook: string;
  blurb: string;
  emoji: string;
  tagline?: string;
  /**
   * The game brings its own map, so the world-map choices on the setup screen
   * have nothing to offer it. The tube's alone.
   */
  ownMap?: boolean;
  /**
   * A line of small print under the blurb, for a game that shows somebody
   * else's property. Corporate HQ Spotter's alone: it puts real brand marks on
   * screen, and the disclaimer belongs where they are about to appear as well
   * as on the credits page, where somebody has to go looking for it.
   */
  smallprint?: string;
}

const MODES: (GameCard & { id: Mode })[] = [
  {
    id: "city",
    title: "City Spotter",
    hook: "Know your cities?",
    blurb: "With just the name, can you spin the globe and spot where it is?",
    emoji: "🏙️",
  },
  {
    id: "flag",
    title: "Flag Spotter",
    hook: "Will you capture the flag or raise the white flag?",
    blurb: "Can you spot which country the flag belongs to?",
    emoji: "🚩",
  },
  {
    id: "currency",
    title: "Currency Spotter",
    hook: "Are you good with money?",
    blurb: "Using a currency and its symbol, can you spot a country which spends it?",
    emoji: "💱",
  },
  {
    id: "company",
    title: "Corporate HQ Spotter",
    hook: "Can you navigate the corporate landscape?",
    blurb:
      "With just the company logo, can you spot which country it's headquartered in?",
    emoji: "🏢",
    smallprint:
      "Company names and logos are trademarks of their respective owners. SpotOn is not affiliated with, endorsed by or sponsored by any company shown.",
  },
  {
    id: "population",
    title: "Population Spotter",
    hook: "Good with numbers?",
    blurb: "Can you spot the country given its population figure?",
    emoji: "👥",
  },
  {
    id: "tube",
    title: "Tube Station Spotter",
    hook: TUBE_TAGLINE,
    tagline: TUBE_TAGLINE,
    blurb: "With just the station name, can you spot it on the tube map?",
    emoji: "🚇",
    ownMap: true,
  },
  {
    id: "timezone",
    title: "Time Zone Spotter",
    hook: "Can you handle the jet lag?",
    blurb: "Read the clock, and spot a country in that time zone.",
    emoji: "🕰️",
  },
];

const DEFAULT_SETTINGS: GameSettings = { rounds: 5, flat: false, borders: true };

/** A two-option toggle rendered as a pair of buttons. */
function Choice<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; title: string; hint: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="setup-row">
      <span className="setup-label">{label}</span>
      <div className="setup-options">
        {options.map((o) => (
          <button
            key={String(o.value)}
            className={`setup-option${o.value === value ? " is-active" : ""}`}
            onClick={() => onChange(o.value)}
            aria-pressed={o.value === value}
          >
            <span className="setup-option-title">{o.title}</span>
            <span className="muted setup-option-hint">{o.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Choose how to play before a mode starts. */
function ModeSetup({
  mode,
  settings,
  onChange,
  onStart,
  onBack,
}: {
  // A card rather than a mode, so the bench can have this screen too: it is a
  // copy of a game and wants the same choices in front of it.
  mode: GameCard;
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const worldMap = !mode.ownMap;

  return (
    <div className="menu setup">
      <div className="menu-bar">
        {/* Back, not Home: this screen was opened off the shelf of games and
            that is where it returns to — somebody who picked the wrong one of
            seven wants the other six, not the front door. */}
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>
      <h1>
        <span className="mode-emoji">{mode.emoji}</span> {mode.title}
      </h1>
      {mode.tagline && <p className="muted menu-sub mode-tagline">{mode.tagline}</p>}
      <p className="muted menu-sub">{mode.blurb}</p>
      {mode.smallprint && <p className="muted mode-smallprint">{mode.smallprint}</p>}

      <div className="setup-panel">
        {/* No length to choose: every game is five rounds, the same five rounds
            that today's round and a duel are. One number for the whole app
            means a score means one thing wherever it was got. */}
        {worldMap && (
          <>
            <Choice<boolean>
              label="Map"
              value={settings.flat}
              onChange={(flat) => onChange({ ...settings, flat })}
              options={[
                { value: false, title: "3D globe", hint: "Spin and zoom a real globe" },
                { value: true, title: "Flat map", hint: "The whole world at once" },
              ]}
            />
            <Choice<boolean>
              label="Borders"
              value={settings.borders}
              onChange={(borders) => onChange({ ...settings, borders })}
              options={[
                { value: true, title: "Show borders", hint: "Country outlines drawn on" },
                { value: false, title: "Hide borders", hint: "Coastlines only — harder" },
              ]}
            />
          </>
        )}
      </div>

      <div className="button-row setup-start">
        <button className="btn btn-primary" onClick={onStart}>
          Start ▸
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
function AllGames({
  onPick,
  onBack,
}: {
  onPick: (mode: Mode) => void;
  onBack: () => void;
}) {
  return (
    <div className="menu">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Home
        </button>
      </div>
      <h1>All Games</h1>
      <p className="muted menu-sub">
        Pick a game, then choose what to play it on.
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
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [session, setSession] = useState<Session>(NO_SESSION);

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
    if (route.at === "game") go({ at: "games" });
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

  // A running game gets the whole window: the menu's fixed-width shell would
  // otherwise pen the map in well short of the screen edges.
  const playing = (mode !== null && started) || match !== null;
  useEffect(() => {
    document.body.classList.toggle("playing", playing);
    return () => document.body.classList.remove("playing");
  }, [playing]);

  // The screen, and under it the footer — on everything except a round, where
  // the map is pinned to the window and nothing scrolls. Written as a wrapper
  // rather than dropped into each screen: there are ten of them, and a footer
  // missing from one is exactly the sort of thing nobody notices.
  const page = (screen: ReactNode) => (
    <>
      {screen}
      <SiteFooter go={go} here={route.at} />
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
        onBack={() => go({ at: "home" })}
        onPlay={() => go({ at: "games" })}
        onCredits={() => go({ at: "credits" })}
      />,
    );
  }

  if (route.at === "credits") {
    return page(
      <Credits onBack={() => go({ at: "home" })} onAbout={() => go({ at: "about" })} />,
    );
  }

  if (route.at === "daily") {
    return page(
      <HeadToHead
        onBack={() => go({ at: "home" })}
        onAllGames={() => go({ at: "games" })}
        onDuel={() => go({ at: "duel" })}
        onStart={startMatch}
      />,
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
        settings={settings}
        onChange={setSettings}
        onStart={() => setSession({ path, started: true, match: null })}
        // Back to the shelf the game was picked off, not out to the home page:
        // somebody who opened the wrong one of seven wanted a different one.
        onBack={() => go({ at: "games" })}
      />,
    );
  }

  if (route.at === "games") {
    return page(
      <AllGames
        onPick={(m) => go({ at: "game", mode: m })}
        onBack={() => go({ at: "home" })}
      />,
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
        <button className="mode-card" onClick={() => go({ at: "daily" })}>
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
