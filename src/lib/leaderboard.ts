import { rankResults, type SharedResult } from "./match";
import { cacheResults, loadResults, playedHere, saveResult } from "./matchHistory";

import { hasRemote, rest, RemoteError, UNIQUE_VIOLATION } from "./supabase";

/** The table every finished match is filed in. */
const TABLE = "match_results";

/** How many names a board shows. Long enough that nobody who played is missing. */
const LIMIT = 100;

/** A row as the table holds it — the same four figures, named for Postgres. */
interface Row {
  code: string;
  player: string;
  score: number;
  ms: number;
}

const toResult = (row: Row): SharedResult => ({
  code: row.code,
  player: row.player,
  score: row.score,
  ms: row.ms,
});

/** Codes are stored as they're read out — upper case, no spaces. */
const key = (code: string) => code.toUpperCase().replace(/[^0-9A-Z]/g, "");

/**
 * How a board came to be what it is, so the screen can say so. A table that
 * couldn't be reached looks exactly like a table nobody has played, and those
 * two want telling apart: one is "you're first", the other is "try again".
 */
export type BoardSource = "remote" | "local" | "offline";

export interface Board {
  standings: SharedResult[];
  source: BoardSource;
}

/**
 * Everyone who has finished a code, best first.
 *
 * Falls back to this device's copy when the server can't be reached, because a
 * results screen that shows nothing at all is worse than one showing what it
 * knows — and the player has just finished a game and wants a number.
 */
export async function fetchBoard(code: string): Promise<Board> {
  const local = () => rankResults(loadResults(key(code)));
  if (!hasRemote) return { standings: local(), source: "local" };

  try {
    const rows = await rest<Row[]>(
      `${TABLE}?code=eq.${encodeURIComponent(key(code))}` +
        `&select=code,player,score,ms&order=score.desc,ms.asc&limit=${LIMIT}`,
    );
    const standings = rankResults(rows.map(toResult));
    cacheResults(key(code), standings);
    return { standings, source: "remote" };
  } catch {
    return { standings: local(), source: "offline" };
  }
}

/**
 * Files a finished match and hands back the table it joined.
 *
 * The unique index on (code, player) is what makes a code one attempt: a
 * second result for a name is refused by Postgres rather than by us, so it
 * holds however the player got there. That refusal isn't an error to report —
 * it means the score already up there is the one that counts, and the right
 * thing to show is the table with it in.
 */
export async function publishResult(result: SharedResult): Promise<Board> {
  const row: Row = { ...result, code: key(result.code) };
  // Kept here first, so the lock survives a network that doesn't answer.
  saveResult(row);
  if (!hasRemote) return { standings: rankResults(loadResults(row.code)), source: "local" };

  try {
    await rest(TABLE, { method: "POST", body: JSON.stringify(row) });
  } catch (e) {
    if (!(e instanceof RemoteError)) return { standings: rankResults(loadResults(row.code)), source: "offline" };
    // Anything other than "you've already played this" is worth stopping for —
    // but not at the cost of the screen, which still has a table to draw.
    if (e.code !== UNIQUE_VIOLATION) {
      return { standings: rankResults(loadResults(row.code)), source: "offline" };
    }
  }

  return fetchBoard(row.code);
}

/**
 * Whether this player has already had their go at this code.
 *
 * Answered from this device first — instantly, and without a network to lean
 * on — then from the table, which is what catches the same name coming back on
 * a different phone or after clearing the browser. A server that can't be
 * reached doesn't hand out a second attempt on its own: it can only fail to
 * take one away, and the local answer has already been given.
 */
export async function hasPlayed(code: string, player: string): Promise<boolean> {
  if (playedHere(key(code), player)) return true;
  if (!hasRemote) return false;

  // The whole board rather than a query for the one name: a name is free text
  // and `ilike` would read a % or an _ in it as a wildcard, matching someone
  // else. It's the same single request, and it leaves the board cached — so a
  // player who is on it stays locked out even if the network goes afterwards.
  const board = await fetchBoard(code);
  // Unreachable, so unanswerable. Let them play rather than shutting out
  // someone who has never played; the insert at the end is refused if they had.
  if (board.source !== "remote") return false;

  const name = player.trim().toLowerCase();
  return board.standings.some((r) => r.player.toLowerCase() === name);
}
