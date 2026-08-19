import { useEffect, useMemo, useRef, useState } from "react";
import {
  dailyCode,
  gameOfDay,
  parseMatchCode,
  MATCH_MODES,
  MATCH_ROUNDS,
  modeTitle,
  type Match,
} from "../lib/match";
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
 * How long the games are lit in turn before one of them stays lit.
 *
 * Long enough to be a moment and short enough not to be a wait. Under about
 * three seconds it reads as a flicker somebody should have fixed; past about
 * five the player has understood what is happening and is watching a machine
 * finish. The hold afterwards is the beat where the answer is read — cut
 * straight to the globe from the last hop and the name of the game is on
 * screen for a tenth of a second, which is the same as not showing it.
 */
const DRAW_MS = 3600;
const HOLD_MS = 1100;

/** How many games are lit on the way, counting the one it stops on. */
const HOPS = 20;

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
 * Two things it buys beyond the moment itself, and both are the reason it
 * earns its four and a half seconds rather than costing them:
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

  // Somebody who has asked not to be animated is told the answer instead of
  // shown it: the same screen, the same words, without the light going round.
  const [stillness] = useState(
    () =>
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Fetch and build the world while the light goes round, rather than at the
  // moment the round opens. This is the whole of what the screen buys the
  // arrival: a megabyte of shapes to download, parse, coarsen and index, and
  // four seconds of somebody watching something else while it happens.
  // `loadWorldShapes` caches its own promise, so this is a warm-up rather than
  // a second download however often it is called.
  useEffect(() => {
    if (!spent) void loadWorldShapes().catch(() => {});
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

    if (stillness) {
      // Nothing to schedule but the deal: the shelf is already showing the
      // answer, because `shown` reads it straight off the preference rather
      // than being walked there.
      const id = window.setTimeout(deal, HOLD_MS);
      return () => clearTimeout(id);
    }

    // A plan's `wait` is the pause *before* that card lights, so the first is
    // always nought — it is lit on arrival — and the chain always schedules
    // the next one's.
    let at = 0;
    let id = 0;
    const hop = () => {
      at += 1;
      setStep(at);
      const last = at >= plan.length - 1;
      id = window.setTimeout(last ? deal : hop, last ? HOLD_MS : plan[at + 1].wait);
    };
    id = window.setTimeout(hop, plan[1].wait);
    return () => clearTimeout(id);
  }, [code, spent, plan, stillness, onStart, setup]);

  // Where the light is: the last card outright for anybody who asked not to be
  // animated, and otherwise wherever the chain has walked it to. Derived rather
  // than set, so stillness needs no effect of its own to arrange it.
  const shown = stillness ? plan.length - 1 : Math.min(step, plan.length - 1);
  const landed = shown >= plan.length - 1;
  const lit = plan[shown].lit;

  return (
    <div className="menu setup daily-draw">
      <h1>Today's Round</h1>
      <p className="muted menu-sub">
        One game a day, and the day picks it — the same one for everybody.
      </p>

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

      {/* The one line that is read rather than watched, so it is the one that
          is announced. The shelf above it is the same news told in light, and
          a screen reader given both would hear seven games change state. */}
      <p className="draw-call" aria-live="polite">
        {landed ? (
          <>
            Today's game: <strong>{modeTitle(today)}</strong>
          </>
        ) : (
          "Today's game is…"
        )}
      </p>
      <p className="muted draw-note">
        {landed ? "Getting the world ready…" : `${MATCH_ROUNDS} rounds, the same five as everyone else today.`}
      </p>
    </div>
  );
}
