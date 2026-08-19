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
import type { GuessMapProps, MapHighlight } from "./mapTypes";
import { countryAt, useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import { DAY_TEXTURE } from "../lib/textures";
import { flatTileSpan, FLAT_WORLD_PX, WORLD_TILES, type FlatTiles } from "../lib/mapTiles";
import MapZoomControls from "./MapZoomControls";

const WIDTH = 1024;
/**
 * How much beyond the window to fetch, so a drag doesn't run off the edge of
 * what's been loaded before the tiles for the new ground arrive.
 */
const VIEW_MARGIN = 1.2;
/**
 * A hair of overlap between neighbouring tiles, in map units.
 *
 * Tiles are placed at fractional coordinates and scaled by the map's own
 * transform, and two edges that meet exactly in maths meet with a seam of
 * background between them on screen once the rounding is done.
 */
const SEAM = 0.06;
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
  /** Draw the country outlines. */
  borders?: boolean;
  /**
   * ISO alpha-2 codes to highlight once the answer is out. Usually the one
   * country being asked about, but a currency lights up everywhere it's spent.
   */
  highlightCodes?: string[] | null;
  /**
   * The one country the player picked instead, washed red against the green.
   * Unlike `highlights` this changes nothing else about the reveal: the pins
   * and the line between them are still the story, and this only says which
   * country the near one is standing in.
   */
  missCode?: string | null;
  /**
   * Shapes to paint once the answer is out, for a mode whose answer isn't a
   * place. Given these, the map reveals by colouring the world in rather than
   * by dropping pins: no markers, no line between them, and it draws back to
   * the whole map instead of flying in on a point — the answer is spread
   * across it, and there's nothing to fly to.
   */
  highlights?: MapHighlight[] | null;
}

interface Position {
  coordinates: [number, number];
  zoom: number;
}

/** One tile of imagery, and the rectangle of map it covers. */
interface PlacedTile {
  key: string;
  href: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Which tiles cover what's on screen, and where each one belongs.
 *
 * Plate carrée is what makes this arithmetic and not projection: longitude and
 * latitude land on x and y in straight proportion, so a tile's patch of ground
 * is an upright rectangle wherever it is, the same shape at the pole as at the
 * equator. On the globe's Mercator grid none of that holds.
 *
 * `worldPx` is how wide the whole world would be on this screen at this zoom,
 * which is the only thing that decides the level: the first grid wide enough to
 * give the screen a pixel each. Asking for a deeper one buys nothing anybody
 * can see and fetches four times the tiles to do it.
 */
function tilesInView(
  flat: FlatTiles,
  centre: [number, number],
  zoom: number,
  worldPx: number,
  mapHeight: number,
): PlacedTile[] {
  let level = flat.maxLevel;
  for (let l = 0; l <= flat.maxLevel; l++) {
    if (FLAT_WORLD_PX * 2 ** l >= worldPx) {
      level = l;
      break;
    }
  }

  // How much world a tile holds is the service's own ladder, not a division of
  // the grid — see `flatTileSpan`, which is where getting this wrong showed up
  // as the map sliding out from under its borders. The grid follows from it.
  const span = flatTileSpan(level);
  const cols = Math.ceil(360 / span);
  const rows = Math.ceil(180 / span);
  const tileW = (span / 360) * WIDTH;
  const tileH = (span / 180) * mapHeight;

  // The window, in map units, from the centre the map is holding.
  const cx = ((centre[0] + 180) / 360) * WIDTH;
  const cy = ((90 - centre[1]) / 180) * mapHeight;
  const halfW = ((WIDTH / zoom) * VIEW_MARGIN) / 2;
  const halfH = ((mapHeight / zoom) * VIEW_MARGIN) / 2;

  const first = (v: number, size: number, count: number) =>
    Math.max(0, Math.min(count - 1, Math.floor(v / size)));
  const c0 = first(cx - halfW, tileW, cols);
  const c1 = first(cx + halfW, tileW, cols);
  const r0 = first(cy - halfH, tileH, rows);
  const r1 = first(cy + halfH, tileH, rows);

  const out: PlacedTile[] = [];
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      out.push({
        key: `${level}/${row}/${col}`,
        href: flat.url(col, row, level),
        x: col * tileW,
        y: row * tileH,
        w: tileW + SEAM,
        h: tileH + SEAM,
      });
    }
  }
  return out;
}

