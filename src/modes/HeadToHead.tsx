import { useEffect, useMemo, useRef, useState } from "react";
import {
  dailyCode,
  gameOfDay,
  localDay,
  parseMatchCode,
  MATCH_MODES,
  modeTitle,
  type Match,
} from "../lib/match";
import { MODES } from "../data/gameCards";
import { spentOnThisDevice } from "../lib/leaderboard";
import { loadSettings } from "../lib/preferences";
import { loadWorldShapes } from "../lib/worldShapes";

interface HeadToHeadProps {
  /** Play this match — the mode takes it from here. */
  onStart: (match: Match) => void;
  /**
   * Called when this device has already had its go, instead of dealing.
   *
   * The player is sent **home** rather than to the table. Being shown the
   * standings for a game you can't play, at the address that exists to play it,
   * reads as the site being broken; home is a screen full of things you *can*
   * do, and Today's Round there takes you to the table when the table is what
   * is left of it.
   */
  onSpent: () => void;
}

/**
 * The three beats of the draw, and the third one says nothing.
 *
 * `DRAW_MS` is the light going round, and it is **slow on purpose**. Four
 * seconds of twenty-four hops was a fifty-millisecond flicker at the start —
 * fast enough to read as the page glitching rather than as a wheel spinning,
 * and somebody arriving for the first time could not tell what was being done
 * to them before it was over. The fix is both halves at once: fewer hops over
 * more time, so the first hold is about an eighth of a second and the last a
 * little over a second and a quarter. The eye can follow every step of it,
 * which is what makes it read as a draw slowing to a stop.
 *
 * It can afford the seconds because it is only ever shown **once a device** —
 * see `SEEN_KEY`.
 *
 * `READ_MS` is the beat nothing moves in. The light has stopped, the six it
 * isn't have gone quiet and the name is printed under the shelf, and the
 * player is left alone with it long enough to actually read it. This is the
 * beat that was missing at first: the answer landed and the globe took the
 * screen before anybody had finished looking at what they had been told.
 *
 * `SEEN_READ_MS` is that same beat, shortened, for a device that has already
 * been told today's game once — see `SEEN_KEY`. Shorter but not gone: the
 * screen still has to say which game it is, because a player who reloads has
 * usually reloaded for a reason and may never have got as far as reading it.
 * Two seconds is a name being confirmed rather than a name being announced.
 *
 * `LEAVE_MS` is the screen fading out — **still showing the answer**, which is
 * the whole of why there is nothing else to say by then. A "Let's begin" here
 * was a second thing to read at the moment the first one was being taken away,
 * and it pushed the name of the game off screen to make room for a line that
 * carried no news. Faded out under its own answer, the last thing the player
 * sees is the thing they are about to play.
 */
const DRAW_MS = 5500;
const READ_MS = 2600;
const SEEN_READ_MS = 2000;
const LEAVE_MS = 700;

/**
 * The day this device last watched the draw, as a `localDay` number.
 *
 * The light going round is an explanation — *this is a different game every
 * day, and here is today's* — and it is worth watching once a day and nothing
 * but a delay every time after. A player who reloads before playing had it
 * explained a moment ago, and is sent straight to the last beats, which still
 * name the game: nobody loses the answer by having already been given it.
 *
 * **The day is stored rather than a flag**, and that is the whole of why this
 * is a day's worth of memory rather than a device's. What the draw announces
 * *is* the day's news, so it is owed again when the news changes; a device
 * that watched it last week is a device that has not been told about today.
 * The turnover is `localDay`, the same notion of today the daily code is built
 * from, so the draw and the round it opens can never disagree about which day
 * it is.
 *
 * **This is storage, so it is on the privacy page** — see `Privacy.tsx`, which
 * names every key this app writes.
 */
const SEEN_KEY = "spoton.draw.v2";

function drawSeenOn(): number | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    // Checked rather than trusted: what comes back is whatever was in
    // localStorage, and a `NaN` compared against today is false either way —
    // but only because this says so rather than by luck.
    const day = raw === null ? NaN : Number(raw);
    return Number.isFinite(day) ? day : null;
  } catch {
    // Storage off, or a private window that refuses it. The draw plays, which
    // is the better of the two failures: a first-timer must not be robbed of
    // the one screen that tells them the game changes daily.
    return null;
  }
}

function rememberDraw(day: number): void {
  try {
    localStorage.setItem(SEEN_KEY, String(day));
  } catch {
    /* see above */
  }
}

