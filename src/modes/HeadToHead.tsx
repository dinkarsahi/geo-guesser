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
 * What is left of this component is a doorway: it deals the round, or hands
 * back to whoever asked when the day has already been spent here. The table
 * lives at `/leaderboard` and is reached on purpose rather than by being turned
 * away onto it.
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
export default function HeadToHead({ onStart, onSpent }: HeadToHeadProps) {
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

  // Straight into the round, or straight back out again. The ref is what stops
  // a second deal if this renders again before `onStart` has taken effect; it
  // is not a ran-once flag of the kind that breaks under strict mode, because
  // nothing here cancels what the first run did.
  const dealt = useRef(false);
  useEffect(() => {
    if (!code || dealt.current) return;
    dealt.current = true;
    if (spent) {
      onSpent();
      return;
    }
    // No name: this player has one at the end if they finish, and none of
    // their business until then.
    onStart({ ...code, player: "", flat: setup.flat, borders: setup.borders });
  }, [code, spent, onStart, onSpent, setup]);

  // Never on screen for more than a frame or two — this component's whole job
  // is to decide which of two places the player belongs and send them there.
  return (
    <div className="menu setup">
      <h1>Today's Round</h1>
      <p className="muted menu-sub">
        {MATCH_ROUNDS} rounds of {modeTitle(today)}, the same five as everyone else
        today.
      </p>
      <p className="muted h2h-code-hint">Dealing…</p>
    </div>
  );
}
