import { useState } from "react";
import {
  cleanName,
  dailyCode,
  describeCode,
  isTodaysCode,
  parseMatchCode,
  spellCode,
  MATCH_MODES,
  MATCH_ROUNDS,
  MATCH_ROUND_MS,
  type Match,
  type MatchCode,
  type MatchSetup,
} from "../lib/match";
import { checkEntry } from "../lib/leaderboard";
import { loadName, saveName } from "../lib/playerName";
import Leaderboard from "../components/Leaderboard";
import type { ModeId } from "./ModeProps";

const RULES = `${MATCH_ROUNDS} rounds, ${Math.round(
  MATCH_ROUND_MS / 1000,
)} seconds each, marked out of 100 a round as usual and averaged into one mark out of 100. Sitting on a round costs you up to 40% of what it was worth — so knowing it still beats guessing it quickly. One go a day at each game, for everyone, everywhere.`;

interface HeadToHeadProps {
  onBack: () => void;
  /** Play this match — the mode takes it from here. */
  onStart: (match: Match) => void;
}

/**
 * The front of the head-to-head game: take today's code, type one in, or look
 * one up.
 *
 * There is still no lobby and no server dealing rounds. What changed is that
 * the code is no longer drawn at random and sent to four friends — it's worked
 * out from the game and the date, so everyone in the world picking the same
 * game today is already holding the same code and landing on the same table.
 * A code is good until the player's own midnight, and there isn't another to
 * mint before then: one go a day, at each of the games.
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
  // Set when the name is somebody else's today. Sends the player back to the
  // name field, which is the only thing standing between them and a game.
  const [taken, setTaken] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const show = (mode: ModeId) => {
    setMade(parseMatchCode(dailyCode(mode, setup)));
  };

  /**
   * Off to play, under the name that will appear in everyone's standings —
   * unless this device has already had its go at today's code, or the name is
   * spoken for by one of the strangers sharing it.
   */
  const play = async (code: MatchCode) => {
    const player = name.trim();
    saveName(player);
    setTaken(null);
    setChecking(true);
    const entry = await checkEntry(code.code, player);
    setChecking(false);
    if (entry === "played") {
      setSpent(code.code);
      setScreen("board");
      return;
    }
    if (entry === "name-taken") {
      setTaken(player);
      setScreen("pick");
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
  // A code that parses but isn't today's is a round that has already been and
  // gone. Its table is still worth reading; its rounds are not worth playing,
  // since nobody it would rank is still playing them.
  const over = joining !== null && !isTodaysCode(joining);
  const insteadOf = over ? parseMatchCode(dailyCode(joining.mode, joining)) : null;

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
              onChange={(e) => {
                setName(cleanName(e.target.value));
                setTaken(null);
              }}
              placeholder="Your name"
              maxLength={16}
              autoFocus={!name || taken !== null}
            />
          </div>
          {/* One table a day for the whole world means one of everything on it,
              names included, until there are accounts to tell two Sams apart. */}
          {taken !== null && (
            <p className="h2h-taken">
              <strong>{taken}</strong> is taken on today's table — pick another name.
            </p>
          )}
          <div className="h2h-choices">
            <button
              className="h2h-choice"
              disabled={!named}
              onClick={() => setScreen("create")}
            >
              <span className="h2h-choice-title">Today's games</span>
              <span className="muted h2h-choice-hint">
                Pick one and get today's code — the same rounds everyone else is on.
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
            <p className="muted h2h-code-hint">Put a name in to play or join a game.</p>
          )}
        </>
      )}

      {screen === "create" && !made && (
        <div className="setup-panel">
          {/* Chosen before the game rather than after, because the game and
              these choices together are what the day's code is worked out
              from — a different map is a different code and a different table. */}
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
                <button key={m.id} className="h2h-mode" onClick={() => show(m.id)}>
                  <span className="mode-emoji">{m.emoji}</span>
                  <span>{m.title}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="muted h2h-code-hint">
            The game and the settings above are what today's code is worked out from —
            everyone who picks the same ones today is already on it.
          </p>
        </div>
      )}

      {screen === "create" && made && (
        <div className="setup-panel h2h-code-panel">
          <p className="muted h2h-code-label">Today's code</p>
          <p className="h2h-code">{spellCode(made.code)}</p>
          <p className="h2h-setup">{describeCode(made)}</p>
          <p className="muted h2h-code-hint">
            Everyone playing this game today is on this code — the same rounds, in the
            same order, on the same map, whether you sent it to them or not. It lasts
            until midnight, when a new one takes over and the table starts again. One go
            each, so make it count.
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
              {over ? (
                <p className="muted h2h-code-hint">
                  That round is over — codes last until midnight. Today's is{" "}
                  {insteadOf ? spellCode(insteadOf.code) : "a new one"}, and you can still
                  read the old table from the Leaderboard.
                </p>
              ) : (
                <p className="muted h2h-code-hint">
                  The same rounds on the same map as everyone else playing today.
                </p>
              )}
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
              onClick={() => {
                const go = over ? insteadOf : joining;
                if (go) play(go);
              }}
            >
              {checking ? "Checking…" : over ? "Play today's ▸" : "Play it ▸"}
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
