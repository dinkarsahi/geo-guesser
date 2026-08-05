import { useState } from "react";
import type { Match, SharedResult } from "../lib/match";
import { formatDuration, parseResults, rankResults, resultLine } from "../lib/match";

interface MatchResultProps {
  match: Match;
  score: number;
  ms: number;
}

/**
 * How a match is settled when the players' devices have never met.
 *
 * Everyone finishes with a line naming the code, themselves, their score and
 * their time. Send it round, paste back whatever comes in — one line per
 * player, however many there are — and the standings fall out. Results from
 * some other code are set aside rather than ranked: they answered different
 * questions, so their scores mean nothing here.
 */
export default function MatchResult({ match, score, ms }: MatchResultProps) {
  const mine: SharedResult = { code: match.code, player: match.player, score, ms };
  const line = resultLine(match.code, match.player, score, ms);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");

  const copy = () => {
    navigator.clipboard?.writeText(line).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  };

  const incoming = parseResults(pasted);
  const others = incoming.filter((r) => r.code === match.code);
  const strays = incoming.length - others.length;
  // Yours goes in first, so a name pasted back that matches yours is taken as
  // your own result coming home rather than a rival with the same name.
  const standings = rankResults([mine, ...others]);
  const contested = standings.length > 1;

  return (
    <div className="match-result">
      <p className="match-line">
        <span className="match-line-label">Your time</span>
        <span className="match-line-value">{formatDuration(ms)}</span>
      </p>

      <p className="muted match-hint">
        Send this round, and paste back everyone else's — one to a line.
      </p>
      <p className="match-share">{line}</p>
      <div className="button-row">
        <button className="btn btn-ghost" onClick={copy}>
          {copied ? "Copied ✓" : "Copy result"}
        </button>
      </div>

      <textarea
        className="match-input"
        rows={3}
        value={pasted}
        onChange={(e) => setPasted(e.target.value)}
        placeholder="Paste their results here"
        aria-label="Other players' results"
      />

      {pasted.trim() && !incoming.length && (
        <p className="muted match-verdict">Nothing in there looks like a result line.</p>
      )}
      {strays > 0 && (
        <p className="muted match-verdict">
          {strays === 1 ? "One result was" : `${strays} results were`} from a different
          code, so {strays === 1 ? "it isn't" : "they aren't"} in the table — those
          players answered different questions.
        </p>
      )}

      {contested && (
        <ol className="standings">
          {standings.map((r, i) => (
            <li
              key={`${r.player}-${i}`}
              className={`standing${r === mine ? " is-you" : ""}${i === 0 ? " is-leading" : ""}`}
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
      )}
      {contested && (
        <p className="match-verdict match-verdict-result">
          {standings[0] === mine
            ? `You're leading on ${standings[0].score.toLocaleString()}`
            : `${standings[0].player} leads on ${standings[0].score.toLocaleString()}`}
        </p>
      )}
    </div>
  );
}
