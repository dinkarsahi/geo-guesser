import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { flyIn } from "../lib/globeFlight";
import { addSky } from "../lib/globeSky";

/**
 * The bench's globe: what ships, with two things being argued about.
 *
 * A **copy** of `GlobeMap` rather than a flag inside it, which is the bench
 * rule — what is tried here can be got wrong without a real game being got
 * wrong with it. Everything below the two additions is the shipped globe
 * verbatim and is meant to stay that way: a copy that drifts is a copy that
 * gets judged instead of the thing it stands in for.
 *
 * **The switch** flips the clouds off and leaves the stars. That is the whole
 * comparison: the cloud layer is the half of the sky that costs 830 KB and
 * lays weather over the coastlines the game is asking about, and the stars are
 * the half that costs nothing and hides nothing. Worth being able to see both
 * in the same second rather than remembering one.
 *
 * **The flight** is the arrival — see `globeFlight.ts`. Press Start and the
 * map is on screen before its imagery is, so a round used to open on an empty
 * rectangle or a globe that popped in a moment late. The tiles have to travel;
 * what the fall does is make that travelling time part of the game.
 */
import type { GuessMapProps, MapHighlight } from "./mapTypes";
import { countryAt, useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import { WORLD_TILES } from "../lib/mapTiles";
import MapZoomControls from "./MapZoomControls";

const MAX_ALTITUDE = 3.5; // farthest button zoom

/** Constant, so the globe isn't handed a new one to re-apply on every render. */
const noSide = () => "rgba(0,0,0,0)";

interface ScrapbookGlobeProps extends GuessMapProps {
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

/** Green for the clock that was asked about, red for the one picked instead. */
const TONE_CAP = { right: "rgba(34,197,94,0.5)", wrong: "rgba(225,29,72,0.5)" };
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

export default function ScrapbookGlobe({
  onGuess,
  guess,
  answer,
  disabled = false,
  borders = false,
  highlightCodes = null,
  missCode = null,
  highlights = null,
  arriveAt,
}: ScrapbookGlobeProps) {
  // How close the camera may get: the imagery's own limit, since a source runs
  // out of pictures at its own depth and there is nothing to see past it.
  const minAltitude = WORLD_TILES.minAltitude;
  // Painting the answer on rather than pinning it: see `highlights`.
  const painted = !!highlights?.length;
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const shapes = useWorldShapes();
  const wrapRef = useRef<HTMLDivElement>(null);
  // What the sky is made of. Clouds on is what ships today, so it opens there
  // and the question is only ever "is the other one better?".
  const [clouds, setClouds] = useState(true);
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
    // Where the fall ends, rather than where the camera starts. `flyIn` puts
    // it far out first and tweens it here — see the effect below, which owns
    // the flight so that leaving the round mid-fall can cancel it.
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

  // Stars behind the world and cloud drifting over it — see `globeSky`, which
  // owns both and the reason they are objects beside the globe rather than
  // anything painted on it.
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !readyCount) return;
    return addSky(g.scene(), g.getGlobeRadius(), { clouds });
  }, [readyCount, clouds]);

  // The arrival. Its own effect rather than a few lines in `handleReady`,
  // because a round can be walked out of halfway down and the fall has timers
  // and frames of its own to cancel — see `globeFlight`.
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !readyCount) return;
    // However much of the intro is left, so the fall lands *on* the moment the
    // round opens rather than running for a fixed three seconds from whenever
    // the globe finished building. Already begun on every round after the
    // first, and on any machine slow enough to have spent the whole intro
    // getting here.
    const left = (arriveAt ?? 0) - Date.now();
    if (left < 400) return;
    // Wrapped rather than handed over bare: a method pulled off the instance
    // and called elsewhere is one library refactor away from losing what it
    // was attached to, and this one is called from a timer.
    const stop = flyIn(
      g.scene(),
      g.controls(),
      (pov, ms) => g.pointOfView(pov, ms),
      { lat: 20, lng: 0, altitude: 2 },
      left,
    );
    return stop;
    // Keyed on the globe being ready and nothing else. The skin is deliberately
    // not in here — flipping the clouds mid-round should change the sky and
    // nothing else, and re-flying the camera on every press would throw away
    // the view being compared.
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
        polygonsData={polygons}
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
      {/* On the map rather than on the setup screen: two skies have to be
          compared in the same second and on the same view, and a choice made
          before the round starts is a choice judged from memory. */}
      <div className="bench-skins">
        <span className="bench-skins-label">Sky</span>
        {[
          { on: true, name: "With clouds", note: "what ships today" },
          { on: false, name: "Stars only", note: "no weather, no 830 KB" },
        ].map((option) => (
          <button
            key={String(option.on)}
            className={`bench-skin${clouds === option.on ? " is-active" : ""}`}
            onClick={() => setClouds(option.on)}
            aria-pressed={clouds === option.on}
          >
            <span className="bench-skin-name">{option.name}</span>
            <span className="muted bench-skin-note">{option.note}</span>
          </button>
        ))}
      </div>
      {!shapes && <p className="map-loading muted">Loading the world…</p>}
    </div>
  );
}
