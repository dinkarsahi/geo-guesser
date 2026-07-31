import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import type { GuessMapProps } from "./mapTypes";
import { countryAt, useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import { DAY_TEXTURE, GREY_TEXTURE } from "../lib/textures";
import MapZoomControls from "./MapZoomControls";

const MIN_ALTITUDE = 0.05; // closest button zoom
const MAX_ALTITUDE = 3.5; // farthest button zoom

const BUMP_TEXTURE = GREY_TEXTURE; // relief bump in both modes

/** Constant, so the globe isn't handed a new one to re-apply on every render. */
const noSide = () => "rgba(0,0,0,0)";

interface GlobeMapProps extends GuessMapProps {
  /** When true, render the greyscale globe; otherwise the colourful one. */
  night?: boolean;
  /** Draw the country outlines over the terrain. */
  borders?: boolean;
  /**
   * ISO alpha-2 codes to highlight once the answer is out. Usually the one
   * country being asked about, but a currency lights up everywhere it's spent.
   */
  highlightCodes?: string[] | null;
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
  night = false,
  borders = false,
  highlightCodes = null,
}: GlobeMapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const shapes = useWorldShapes();
  const wrapRef = useRef<HTMLDivElement>(null);
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
    controls.minDistance = 101; // globe radius is 100 — get right down to the surface
    controls.maxDistance = 520; // how far you can zoom out
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 1; // a touch faster so deep zoom isn't tedious
    // Close enough that the globe fills most of the window it now owns.
    g.pointOfView({ lat: 20, lng: 0, altitude: 2 });
  };

  // Zoom by changing the camera altitude, keeping the current lat/lng centred.
  const zoomBy = (factor: number) => {
    const g = globeRef.current;
    if (!g) return;
    const pov = g.pointOfView();
    const altitude = Math.min(
      MAX_ALTITUDE,
      Math.max(MIN_ALTITUDE, pov.altitude * factor),
    );
    g.pointOfView({ altitude }, 350);
  };

  // Fly to the true location when the answer is revealed.
  useEffect(() => {
    if (answer && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: answer.lat, lng: answer.lng, altitude: 1.6 },
        1200,
      );
    }
  }, [answer]);

  const points = useMemo<PointDatum[]>(() => {
    const pts: PointDatum[] = [];
    if (guess) pts.push({ lat: guess.lat, lng: guess.lng, color: "#e11d48" });
    if (answer) pts.push({ lat: answer.lat, lng: answer.lng, color: "#22c55e" });
    return pts;
  }, [guess, answer]);

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

  /**
   * These three have to keep the same identity between renders. The globe
   * re-applies an accessor to all 242 countries the moment it's handed a new
   * one, and written inline they were new on every render — including the ones
   * from following the pointer on and off land, which happens constantly while
   * you drag. Re-styling the whole world several times a second is what was
   * stamping on the flight out to the answer.
   */
  const polygonCap = useCallback(
    (d: object) =>
      lit.has(codeOf(d as CountryFeature)) ? "rgba(34,197,94,0.45)" : "rgba(0,0,0,0)",
    [lit],
  );
  const polygonStroke = useCallback(
    (d: object) =>
      lit.has(codeOf(d as CountryFeature))
        ? "#22c55e"
        : borders
          ? night ? "#9aa3ae" : "#f8fafc"
          : "",
    [lit, borders, night],
  );

  // Every country is always in the scene: the polygons are what makes land
  // clickable (they sit in front of the globe, so they take the click), and
  // whether they're *drawn* is just a matter of their stroke colour below.
  // Drawn from the coarse copy — at full 1:50m detail the globe is a slideshow,
  // and the scoring never looks at these anyway.
  const polygons = useMemo<CountryFeature[]>(
    () => (shapes ? shapes.globeFeatures : []),
    [shapes],
  );

  const arcs = useMemo(() => {
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
  }, [guess, answer]);

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
        globeImageUrl={night ? GREY_TEXTURE : DAY_TEXTURE}
        bumpImageUrl={BUMP_TEXTURE}
        showAtmosphere={!night}
        atmosphereColor={night ? "#6b7280" : "#7fb2ff"}
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
        // every country, including the revealed one — lifting it was a rebuild
        // of its geometry at exactly the moment the camera starts moving, and
        // the green wash marks it perfectly well without.
        polygonAltitude={0.002}
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
