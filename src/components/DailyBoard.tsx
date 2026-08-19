import { dailyCode, gameOfDay, modeTitle, parseMatchCode } from "../lib/match";
import { spentOnThisDevice } from "../lib/leaderboard";
import { loadName } from "../lib/playerName";
import Leaderboard from "./Leaderboard";

/**
 * Today's table, at an address of its own.
 *
 * Split off from the round so the two errands have two doors: `/` is "play
 * today's round", `/leaderboard` is "how did it go". A device that has had its
 * go is sent home from `/` rather than dumped on the standings — being shown
 * the table for a game you can't play, at the address that exists to play it,
 * reads as the site being broken. Home is a screen full of things you *can* do,
 * and Today's Round there brings you here when the table is all that is left of
 * the day.
 *
 * Nothing under the table but the table. There was a refresh button, a line
 * about the day being rationed, and a pair of buttons offering other games —
 * three different ways of saying "and now what?" beneath something somebody
 * came here to read. The bar at the top is where the way out lives, on every
 * screen, which is the point of having one.
 */
export default function DailyBoard() {
  const today = gameOfDay();
  const code = parseMatchCode(dailyCode(today));
  const spent = code ? spentOnThisDevice(code.code) : false;

  return (
    <div className="menu setup">
      <h1>Today's Leaderboard</h1>
      <p className="muted menu-sub">
        Everyone who has finished today's {modeTitle(today)}.
      </p>
      {/* The name is only used to pick this player's row out of the list, so
          the one this device last played under is exactly the right guess —
          and on a device that has never played, nothing is highlighted, which
          is correct rather than a gap. */}
      <Leaderboard player={loadName() || undefined} locked={spent} />
    </div>
  );
}
