import type { ReactNode } from "react";
import type { Coord } from "../lib/geo";
import { formatDistance, MAX_ROUND_SCORE } from "../lib/geo";
import type { Game, Phase } from "../lib/useGame";
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
  /** Names what a full-marks guess landed in, e.g. "Italy" or "Angel". */
  hitLabel?: (target: T) => string;
}

/** Only the tail of a long free run is worth listing. */
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
  hitLabel,
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
    endRun,
    restart,
  } = game;

  const freeRun = totalRounds === null;

  if (phase === "done") {
    const maxTotal = results.length * MAX_ROUND_SCORE;
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
            {totalScore.toLocaleString()}
            <span className="summary-max"> / {maxTotal.toLocaleString()}</span>
          </p>
          {freeRun && (
            <p className="muted">
              {results.length} {results.length === 1 ? "round" : "rounds"} played
            </p>
          )}
          <ol className="summary-list" start={hidden + 1}>
            {shown.map((r, i) => (
              <li key={hidden + i}>
                <span>Round {hidden + i + 1}</span>
                <span className="muted">
                  {r.hit ? "spot on" : formatDistance(r.distanceKm)}
                </span>
                <span className="round-score">{r.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
          {hidden > 0 && (
            <p className="muted">…and {hidden} earlier {hidden === 1 ? "round" : "rounds"}.</p>
          )}
          <div className="button-row">
            <button className="btn btn-primary" onClick={restart}>
              Play again
            </button>
            <button className="btn btn-ghost" onClick={onExit}>
              Back to menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isResult = phase === "result";
  const lastRound = !freeRun && totalRounds !== null && roundIndex + 1 >= totalRounds;

  return (
    <div className="game">
      <header className="game-header">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={onExit}>
            ← Menu
          </button>
          <NightToggle night={night} onToggle={onToggleNight} />
        </div>
        <h2>{title}</h2>
        <div className="game-stats">
          <span>
            {freeRun ? `Round ${roundIndex + 1}` : `Round ${roundIndex + 1}/${totalRounds}`}
          </span>
          <span className="round-score">{totalScore.toLocaleString()} pts</span>
        </div>
      </header>

      <div className="prompt">{renderPrompt(target, phase)}</div>

      <div className="map-area">
        <div className="map-wrap">
          {renderMap({
            onGuess: submitGuess,
            guess: currentGuess,
            answer: isResult && lastResult ? lastResult.answer : null,
            disabled: isResult,
          })}
        </div>

        {/* Fact card overlaid on the map, beside the revealed dots. */}
        {isResult && renderResultExtra && (
          <div className="fact-overlay">{renderResultExtra(target)}</div>
        )}
      </div>

      {!isResult && !currentGuess && (
        <p className="hint muted">Click the map to place your guess.</p>
      )}

      {isResult && lastResult && (
        <div className="result-panel">
          <div className="result-headline">
            {lastResult.hit ? (
              <span className="result-distance result-hit">
                Spot on{hitLabel ? ` — ${hitLabel(target)}` : ""}
              </span>
            ) : (
              <span className="result-distance">
                {formatDistance(lastResult.distanceKm)} away
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
            {freeRun && (
              <button className="btn btn-ghost" onClick={endRun}>
                End run
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-exported for convenience so modes can type their coord usage.
export type { Coord };
