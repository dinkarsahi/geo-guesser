import { useEffect, useState } from "react";
import CityLocator from "./modes/CityLocator";
import FlagGuesser from "./modes/FlagGuesser";
import TubeGuesser from "./modes/TubeGuesser";
import type { GameSettings } from "./modes/ModeProps";

type Mode = "city" | "flag" | "tube";

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
    id: "tube",
    title: "Tube Station Guesser",
    blurb: "Pinpoint a London Underground station on a zoomed-in map.",
    emoji: "🚇",
  },
];

/** Modes we've sketched out but haven't built — shown greyed out on the menu. */
const UPCOMING: { id: string; title: string; blurb: string; emoji: string; tag: string }[] = [
  {
    id: "currency",
    title: "Currency Guesser",
    blurb: "Given a currency and its symbol, name the country that spends it.",
    emoji: "💱",
    tag: "Coming soon",
  },
  {
    id: "population",
    title: "Population Guesser",
    blurb: "See how many people live somewhere and work out where it is.",
    emoji: "👥",
    tag: "Coming soon",
  },
  {
    id: "brand",
    title: "Brand HQ",
    blurb: "Spot a company from its logo, then guess where it's headquartered.",
    emoji: "🏢",
    tag: "In the works",
  },
  {
    id: "headsup",
    title: "Head to Head",
    blurb: "Race a friend through the same rounds against the clock.",
    emoji: "⚔️",
    tag: "In the works",
  },
];

const DEFAULT_SETTINGS: GameSettings = { endless: false, flat: false, borders: true };

/** A two-option toggle rendered as a pair of buttons. */
function Choice<T extends string | boolean>({
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
        <Choice<boolean>
          label="Length"
          value={settings.endless}
          onChange={(endless) => onChange({ ...settings, endless })}
          options={[
            { value: false, title: "5 rounds", hint: "Scored game with a final total" },
            { value: true, title: "Free run", hint: "Unlimited rounds — stop whenever" },
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

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [started, setStarted] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  // Day (colourful) by default; the toggle switches to the grey night look.
  const [night, setNight] = useState(false);

  const toMenu = () => {
    setMode(null);
    setStarted(false);
  };
  const toggleNight = () => setNight((n) => !n);
  const modeProps = { onExit: toMenu, night, onToggleNight: toggleNight, settings };

  // A running game gets the whole window: the menu's fixed-width shell and its
  // side rules would otherwise pen the map in well short of the screen edges.
  const playing = mode !== null && started;
  useEffect(() => {
    document.body.classList.toggle("playing", playing);
    return () => document.body.classList.remove("playing");
  }, [playing]);

  if (mode && started) {
    if (mode === "city") return <CityLocator {...modeProps} />;
    if (mode === "flag") return <FlagGuesser {...modeProps} />;
    return <TubeGuesser {...modeProps} />;
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
        {UPCOMING.map((m) => (
          <button key={m.id} className="mode-card is-soon" disabled aria-disabled="true">
            <span className="mode-tag">{m.tag}</span>
            <span className="mode-emoji">{m.emoji}</span>
            <span className="mode-title">{m.title}</span>
            <span className="muted mode-blurb">{m.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
