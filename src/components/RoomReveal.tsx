import type { RoomStanding } from "../lib/duel";
import { MATCH_REVEAL_MS, modeNoun } from "../lib/match";
import { roundSeenDoneAt } from "../lib/roomClock";
import { serverNow } from "../lib/supabase";
import { useCountdown } from "../lib/useRoom";
import type { ModeId } from "../modes/ModeProps";

interface RoomRevealProps {
  /** The room, so the pause can remember when it started here. */
  code: string;
  /** When the next round opens, on the room's clock. */
  closesAt: number;
  /** The round just answered, counted from one — what the marks below are for. */
  round: number;
  /** Whether the round just played was the last of them. */
  lastRound: boolean;
  /** Which game this is, for naming what the others are still looking for. */
  mode: ModeId;
  /** Everyone in the room as they stand, or null if it hasn't come back yet. */
  board: RoomStanding[] | null;
  /** Whose line to pick out. */
  you: string;
}

/** "Sam", "Sam and Alex", "Sam, Alex and Jo". */
function nameList(names: string[]): string {
  if (names.length < 2) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * What sits where the "next round" button sits in a solo game.
 *
 * There is no button in a room — the rounds turn over for everybody at once —
 * so this says what's being waited for, and what the question just answered was
 * worth to each of them.
 *
 * Two waits, and they're different things. Before the room has all its answers
 * in, a countdown would be a lie: it would be counting the thirty-second limit
 * down, and the round is going to end the moment the last player clicks, which
 * is usually far sooner. So that half says who is still looking, by name. Only
 * once everyone is in does a number appear, and then it's the ten seconds on
 * the answer, which really is ten seconds.
 *
 * Marks for the round rather than the table: mid-game the standings are a
 * league table nobody can do anything about, and they turn every reveal into a
 * verdict on the game rather than on the question just asked. Who won this
 * round, and by how much, is the thing worth reading in the gap between two
 * questions — the table can wait until there's nothing left to play for.
 */
export default function RoomReveal({
  code,
  closesAt,
  round,
  lastRound,
  mode,
  board,
  you,
}: RoomRevealProps) {
  const left = useCountdown(closesAt);
  const mine = you.trim().toLowerCase();

  /** What this player scored on the round being revealed, if they've filed it. */
  const scored = (s: RoomStanding) => s.scores[round - 1] ?? null;

  // Who the room is still short of — everyone but you, because your own answer
  // is what put this panel on screen and no reading of the table is allowed to
  // argue with that. It's the one row that can be missing for reasons that have
  // nothing to do with the game: a filing that hasn't landed yet, a name the
  // table joined up differently. Waiting on yourself is never right, and it was
  // enough to hold the countdown back for the whole round.
  const missing = (board ?? [])
    .filter((s) => s.player.toLowerCase() !== mine && scored(s) === null)
    .map((s) => s.player);

  // Still open for somebody. The table is asked first and the clock is the
  // backstop: past the round's own limit it's over whoever hasn't answered,
  // which is what stops a player who shut their laptop mid-round holding four
  // other people on this screen. Before the table has arrived at all, assume
  // the room is still answering — the alternative is counting down to a round
  // change that isn't coming.
  const waiting = (board === null || missing.length > 0) && left > MATCH_REVEAL_MS;

  // The number on the pause: whichever of the room's ten seconds and this
  // device's own runs out first, so that it is always there and always moving
  // even when the room's closing time is late or never comes. See
  // `roundSeenDoneAt`.
  const ownEnd = waiting
    ? 0
    : roundSeenDoneAt(code, round - 1, serverNow()) + MATCH_REVEAL_MS;
  const showLeft = Math.max(0, Math.min(left, ownEnd - serverNow(), MATCH_REVEAL_MS));

  // This round's marks, best first. Sorted on the round rather than on the
  // game, so first place here is whoever answered this question best and not
  // whoever is winning.
  const rows = [...(board ?? [])].sort(
    (a, b) =>
      (scored(b) ?? -1) - (scored(a) ?? -1) || a.player.localeCompare(b.player),
  );

  return (
    <div className="room-reveal">
      {waiting ? (
        // Named where the names are known, because "waiting for Alex" is a fact
        // about a person you can see across the table and "waiting" is a
        // spinner. The board is a couple of seconds behind at worst, and until
        // it lands there's no honest way to say who.
        <p className="room-next room-waiting">
          Waiting for <strong>{missing.length ? nameList(missing) : "the others"}</strong> to
          spot the {modeNoun(mode)}…
        </p>
      ) : (
        // Nothing to count down to on the last round: the results are what's
        // next, and "results in 7s" is a number over a screen whose whole job
        // for those seconds is the fact underneath it.
        !lastRound && (
          <p className="room-next">
            Next round in <strong>{Math.ceil(showLeft / 1000)}s</strong>
          </p>
        )
      )}
      {rows.length > 1 && (
        <>
          {/* The round is named here rather than left to the bar at the top,
              since these numbers are only ever meant as marks for one question
              and a column of points with no round on it reads as a total. */}
          <div className="room-live-row room-live-round room-live-head" aria-hidden="true">
            <span className="room-live-name">Round {round}</span>
            <span className="room-live-score">Points</span>
          </div>
          <ol className="room-live">
            {rows.map((s) => (
              <li
                key={s.player}
                className={`room-live-row room-live-round${
                  s.player.toLowerCase() === mine ? " is-you" : ""
                }`}
              >
                <span className="room-live-name">{s.player}</span>
                <span className="room-live-score">
                  {scored(s) === null ? "…" : scored(s)!.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
