import { useEffect, useRef, useState } from "react";
import {
  canPlayRooms,
  createRoom,
  fetchPlayers,
  fetchRoom,
  joinRoom,
  roomPhase,
  startRoom,
  type Room,
} from "../lib/duel";
import {
  cleanName,
  parseMatchCode,
  spellCode,
  MATCH_GRACE_MS,
  MATCH_MODES,
  MATCH_REVEAL_MS,
  MATCH_ROUNDS,
  MATCH_ROUND_MS,
  modeTitle,
  type Match,
} from "../lib/match";
import { loadName, saveName } from "../lib/playerName";
import { serverNow } from "../lib/supabase";
import { useCountdown } from "../lib/useRoom";
import type { ModeId } from "./ModeProps";

const RULES = `${MATCH_ROUNDS} rounds, ${Math.round(
  MATCH_ROUND_MS / 1000,
)} seconds each, and everybody answers the same round at the same time — the questions turn over on their own, ${Math.round(
  MATCH_REVEAL_MS / 1000,
)} seconds after each answer goes up. The first ${Math.round(
  MATCH_GRACE_MS / 1000,
)} seconds of a round are free; after that the clock starts costing you. One table at the end, and then the code's done.`;

/** How often the lobby asks whether anyone else has arrived, or it's started. */
const POLL_MS = 1_500;

interface PlayFriendProps {
  onBack: () => void;
  /** Off to the game — the mode and the timetable take it from here. */
  onStart: (match: Match) => void;
}

/**
 * A duel: the same five rounds as your friends, at the same moment as them.
 *
 * Head to head needs nothing between the players — the code is worked out from
 * the date and the scores meet on a table afterwards, so two people "playing
 * together" are really playing separately and comparing. That's the right shape
 * for a thing the whole world plays once a day, and the wrong shape for two
 * people in a group chat who want to race.
 *
 * So this one has a code that's drawn rather than derived, a lobby that fills
 * up, and a moment when it starts. That moment is the only thing that actually
 * has to travel: after it, every device runs the same rounds off the same
 * clock, and there is no connection to lose. When the rounds are done the room
 * is done — one table saying who won, and a code that means nothing tomorrow.
 */
