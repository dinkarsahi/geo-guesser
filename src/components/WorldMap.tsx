import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { countryAt, useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import { DAY_TEXTURE, GREY_TEXTURE } from "../lib/textures";
import MapZoomControls from "./MapZoomControls";

const WIDTH = 1024;
const MAX_ZOOM = 12;
// Below 1 the map is smaller than the window and the backdrop shows around it,
// which is why the backdrop is the ocean's own colour.
const MIN_ZOOM = 0.45;

// How long the map takes to travel to the answer once it's out, and how close
// it comes to rest — near enough to see where you've landed, far enough that
// the line back to your guess still leads somewhere.
const REVEAL_MS = 1200;
const REVEAL_ZOOM = 2.5;

/**
 * A gently bowed path from one point to the other, standing in for the arc the
 * globe lifts off its surface. It always bows towards the top of the map, so
 * two places the same distance apart are drawn the same way round wherever
 * they are, and the bow is capped so a guess on the far side of the world
 * doesn't balloon off the top of it.
 */
function arcBetween(a: Pt, b: Pt): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bow = Math.min(len * 0.16, 70);
  const cx = (a[0] + b[0]) / 2 + nx * bow;
  const cy = (a[1] + b[1]) / 2 + ny * bow;
  return `M ${a[0]} ${a[1]} Q ${cx} ${cy} ${b[0]} ${b[1]}`;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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
        sea: "#000000", border: "rgba(226,232,240,0.75)",
        highlight: "rgba(74,222,128,0.35)", highlightLine: "#6ee7a8",
      }
    : {
        // The land is the satellite image, so the only colours left to pick
        // are the lines drawn over it. White reads on every biome, which is
        // why the globe uses it too. The sea is sampled from the texture's own
        // deep ocean (sampled off the file at 150W/0N and 25W/30S), so zoomed
        // out the map has no edge to speak of.
        sea: "#050c22", border: "rgba(255,255,255,0.85)",
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
  // Land is the only valid guess, so the cursor says so while it's over some.
  const [overLand, setOverLand] = useState(false);

  // The flight runs outside React's render loop, so it reads the live view
  // through a ref rather than closing over a stale one.
  const positionRef = useRef(position);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  const frameRef = useRef<number | null>(null);

  const stopFlight = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  /**
   * Travels the map across to `to` instead of cutting there. The centre moves
   * in a straight line across the projection while the zoom moves
   * geometrically — every frame the same proportional step, which reads as one
   * steady approach rather than a rush at one end.
   */
  const flyTo = useCallback(
    (to: Position) => {
      stopFlight();
      const from = positionRef.current;
      const a = projection(from.coordinates);
      const b = projection(to.coordinates);
      if (!a || !b || prefersReducedMotion()) {
        setPosition(to);
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / REVEAL_MS);
        if (t >= 1) {
          frameRef.current = null;
          setPosition(to);
          return;
        }
        const e = easeInOutCubic(t);
        const centre = projection.invert!([
          a[0] + (b[0] - a[0]) * e,
          a[1] + (b[1] - a[1]) * e,
        ]);
        setPosition({
          coordinates: centre ?? to.coordinates,
          zoom: from.zoom * Math.pow(to.zoom / from.zoom, e),
        });
        frameRef.current = requestAnimationFrame(step);
      };
      frameRef.current = requestAnimationFrame(step);
    },
    [projection, stopFlight],
  );

  useEffect(() => stopFlight, [stopFlight]);

  // Back to the whole world whenever a new round starts. Nothing is left on
  // screen to follow, so there's nothing to animate.
  const [prevAnswer, setPrevAnswer] = useState(answer);
  if (answer !== prevAnswer) {
    setPrevAnswer(answer);
    if (!answer) setPosition({ coordinates: defaultCenter, zoom: 1 });
  }

  /**
   * The answer is flown to rather than simply drawn, so the map carries you
   * from the part of the world you picked to the part you were looking for,
   * with the line between the two to follow. Any flight still in the air is
   * dropped when the next round resets the view above.
   */
  useEffect(() => {
    if (answer) flyTo({ coordinates: [answer.lng, answer.lat], zoom: REVEAL_ZOOM });
    else stopFlight();
  }, [answer, flyTo, stopFlight]);

  const k = position.zoom;
  const anchor = useMemo(
    () => (projection(position.coordinates) ?? [WIDTH / 2, mapHeight / 2]) as Pt,
    [projection, position.coordinates, mapHeight],
  );
  const sz = (v: number) => v / k;

  const zoomBy = (factor: number) =>
    setPosition((p) => ({
      coordinates: p.coordinates,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p.zoom * factor)),
    }));

  /** Where on the globe a mouse event landed, or null if it missed the map. */
  const coordAt = (e: React.MouseEvent<SVGSVGElement>): Coord | null => {
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
    return inverted ? { lat: inverted[1], lng: inverted[0] } : null;
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    const c = coordAt(e);
    // Only land is a guess. Dropping a pin in the ocean names no country and
    // answers no question, so the click is left to do nothing at all — the
    // same rule the globe has always played by.
    if (c && countryAt(shapes, c)) onGuess(c);
  };

  // Drives the cursor, so it's visible which half of the map you can guess on
  // before you try. Cheap enough per move: a box test rules out all but a
  // country or two before any coastline is walked.
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return setOverLand(false);
    const c = coordAt(e);
    setOverLand(!!c && !!countryAt(shapes, c));
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
        onMouseMove={handleMove}
        onMouseLeave={() => setOverLand(false)}
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: theme.sea,
          // Only a pointer over land, since that's all there is to hit.
          cursor: disabled ? "default" : overLand ? "pointer" : "grab",
        }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          // Grabbing the map mid-flight hands control straight back.
          onMoveStart={stopFlight}
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

          {/* Guess to answer: the arc the globe throws between the two, bowed
              and with its dashes running along it. The stroke doesn't scale
              with the map, so the dashes stay the same size on screen at any
              zoom and the travel loops seamlessly however far you're in. */}
          {guessPt && answerPt && (
            <path
              className="guess-line"
              d={arcBetween(guessPt, answerPt)}
              fill="none"
              stroke="#c084fc"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="6 5"
              vectorEffect="non-scaling-stroke"
            />
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
