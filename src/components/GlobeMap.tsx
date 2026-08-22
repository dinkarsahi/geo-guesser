import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { ARRIVAL, MIN_FLIGHT_MS, flightStart, flyIn } from "../lib/globeFlight";
import { addGround } from "../lib/globeGround";
import { addSky } from "../lib/globeSky";
import { usePolygonFeed } from "../lib/polygonFeed";
import { geoDistance } from "d3-geo";
import type { Geometry, GeometryCollection, Position } from "geojson";
import type { Coord } from "../lib/geo";
import type { GuessMapProps, MapHighlight } from "./mapTypes";
import { countryAt, useWorldShapes, type CountryFeature, type WorldShapes } from "../lib/worldShapes";
import { WORLD_TILES } from "../lib/mapTiles";
import MapZoomControls from "./MapZoomControls";

const MAX_ALTITUDE = 3.5; // farthest button zoom

/**
 * How finely the cap of a country is cut into triangles, in degrees of arc.
 *
 * **This is a rendering fault, not a taste.** A country's fill is flat
 * triangles with their corners on the sphere, so the middle of a triangle
 * hangs *below* the surface it is chorded across — by `R(1 − cos(θ/2))` for a
 * triangle θ across, which at three-globe's default of 5° reaches 0.45 units
 * on a globe of radius 100. The fill floats a fraction of that above the
 * terrain, so the biggest triangles sink under it and the ground shows through:
 * **174 of the world's 6,635 cap triangles were buried at the default**, all of
 * them in the countries big enough to need triangles that size. That is what a
 * highlighted Canada or Russia coming out in patches actually was.
 *
 * At 2° the count is 13, and raising the cap to `LIT_ALTITUDE` clears every one
 * of them. The cost is 13,700 triangles across the world rather than 6,600,
 * which no GPU notices — and it is paid by the polygon feed, not by the frame.
 *
 * Constant on purpose: three-globe rebuilds a polygon's geometry when this
 * changes, and doing that per-country at the reveal would rebuild the answer's
 * geometry at the exact moment the camera starts moving.
 */
const CAP_RESOLUTION = 2;

/**
 * How far the country fills float above the terrain, in globe radii.
 *
 * Doubled from 0.002 to clear the last few triangles that still dip under the
 * surface at `CAP_RESOLUTION` — the deepest is 0.133 units and this gives 0.4.
 * It is not free: the polygons are what a click lands on, so the further they
 * float the further a click at a shallow angle lands from the spot under the
 * cursor. At 0.4 units that is about 25 km at a 45° view and nothing at all
 * looking straight down, which no mode's marking can feel — the country modes
 * anchor a click to the country it lands in, and the nearest border is never
 * that close to where anyone aimed.
 */
const LIT_ALTITUDE = 0.004;
/** The painted patches, which overlap the countries and so sit above them. */
const PAINTED_ALTITUDE = 0.006;

/** three.js's default vertical field of view, which react-globe.gl leaves alone. */
const FOV_DEG = 50;
/** How much of the frame the answer is allowed to fill, edge to edge. */
const FRAME_FILL = 0.8;

/** Constant, so the globe isn't handed a new one to re-apply on every render. */
const noSide = () => "rgba(0,0,0,0)";

interface GlobeMapProps extends GuessMapProps {
  /** Draw the country outlines over the terrain. */
  borders?: boolean;
  /**
   * ISO alpha-2 codes to highlight once the answer is out. Usually the one
   * country being asked about, but a currency lights up everywhere it's spent.
   */
  highlightCodes?: string[] | null;
  /**
   * The one country the player picked instead, washed red against the green.
   * Unlike `highlights` this changes nothing else about the reveal: the pins
   * and the arc between them are still the story, and this only says which
   * country the near one is standing in.
   */
  missCode?: string | null;
  /**
   * Shapes to paint once the answer is out, for a mode whose answer isn't a
   * place. Given these, the globe reveals by colouring the world in rather
   * than by dropping pins: no markers, no arc between them, and it settles far
   * enough out to see the whole band rather than diving at one end of it.
   */
  highlights?: MapHighlight[] | null;
}

/**
 * Green for the country that was asked about, red for the one picked instead.
 *
 * **Nearly opaque on purpose.** These were a half-transparent wash, which reads
 * as one colour on a small country and falls apart on a big one: the same red
 * over Siberian snow is bright pink and over dark taiga is muddy brown, so a
 * highlighted Russia looked blotchy, as though the fill had failed in patches.
 * It had not — the ground beneath it simply changes. At this alpha the terrain
 * still shows as texture and the colour is what the eye reads, which is the
 * whole job of a highlight: to say *this* country at a glance, wherever it is.
 */
