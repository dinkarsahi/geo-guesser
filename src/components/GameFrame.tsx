import type { ReactNode } from "react";
import type { Coord } from "../lib/geo";
import { finalScore, formatDistance, MAX_ROUND_SCORE } from "../lib/geo";
import type { Match } from "../lib/match";
import { MATCH_GRACE_MS, MATCH_ROUND_MS } from "../lib/match";
import type { Game, Phase } from "../lib/useGame";
import { useRoom } from "../lib/useRoom";
import MatchResult from "./MatchResult";
import type { GuessMapProps } from "./mapTypes";
import NightToggle from "./NightToggle";
import RoomResult from "./RoomResult";
import RoomReveal from "./RoomReveal";

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
  /**
   * What a round was, in a few words, for the list at the end: "Argentina",
   * "Baker Street", "Buenos Aires, Argentina".
   *
   * Without it the summary is five distances against five numbered rounds, and
   * a player who wants to know which one they threw away has nothing to go on
   * — least of all in a mode where the question was a flag or a number, and the
   * answer is the only part of it worth remembering.
   */
  answerLabel?: (target: T) => string;
  /** What to click, for modes where it isn't just anywhere on the map. */
  hint?: string;
  /**
   * What a round asks you to find, in one word: a city, a station. Only wanted
   * by modes that pay full marks within a radius, where the verdict has to say
   * what you were close enough to.
   */
  targetNoun?: string;
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
  answerLabel,
  hint = "Click the map to place your guess.",
  targetNoun = "place",
  match,
}: GameFrameProps<T>) {
  const {
    target,
    targets,
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
    roundClosesAt,
    totalMs,
  } = game;

  // A room's rounds go up as they're marked and the table comes back with them.
  // Called for every game, room or not — it does nothing outside one, and a
  // hook can't be asked for halfway down a component.
  const room = useRoom(match, results, phase);
  // A room runs to a timetable, which is what everything below tests for: no
  // "next round" button, a countdown in its place, and its own results screen.
  const timetabled = match?.startAt !== undefined;

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
              so a player's row reads as the number they were just given. A
              room counts itself up instead: its table is the whole room's
              rounds, filed as they were played, and it ends where it ends. */}
          {match && timetabled && <RoomResult match={match} room={room} />}
          {match && !timetabled && <MatchResult match={match} score={mark} ms={totalMs} />}
          {/* Named columns, because the middle one is a distance in one mode, a
              count of stops in another and "out of time" in any of them, and a
              bare figure alongside a bare score invites the two to be read as
              the same kind of thing. */}
          <div className="summary-head" aria-hidden="true">
            <span>Round</span>
            <span>Answer</span>
            <span>Your guess</span>
            <span className="summary-head-score">Score</span>
          </div>
          <ol className="summary-list" start={hidden + 1}>
            {shown.map((r, i) => (
              <li key={hidden + i}>
                <span>Round {hidden + i + 1}</span>
                <span className="summary-answer">
                  {answerLabel?.(targets[hidden + i]) ?? "—"}
                </span>
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
  // What the clock took off this round. Always zero outside a match, where
  // there's no clock on a round to take anything.
  const timeCost = lastResult ? lastResult.accuracy - lastResult.score : 0;
  // The guess was worth everything it could be worth, whether by landing in
  // the answer's own area or by landing near enough to a point one.
  const fullMarks = lastResult !== null && lastResult.accuracy >= MAX_ROUND_SCORE;
  // Full marks that were earned by the radius rather than by landing on the
  // answer. Said out loud, because otherwise it looks like the game rounded
  // something in the player's favour and won't say what: the distance is right
  // there on the map, and a hundred beside it wants explaining. Below a
  // kilometre there's nothing to explain — they clicked on the place.
  const nearNote =
    fullMarks && lastResult && !lastResult.hit && lastResult.distanceKm >= 1
      ? `You were close enough to the ${targetNoun} — just ` +
        `${formatDistance(lastResult.distanceKm)} away!`
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
          {/* A room's code is worth keeping on screen — it's what somebody
              still trying to get in will ask you for. A daily game's isn't
              shown anywhere and isn't the player's business. */}
          {match && (
            <span className="match-code-tag">
              {match.kind === "room" ? match.code : "Today's round"}
            </span>
          )}
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
              below it, and that's near enough the place just clicked.

              On the mark rather than on the hit, because a click can be worth
              full marks without landing on the answer: a city has a radius
              round it, and thirty kilometres from the centre of one is still
              knowing where it is. Read off the accuracy so that a match, where
              the clock takes its cut afterwards, still says so — the guess was
              perfect, and the line below explains what the seconds cost. */}
          {fullMarks ? (
            <p className="picked-line">
              <span className="result-hit result-verdict">Spot on!</span>
              {nearNote && <span className="result-near">{nearNote}</span>}
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
                far out the guess was, and what it scored — and not even that
                where the verdict has already said it, which is the one case
                the distance is part of the good news rather than the bad. */}
            {!lastResult.hit && !nearNote && (
              <span className="result-distance">
                {lastResult.label ?? `${formatDistance(lastResult.distanceKm)} away`}
              </span>
            )}
            <span className="result-points">
              +{lastResult.score.toLocaleString()} pts
            </span>
          </div>
          {/* Where the clock took some of it, the sum is shown rather than the
              answer alone. A player who pointed straight at the place and was
              handed 70 has been marked on two things and told about one of
              them, and reads it as a worse guess than they made. */}
          {timeCost > 0 && (
            <p className="result-timecost">
              <span className="result-timecost-sum">
                {lastResult.accuracy.toLocaleString()} for the guess
                {" − "}
                {timeCost.toLocaleString()} for the clock
              </span>
              <span className="muted result-timecost-note">
                Every round is free for its first{" "}
                {Math.round(MATCH_GRACE_MS / 1000)} seconds, then costs you
                slowly.
              </span>
            </p>
          )}
          {/* In a room there is nothing to press: the round turns over for
              everybody at once, so what goes here is who it's still waiting on
              and what the question just answered was worth to each of them. */}
          {timetabled && match && roundClosesAt !== null ? (
            <RoomReveal
              code={match.code}
              closesAt={roundClosesAt}
              round={roundIndex + 1}
              lastRound={lastRound}
              mode={match.mode}
              board={room.board}
              you={match.player}
            />
          ) : (
            <div className="button-row">
              <button className="btn btn-primary" onClick={next}>
                {lastRound ? "See results" : "Next round →"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Re-exported for convenience so modes can type their coord usage.
export type { Coord };
