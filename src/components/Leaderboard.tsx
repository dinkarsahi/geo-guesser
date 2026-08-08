import { useCallback, useEffect, useState } from "react";
import { dailyCode, MATCH_MODES, MATCH_ROUNDS, modeTitle } from "../lib/match";
import { fetchBoard, type Board } from "../lib/leaderboard";
import { hasRemote } from "../lib/supabase";
import type { ModeId } from "../modes/ModeProps";
import Standings from "./Standings";

interface LeaderboardProps {
  /** Opened straight onto this game's table, where one is already in mind. */
  mode?: ModeId;
  /** Whose row to mark as theirs, where they're on it. */
  player?: string;
  /**
   * Arrived here from a game this player has already had their go at, rather
   * than by asking. Worth saying out loud — otherwise being sent to a table
   * instead of a game reads as the game having broken.
   */
  locked?: boolean;
}

/** A board and the game it's of, so the two can never be shown out of step. */
type Loaded = Board & { mode: ModeId };

/**
 * Today's standings, by game.
 *
 * There used to be a code to type in here, because there used to be twenty-one
 * tables a day — one for each game crossed with each way of drawing the map.
 * The map is a matter of taste and never belonged in the ranking, so there are
 * six tables now, one per game, and the way to reach one is to say which game.
 * Nobody has to have been handed anything.
 */
export default function Leaderboard({ mode, player, locked = false }: LeaderboardProps) {
  const [picked, setPicked] = useState<ModeId | null>(mode ?? null);
  const [board, setBoard] = useState<Loaded | null>(null);
  // A game chosen already is being looked up on the first paint, so the screen
  // opens on "looking" rather than flashing an empty table first.
  const [loading, setLoading] = useState(mode !== undefined);

  const load = useCallback((mode: ModeId) => {
    fetchBoard(dailyCode(mode))
      .then((board) => setBoard({ ...board, mode }))
      .finally(() => setLoading(false));
  }, []);

  // A game chosen for us was chosen already; asking for it again is a step for
  // nothing. Every other lookup here comes from a button.
  useEffect(() => {
    if (mode) load(mode);
  }, [mode, load]);

  /** From a button: the same lookup, with the screen put into its wait. */
  const look = (mode: ModeId) => {
    setPicked(mode);
    setLoading(true);
    load(mode);
  };

  return (
    <div className="setup-panel h2h-code-panel">
      {locked && picked && (
        <p className="h2h-locked">
          You've already played today's {modeTitle(picked)}. One go each — here's how it
          went.
        </p>
      )}

      {!locked && (
        <>
          <p className="muted h2h-code-label">Today's table for</p>
          <div className="h2h-modes">
            {MATCH_MODES.map((m) => (
              <button
                key={m.id}
                className={`h2h-mode${m.id === picked ? " is-active" : ""}`}
                onClick={() => look(m.id)}
                aria-pressed={m.id === picked}
              >
                <span className="mode-emoji">{m.emoji}</span>
                <span>{m.title}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {loading && <p className="muted h2h-code-hint">Looking…</p>}

      {board !== null && !loading && (
        <>
          <p className="h2h-setup">
            {modeTitle(board.mode)} · {MATCH_ROUNDS} rounds · today
          </p>
          {board.standings.length > 0 ? (
            <Standings results={board.standings} you={player} />
          ) : (
            <p className="muted h2h-code-hint">
              {board.source === "offline"
                ? "Couldn't reach the leaderboard. Check your connection and try again."
                : `Nobody has finished today's ${modeTitle(board.mode)} yet. Be first.`}
            </p>
          )}

          <button className="btn btn-ghost" onClick={() => look(board.mode)}>
            Refresh
          </button>
        </>
      )}

      {!hasRemote && (
        <p className="muted h2h-code-hint">
          No shared leaderboard is set up, so this only shows games finished on this
          device.
        </p>
      )}
    </div>
  );
}
