import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  type ProjectionFunction,
} from "react-simple-maps";
import { geoEquirectangular, geoPath } from "d3-geo";
import type { Coord } from "../lib/geo";
import type { GuessMapProps } from "./mapTypes";
import { useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import { DAY_TEXTURE, GREY_TEXTURE } from "../lib/textures";
import MapZoomControls from "./MapZoomControls";

const WIDTH = 1024;
const MAX_ZOOM = 12;

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
        sea: "#0f1620", border: "rgba(226,232,240,0.75)",
        highlight: "rgba(74,222,128,0.35)", highlightLine: "#6ee7a8",
      }
    : {
        // The land is the satellite image, so the only colours left to pick
        // are the lines drawn over it. White reads on every biome, which is
        // why the globe uses it too.
        sea: "#0b1a2b", border: "rgba(255,255,255,0.85)",
        highlight: "rgba(74,222,128,0.35)", highlightLine: "#4ade80",
      };

  // Plate carrée: longitude and latitude map straight onto x and y, which is
  // exactly how the texture is stored, so the image needs no warping to line
  // up with the country shapes — and the map is a rectangle, so it can fill a
  // screen without leaving gaps at the corners.
  const { projection, mapHeight } = useMemo(() => {
    const unit = geoEquirectangular().scale(1).translate([0, 0]);
    const [[x0, y0], [x1, y1]] = geoPath(unit).bounds({ type: "Sphere" });
    const scale = WIDTH / (x1 - x0);
    const height = Math.round((y1 - y0) * scale);
    const proj = geoEquirectangular()
      .scale(scale)
      .translate([-x0 * scale, -y0 * scale]);
    return { projection: proj, mapHeight: height };
  }, []);

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
    // The svg is sliced to cover its box, so it's scaled by whichever axis
    // needs the most and centred, with the overflow cropped off both ends.
    const cover = Math.max(rect.width / WIDTH, rect.height / mapHeight);
    const sx = (e.clientX - rect.left - (rect.width - WIDTH * cover) / 2) / cover;
    const sy = (e.clientY - rect.top - (rect.height - mapHeight * cover) / 2) / cover;
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
    <div className="world-wrap">
      <ComposableMap
        width={WIDTH}
        height={mapHeight}
        // The d3 projection instance is callable, which is what rsm uses at
        // runtime, despite the stricter declared type.
        projection={projection as unknown as ProjectionFunction}
        onClick={handleClick}
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: theme.sea,
          cursor: disabled ? "default" : "pointer",
        }}
      >
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
          {/* The same satellite imagery the globe is wrapped in. Plate carrée
              is how the file is stored, so it drops straight onto the sphere's
              bounds with no warping. */}
          <image
            href={night ? GREY_TEXTURE : DAY_TEXTURE}
            x={0}
            y={0}
            width={WIDTH}
            height={mapHeight}
            preserveAspectRatio="none"
          />

          {shapes && (
            <Geographies geography={{ type: "FeatureCollection", features: shapes.features }}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const lit = isHighlit(geo as unknown as CountryFeature);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      // The imagery underneath is the land, so the shapes are
                      // only ever outlines — except the country being revealed,
                      // which is washed over to pick it out.
                      fill={lit ? theme.highlight : "transparent"}
                      stroke={
                        lit ? theme.highlightLine : borders ? theme.border : "transparent"
                      }
                      strokeWidth={sz(lit ? 1.4 : 0.7)}
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
