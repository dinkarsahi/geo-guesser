import { MAX_ROUND_SCORE } from "../lib/geo";
import { MATCH_MODES, MATCH_ROUNDS } from "../lib/match";
import { CONTACT_EMAIL } from "../lib/site";
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
  onBack: () => void;
  onPlay: () => void;
  onCredits: () => void;
  onPrivacy: () => void;
}

/**
 * What the game is, and how it is marked.
 *
 * Every screen in SpotOn is a thing to press. This is the one page that is a
 * thing to read: what a round is worth, why a near miss scores so much better
 * than it looks like it should, and which games aren't marked on distance —
 * the last of which is the single most common way to misread a score here.
 */
export default function About({ onBack, onPlay, onCredits, onPrivacy }: AboutProps) {
  return (
    <div className="menu doc">
      <div className="menu-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          ← Home
        </button>
      </div>

      <h1>About SpotOn</h1>
      <p className="muted menu-sub">
        A geography guessing game. You are shown something — a city's name, a flag, a
        clock — and you say where in the world it belongs by pressing the map.
      </p>

      <div className="doc-body">
        <section className="doc-section">
          <h2>How a round is marked</h2>
          <p>
            Every round is worth up to {MAX_ROUND_SCORE} points, and a game is{" "}
            {MATCH_ROUNDS} rounds averaged into one mark out of {MAX_ROUND_SCORE}. So a
            score means the same thing whichever game you played it in.
          </p>
          <p>
            Being nearly right is worth a great deal. The scoring curve leaves full
            marks slowly and then falls away: on the games marked by distance, 500 km
            out still scores 94, 1,200 km scores 70, and 3,000 km scores 11. Pointing at
            the right continent is not the same as pointing at the right country, and
            the marking says so — but it is not the wipe-out that a plain
            further-is-worse rule would hand you.
          </p>
          <p>
            Land inside the country being asked for and you get all{" "}
            {MAX_ROUND_SCORE} of it, wherever in that country you pressed. Cities are a
            point rather than an area, so they carry 50 km of free ground around them: a
            city is one coordinate in the data and forty miles of streets in life.
          </p>
        </section>

        <section className="doc-section">
          <h2>Three ways to play</h2>
          <dl className="doc-list">
            <dt>Today's Round</dt>
            <dd>
              One game a day, the same one for everybody, on a table the whole world
              shares. There is no clock — take as long over each round as you like — and
              one go a device, so the table means something. Tomorrow it is a different
              game.
            </dd>
            <dt>Duel a Friend</dt>
            <dd>
              A room with a code and a link to send. Everybody answers the same round at
              the same moment, 30 seconds each, and the first ten seconds of a round are
              free before the clock starts costing you. One table at the end, and then
              the code is done.
            </dd>
            <dt>All Games</dt>
            <dd>
              All seven, as often as you like, on the globe or the flat map, with the
              borders drawn on or left off. Nothing is filed anywhere and nothing is
              rationed.
            </dd>
          </dl>
        </section>

        <section className="doc-section">
          <h2>The seven games</h2>
          <p>
            Four of them are marked on something other than distance, which is worth
            knowing before you read a score as a mistake.
          </p>
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
        </section>

        <section className="doc-section">
          <h2>The maps</h2>
          <p>
            The world is drawn from satellite imagery published by NASA, cut into tiles
            so that it sharpens as you zoom rather than being one photograph magnified.
            The borders and coastlines are Natural Earth's. The London Underground map
            is drawn from the stations' own coordinates — it is a geographic map of the
            network rather than a copy of the famous diagram, which is why it looks
            unfamiliar if you know the poster by heart.
          </p>
          <p>
            <button className="btn btn-ghost" onClick={onCredits}>
              Where everything came from ▸
            </button>
          </p>
        </section>

        <section className="doc-section">
          <h2>What SpotOn keeps</h2>
          <p>
            There are no accounts and nothing to sign into. If you play a round that
            goes on a table, the name you typed, your score and how long you took are
            filed against that game's code so the standings can be drawn. Your name, your
            results and a record of which rounds you have already played are also kept in
            your own browser, which is what lets the game remember you between visits.
          </p>
          <p>
            The whole of it, including how to have a score taken off a table, is on the{" "}
            <button className="doc-link" onClick={onPrivacy}>
              privacy page
            </button>
            . Anything else, write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </div>

      <div className="button-row setup-start">
        <button className="btn btn-primary" onClick={onPlay}>
          Play a game ▸
        </button>
      </div>
    </div>
  );
}
