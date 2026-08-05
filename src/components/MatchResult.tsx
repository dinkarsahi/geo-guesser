import { useState } from "react";
import type { Match } from "../lib/match";
import { formatDuration, parseResultLine, resultLine } from "../lib/match";

interface MatchResultProps {
  match: Match;
  score: number;
  ms: number;
}

/**
 * How a match is settled when the two players' devices have never met.
 *
 * Each end finishes with a line naming its code, its score and its time. Send
 * it over; paste theirs in; the winner falls out of the two. The code is
 * carried along so that comparing scores from two different games — the one
 * mistake this arrangement invites — is caught rather than quietly reported as
 * a result.
 */
export default function MatchResult({ match, score, ms }: MatchResultProps) {
  const mine = resultLine(match.code, score, ms);
  const [copied, setCopied] = useState(false);
  const [theirs, setTheirs] = useState("");

  const copy = () => {
    navigator.clipboard?.writeText(mine).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  };

  const parsed = theirs.trim() ? parseResultLine(theirs) : null;
  const sameGame = parsed?.code === match.code;

  return (
    <div className="match-result">
      <p className="match-line">
        <span className="match-line-label">Your time</span>
        <span className="match-line-value">{formatDuration(ms)}</span>
      </p>

      <p className="muted match-hint">
        Send this to whoever you're playing, and paste theirs back in.
      </p>
      <p className="match-share">{mine}</p>
      <div className="button-row">
        <button className="btn btn-ghost" onClick={copy}>
          {copied ? "Copied ✓" : "Copy result"}
        </button>
      </div>

      <input
        className="match-input"
        value={theirs}
        onChange={(e) => setTheirs(e.target.value)}
        placeholder="Paste their result to compare"
        aria-label="Their result"
      />

      {theirs.trim() && !parsed && (
        <p className="muted match-verdict">That doesn't look like a result line.</p>
      )}
      {parsed && !sameGame && (
        <p className="muted match-verdict">
          That's game {parsed.code}, not {match.code} — different rounds, so the scores
          can't be compared.
        </p>
      )}
      {parsed && sameGame && (
        <p className="match-verdict match-verdict-result">{verdict(score, ms, parsed.score, parsed.ms)}</p>
      )}
    </div>
  );
}

/** Who won, and by what. Level scores go to whoever was quicker about it. */
function verdict(score: number, ms: number, theirScore: number, theirMs: number): string {
  if (score !== theirScore) {
    const margin = Math.abs(score - theirScore).toLocaleString();
    return score > theirScore ? `You win by ${margin} pts` : `You lose by ${margin} pts`;
  }
  if (ms !== theirMs) {
    return ms < theirMs
      ? `Level on points — you win on time, ${formatDuration(ms)} to ${formatDuration(theirMs)}`
      : `Level on points — you lose on time, ${formatDuration(ms)} to ${formatDuration(theirMs)}`;
  }
  return "Dead level, down to the second.";
}