/**
 * How many games are lit on the way, counting the one it stops on.
 *
 * Cut along with `DRAW_MS` being raised, and the two are one knob: hops over
 * time is the rate the light travels at, and it was three times too fast to
 * follow. Fourteen over five and a half seconds is still twice round the shelf
 * — plainly a wheel going round — at a pace a first-time player can watch.
 */
const HOPS = 14;

/**
 * Which game is lit when, and how long each one holds.
 *
 * **The answer is decided before the first hop and the hops are theatre**, and
 * that is the honest description: `gameOfDay` settled today's game for the
 * whole world from the date, days ago, and nothing here is allowed a vote. What
 * this builds is the envelope being opened — a light going round the shelf and
 * slowing to a stop on the one the day already chose.
 *
 * Two rules make it read as a stop rather than as a cut. The light never lands
 * on the same card twice running, or a hop looks like a dropped frame; and the
 * hop before the last is never today's game, so the landing is always a move
 * the eye can follow rather than a light that was already there going quiet.
 *
 * The holds grow as a cube, so the last is ten times the first, and they are
 * then **scaled to `DRAW_MS` rather than adding up to whatever they add up
 * to** — the draw takes the same time on every device and however many hops
 * this is next tuned to.
 */
function drawPlan(landOn: number, count: number): { lit: number; wait: number }[] {
  const order: number[] = [];
  for (let i = 0; i < HOPS - 1; i++) {
    let next = Math.floor(Math.random() * count);
    while (next === order[i - 1] || (i === HOPS - 2 && next === landOn)) {
      next = Math.floor(Math.random() * count);
    }
    order.push(next);
  }
  order.push(landOn);

  // The first card is lit on arrival and so waits for nothing; the rest share
  // the whole of `DRAW_MS` between them.
  const weights = order.map((_, i) => (i === 0 ? 0 : 1 + 9 * ((i - 1) / (HOPS - 2)) ** 3));
  const total = weights.reduce((sum, w) => sum + w, 0);
  return order.map((lit, i) => ({ lit, wait: (weights[i] / total) * DRAW_MS }));
}

/**
 * Today's round: the one game the whole world is playing today.
 *
 * The other half of playing against people is a duel, which is you against the
 * three people you sent a code to, all at once. This one is you against
 * everybody, and not at once — the day is the thing everyone shares, so you
 * play it whenever you get to it and the scores meet on a table.
 *
 * Which game it is isn't the player's to choose either. A table apiece for the
 * few people who happened to pick each game is seven lonely tables; one game
 * everybody is on is a leaderboard. So the day names the game, the same game
 * for everyone.
 *
 * **This screen is where the day says which.** It used to deal on sight — the
 * front door opened straight into the fall through space, and the name of the
 * game went past in the corner of a round that had already begun. That is the
 * one thing about today's round worth a moment of its own: it is a different
 * game every day, and a player who is dropped into the globe without being
 * told which never learns that. So the seven are laid out, a light goes round
 * them and stops on today's, the other six go quiet, and *then* the world is
 * flown to.
 *
 * **It is shown once a device, and slowly.** Both follow from what it is for:
 * it exists to teach one thing, so it is paced to be followed rather than
 * glimpsed, and once that has been taught there is nothing left for it to do
 * — a returning player, or one who simply reloaded, is dropped at the last
 * two beats, where the game is still named and held. See `SEEN_KEY`.
 *
 * Two things it buys beyond the moment itself, and both are the reason it
 * earns its seconds rather than costing them:
 *
 * - **The world is fetched and built while it runs.** `loadWorldShapes` is a
 *   megabyte of Natural Earth to download, parse, coarsen and index, and done
 *   on the first frame of a round it swallowed the count-in whole. Every game
 *   off the shelf has a setup screen to do it behind; today's round had
 *   nothing, because it dealt on arrival. Now it has this.
 * - **Nobody is dropped into a game they didn't choose without being told what
 *   it is.** The round still says so in the corner, and now it is the second
 *   time they have been told rather than the first.
 *
 * The name is still asked for at the end, in `MatchResult`, where there is a
 * score to put it to and where somebody who never finishes is never asked at
 * all.
 *
 * There's no code to be seen here either. There never was much point in showing
 * one — it's worked out from the game and the date rather than issued, so
 * everyone playing today is already on it and already on the table it leads to.
 *
 * The map settings went the same way. They used to travel in the code, which
 * quietly cut each game into four tables and put the player who likes the flat
 * map in a different contest from the player who likes the globe. The rounds
 * are what's being marked, so they're the only thing the table is drawn from:
 * how you'd rather see the world is your own business.
 */
