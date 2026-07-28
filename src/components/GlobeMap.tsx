import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import type { GuessMapProps } from "./mapTypes";
import { useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import MapZoomControls from "./MapZoomControls";

const MIN_ALTITUDE = 0.05; // closest button zoom
const MAX_ALTITUDE = 3.5; // farthest button zoom

// three-globe's example textures, served from a CDN (per the chosen setup).
const CDN = "https://cdn.jsdelivr.net/npm/three-globe/example/img";
const DAY_TEXTURE = `${CDN}/earth-blue-marble.jpg`; // colourful satellite terrain
const GREY_TEXTURE = `${CDN}/earth-topology.png`; // greyscale relief for night mode
const BUMP_TEXTURE = `${CDN}/earth-topology.png`; // relief bump in both modes

interface GlobeMapProps extends GuessMapProps {
  /** When true, render the greyscale globe; otherwise the colourful one. */
  night?: boolean;
  /** Draw the country outlines over the terrain. */
  borders?: boolean;
  /** ISO alpha-2 code of a country to highlight once the answer is out. */
  highlightCode?: string | null;
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
  highlightCode = null,
}: GlobeMapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const shapes = useWorldShapes();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 520 });

  // Keep the canvas sized to its container.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () =>
      setSize({ w: el.clientWidth, h: Math.min(Math.max(el.clientWidth, 320), 560) });
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
    g.pointOfView({ lat: 20, lng: 0, altitude: 2.4 });
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
  const lit = highlightCode && answer ? highlightCode.toLowerCase() : null;

  const polygons = useMemo<CountryFeature[]>(() => {
    if (!shapes) return [];
    if (borders) return shapes.features;
    const only = lit ? shapes.byCode[lit] : null;
    return only ? [only] : [];
  }, [shapes, borders, lit]);

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
      style={{ cursor: disabled ? "default" : "grab" }}
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
          if (!disabled) onGuess({ lat, lng });
        }}
        polygonsData={polygons}
        polygonAltitude={(d) => (codeOf(d as CountryFeature) === lit ? 0.014 : 0.006)}
        polygonCapColor={(d) =>
          codeOf(d as CountryFeature) === lit ? "rgba(34,197,94,0.45)" : "rgba(0,0,0,0)"
        }
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={(d) =>
          codeOf(d as CountryFeature) === lit
            ? "#22c55e"
            : night ? "#9aa3ae" : "#f8fafc"
        }
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
    </div>
  );
}
