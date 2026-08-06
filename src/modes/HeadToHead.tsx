import { useState } from "react";
import {
  cleanName,
  createMatchCode,
  describeCode,
  parseMatchCode,
  spellCode,
  MATCH_MODES,
  MATCH_ROUNDS,
  MATCH_ROUND_MS,
  type Match,
  type MatchCode,
  type MatchSetup,
} from "../lib/match";
import { hasPlayed } from "../lib/leaderboard";
import { loadName, saveName } from "../lib/playerName";
import Leaderboard from "../components/Leaderboard";
import type { ModeId } from "./ModeProps";

const RULES = `${MATCH_ROUNDS} rounds, ${Math.round(
  MATCH_ROUND_MS / 1000,
)} seconds each, marked out of 100 a round as usual. Sitting on a round costs you up to 40% of what it was worth — so knowing it still beats guessing it quickly. One go per code.`;

interface HeadToHeadProps {
  onBack: () => void;
  /** Play this match — the mode takes it from here. */
  onStart: (match: Match) => void;
}

/**
 * The front of the head-to-head game: make a code, type one in, or look one up.
 *
 * There is still no lobby to wait in. The code carries the mode and the seed,
 * so "joining" is nothing more than typing it: both players' devices then deal
 * the same five rounds from it. What the leaderboard adds is the other half —
 * the scores, which used to be stuck on whichever device made them and now
 * meet in one table that anyone holding the code can read, mid-match or long
 * after. Which is also what lets a code be one attempt: the table remembers
 * you played it, so a reload hands back your score rather than a fresh game.
 */
