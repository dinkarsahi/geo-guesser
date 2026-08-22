import { useMemo } from "react";
import FactCard from "../components/FactCard";
import { CURRENCY_LADDER } from "../data/ladders";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { countryPool } from "../data/countries";
import { currencyOf, currencyPool, type CurrencyTarget } from "../data/currencies";
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
  pool: CurrencyTarget[];
  shapes: WorldShapes;
}

/** The country spending this currency that the guess landed nearest. */
function nearestSpender(guess: Coord, money: CurrencyTarget): Coord {
  let best = money.countries[0];
  let bestKm = Infinity;
  for (const c of money.countries) {
    const km = haversineKm(guess, c);
    if (km < bestKm) {
      bestKm = km;
      best = c;
    }
  }
  return { lat: best.lat, lng: best.lng };
}

function CurrencyGame({
  onExit,
  settings,
  match,
  pool,
  shapes,
}: GameProps) {
  // Anywhere the money is spent is the right answer, so every country using it
  // is full marks — click Portugal or Finland for the euro and both are home.
  // Miss, and the distance that counts is from the country picked to the
  // nearest country that does spend it, rather than to some average of a
  // currency zone, which for the euro would be a field in Austria and for the
  // US dollar the middle of the Pacific.
  const game = useGame<CurrencyTarget>(pool, (m) => m, 2000, {
    // Rounds climb, and the currencies only ever seen at home are out of the
    // pool altogether — see `ladders.ts`.
    easierBy: CURRENCY_LADDER.easierBy,
    rounds: settings.rounds,
    // Counted in only on the globe, which is the one map with an arrival to
    // watch — see `intro`. The flat map is drawn by the time the round opens,
    // so a countdown in front of it is two seconds of nothing.
    intro: !settings.flat,
    hitTest: (guess, money) =>
      money.countries.some((c) => isInCountry(shapes, c.code, guess)),
    answerFor: nearestSpender,
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  const spenders = game.target.countries.map((c) => c.code);
  // The country pressed instead, painted red against the green everywhere the
  // money is spent — which for the euro is twenty countries, and picking your
  // own mistake out of that band by eye is not a thing anyone should have to do.
  const missCode = missedCountryCode(shapes, game.lastResult, game.phase === "result");

  return (
    <GameFrame
      title="Currency Spotter"
      game={game}
      onExit={onExit}
      match={match}
      // Naming the country isn't the lesson here — the money it spends is. A
      // round lost on the euro is worth something if it ends knowing that the
      // country picked was Botswana and that Botswana pays in pula.
      pickedLabel={(click) => {
        const feature = countryAt(shapes, click);
        if (!feature) return null;
        const spends = currencyOf(codeOf(feature));
        return {
          name: spends
            ? `${nameOf(feature)}, which spends the ${spends.name}. (${spends.code}, ${spends.symbol})`
            : nameOf(feature),
        };
      }}
      hint="Click a country that spends it."
      renderPrompt={(money) => (
        <div className="prompt-card">
          <span className="prompt-label">Where is this currency from?</span>
          {/* The code leads: it's the half of the question that names the
              money, where a lone $ or £ could be any of a dozen currencies. */}
          <span className="prompt-money">
            <span className="prompt-money-code">{money.code}</span>
            <span className="prompt-money-symbol">({money.symbol})</span>
          </span>
        </div>
      )}
      answerLabel={(money) => `${money.name} (${money.code})`}
      renderResultExtra={(money) => (
        <FactCard title={`${money.name} (${money.code})`} fact={money.fact} />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            borders={settings.borders}
            highlightCodes={spenders}
            missCode={missCode}
          />
        ) : (
          <GlobeMap
            {...props}
            borders={settings.borders}
            highlightCodes={spenders}
            missCode={missCode}
          />
        )
      }
    />
  );
}

export default function CurrencyGuesser(props: ModeProps) {
  // The currencies are grouped from the same country pool the flag round uses,
  // so nothing can be asked about until the map data lands.
  const shapes = useWorldShapes();
  const all = currencyPool(countryPool(shapes));
  const pool = useMemo(() => CURRENCY_LADDER.pool(all), [all]);

  if (!shapes || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              Menu
            </button>
          </div>
          <h2>Currency Spotter</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <CurrencyGame {...props} pool={pool} shapes={shapes} />;
}
