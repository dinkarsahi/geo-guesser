import type { SharedResult } from "./match";

/**
 * The version is in the key because the marking has changed: a round used to
 * pay up to 150 and now pays up to 100. Scores from before that can't share a
 * table with scores from after it, and there's nothing to salvage in a handful
 * of local games, so the old ones are simply left behind.
 */
const KEY = "spoton.results.v2";

/**
 * What this device has seen of each code, kept between visits.
 *
 * The standings proper live in Supabase now, so this is no longer where the
 * table comes from — it's the copy that lets the results screen draw when the
 * network doesn't answer, and the record of which codes have been finished
 * here. That second job is the one that matters most: a player who has already
 * had their go must not get another by pulling the plug and reloading.
 */
type Store = Record<string, SharedResult[]>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    // Storage off, or something in there we didn't write. Either way the table
    // starts empty rather than the results screen failing to draw.
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* see above */
  }
}

/** Everything on file here for a code, in no particular order. */
export function loadResults(code: string): SharedResult[] {
  const kept = read()[code];
  return Array.isArray(kept) ? kept : [];
}

/**
 * Whether this device has a finished result for a code under a name.
 *
 * Asked before a match starts, and answered without a network so that being
 * offline can't be a way of getting a second attempt.
 */
export function playedHere(code: string, player: string): boolean {
  const key = player.trim().toLowerCase();
  return loadResults(code).some((r) => r.player.toLowerCase() === key);
}

/**
 * Files a result under its code, keeping one per player — and keeping the
 * *first*, not the best. A code is one attempt per player now, so a second
 * score arriving for a name is a replay that shouldn't have happened, and the
 * table has to read the same here as it does on the server, which refuses the
 * second row outright.
 */
export function saveResult(result: SharedResult): SharedResult[] {
  const store = read();
  const kept = loadResults(result.code);
  const key = result.player.toLowerCase();
  const next = kept.some((r) => r.player.toLowerCase() === key) ? kept : [...kept, result];
  store[result.code] = next;
  write(store);
  return next;
}

/**
 * Takes the server's word for a code: what comes back is the whole table, so
 * it replaces what was here rather than joining it. Keeps the offline copy
 * honest, and files codes played on other devices under this one — so a player
 * whose own result is already up there is locked out even before they start.
 */
export function cacheResults(code: string, results: SharedResult[]) {
  const store = read();
  store[code] = results;
  write(store);
}
