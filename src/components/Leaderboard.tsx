import { useCallback, useEffect, useState } from "react";
import { describeCode, parseMatchCode, spellCode } from "../lib/match";
import { fetchBoard, type Board } from "../lib/leaderboard";
import { hasRemote } from "../lib/supabase";
import Standings from "./Standings";

interface LeaderboardProps {
  /** Filled in and looked up on arrival, when the code is already known. */
  code?: string;
  /** Whose row to mark as theirs, where they're on it. */
  player?: string;
  /**
   * Arrived here from a code this player has already finished, rather than by
   * asking. Worth saying out loud — otherwise being sent to a table instead of
   * a game reads as the game having broken.
   */
  locked?: boolean;
}

/** A board and the code it's of, so the two can never be shown out of step. */
type Loaded = Board & { code: string };

/**
 * The standings for a code, looked up from cold.
 *
 * The results screen only exists at the end of a match, which is a bad time to
 * find out what everyone else got: two people racing each other finish seconds
 * apart, and the one who finishes first sees an empty table. This asks the
 * same question at any time, from any device, without playing — which is also
 * where a player is sent when their code is spent.
 */
export default function Leaderboard({ code = "", player, locked = false }: LeaderboardProps) {
  const [typed, setTyped] = useState(code);
  const [board, setBoard] = useState<Loaded | null>(null);
  // A code handed in is already being looked up on the first paint, so the
  // screen opens on "looking" rather than flashing an empty table first.
  const [loading, setLoading] = useState(() => parseMatchCode(code) !== null);

  const match = parseMatchCode(typed);

  const load = useCallback((code: string) => {
    fetchBoard(code)
      .then((board) => setBoard({ ...board, code }))
      .finally(() => setLoading(false));
  }, []);

  // A code handed in was chosen already; asking for it again is a step for
  // nothing. Typed codes wait for the button, since half a code isn't one.
  useEffect(() => {
    const known = parseMatchCode(code);
    if (known) load(known.code);
  }, [code, load]);

  /** From the button: the same lookup, with the screen put into its wait. */
  const look = (code: string) => {
    setLoading(true);
    load(code);
  };

  return (
    <div className="setup-panel h2h-code-panel">
      {locked && (
        <p className="h2h-locked">
          You've already played {spellCode(code)}. One go each — here's how it went.
        </p>
      )}

      {!locked && (
        <>
          <p className="muted h2h-code-label">Leaderboard for</p>
          <input
            className="h2h-code-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="FA4 KQ7M"
            autoFocus
            maxLength={10}
            aria-label="Match code"
            onKeyDown={(e) => e.key === "Enter" && match && look(match.code)}
          />
          <div className="button-row">
            <button
              className="btn btn-primary"
              disabled={!match || loading}
              onClick={() => match && look(match.code)}
            >
              {loading ? "Looking…" : "Show standings"}
            </button>
          </div>
        </>
      )}

      {/* What these scores were got at. A table of names and numbers says
          nothing about which of the six games was played. */}
      {match && <p className="h2h-setup">{describeCode(match)}</p>}

      {board !== null && !loading && (
        <>
          {board.standings.length > 0 ? (
            <>
              <p className="muted h2h-code-label">Game {spellCode(board.code)}</p>
              <Standings results={board.standings} you={player} />
            </>
          ) : (
            <p className="muted h2h-code-hint">
              {board.source === "offline"
                ? "Couldn't reach the leaderboard. Check your connection and try again."
                : `Nobody has finished ${spellCode(board.code)} yet.`}
            </p>
          )}

          <button className="btn btn-ghost" onClick={() => look(board.code)}>
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
