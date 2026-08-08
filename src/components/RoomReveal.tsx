import type { RoomStanding } from "../lib/duel";
import { MATCH_ROUNDS } from "../lib/match";
import { useCountdown } from "../lib/useRoom";

interface RoomRevealProps {
  /** When the next round opens, on the room's clock. */
  closesAt: number;
  /** Whether the round just played was the last of them. */
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
export default function RoomReveal({ closesAt, lastRound, board, you }: RoomRevealProps) {
  const left = useCountdown(closesAt);
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
          {/* Named columns, because neither number explains itself: one is a
              count of rounds and the other is a mark that moves both ways, and
              side by side they otherwise read as points and more points. */}
          <div className="room-live-row room-live-head" aria-hidden="true">
            <span className="room-live-name">Player</span>
            <span className="room-live-rounds">Rounds played</span>
            <span className="room-live-score">Average</span>
          </div>
          <ol className="room-live">
            {board.map((s) => (
              <li
                key={s.player}
                className={`room-live-row${s.player.toLowerCase() === mine ? " is-you" : ""}`}
              >
                <span className="room-live-name">{s.player}</span>
                {/* How far through they are, out of the game rather than out of
                    the round we're on — "3/5" is a position in the game, where
                    "3/3" only ever says everyone is keeping up. */}
                <span className="muted room-live-rounds">
                  {s.rounds}/{MATCH_ROUNDS}
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
