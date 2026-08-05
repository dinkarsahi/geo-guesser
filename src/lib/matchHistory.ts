import type { SharedResult } from "./match";

const KEY = "spoton.results";

/**
 * Every result this device has played for a code, kept between visits.
 *
 * With no server there is no such thing as "everyone who has played this
 * code": a player on another device is invisible. What this can do is remember
 * every game finished here — pass a phone round four people and the table
 * fills itself.
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

/** Everything on file for a code, in no particular order. */
function loadResults(code: string): SharedResult[] {
  const kept = read()[code];
  return Array.isArray(kept) ? kept : [];
}

/**
 * Files a result under its code, keeping one per player: a second run at the
 * same code replaces the first only if it went better, so the table reads as
 * everyone's best rather than everyone's latest.
 */
export function saveResult(result: SharedResult): SharedResult[] {
  const store = read();
  const kept = loadResults(result.code);
  const key = result.player.toLowerCase();
  const held = kept.find((r) => r.player.toLowerCase() === key);
  const better =
    !held || result.score > held.score || (result.score === held.score && result.ms < held.ms);
  const next = better ? [...kept.filter((r) => r !== held), result] : kept;
  store[result.code] = next;
  write(store);
  return next;
}
