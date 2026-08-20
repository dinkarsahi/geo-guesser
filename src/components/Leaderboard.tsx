import { useCallback, useEffect, useState } from "react";
import { dailyCode, gameOfDay, modeEmoji, modeTitle } from "../lib/match";
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

  return (
    <div className="setup-panel h2h-code-panel">
      {locked && (
        <p className="h2h-locked">
          You have already played today's round. See where you stand on the
          leaderboard.
        </p>
      )}

      {/* The game, and nothing else. "5 rounds · today" was two facts nobody
          is here for: every game is five rounds, and a table headed Today's
          Leaderboard is not going to be yesterday's. */}
      <p className="h2h-setup">
        <span className="mode-emoji h2h-setup-emoji">{modeEmoji(game)}</span>{" "}
        {modeTitle(game)}
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

        </>
      )}

      {/* No Refresh button. The table is fetched when the screen is opened,
          and today's round is a day long — a score that landed a second after
          you looked is not news worth a button. Opening the page again is the
          refresh, and the way back to it is the bar at the top. */}
      {!hasRemote && (
        <p className="muted h2h-code-hint">
          No shared leaderboard is set up, so this only shows games finished on this
          device.
        </p>
      )}
    </div>
  );
}