const TONE_CAP = { right: "rgba(34,197,94,0.72)", wrong: "rgba(225,29,72,0.74)" };
const TONE_LINE = { right: "#22c55e", wrong: "#fb7185" };

/** Every position in a geometry, however deeply it is nested. */
function* positionsOf(geometry: Geometry | null | undefined): Generator<Position> {
  if (!geometry) return;
  const walk = function* (part: unknown): Generator<Position> {
    if (!Array.isArray(part)) return;
    if (typeof part[0] === "number") {
      yield part as Position;
      return;
    }
    for (const inner of part) yield* walk(inner);
  };
  if (geometry.type === "GeometryCollection") {
    for (const g of geometry.geometries) yield* positionsOf(g);
    return;
  }
  yield* walk((geometry as Exclude<Geometry, GeometryCollection>).coordinates);
}

/**
 * How far the country under the camera reaches, in radians of arc — the
 * angular radius of the thing the reveal has to fit on screen.
 *
 * **The one the camera is standing over**, not all of them, and that is the
 * whole of what makes this safe for Currency Spotter: a currency lights up
 * twenty countries and the camera flies to the nearest one that spends it, so
 * framing the lot would stand the reveal off at arm's length to take in a
 * hemisphere nobody asked about. Every other mode highlights one country and
 * this picks it, there being nothing else to pick.
 *
 * Walked over the coarse copy of the world: a camera decision, not a scoring
 * one, and a tenth of the points.
 */
function spreadOf(shapes: WorldShapes | null, codes: Set<string>, at: Coord): number {
  if (!shapes) return 0;
  const from: [number, number] = [at.lng, at.lat];
  let nearest = Infinity;
  let spread = 0;
  for (const code of codes) {
    const f = shapes.globeFeatures.find(
      (g) =>
        (g.properties?.ISO_A2_EH || g.properties?.ISO_A2 || "").toLowerCase() === code,
    );
    let near = Infinity;
    let far = 0;
    for (const p of positionsOf(f?.geometry)) {
      const d = geoDistance(from, [p[0], p[1]]);
      if (d < near) near = d;
      if (d > far) far = d;
    }
    if (near < nearest) {
      nearest = near;
      spread = far;
    }
  }
  return spread;
}

/**
 * The altitude that fits something `spread` radians across into this window.
 *
 * **The reason this exists is the phone.** The reveal used to fly to a fixed
 * altitude of 1.6, which frames a country the size of Jordan and a country the
 * size of Canada identically — and the field of view three.js gives us is
 * *vertical*, so on a portrait screen the horizontal one is far narrower than
 * the 50° a desktop gets. At 1.6 on a phone the globe already overflows the
 * window sideways, and Canada, which covers most of the visible face, then
 * genuinely does fill the screen with green. Fitted, the same reveal stands off
 * to about 2.9 and Canada is a country again.
 *
 * The camera is at distance `D` from the centre and the globe has radius `R`, so
 * a point `spread` from the middle of the view sits `atan(R sin s / (D − R cos
 * s))` off the axis; setting that to the half-angle of the narrower side and
 * solving for D is the line below.
 */
function fitAltitude(spread: number, aspect: number): number {
  const halfV = ((FOV_DEG / 2) * Math.PI) / 180;
  const halfH = Math.atan(Math.tan(halfV) * aspect);
  const half = Math.min(halfV, halfH) * FRAME_FILL;
  return Math.cos(spread) + Math.sin(spread) / Math.tan(half) - 1;
}

/** Minimal shape of the three OrbitControls we touch (three ships no types here). */
interface OrbitLike {
  enablePan: boolean;
  minDistance: number;
  maxDistance: number;
  rotateSpeed: number;
  zoomSpeed: number;
}

interface PointDatum {
  lat: number;
  lng: number;
  color: string;
}

