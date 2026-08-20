import { useEffect, useRef, useState } from "react";
import {
  canPlayRooms,
  createRoom,
  fetchPlayers,
  fetchRoom,
  joinedHere,
  joinRoom,
  roomPhase,
  roomProblem,
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
import { loadSettings } from "../lib/preferences";
import { serverNow } from "../lib/supabase";
import { useCountdown } from "../lib/useRoom";
import { inviteLink } from "../lib/useRoute";
import type { ModeId } from "./ModeProps";

const RULES = `${MATCH_ROUNDS} rounds, ${Math.round(
  MATCH_ROUND_MS / 1000,
)} seconds each, and everybody answers the same round at the same time — the questions turn over on their own, ${Math.round(
  MATCH_REVEAL_MS / 1000,
)} seconds after each answer goes up. The first ${Math.round(
  MATCH_GRACE_MS / 1000,
)} seconds of a round are free; after that the clock starts costing you. The room shuts the moment the host starts it, so latecomers wait for the next code. One table at the end, and then the code's done.`;

/** How often the lobby asks whether anyone else has arrived, or it's started. */
const POLL_MS = 1_500;

/**
 * A game drawn out of the hat, for a host who doesn't want to choose.
 *
 * Unseeded on purpose, unlike everything else about a duel: this decides which
 * room gets made, before there is a code for the players to share, so there is
 * nothing here that has to come out the same on two devices. The code the draw
 * produces carries the answer to everyone else.
 */
const anyMode = (): ModeId =>
  MATCH_MODES[Math.floor(Math.random() * MATCH_MODES.length)].id;

/**
 * What a code that's already in play says, and a code that has been played.
 *
 * One sentence for both, because from outside the room they're the same event:
 * the duel went ahead without you, and this code isn't a way in any more. What
 * the player wants next isn't an explanation of round timing — it's the two
 * things that would get them a game, which is why they're what it ends on.
 */
const SHUT =
  "Too slow. This duel started without you and it's a bit awkward now. Join " +
  "another duel with a new code or set up your own duel.";

interface PlayFriendProps {
  onBack: () => void;
  /** Off to the game — the mode and the timetable take it from here. */
  onStart: (match: Match) => void;
  /**
   * A room code that arrived on the address bar — somebody followed a link.
   * Checked before it is believed: see the invitation effect below.
   */
  invite?: string;
  /**
   * The room this screen is an invitation to, or null once it isn't one.
   *
   * The address bar follows it, so the link a host sends is the same link they
   * are looking at, and it stops existing the moment the room starts. Handed
   * out rather than done here because every URL in this app belongs to
   * `useRoute`, and a screen writing to the address bar itself would be the one
   * place the path stopped being the truth.
   */
  onInvite: (code: string | null) => void;
}

/**
 * The one thing a player has to give before any of this works.
 *
 * Its own component because two screens ask for it now — the ordinary way in,
 * and an invitation opened cold by somebody who has never been here before.
 */
function NameField({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="h2h-name">
      <label className="setup-label" htmlFor="room-player">
        Playing as
      </label>
      <input
        id="room-player"
        className="h2h-name-input"
        value={value}
        onChange={(e) => onChange(cleanName(e.target.value))}
        placeholder="Your name"
        maxLength={16}
        autoFocus={!value}
      />
    </div>
  );
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
export default function PlayFriend({
  onBack,
  onStart,
  invite,
  onInvite,
}: PlayFriendProps) {
  // An invitation opens on its own screen rather than on the way in: somebody
  // who followed a link has already decided what they are doing, and being
  // shown "make a room or join one" first asks them again.
  const [screen, setScreen] = useState<"pick" | "make" | "join" | "lobby" | "invite">(
    invite ? "invite" : "pick",
  );
  const [name, setName] = useState(loadName);
  // The host's saved preference, which in a room is everybody's: one contest
  // means one world, so this is the single setting in the app that reaches
  // past the device that chose it. Read rather than asked — a host who likes
  // the globe has said so once already, and the join screen says whose map it
  // is, so nobody arrives thinking their own setting failed.
  const [setup] = useState(loadSettings);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const player = name.trim();
  const named = player.length > 0;
  const host = room !== null && room.host.toLowerCase() === player.toLowerCase();

  /**
   * Everything a screen here can fail at, said in one place and in words —
   * but not in the same words, which is the point. See `roomProblem`: a value
   * the database refused and a server that never answered are different
   * problems with different fixes, and telling a player to check their
   * connection over the first of them sends them nowhere.
   */
  const attempt = async (what: () => Promise<void>) => {
    setBusy(true);
    setProblem(null);
    try {
      await what();
    } catch (e) {
      setProblem(roomProblem(e));
    } finally {
      setBusy(false);
    }
  };

  /**
   * A code this screen put in the address bar itself.
   *
   * Putting a room's code in the URL is the last thing making or joining a room
   * does, and the invitation effect below reads the URL: without this it would
   * hand the host of a room an invitation to the room they are standing in, and
   * their lobby would turn into a screen asking them to join it.
   *
   * It records only our own codes, and deliberately not the ones the effect has
   * dealt with. A ref used as a ran-once flag is a trap here — React's strict
   * mode mounts every component twice in development, so the second mount finds
   * the flag already set, skips the lookup the first mount had its cleanup
   * cancel, and the invitation sits on "Looking up the room…" for ever.
   */
  const ours = useRef<string | null>(null);

  /** The code in the address bar is ours from here, not an invitation to us. */
  const showInvite = (code: string) => {
    ours.current = code;
    onInvite(code);
  };

  const make = (mode: ModeId) =>
    attempt(async () => {
      saveName(player);
      const made = await createRoom(mode, setup, player);
      setRoom(made);
      setPlayers([player]);
      setScreen("lobby");
      // The code goes into the address bar the moment there is one, so the host
      // has a link to send without having to be told they have one.
      showInvite(made.code);
    });

  /**
   * Into a room, by a code that was typed or one that was followed.
   *
   * The room is fetched again here even when the invitation has just fetched
   * it: between a link being opened and a name being put in, the host may well
   * have pressed start, and the fresher of two answers is the one that decides
   * whether there is still a way in.
   */
  const join = (raw: string = typed) =>
    attempt(async () => {
      const code = parseMatchCode(raw);
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
        setProblem(SHUT);
        return;
      }
      saveName(player);

      // A room that's under way is closed, and the code with it. Everyone in a
      // duel answers the same round at the same moment, so somebody arriving at
      // round three isn't behind — they're a player the other three wait the
      // full thirty seconds for, every round, because a round only closes early
      // once everyone in the room has answered it.
      //
      // The exception is somebody who was already in: a locked phone, a
      // reloaded tab, a back button. They're on the list and their rounds are
      // filed, so they cost the room nothing and go straight back to it.
      if (roomPhase(found) !== "waiting") {
        if (!joinedHere(found.code, player)) {
          setProblem(SHUT);
          return;
        }
        setRoom(found);
        setPlayers(await fetchPlayers(found.code));
        setScreen("lobby");
        return;
      }

      const joined = await joinRoom(found.code, player);
      if (joined === "name-taken") {
        setProblem(`Somebody in that room is already ${player}. Try another name.`);
        setScreen("pick");
        return;
      }
      // Started while this was being typed: the room's own answer, and later
      // than the one fetched a moment ago.
      if (joined === "started") {
        setProblem(SHUT);
        return;
      }
      setRoom(found);
      setPlayers(await fetchPlayers(found.code));
      setScreen("lobby");
      // A code typed in is as good a link as a code followed, and a player who
      // reloads the lobby wants the room back rather than an empty box.
      showInvite(found.code);
    });

  /**
   * An invitation, checked once, before any of it is believed.
   *
   * A link is a way in only while the room is still taking names. A code whose
   * room has started is a duel going on without you, and the honest thing to do
   * with it is say so and hand back the ordinary duel screen: a dead link left
   * in the address bar is a URL promising a game it can't give, and it would be
   * reloaded. The exception is the one that always applies here — somebody
   * already in the room, whose phone locked or who pressed the link in the
   * group chat a second time, goes back to the round they are in.
   */
  useEffect(() => {
    if (!invite || ours.current === invite) return;
    let live = true;
    const dead = (why: string) => {
      setProblem(why);
      setScreen("pick");
      onInvite(null);
    };
    (async () => {
      setBusy(true);
      setProblem(null);
      try {
        const found = await fetchRoom(invite);
        if (!live) return;
        if (!found) {
          dead("No room with that code. Rooms don't outlast the day they're made.");
          return;
        }
        if (roomPhase(found) === "over") {
          dead(SHUT);
          return;
        }
        if (roomPhase(found) !== "waiting") {
          // Against the name this device has saved rather than whatever is in
          // the box, which at this point is that same name and nobody's choice
          // yet: a rejoin is decided by the name the room already has us under.
          if (!joinedHere(found.code, loadName())) {
            dead(SHUT);
            return;
          }
          const here = await fetchPlayers(found.code);
          if (!live) return;
          setRoom(found);
          setPlayers(here);
          setScreen("lobby");
          // Their round is under way, so the link is spent for them as well —
          // and a round belongs at the contest's own address.
          onInvite(null);
          return;
        }
        // Already on this room's list: a lobby that was reloaded, or the host
        // coming back to the link they are sending out. Nobody needs inviting
        // to a room they are standing in, so they go back to the lobby they
        // left — with the code still in the bar, since the room is still open
        // and the link still works.
        if (joinedHere(found.code, loadName())) {
          const here = await fetchPlayers(found.code);
          if (!live) return;
          ours.current = found.code;
          setRoom(found);
          setPlayers(here);
          setScreen("lobby");
          return;
        }
        setRoom(found);
        setScreen("invite");
      } catch (e) {
        if (live) dead(roomProblem(e));
      } finally {
        if (live) setBusy(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [invite, onInvite]);

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
        // The room is off, so the invitation is over — for the players in it
        // first of all. The code leaves the address bar here rather than when
        // somebody else fails to use it, because it has to be dead in the bar
        // of everyone who might paste it on.
        onInvite(null);
        onStart({ ...parsed, player, flat, borders, startAt });
      },
      Math.max(0, startAt - serverNow()),
    );
    return () => clearTimeout(id);
  }, [room, player, onStart, onInvite]);

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
    // Off the room, so off the room's address: this screen is not an invitation
    // to anything any more.
    onInvite(null);
  };

  return (
    <div className="menu setup">
      {/* The first screen's button only ever said Home, which the bar above
          now says on every screen. The later ones step back through this
          screen's own steps without leaving the duel, which is a different
          thing entirely and stays. */}
      {screen !== "pick" && (
        <div className="menu-bar">
          <button className="btn btn-ghost" onClick={back}>
            Back
          </button>
        </div>
      )}
      <h1>
        <span className="mode-emoji duel-mark" aria-hidden="true">
          <span className="duel-mark-blue">🥊</span>
          <span className="duel-mark-red">🥊</span>
        </span>{" "}
        Duel a Friend
      </h1>
      <p className="muted menu-sub">{RULES}</p>

      {!canPlayRooms && (
        <p className="h2h-taken">
          Duels need the shared leaderboard set up — see the README. Today's Round still
          works without it.
        </p>
      )}

      {problem && <p className="h2h-taken">{problem}</p>}

      {screen === "pick" && (
        <>
          <NameField value={name} onChange={setName} />
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
              {/* Last in the grid and shaped like the seven above it: the draw
                  is picked the same way a game is, so it's pressed the same way
                  a game is. What it is, rather than a game, the label says. */}
              <button className="h2h-mode" disabled={busy} onClick={() => make(anyMode())}>
                <span className="mode-emoji">🎲</span>
                <span>{busy ? "Opening…" : "Randomise the game"}</span>
              </button>
            </div>
          </div>
          <p className="muted h2h-code-hint">
            Everyone in the room plays this game, on your map, so nobody is racing a
            different question. Randomise draws one of the seven, and the lobby says
            which came up.
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
            <button className="btn btn-primary" disabled={busy} onClick={() => join()}>
              {busy ? "Looking…" : "Join"}
            </button>
          </div>
        </div>
      )}

      {/* Somebody arrived on a link. The room behind it has already been
          checked — it exists, and it is still taking people — so what is left
          is the two things they haven't been told: which duel this is, and that
          it wants a name. */}
      {screen === "invite" && (
        <div className="setup-panel h2h-code-panel">
          {room ? (
            <>
              <p className="muted h2h-code-label">You have been invited to a duel</p>
              <p className="h2h-code">{spellCode(room.code)}</p>
              <p className="h2h-setup">
                {modeTitle(room.mode)} · {MATCH_ROUNDS} rounds ·{" "}
                {room.mode === "tube" ? "tube map" : room.flat ? "flat map" : "3D globe"}
              </p>
              <NameField value={name} onChange={setName} />
              <div className="button-row">
                <button
                  className="btn btn-primary"
                  disabled={busy || !named}
                  onClick={() => join(room.code)}
                >
                  {busy ? "Joining…" : "Join the duel"}
                </button>
              </div>
              <p className="muted h2h-code-hint">
                {named
                  ? `${room.host} set this one up. You'll be in the lobby until they start it.`
                  : "Put a name in to play — it's what the others see on the table."}
              </p>
            </>
          ) : (
            <p className="muted h2h-code-hint">Looking up the room…</p>
          )}
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
                {/* The link rather than the code: it carries the code inside
                    it, and what people actually do with a room is paste it into
                    the chat they are all in already. The code stays in large
                    type above to be read out, which is the other way a room
                    fills up. */}
                <button
                  className="btn btn-ghost"
                  onClick={() => copy(inviteLink(room.code))}
                >
                  {copied ? "Copied ✓" : "Copy invite link"}
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
                  {busy ? "Starting…" : "Start the game"}
                </button>
              </div>
              <p className="muted h2h-code-hint">
                Send the link or read the code out, and press go once they're all on the
                list. Starting shuts the room and the link with it: everyone plays the
                same round at the same second, and anyone still following the link is
                too late for this one.
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
