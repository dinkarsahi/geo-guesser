/**
 * The one part of this game that needs a network.
 *
 * Everything else here is a static page: the code carries the match, and each
 * device deals its own rounds from it. But a standings table can only be
 * everyone's if the scores meet somewhere, and two phones in the same room
 * have no way of reaching each other. So finished matches are filed in one
 * Supabase table and read back out of it.
 *
 * Spoken to over its REST endpoint rather than through the client library:
 * the whole conversation is three requests, and a game that ships as a static
 * folder shouldn't carry a dependency to make them.
 *
 * The anon key is meant to be public — it is in every visitor's bundle either
 * way. What it can do is fixed by the policies on the table, which allow a
 * result to be filed and results to be read, and nothing else. In particular
 * nothing can update or delete a row, which is what makes a score final.
 */
const BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether there is a table to talk to at all. Without one the game still
 * plays: the standings fall back to what this device has seen, which is what
 * they were before there was a server.
 */
export const hasRemote = Boolean(BASE && ANON_KEY);

/** Postgres' "that row already exists" — how a second attempt at a code reads. */
export const UNIQUE_VIOLATION = "23505";

/**
 * Postgres' "that value isn't allowed in that column" — a CHECK the row didn't
 * satisfy.
 *
 * Worth a name because of one failure in particular: the tables are set up by
 * hand from `supabase/schema.sql`, so a database made before a game was added
 * still lists the old set of games and refuses a room for the new one. That is
 * a fact about the database being out of date, and it must not be reported as
 * a network that couldn't be reached — the two are fixed in entirely different
 * places, and only one of them is worth trying again.
 */
export const CHECK_VIOLATION = "23514";

/**
 * How far this device's clock is from the server's, in milliseconds.
 *
 * Nobody sets their phone by hand any more, but they are still seconds apart,
 * and a room starts on a moment written down by one player and read by four.
 * Off by a minute the wrong way and someone opens the page to a game already
 * finished. Every response carries the server's `Date`, so this is free.
 */
let skewMs = 0;

/**
 * Half a second, which is what an HTTP `Date` header loses to its own
 * granularity: it names a whole second, and the moment it stands for is
 * somewhere in the second that follows.
 */
const HEADER_ROUNDING_MS = 500;

/**
 * The clock a room runs on: this device's, corrected onto the server's.
 *
 * Only as good as the last response — a second's granularity in the header and
 * however long the reply took to arrive, so call it a second either way. Rounds
 * are thirty seconds with eight between them, which swallows that whole.
 *
 * A whole number of milliseconds, like every other clock in the language. Half
 * a round trip is not one, so the correction below leaves a fraction behind
 * about half the time, and everything measured against this clock inherits it
 * — including how long a round took, which is filed in an integer column. A
 * round that took 3716.5 ms was refused by Postgres outright, so the player's
 * score never reached the table and their round never closed for anybody else.
 */
export const serverNow = (): number => Math.round(Date.now() + skewMs);

/** A request that reached Supabase and was refused, with the reason it gave. */
export class RemoteError extends Error {
  status: number;
  /** The Postgres error code, where the failure came from Postgres. */
  code: string | undefined;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "RemoteError";
    this.status = status;
    this.code = code;
  }
}

/**
 * One PostgREST call. `path` is everything after `/rest/v1/`, filters and all.
 *
 * Network failures come back as they are — a caller that can carry on without
 * the server needs to be able to tell "refused" from "unreachable", and those
 * want handling differently.
 */
export async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!hasRemote) throw new Error("No leaderboard configured");

  const sentAt = Date.now();
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  // Taken from every reply, refused or not: a room that can't start is a worse
  // failure than a clock that's a little out, and both want the same header.
  //
  // Two corrections, because the raw header is wrong in the same direction
  // every time and a clock that's reliably slow is worse than one that's
  // merely imprecise — it makes every ten-second pause read as eleven. The
  // header is written when the reply is sent, so half the round trip has to be
  // added back; and it's rounded down to the whole second, so on average it
  // names a moment half a second before the one it stands for.
  const stamp = Date.parse(res.headers.get("date") ?? "");
  if (!Number.isNaN(stamp)) {
    const arrivedAt = Date.now();
    skewMs = stamp + HEADER_ROUNDING_MS + (arrivedAt - sentAt) / 2 - arrivedAt;
  }

  if (!res.ok) {
    // PostgREST reports its failures as JSON, but a proxy in front of it may
    // not, so a body that isn't JSON mustn't turn into a different error.
    const body = await res.json().catch(() => null);
    throw new RemoteError(
      res.status,
      body?.code,
      body?.message ?? `Leaderboard request failed (${res.status})`,
    );
  }

  // A write that didn't ask for the row back answers with an empty body — 201
  // on an insert, 204 on an update — and parsing that as JSON throws, which
  // reads all the way up as "the server couldn't be reached" over a row that
  // was filed perfectly well. So the body is read as text and only parsed if
  // there's something there.
  const body = await res.text();
  return (body ? JSON.parse(body) : undefined) as T;
}
