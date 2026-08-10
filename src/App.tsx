import { useEffect, useState } from "react";
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
import TubeScoringTest, { TUBE_TEST_TITLE } from "./modes/TubeScoringTest";
import type { GameSettings, ModeId, ModeProps } from "./modes/ModeProps";

type Mode = ModeId;

const MODES: { id: Mode; title: string; blurb: string; emoji: string }[] = [
  {
    id: "city",
    title: "City Spotter",
    blurb: "See a city name, spin the globe and click where it is.",
    emoji: "🏙️",
  },
  {
    id: "flag",
    title: "Flag Spotter",
    blurb: "Identify a country from its flag, then learn a fact about it.",
    emoji: "🚩",
  },
  {
    id: "currency",
    title: "Currency Spotter",
    blurb: "See a currency and its symbol, then find somewhere that spends it.",
    emoji: "💱",
  },
  {
    id: "company",
    title: "Corporate HQ Spotter",
    blurb: "Spot a company from its logo, then guess where it's headquartered.",
    emoji: "🏢",
  },
  {
    id: "population",
    title: "Population Spotter",
    blurb: "See how many people live somewhere and work out where it is.",
    emoji: "👥",
  },
  {
    id: "tube",
    title: "Tube Station Spotter",
    blurb: "Pinpoint a London Underground station on a zoomed-in map.",
    emoji: "🚇",
  },
  {
    id: "timezone",
    title: "Time Zone Spotter",
    blurb: "Read a clock and find somewhere on Earth it's that time right now.",
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
      <p className="muted menu-sub">{mode.blurb}</p>

      <div className="setup-panel">
        <Choice<number>
          label="Length"
          value={settings.rounds}
          onChange={(rounds) => onChange({ ...settings, rounds })}
          options={[
            { value: 5, title: "5 rounds", hint: "A quick game, marked out of 100" },
            { value: 10, title: "10 rounds", hint: "Twice the game, marked the same way" },
          ]}
        />

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
 * The two ways of playing against other people, behind one door.
 *
 * They're one thing on the menu because they answer the same wish — I want to
 * play somebody — and two things here because the answer forks on who, and on
 * whether they're free right now.
 */
function HeadToHeadMenu({
  onPick,
  onBack,
}: {
  onPick: (which: "daily" | "room") => void;
  onBack: () => void;
}) {
  return (
    <div className="menu">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Menu
        </button>
      </div>
      <h1>
        <span className="mode-emoji">⚔️</span> Head to Head
      </h1>
      <p className="muted menu-sub">Play the world, or play someone you know.</p>
      <div className="mode-grid mode-grid-pair">
        <button className="mode-card" onClick={() => onPick("daily")}>
          <WorldDuelMark />
          <span className="mode-title">Today's Round</span>
          <span className="muted mode-blurb">
            Take on everyone playing today. The day picks the game from all seven — it's{" "}
            {modeTitle(gameOfDay())} — and everyone gets the same five rounds, once.
          </span>
        </button>
        <button className="mode-card" onClick={() => onPick("room")}>
          <DuelMark />
          <span className="mode-title">Duel a Friend</span>
          <span className="muted mode-blurb">
            Read out a code and play the same rounds at the same time. One table at the
            end, and the winner takes it.
          </span>
        </button>
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
  // Head to head: the door itself, or whichever of the two games behind it is
  // open — today's round against the world, or a room of people you know.
  const [social, setSocial] = useState<"hub" | "daily" | "room" | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  // The tube scoring bench. Not a `Mode`: it's a copy of one game kept aside to
  // try a rule out on, and making it a mode would enter it in the daily rota
  // and in duel codes, which is the last place an experiment belongs.
  const [tubeTest, setTubeTest] = useState(false);

  const toMenu = () => {
    setMode(null);
    setStarted(false);
    setSocial(null);
    setMatch(null);
    setTubeTest(false);
  };
  const toggleNight = () => setNight((n) => !n);
  const modeProps = { onExit: toMenu, night, onToggleNight: toggleNight, settings };

  // A running game gets the whole window: the menu's fixed-width shell and its
  // side rules would otherwise pen the map in well short of the screen edges.
  const playing = (mode !== null && started) || match !== null || tubeTest;
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

  if (tubeTest) return <TubeScoringTest {...modeProps} />;

  // Back from either game goes to the pair of them rather than all the way out:
  // a player who opened the wrong one of the two wanted the other one.
  const toHeadToHead = () => setSocial("hub");

  if (social === "daily") {
    return <HeadToHead onBack={toHeadToHead} onStart={setMatch} />;
  }

  if (social === "room") {
    return <PlayFriend onBack={toHeadToHead} onStart={setMatch} />;
  }

  if (social === "hub") {
    return <HeadToHeadMenu onPick={setSocial} onBack={toMenu} />;
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
        onBack={toMenu}
      />
    );
  }

  // No day/night toggle out here — it belongs with the map it changes, so it
  // only appears once a game is running.
  return (
    <div className="menu">
      <h1>SpotOn</h1>
      <p className="muted menu-sub">Pick a mode, then choose how you want to play.</p>
      <div className="mode-grid">
        {MODES.map((m) => (
          <button key={m.id} className="mode-card" onClick={() => setMode(m.id)}>
            <span className="mode-emoji">{m.emoji}</span>
            <span className="mode-title">{m.title}</span>
            <span className="muted mode-blurb">{m.blurb}</span>
          </button>
        ))}
        {/* One door for playing other people, rather than two. The seven above
            are games; this is an opponent, and which opponent is a question
            for the other side of it. Drawn as one more card all the same — it
            sits in their grid, and picking it out in colour made it read as
            the thing you were meant to press rather than the last choice. */}
        <button className="mode-card" onClick={() => setSocial("hub")}>
          <span className="mode-emoji">⚔️</span>
          <span className="mode-title">Head to Head</span>
          <span className="muted mode-blurb">
            Play the world at today's round, or duel a friend on the same rounds at the
            same time.
          </span>
        </button>
        {/* A copy of the tube game kept aside to try a way of marking it on.
            Last in the grid and named for what it is, so nobody comes to it
            expecting their score to count for anything. */}
        <button className="mode-card" onClick={() => setTubeTest(true)}>
          <span className="mode-emoji">🧪</span>
          <span className="mode-title">{TUBE_TEST_TITLE}</span>
          <span className="muted mode-blurb">
            Try out marking a near miss by how far the walk is rather than by the ride:
            set both ends of a round and see what each would pay.
          </span>
        </button>
      </div>
    </div>
  );
}
