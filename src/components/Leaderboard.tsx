import { useCallback, useEffect, useState } from "react";
import { dailyCode, gameOfDay, modeEmoji, MATCH_ROUNDS, modeTitle } from "../lib/match";
import { fetchBoard, type Board } from "../lib/leaderboard";
import { hasRemote } from "../lib/supabase";
import type { ModeId } from "../modes/ModeProps";
import Standings from "./Standings";

interface LeaderboardProps {
  /** The game to show, if not today's. */
  mode?: ModeId;
  /** Whose row to mark as theirs, where they're on it. */
  player?: string;
  /**
   * Arrived here from a round this device has already had its go at, rather
   * than by asking. Worth saying out loud — otherwise being sent to a table
   * instead of a game reads as the game having broken.
   */
  locked?: boolean;
}

/**
 * Today's standings.
 *
 * There used to be a code to type in, and then a game to choose. Both are gone
 * for the same reason: there is one round a day and the day names it, so there
 * is exactly one table to be looking at, and asking which one is asking a
 * question with one answer.
 */
export default function Leaderboard({ mode, player, locked = false }: LeaderboardProps) {
  const game = mode ?? gameOfDay();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback((game: ModeId) => {
    fetchBoard(dailyCode(game))
      .then(setBoard)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(game);
  }, [game, load]);

  /** From the button: the same lookup, with the screen put into its wait. */
  const look = () => {
    setLoading(true);
    load(game);
  };

  return (
    <div className="setup-panel h2h-code-panel">
      {locked && (
        // "This device" rather than "you", and it is not a hedge: the lock is
        // the device's, so this same line is what the second person on a shared
        // laptop reads. Told "you've already played", they would be reading an
        // accusation about a game they never had.
        <p className="h2h-locked">
          This device has already played today's {modeTitle(game)}. One go a day —
          here's the table.
        </p>
      )}

      <p className="h2h-setup">
        <span className="mode-emoji h2h-setup-emoji">{modeEmoji(game)}</span>{" "}
        {modeTitle(game)} · {MATCH_ROUNDS} rounds · today
      </p>

      {loading && <p className="muted h2h-code-hint">Looking…</p>}

      {board !== null && !loading && (
        <>
          {board.standings.length > 0 ? (
            <Standings results={board.standings} you={player} />
          ) : (
            <p className="muted h2h-code-hint">
              {board.source === "offline"
                ? "Couldn't reach the leaderboard. Check your connection and try again."
                : `Nobody has finished today's ${modeTitle(game)} yet. Be first.`}
            </p>
          )}

          <button className="btn btn-ghost" onClick={look}>
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