export default function HeadToHead({ onBack, onStart }: HeadToHeadProps) {
  const [screen, setScreen] = useState<"pick" | "create" | "join" | "board">("pick");
  const [made, setMade] = useState<MatchCode | null>(null);
  const [typed, setTyped] = useState("");
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(loadName);
  // The maker's choices, which the code will carry to everyone else.
  const [setup, setSetup] = useState<MatchSetup>({ flat: false, borders: true });
  // Set when a player is sent to the standings because their code is spent,
  // rather than having asked to see them.
  const [spent, setSpent] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const create = (mode: ModeId) => {
    setMade(parseMatchCode(createMatchCode(mode, setup)));
  };

  /**
   * Off to play, under the name that will appear in everyone's standings —
   * unless that name has already had its go at this code, in which case the
   * standings are what they get instead of a second attempt.
   */
  const play = async (code: MatchCode) => {
    const player = name.trim();
    saveName(player);
    setChecking(true);
    const already = await hasPlayed(code.code, player);
    setChecking(false);
    if (already) {
      setSpent(code.code);
      setScreen("board");
      return;
    }
    onStart({ ...code, player });
  };

  const named = name.trim().length > 0;

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  };

  const joining = parseMatchCode(typed);
  const typedEnough = typed.replace(/[^0-9a-zA-Z]/g, "").length >= 7;

  const back = () => {
    if (screen === "pick") return onBack();
    setScreen("pick");
    setMade(null);
    setSpent(null);
  };

  return (
    <div className="menu setup">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={back}>
          ← {screen === "pick" ? "Menu" : "Back"}
        </button>
      </div>
      <h1>
        <span className="mode-emoji">⚔️</span> Head to Head
      </h1>
      <p className="muted menu-sub">{RULES}</p>

      {screen === "pick" && (
        <>
          {/* Asked for before anything else, because the standings at the end
              are a list of names and one of them has to be yours. */}
          <div className="h2h-name">
            <label className="setup-label" htmlFor="h2h-player">
              Playing as
            </label>
            <input
              id="h2h-player"
              className="h2h-name-input"
              value={name}
              onChange={(e) => setName(cleanName(e.target.value))}
              placeholder="Your name"
              maxLength={16}
              autoFocus={!name}
            />
          </div>
          <div className="h2h-choices">
            <button
              className="h2h-choice"
              disabled={!named}
              onClick={() => setScreen("create")}
            >
              <span className="h2h-choice-title">Create a game</span>
              <span className="muted h2h-choice-hint">
                Pick the mode and get a code to send out.
              </span>
            </button>
            <button
              className="h2h-choice"
              disabled={!named}
              onClick={() => setScreen("join")}
            >
              <span className="h2h-choice-title">Join a game</span>
              <span className="muted h2h-choice-hint">
                Type the code you were given and play the same rounds.
              </span>
            </button>
            {/* Open to anyone holding a code, name or not: reading a table is
                not playing, and a spectator shouldn't have to invent a name. */}
            <button className="h2h-choice" onClick={() => setScreen("board")}>
              <span className="h2h-choice-title">Leaderboard</span>
              <span className="muted h2h-choice-hint">
                Look up a code and see everyone who has played it.
              </span>
            </button>
          </div>
          {!named && (
            <p className="muted h2h-code-hint">Put a name in to create or join a game.</p>
          )}
        </>
      )}

      {screen === "create" && !made && (
        <div className="setup-panel">
          {/* Chosen before the game rather than after, because picking the game
              is what mints the code — and by then these are baked into it. */}
          <div className="setup-row">
            <span className="setup-label">Map</span>
            <div className="setup-options">
              <button
                className={`setup-option${!setup.flat ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, flat: false }))}
                aria-pressed={!setup.flat}
              >
                <span className="setup-option-title">3D globe</span>
                <span className="muted setup-option-hint">Spin and zoom a real globe</span>
              </button>
              <button
                className={`setup-option${setup.flat ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, flat: true }))}
                aria-pressed={setup.flat}
              >
                <span className="setup-option-title">Flat map</span>
                <span className="muted setup-option-hint">The whole world at once</span>
              </button>
            </div>
          </div>

          <div className="setup-row">
            <span className="setup-label">Borders</span>
            <div className="setup-options">
              <button
                className={`setup-option${setup.borders ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, borders: true }))}
                aria-pressed={setup.borders}
              >
                <span className="setup-option-title">Show borders</span>
                <span className="muted setup-option-hint">Country outlines drawn on</span>
              </button>
              <button
                className={`setup-option${!setup.borders ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, borders: false }))}
                aria-pressed={!setup.borders}
              >
                <span className="setup-option-title">Hide borders</span>
                <span className="muted setup-option-hint">Coastlines only — harder</span>
              </button>
            </div>
          </div>

          <div className="setup-row">
            <span className="setup-label">Game</span>
            <div className="h2h-modes">
              {MATCH_MODES.map((m) => (
                <button key={m.id} className="h2h-mode" onClick={() => create(m.id)}>
                  <span className="mode-emoji">{m.emoji}</span>
                  <span>{m.title}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="muted h2h-code-hint">
            Picking the game makes the code — everything above is set into it, and
            everyone who plays it gets the same.
          </p>
        </div>
      )}

      {screen === "create" && made && (
        <div className="setup-panel h2h-code-panel">
          <p className="muted h2h-code-label">Your code</p>
          <p className="h2h-code">{spellCode(made.code)}</p>
          <p className="h2h-setup">{describeCode(made)}</p>
          <p className="muted h2h-code-hint">
            Anyone who types this code gets exactly that — the same rounds, in the same
            order, on the same map. Play it yourself whenever you like: the code doesn't
            expire and nobody has to be online at the same time. Everyone's score lands
            on the one leaderboard, and everyone gets one go.
          </p>
          <div className="button-row">
            <button className="btn btn-ghost" onClick={() => copy(made.code)}>
              {copied ? "Copied ✓" : "Copy code"}
            </button>
            <button
              className="btn btn-primary"
              disabled={checking}
              onClick={() => play(made)}
            >
              {checking ? "Checking…" : "Play it ▸"}
            </button>
          </div>
        </div>
      )}

      {screen === "join" && (
        <div className="setup-panel h2h-code-panel">
          <p className="muted h2h-code-label">Enter the code</p>
          <input
            className="h2h-code-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="FA4 KQ7M"
            autoFocus
            maxLength={10}
            aria-label="Match code"
          />
          {/* What the code commits you to, before you commit to it. */}
          {joining ? (
            <>
              <p className="h2h-setup">{describeCode(joining)}</p>
              <p className="muted h2h-code-hint">
                The same rounds on the same map as everyone else playing this code.
              </p>
            </>
          ) : (
            <p className="muted h2h-code-hint">
              {typedEnough
                ? "That isn't a code we recognise."
                : "Seven characters, in any case."}
            </p>
          )}
          <div className="button-row">
            <button
              className="btn btn-primary"
              disabled={!joining || checking}
              onClick={() => joining && play(joining)}
            >
              {checking ? "Checking…" : "Play it ▸"}
            </button>
          </div>
        </div>
      )}

      {screen === "board" && (
        <Leaderboard
          code={spent ?? undefined}
          player={named ? name.trim() : undefined}
          locked={spent !== null}
        />
      )}
    </div>
  );
}
