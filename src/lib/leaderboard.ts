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
 * What became of a finished match offered to the table.
 *
 * A name that's already up there used to mean one thing — you, arriving twice —
 * because a code was private and the four people on it knew each other. On a
 * daily code everyone in the world shares a table, so it now means one of two
 * quite different things, and telling a player the wrong one either locks them
 * out of a game they never played or shows them a stranger's score as theirs.
 */
export type Filing =
  | { status: "filed"; board: Board }
  | { status: "name-taken" };

const localBoard = (code: string, source: BoardSource): Filing => ({
  status: "filed",
  board: { standings: rankResults(loadResults(code)), source },
});

/**
 * Files a finished match and hands back the table it joined.
 *
 * The unique index on (code, player) is what makes a code one attempt: a
 * second result for a name is refused by Postgres rather than by us, so it
 * holds however the player got there.
 */
export async function publishResult(result: SharedResult): Promise<Filing> {
  const row: Row = { ...result, code: key(result.code) };
  if (!hasRemote) {
    saveResult(row);
    return localBoard(row.code, "local");
  }

  // Read before filing, since filing is what would make it true.
  const mine = playedHere(row.code, row.player);

  try {
    await rest(TABLE, { method: "POST", body: JSON.stringify(row) });
  } catch (e) {
    if (e instanceof RemoteError && e.code === UNIQUE_VIOLATION) {
      // Ours, if this device filed it: a re-render or the refresh button, and
      // the score already up is the one that counts. Somebody else's otherwise
      // — claimed while this match was being played — and the player needs
      // another name rather than a stranger's result handed to them.
      //
      // Asked again as well as before the write, because the row that refused
      // this one may be one of ours filed in the meantime. Getting this wrong
      // means telling a player their own name was stolen from them.
      if (!mine && !playedHere(row.code, row.player)) return { status: "name-taken" };
      saveResult(row);
      return { status: "filed", board: await fetchBoard(row.code) };
    }
    // Refused for some other reason, or never arrived. Kept here either way, so
    // the lock survives a network that doesn't answer.
    saveResult(row);
    return localBoard(row.code, "offline");
  }

  saveResult(row);
  return { status: "filed", board: await fetchBoard(row.code) };
}

/** Whether a player can start this code, and if not, which of the two reasons. */
export type Entry = "ok" | "played" | "name-taken";

/**
 * Whether this player may have a go at this code.
 *
 * Two separate questions, asked in the order that keeps them honest. Has *this
 * device* finished it under this name — answered instantly and without a
 * network, so that pulling the plug can't buy a second attempt. Then: is the
 * name spoken for on today's table, which on a shared daily code is usually
 * somebody else entirely and wants saying so, since the answer is "pick another
 * name", not "you've already played".
 */
export async function checkEntry(code: string, player: string): Promise<Entry> {
  if (playedHere(key(code), player)) return "played";
  if (!hasRemote) return "ok";

  // The whole board rather than a query for the one name: a name is free text
  // and `ilike` would read a % or an _ in it as a wildcard, matching someone
  // else. It's the same single request, and it leaves the board cached.
  const board = await fetchBoard(code);
  // Unreachable, so unanswerable. Let them play rather than shutting out
  // someone who has never played; the insert at the end is refused if they had.
  if (board.source !== "remote") return "ok";

  const name = player.trim().toLowerCase();
  return board.standings.some((r) => r.player.toLowerCase() === name) ? "name-taken" : "ok";
}
