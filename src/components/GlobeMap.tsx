import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { ARRIVAL, MIN_FLIGHT_MS, flightStart, flyIn } from "../lib/globeFlight";
import { addGround } from "../lib/globeGround";
import { addSky } from "../lib/globeSky";
import { usePolygonFeed } from "../lib/polygonFeed";
import type { GuessMapProps, MapHighlight } from "./mapTypes";
import { countryAt, useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import { WORLD_TILES } from "../lib/mapTiles";
import MapZoomControls from "./MapZoomControls";

const MAX_ALTITUDE = 3.5; // farthest button zoom

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

  // Fly to the true location when the answer is revealed — and, where the
  // answer is painted across half the world rather than pinned to one spot,
  // hang back far enough to take it in.
  useEffect(() => {
    if (answer && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: answer.lat, lng: answer.lng, altitude: painted ? 2.4 : 1.6 },
        1200,
      );
    }
  }, [answer, painted]);

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
      if (lit.has(code)) return "rgba(34,197,94,0.45)";
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
    (d: object) => (toneOf.has(d) ? 0.004 : 0.002),
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
