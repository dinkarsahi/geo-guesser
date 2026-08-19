import { useCallback, useEffect, useRef, useState } from "react";
import type { Match } from "../lib/match";
import { cleanName, modeTitle } from "../lib/match";
import { publishResult, type Board } from "../lib/leaderboard";
import { loadName, saveName } from "../lib/playerName";
import { hasRemote } from "../lib/supabase";
import Standings from "./Standings";

interface MatchResultProps {
  match: Match;
  score: number;
  ms: number;
}

/**
 * The table a match ends on.
 *
 * The score goes up as the screen is built and the whole table comes back, so
 * two people finishing within a second of each other both see the other — the
 * thing that couldn't happen while the standings were only ever this device's.
 * Whoever loads last still sees everyone; whoever loads first can ask again.
 */
export default function MatchResult({ match, score, ms }: MatchResultProps) {
  const [board, setBoard] = useState<Board | null>(null);
  // Distinct from `board === null`: that is the first send, this is a reload
  // over a table already on screen, which shouldn't blank it out. True from
  // the start, because the first send is under way before the first paint.
  // True from the start, because the first send is under way before the first
  // paint — unless there is no name to send under, in which case nothing is on
  // its way and the screen is waiting on the player rather than the network.
  const [checking, setChecking] = useState(() => !!match.player.trim());
  // The name the score is actually up under, which is only the name the match
  // was played under until somebody else claims it first.
  const [filedAs, setFiledAs] = useState(match.player);
  // Set when the table refused the name. A whole day's players share one code
  // now, so this is a race anyone can lose between starting and finishing.
  const [taken, setTaken] = useState<string | null>(null);
  const [rename, setRename] = useState(match.player);
  /**
   * The name a score with none yet is waiting on.
   *
   * Today's round asks for nothing on the way in — it deals the round the
   * moment somebody arrives — so the name is asked for here, where there is a
   * score to put it to. That ordering is better than it sounds: a player who
   * starts and wanders off is never asked to name themselves for a game they
   * didn't finish, and nobody types anything before they know whether it was
   * worth typing. Seeded with whatever this device last played under, so the
   * regular is one press from done.
   */
  const [claim, setClaim] = useState(() => match.player.trim() || loadName());

  const send = useCallback(
    (player: string) => {
      publishResult({ code: match.code, player, score, ms })
        .then((filing) => {
          if (filing.status === "name-taken") {
            setTaken(player);
            return;
          }
          setTaken(null);
          setFiledAs(player);
          setBoard(filing.board);
          // Remembered only once it's stuck, so the next game doesn't open on a
          // name that's already been refused.
          saveName(player);
        })
        .finally(() => setChecking(false));
    },
    [match.code, score, ms],
  );

  // Filed the moment this renders, which is also the moment the score becomes
  // final — this panel only ever draws on a finished match.
  //
  // Once, and guarded by a ref rather than by the effect's dependencies: React
  // runs effects twice in development, and two of these racing each other both
  // read the table before either has written to it, so the one that loses tells
  // the player their own name was taken by a stranger. The table would refuse
  // the second row anyway; what it can't do is tell us which of the two we are.
  const sent = useRef<string | null>(null);
  useEffect(() => {
    // A match that arrived without a name waits for one — see `claim`. Nothing
    // is filed until the player has said who they are, which also means the
    // table's "already played" check can't fire against a blank.
    if (!match.player.trim()) return;
    const once = `${match.code}|${match.player}`;
    if (sent.current === once) return;
    sent.current = once;
    send(match.player);
  }, [send, match.code, match.player]);

  /** The same send, from a button: the wait is this screen's to show again. */
  const again = (player: string) => {
    setChecking(true);
    send(player);
  };

  /** Still waiting to be told whose score this is. */
  const unnamed = !filedAs.trim();
  const claimed = cleanName(claim).trim();

  const standings = board?.standings ?? [];
  const mine = standings.find((r) => r.player.toLowerCase() === filedAs.toLowerCase());
  const contested = standings.length > 1;
  const renamed = cleanName(rename).trim();

  return (
    <div className="match-result">
      {/* No time at the top of this any more. Today's round isn't played
          against a clock, so how long it took is not something the player was
          marked on — printed beside the score it read as though it were. It is
          still filed with the score, where it does one quiet job: two people on
          the same mark have to be ranked in some order, and the one who got
          there sooner is a better order than none. */}

      {/* The game rather than the code: everyone who played today's {mode} is
          on this one table however they chose to draw the map, and the code
          behind it is no longer something a player ever sees. */}
      <p className="match-line-label">Today's {modeTitle(match.mode)}</p>

      {/* Whose score is this? Asked once, here, and only of somebody who has
          actually finished. The score is already made and cannot be lost by
          getting this wrong — worst case the name is taken and the box below
          asks for another. */}
      {unnamed && taken === null && (
        <div className="match-rename">
          <p className="match-hint">
            Put your name to it and it goes on today's board.
          </p>
          <input
            className="h2h-name-input"
            value={claim}
            onChange={(e) => setClaim(cleanName(e.target.value))}
            placeholder="Your name"
            maxLength={16}
            aria-label="Your name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && claimed && !checking && again(claimed)}
          />
          <button
            className="btn btn-primary"
            disabled={!claimed || checking}
            onClick={() => again(claimed)}
          >
            {checking ? "Sending…" : "Put my score up"}
          </button>
        </div>
      )}

      {/* The score is made and can't be lost — it just needs a free name to go
          up under, and asking here beats telling the player they've already
          played a game they've only just finished. */}
      {taken !== null && (
        <div className="match-rename">
          <p className="match-hint">
            Somebody else is already playing as <strong>{taken}</strong> today. Your score
            is safe — put another name to it and it goes up.
          </p>
          <input
            className="h2h-name-input"
            value={rename}
            onChange={(e) => setRename(cleanName(e.target.value))}
            placeholder="Another name"
            maxLength={16}
            aria-label="Another name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && renamed && !checking && again(renamed)}
          />
          <button
            className="btn btn-primary"
            disabled={!renamed || checking || renamed.toLowerCase() === taken.toLowerCase()}
            onClick={() => again(renamed)}
          >
            {checking ? "Sending…" : "Put my score up"}
          </button>
        </div>
      )}

      {contested && <Standings results={standings} you={filedAs} />}

      {contested && (
        <p className="match-verdict match-verdict-result">
          {standings[0] === mine
            ? `You're leading on ${standings[0].score.toLocaleString()}`
            : `${standings[0].player} leads on ${standings[0].score.toLocaleString()}`}
        </p>
      )}

      {!contested && board !== null && (
        <p className="muted match-hint">
          {board.source === "offline"
            ? "Your score is saved but the leaderboard is out of reach — it'll go up next time you're online."
            : hasRemote
              ? `Nobody else has finished today's ${modeTitle(match.mode)} yet. Check back when they have.`
              : `No shared leaderboard is set up, so this table only holds games finished on this device.`}
        </p>
      )}

      {board === null && taken === null && !unnamed && (
        <p className="muted match-hint">Sending your score up…</p>
      )}

      {/* The one button worth having on this screen: two players who finish
          together each want to know what the other got, and the answer is a
          second or two away rather than a page reload away — which used to
          hand back a fresh game instead of an answer. */}
      {board !== null && (
        <button className="btn btn-ghost" onClick={() => again(filedAs)} disabled={checking}>
          {checking ? "Checking…" : "Refresh standings"}
        </button>
      )}
    </div>
  );
}
