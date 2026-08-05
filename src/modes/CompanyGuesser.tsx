import FactCard from "../components/FactCard";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import NightToggle from "../components/NightToggle";
import WorldMap from "../components/WorldMap";
import { companyPool, logoUrl, type CompanyTarget } from "../data/companies";
import { countryPool } from "../data/countries";
import { useGame } from "../lib/useGame";
import { isInCountry, useWorldShapes, type WorldShapes } from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  pool: CompanyTarget[];
  shapes: WorldShapes;
}

function CompanyGame({ onExit, night, onToggleNight, settings, pool, shapes }: GameProps) {
  // The country is the answer, so anywhere inside its borders is full marks,
  // and a miss is measured to the country itself. The town the head office
  // happens to sit in is never asked for, so marking it would only invite the
  // player to aim finer than the question deserves.
  const game = useGame<CompanyTarget>(pool, (c) => c, 2000, {
    endless: settings.endless,
    hitTest: (guess, company) => isInCountry(shapes, company.code, guess),
  });

  return (
    <GameFrame
      title="Company HQ"
      game={game}
      onExit={onExit}
      night={night}
      onToggleNight={onToggleNight}
      hitLabel={(company) => company.country}
      hint="Click the country it's headquartered in."
      renderPrompt={(company) => (
        <div className="prompt-card">
          <span className="prompt-label">Where is this company headquartered?</span>
          <span className="prompt-company">
            {/* On its own plate: these marks come in the company's own colour,
                and several of them are black, which the bar is too. */}
            <span className="company-logo">
              <img src={logoUrl(company.slug)} alt="" width={30} height={30} />
            </span>
            <span className="prompt-company-name">{company.name}</span>
          </span>
        </div>
      )}
      renderResultExtra={(company) => (
        <FactCard
          title={`${company.name} — ${company.country}`}
          fact={company.fact}
        />
      )}
      renderMap={(props) =>
        settings.flat ? (
          <WorldMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
          />
        ) : (
          <GlobeMap
            {...props}
            night={night}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
          />
        )
      }
    />
  );
}

export default function CompanyGuesser(props: ModeProps) {
  // The countries come from the map data, and a company can't be asked about
  // until the country it belongs to is on it.
  const shapes = useWorldShapes();
  const pool = companyPool(countryPool(shapes));

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
          <h2>Company HQ</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <CompanyGame {...props} pool={pool} shapes={shapes} />;
}
