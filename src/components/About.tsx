import { MAX_ROUND_SCORE } from "../lib/geo";
import { MATCH_MODES, MATCH_ROUNDS } from "../lib/match";
import type { ModeId } from "../modes/ModeProps";

/**
 * What each game asks, and what it marks you on.
 *
 * Written here rather than taken from the cards on the shelf, because those
 * ask a question — "Good with numbers?" — and this answers one. A player on
 * this page has stopped browsing and wants to know how the thing works.
 *
 * The second half is the part worth the space: four of the seven are not
 * marked on distance at all, and a player who assumes they are will read a
 * good score as a mistake.
 */
const GAMES: Record<ModeId, { asks: string; marked: string }> = {
  city: {
    asks: "The name of a city.",
    marked: "How far your click landed from it, with the first 50 km free.",
  },
  flag: {
    asks: "A flag.",
    marked: "Full marks for the right country, otherwise how far away you were.",
  },
  currency: {
    asks: "A currency code and its symbol.",
    marked:
      "Full marks for any country that spends it — twenty of them share the euro — otherwise the distance to the nearest one.",
  },
  company: {
    asks: "A company's logo.",
    marked: "Full marks for the country its head office is in, otherwise the distance.",
  },
  population: {
    asks: "A population figure.",
    marked:
      "How close the population of the country you picked is to the one asked for. Not distance at all: a country on the other side of the world with the right number of people is a good answer.",
  },
  tube: {
    asks: "The name of a London Underground station.",
    marked:
      "The number of stops between the station you clicked and the one asked for — or, if the answer sits inside your station's own patch of map, how crowded that patch is.",
  },
  timezone: {
    asks: "A clock, running.",
    marked:
      "How many hours out the country you picked is. Countries that keep several clocks are cut into pieces, so a click on Perth answers Perth's time and not Sydney's.",
  },
};

interface AboutProps {
  onPlay: () => void;
  onCredits: () => void;
  onFaq: () => void;
}

/**
 * What SpotOn is, in the time somebody will actually give it.
 *
 * **Deliberately short, and it used to be long.** This page carried the
 * scoring curve, every game's marking rule, the three contests and the storage
 * policy all at once — everything true about the app, on one page, read by
 * nobody. It is now the answer to "what is this?", which is the question
 * somebody arriving actually has, and the FAQ answers "why did I score that?",
 * which is a different person on a different day.
 */
export default function About({ onPlay, onCredits, onFaq }: AboutProps) {
  return (
    <div className="menu doc">
      <h1>About SpotOn</h1>
      <p className="muted menu-sub">
        A geography guessing game. You are shown something — a city's name, a flag, a
        clock — and you say where in the world it belongs by pressing the map.
      </p>

      <div className="doc-body">
        <section className="doc-section">
          <h2>What it is</h2>
          <p>
            SpotOn is a geography guessing game made of {MATCH_MODES.length} smaller
            ones. Each shows you something — a city's name, a flag, a currency, a
            company's logo, a population figure, a station name, a running clock — and
            asks you to say where in the world it belongs by pressing the map.
          </p>
          <p>
            A game is {MATCH_ROUNDS} rounds. Every round is marked out of{" "}
            {MAX_ROUND_SCORE} and the {MATCH_ROUNDS} are averaged into one mark out of{" "}
            {MAX_ROUND_SCORE}, so a score means the same thing whichever game you
            played. Being nearly right is worth a great deal: the marking leaves full
            marks slowly and then falls away, so pointing at the right part of the
            world is paid properly rather than treated as a miss.
          </p>
        </section>

        <section className="doc-section">
          <h2>The games</h2>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>You are shown</th>
                  <th>Marked on</th>
                </tr>
              </thead>
              <tbody>
                {MATCH_MODES.map((m) => (
                  <tr key={m.id}>
                    <th scope="row">
                      <span className="mode-emoji" aria-hidden="true">
                        {m.emoji}
                      </span>{" "}
                      {m.title}
                    </th>
                    <td>{GAMES[m.id].asks}</td>
                    <td>{GAMES[m.id].marked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Three of them are not marked on distance at all, which is worth knowing
            before you read a good score as a mistake. The{" "}
            <button className="doc-link" onClick={onFaq}>
              FAQ
            </button>{" "}
            has the curve behind each one.
          </p>
        </section>

        <section className="doc-section">
          <h2>Three ways to play</h2>
          <dl className="doc-list">
            <dt>Today's Round</dt>
            <dd>
              One game a day, the same one for everybody, on a table the whole world
              shares. No clock — take as long over each round as you like — and one go
              a device, so the table means something. Tomorrow it is a different game.
            </dd>
            <dt>Duel a Friend</dt>
            <dd>
              A room with a code and a link to send. Everybody answers the same round at
              the same moment, against the clock, and the room gets one table at the end.
            </dd>
            <dt>All Games</dt>
            <dd>
              All {MATCH_MODES.length}, as often as you like. Nothing is filed anywhere
              and nothing is rationed.
            </dd>
          </dl>
        </section>

        <section className="doc-section">
          <h2>Where it came from</h2>
          <p>
            The obvious ancestor is GeoGuessr, which asks where a photograph was taken.
            SpotOn asks the question the other way round: it gives you the answer — the
            name, the flag, the clock — and asks for the place. That flip is what lets
            one engine carry {MATCH_MODES.length} different games, because the only
            thing that changes between them is what the question is and how a miss is
            measured.
          </p>
          <p>
            The daily habit is Wordle's: one puzzle a day, the same one for everybody,
            and it is over when it is over. The difference is that Wordle has no
            leaderboard, so cheating it only cheats you — SpotOn has a shared table,
            which is why today's round is one go a device.
          </p>
          <p>
            The Underground game owes its look to the map on the wall of every station
            in London, though it is not that map: it is drawn from the stations' real
            coordinates, so it is a geographic map of the network rather than a copy of
            the famous diagram. That is why it looks unfamiliar if you know the poster
            by heart.
          </p>
        </section>

        <section className="doc-section">
          <h2>The world it draws</h2>
          <p>
            The globe and the flat map are satellite imagery published by NASA, cut into
            tiles so the world sharpens as you zoom rather than being one photograph
            magnified. Every border and coastline is Natural Earth's.
          </p>
          <p>
            <button className="btn btn-ghost" onClick={onCredits}>
              Where everything came from
            </button>{" "}
            <button className="btn btn-ghost" onClick={onFaq}>
              How the scoring works
            </button>
          </p>
        </section>
      </div>

      <div className="button-row setup-start">
        <button className="btn btn-primary" onClick={onPlay}>
          Play a game
        </button>
      </div>
    </div>
  );
}
