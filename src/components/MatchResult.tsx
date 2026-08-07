import { useCallback, useEffect, useRef, useState } from "react";
import type { Match } from "../lib/match";
import { cleanName, formatDuration } from "../lib/match";
import { publishResult, type Board } from "../lib/leaderboard";
import { saveName } from "../lib/playerName";
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
  const [checking, setChecking] = useState(true);
  // The name the score is actually up under, which is only the name the match
  // was played under until somebody else claims it first.
  const [filedAs, setFiledAs] = useState(match.player);
  // Set when the table refused the name. A whole day's players share one code
  // now, so this is a race anyone can lose between starting and finishing.
  const [taken, setTaken] = useState<string | null>(null);
  const [rename, setRename] = useState(match.player);

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

  const standings = board?.standings ?? [];
  const mine = standings.find((r) => r.player.toLowerCase() === filedAs.toLowerCase());
  const contested = standings.length > 1;
  const renamed = cleanName(rename).trim();

  return (
    <div className="match-result">
      <p className="match-line">
        <span className="match-line-label">Your time</span>
        <span className="match-line-value">{formatDuration(ms)}</span>
      </p>

      <p className="match-line-label">Game {match.code}</p>

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
              ? `Nobody else has finished ${match.code} yet today. Check back when they have.`
              : `Nobody else has played ${match.code} here yet — hand it over and their score joins the table.`}
        </p>
      )}

      {board === null && taken === null && (
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