export default function HeadToHead({ onStart, onSpent }: HeadToHeadProps) {
  // How this player likes the world drawn: their saved preference, not a
  // question asked here. Theirs alone either way — everyone playing today's
  // City Spotter is on one table whichever map they read it on.
  const [setup] = useState(loadSettings);
  // The game the day landed on, which is nobody's choice and everybody's.
  const today = gameOfDay();
  const code = useMemo(() => parseMatchCode(dailyCode(today)), [today]);

  // Whether this device has already had its go. Answered from localStorage, so
  // nothing stands between arriving and the draw — not even a round trip. The
  // *name* half of the check can't be asked yet and doesn't need to be: it is
  // settled at the end, when there is a score to put a name to, and the table's
  // own unique index is what actually enforces it.
  const spent = code ? spentOnThisDevice(code.code) : false;

  const landOn = MATCH_MODES.findIndex((m) => m.id === today);
  // Built once, and not with `useMemo`: a plan with random hops in it must not
  // be at the mercy of a cache React is allowed to drop and rebuild, which
  // would restart the light halfway round.
  const [plan] = useState(() => drawPlan(landOn, MATCH_MODES.length));
  const [step, setStep] = useState(0);

  // Which of the three beats is on screen. `drawing` is the light going round
  // with nothing said under it; `drawn` is the answer, held; `leaving` is the
  // same answer, fading out.
  const [beat, setBeat] = useState<"drawing" | "drawn" | "leaving">("drawing");

  // Whether today's draw has already been watched here. Read once, on the
  // first render, because the effect below writes it a moment later — read on
  // every render it would flip to true under its own screen and restart it
  // halfway through the light.
  const [seenToday] = useState(() => drawSeenOn() === localDay());

  // Who is told the answer instead of being shown it arrive: the same screen
  // and the same words, without the light going round. Two people want that,
  // for reasons that have nothing in common beyond the ending — somebody who
  // has asked not to be animated, and anybody who has already had today's
  // draw. The second is the reload before playing, where the player watches a
  // wheel decide something they were told a moment ago.
  const [skip] = useState(
    () =>
      seenToday ||
      (typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches),
  );

  // How long the answer is held. Off `seenToday` rather than off `skip`,
  // which is the distinction that matters: somebody who asked not to be
  // animated is having the game named to them for the first time today, and
  // this beat is the whole of the screen for them. Only a player who has
  // genuinely been told already gets the shorter one.
  const readMs = seenToday ? SEEN_READ_MS : READ_MS;

  // Fetch and build the world while the light goes round, rather than at the
  // moment the round opens. This is the whole of what the screen buys the
  // arrival: a megabyte of shapes to download, parse, coarsen and index, and
  // four seconds of somebody watching something else while it happens.
  // `loadWorldShapes` caches its own promise, so this is a warm-up rather than
  // a second download however often it is called.
  useEffect(() => {
    if (spent) return;
    void loadWorldShapes().catch(() => {});
    // Filed on arrival rather than on the deal, so a reload halfway through
    // the light counts as having seen it — which is the exact case this is
    // for. A device sent home unplayed never gets here, and so is still owed
    // the draw.
    rememberDraw(localDay());
  }, [spent]);

  // Straight back out again if the day has been spent here. Before the draw
  // rather than after it: four seconds of ceremony in front of "you have
  // already played" is four seconds of being told nothing.
  const sent = useRef(false);
  useEffect(() => {
    if (!code || !spent || sent.current) return;
    sent.current = true;
    onSpent();
  }, [code, spent, onSpent]);

  // The light going round, and the deal at the end of it. One chain of timers
  // rather than an interval, because the holds are all different lengths — and
  // it is safe to run twice under strict mode, since the cleanup takes the
  // pending timer with it and the ref below is what makes the deal itself
  // once-only.
  const dealt = useRef(false);
  useEffect(() => {
    if (!code || spent) return;
    const deal = () => {
      if (dealt.current) return;
      dealt.current = true;
      // No name: this player has one at the end if they finish, and none of
      // their business until then.
      onStart({ ...code, player: "", flat: setup.flat, borders: setup.borders });
    };

    // The two beats after the light stops, and the deal at the end of them.
    // Chained from wherever they are entered, so the shortcut and the hops below
    // share one ending rather than each having their own.
    let id = 0;
    const settle = () => {
      setBeat("drawn");
      id = window.setTimeout(() => {
        setBeat("leaving");
        id = window.setTimeout(deal, LEAVE_MS);
      }, readMs);
    };

    if (skip) {
      // Straight to the answer: the shelf is already showing it, because
      // `shown` reads it off `skip` rather than being walked there. The two
      // beats that remain are still the whole point — the name is printed and
      // held — and they are also what the world is loaded behind, which is why
      // this is a shortcut rather than a cut.
      settle();
      return () => clearTimeout(id);
    }

    // A plan's `wait` is the pause *before* that card lights, so the first is
    // always nought — it is lit on arrival — and the chain always schedules
    // the next one's.
    let at = 0;
    const hop = () => {
      at += 1;
      setStep(at);
      if (at >= plan.length - 1) {
        settle();
        return;
      }
      id = window.setTimeout(hop, plan[at + 1].wait);
    };
    id = window.setTimeout(hop, plan[1].wait);
    return () => clearTimeout(id);
  }, [code, spent, plan, skip, readMs, onStart, setup]);

  // Where the light is: the last card outright for anybody taking the shortcut,
  // and otherwise wherever the chain has walked it to. Derived rather than set,
  // so the shortcut needs no effect of its own to arrange it.
  const shown = skip ? plan.length - 1 : Math.min(step, plan.length - 1);
  // Whether the six it isn't have gone quiet, which is the beat's business and
  // not the light's: on the shortcut the light is on the answer from the first
  // frame, and greying the rest before the beat says so would give the answer
  // away with no draw to have given it.
  const landed = beat !== "drawing";
  const lit = plan[shown].lit;

  return (
    // `is-leaving` fades the whole screen out with the answer still on it, and
    // the globe behind it fades in on its own — see `.globe-wrap.is-arriving`.
    // The two together are the handover: this screen goes and the world
    // arrives, rather than one being cut to the other.
    <div className={`menu setup daily-draw${beat === "leaving" ? " is-leaving" : ""}`}>
      <h1>Today's Round</h1>
      {/* No line under the heading. "One game a day, and the day picks it"
          was a rule being explained above a shelf that was in the middle of
          demonstrating it, and read as something to study at the one moment
          the eye should be on the light. What it said is said by the draw
          itself, and again by "Today's Round: Currency Spotter" across the
          top of the round. */}

      <div className="h2h-modes draw-shelf">
        {MATCH_MODES.map((m, i) => (
          <div
            key={m.id}
            className={
              "h2h-mode draw-slot" +
              (i === lit ? " is-active" : "") +
              (landed ? (i === landOn ? " is-drawn" : " is-off") : "")
            }
          >
            <span className="mode-emoji">{m.emoji}</span>
            <span>{m.title}</span>
          </div>
        ))}
      </div>

      {/* Nothing at all while the light is going round. A line under a shelf
          that is still deciding is a line nobody reads — the eye is on the
          movement — and "Today's game is…" sitting there through the whole
          draw made the answer feel like something already said rather than
          something arriving. The box keeps its height either way, so the words
          appear rather than push the page around under them.

          One line, and no second one under it. "Five rounds, the same five as
          everyone else today" was true, is said on the round itself anyway,
          and read as small print beneath the one thing this screen exists to
          say.

          It is also the one part of the screen that is read rather than
          watched, so it is the one that is announced: the shelf above is the
          same news told in light, and a screen reader given both would hear
          seven games change state. */}
      <p className="draw-call" aria-live="polite">
        {beat !== "drawing" && (
          <>
            Today's game is <strong>{modeTitle(today)}</strong>
          </>
        )}
      </p>
      {/* What a round of it actually involves, in the game's own words — the
          same sentence the shelf prints under it in `AllGames`, from the one
          `GameCard`, so the two can't come to describe the game differently.
          
          A name alone is an answer only to somebody who already knows the
          seven. This screen exists for the player who doesn't, and "Population
          Spotter" tells them nothing about what they are about to be asked;
          they would otherwise meet the rules for the first time in the round,
          on a clock. It appears with the name and not before it, because a
          description of a game still being drawn for is a description of
          nothing. */}
      <p className="draw-blurb muted">
        {beat !== "drawing" && MODES.find((m) => m.id === today)?.blurb}
      </p>
    </div>
  );
}
