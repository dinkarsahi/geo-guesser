import type { ModeId } from "../modes/ModeProps";
import {
  MATCH_REVEAL_MS,
  MATCH_ROUNDS,
  MATCH_ROUND_MS,
  roomCode,
  type SharedResult,
} from "./match";
import { hasRemote, rest, RemoteError, serverNow, UNIQUE_VIOLATION } from "./supabase";

/**
 * A room: a game against people you know, played at the same time.
 *
 * The daily games need no server to be the same game for everyone — the code
 * is worked out from the date, and each device deals its own rounds. A room
 * can't be: it exists before it starts, it has a list of who's in it, and above
 * all it has to begin for everybody at once. So a room is three small tables
 * and a shared clock.
 *
 * What travels between the players is only the moment the first round opens.
 * Everything after that each device works out for itself — round two opens a
 * fixed distance after round one, and the rounds themselves come from the code
 * as they always have. So there is no live connection to drop, no lobby to
 * stay in, and a phone that locks mid-game rejoins the room where the room is.
 *
 * A room's code is dead once its rounds are: there is one table at the end
 * saying who won, and no standings that go on afterwards.
 */
export interface Room {
  code: string;
  mode: ModeId;
  /** The host's map, since a room has to be one contest and not four. */
  flat: boolean;
  borders: boolean;
  host: string;
  /** When round one opens, on the shared clock. Null while the room waits. */
  startAt: number | null;
}

/** How the tables name what `Room` calls things. */
interface RoomRow {
  code: string;
  mode: ModeId;
  flat: boolean;
  borders: boolean;
  host: string;
  starts_at: string | null;
}

const ROOMS = "duel_rooms";
const PLAYERS = "duel_players";
const SCORES = "duel_scores";

/**
 * How long everyone gets between the host pressing start and round one opening.
 *
 * Generous on purpose: it's the only moment in the game where every screen has
 * to catch up with the same fact, and a phone that polls a second and a half
 * after the button was pressed still wants time to draw the countdown, let its
 * player look up, and be looking at round one when it opens.
 */
export const LOBBY_LEAD_MS = 15_000;

/** One round and the pause on its answer — the distance between round openings. */
export const ROUND_PERIOD_MS = MATCH_ROUND_MS + MATCH_REVEAL_MS;

/** When the last round's reveal ends, and with it the room. */
export const roomEndsAt = (startAt: number) => startAt + MATCH_ROUNDS * ROUND_PERIOD_MS;

const toRoom = (row: RoomRow): Room => ({
  code: row.code,
  mode: row.mode,
  flat: row.flat,
  borders: row.borders,
  host: row.host,
  startAt: row.starts_at === null ? null : Date.parse(row.starts_at),
});

/** Where a room stands, which is the only thing every screen here asks. */
export type RoomPhase = "waiting" | "starting" | "playing" | "over";

export function roomPhase(room: Room, now = serverNow()): RoomPhase {
  if (room.startAt === null) return "waiting";
  if (now < room.startAt) return "starting";
  return now < roomEndsAt(room.startAt) ? "playing" : "over";
}

/**
 * The names this device is playing under in each room.
 *
 * A room refuses a name that's already in it, which is right — two Sams in one
 * game is two names on one table. But it must not refuse *you* your own name
 * when you reload the page, so the rooms this device has joined are written
 * down and a clash with one of them reads as a rejoin.
 */
const MINE_KEY = "spoton.rooms.v1";

type Mine = Record<string, string>;

function readMine(): Mine {
  try {
    const raw = localStorage.getItem(MINE_KEY);
    return raw ? (JSON.parse(raw) as Mine) : {};
  } catch {
    return {};
  }
}

const nameHere = (code: string) => readMine()[code];

function rememberName(code: string, player: string) {
  const mine = readMine();
  mine[code] = player.trim().toLowerCase();
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify(mine));
  } catch {
    /* storage off; a rejoin will just have to pick another name */
  }
}

/** Rooms need somewhere to be. Said once here so every screen can ask. */
export const canPlayRooms = hasRemote;

/**
 * Opens a room and hands back the code to read out.
 *
 * The code is drawn rather than worked out, so it can collide with a room
 * already open — one chance in 28 million, but the failure is silent and
 * shared (two rooms, one table), so it's caught by the primary key and tried
 * again rather than trusted.
 */
export async function createRoom(
  mode: ModeId,
  setup: { flat: boolean; borders: boolean },
  host: string,
): Promise<Room> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const row: RoomRow = {
      code: roomCode(mode),
      mode,
      flat: setup.flat,
      borders: setup.borders,
      host: host.trim(),
      starts_at: null,
    };
    try {
      await rest(ROOMS, { method: "POST", body: JSON.stringify(row) });
      rememberName(row.code, row.host);
      await joinRoom(row.code, row.host);
      return toRoom(row);
    } catch (e) {
      if (e instanceof RemoteError && e.code === UNIQUE_VIOLATION) continue;
      throw e;
    }
  }
  throw new Error("Couldn't open a room — try again.");
}

