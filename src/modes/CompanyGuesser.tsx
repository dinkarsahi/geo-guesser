import { useMemo } from "react";
import FactCard from "../components/FactCard";
import { COMPANY_LADDER } from "../data/ladders";
import GameFrame from "../components/GameFrame";
import GlobeMap from "../components/GlobeMap";
import WorldMap from "../components/WorldMap";
import { companyPool, logoUrl, type CompanyTarget } from "../data/companies";
import { countryPool } from "../data/countries";
import { matchOptions } from "../lib/match";
import { useGame } from "../lib/useGame";
import {
  anchorAt,
  countryNameAt,
  isInCountry,
  missedCountryCode,
  useWorldShapes,
  type WorldShapes,
} from "../lib/worldShapes";
import type { ModeProps } from "./ModeProps";

interface GameProps extends ModeProps {
  pool: CompanyTarget[];
  shapes: WorldShapes;
}

function CompanyGame({
  onExit,
  settings,
  match,
  pool,
  shapes,
}: GameProps) {
  // The country is the answer, so anywhere inside its borders is full marks,
  // and a miss is measured to the country itself. The town the head office
  // happens to sit in is never asked for, so marking it would only invite the
  // player to aim finer than the question deserves.
  const game = useGame<CompanyTarget>(pool, (c) => c, 2000, {
    // Rounds climb, and the brands nobody outside one country has met are out
    // of the pool altogether — see `ladders.ts`.
    easierBy: COMPANY_LADDER.easierBy,
    rounds: settings.rounds,
    // Counted in only on the globe, which is the one map with an arrival to
    // watch — see `intro`. The flat map is drawn by the time the round opens,
    // so a countdown in front of it is two seconds of nothing.
    intro: !settings.flat,
    hitTest: (guess, company) => isInCountry(shapes, company.code, guess),
    guessAt: (guess) => anchorAt(shapes, guess),
    ...matchOptions(match),
  });

  // The country pressed instead, painted red under the green one — the "you
  // picked Sweden" line in a form you can see from across the map.
  const missCode = missedCountryCode(shapes, game.lastResult, game.phase === "result");

  return (
    <GameFrame
      title="Corporate HQ Spotter"
      game={game}
      onExit={onExit}
      match={match}
      pickedLabel={(click) => {
        const name = countryNameAt(shapes, click);
        return name ? { name } : null;
      }}
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
      // The company names the round and the country is the answer to it, so
      // the line carries both — "Nintendo" alone doesn't say what was missed.
      answerLabel={(company) => `${company.name} — ${company.country}`}
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
            borders={settings.borders}
            highlightCodes={[game.target.code]}
            missCode={missCode}
          />
        ) : (
          <GlobeMap
            {...props}
            borders={settings.borders}
            highlightCodes={[game.target.code]}
            missCode={missCode}
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
  const all = companyPool(countryPool(shapes));
  const pool = useMemo(() => COMPANY_LADDER.pool(all), [all]);

  if (!shapes || !pool.length) {
    return (
      <div className="game">
        <header className="game-header">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={props.onExit}>
              Menu
            </button>
          </div>
          <h2>Corporate HQ Spotter</h2>
          <span />
        </header>
        <p className="muted hint">Loading the world…</p>
      </div>
    );
  }

  return <CompanyGame {...props} pool={pool} shapes={shapes} />;
}
