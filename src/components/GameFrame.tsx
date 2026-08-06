import type { ReactNode } from "react";
import type { Coord } from "../lib/geo";
import { finalScore, formatDistance, MAX_ROUND_SCORE } from "../lib/geo";
import type { Match } from "../lib/match";
import { MATCH_ROUND_MS } from "../lib/match";
import type { Game, Phase } from "../lib/useGame";
import MatchResult from "./MatchResult";
import type { GuessMapProps } from "./mapTypes";
import NightToggle from "./NightToggle";

interface GameFrameProps<T> {
  title: string;
  game: Game<T>;
  onExit: () => void;
  night: boolean;
  onToggleNight: () => void;
  /** The prompt shown to the player (city name, flag, station name…). */
  renderPrompt: (target: T, phase: Phase) => ReactNode;
  /** Renders the map, wired to the game's guess handlers. */
  renderMap: (props: Required<GuessMapProps>) => ReactNode;
  /** Optional extra content shown in the result panel (e.g. a country fact). */
  renderResultExtra?: (target: T) => ReactNode;
  /**
   * Names what a missed guess landed on, for modes where that's worth knowing:
   * being told the answer was Peru teaches half as much as also being told you
   * pointed at Bolivia. Given the raw click rather than the marker, which may
   * have been moved to stand for the country as a whole.
   */
  pickedLabel?: (click: Coord) => PickedGuess | null;
  /** What to click, for modes where it isn't just anywhere on the map. */
  hint?: string;
  /** Set when this is a head-to-head match: adds the clock and the code. */
  match?: Match;
}

/** What a missed guess landed on, named for the player. */
export interface PickedGuess {
  /** The place itself: a country, a station. */
  name: string;
  /** Whatever the mode can add about it — its population, its money. */
  detail?: string;
}

/**
 * How many rounds the summary will list before it starts hiding the early
 * ones. The longest game is ten, so nothing reaches this today — it's here so
 * that a longer game added later prints a summary rather than a scroll.
 */
const SUMMARY_LIMIT = 10;