/** The room a code names, or null if there isn't one (or isn't any more). */
export async function fetchRoom(code: string): Promise<Room | null> {
  const rows = await rest<RoomRow[]>(
    `${ROOMS}?code=eq.${encodeURIComponent(code)}&select=code,mode,flat,borders,host,starts_at`,
  );
  return rows.length ? toRoom(rows[0]) : null;
}

/** Whether a name can be taken in a room, and taking it if so. */
export type Joined = "ok" | "name-taken";

export async function joinRoom(code: string, player: string): Promise<Joined> {
  try {
    await rest(PLAYERS, {
      method: "POST",
      body: JSON.stringify({ code, player: player.trim() }),
    });
  } catch (e) {
    if (e instanceof RemoteError && e.code === UNIQUE_VIOLATION) {
      // Ours if this device holds it — a reload, or the host joining the room
      // it just opened. Somebody else's otherwise, and they had it first.
      if (nameHere(code) !== player.trim().toLowerCase()) return "name-taken";
    } else {
      throw e;
    }
  }
  rememberName(code, player);
  return "ok";
}

/** Who's in the room, in the order they arrived. */
export async function fetchPlayers(code: string): Promise<string[]> {
  const rows = await rest<{ player: string }[]>(
    `${PLAYERS}?code=eq.${encodeURIComponent(code)}&select=player&order=joined_at.asc`,
  );
  return rows.map((r) => r.player);
}

/**
 * Starts the room, a few seconds from now.
 *
 * The update only takes on a room that hasn't started — the policy says so as
 * well — so two people pressing the button at once can't shunt the first round
 * out from under whoever heard about it first. What comes back is the room as
 * it actually stands, which is the one everybody plays.
 */
export async function startRoom(code: string): Promise<Room | null> {
  const at = new Date(serverNow() + LOBBY_LEAD_MS).toISOString();
  const rows = await rest<RoomRow[]>(
    `${ROOMS}?code=eq.${encodeURIComponent(code)}&starts_at=is.null` +
      `&select=code,mode,flat,borders,host,starts_at`,
    {
      method: "PATCH",
      body: JSON.stringify({ starts_at: at }),
      headers: { Prefer: "return=representation" },
    },
  );
  // Nothing changed: somebody else got there first, and their moment is the
  // one that counts.
  return rows.length ? toRoom(rows[0]) : await fetchRoom(code);
}

/**
 * Files a round the moment it's marked, rather than the whole game at the end.
 *
 * It's what lets the room see itself: between rounds everyone is shown where
 * they stand, which is the thing that makes playing at the same time worth
 * doing at all. It also means a player who walks off after round three still
 * counts for the three they played.
 */
export async function postRound(
  code: string,
  player: string,
  round: number,
  score: number,
  ms: number,
): Promise<void> {
  try {
    await rest(SCORES, {
      method: "POST",
      body: JSON.stringify({ code, player: player.trim(), round, score, ms }),
    });
  } catch (e) {
    // A round already filed is a re-render or a reload, and the score that's
    // up is the one that counts. Anything else is a round that didn't make it,
    // which costs this player those points and mustn't stop the game.
    if (!(e instanceof RemoteError && e.code === UNIQUE_VIOLATION)) throw e;
  }
}

/** One player's room, as the table at the end reads it. */
export interface RoomStanding extends SharedResult {
  /** Rounds they've filed so far, so the board can be read mid-game. */
  rounds: number;
}

/**
 * Where the room stands: every player, marked on the same average-of-100 as
 * every other game here.
 *
 * Everyone in the room is counted, including whoever has filed nothing — a
 * blank line under your name mid-game is information, and a player who leaves
 * shouldn't quietly vanish from the table they were losing on.
 */
export async function fetchRoomBoard(code: string): Promise<RoomStanding[]> {
  const [rows, players] = await Promise.all([
    rest<{ player: string; score: number; ms: number }[]>(
      `${SCORES}?code=eq.${encodeURIComponent(code)}&select=player,score,ms&limit=500`,
    ),
    fetchPlayers(code),
  ]);

  const byName = new Map<string, RoomStanding>();
  const line = (player: string) => {
    const key = player.toLowerCase();
    let found = byName.get(key);
    if (!found) {
      found = { code, player, score: 0, ms: 0, rounds: 0 };
      byName.set(key, found);
    }
    return found;
  };

  for (const p of players) line(p);
  for (const r of rows) {
    const entry = line(r.player);
    entry.score += r.score;
    entry.ms += r.ms;
    entry.rounds += 1;
  }

  // The average round *so far*, out of 100 — the same mark every other game
  // here gives, and by the last round the same mark the player is shown above
  // this table.
  //
  // Over the rounds played rather than all five, because this is read during
  // the game as much as after it: a player who has just scored 82 wants to see
  // 82, not the 16 that 82 out of a game they're a fifth of the way through
  // works out at. Everyone is divided by the same number — the furthest anyone
  // has got — so the lines stay comparable, and a round nobody filed for
  // themselves still costs them against the players who did.
  const played = Math.max(1, ...[...byName.values()].map((s) => s.rounds));
  const standings = [...byName.values()].map((s) => ({
    ...s,
    score: Math.round(s.score / played),
  }));
  return standings.sort((a, b) => b.score - a.score || a.ms - b.ms);
}
