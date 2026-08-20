import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { countryPool } from "../data/countries";
import { exportOf, exportPool, type ExportTarget } from "../data/exports";
import { haversineKm, type Coord } from "../lib/geo";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import {
  anchorAt,
  codeOf,
  countryAt,
  isInCountry,
  missedCountryCode,
  nameOf,
  useWorldShapes,
  type WorldShapes,
} from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  pool: ExportTarget[];
  shapes: WorldShapes;
}

/** The country selling this good that the guess landed nearest. */
function nearestSeller(guess: Coord, good: ExportTarget): Coord {
  let best = good.countries[0];
  let bestKm = Infinity;
  for (const c of good.countries) {
    const km = haversineKm(guess, c);
    if (km < bestKm) {
      bestKm = km;
      best = c;
    }
  }
  return { lat: best.lat, lng: best.lng };
}

function ExportGame({ onExit, settings, match, pool, shapes }: GameProps) {
  // Any country whose main export this is counts, so all of them are full
  // marks — click Saudi Arabia or Norway for crude petroleum and both are
  // home. Miss, and the distance charged is to the nearest country that does
  // sell it, rather than to some average of the group, which for crude
  // petroleum would be a spot in the Arabian desert and for fish the sea.
  const game = useGame<ExportTarget>(pool, (m) => m, 2000, {
    rounds: settings.rounds,
    // Only on the globe, which is the one map with an arrival to watch.
    intro: !settings.flat,
    hitTest: (guess, good) =>
      good.countries.some((c) => isInCountry(shapes, c.code, guess)),
    answerFor: nearestSeller,
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  const sellers = game.target.countries.map((c) => c.code);
  // The country pressed instead, painted red against the green everywhere the
  // good is sold — which for crude petroleum is twenty-five countries, and
  // picking your own mistake out of that spread by eye is not a thing anybody
  // should have to do.
  const missCode = missedCountryCode(shapes, game.lastResult, game.phase === "result");

  return (
    <GameFrame
      title="Export Spotter"
      game={game}
      onExit={onExit}
      match={match}
      // Naming the country isn't the lesson — what it sells is. A round lost on
      // cocoa is worth something if it ends knowing the country picked was
      // Kenya and that Kenya's own answer would have been tea.
      pickedLabel={(click) => {
        const feature = countryAt(shapes, click);
        if (!feature) return null;
        const sells = exportOf(codeOf(feature));
        return {
          name: sells
            ? `${nameOf(feature)}, whose own main export is ${sells.name.toLowerCase()}.`
            : nameOf(feature),
        };
      }}
      hint="Click a country that sells more of it than anything else."
      renderPrompt={(good) => (
        <div className="prompt-card">
          <span className="prompt-label">Which country's main export is this?</span>
          <span className="prompt-export">
            <span className="prompt-export-emoji" aria-hidden="true">
              {good.emoji}
            </span>
            <span className="prompt-export-name">{good.name}</span>
          </span>
        </div>
      )}
      answerLabel={(good) => good.name}
      renderResultExtra={(good) => <FactCard title={good.name} fact={good.fact} />}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            borders={settings.borders}
            highlightCodes={sellers}
            missCode={missCode}
          />
        ) : (
          <GlobeMap
            {...props}
            borders={settings.borders}
            highlightCodes={sellers}
            missCode={missCode}
          />
        )
      }
    />
  );
}

/**
 * Export Spotter — the good, and every country that sells most of it.
 *
 * The currency round's shape applied to trade: the question names a thing
 * rather than a place, several countries are right, and the reveal paints all
 * of them. What differs is that a currency zone is a fact about agreements and
 * an export list is a fact about geology, climate and industrial history — so
 * the green countries on this map tend to explain themselves. Crude petroleum
 * lights up the Gulf and the Gulf of Guinea at once; cocoa lights two
 * neighbours in West Africa; cars light a band across central Europe.
 *
 * **Not a `ModeId`, and not on the shelf.** It is reached only at
 * `/gamemakersscrapbook/exportspotter` while its data is checked — see the
 * warning at the top of `data/exports.ts`, which is the thing standing between
 * this and the shelf. Becoming a real game means a `ModeId`, a mode letter in
 * `match.ts`, a path in `useRoute.ts`, a row in the CLAUDE.md table and a
 * re-run of `schema.sql`; the coming-soon card in `AllGames` becomes a button
 * at the same time.
 */
export default function ExportGuesser(props: ModeProps) {
  // Grouped from the same country pool the flag round uses, so nothing can be
  // asked about until the map data lands.
  const shapes = useWorldShapes();
  const pool = exportPool(countryPool(shapes));

  if (!shapes || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              Menu
            </button>
          </div>
          <h2>Export Spotter</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <ExportGame {...props} pool={pool} shapes={shapes} />;
}
