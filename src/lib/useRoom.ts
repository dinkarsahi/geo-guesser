import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRoomBoard, postRound, type RoomStanding } from "./duel";
import { MATCH_ROUNDS, type Match } from "./match";
import { serverNow } from "./supabase";
import type { Phase, RoundResult } from "./useGame";

/**
 * Milliseconds until a moment on the room's clock, counted down for the screen.
 *
 * Never negative: a countdown that has run out has run out, and every caller
 * here wants to show a zero rather than a minus.
 */
export function useCountdown(at: number | null): number {
  const [left, setLeft] = useState(() => (at === null ? 0 : Math.max(0, at - serverNow())));

  useEffect(() => {
    if (at === null) return;
    const tick = () => setLeft(Math.max(0, at - serverNow()));
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [at]);

  return at === null ? 0 : left;
}

/**
 * The room's side of a game being played in one: rounds filed as they're
 * marked, and the table read back.
 *
 * Kept out of the mode entirely — a mode's job is to ask a question and mark
 * the answer, and it shouldn't know whether anyone else is playing. So this
 * hangs off the results the mode has already produced: every new round in that
 * list is a round to file, and every filing is an excuse to read the table
 * back, which is what puts everyone else's score on the screen between rounds.
 */
export interface RoomView {
  /** Everyone in the room, best first — null until the first round is marked. */
  board: RoomStanding[] | null;
  /** The table couldn't be reached. The game plays on; the scores are the loss. */
  offline: boolean;
  /** Every player has filed every round: nothing left to wait for. */
  settled: boolean;
  refresh: () => void;
}

/** How often the table asks again while it's waiting on somebody else's round. */
const POLL_MS = 2_000;

export function useRoom(match: Match | undefined, results: RoundResult[], phase: Phase): RoomView {
  // A daily game has no room behind it, and nothing below should happen for it.
  const room = match?.startAt === undefined ? undefined : match;
  const code = room?.code;
  const player = room?.player;

  const [board, setBoard] = useState<RoomStanding[] | null>(null);
  const [offline, setOffline] = useState(false);
  // How many rounds have been sent. A ref because filing twice is the thing to
  // avoid and a re-render mustn't be able to cause it.
  const filed = useRef(0);

  const read = useCallback(() => {
    if (!code) return;
    fetchRoomBoard(code).then(
      (b) => {
        setBoard(b);
        setOffline(false);
      },
      () => setOffline(true),
    );
  }, [code]);

  // Every round the mode has marked but not yet sent. Usually one; more only
  // if a round or two went by while the connection was down, and those are
  // worth catching up rather than losing.
  useEffect(() => {
    if (!code || !player) return;
    if (results.length <= filed.current) return;
    const from = filed.current;
    filed.current = results.length;
    (async () => {
      for (let i = from; i < results.length; i++) {
        await postRound(code, player, i + 1, results[i].score, results[i].elapsedMs);
      }
    })().then(read, () => {
      // Send them again next round rather than dropping them on the floor.
      filed.current = from;
      setOffline(true);
    });
  }, [code, player, results, read]);

  const settled =
    board !== null && board.length > 0 && board.every((s) => s.rounds >= MATCH_ROUNDS);

  // Kept asking for while the answer is up, and after the last one.
  //
  // Filing a round fetches the table straight after it, which is enough for
  // whoever answers last — everyone else's round is already in by then. It is
  // no good at all for whoever answers first, whose fetch goes out before the
  // others have even clicked, leaving them looking at a table that says they're
  // alone. The reveal is the moment the room is compared, so it's the moment
  // worth asking again through.
  useEffect(() => {
    if (!code) return;
    if (phase === "guessing") return;
    if (phase === "done" && settled) return;
    const id = setInterval(read, POLL_MS);
    return () => clearInterval(id);
  }, [code, phase, settled, read]);

  return { board, offline, settled, refresh: read };
}
