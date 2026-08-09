import { formatDuration, type SharedResult } from "../lib/match";
import { MAX_ROUND_SCORE } from "../lib/geo";

interface StandingsProps {
  /** Already ranked — this draws an order, it doesn't decide one. */
  results: SharedResult[];
  /** Whose row to mark as theirs, if any of them is. */
  you?: string;
  /**
   * Whether these scores were played against a clock, which is to say whether
   * a column of times means anything. A duel is a race and the time is half the
   * story of it; today's round has no clock on it at all, and a time printed
   * beside a score nobody was marked on invites the reader to think they were.
   */
  timed?: boolean;
}

/**
 * The table of everyone who has played a code.
 *
 * Drawn in two places off the same markup: under a match you have just
 * finished, and on the leaderboard screen where a code is typed in cold. They
 * are the same table and should be read the same way, so there is one of it.
 */
export default function Standings({ results, you, timed = false }: StandingsProps) {
  const mine = you?.trim().toLowerCase();
  // Carried by every row as well as the head, because each of them is its own
  // grid: they only line up while they are told to hold the same columns.
  const shape = `standing${timed ? "" : " is-untimed"}`;

  return (
    <>
      {/* Headings on the same grid as the rows below, so the two figures are
          named rather than left to be worked out from their shape. */}
      <div className={`${shape} standing-head`} aria-hidden="true">
        <span className="standing-place" />
        <span className="standing-name">Player</span>
        {/* Per round, not for the game: a room read mid-match holds players who
            have answered three rounds beside players who have answered five,
            and a total makes the one who has barely started look quick. */}
        {timed && <span className="standing-time">Average time per round</span>}
        <span className="standing-score">Score</span>
      </div>
      <ol className="standings">
        {results.map((r, i) => {
          const isYou = mine !== undefined && r.player.toLowerCase() === mine;
          return (
            <li
              key={`${r.player}-${i}`}
              className={`${shape}${isYou ? " is-you" : ""}${i === 0 ? " is-leading" : ""}`}
            >
              <span className="standing-place">{i + 1}</span>
              <span className="standing-name">
                {r.player}
                {isYou && <span className="standing-you"> (you)</span>}
              </span>
              {timed && <span className="standing-time">{formatDuration(r.ms)}</span>}
              {/* Out of what, on every line. A score here is an average of the
                  rounds rather than a total of them, so 74 at the top of a
                  table gives a reader no idea whether it is nearly everything
                  or a quarter of what was going. */}
              <span className="standing-score">
                {r.score.toLocaleString()}
                <span className="standing-max">/{MAX_ROUND_SCORE}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
