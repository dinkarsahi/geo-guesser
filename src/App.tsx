import { useEffect, useState } from "react";
import type { Match } from "./lib/match";
import CityLocator from "./modes/CityLocator";
import CompanyGuesser from "./modes/CompanyGuesser";
import CurrencyGuesser from "./modes/CurrencyGuesser";
import FlagGuesser from "./modes/FlagGuesser";
import HeadToHead from "./modes/HeadToHead";
import PopulationGuesser from "./modes/PopulationGuesser";
import TubeGuesser from "./modes/TubeGuesser";
import type { GameSettings, ModeId, ModeProps } from "./modes/ModeProps";

type Mode = ModeId;

const MODES: { id: Mode; title: string; blurb: string; emoji: string }[] = [
  {
    id: "city",
    title: "City Locator",
    blurb: "See a city name, spin the globe and click where it is.",
    emoji: "🏙️",
  },
  {
    id: "flag",
    title: "Flag Guesser",
    blurb: "Identify a country from its flag, then learn a fact about it.",
    emoji: "🚩",
  },
  {
    id: "currency",
    title: "Currency Guesser",
    blurb: "See a currency and its symbol, then find somewhere that spends it.",
    emoji: "💱",
  },
  {
    id: "company",
    title: "Company HQ",
    blurb: "Spot a company from its logo, then guess where it's headquartered.",
    emoji: "🏢",
  },
  {
    id: "population",
    title: "Population Guesser",
    blurb: "See how many people live somewhere and work out where it is.",
    emoji: "👥",
  },
  {
    id: "tube",
    title: "Tube Station Guesser",
    blurb: "Pinpoint a London Underground station on a zoomed-in map.",
    emoji: "🚇",
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

/** The mode itself, whichever it is, wired to the props they all share. */
function PlayMode({ mode, ...props }: ModeProps & { mode: Mode }) {
  if (mode === "city") return <CityLocator {...props} />;
  if (mode === "flag") return <FlagGuesser {...props} />;
  if (mode === "currency") return <CurrencyGuesser {...props} />;
  if (mode === "company") return <CompanyGuesser {...props} />;
  if (mode === "population") return <PopulationGuesser {...props} />;
  return <TubeGuesser {...props} />;
}

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [started, setStarted] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  // Day (colourful) by default; the toggle switches to the grey night look.
  const [night, setNight] = useState(false);
  // Set while a head-to-head code is being made, typed, or played out.
  const [duel, setDuel] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);

  const toMenu = () => {
    setMode(null);
    setStarted(false);
    setDuel(false);
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

  // A match names its own mode and the map it's played on, so it skips the
  // setup screen entirely: everyone playing a code has to be asked the same
  // five questions of the same world, and none of that is the joiner's to
  // change. Only the day/night look stays personal — it changes how the map is
  // lit, not what it can tell you.
  if (match)
    return (
      <PlayMode
        {...modeProps}
        settings={{ ...settings, flat: match.flat, borders: match.borders }}
        mode={match.mode}
        match={match}
      />
    );

  if (duel) {
    return <HeadToHead onBack={toMenu} onStart={setMatch} />;
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
        <button className="mode-card" onClick={() => setDuel(true)}>
          <span className="mode-emoji">⚔️</span>
          <span className="mode-title">Head to Head</span>
          <span className="muted mode-blurb">
            Race a friend through the same rounds against the clock.
          </span>
        </button>
      </div>
    </div>
  );
}
