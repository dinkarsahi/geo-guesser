import { useState } from "react";
import type { Match, SharedResult } from "../lib/match";
import { formatDuration, parseResults, rankResults, resultLine } from "../lib/match";
import { saveResult } from "../lib/matchHistory";

interface MatchResultProps {
  match: Match;
  score: number;
  ms: number;
}

/**
 * The table a match ends on, and how it fills.
 *
 * Every game finished on this device is filed under its code, so the standings
 * are already there when the round ends: hand a phone round and each player's
 * score joins the table as they finish. A player on another device is the one
 * thing this can't see, so their line is pasted in once and then kept with the
 * rest.
 */
export default function MatchResult({ match, score, ms }: MatchResultProps) {
  const line = resultLine(match.code, match.player, score, ms);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [adding, setAdding] = useState(false);
  // Filed as the screen is first built, which is also the moment the score
  // becomes final — this panel only ever renders on a finished match. Saving
  // twice would be harmless anyway: the store keeps one row per player.
  const [kept, setKept] = useState<SharedResult[]>(() =>
    saveResult({ code: match.code, player: match.player, score, ms }),
  );

  const copy = () => {
    navigator.clipboard?.writeText(line).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  };

  /** Takes in whatever was pasted, keeps what belongs to this code. */
  const add = () => {
    const incoming = parseResults(pasted).filter((r) => r.code === match.code);
    let table = kept;
    for (const r of incoming) table = saveResult(r);
    setKept(table);
    setPasted("");
    setAdding(false);
  };

  const strays = pasted.trim()
    ? parseResults(pasted).filter((r) => r.code !== match.code).length
    : 0;
  const standings = rankResults(kept);
  const mine = standings.find((r) => r.player.toLowerCase() === match.player.toLowerCase());
  const contested = standings.length > 1;

  return (
    <div className="match-result">
      <p className="match-line">
        <span className="match-line-label">Your time</span>
        <span className="match-line-value">{formatDuration(ms)}</span>
      </p>

      {contested ? (
        <>
          <p className="match-line-label">Game {match.code}</p>
          <ol className="standings">
            {standings.map((r, i) => (
              <li
                key={`${r.player}-${i}`}
                className={`standing${r === mine ? " is-you" : ""}${
                  i === 0 ? " is-leading" : ""
                }`}
              >
                <span className="standing-place">{i + 1}</span>
                <span className="standing-name">
                  {r.player}
                  {r === mine && <span className="standing-you"> (you)</span>}
                </span>
                <span className="standing-time">{formatDuration(r.ms)}</span>
                <span className="standing-score">{r.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
          <p className="match-verdict match-verdict-result">
            {standings[0] === mine
              ? `You're leading on ${standings[0].score.toLocaleString()}`
              : `${standings[0].player} leads on ${standings[0].score.toLocaleString()}`}
          </p>
        </>
      ) : (
        <p className="muted match-hint">
          Nobody else has played {match.code} on this device yet. Hand it over and their
          score joins the table, or send yours on.
        </p>
      )}

      <p className="match-share">{line}</p>
      <div className="button-row">
        <button className="btn btn-ghost" onClick={copy}>
          {copied ? "Copied ✓" : "Copy result"}
        </button>
        <button className="btn btn-ghost" onClick={() => setAdding((a) => !a)}>
          {adding ? "Cancel" : "Add someone's result"}
        </button>
      </div>

      {/* For the players this device can't see: pasted once, then kept with
          the rest so the table survives the next round. */}
      {adding && (
        <>
          <textarea
            className="match-input"
            rows={3}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste their results here — one to a line"
            aria-label="Other players' results"
            autoFocus
          />
          {pasted.trim() && !parseResults(pasted).length && (
            <p className="muted match-verdict">Nothing in there looks like a result line.</p>
          )}
          {strays > 0 && (
            <p className="muted match-verdict">
              {strays === 1 ? "One result is" : `${strays} results are`} from a different
              code and won't be added — those players answered different questions.
            </p>
          )}
          <div className="button-row">
            <button
              className="btn btn-primary"
              disabled={!parseResults(pasted).some((r) => r.code === match.code)}
              onClick={add}
            >
              Add to the table
            </button>
          </div>
        </>
      )}
    </div>
  );
}
