import { useEffect, useState } from "react";
import { TUBE_TAGLINE } from "./data/tube";
import { gameOfDay, modeTitle, type Match } from "./lib/match";
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
const MODES: {
  id: Mode;
  title: string;
  hook: string;
  blurb: string;
  emoji: string;
  tagline?: string;
}[] = [
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
    blurb: "With just the flag, can you spot the country it belongs to?",
    emoji: "🚩",
  },
  {
    id: "currency",
    title: "Currency Spotter",
    hook: "Are you good with money?",
    blurb: "With a currency and its symbol, can you spot a country that spends it?",
    emoji: "💱",
  },
  {
    id: "company",
    title: "Corporate HQ Spotter",
    hook: "What's your corporate blind spot?",
    blurb:
      "With just the company logo, can you spot which country it's headquartered in?",
    emoji: "🏢",
  },
  {
    id: "population",
    title: "Population Spotter",
    hook: "Good with numbers?",
    blurb: "With just a population figure, can you spot the country that has it?",
    emoji: "👥",
  },
  {
    id: "tube",
    title: "Tube Station Spotter",
    hook: TUBE_TAGLINE,
    tagline: TUBE_TAGLINE,
    blurb: "With just the station name, can you spot it on the tube map?",
    emoji: "🚇",
  },
  {
    id: "timezone",
    title: "Time Zone Spotter",
    hook: "Can you handle the jet lag?",
    blurb: "Read the clock, and spot somewhere in the world it's that time right now.",
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
  mode: (typeof MODES)[number];
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  // The tube has its own map, so the world-map options don't apply there.
  const worldMap = mode.id !== "tube";

  return (
    <div className="menu setup">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Menu
        </button>
      </div>
      <h1>
        <span className="mode-emoji">{mode.emoji}</span> {mode.title}
      </h1>
      {mode.tagline && <p className="muted menu-sub mode-tagline">{mode.tagline}</p>}
      <p className="muted menu-sub">{mode.blurb}</p>

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
          ← Menu
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
  const [mode, setMode] = useState<Mode | null>(null);
  const [started, setStarted] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  // Day (colourful) by default; the toggle switches to the grey night look.
  const [night, setNight] = useState(false);
  // Which of the two contests is open — today's round against the world, or a
  // room of people you know. Both are their own door on the home page now.
  const [social, setSocial] = useState<"daily" | "room" | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  // Which menu is the one behind everything: the three doors, or the shelf of
  // games behind the third of them. Deliberately untouched by `toMenu` — a
  // player who came out of Flag Spotter came from the shelf and wants it back,
  // where one coming out of today's round never saw it.
  const [browsing, setBrowsing] = useState<"home" | "games">("home");

  const toMenu = () => {
    setMode(null);
    setStarted(false);
    setSocial(null);
    setMatch(null);
  };
  const toggleNight = () => setNight((n) => !n);
  const modeProps = { onExit: toMenu, night, onToggleNight: toggleNight, settings };

  // A running game gets the whole window: the menu's fixed-width shell and its
  // side rules would otherwise pen the map in well short of the screen edges.
  const playing = (mode !== null && started) || match !== null;
  useEffect(() => {
    document.body.classList.toggle("playing", playing);
    return () => document.body.classList.remove("playing");
  }, [playing]);

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

  if (social === "daily") {
    return <HeadToHead onBack={toMenu} onStart={setMatch} />;
  }

  if (social === "room") {
    return <PlayFriend onBack={toMenu} onStart={setMatch} />;
  }

  if (mode && started) {
    return <PlayMode {...modeProps} mode={mode} />;
  }

  if (mode) {
    return (
      <ModeSetup
        mode={MODES.find((m) => m.id === mode)!}
        settings={settings}
        onChange={setSettings}
        onStart={() => setStarted(true)}
        // Back to the shelf the game was picked off, not out to the home page:
        // somebody who opened the wrong one of seven wanted a different one.
        onBack={() => setMode(null)}
      />
    );
  }

  if (browsing === "games") {
    return (
      <AllGames onPick={setMode} onBack={() => setBrowsing("home")} />
    );
  }

  // Three doors, and the question they answer between them is who you're
  // playing: everybody, one person, or nobody. The games themselves are behind
  // the third of those, because listing all seven here answered the question
  // before it was asked — the two contests sat at the end of a row of games and
  // read as two more of them.
  //
  // No day/night toggle out here — it belongs with the map it changes, so it
  // only appears once a game is running.
  return (
    <div className="menu">
      <h1>SpotOn</h1>
      <p className="muted menu-sub">Play the world, play a friend, or just play.</p>
      <div className="mode-grid mode-grid-trio">
        <button className="mode-card" onClick={() => setSocial("daily")}>
          <WorldDuelMark />
          <span className="mode-title">Today's Round</span>
          <span className="muted mode-blurb">
            Take on everyone playing today. The day picks the game from all seven — it's{" "}
            {modeTitle(gameOfDay())} — and everyone gets the same five rounds, once.
          </span>
        </button>
        <button className="mode-card" onClick={() => setSocial("room")}>
          <DuelMark />
          <span className="mode-title">Duel a Friend</span>
          <span className="muted mode-blurb">
            Read out a code and play the same rounds at the same time. One table at the
            end, and the winner takes it.
          </span>
        </button>
        <button className="mode-card" onClick={() => setBrowsing("games")}>
          <span className="mode-emoji">🗺️</span>
          <span className="mode-title">All Games</span>
          <span className="muted mode-blurb">
            All seven on your own, at your own pace and for as long as you like — no
            code, no clock, nobody waiting.
          </span>
        </button>
      </div>
    </div>
  );
}
