import { formatDuration, type SharedResult } from "../lib/match";

interface StandingsProps {
  /** Already ranked — this draws an order, it doesn't decide one. */
  results: SharedResult[];
  /** Whose row to mark as theirs, if any of them is. */
  you?: string;
}

/**
 * The table of everyone who has played a code.
 *
 * Drawn in two places off the same markup: under a match you have just
 * finished, and on the leaderboard screen where a code is typed in cold. They
 * are the same table and should be read the same way, so there is one of it.
 */
export default function Standings({ results, you }: StandingsProps) {
  const mine = you?.trim().toLowerCase();

  return (
    <>
      {/* Headings on the same grid as the rows below, so the two figures are
          named rather than left to be worked out from their shape. */}
      <div className="standing standing-head" aria-hidden="true">
        <span className="standing-place" />
        <span className="standing-name">Player</span>
        <span className="standing-time">Time</span>
        <span className="standing-score">Score</span>
      </div>
      <ol className="standings">
        {results.map((r, i) => {
          const isYou = mine !== undefined && r.player.toLowerCase() === mine;
          return (
            <li
              key={`${r.player}-${i}`}
              className={`standing${isYou ? " is-you" : ""}${i === 0 ? " is-leading" : ""}`}
            >
              <span className="standing-place">{i + 1}</span>
              <span className="standing-name">
                {r.player}
                {isYou && <span className="standing-you"> (you)</span>}
              </span>
              <span className="standing-time">{formatDuration(r.ms)}</span>
              <span className="standing-score">{r.score.toLocaleString()}</span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
