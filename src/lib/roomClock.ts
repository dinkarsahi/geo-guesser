/**
 * When each round of a room finished — the moment its last player answered.
 *
 * This is what stops a duel being mostly waiting. The timetable's thirty
 * seconds is a limit, not a length: nearly every round is over long before it,
 * and sitting out the remainder because the clock says so is dead time on
 * everybody's screen. So the moment the last of them answers, the round is done
 * and the next one is ten seconds away.
 *
 * It has to be a moment every device agrees on, or they'd fall out of step —
 * hence the server's own timestamp on the last score filed, which is a fact
 * about the room rather than about whoever noticed it first. A device that
 * hasn't heard yet runs the round to its full thirty seconds and catches up on
 * its next poll, a couple of seconds at worst.
 *
 * A module of its own, and not part of `duel.ts`, for two reasons. It's read by
 * the game loop rather than by anything rendered, so it can't live in React
 * state — the loop would restart every time it changed. And `match.ts` needs to
 * read it while `duel.ts` needs `match.ts`, which would be a circle.
 */
const closings = new Map<string, (number | null)[]>();

/** Files what's known about a room's rounds, replacing what was known before. */
export const setRoundClosings = (code: string, closings_: (number | null)[]) => {
  closings.set(code, closings_);
};

/** When round `round` (counted from zero) closed, if it has. */
export const roundClosedAt = (code: string, round: number): number | null =>
  closings.get(code)?.[round] ?? null;

/**
 * When *this device* first saw a round finish, as against when it actually did.
 *
 * The two differ by however long the news took to arrive: the closing above is
 * a server timestamp fetched on a poll, so it lands up to a couple of seconds
 * late, and it lands not at all while the room is short a player who has shut
 * their laptop. Neither is a reason to leave the pause on the answer without a
 * number on it — the ten seconds is a promise to the player, and a promise that
 * only shows up when the network is obliging is not one.
 *
 * So the screen counts down to whichever runs out first, the room's ten seconds
 * or this device's. The room still decides when the round actually turns over;
 * this only decides what the number says while it waits.
 *
 * Here rather than in React state for the same reason as the closings: it's a
 * fact about a room, it must survive the component re-rendering ten times a
 * second, and the moment it records has to be the first one — not the moment of
 * whichever render happens to ask.
 */
const firstSeenDone = new Map<string, number[]>();

/**
 * Notes round `round` (counted from zero, as above) as finished now, and hands
 * back when it first was.
 */
export function roundSeenDoneAt(code: string, round: number, now: number): number {
  const seen = firstSeenDone.get(code) ?? [];
  if (seen[round] === undefined) {
    seen[round] = now;
    firstSeenDone.set(code, seen);
  }
  return seen[round];
}
