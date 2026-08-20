import type { GameSettings } from "../modes/ModeProps";

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

/**
 * How you like your map, asked once instead of ten times.
 *
 * These two questions used to stand in front of every game, and again in front
 * of today's round, and again in front of a duel — the same globe-or-flat and
 * borders-or-not, answered identically every time by anyone who had a view.
 * That is a preference wearing a decision's clothes: it doesn't change between
 * rounds, so asking each round only puts a screen between wanting to play and
 * playing. Here it is answered once and remembered — see `preferences.ts`.
 *
 * Reached from the home page rather than from the footer. The footer is where
 * the site keeps what it has to *say* — the policy, the credits, the address —
 * and a control that changes the game is not paperwork.
 *
 * There is no Save. A press is the change, which is what makes this worth
 * having: somebody who came here to turn borders on is one press from done and
 * one press from back, and a form that made them confirm a toggle would be
 * longer than the setup screen this replaced.
 */
export default function Settings({
  settings,
  onChange,
  onBack,
  backLabel,
}: {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onBack: () => void;
  /** Named by the caller, because this screen is reached from two places and
      a "Home" that goes back to a game's setup screen is a lie about where
      the press leads. */
  backLabel: string;
}) {
  return (
    <div className="menu setup">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          {backLabel}
        </button>
      </div>
      <h1>Settings</h1>
      <p className="muted menu-sub">
        How you like your map. Saved on this device, and used by every game.
      </p>

      {/* `settings-panel` is what scopes the layout below to this screen. The
          rows are `.setup-row`, which the duel's game picker also uses — a
          label over a grid of seven cards, which wants the label on top. Here
          there are two options to a row and the label reads better beside
          them. */}
      <div className="setup-panel settings-panel">
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
            { value: false, title: "Hide borders", hint: "Coastlines only — harder" },
            { value: true, title: "Show borders", hint: "Country outlines drawn on" },
          ]}
        />
        {/* One game's, and labelled as one game's. It is here rather than as a
            button on the tube map itself for the same reason the other two
            are: it is a preference, not a decision about this round — somebody
            who wants the dark map wants it every time. And the tube's own
            setup screen has this screen one press away in the bar above it, so
            "change it right before playing" is still a short errand. */}
        <Choice<boolean>
          label="Tube map"
          value={settings.tubeDark}
          onChange={(tubeDark) => onChange({ ...settings, tubeDark })}
          options={[
            { value: false, title: "White", hint: "The paper map's own colours" },
            { value: true, title: "Dark", hint: "Easier on a dark screen" },
          ]}
        />
      </div>

      {/* Nothing under the rows. The line that was here — that a duel is played
          on the host's world map, and that the tube's colours stay your own —
          was a footnote about a screen the player is not on, printed under the
          three settings it qualifies rather than beside the one it belongs to.
          The lobby names the map the room is playing on, which is where it is
          actually needed. */}
    </div>
  );
}
