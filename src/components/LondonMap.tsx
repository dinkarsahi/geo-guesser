import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  type ProjectionFunction,
} from "react-simple-maps";
import { geoMercator } from "d3-geo";
import type { Coord } from "../lib/geo";
import type { GuessMapProps } from "./mapTypes";
import { lineColors, stationCoords, tubeConnections, tubeLines, tubeStations } from "../data/tube";
import type { TubeConnectionRaw } from "../data/tube";
import MapZoomControls from "./MapZoomControls";

// London borough boundaries (TopoJSON, object key "london_geo"), drawn as faint
// outlines only — our own geographic rendering, not the copyrighted TfL diagram.
const londonTopoUrl =
  "https://raw.githubusercontent.com/clementamiri/London-Borough-TopoJson/master/london-topojson.json";

const WIDTH = 800;
const PAD = 44;
const MAX_ZOOM = 25;
// Below 1 the network sits smaller than the window, on the paper the svg's own
// background already covers the whole box with.
const MIN_ZOOM = 0.45;
// How near a station a click has to land, in screen pixels, to count as that
// station. Generous, because the dots are small when you're zoomed out.
const SNAP_PX = 20;
const MAX_ZONE_BAND = 6; // zones 6+ grouped into the outermost band

// Zoomed-in stations are pushed apart on top of the plain zoom, so clusters
// like Bank/Monument separate into individually clickable dots. Zoomed out
// there's nothing to separate, and the un-clamped curve would run negative and
// turn the network inside out.
const MAX_SPREAD = 2.4;
const spreadFor = (zoom: number) =>
  1 + (MAX_SPREAD - 1) * (1 - 1 / Math.max(1, zoom));

// How long the view takes to pull back to the whole network once the answer is
// revealed, and the easing that gets it there.
const REVEAL_MS = 900;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const ZONE_LABEL_R = 8;
const LINE_WIDTH = 2.4;
const STRIPE_GAP = 1.7; // sideways step between lines sharing a stretch of track

/**
 * A landmark can't sit on its true spot on the zoomed-out map — at that size it
 * would blot out the stations around it — so it starts small, nudged into a gap
 * nearby, and settles onto the real place as the map opens up: by
 * `LANDMARK_SETTLE_ZOOM` it has grown to full size and is standing on its own
 * coordinates, where there's room for it.
 */
const LANDMARK_R = 8; // rough radius of a landmark icon at its smallest
const LANDMARK_MIN_SCALE = 0.62; // icon size on screen, zoomed out…
const LANDMARK_MAX_SCALE = 2.2; // …and once settled
const LANDMARK_SETTLE_ZOOM = 6;
const LANDMARK_OFFSETS = [13, 17, 21]; // how far out of the way to look, in base px

type Pt = [number, number];

// Landmarks used purely to orient the player. Each icon is drawn around (0,0)
// with its feet at `base`, so it can either be centred on a gap in the map or
// stood upright on its true spot.
const LANDMARKS: {
  name: string;
  lat: number;
  lng: number;
  icon: string;
  base: number;
}[] = [
  { name: "Big Ben", lat: 51.5007, lng: -0.1246, icon: "bigben", base: 11 },
  { name: "Tower Bridge", lat: 51.5055, lng: -0.0754, icon: "tower", base: 7 },
];

// Rough course of the River Thames across the map (west -> east), incl. the
// distinctive loop around the Isle of Dogs.
const THAMES: Pt[] = [
  [-0.33, 51.47], [-0.308, 51.472], [-0.286, 51.488], [-0.255, 51.487],
  [-0.23, 51.474], [-0.216, 51.467], [-0.195, 51.469], [-0.175, 51.482],
  [-0.15, 51.485], [-0.132, 51.486], [-0.122, 51.494], [-0.122, 51.501],
  [-0.116, 51.507], [-0.106, 51.509], [-0.094, 51.508], [-0.084, 51.506],
  [-0.075, 51.505], [-0.06, 51.506], [-0.043, 51.51], [-0.035, 51.501],
  [-0.028, 51.492], [-0.012, 51.485], [0.001, 51.492], [0.005, 51.503],
  [0.008, 51.508], [0.022, 51.505], [0.038, 51.497], [0.065, 51.497],
  [0.09, 51.508],
];

