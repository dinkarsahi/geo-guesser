import { useCallback, useEffect, useState } from "react";
import type { Match } from "../lib/match";
import { formatDuration } from "../lib/match";
import { publishResult, type Board } from "../lib/leaderboard";
import { hasRemote } from "../lib/supabase";
import Standings from "./Standings";

interface MatchResultProps {
  match: Match;
  score: number;
  ms: number;
}

/**
 * The table a match ends on.
 *
 * The score goes up as the screen is built and the whole table comes back, so
 * two people finishing within a second of each other both see the other — the
 * thing that couldn't happen while the standings were only ever this device's.
 * Whoever loads last still sees everyone; whoever loads first can ask again.
 */
export default function MatchResult({ match, score, ms }: MatchResultProps) {
  const [board, setBoard] = useState<Board | null>(null);
  // Distinct from `board === null`: that is the first send, this is a reload
  // over a table already on screen, which shouldn't blank it out. True from
  // the start, because the first send is under way before the first paint.
  const [checking, setChecking] = useState(true);

  const send = useCallback(() => {
    publishResult({ code: match.code, player: match.player, score, ms })
      .then(setBoard)
      .finally(() => setChecking(false));
  }, [match.code, match.player, score, ms]);

  // Filed the moment this renders, which is also the moment the score becomes
  // final — this panel only ever draws on a finished match. Posting the same
  // result twice is harmless: the table takes one row per player and refuses
  // the rest, so a second call reads as a refresh.
  useEffect(() => {
    send();
  }, [send]);

  const refresh = () => {
    setChecking(true);
    send();
  };

  const standings = board?.standings ?? [];
  const mine = standings.find((r) => r.player.toLowerCase() === match.player.toLowerCase());
  const contested = standings.length > 1;

  return (
    <div className="match-result">
      <p className="match-line">
        <span className="match-line-label">Your time</span>
        <span className="match-line-value">{formatDuration(ms)}</span>
      </p>

      <p className="match-line-label">Game {match.code}</p>

      {contested && <Standings results={standings} you={match.player} />}

      {contested && (
        <p className="match-verdict match-verdict-result">
          {standings[0] === mine
            ? `You're leading on ${standings[0].score.toLocaleString()}`
            : `${standings[0].player} leads on ${standings[0].score.toLocaleString()}`}
        </p>
      )}

      {!contested && board !== null && (
        <p className="muted match-hint">
          {board.source === "offline"
            ? "Your score is saved but the leaderboard is out of reach — it'll go up next time you're online."
            : hasRemote
              ? `Nobody else has finished ${match.code} yet. Check back when they have.`
              : `Nobody else has played ${match.code} here yet — hand it over and their score joins the table.`}
        </p>
      )}

      {board === null && <p className="muted match-hint">Sending your score up…</p>}

      {/* The one button worth having on this screen: two players who finish
          together each want to know what the other got, and the answer is a
          second or two away rather than a page reload away — which used to
          hand back a fresh game instead of an answer. */}
      {board !== null && (
        <button className="btn btn-ghost" onClick={refresh} disabled={checking}>
          {checking ? "Checking…" : "Refresh standings"}
        </button>
      )}
    </div>
  );
}
