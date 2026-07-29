import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  type ProjectionFunction,
} from "react-simple-maps";
import { geoEqualEarth, geoPath } from "d3-geo";
import type { Coord } from "../lib/geo";
import type { GuessMapProps } from "./mapTypes";
import { useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import MapZoomControls from "./MapZoomControls";

const WIDTH = 900;
const PAD = 8;
const MAX_ZOOM = 12;

const LAND_GRADIENT = "world-land-terrain";

// A flat map can't carry the globe's satellite texture, so the land takes a
// gradient banded by latitude instead, sampled off the same blue marble
// imagery: dark boreal green, olive steppe, desert sand across the dry
// latitudes, near-black rainforest at the equator, ice at the caps.
const LAND_BANDS: [lat: number, color: string][] = [
  [90, "#e4e8ea"],
  [80, "#d6dbdb"],
  [70, "#8b9082"],
  [62, "#4d5a3d"],
  [50, "#4f5c39"],
  [40, "#67684b"],
  [30, "#93815c"],
  [22, "#9a875e"],
  [13, "#6f6f40"],
  [3, "#3c5328"],
  [-8, "#40562c"],
  [-18, "#6a6943"],
  [-28, "#918059"],
  [-38, "#565e3d"],
  [-50, "#6b7260"],
  [-62, "#a9b0ad"],
  [-72, "#d9dddd"],
  [-90, "#e6eaea"],
];

type Pt = [number, number];

interface WorldMapProps extends GuessMapProps {
  night?: boolean;
  /** Draw the country outlines. */
  borders?: boolean;
  /** ISO alpha-2 code of a country to highlight once the answer is out. */
  highlightCode?: string | null;
}

interface Position {
  coordinates: [number, number];
  zoom: number;
}

export default function WorldMap({
  onGuess,
  guess,
  answer,
  disabled = false,
  night = false,
  borders = true,
  highlightCode = null,
}: WorldMapProps) {
  const shapes = useWorldShapes();

  const theme = night
    ? {
        sea: "#0f1620", land: "#2b3340", border: "#5a6474", graticule: "#1d2530",
        highlight: "#3f6d4a", highlightLine: "#6ee7a8",
      }
    : {
        // Same reading as the globe, laid out flat: deep ocean, and a land
        // fill that's the latitude gradient below rather than a colour.
        sea: "#1b3a5a", land: `url(#${LAND_GRADIENT})`, border: "#7c826e",
        graticule: "#27547d",
        highlight: "#bbf7d0", highlightLine: "#34d399",
      };

  // Equal Earth keeps country areas honest, which matters when the whole
  // country is the target. Fit it to the width, then size height to the data.
  const { projection, mapHeight } = useMemo(() => {
    const unit = geoEqualEarth().scale(1).translate([0, 0]);
    const [[x0, y0], [x1, y1]] = geoPath(unit).bounds({ type: "Sphere" });
    const scale = (WIDTH - 2 * PAD) / (x1 - x0);
    const height = Math.round((y1 - y0) * scale + 2 * PAD);
    const proj = geoEqualEarth()
      .scale(scale)
      .translate([PAD - x0 * scale, PAD - y0 * scale]);
    return { projection: proj, mapHeight: height };
  }, []);

  // The bands are latitudes, so ask the projection where each one lands. The
  // gradient is in the map's own coordinates, which means it stays pinned to
  // the continents as you pan and zoom.
  const landBands = useMemo(() => {
    const y = (lat: number) => (projection([0, lat]) as Pt)[1];
    const top = y(90);
    const bottom = y(-90);
    return {
      top,
      bottom,
      stops: LAND_BANDS.map(([lat, color]) => ({
        offset: (y(lat) - top) / (bottom - top),
        color,
      })),
    };
  }, [projection]);

  const defaultCenter = useMemo(
    () => projection.invert!([WIDTH / 2, mapHeight / 2]) as [number, number],
    [projection, mapHeight],
  );

  const [position, setPosition] = useState<Position>(() => ({
    coordinates: defaultCenter,
    zoom: 1,
  }));

  // Back to the whole world whenever a new round starts.
  const [prevAnswer, setPrevAnswer] = useState(answer);
  if (answer !== prevAnswer) {
    setPrevAnswer(answer);
    if (!answer) setPosition({ coordinates: defaultCenter, zoom: 1 });
  }

  const k = position.zoom;
  const anchor = useMemo(
    () => (projection(position.coordinates) ?? [WIDTH / 2, mapHeight / 2]) as Pt,
    [projection, position.coordinates, mapHeight],
  );
  const sz = (v: number) => v / k;

  const zoomBy = (factor: number) =>
    setPosition((p) => ({
      coordinates: p.coordinates,
      zoom: Math.min(MAX_ZOOM, Math.max(1, p.zoom * factor)),
    }));

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const sy = ((e.clientY - rect.top) / rect.height) * mapHeight;
    const inverted = projection.invert!([
      anchor[0] + (sx - WIDTH / 2) / k,
      anchor[1] + (sy - mapHeight / 2) / k,
    ]);
    if (!inverted) return;
    onGuess({ lat: inverted[1], lng: inverted[0] });
  };

  const project = (c: Coord) => projection([c.lng, c.lat]) as Pt | null;
  const guessPt = guess ? project(guess) : null;
  const answerPt = answer ? project(answer) : null;

  const isHighlit = (geo: CountryFeature) => {
    if (!highlightCode || !answer) return false;
    const code = (geo.properties?.ISO_A2_EH || geo.properties?.ISO_A2 || "").toLowerCase();
    return code === highlightCode.toLowerCase();
  };

  return (
    <div
      className="world-wrap"
      style={{ "--map-aspect": (WIDTH / mapHeight).toFixed(3) } as React.CSSProperties}
    >
      <ComposableMap
        width={WIDTH}
        height={mapHeight}
        // The d3 projection instance is callable, which is what rsm uses at
        // runtime, despite the stricter declared type.
        projection={projection as unknown as ProjectionFunction}
        onClick={handleClick}
        style={{
          width: "100%",
          height: "auto",
          background: theme.sea,
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <defs>
          <linearGradient
            id={LAND_GRADIENT}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={landBands.top}
            x2={0}
            y2={landBands.bottom}
          >
            {landBands.stops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={1}
          maxZoom={MAX_ZOOM}
          onMoveEnd={setPosition}
          filterZoomEvent={(event) => {
            const e = event as unknown as { button?: number };
            return !e.button;
          }}
        >
          {shapes && (
            <Geographies geography={{ type: "FeatureCollection", features: shapes.features }}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const lit = isHighlit(geo as unknown as CountryFeature);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={lit ? theme.highlight : theme.land}
                      // Without borders the land reads as one silhouette. That
                      // means outlining each country in the land colour rather
                      // than dropping the stroke: neighbours are separate paths
                      // and the antialiased seam between them would otherwise
                      // let the sea through as a hairline "border" — obvious
                      // against the dark night palette.
                      stroke={
                        lit ? theme.highlightLine : borders ? theme.border : theme.land
                      }
                      strokeWidth={sz(lit ? 1.2 : 0.5)}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          )}

          {guessPt && answerPt && (
            <line x1={guessPt[0]} y1={guessPt[1]} x2={answerPt[0]} y2={answerPt[1]}
              stroke="#c084fc" strokeWidth={sz(1.5)} strokeDasharray={`${sz(4)} ${sz(3)}`} />
          )}
          {guessPt && (
            <circle cx={guessPt[0]} cy={guessPt[1]} r={sz(5)} fill="#e11d48"
              stroke="#fff" strokeWidth={sz(1.5)} />
          )}
          {answerPt && (
            <circle cx={answerPt[0]} cy={answerPt[1]} r={sz(5)} fill="#22c55e"
              stroke="#fff" strokeWidth={sz(1.5)} />
          )}
        </ZoomableGroup>
      </ComposableMap>
      <MapZoomControls onZoomIn={() => zoomBy(1.6)} onZoomOut={() => zoomBy(1 / 1.6)} />
      {!shapes && <p className="map-loading muted">Loading the world…</p>}
    </div>
  );
}
