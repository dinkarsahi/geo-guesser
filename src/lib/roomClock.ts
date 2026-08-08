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
