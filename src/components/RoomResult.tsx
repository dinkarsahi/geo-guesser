import type { Match } from "../lib/match";
import { MATCH_ROUNDS } from "../lib/match";
import type { RoomView } from "../lib/useRoom";
import Standings from "./Standings";

interface RoomResultProps {
  match: Match;
  room: RoomView;
}

/**
 * How a room ends: one table, a winner, and nothing after it.
 *
 * The daily games keep a leaderboard that goes on all day and that anybody can
 * come back and read. A room is the opposite of that on purpose — it was five
 * rounds between people who arranged to play them together, and when they're
 * done the only thing anyone wants is who won. The code dies with it.
 */
export default function RoomResult({ match, room }: RoomResultProps) {
  const { board, offline, settled, refresh } = room;
  const you = match.player.toLowerCase();
  const leader = board?.[0];
  const alone = (board?.length ?? 0) < 2;
  // Two people on the same mark, settled by the clock: worth saying, because
  // "won on 71" over a table showing two 71s reads as a mistake otherwise.
  const onTime = Boolean(
    leader && board && board.length > 1 && board[1].score === leader.score,
  );

  return (
    <div className="match-result">
      {board === null ? (
        <p className="muted match-hint">
          {offline ? "Couldn't reach the room." : "Counting the room up…"}
        </p>
      ) : (
        <>
          {/* A duel keeps its clock, and so keeps its column of times: a room
              is a race, level scores are settled on it, and the line below
              says so out loud. */}
          <Standings results={board} you={match.player} timed />

          {leader && !alone && (
            <p className="match-verdict match-verdict-result">
              {leader.player.toLowerCase() === you
                ? `You win on ${leader.score}`
                : `${leader.player} wins on ${leader.score}`}
              {onTime && " — on time"}
            </p>
          )}

          {alone && (
            <p className="muted match-hint">
              Nobody else played this room. Rooms are five rounds between people
              who start together — get them in before the host presses go.
            </p>
          )}

          {!settled && !alone && (
            <p className="muted match-hint">
              Still waiting on {MATCH_ROUNDS} rounds from everyone…
            </p>
          )}
        </>
      )}

      <button className="btn btn-ghost" onClick={refresh}>
        Refresh
      </button>

      <p className="muted match-hint">
        That's the room done — the code goes with it. Make another to play again.
      </p>
    </div>
  );
}