export default function GameFrame<T>({
  title,
  game,
  onExit,
  night,
  onToggleNight,
  renderPrompt,
  renderMap,
  renderResultExtra,
  pickedLabel,
  hint = "Click the map to place your guess.",
  match,
}: GameFrameProps<T>) {
  const {
    target,
    roundIndex,
    totalRounds,
    phase,
    currentGuess,
    lastResult,
    results,
    totalScore,
    submitGuess,
    next,
    restart,
    timeLeftMs,
    totalMs,
  } = game;

  if (phase === "done") {
    // The mark for the whole game, on the same scale as each round in the list
    // below it — so the big number and the small ones can be read against one
    // another rather than being two different measures stacked up.
    const mark = finalScore(totalScore, results.length);
    const shown = results.slice(-SUMMARY_LIMIT);
    const hidden = results.length - shown.length;
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={onExit}>
              ← Menu
            </button>
            <NightToggle night={night} onToggle={onToggleNight} />
          </div>
          <h2>{title} — Results</h2>
          <span />
        </header>

        <div className="summary">
          <p className="summary-score">
            {mark}
            <span className="summary-max"> / {MAX_ROUND_SCORE}</span>
          </p>
          {/* The leaderboard is handed the same mark that's printed above it,
              so a player's row reads as the number they were just given. */}
          {match && <MatchResult match={match} score={mark} ms={totalMs} />}
          <ol className="summary-list" start={hidden + 1}>
            {shown.map((r, i) => (
              <li key={hidden + i}>
                <span>Round {hidden + i + 1}</span>
                <span className="muted">
                  {r.hit ? "spot on" : r.label ?? formatDistance(r.distanceKm)}
                </span>
                <span className="round-score">{r.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
          {hidden > 0 && (
            <p className="muted">…and {hidden} earlier {hidden === 1 ? "round" : "rounds"}.</p>
          )}
          <div className="button-row">
            {/* Not offered in a match: a code is one go each, and playing it
                again would deal the same five rounds — now known — for a score
                the leaderboard has already refused to take. */}
            {!match && (
              <button className="btn btn-primary" onClick={restart}>
                Play again
              </button>
            )}
            <button className={`btn ${match ? "btn-primary" : "btn-ghost"}`} onClick={onExit}>
              Back to menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isResult = phase === "result";
  const lastRound = roundIndex + 1 >= totalRounds;
  // Only after a miss, and only when there was a click to speak of: a round
  // that scored full marks has already been told what it landed in, and one
  // that ran out of time never landed anywhere.
  const picked =
    isResult && lastResult && !lastResult.hit && lastResult.click
      ? pickedLabel?.(lastResult.click)
      : null;

  // A solid bar across the top, and the map gets every pixel below it. The bar
  // holds what you need to see at all times, so nothing has to sit on the map
  // and hide the part of the world you were about to click.
  return (
    <div className="game game-play">
      <header className="game-topbar">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={onExit}>
            ← Menu
          </button>
          <NightToggle night={night} onToggle={onToggleNight} />
          <h2>{title}</h2>
        </div>
        <div className="prompt">{renderPrompt(target, phase)}</div>
        <div className="game-stats">
          <span>Round {roundIndex + 1}/{totalRounds}</span>
          <span className="round-score">{totalScore.toLocaleString()} pts</span>
          {/* The seconds sit with the score rather than over the clock itself,
              where on a narrow window they'd be printed across the code. */}
          {timeLeftMs !== null && (
            <span className={`round-clock-count${timeLeftMs <= 10_000 ? " is-urgent" : ""}`}>
              {Math.ceil(timeLeftMs / 1000)}s
            </span>
          )}
          {match && <span className="match-code-tag">{match.code}</span>}
        </div>
        {/* The clock itself, drawn along the foot of the bar: something to read
            without looking at it, straight under whatever you were looking at. */}
        {timeLeftMs !== null && (
          <div className={`round-clock${timeLeftMs <= 10_000 ? " is-urgent" : ""}`}>
            <div
              className="round-clock-bar"
              style={{ width: `${(timeLeftMs / MATCH_ROUND_MS) * 100}%` }}
            />
          </div>
        )}
      </header>

      <div className="map-layer">
        {renderMap({
          onGuess: submitGuess,
          // A guess that landed inside the right country is the answer, so it
          // isn't drawn as somewhere separate. Left in, it becomes a second pin
          // with a line running off to the country's centre — the picture of a
          // near miss, over a round that scored full marks.
          guess: isResult && lastResult?.hit ? null : currentGuess,
          answer: isResult && lastResult ? lastResult.answer : null,
          disabled: isResult,
        })}
      </div>

      {!isResult && !currentGuess && (
        <p className="hint muted hud">{hint}</p>
      )}

      {isResult && lastResult && (
        // Read top to bottom it's the round in the order it happened: what you
        // picked, what it actually was, and only then how that scored. The
        // number last, because it means nothing until you've read the two
        // places it was measured between.
        <div className="result-panel hud">
          {/* Full marks and a miss take the same row, so the verdict is always
              the first thing read and always in the same place. Nothing needs
              naming after "Spot on!" — the answer is named in full directly
              below it, and on a hit that's the place just clicked. */}
          {lastResult.hit ? (
            <p className="picked-line">
              <span className="result-hit result-verdict">Spot on!</span>
            </p>
          ) : (
            picked && (
              <p className="picked-line">
                <span className="picked-label">You picked</span>
                <span className="picked-name">{picked.name}</span>
                {picked.detail && <span className="picked-detail">{picked.detail}</span>}
              </p>
            )
          )}
          {renderResultExtra && (
            <div className="fact-panel">{renderResultExtra(target)}</div>
          )}
          <div className="result-headline">
            {/* The verdict has been given at the top; all this line owes is how
                far out the guess was, and what it scored. */}
            {!lastResult.hit && (
              <span className="result-distance">
                {lastResult.label ?? `${formatDistance(lastResult.distanceKm)} away`}
              </span>
            )}
            <span className="result-points">
              +{lastResult.score.toLocaleString()} pts
            </span>
          </div>
          <div className="button-row">
            <button className="btn btn-primary" onClick={next}>
              {lastRound ? "See results" : "Next round →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-exported for convenience so modes can type their coord usage.
export type { Coord };