export default function PlayFriend({ onBack, onStart }: PlayFriendProps) {
  const [screen, setScreen] = useState<"pick" | "make" | "join" | "lobby">("pick");
  const [name, setName] = useState(loadName);
  const [setup, setSetup] = useState({ flat: false, borders: true });
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const player = name.trim();
  const named = player.length > 0;
  const host = room !== null && room.host.toLowerCase() === player.toLowerCase();

  /** Everything a screen here can fail at, said in one place and in words. */
  const attempt = async (what: () => Promise<void>) => {
    setBusy(true);
    setProblem(null);
    try {
      await what();
    } catch {
      setProblem("Couldn't reach the room. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const make = (mode: ModeId) =>
    attempt(async () => {
      saveName(player);
      const made = await createRoom(mode, setup, player);
      setRoom(made);
      setPlayers([player]);
      setScreen("lobby");
    });

  const join = () =>
    attempt(async () => {
      const code = parseMatchCode(typed);
      if (!code || code.kind !== "room") {
        setProblem("That isn't a room code.");
        return;
      }
      const found = await fetchRoom(code.code);
      if (!found) {
        setProblem("No room with that code. Rooms don't outlast the day they're made.");
        return;
      }
      if (roomPhase(found) === "over") {
        setProblem("That room has finished. Rooms are one game, and then they're done.");
        return;
      }
      saveName(player);
      if ((await joinRoom(found.code, player)) === "name-taken") {
        setProblem(`Somebody in that room is already ${player}. Try another name.`);
        setScreen("pick");
        return;
      }
      setRoom(found);
      setPlayers(await fetchPlayers(found.code));
      setScreen("lobby");
    });

  const code = room?.code;

  // The lobby's one job while it waits: who's here, and has it started. Polled
  // rather than pushed — it's one small request a second and a half, for the
  // minute or two a lobby is ever open, and it needs nothing to stay connected.
  useEffect(() => {
    if (!code || screen !== "lobby") return;
    let live = true;
    const look = async () => {
      try {
        const [now, here] = await Promise.all([fetchRoom(code), fetchPlayers(code)]);
        if (!live) return;
        if (now) setRoom(now);
        setPlayers(here);
      } catch {
        /* a poll that missed; the next one is a second and a half away */
      }
    };
    look();
    const id = setInterval(look, POLL_MS);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [code, screen]);

  const startAt = room?.startAt ?? null;
  const untilStart = useCountdown(startAt);

  // Handing over to the game, at the moment written down in the room. Everyone
  // gets there off the same clock, so everyone gets there together — and a
  // player who arrives after it goes straight in, to whichever round the room
  // has reached.
  //
  // A timer set for the moment itself rather than a check on every tick: the
  // handover is one event, and a poll that lands on the boundary shouldn't be
  // able to fire it twice. A player joining a room already under way gets a
  // wait of nothing and goes straight in.
  const handedOver = useRef(false);
  useEffect(() => {
    if (!room || room.startAt === null || handedOver.current) return;
    const parsed = parseMatchCode(room.code);
    if (!parsed) return;
    const { flat, borders, startAt } = room;
    const id = setTimeout(
      () => {
        handedOver.current = true;
        onStart({ ...parsed, player, flat, borders, startAt });
      },
      Math.max(0, startAt - serverNow()),
    );
    return () => clearTimeout(id);
  }, [room, player, onStart]);

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  };

  const back = () => {
    if (screen === "pick") return onBack();
    setScreen("pick");
    setRoom(null);
    setPlayers([]);
    setProblem(null);
  };

  return (
    <div className="menu setup">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={back}>
          ← {screen === "pick" ? "Menu" : "Back"}
        </button>
      </div>
      <h1>
        <span className="mode-emoji">⚔️</span> Duel a Friend
      </h1>
      <p className="muted menu-sub">{RULES}</p>

      {!canPlayRooms && (
        <p className="h2h-taken">
          Duels need the shared leaderboard set up — see the README. Head to Head still
          works without it.
        </p>
      )}

      {problem && <p className="h2h-taken">{problem}</p>}

      {screen === "pick" && (
        <>
          <div className="h2h-name">
            <label className="setup-label" htmlFor="room-player">
              Playing as
            </label>
            <input
              id="room-player"
              className="h2h-name-input"
              value={name}
              onChange={(e) => setName(cleanName(e.target.value))}
              placeholder="Your name"
              maxLength={16}
              autoFocus={!name}
            />
          </div>
          <div className="h2h-choices">
            <button
              className="h2h-choice"
              disabled={!named || !canPlayRooms}
              onClick={() => setScreen("make")}
            >
              <span className="h2h-choice-title">Make a room</span>
              <span className="muted h2h-choice-hint">
                Pick the game, read out the code, and press go when they're all in.
              </span>
            </button>
            <button
              className="h2h-choice"
              disabled={!named || !canPlayRooms}
              onClick={() => setScreen("join")}
            >
              <span className="h2h-choice-title">Join a room</span>
              <span className="muted h2h-choice-hint">
                Type the code you were given and wait for the host to start.
              </span>
            </button>
          </div>
          {!named && <p className="muted h2h-code-hint">Put a name in to play.</p>}
        </>
      )}

      {screen === "make" && (
        <div className="setup-panel">
          {/* The host's, and everyone's: a room is one contest, so the map has
              to be the same for all of them. It's the one thing here that
              isn't each player's own. */}
          <div className="setup-row">
            <span className="setup-label">Map</span>
            <div className="setup-options">
              <button
                className={`setup-option${!setup.flat ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, flat: false }))}
                aria-pressed={!setup.flat}
              >
                <span className="setup-option-title">3D globe</span>
                <span className="muted setup-option-hint">Spin and zoom a real globe</span>
              </button>
              <button
                className={`setup-option${setup.flat ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, flat: true }))}
                aria-pressed={setup.flat}
              >
                <span className="setup-option-title">Flat map</span>
                <span className="muted setup-option-hint">The whole world at once</span>
              </button>
            </div>
          </div>

          <div className="setup-row">
            <span className="setup-label">Borders</span>
            <div className="setup-options">
              <button
                className={`setup-option${setup.borders ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, borders: true }))}
                aria-pressed={setup.borders}
              >
                <span className="setup-option-title">Show borders</span>
                <span className="muted setup-option-hint">Country outlines drawn on</span>
              </button>
              <button
                className={`setup-option${!setup.borders ? " is-active" : ""}`}
                onClick={() => setSetup((s) => ({ ...s, borders: false }))}
                aria-pressed={!setup.borders}
              >
                <span className="setup-option-title">Hide borders</span>
                <span className="muted setup-option-hint">Coastlines only — harder</span>
              </button>
            </div>
          </div>

          <div className="setup-row">
            <span className="setup-label">Game</span>
            <div className="h2h-modes">
              {MATCH_MODES.map((m) => (
                <button
                  key={m.id}
                  className="h2h-mode"
                  disabled={busy}
                  onClick={() => make(m.id)}
                >
                  <span className="mode-emoji">{m.emoji}</span>
                  <span>{busy ? "Opening…" : m.title}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="muted h2h-code-hint">
            Everyone in the room plays this game on this map, so nobody is racing a
            different question.
          </p>
        </div>
      )}

      {screen === "join" && (
        <div className="setup-panel h2h-code-panel">
          <p className="muted h2h-code-label">Room code</p>
          <input
            className="h2h-code-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="CV4 KQ7M"
            autoFocus
            maxLength={10}
            aria-label="Room code"
            onKeyDown={(e) => e.key === "Enter" && !busy && join()}
          />
          <div className="button-row">
            <button className="btn btn-primary" disabled={busy} onClick={join}>
              {busy ? "Looking…" : "Join ▸"}
            </button>
          </div>
        </div>
      )}

      {screen === "lobby" && room && (
        <div className="setup-panel h2h-code-panel">
          <p className="muted h2h-code-label">Room code</p>
          <p className="h2h-code">{spellCode(room.code)}</p>
          <p className="h2h-setup">
            {modeTitle(room.mode)} · {MATCH_ROUNDS} rounds ·{" "}
            {room.mode === "tube" ? "tube map" : room.flat ? "flat map" : "3D globe"}
          </p>

          <ol className="room-list">
            {players.map((p) => (
              <li
                key={p}
                className={`room-player${p.toLowerCase() === player.toLowerCase() ? " is-you" : ""}`}
              >
                {p}
                {p.toLowerCase() === room.host.toLowerCase() && (
                  <span className="muted room-host"> host</span>
                )}
              </li>
            ))}
          </ol>

          {startAt !== null ? (
            <p className="room-countdown">
              Starting in <strong>{Math.ceil(untilStart / 1000)}</strong>
            </p>
          ) : host ? (
            <>
              <div className="button-row">
                <button className="btn btn-ghost" onClick={() => copy(room.code)}>
                  {copied ? "Copied ✓" : "Copy code"}
                </button>
                <button
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() =>
                    attempt(async () => {
                      const started = await startRoom(room.code);
                      if (started) setRoom(started);
                    })
                  }
                >
                  {busy ? "Starting…" : "Start the game ▸"}
                </button>
              </div>
              <p className="muted h2h-code-hint">
                Read the code out, and press go once they're on the list. Everyone starts
                on the same round at the same second — anyone still typing the code in
                misses the rounds that have gone.
              </p>
            </>
          ) : (
            <p className="muted h2h-code-hint">
              Waiting for {room.host} to start. Keep this open — it begins on its own.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
