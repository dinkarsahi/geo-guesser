import { useState } from "react";
import {
  cleanName,
  createMatchCode,
  parseMatchCode,
  spellCode,
  MATCH_ROUNDS,
  MATCH_ROUND_MS,
  type Match,
  type MatchCode,
} from "../lib/match";
import { loadName, saveName } from "../lib/playerName";
import type { ModeId } from "./ModeProps";

/** The modes a match can be played in, as they're named on the menu. */
const MATCH_MODES: { id: ModeId; title: string; emoji: string }[] = [
  { id: "city", title: "City Locator", emoji: "🏙️" },
  { id: "flag", title: "Flag Guesser", emoji: "🚩" },
  { id: "currency", title: "Currency Guesser", emoji: "💱" },
  { id: "company", title: "Company HQ", emoji: "🏢" },
  { id: "population", title: "Population Guesser", emoji: "👥" },
  { id: "tube", title: "Tube Station Guesser", emoji: "🚇" },
];

const titleOf = (mode: ModeId) => MATCH_MODES.find((m) => m.id === mode)!.title;

const RULES = `${MATCH_ROUNDS} rounds, ${Math.round(
  MATCH_ROUND_MS / 1000,
)} seconds each. Points for how close you land, plus up to half as much again for how fast — so knowing it beats guessing it quickly.`;

interface HeadToHeadProps {
  onBack: () => void;
  /** Play this match — the mode takes it from here. */
  onStart: (match: Match) => void;
}

/**
 * The front of the head-to-head game: make a code, or type one in.
 *
 * There is no lobby to wait in, because there is no server to wait on. The
 * code carries the mode and the seed, so "joining" is nothing more than typing
 * it: both players' devices then deal the same five rounds from it. Whoever
 * makes the code chooses the game, which is the part of a lobby worth keeping.
 */
export default function HeadToHead({ onBack, onStart }: HeadToHeadProps) {
  const [screen, setScreen] = useState<"pick" | "create" | "join">("pick");
  const [made, setMade] = useState<MatchCode | null>(null);
  const [typed, setTyped] = useState("");
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(loadName);

  const create = (mode: ModeId) => {
    const code = createMatchCode(mode);
    setMade(parseMatchCode(code));
  };

  /** Off to play, under the name that will appear in everyone's standings. */
  const play = (code: MatchCode) => {
    const player = name.trim();
    saveName(player);
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
  const typedEnough = typed.replace(/[^0-9a-zA-Z]/g, "").length >= 6;

  return (
    <div className="menu setup">
      <div className="menu-bar">
        <button
          className="btn btn-ghost"
          onClick={() => (screen === "pick" ? onBack() : (setScreen("pick"), setMade(null)))}
        >
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
          </div>
          {!named && <p className="muted h2h-code-hint">Put a name in first.</p>}
        </>
      )}

      {screen === "create" && !made && (
        <div className="setup-panel">
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
        </div>
      )}

      {screen === "create" && made && (
        <div className="setup-panel h2h-code-panel">
          <p className="muted h2h-code-label">Your code</p>
          <p className="h2h-code">{spellCode(made.code)}</p>
          <p className="muted h2h-code-hint">
            {titleOf(made.mode)} — anyone who types this code gets the same{" "}
            {MATCH_ROUNDS} rounds, in the same order. Play it yourself whenever you like:
            the code doesn't expire and nobody has to be online at the same time.
          </p>
          <div className="button-row">
            <button className="btn btn-ghost" onClick={() => copy(made.code)}>
              {copied ? "Copied ✓" : "Copy code"}
            </button>
            <button className="btn btn-primary" onClick={() => play(made)}>
              Play it ▸
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
            placeholder="F4K Q7M"
            autoFocus
            maxLength={9}
            aria-label="Match code"
          />
          {joining ? (
            <p className="muted h2h-code-hint">
              {titleOf(joining.mode)} — {MATCH_ROUNDS} rounds, the same ones your opponent
              gets.
            </p>
          ) : (
            <p className="muted h2h-code-hint">
              {typedEnough ? "That isn't a code we recognise." : "Six characters, in any case."}
            </p>
          )}
          <div className="button-row">
            <button
              className="btn btn-primary"
              disabled={!joining}
              onClick={() => joining && play(joining)}
            >
              Play it ▸
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
