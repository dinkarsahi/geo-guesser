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
  /**
   * Names what a missed guess landed on, for modes where that's worth knowing:
   * being told the answer was Peru teaches half as much as also being told you
   * pointed at Bolivia. Given the raw click rather than the marker, which may
   * have been moved to stand for the country as a whole.
   */
  pickedLabel?: (click: Coord) => PickedGuess | null;
  /** What to click, for modes where it isn't just anywhere on the map. */
  hint?: string;
}

/** What a missed guess landed on, named for the player. */
export interface PickedGuess {
  /** The place itself: a country, a station. */
  name: string;
  /** Whatever the mode can add about it — its population, its money. */
  detail?: string;
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
  pickedLabel,
  hint = "Click the map to place your guess.",
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
  // Only after a miss: a round that scored full marks has already been told
  // what it landed in, by name, in the headline above.
  const picked =
    isResult && lastResult && !lastResult.hit ? pickedLabel?.(lastResult.click) : null;

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
          <span>
            {freeRun ? `Round ${roundIndex + 1}` : `Round ${roundIndex + 1}/${totalRounds}`}
          </span>
          <span className="round-score">{totalScore.toLocaleString()} pts</span>
        </div>
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
              the first thing read and always in the same place. */}
          {lastResult.hit ? (
            <p className="picked-line">
              <span className="picked-label result-hit">Spot on!</span>
              {hitLabel && <span className="picked-name">{hitLabel(target)}</span>}
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
