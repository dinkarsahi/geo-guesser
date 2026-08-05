import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import NightToggle from "../components/NightToggle";
import WorldMap from "../components/WorldMap";
import { countryPool } from "../data/countries";
import { currencyOf, currencyPool, type CurrencyTarget } from "../data/currencies";
import { haversineKm, type Coord } from "../lib/geo";
import { useGame } from "../lib/useGame";
import {
  anchorAt,
  codeOf,
  countryAt,
  isInCountry,
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

function CurrencyGame({ onExit, night, onToggleNight, settings, pool, shapes }: GameProps) {
  // Anywhere the money is spent is the right answer, so every country using it
  // is full marks — click Portugal or Finland for the euro and both are home.
  // Miss, and the distance that counts is from the country picked to the
  // nearest country that does spend it, rather than to some average of a
  // currency zone, which for the euro would be a field in Austria and for the
  // US dollar the middle of the Pacific.
  const game = useGame<CurrencyTarget>(pool, (m) => m, 2000, {
    endless: settings.endless,
    hitTest: (guess, money) =>
      money.countries.some((c) => isInCountry(shapes, c.code, guess)),
    answerFor: nearestSpender,
    guessAt: (guess) => anchorAt(shapes, guess),
  });

  const spenders = game.target.countries.map((c) => c.code);

  return (
    <GameFrame
      title="Currency Guesser"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      hitLabel={(money) => money.name}
      // Naming the country isn't the lesson here — the money it spends is. A
      // round lost on the euro is worth something if it ends knowing that the
      // country picked was Botswana and that Botswana pays in pula. Written
      // the way the question itself is: the sign first, then the code.
      pickedLabel={(click) => {
        const feature = countryAt(shapes, click);
        if (!feature) return null;
        const spends = currencyOf(codeOf(feature));
        return {
          name: spends
            ? `${nameOf(feature)}, which spends the ${spends.name}`
            : nameOf(feature),
          detail: spends ? `${spends.symbol} ${spends.code}` : undefined,
        };
      }}
      hint="Click a country that spends it."
      renderPrompt={(money) => (
        <div className="prompt-card">
          <span className="prompt-label">Where is this currency from?</span>
          <span className="prompt-money">
            <span className="prompt-money-symbol">{money.symbol}</span>
            <span className="prompt-money-code">{money.code}</span>
          </span>
        </div>
      )}
      renderResultExtra={(money) => (
        <FactCard title={`${money.name} (${money.code})`} fact={money.fact} />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={spenders}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={spenders}
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
  const pool = currencyPool(countryPool(shapes));

  if (!shapes || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              ← Menu
            </button>
            <NightToggle night={props.night} onToggle={props.onToggleNight} />
          </div>
          <h2>Currency Guesser</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <CurrencyGame {...props} pool={pool} shapes={shapes} />;
}
