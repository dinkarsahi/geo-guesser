import { useRef, useState, type ReactNode } from "react";
import type { Coord } from "../lib/geo";
import { finalScore, formatDistance, MAX_ROUND_SCORE } from "../lib/geo";
import type { Match } from "../lib/match";
import { MATCH_GRACE_MS, MATCH_ROUND_MS } from "../lib/match";
import type { Game, Phase, RoundResult } from "../lib/useGame";
import { useRoom } from "../lib/useRoom";
import MatchResult from "./MatchResult";
import type { GuessMapProps } from "./mapTypes";
import RoomResult from "./RoomResult";
import RoomReveal from "./RoomReveal";

interface GameFrameProps<T> {
  title: string;
  game: Game<T>;
  onExit: () => void;
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
   * A line above the mark, for a round decided by something other than the
   * mode's usual rule. The tube calls "Mind the Gap!" over a round its circle
   * paid for, because the figure underneath — a count of what stands in that
   * circle — is not the number the map leads you to expect, and being told
   * which rule you are being marked by before you read it makes it an answer
   * rather than a mistake.
   *
   * Return null where the ordinary rule applied, which is nearly always: an
   * announcement made every round announces nothing.
   */
  renderScoreCall?: (target: T, result: RoundResult) => ReactNode;
  /**
   * Where the mark came from, in a sentence, for a mode whose sum the map
   * can't be read for. The tube pays for a click near the answer by how
   * crowded the circle round it is, so a round the player can see is eighteen
   * stops long is marked four — a figure that contradicts the map has to say
   * why, or it reads as the game having lost count of its own network.
   *
   * Return null on a round with nothing to explain: this is the working, not a
   * running commentary, and printed every round it stops being read.
   */
  renderScoreNote?: (target: T, result: RoundResult) => ReactNode;
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
   * What the middle column of the results table is measuring, in words. It is
   * a distance in most modes, a count of stops on the tube map and a gap on
   * the clock in the time zone game, and heading all three "Your guess" said
   * the least true thing about each of them — the column doesn't hold the
   * guess, it holds how far the guess was from being right.
   */
  measureLabel?: string;
  /**
   * That middle cell itself, for a mode with more to say in it than how far
   * out the guess was. The time zone game names what was clicked and the clock
   * it keeps — "1 hour out (Gabon, UTC−1)" — because by the time the table is
   * read the map has gone, and a column of gaps says which rounds were lost
   * without a word about what was picked instead.
   *
   * Return null to leave a round to the ordinary reading, which is what an
   * unanswered one wants: there was no click to name.
   */
  summaryMeasure?: (result: RoundResult, target: T) => ReactNode;
  /**
   * What a round asks you to find, in one word: a city, a station. Only wanted
   * by modes that pay full marks within a radius, where the verdict has to say
   * what you were close enough to.
   */
  targetNoun?: string;
  /**
   * What a round worth full marks is called. "Spot on!" everywhere by default;
   * the tube answers to its own line instead, which is the whole reason a mode
   * can say. Only the wording moves — what counts as full marks is scoring's
   * business and stays here.
   */
  fullMarksLabel?: string;
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
 * TEMPORARY — the tap cheat. Tap the question itself this many times in one
 * round and the round answers itself correctly: the flag, the population, the
 * station name, whatever is being asked. It is on the prompt rather than on a
 * key so that it works on a phone, and six because nobody reaches six by
 * accident.
 *
 * To take it out: this constant, `promptTap` below, the `onClick` on the prompt,
 * and `solveRound` in `useGame`. Nothing else knows about it.
 */
const CHEAT_TAPS = 6;

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
  renderPrompt,
  renderMap,
  renderResultExtra,
  pickedLabel,
  renderScoreCall,
  renderScoreNote,
  answerLabel,
  hint = "Click the map to place your guess.",
  measureLabel = "Distance to destination",
  summaryMeasure,
  targetNoun = "place",
  fullMarksLabel = "Spot on!",
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
    startingInMs,
    firstRoundAt,
    roundClosesAt,
    totalMs,
    solveRound,
  } = game;

  // A room's rounds go up as they're marked and the table comes back with them.
  // Called for every game, room or not — it does nothing outside one, and a
  // hook can't be asked for halfway down a component.
  const room = useRoom(match, results, phase);
  // The result panel stands over the middle of the map, which is often exactly
  // where the answer is — so it can be folded down to a bar. Kept across rounds
  // rather than reset with each one: a player who wants the reveal uncovered
  // wants it uncovered every time, and having to press it again each round is
  // the thing they were trying to get away from.
  const [panelFolded, setPanelFolded] = useState(false);
  // TEMPORARY — the tap cheat's counter. A ref rather than state: nothing on
  // screen changes until the sixth tap, and counting in state would redraw the
  // map under the player five times for nothing. Kept with the round it was
  // counted in, so taps don't carry over from the last question.
  const taps = useRef({ round: -1, count: 0 });
  const promptTap = () => {
    if (phase !== "guessing") return;
    if (taps.current.round !== roundIndex) taps.current = { round: roundIndex, count: 0 };
    if (++taps.current.count < CHEAT_TAPS) return;
    taps.current.count = 0;
    solveRound();
  };
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
              Menu
            </button>
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
              the same kind of thing.

              A real table rather than a header laid over a list: the two were
              separate grids sized to their own contents, so "Answer" sat over
              a round number and every heading was a column out. A table shares
              its columns between the head and the body by construction, which
              is the only way this stays lined up once a mode puts a long word
              in it. */}
          <table className="summary-table">
            <thead>
              <tr>
                <th scope="col">Round</th>
                <th scope="col">Answer</th>
                <th scope="col">{measureLabel}</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={hidden + i}>
                  <th scope="row">Round {hidden + i + 1}</th>
                  <td className="summary-answer">
                    {answerLabel?.(targets[hidden + i]) ?? "—"}
                  </td>
                  <td className="muted">
                    {summaryMeasure?.(r, targets[hidden + i]) ??
                      (r.hit ? "spot on" : r.label ?? formatDistance(r.distanceKm))}
                  </td>
                  <td className="round-score">{r.score.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  // Why the mark is the mark, for the modes that owe an explanation. Offered
  // the whole result rather than the click, because what wants explaining is
  // usually the difference between the two numbers in it.
  const scoreNote = isResult && lastResult ? renderScoreNote?.(target, lastResult) : null;
  // Which rule the mark below came from, where that isn't the usual one.
  const scoreCall = isResult && lastResult ? renderScoreCall?.(target, lastResult) : null;
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
  //
  // Only where the round was actually marked on distance, which is what a round
  // without a `label` of its own is. A mode that scores on something else has
  // no business quoting kilometres: a population guess one country out and bang
  // on the number was being congratulated for being "just 12,801 km away", a
  // figure that had nothing to do with the mark and read as the game measuring
  // the wrong thing.
  const nearNote =
    fullMarks &&
    lastResult &&
    lastResult.label === undefined &&
    !lastResult.hit &&
    lastResult.distanceKm >= 1
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
            Menu
          </button>
          <h2>{title}</h2>
        </div>
        {/* TEMPORARY — the tap cheat lives on the question itself. */}
        <div className="prompt" onClick={promptTap}>
          {renderPrompt(target, phase)}
        </div>
        <div className="game-stats">
          <span>Round {roundIndex + 1}/{totalRounds}</span>
          <span className="round-score">{totalScore.toLocaleString()} pts</span>
          {/* Before the first round, the same corner counts *into* the game
              rather than through it. One place for "how long have you got",
              whichever kind of waiting it is, and it replaces the round clock
              rather than sitting beside it — two numbers counting down at once
              is two numbers nobody reads. */}
          {startingInMs !== null && (
            <span className="round-clock-count is-starting">
              Starting in {Math.max(1, Math.ceil(startingInMs / 1000))}
            </span>
          )}
          {/* The seconds sit with the score rather than over the clock itself,
              where on a narrow window they'd be printed across the code. */}
          {startingInMs === null && timeLeftMs !== null && (
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
        {startingInMs === null && timeLeftMs !== null && (
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
          arriveAt: firstRoundAt,
        })}
      </div>

      {!isResult && !currentGuess && (
        <p className="hint muted hud">
          {/* Nothing can be clicked yet, so it doesn't ask to be. The prompt
              above is already up, which is deliberate — reading the question
              while the world arrives is the point of the pause. */}
          {startingInMs === null ? hint : "Getting your bearings…"}
        </p>
      )}

      {isResult && lastResult && (
        // Read top to bottom it's the verdict and then the working behind it:
        // how far out the guess was and what that paid, then the place that was
        // pointed at, then the place it should have been and something worth
        // knowing about it.
        //
        // The mark leads because it is the thing being waited for. Told the
        // story in the order it happened — you picked this, it was that, here's
        // your score — a player looking for the number had to read a paragraph
        // to find it, every round, and the panel is on screen for as long as it
        // takes to press the button.
        <div className={`result-panel hud${panelFolded ? " is-folded" : ""}`}>
          {/* The way out of a round travels with the fold, because folding the
              panel away must never fold away the only button in it. A room has
              no such button — its rounds turn over on the clock — so folded, it
              is just the mark and the way back. */}
          <button
            type="button"
            className="result-fold-toggle"
            aria-expanded={!panelFolded}
            aria-controls="result-body"
            onClick={() => setPanelFolded((folded) => !folded)}
          >
            {panelFolded ? "Show result ▴" : "Hide ▾"}
          </button>
          {panelFolded && (
            <span className="result-points">
              +{lastResult.score.toLocaleString()} pts
            </span>
          )}
          {panelFolded && !timetabled && (
            <button className="btn btn-primary" onClick={next}>
              {lastRound ? "See results" : "Next round"}
            </button>
          )}
          {!panelFolded && (
            <div id="result-body" className="result-body">
              {/* How far out, and what that paid — the two halves of the mark,
                  on one line and first.

                  Full marks take the same row rather than a line of their own,
                  so the verdict is always in the same place whatever it says.
                  Read off the accuracy and not off the hit, because a click can
                  be worth full marks without landing on the answer: a city has a
                  radius round it, and thirty kilometres from the centre of one
                  is still knowing where it is. Off the accuracy also means a
                  duel, where the clock takes its cut afterwards, still says
                  "spot on" — the guess was perfect, and the sum further down
                  explains what the seconds cost. */}
              {/* Over the mark, not in it: the mark is a figure and this is
                  the rule that figure came from, and run together on one line
                  they read as a single overexcited verdict. */}
              {scoreCall && <p className="result-call">{scoreCall}</p>}
              <div className="result-headline">
                {fullMarks ? (
                  <span className="result-distance result-hit">{fullMarksLabel}</span>
                ) : (
                  <span className="result-distance">
                    {lastResult.label ?? `${formatDistance(lastResult.distanceKm)} away`}
                  </span>
                )}
                <span className="result-points">
                  +{lastResult.score.toLocaleString()} pts
                </span>
              </div>
              {/* Under the mark it explains: full marks with a distance beside
                  them looks like something was rounded in the player's favour
                  and won't say what. */}
              {nearNote && <p className="result-near">{nearNote}</p>}
              {/* Straight under the mark, because it is the mark it explains —
                  a figure that contradicts what the map plainly shows has to
                  answer for itself in the same breath, not after a line about
                  something else. Below the pick it read as a note about the
                  pick, and a player who had their number and their reason
                  either side of a name had to assemble the two. */}
              {scoreNote && <p className="result-working">{scoreNote}</p>}
              {picked && !fullMarks && (
                <p className="picked-line">
                  <span className="picked-label">You picked</span>
                  <span className="picked-name">{picked.name}</span>
                  {picked.detail && <span className="picked-detail">{picked.detail}</span>}
                </p>
              )}
              {renderResultExtra && (
                <div className="fact-panel">{renderResultExtra(target)}</div>
              )}
              {/* Where the clock took some of it, the sum is shown rather than
                  the answer alone. A player who pointed straight at the place
                  and was handed 70 has been marked on two things and told about
                  one of them, and reads it as a worse guess than they made. */}
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
                  everybody at once, so what goes here is who it's still waiting
                  on and what the question just answered was worth to each of
                  them. */}
              {timetabled && match && roundClosesAt !== null ? (
                <RoomReveal
                  code={match.code}
                  closesAt={roundClosesAt}
                  round={roundIndex + 1}
                  lastRound={lastRound}
                  mode={match.mode}
                  board={room.board}
                  you={match.player}
                  yours={lastResult.score}
                  offline={room.offline}
                />
              ) : (
                <div className="button-row">
                  <button className="btn btn-primary" onClick={next}>
                    {lastRound ? "See results" : "Next round"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Re-exported for convenience so modes can type their coord usage.
export type { Coord };
