import { scoreFromClockGap } from "../data/timeZones";
import { scoreFromStops } from "../data/tube";
import { MAX_ROUND_SCORE, scoreFromDistance } from "../lib/geo";
import { MATCH_GRACE_MS, MATCH_ROUNDS, MATCH_ROUND_MS } from "../lib/match";
import { scoreFromPopulationRatio } from "../data/populations";
import AnchorDiagram from "./AnchorDiagram";
import ScoreCurve from "./ScoreCurve";

/** The scale every world-map game is marked on, in kilometres. */
const DISTANCE_SCALE = 2000;

/** How near a city counts as the city — see `CITY_SPOT_ON_KM`. */
const CITY_FREE_KM = 50;

interface FaqProps {
  onAbout: () => void;
  onPrivacy: () => void;
}

/**
 * The long answer: every rule, and the curve behind each one.
 *
 * Split from About because the two are read by different people at different
 * moments. About is somebody deciding whether to play; this is somebody who has
 * played, been given a number they didn't expect, and wants to know why. Mixed
 * into one page the first reader gave up halfway and the second couldn't find
 * the part they came for.
 *
 * **Every curve here is drawn by the function that scores it** — see
 * `ScoreCurve`. A page explaining the marking is the last place the marking
 * should be written out a second time: the copy is right on the day it is
 * written and quietly wrong ever after.
 */
