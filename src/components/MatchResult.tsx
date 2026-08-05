import { useState } from "react";
import type { Match, SharedResult } from "../lib/match";
import { formatDuration, rankResults } from "../lib/match";
import { saveResult } from "../lib/matchHistory";

interface MatchResultProps {
  match: Match;
  score: number;
  ms: number;
}

/**
 * The table a match ends on.
 *
 * Every game finished here is filed under its code, so the standings are
 * already there when the round ends: hand the device round and each player's
 * score joins the table as they finish.
 */
export default function MatchResult({ match, score, ms }: MatchResultProps) {
  // Filed as the screen is first built, which is also the moment the score
  // becomes final — this panel only ever renders on a finished match. Saving
  // twice would be harmless anyway: the store keeps one row per player.
  const [kept] = useState<SharedResult[]>(() =>
    saveResult({ code: match.code, player: match.player, score, ms }),
  );

  const standings = rankResults(kept);
  const mine = standings.find((r) => r.player.toLowerCase() === match.player.toLowerCase());
  const contested = standings.length > 1;

  return (
    <div className="match-result">
      <p className="match-line">
        <span className="match-line-label">Your time</span>
        <span className="match-line-value">{formatDuration(ms)}</span>
      </p>

      {contested ? (
        <>
          <p className="match-line-label">Game {match.code}</p>
          <ol className="standings">
            {standings.map((r, i) => (
              <li
                key={`${r.player}-${i}`}
                className={`standing${r === mine ? " is-you" : ""}${
                  i === 0 ? " is-leading" : ""
                }`}
              >
                <span className="standing-place">{i + 1}</span>
                <span className="standing-name">
                  {r.player}
                  {r === mine && <span className="standing-you"> (you)</span>}
                </span>
                <span className="standing-time">{formatDuration(r.ms)}</span>
                <span className="standing-score">{r.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
          <p className="match-verdict match-verdict-result">
            {standings[0] === mine
              ? `You're leading on ${standings[0].score.toLocaleString()}`
              : `${standings[0].player} leads on ${standings[0].score.toLocaleString()}`}
          </p>
        </>
      ) : (
        <p className="muted match-hint">
          Nobody else has played {match.code} here yet — hand it over and their score
          joins the table.
        </p>
      )}
    </div>
  );
}