export default function GlobeMap({
  onGuess,
  guess,
  answer,
  disabled = false,
  borders = false,
  highlightCodes = null,
  missCode = null,
  highlights = null,
  arriveAt,
}: GlobeMapProps) {
  // How close the camera may get: the imagery's own limit, since a source runs
  // out of pictures at its own depth and there is nothing to see past it.
  const minAltitude = WORLD_TILES.minAltitude;
  // Painting the answer on rather than pinning it: see `highlights`.
  const painted = !!highlights?.length;
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const shapes = useWorldShapes();
  const wrapRef = useRef<HTMLDivElement>(null);
  // Set once the globe has a scene to hang things on. Counted rather than
  // flagged so that a globe rebuilt under us re-hangs the sky instead of
  // leaving it in a scene that has been thrown away.
  const [readyCount, setReadyCount] = useState(0);
  const [size, setSize] = useState({ w: 800, h: 520 });
  // Land is the only valid guess, so the cursor says so while it's over some.
  const [overLand, setOverLand] = useState(false);

  // The canvas is the whole layer it's given, which is the whole window.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Tune the orbit controls and set an opening view once the globe is ready.
  const handleReady = () => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls() as unknown as OrbitLike;
    controls.enablePan = false;
    // Globe radius is 100, so distance 101 is an altitude of 0.01 — right down
    // on the surface. The drag limit follows the same floor the buttons use,
    // rather than letting a scroll wheel go where a button won't.
    controls.minDistance = 100 + minAltitude * 100;
    controls.maxDistance = 520; // how far you can zoom out
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 1; // a touch faster so deep zoom isn't tedious
    // Stand the camera at the top of the fall *here*, synchronously, and not
    // in the effect that flies it. An effect runs after the browser has
    // painted, and the globe draws on a loop of its own besides, so between
    // those two moments there were frames of the library's own default view —
    // a half-size Earth over the Gulf of Guinea — which then leapt out to a
    // marble as the fall took over. The flight owns everything after this
    // frame; this is only where it begins. See `flightStart`.
    if ((arriveAt ?? 0) - Date.now() >= MIN_FLIGHT_MS) g.pointOfView(flightStart());
    // Counted last, and everything above it is the camera. Anything that
    // throws in here takes the rest of the function with it, and the rest of
    // the function is what decides where the player is standing — a fault
    // above this line reads as the map being wrong rather than as a line
    // having failed.
    setReadyCount((n) => n + 1);
  };

  // Zoom by changing the camera altitude, keeping the current lat/lng centred.
  const zoomBy = (factor: number) => {
    const g = globeRef.current;
    if (!g) return;
    const pov = g.pointOfView();
    const altitude = Math.min(
      MAX_ALTITUDE,
      Math.max(minAltitude, pov.altitude * factor),
    );
    g.pointOfView({ altitude }, 350);
  };

  // Stars behind the world and an ocean under it — see `globeSky` and
  // `globeGround`, and the reason both stand beside the globe rather than
  // being painted on it: a tiled surface can take nothing from a material.
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !readyCount) return;
    const sky = addSky(g.scene(), g.getGlobeRadius());
    const ground = addGround(g.scene(), g.getGlobeRadius());
    return () => {
      sky();
      ground();
    };
  }, [readyCount]);

  // The arrival: a fall through space, once, while the tiles travel — see
  // `globeFlight`, and note that in a room the wait is part of the timetable
  // rather than a pause in front of it.
  //
  // It takes however much of the intro is left rather than a fixed three
  // seconds, so it lands *on* the moment the round opens. Building the globe
  // costs a second or two before it can animate anything, and a fixed fall
  // started from there was still falling after the countdown had finished:
  // the world rushing past while the clock ran.
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !readyCount) return;
    // Already begun — every round after the first, and any machine slow enough
    // to have spent the whole intro getting here. Nothing to arrive from.
    const left = (arriveAt ?? 0) - Date.now();
    if (left < MIN_FLIGHT_MS) return;
    // The fade in front of the fall, put on the element rather than held as
    // state — it is a one-shot animation being triggered, not a fact about the
    // map, and nothing renders differently for knowing it. Never taken off:
    // the animation ends by itself and the class carries no meaning after it.
    // A round that arrives from nowhere — a duel, and every round after the
    // first — has already returned above and never fades, which is the point.
    wrapRef.current?.classList.add("is-arriving");
    // Wrapped rather than handed over bare: a method pulled off the instance
    // and called from a timer is one library refactor away from losing what it
    // was attached to.
    return flyIn(
      g.scene(),
      g.controls(),
      (pov, ms) => g.pointOfView(pov, ms),
      ARRIVAL,
      left,
    );
  }, [readyCount, arriveAt]);


  const points = useMemo<PointDatum[]>(() => {
    const pts: PointDatum[] = [];
    if (painted) return pts;
    if (guess) pts.push({ lat: guess.lat, lng: guess.lng, color: "#e11d48" });
    if (answer) pts.push({ lat: answer.lat, lng: answer.lng, color: "#22c55e" });
    return pts;
  }, [guess, answer, painted]);

  // Country outlines: every country when borders are on, plus the answer's own
  // country picked out once the round is scored.
  const codeOf = (f: CountryFeature) =>
    (f.properties?.ISO_A2_EH || f.properties?.ISO_A2 || "").toLowerCase();
  // Keyed by value, not by the array's identity, so a caller building the list
  // inline doesn't hand the globe a new set — and with it a re-style of all 242
  // countries — on every render.
  const litKey = answer ? (highlightCodes ?? []).join(",").toLowerCase() : "";
  const lit = useMemo(
    () => new Set(litKey ? litKey.split(",") : []),
    [litKey],
  );
  // Only once the round is over, which the answer's arrival is the sign of.
  const miss = answer ? (missCode ?? "").toLowerCase() : "";

  /**
   * How far back the reveal stands, which is a question about the answer and
   * about the window rather than a constant.
   *
   * A painted band crosses the whole world and is met at a fixed distance, as
   * it always was. Everything else is *fitted*: a highlighted country is framed
   * so that all of it is on screen, and where there is nothing highlighted —
   * City Spotter, where the answer is one point — the old 1.6 is what fits.
   * That is also the floor, so a small country is still met at the distance
   * every round used to be.
   */
  const revealAltitude = useMemo(() => {
    if (painted) return 2.4;
    if (!answer || !lit.size) return 1.6;
    const spread = spreadOf(shapes, lit, answer);
    return Math.min(MAX_ALTITUDE, Math.max(1.6, fitAltitude(spread, size.w / size.h)));
  }, [painted, answer, lit, shapes, size.w, size.h]);

  // Fly to the true location when the answer is revealed.
  useEffect(() => {
    if (answer && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: answer.lat, lng: answer.lng, altitude: revealAltitude },
        1200,
      );
    }
  }, [answer, revealAltitude]);

  /**
   * These three have to keep the same identity between renders. The globe
   * re-applies an accessor to all 242 countries the moment it's handed a new
   * one, and written inline they were new on every render — including the ones
   * from following the pointer on and off land, which happens constantly while
   * you drag. Re-styling the whole world several times a second is what was
   * stamping on the flight out to the answer.
   */
  // Which of the polygons in the scene are painted patches rather than
  // countries, and in which colour. Keyed by the feature object itself, which
  // the mode keeps still between renders for exactly this reason.
  const toneOf = useMemo(() => {
    const map = new Map<object, "right" | "wrong">();
    for (const h of highlights ?? []) map.set(h.feature, h.tone);
    return map;
  }, [highlights]);

  const polygonCap = useCallback(
    (d: object) => {
      const tone = toneOf.get(d);
      if (tone) return TONE_CAP[tone];
      const code = codeOf(d as CountryFeature);
      if (lit.has(code)) return TONE_CAP.right;
      return code && code === miss ? TONE_CAP.wrong : "rgba(0,0,0,0)";
    },
    [lit, miss, toneOf],
  );
  const polygonStroke = useCallback(
    (d: object) => {
      const tone = toneOf.get(d);
      if (tone) return TONE_LINE[tone];
      const code = codeOf(d as CountryFeature);
      if (lit.has(code)) return "#22c55e";
      if (code && code === miss) return TONE_LINE.wrong;
      return borders ? "#f8fafc" : "";
    },
    [lit, miss, borders, toneOf],
  );
  // A hair above the countries they were cut out of, so the two don't fight
  // over the same pixels — and still flat enough that a click at a shallow
  // angle lands where the cursor is.
  const polygonAltitude = useCallback(
    (d: object) => (toneOf.has(d) ? PAINTED_ALTITUDE : LIT_ALTITUDE),
    [toneOf],
  );

  // Every country is always in the scene: the polygons are what makes land
  // clickable (they sit in front of the globe, so they take the click), and
  // whether they're *drawn* is just a matter of their stroke colour below.
  // Drawn from the coarse copy — at full 1:50m detail the globe is a slideshow,
  // and the scoring never looks at these anyway.
  const polygons = useMemo<object[]>(
    () => [
      ...(shapes ? shapes.globeFeatures : []),
      ...(highlights ?? []).map((h) => h.feature),
    ],
    [shapes, highlights],
  );
  // Handed over a slice at a time rather than in one go: building all 242 at
  // once is about three seconds of blocked main thread, and it was landing
  // squarely on the fall through space. See `polygonFeed`, which also says why
  // the two tidier fixes are both worse than this one.
  const feeding = usePolygonFeed(polygons);

  const arcs = useMemo(() => {
    if (painted) return [];
    if (guess && answer) {
      return [
        {
          startLat: guess.lat,
          startLng: guess.lng,
          endLat: answer.lat,
          endLng: answer.lng,
        },
      ];
    }
    return [];
  }, [guess, answer, painted]);

  return (
    <div
      ref={wrapRef}
      className="globe-wrap"
      style={{ cursor: disabled ? "default" : overLand ? "pointer" : "grab" }}
    >
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        // No `globeImageUrl` or `bumpImageUrl`: given a tile engine three-globe
        // hides the photographed globe entirely, so either would be a texture
        // downloaded and never seen. The imagery has the terrain in it rather
        // than needing a bump map to fake one.
        globeTileEngineUrl={WORLD_TILES.url}
        // How deep to ask. The service answers 400 past its last level and the
        // engine draws nothing where no tile arrived, so leaving this at the
        // default of 17 doesn't buy detail off a shallower service — it strips
        // the globe bare as soon as you go too close. Spread because it is
        // three-globe's prop, forwarded but not yet in react-globe.gl's types.
        {...({ globeTileEngineMaxLevel: WORLD_TILES.maxLevel } as object)}
        showAtmosphere
        atmosphereColor="#7fb2ff"
        atmosphereAltitude={0.18}
        onGlobeReady={handleReady}
        onGlobeClick={({ lat, lng }) => {
          // The bare globe is the sea. It's only a valid guess when the country
          // shapes never arrived — without them there'd be nothing to click.
          if (!disabled && !shapes) onGuess({ lat, lng });
        }}
        // Which polygon the ray struck is no use on its own: a click on open
        // ocean carries on through the globe and comes out of the far side,
        // where it hits whichever country happens to be there. That fired this
        // handler for Saudi Arabia over a point in the Atlantic. So the polygon
        // is ignored and the spot itself is asked what country it's in — the
        // same question the flat map asks, and the one the scoring will ask.
        onPolygonClick={(_polygon, _event, { lat, lng }) => {
          if (disabled) return;
          const c = { lat, lng };
          if (countryAt(shapes, c)) onGuess(c);
        }}
        onPolygonHover={(polygon) => setOverLand(!!polygon)}
        // In the scene from the first frame, but **a few at a time**. Building
        // these 242 outlines is about three seconds of geometry on the main
        // thread, measured on the production build and warm, and handed over
        // as one lump it took the whole count-in and froze the fall it was
        // meant to be running behind. `usePolygonFeed` slices it.
        polygonsData={feeding}
        // Kept as flat to the surface as the stroke allows: the polygons are
        // what you click, so the further they float the further a click at a
        // shallow angle lands from the spot under the cursor. One height for
        // every country, revealed or not — lifting the revealed one was a
        // rebuild of its geometry at exactly the moment the camera starts
        // moving, and the green wash marks it perfectly well without. Only the
        // painted patches sit higher, and only because they overlap.
        polygonAltitude={polygonAltitude}
        // How finely a country's fill is cut up — see `CAP_RESOLUTION`, which
        // is where the patchy highlight on the big countries actually was.
        polygonCapCurvatureResolution={CAP_RESOLUTION}
        polygonCapColor={polygonCap}
        polygonSideColor={noSide}
        // An empty colour draws no outline at all, which is how the invisible
        // click targets stay invisible when borders are off.
        polygonStrokeColor={polygonStroke}
        polygonsTransitionDuration={0}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius={0.55}
        pointsMerge={false}
        pointsTransitionDuration={0}
        arcsData={arcs}
        arcColor={() => "#c084fc"}
        arcStroke={0.6}
        arcAltitudeAutoScale={0.3}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={2500}
      />
      <MapZoomControls
        onZoomIn={() => zoomBy(0.6)}
        onZoomOut={() => zoomBy(1 / 0.6)}
      />
      {!shapes && <p className="map-loading muted">Loading the world…</p>}
    </div>
  );
}