export default function Faq({ onAbout, onPrivacy }: FaqProps) {
  return (
    <div className="menu doc">
      <h1>FAQ</h1>
      <p className="muted menu-sub">
        How the scoring actually works, game by game, with the curves it is drawn
        from.
      </p>

      <div className="doc-body">
        <section className="doc-section">
          <h2>Scoring</h2>

          <div className="faq-card">
            <h3>How is a round marked?</h3>
            <p>
              Every round is out of <strong>{MAX_ROUND_SCORE}</strong>, and your score
              for a game is the <strong>average</strong> of its {MATCH_ROUNDS} rounds
              rather than the total — so 78 means the same thing however many rounds
              you played.
            </p>
            <p>
              Four of the seven games are marked on distance. Draw a straight line from
              where you pressed to where the answer is, measure it, and read the score
              off this curve.
            </p>
            <ScoreCurve
              measures="Kilometres from the answer"
              score={(km) => scoreFromDistance(km, DISTANCE_SCALE)}
              max={6000}
              ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000]}
              tick={(km) => km.toLocaleString()}
              marks={[
                { at: 500, reads: "500 km" },
                { at: 1200, reads: "1,200 km" },
                { at: 3000, reads: "3,000 km" },
              ]}
            />
          </div>

          <div className="faq-card">
            <h3>Why is being slightly wrong worth so much?</h3>
            <p>
              Because the curve is deliberately shaped that way. It is a{" "}
              <strong>Gaussian</strong> — <code>100 · exp(−(off / scale)²)</code> — and
              the squared term is what makes it leave the top slowly and then fall
              away.
            </p>
            <p>
              A curve that fell steadily instead would charge most for the very first
              step away from the answer, which taxes the player who was nearly right at
              the same rate as the one who wasn't. Here, being 500 km out still pays 94:
              on a planet 40,000 km round, 500 km <em>is</em> knowing where it is. Past
              twice the scale it is worth 2 rather than 14, because by then you didn't.
            </p>
          </div>

          <div className="faq-card">
            <h3>I clicked the country right next door and lost hundreds of points.</h3>
            <p>
              This is the most misread rule in the game, and it is worth a picture.
              Neither end of that measurement is a border. Your click is moved to the{" "}
              <strong>middle of whichever country you pressed</strong>, and the answer
              is the <strong>middle of the country asked for</strong>. Two countries
              that touch can have five hundred kilometres between their middles.
            </p>
            <AnchorDiagram />
            <p>
              It works this way so that <em>which part</em> of a wrong country you
              pressed cannot change your score. Measured border to border, pressing the
              far corner of a neighbour would beat pressing its middle — and the game
              would be marking a question nobody asked. It also means the reverse: press
              anywhere inside the right country, on its coast or in its capital, and it
              is full marks.
            </p>
          </div>

          <div className="faq-card">
            <h3>Is anything given away for free?</h3>
            <p>
              In City Spotter, the first <strong>{CITY_FREE_KM} km</strong> cost
              nothing. A city is one coordinate in the data and forty miles of streets
              in life — Greater London is fifty across, and its coordinate is a spot in
              Westminster somebody had to choose. Docklands is London by any reading,
              and marking it down against Westminster would be scoring which part of the
              city you pressed.
            </p>
          </div>
        </section>

        <section className="doc-section">
          <h2>The games that aren't marked on distance</h2>
          <p>
            Three of the seven ignore distance entirely. If you assume they don't, a
            good score reads as a mistake — which is the main reason this page exists.
          </p>

          <div className="faq-card">
            <h3>Population Spotter</h3>
            <p>
              Marked on <strong>the number, not the place</strong>. You are shown a
              population and you press a country; what counts is how many times out that
              country's population is. A country on the other side of the world with the
              right number of people is a good answer, and is paid like one.
            </p>
            <ScoreCurve
              measures="How many times out the population is"
              // From ×1 rather than from zero: a ratio has no meaning below
              // one, and an axis that started there drew a flat stretch of
              // full marks over readings that can't happen.
              score={scoreFromPopulationRatio}
              min={1}
              max={12}
              ticks={[1, 2, 4, 6, 8, 10, 12]}
              tick={(f) => `×${f}`}
              marks={[
                { at: 2, reads: "×2" },
                { at: 5, reads: "×5" },
                { at: 10, reads: "×10" },
              ]}
              ceiling={95}
            />
            <p>
              Note the ceiling. A country that isn't the answer is marked out of{" "}
              <strong>95</strong>, however good its population is — the last five points
              belong to naming the right country and nothing else can earn them. Without
              that, a wrong country within a few per cent of the right figure rounded up
              to a full hundred, and the game called a miss a perfect answer.
            </p>
          </div>

          <div className="faq-card">
            <h3>Tube Station Spotter</h3>
            <p>
              Marked in <strong>stops, not metres</strong>. Whichever station's patch of
              the map you pressed is your answer, and you are charged the ride from
              there to the station asked for.
            </p>
            <ScoreCurve
              measures="Stops between your station and the answer"
              score={scoreFromStops}
              max={20}
              ticks={[0, 4, 8, 12, 16, 20]}
              tick={(s) => `${s}`}
              marks={[
                { at: 1, reads: "1 stop" },
                { at: 4, reads: "4 stops" },
                { at: 12, reads: "12 stops" },
              ]}
            />
            <p>
              There is one exception, and the game announces it when it applies. Out in
              the far zones the stations thin out, so each one has a{" "}
              <strong>Mind the Gap Area</strong> around it. If the answer falls inside
              the area around the station you pressed, you are charged for how crowded
              that area is instead of for the ride — one stop for the answer, plus one
              for every other station inside it. Whichever is kinder counts, so the rule
              can only ever help.
            </p>
          </div>

          <div className="faq-card">
            <h3>Time Zone Spotter</h3>
            <p>
              Marked in <strong>hours off the clock</strong>. You are shown a clock that
              is genuinely running, and you press a country where that is the time.
            </p>
            <ScoreCurve
              measures="Hours away from the clock shown"
              score={(hours) => scoreFromClockGap(hours * 60)}
              max={6}
              ticks={[0, 1, 2, 3, 4, 5, 6]}
              tick={(h) => `${h} h`}
              marks={[
                { at: 1, reads: "1 hour" },
                { at: 2, reads: "2 hours" },
                { at: 3, reads: "3 hours" },
              ]}
            />
            <p>
              This curve is tuned tighter than the others on purpose. There are only
              about thirty-five clocks in the world and forty-six countries share the
              busiest of them, so being roughly right is far easier here than anywhere
              else in the game.
            </p>
            <p>
              Countries that keep more than one clock are cut into pieces, so pressing
              Perth answers Perth's time rather than Sydney's, and the reveal says which
              part you pressed.
            </p>
          </div>
        </section>

        <section className="doc-section">
          <h2>Playing other people</h2>

          <div className="faq-card">
            <h3>Today's Round</h3>
            <p>
              One game a day for the whole world, chosen by the date rather than by you,
              and <strong>one go a device</strong>. There is no clock: today's round is
              played whenever your day allows, so hurrying you through it would measure
              something other than whether you know the map.
            </p>
            <p>
              Your name is asked for at the end rather than the beginning — there is a
              score to put it to by then, and nobody who wanders off mid-game is asked
              to name themselves for a round they never finished.
            </p>
          </div>

          <div className="faq-card">
            <h3>Duel a Friend</h3>
            <p>
              A room with a code, and everyone answering the same round at the same
              moment. Rounds last{" "}
              <strong>{Math.round(MATCH_ROUND_MS / 1000)} seconds</strong> each, and the
              first <strong>{Math.round(MATCH_GRACE_MS / 1000)} seconds</strong> are
              free — after that, sitting on a round costs up to 30% of what the guess
              was worth.
            </p>
            <p>
              That penalty comes <em>off</em> the accuracy rather than being added on
              top, so a duel is still marked out of the same {MAX_ROUND_SCORE} as
              everything else — and a fast wrong answer still loses to a slow right one.
              A round also ends early the moment everybody in the room has answered, so
              nobody sits out a timer for the sake of it.
            </p>
          </div>

          <div className="faq-card">
            <h3>Why can't I play today's round twice?</h3>
            <p>
              Because there is one table and everyone is on it. The block is on the{" "}
              <strong>device</strong> rather than the name, so typing something else
              isn't a second go — and we will be honest about the ceiling on that: no web
              page can truly identify a device. A private window or a second browser buys
              another attempt, and only accounts would close that properly.
            </p>
            <p>
              It also means a shared laptop is one go between everyone who picks it up,
              which is why the message says "this device has already played" rather than
              "you have".
            </p>
          </div>
        </section>

        <section className="doc-section">
          <h2>The maps</h2>

          <div className="faq-card">
            <h3>Why does the globe take a moment to arrive?</h3>
            <p>
              The world is satellite imagery cut into tiles, which sharpen as you zoom
              rather than being one photograph magnified. Those tiles have to travel, and
              the globe's coastlines have to be built before anything can be drawn on
              them, so a game on the globe waits five seconds at the start — once a game,
              never between rounds — and gives you a fall through space to watch while it
              does. The question is held back until the round can actually take your
              answer.
            </p>
          </div>

          <div className="faq-card">
            <h3>Can I turn the animations down?</h3>
            <p>
              Yes, and it is a setting on your device rather than one in here — which
              means you set it once and every site you visit obeys it, instead of hunting
              for the same switch on each of them. It is meant for anyone who finds
              movement on a screen uncomfortable or distracting, and it is worth knowing
              about even if you have never gone looking for it:
            </p>
            <ul className="doc-bullets">
              <li>
                <strong>Windows</strong> — Settings → Accessibility → Visual effects →
                Animation effects.
              </li>
              <li>
                <strong>macOS</strong> — System Settings → Accessibility → Display →
                Reduce motion.
              </li>
              <li>
                <strong>iPhone and iPad</strong> — Settings → Accessibility → Motion →
                Reduce Motion.
              </li>
              <li>
                <strong>Android</strong> — Settings → Accessibility → Remove animations,
                though the wording moves around between makes of phone.
              </li>
            </ul>
            <p>
              With it on, SpotOn stops the things that move for effect. Today's Round is
              named outright instead of being drawn for, the line to the answer appears
              rather than being drawn across the map, and the tube map cuts to the whole
              network at the reveal instead of pulling back to it.
            </p>
            <p>
              One thing it does <em>not</em> stop yet is the globe's own camera — the
              fall through space at the start of a game, and the swing round to the
              answer at the end of a round. If that is the part you wanted rid of, the
              flat map under <strong>Settings</strong> has none of it.
            </p>
          </div>

          <div className="faq-card">
            <h3>Can I turn the borders off, or use a flat map?</h3>
            <p>
              Both, under <strong>Settings</strong>, and the choice is remembered. The
              default is the globe with borders hidden: the question is where a place{" "}
              <em>is</em>, and an outlined world answers a good part of that before you
              have looked. In a duel everyone plays on the host's map, so the room is
              looking at one world.
            </p>
          </div>
        </section>

        <section className="doc-section">
          <h2>Anything else</h2>
          <p>
            <button className="btn btn-ghost" onClick={onAbout}>
              What SpotOn is
            </button>{" "}
            <button className="btn btn-ghost" onClick={onPrivacy}>
              What it keeps about you
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
