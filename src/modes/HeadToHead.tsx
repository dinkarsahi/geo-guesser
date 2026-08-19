import { useEffect, useMemo, useRef, useState } from "react";
import {
  dailyCode,
  gameOfDay,
  parseMatchCode,
  MATCH_ROUNDS,
  modeTitle,
  type Match,
} from "../lib/match";
import { spentOnThisDevice } from "../lib/leaderboard";
import { loadSettings } from "../lib/preferences";
import Leaderboard from "../components/Leaderboard";

/**
 * No clock in it any more. A duel is a race because everybody is playing at
 * once; today's round is people all over the world getting to the same five
 * questions whenever their day allows, and a countdown there was rushing them
 * through the one thing the table is meant to measure.
 */
const RULES = `${MATCH_ROUNDS} rounds, marked out of 100 a round as usual and averaged into one mark out of 100. No clock — take as long over each one as you like. One game a day and one go at it — a go a device, for everyone, everywhere.`;

interface HeadToHeadProps {
  onBack: () => void;
  /** Play this match — the mode takes it from here. */
  onStart: (match: Match) => void;
  /**
   * Somewhere to go when today's round is spent. A player who has been turned
   * away — or whose flatmate played it on this tablet — is told what the rest
   * of the game is rather than left on a table with a back button, and these
   * are the two things here that aren't rationed by the day.
   */
  onAllGames: () => void;
  onDuel: () => void;
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
 * for everyone, and all seven are shown with the other six greyed — partly so
 * you know what you're walking into, partly because a game you can't play today
 * is still a game you can play this week.
 *
 * **Nothing stands between arriving and playing.** This screen used to ask for
 * a name, then offer a card to press, then show which game the day had landed
 * on, then start — four screens' worth of getting ready in front of five
 * questions. It is the site's front door now, so it deals the round on arrival
 * and the game itself says which game it is, in the corner where the title
 * goes. The name is asked for at the end instead, where there is a score to
 * put it to and where somebody who never finishes is never asked at all.
 *
 * What is left of this component is the other half: the table, for a device
 * that has already had its go.
 *
 * There's no code to be seen here any more. There never was much point in
 * showing one — it's worked out from the game and the date rather than issued,
 * so everyone picking City Spotter today is already on it and already on the
 * table it leads to. All the code did was ask people to pass around something
 * they were both holding anyway.
 *
 * The map settings went the same way. They used to travel in the code, which
 * quietly cut each game into four tables and put the player who likes the flat
 * map in a different contest from the player who likes the globe. The rounds
 * are what's being marked, so they're the only thing the table is drawn from:
 * how you'd rather see the world is your own business.
 */
export default function HeadToHead({
  onBack,
  onStart,
  onAllGames,
  onDuel,
}: HeadToHeadProps) {
  // How this player likes the world drawn: their saved preference, not a
  // question asked here. Theirs alone either way — everyone playing today's
  // City Spotter is on one table whichever map they read it on.
  const [setup] = useState(loadSettings);
  // The game the day landed on, which is nobody's choice and everybody's.
  const today = gameOfDay();
  const code = useMemo(() => parseMatchCode(dailyCode(today)), [today]);

  // Whether this device has already had its go. Answered from localStorage, so
  // nothing stands between arriving and playing — not even a round trip. The
  // *name* half of the check can't be asked yet and doesn't need to be: it is
  // settled at the end, when there is a score to put a name to, and the table's
  // own unique index is what actually enforces it.
  const spent = code ? spentOnThisDevice(code.code) : false;

  // Straight into the round. The ref is what stops a second deal if this
  // renders again before `onStart` has taken effect; it is not a ran-once flag
  // of the kind that breaks under strict mode, because nothing here cancels
  // what the first run did.
  const dealt = useRef(false);
  useEffect(() => {
    if (!code || spent || dealt.current) return;
    dealt.current = true;
    // No name: this player has one at the end if they finish, and none of
    // their business until then.
    onStart({ ...code, player: "", flat: setup.flat, borders: setup.borders });
  }, [code, spent, onStart, setup]);

  return (
    <div className="menu setup">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          Home
        </button>
      </div>
      <h1>
        <span className="mode-emoji mode-mark" aria-hidden="true">
          🌍
          <span className="mode-mark-badge">⚔️</span>
        </span>{" "}
        Today's Round
      </h1>
      <p className="muted menu-sub">
        You against everyone else in the world playing it. {RULES}
      </p>

      {spent ? (
        <>
          <Leaderboard locked />
          {/* Only under a table somebody was *sent* to, which is now the only
              way to arrive at one: a player who can still play is playing. */}
          <div className="h2h-elsewhere">
            <p className="muted h2h-code-hint">
              Today's {modeTitle(today)} is one go a device, so the table means
              something. Nothing else here is rationed.
            </p>
            <div className="button-row">
              <button className="btn btn-ghost" onClick={onAllGames}>
                All Games
              </button>
              <button className="btn btn-ghost" onClick={onDuel}>
                Duel a Friend
              </button>
            </div>
          </div>
        </>
      ) : (
        // The blink between arriving and the round being dealt. Almost never
        // seen, and worth having for the moment the shapes are still coming.
        <p className="muted h2h-code-hint">Dealing today's {modeTitle(today)}…</p>
      )}
    </div>
  );
}
