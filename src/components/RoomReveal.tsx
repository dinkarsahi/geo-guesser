import { ROUND_PERIOD_MS } from "../lib/duel";
import type { RoomStanding } from "../lib/duel";
import { useCountdown } from "../lib/useRoom";

interface RoomRevealProps {
  /** When round one opened, on the room's clock. */
  startAt: number;
  /** The round just played, counted from zero. */
  roundIndex: number;
  /** Whether that was the last of them. */
  lastRound: boolean;
  /** Everyone in the room as they stand, or null if it hasn't come back yet. */
  board: RoomStanding[] | null;
  /** Whose line to pick out. */
  you: string;
}

/**
 * What sits where the "next round" button sits in a solo game.
 *
 * There is no button in a room — the rounds turn over for everybody at once,
 * so the only honest thing to show is how long that is. The standings go under
 * it because this is the moment they're worth reading: everyone has just
 * answered the same question, and the table is about to change again.
 */
export default function RoomReveal({
  startAt,
  roundIndex,
  lastRound,
  board,
  you,
}: RoomRevealProps) {
  const left = useCountdown(startAt + (roundIndex + 1) * ROUND_PERIOD_MS);
  const seconds = Math.ceil(left / 1000);
  const mine = you.trim().toLowerCase();

  return (
    <div className="room-reveal">
      <p className="room-next">
        {lastRound ? "Results in " : "Next round in "}
        <strong>{seconds}s</strong>
      </p>
      {board && board.length > 1 && (
        <>
          {/* Said out loud, because a number on its own here reads as points
              and isn't: it's the mark the game is decided on, which is an
              average and therefore moves both ways. */}
          <p className="muted room-live-cap">Marks so far, out of 100</p>
          <ol className="room-live">
            {board.map((s) => (
              <li
                key={s.player}
                className={`room-live-row${s.player.toLowerCase() === mine ? " is-you" : ""}`}
              >
                <span className="room-live-name">{s.player}</span>
                {/* How far through they are, which mid-game is as much of the
                    story as the score: a blank round is a player who stepped
                    away, not a player who guessed badly. */}
                <span className="muted room-live-rounds">
                  {s.rounds}/{roundIndex + 1}
                </span>
                <span className="room-live-score">{s.score}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