/**
 * Where several lines share a stretch of track they'd otherwise be drawn on top
 * of one another (the Circle line is under the District or Metropolitan for
 * almost its whole length). Each gets a `slot`: a sideways step off the centre
 * line, so the corridor reads as parallel stripes like the TfL map. Ordering by
 * line keeps a stripe on the same side along a whole corridor.
 */
const stripedConnections = (() => {
  const rank = new Map(tubeLines.map((l, i) => [l.color, i]));
  const corridors = new Map<string, TubeConnectionRaw[]>();
  for (const c of tubeConnections) {
    const key = c.a < c.b ? `${c.a}|${c.b}` : `${c.b}|${c.a}`;
    const group = corridors.get(key);
    if (group) group.push(c);
    else corridors.set(key, [c]);
  }
  const out: (TubeConnectionRaw & { slot: number })[] = [];
  for (const group of corridors.values()) {
    group.sort((x, y) => (rank.get(x.color) ?? 0) - (rank.get(y.color) ?? 0));
    group.forEach((c, i) => out.push({ ...c, slot: i - (group.length - 1) / 2 }));
  }
  return out;
})();

interface LondonMapProps extends GuessMapProps {
  night?: boolean;
}

interface Position {
  coordinates: [number, number];
  zoom: number;
}

/** Convex hull (Andrew's monotone chain) of a set of points. */
function convexHull(points: Pt[]): Pt[] {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/** Distance from p to the segment a-b. */
function segDist(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * How much empty space surrounds p: the distance to the nearest station dot or
 * line segment. `bound` is the best score found so far — once a candidate drops
 * to it there's no point measuring the rest.
 */
function clearance(p: Pt, stations: Pt[], segments: [Pt, Pt][], bound = -Infinity): number {
  let best = Infinity;
  for (const s of stations) {
    const d = Math.hypot(p[0] - s[0], p[1] - s[1]);
    if (d < best) {
      best = d;
      if (best <= bound) return best;
    }
  }
  for (const [a, b] of segments) {
    const d = segDist(p, a, b);
    if (d < best) {
      best = d;
      if (best <= bound) return best;
    }
  }
  return best;
}

/** Distance from o to where a ray leaves a convex polygon (o must be inside). */
function rayExitRadius(poly: Pt[], o: Pt, dir: Pt): number | null {
  let best: number | null = null;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const denom = dir[0] * ey - dir[1] * ex;
    if (Math.abs(denom) < 1e-9) continue;
    const t = ((a[0] - o[0]) * ey - (a[1] - o[1]) * ex) / denom;
    const u = ((a[0] - o[0]) * dir[1] - (a[1] - o[1]) * dir[0]) / denom;
    if (t >= 0 && u >= -1e-9 && u <= 1 + 1e-9 && (best === null || t > best)) best = t;
  }
  return best;
}

/**
 * Finds the emptiest spot within an annulus (between `inner` and `outer`), at
 * least `radius` clear of the band edges and of anything already placed.
 */
function findClearSpot(
  outer: Pt[],
  inner: Pt[] | null,
  centre: Pt,
  radius: number,
  stations: Pt[],
  segments: [Pt, Pt][],
  taken: Pt[],
): Pt | null {
  const ANGLES = 128;
  let best: Pt | null = null;
  let bestScore = -Infinity;
  for (let i = 0; i < ANGLES; i++) {
    const a = (2 * Math.PI * i) / ANGLES;
    const dir: Pt = [Math.cos(a), Math.sin(a)];
    const rOut = rayExitRadius(outer, centre, dir);
    if (rOut === null) continue;
    const rIn = inner ? rayExitRadius(inner, centre, dir) ?? 0 : 0;
    const lo = rIn + radius + 2;
    const hi = rOut - radius - 2;
    if (hi < lo) continue;
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const r = lo + (hi - lo) * t;
      const p: Pt = [centre[0] + dir[0] * r, centre[1] + dir[1] * r];
      let score = clearance(p, stations, segments, bestScore);
      for (const q of taken)
        score = Math.min(score, Math.hypot(p[0] - q[0], p[1] - q[1]) / 2.4);
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
  }
  return best;
}

export default function LondonMap({
  onGuess,
  guess,
  answer,
  disabled = false,
  night = false,
}: LondonMapProps) {
  // White, TfL-style palette in day mode; a dark variant for night mode.
  const theme = night
    ? {
        bg: "#16171d", zoneOdd: "#1b1d24", zoneEven: "#23262f", borough: "#3a3d49",
        dot: "#f3f4f6", dotStroke: "#000", labelBg: "#20222b", labelStroke: "#8b8f99",
        labelText: "#eef", thames: "#3a6ea5", hoverRing: "#e9d5ff",
      }
    : {
        bg: "#ffffff", zoneOdd: "#ffffff", zoneEven: "#e6e6e6", borough: "#d3d3d3",
        dot: "#ffffff", dotStroke: "#222", labelBg: "#ffffff", labelStroke: "#8a8a8a",
        labelText: "#333", thames: "#9dc3e6", hoverRing: "#7c3aed",
      };

  // Black would all but vanish on the night background, so the Northern line
  // gets lifted to a charcoal — still the darkest line on the map.
  const lineColor = (c: string) =>
    night && c === lineColors.Northern ? "#4a4b55" : c;

  // Fit a Mercator projection to the width, then size the height to the data so
  // there's no empty band above/below the network.
  const { projection, mapHeight } = useMemo(() => {
    const unit = geoMercator().scale(1).translate([0, 0]);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of tubeStations) {
      const p = unit([s.lng, s.lat]);
      if (!p) continue;
      minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
    }
    const scale = (WIDTH - 2 * PAD) / (maxX - minX);
    const height = Math.round((maxY - minY) * scale + 2 * PAD);
    const proj = geoMercator()
      .scale(scale)
      .translate([PAD - minX * scale, PAD - minY * scale]);
    return { projection: proj, mapHeight: height };
  }, []);

  /**
   * Everything below is laid out once, in un-zoomed map pixels: the zone bands,
   * and the positions for zone numbers and landmark icons — both chosen to sit
   * in gaps rather than on top of stations and lines.
   */
  const layout = useMemo(() => {
    const stationPts = tubeStations
      .map((s) => projection([s.lng, s.lat]) as Pt)
      .filter(Boolean);

    const segments: [Pt, Pt][] = [];
    for (const c of tubeConnections) {
      const a = stationCoords[c.a];
      const b = stationCoords[c.b];
      if (!a || !b) continue;
      const pa = projection([a.lng, a.lat]);
      const pb = projection([b.lng, b.lat]);
      if (pa && pb) segments.push([pa as Pt, pb as Pt]);
    }

    const banded = tubeStations.map((s) => ({
      band: Math.min(Math.round(s.zone), MAX_ZONE_BAND),
      p: projection([s.lng, s.lat]) as Pt,
    }));
    const z1 = banded.filter((o) => o.band === 1).map((o) => o.p);
    const centre: Pt = [
      z1.reduce((a, p) => a + p[0], 0) / z1.length,
      z1.reduce((a, p) => a + p[1], 0) / z1.length,
    ];

    const hulls: Record<number, Pt[]> = {};
    for (let z = 1; z <= MAX_ZONE_BAND; z++)
      hulls[z] = convexHull(banded.filter((o) => o.band <= z).map((o) => o.p));

    // Outermost band first, so inner zones paint over it.
    const bands: { z: number; hull: Pt[] }[] = [];
    for (let z = MAX_ZONE_BAND; z >= 1; z--)
      if (hulls[z].length >= 3) bands.push({ z, hull: hulls[z] });

    // Landmarks are anchored to real places, so they get first pick of the gaps;
    // their icons then count as obstacles when the zone numbers are placed.
    const taken: Pt[] = [];
    const landmarks = LANDMARKS.map((l) => {
      const at = projection([l.lng, l.lat]) as Pt;
      let best: Pt = [0, -LANDMARK_OFFSETS[0]];
      let bestScore = -Infinity;
      for (let i = 0; i < 32; i++) {
        const a = (2 * Math.PI * i) / 32;
        for (const r of LANDMARK_OFFSETS) {
          const off: Pt = [Math.cos(a) * r, Math.sin(a) * r];
          const p: Pt = [at[0] + off[0], at[1] + off[1]];
          // Clear enough for the icon is good enough; after that, closer wins,
          // so it stays near the thing it marks.
          let score =
            Math.min(clearance(p, stationPts, segments, bestScore), LANDMARK_R) -
            (r - LANDMARK_OFFSETS[0]) * 0.12;
          for (const q of taken)
            score = Math.min(score, Math.hypot(p[0] - q[0], p[1] - q[1]) / 2.4);
          if (score > bestScore) {
            bestScore = score;
            best = off;
          }
        }
      }
      taken.push([at[0] + best[0], at[1] + best[1]]);
      return { ...l, at, off: best };
    });

    const labels: { z: number; x: number; y: number }[] = [];
    for (let z = 1; z <= MAX_ZONE_BAND; z++) {
      if (!hulls[z] || hulls[z].length < 3) continue;
      const inner = z > 1 && hulls[z - 1].length >= 3 ? hulls[z - 1] : null;
      const spot = findClearSpot(
        hulls[z], inner, centre, ZONE_LABEL_R, stationPts, segments, taken,
      );
      if (!spot) continue;
      labels.push({ z, x: spot[0], y: spot[1] });
      taken.push(spot);
    }

    const thames = THAMES.map((c) => projection(c)).filter((p): p is Pt => !!p);

    // One marker per station, carrying the colour of every line that calls
    // there — always in line order, so an interchange's ring looks the same
    // whichever way the map is drawn.
    const dots = tubeStations.map((s) => ({
      name: s.name,
      // Kept alongside the projected point because the dots are also the only
      // things you're allowed to click, and a guess is a lat/lng.
      lat: s.lat,
      lng: s.lng,
      at: projection([s.lng, s.lat]) as Pt,
      colors: tubeLines
        .filter((l) => s.lines.includes(l.name))
        .map((l) => l.color),
    }));

    return { bands, labels, landmarks, thames, dots };
  }, [projection]);

  const defaultCenter = useMemo(
    () => projection.invert!([WIDTH / 2, mapHeight / 2]) as [number, number],
    [projection, mapHeight],
  );

  const [position, setPosition] = useState<Position>(() => ({
    coordinates: defaultCenter,
    zoom: 1,
  }));
  /** Name of the station under the pointer, if the pointer is on one. */
  const [hovered, setHovered] = useState<string | null>(null);
  // Eleven lines is a lot of corner to give up on a phone, where the map has
  // little enough room as it is — so there the key starts folded away.
  const [keyOpen, setKeyOpen] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia?.("(max-width: 700px)").matches,
  );

  // The fly-out runs outside React's render loop, so it reads the live view
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
   * Eases the view across to `to` instead of cutting straight there. The zoom
   * moves geometrically — every frame is the same proportional step, which
   * reads as a steady pull-back rather than a lurch at one end — while the
   * centre travels in a straight line across the map.
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

  // A new round cuts straight back to the full-network view — there's nothing
  // left on screen to follow, so there's nothing to animate.
  const [prevAnswer, setPrevAnswer] = useState(answer);
  if (answer !== prevAnswer) {
    setPrevAnswer(answer);
    if (!answer) setPosition({ coordinates: defaultCenter, zoom: 1 });
  }

  /**
   * The revealed answer is eased out to instead, so the player can follow their
   * zoomed-in patch of map back into the whole network and see where the
   * station really sits. Any flight still in the air is dropped when the next
   * round resets the view above.
   */
  useEffect(() => {
    if (answer) flyTo({ coordinates: defaultCenter, zoom: 1 });
    else stopFlight();
  }, [answer, defaultCenter, flyTo, stopFlight]);

  const k = position.zoom;
  const s = spreadFor(k);
  // The spread pushes everything away from the point under the middle of the
  // viewport, which is also what ZoomableGroup keeps centred — so that point
  // stays put and only the space around it opens up.
  const anchor = useMemo(
    () => (projection(position.coordinates) ?? [WIDTH / 2, mapHeight / 2]) as Pt,
    [projection, position.coordinates, mapHeight],
  );
  const sp = (p: Pt): Pt => [
    anchor[0] + (p[0] - anchor[0]) * s,
    anchor[1] + (p[1] - anchor[1]) * s,
  ];
  const px = (p: Pt) => `${anchor[0] + (p[0] - anchor[0]) * s},${anchor[1] + (p[1] - anchor[1]) * s}`;
  // Dots, lines and icons grow with zoom, but more slowly than the gaps between
  // stations do — so a cluster resolves into separate targets instead of blobs.
  // Line widths grow slowest of all, keeping station dots readable on top.
  const sz = (v: number) => v * Math.pow(k, -0.55);
  const szStroke = (v: number) => v * Math.pow(k, -0.72);
  // 0 fully zoomed out, 1 once a landmark has grown to full size and walked
  // onto its true coordinates. Smoothstepped, so neither end of the zoom range
  // is where all the movement happens.
  // Clamped at both ends: zoomed out past 1 the log goes negative.
  const settleT = Math.max(0, Math.min(1, Math.log(k) / Math.log(LANDMARK_SETTLE_ZOOM)));
  const settled = settleT * settleT * (3 - 2 * settleT);

  const zoomBy = (factor: number) => {
    setPosition((p) => ({
      coordinates: p.coordinates,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p.zoom * factor)),
    }));
  };

  /**
   * react-simple-maps reports the centre as if the map weren't spread, so undo
   * the spread before storing it — otherwise the view would jump every time the
   * spread is re-anchored after a pan or zoom.
   */
  const handleMoveEnd = (p: Position) => {
    const raw = projection(p.coordinates);
    if (!raw) return setPosition(p);
    const trueCentre: Pt = [
      anchor[0] + (raw[0] - anchor[0]) / s,
      anchor[1] + (raw[1] - anchor[1]) / s,
    ];
    const inverted = projection.invert!(trueCentre);
    setPosition({ coordinates: inverted ?? p.coordinates, zoom: p.zoom });
  };

  /**
   * The station nearest the pointer, or null if the pointer isn't near one.
   * The answer is always a station, so a point on open map isn't a guess worth
   * taking — this is what makes the dots the only targets on the map.
   */
  const stationAt = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // The svg is fitted inside its box, so it's scaled by whichever axis has
    // the least room and centred, with the leftover showing as paper.
    const fit = Math.min(rect.width / WIDTH, rect.height / mapHeight);
    const sx = (e.clientX - rect.left - (rect.width - WIDTH * fit) / 2) / fit;
    const sy = (e.clientY - rect.top - (rect.height - mapHeight * fit) / 2) / fit;
    // Back to un-zoomed map pixels, where one pixel is fit * k * s on screen —
    // so the reach stays the same distance under the cursor at every zoom.
    const ux = anchor[0] + (sx - WIDTH / 2) / (k * s);
    const uy = anchor[1] + (sy - mapHeight / 2) / (k * s);
    const reach = SNAP_PX / (fit * k * s);

    let best: (typeof layout.dots)[number] | null = null;
    let bestDist = reach * reach;
    for (const d of layout.dots) {
      const dx = d.at[0] - ux;
      const dy = d.at[1] - uy;
      const dist = dx * dx + dy * dy;
      if (dist <= bestDist) {
        bestDist = dist;
        best = d;
      }
    }
    return best;
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;
    const station = stationAt(e);
    // Clicking open map does nothing at all, rather than dropping a pin in a
    // field. The guess is the station itself, so a right answer is exact.
    if (station) onGuess({ lat: station.lat, lng: station.lng });
  };

  // Drives both the cursor and the ring under the dot, so it's visible that
  // the stations are the targets before you click anything.
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) =>
    setHovered(disabled ? null : (stationAt(e)?.name ?? null));

  const project = (c: Coord) => {
    const p = projection([c.lng, c.lat]);
    return p ? sp(p as Pt) : null;
  };
  const guessPt = guess ? project(guess) : null;
  const answerPt = answer ? project(answer) : null;

  const thamesPoints = layout.thames.map(px).join(" ");

  return (
    <div className="tube-wrap">
      <div className="tube-canvas">
        <ComposableMap
          width={WIDTH}
          height={mapHeight}
          // react-simple-maps uses a function-valued projection as-is at runtime;
          // the d3 instance is callable, so this works despite the stricter type.
          projection={projection as unknown as ProjectionFunction}
          onClick={handleClick}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
          // Fitted rather than cropped: a station that's off the edge is a
          // station you can't click. The svg's own background fills the rest.
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: theme.bg,
            // Only a pointer over a station, since that's all there is to hit.
            cursor: disabled ? "default" : hovered ? "pointer" : "grab",
          }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            // Grabbing the map mid-flight hands control straight back.
            onMoveStart={stopFlight}
            onMoveEnd={handleMoveEnd}
            // Allow both scroll-wheel and trackpad pinch (ctrl+wheel) to zoom.
            filterZoomEvent={(event) => {
              const e = event as unknown as { button?: number };
              return !e.button;
            }}
          >
            {/* Fare-zone shading: alternating concentric bands, TfL-style. */}
            {layout.bands.map(({ z, hull }) => (
              <polygon
                key={z}
                points={hull.map(px).join(" ")}
                fill={z % 2 === 1 ? theme.zoneOdd : theme.zoneEven}
                stroke={theme.labelStroke}
                strokeOpacity={0.35}
                strokeWidth={sz(0.6)}
              />
            ))}

            {/* Faint borough outlines, spread to match the rest of the map. */}
            <g transform={`translate(${anchor[0] * (1 - s)} ${anchor[1] * (1 - s)}) scale(${s})`}>
              <Geographies geography={londonTopoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="none"
                      stroke={theme.borough}
                      strokeWidth={sz(0.5) / s}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
            </g>

            {/* River Thames ribbon. */}
            {thamesPoints && (
              <polyline
                points={thamesPoints}
                fill="none"
                stroke={theme.thames}
                strokeWidth={szStroke(5)}
                strokeOpacity={0.9}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Landmark icons. Zoomed out they're small and parked in a
                nearby gap, with a leader back to the exact spot; zooming in
                grows them and walks them onto their real coordinates. Drawn
                under the network, so a settled landmark can't hide a line or a
                station. */}
            {layout.landmarks.map((l) => {
              const at = sp(l.at);
              // Screen offset shrinks to nothing as the icon settles, and the
              // /k undoes the group's zoom so these stay screen measurements.
              const cx = at[0] + (l.off[0] * (1 - settled)) / k;
              const cy = at[1] + (l.off[1] * (1 - settled)) / k;
              const scale =
                (LANDMARK_MIN_SCALE +
                  (LANDMARK_MAX_SCALE - LANDMARK_MIN_SCALE) * settled) /
                k;
              // Settled, it stands on the spot rather than covering it.
              const stand = l.base * scale * settled;
              return (
                <g key={l.name}>
                  <title>{l.name}</title>
                  <g opacity={1 - settled}>
                    <line x1={at[0]} y1={at[1]} x2={cx} y2={cy}
                      stroke="#9aa0a6" strokeWidth={sz(0.7)} strokeDasharray={`${sz(2)} ${sz(2)}`} />
                    <circle cx={at[0]} cy={at[1]} r={sz(1.4)} fill="#9aa0a6" />
                  </g>
                  <g transform={`translate(${cx} ${cy - stand}) scale(${scale})`}>
                    {l.icon === "bigben" && (
                      <g stroke="#7d6a2f" strokeWidth={0.8}>
                        <rect x={-2.4} y={-6} width={4.8} height={17} fill="#c2a24a" />
                        <polygon points="-2.6,-6 2.6,-6 0,-10.5" fill="#8a6f30" />
                        <circle cx={0} cy={-2.5} r={1.7} fill="#fff" />
                      </g>
                    )}
                    {l.icon === "tower" && (
                      <g stroke="#3f5a7a" strokeWidth={0.8} fill="#7ea3cf">
                        <rect x={-9} y={-4} width={4} height={11} />
                        <rect x={5} y={-4} width={4} height={11} />
                        <polygon points="-9,-4 -5,-4 -7,-7" fill="#5b7ba6" />
                        <polygon points="5,-4 9,-4 7,-7" fill="#5b7ba6" />
                        <line x1={-7} y1={-2} x2={7} y2={-2} strokeWidth={1} />
                        <line x1={-5} y1={4} x2={5} y2={4} strokeWidth={1} />
                        <line x1={-13} y1={7} x2={-7} y2={5} fill="none" />
                        <line x1={13} y1={7} x2={7} y2={5} fill="none" />
                      </g>
                    )}
                  </g>
                </g>
              );
            })}

            {/* Our own connecting lines between real station coordinates,
                fanned sideways where lines share a stretch of track. */}
            {stripedConnections.map((c, i) => {
              const a = stationCoords[c.a];
              const b = stationCoords[c.b];
              if (!a || !b) return null;
              const pa = projection([a.lng, a.lat]);
              const pb = projection([b.lng, b.lat]);
              if (!pa || !pb) return null;
              const qa = sp(pa as Pt);
              const qb = sp(pb as Pt);
              // Step perpendicular to the track, by the same amount the stroke
              // itself scales, so the stripes stay side by side at every zoom.
              const dx = qb[0] - qa[0];
              const dy = qb[1] - qa[1];
              const len = Math.hypot(dx, dy) || 1;
              const off = szStroke(STRIPE_GAP) * c.slot;
              const ox = (-dy / len) * off;
              const oy = (dx / len) * off;
              return (
                <line key={i} x1={qa[0] + ox} y1={qa[1] + oy} x2={qb[0] + ox} y2={qb[1] + oy}
                  stroke={lineColor(c.color)} strokeWidth={szStroke(LINE_WIDTH)}
                  strokeLinecap="round" />
              );
            })}

            {/* A marker for every station: a white disc ringed in the colours of
                the lines calling there, split into equal arcs at interchanges
                (TfL-style) so no line is hidden under another. */}
            {layout.dots.map((d) => {
              const q = sp(d.at);
              const n = d.colors.length;
              // Interchanges are drawn a little larger, the more lines they take.
              const r = sz(1.9 + 0.26 * Math.min(n - 1, 4));
              const w = sz(n > 1 ? 1.4 : 1.1);
              const arc = (2 * Math.PI * r) / n;
              return (
                <g key={d.name}>
                  <circle cx={q[0]} cy={q[1]} r={r} fill={theme.dot} />
                  {d.colors.map((c, i) => (
                    <circle
                      key={i}
                      cx={q[0]} cy={q[1]} r={r}
                      fill="none"
                      stroke={lineColor(c)}
                      strokeWidth={w}
                      // One arc per line; no dashes at all when there's just one.
                      strokeDasharray={n > 1 ? `${arc} ${arc * (n - 1)}` : undefined}
                      strokeDashoffset={n > 1 ? -i * arc : undefined}
                    />
                  ))}
                  {/* Hairline so pale lines still read as a station on white. */}
                  <circle cx={q[0]} cy={q[1]} r={r + w / 2} fill="none"
                    stroke={theme.dotStroke} strokeWidth={sz(0.35)} strokeOpacity={0.6} />
                  {d.name === hovered && (
                    <circle cx={q[0]} cy={q[1]} r={r + sz(2.4)} fill="none"
                      stroke={theme.hoverRing} strokeWidth={sz(1.3)} />
                  )}
                </g>
              );
            })}

            {/* Zone number labels, sitting in the emptiest part of each band. */}
            {layout.labels.map(({ z, x, y }) => {
              const q = sp([x, y]);
              return (
                <g key={z}>
                  <circle cx={q[0]} cy={q[1]} r={sz(ZONE_LABEL_R)} fill={theme.labelBg}
                    stroke={theme.labelStroke} strokeWidth={sz(1.2)} />
                  <text x={q[0]} y={q[1]} fontSize={sz(10)} fontWeight={700} textAnchor="middle"
                    dominantBaseline="central" fill={theme.labelText}>
                    {z}
                  </text>
                </g>
              );
            })}

            {guessPt && answerPt && (
              <line x1={guessPt[0]} y1={guessPt[1]} x2={answerPt[0]} y2={answerPt[1]}
                stroke="#c084fc" strokeWidth={sz(1.5)} strokeDasharray={`${sz(4)} ${sz(3)}`} />
            )}
            {guessPt && (
              <circle cx={guessPt[0]} cy={guessPt[1]} r={sz(6)} fill="#e11d48"
                stroke="#fff" strokeWidth={sz(1.5)} />
            )}
            {answerPt && (
              <circle cx={answerPt[0]} cy={answerPt[1]} r={sz(6)} fill="#22c55e"
                stroke="#fff" strokeWidth={sz(1.5)} />
            )}
          </ZoomableGroup>
        </ComposableMap>
        <MapZoomControls onZoomIn={() => zoomBy(1.6)} onZoomOut={() => zoomBy(1 / 1.6)} />
      </div>

      <div className="tube-key-wrap">
        {keyOpen && (
          <ul className="tube-key" id="tube-key">
            {tubeLines.map((l) => (
              <li key={l.id}>
                <span className="tube-key-swatch" style={{ background: lineColor(l.color) }} />
                {l.name}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="tube-key-toggle"
          aria-expanded={keyOpen}
          aria-controls="tube-key"
          onClick={() => setKeyOpen((open) => !open)}
        >
          {keyOpen ? "Hide key ▾" : "Line key ▴"}
        </button>
      </div>
    </div>
  );
}
