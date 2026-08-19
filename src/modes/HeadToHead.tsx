import { useState } from "react";
import {
  cleanName,
  dailyCode,
  gameOfDay,
  parseMatchCode,
  MATCH_MODES,
  MATCH_ROUNDS,
  modeTitle,
  type Match,
} from "../lib/match";
import { checkEntry } from "../lib/leaderboard";
import { loadName, saveName } from "../lib/playerName";
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
  const [screen, setScreen] = useState<"pick" | "games" | "board">("pick");
  const [name, setName] = useState(loadName);
  // How this player likes the world drawn: their saved preference, not a
  // question asked here. Theirs alone either way — everyone playing today's
  // City Spotter is on one table whichever map they read it on, which is why
  // this can be a setting rather than part of entering the contest.
  const [setup] = useState(loadSettings);
  // Whether the player was sent to the standings because they've had their go,
  // rather than having asked to see them.
  const [spent, setSpent] = useState(false);
  // The game the day landed on, which is nobody's choice and everybody's.
  const today = gameOfDay();
  // Set when the name is somebody else's today. Sends the player back to the
  // name field, which is the only thing standing between them and a game.
  const [taken, setTaken] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  /**
   * Off to play today's round of a game, under the name that will appear in
   * everyone's standings — unless this device has already had its go, or the
   * name is spoken for by one of the strangers sharing the table.
   *
   * The first of those is the device's and not the name's, so a second go can't
   * be had by typing something else. See `playedOnThisDevice`.
   */
  const play = async () => {
    const code = parseMatchCode(dailyCode(today));
    if (!code) return;
    const player = name.trim();
    saveName(player);
    setTaken(null);
    setChecking(true);
    const entry = await checkEntry(code.code, player);
    setChecking(false);
    if (entry === "played") {
      setSpent(true);
      setScreen("board");
      return;
    }
    if (entry === "name-taken") {
      setTaken(player);
      setScreen("pick");
      return;
    }
    onStart({ ...code, player, flat: setup.flat, borders: setup.borders });
  };

  const named = name.trim().length > 0;

  const back = () => {
    if (screen === "pick") return onBack();
    setScreen("pick");
    setSpent(false);
  };

  return (
    <div className="menu setup">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={back}>
          ← {screen === "pick" ? "Home" : "Back"}
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

      {screen === "pick" && (
        <>
          {/* Asked for before anything else, because the standings at the end
              are a list of names and one of them has to be yours. */}
          <div className="h2h-name">
            <label className="setup-label" htmlFor="h2h-player">
              Playing as
            </label>
            <input
              id="h2h-player"
              className="h2h-name-input"
              value={name}
              onChange={(e) => {
                setName(cleanName(e.target.value));
                setTaken(null);
              }}
              placeholder="Your name"
              maxLength={16}
              autoFocus={!name || taken !== null}
            />
          </div>
          {/* One table a day for the whole world means one of everything on it,
              names included, until there are accounts to tell two Sams apart. */}
          {taken !== null && (
            <p className="h2h-taken">
              <strong>{taken}</strong> is taken on today's table — pick another name.
            </p>
          )}
          <div className="h2h-choices">
            <button
              className="h2h-choice"
              disabled={!named}
              onClick={() => setScreen("games")}
            >
              <span className="h2h-choice-title">Play today's round</span>
              <span className="muted h2h-choice-hint">
                {modeTitle(today)} — the same five rounds as everyone else today.
              </span>
            </button>
            {/* Open to anyone, name or not: reading a table is not playing, and
                a spectator shouldn't have to invent a name. */}
            <button className="h2h-choice" onClick={() => setScreen("board")}>
              <span className="h2h-choice-title">Leaderboard</span>
              <span className="muted h2h-choice-hint">
                Everyone who has finished today's round.
              </span>
            </button>
          </div>
          {!named && (
            <p className="muted h2h-code-hint">Put a name in to play today's round.</p>
          )}
        </>
      )}

      {screen === "games" && (
        <div className="setup-panel">
          {/* What today is, and what it isn't. The ones that aren't on are
              greyed rather than hidden, because "today is the tube" means more
              next to the six games it isn't — and because they're what the
              rest of the week looks like. */}
          <div className="setup-row">
            <span className="setup-label">Today's game</span>
            <div className="h2h-modes">
              {MATCH_MODES.map((m) => (
                <div
                  key={m.id}
                  className={`h2h-mode${m.id === today ? " is-active" : " is-off"}`}
                >
                  <span className="mode-emoji">{m.emoji}</span>
                  <span>{m.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="button-row setup-start">
            <button className="btn btn-primary" disabled={checking} onClick={play}>
              {checking ? "Checking…" : "Start ▸"}
            </button>
          </div>
          <p className="muted h2h-code-hint">
            Everyone playing {modeTitle(today)} today gets the same five rounds in the
            same order, and they all land on one table. Tomorrow it's one of the others,
            and this one starts again at your midnight.
          </p>
        </div>
      )}

      {screen === "board" && (
        <>
          <Leaderboard player={named ? name.trim() : undefined} locked={spent} />
          {/* Only under a table somebody was *sent* to. Printed under one they
              asked to see, it would be a game offering the player a different
              game for no reason. */}
          {spent && (
            <div className="h2h-elsewhere">
              <p className="muted h2h-code-hint">
                Today's round is one go a device, so the table means something.
                Nothing else here is rationed.
              </p>
              <div className="button-row">
                <button className="btn btn-ghost" onClick={onAllGames}>
                  All Games ▸
                </button>
                <button className="btn btn-ghost" onClick={onDuel}>
                  Duel a Friend ▸
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
