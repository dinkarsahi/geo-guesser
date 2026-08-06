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

  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

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

  // 204, which is what a write asks for unless it asks for the row back.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