export default function WorldMap({
  onGuess,
  guess,
  answer,
  disabled = false,
  borders = true,
  highlightCodes = null,
  missCode = null,
  highlights = null,
}: WorldMapProps) {
  const shapes = useWorldShapes();
  // Painting the answer on rather than pinning it: see `highlights`.
  const painted = !!highlights?.length;

  // The land is the satellite image, so the only colours left to pick are the
  // lines drawn over it. White reads on every biome, which is why the globe
  // uses it too. The sea is sampled from the texture's own deep ocean (off the
  // file at 150W/0N and 25W/30S), so zoomed out the map has no edge to speak of.
  const theme = {
    sea: "#050c22", border: "rgba(255,255,255,0.85)",
    highlight: "rgba(74,222,128,0.35)", highlightLine: "#4ade80",
    wrong: "rgba(225,29,72,0.4)", wrongLine: "#fb7185",
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

  // How big the map is drawn, which only the tile layer needs: how sharp a
  // level to ask for depends on how many real pixels the world is being given.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1024, h: 512 });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    if (!answer) return stopFlight();
    // A painted answer is everywhere the clock is kept, which is a band right
    // round the world. Flying in on one end of it would hide the rest, so the
    // map pulls back to the whole thing instead — the same journey, outward.
    if (painted) flyTo({ coordinates: defaultCenter, zoom: 1 });
    else flyTo({ coordinates: [answer.lng, answer.lat], zoom: REVEAL_ZOOM });
  }, [answer, painted, defaultCenter, flyTo, stopFlight]);

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
  const guessPt = painted || !guess ? null : project(guess);
  const answerPt = painted || !answer ? null : project(answer);

  // The painted shapes, turned into svg the same way the countries under them
  // are: through this map's own projection, so they land inside the group the
  // zoom moves and travel with it.
  const toPath = useMemo(() => geoPath(projection), [projection]);

  // Keyed by value, not by the array's identity, so a caller building the list
  // inline doesn't rebuild the set on every render.
  const litKey = (highlightCodes ?? []).join(",").toLowerCase();
  const lit = useMemo(
    () => new Set(litKey ? litKey.split(",") : []),
    [litKey],
  );

  // Only once the round is over, which the answer's arrival is the sign of.
  const miss = answer ? (missCode ?? "").toLowerCase() : "";

  /**
   * The imagery under everything.
   *
   * Worked out from the settled view rather than from the live one: the map
   * only reports where it is when a drag or a zoom *ends*, and that is exactly
   * what's wanted here. The tiles are placed in map units inside the group that
   * moves, so they travel with the map for free during the gesture; all that
   * waits for the end is whether a sharper level, or new ground, is called for.
   */
  const flatTiles = useMemo(() => {
    if (!WORLD_TILES.flat) return [];
    // How wide the world is drawn, in real pixels: the map is scaled to cover
    // its box, so the bigger of the two ratios is the one doing the covering.
    const cover = Math.max(size.w / WIDTH, size.h / mapHeight);
    return tilesInView(
      WORLD_TILES.flat,
      position.coordinates,
      position.zoom,
      WIDTH * cover * position.zoom,
      mapHeight,
    );
  }, [position, size, mapHeight]);

  /** Whether this country is the answer, the miss, or neither. */
  const toneOf = (geo: CountryFeature): "right" | "wrong" | null => {
    if (!answer) return null;
    const code = (geo.properties?.ISO_A2_EH || geo.properties?.ISO_A2 || "").toLowerCase();
    if (lit.has(code)) return "right";
    return code && code === miss ? "wrong" : null;
  };

  return (
    <div className="world-wrap" ref={wrapRef}>
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
              bounds with no warping.

              Kept underneath the tiles rather than replaced by them: it is the
              whole world in one file and it is already here, so it stands in
              for any tile still on its way and for the ground just outside the
              ones fetched. Without it a drag runs onto bare sea colour. */}
          <image
            href={DAY_TEXTURE}
            x={0}
            y={0}
            width={WIDTH}
            height={mapHeight}
            preserveAspectRatio="none"
          />
          {flatTiles.map((t) => (
            <image
              key={t.key}
              href={t.href}
              x={t.x}
              y={t.y}
              width={t.w}
              height={t.h}
              preserveAspectRatio="none"
            />
          ))}

          {shapes && (
            <Geographies geography={{ type: "FeatureCollection", features: shapes.features }}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const tone = toneOf(geo as unknown as CountryFeature);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      // The imagery underneath is the land, so the shapes are
                      // only ever outlines — except the country being revealed
                      // and the one picked instead, which are washed over to
                      // pick them out.
                      fill={
                        tone === "right"
                          ? theme.highlight
                          : tone === "wrong"
                            ? theme.wrong
                            : "transparent"
                      }
                      stroke={
                        tone === "right"
                          ? theme.highlightLine
                          : tone === "wrong"
                            ? theme.wrongLine
                            : borders
                              ? theme.border
                              : "transparent"
                      }
                      strokeWidth={sz(tone ? 1.4 : 0.7)}
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

          {/* Where the clock is kept, and where the player looked for it. Over
              the country outlines rather than among them: a piece is part of a
              country, so its own border has to sit on top of the one it was
              cut out of. */}
          {highlights?.map(({ key, feature, tone }) => {
            const right = tone === "right";
            return (
              <path
                key={key}
                d={toPath(feature) ?? undefined}
                fill={right ? theme.highlight : theme.wrong}
                stroke={right ? theme.highlightLine : theme.wrongLine}
                strokeWidth={sz(1.4)}
                strokeLinejoin="round"
                pointerEvents="none"
              />
            );
          })}

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
