import { useEffect, useState } from "react";
import { geoArea, geoCentroid, geoContains, type ExtendedFeature } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { haversineKm, type Coord } from "./geo";

/**
 * Natural Earth 1:50m country polygons (GeoJSON, via jsDelivr). One shared
 * download backs three things: the flat map's shapes, the globe's borders, and
 * the "did the click land inside the right country?" test.
 *
 * The 1:110m file is a quarter of the size, but it simply hasn't heard of the
 * small countries — no Maldives, Malta, Singapore, Monaco or Mauritius, and
 * none of the island states. A country that isn't in here can't be drawn, can't
 * be clicked and never comes up as a question, so the detail is worth the bytes.
 */
const WORLD_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson";

/** Steradians -> square kilometres. */
const EARTH_KM2 = 40_680_000;

/**
 * Below this a country is a speck on a world map: a few pixels at most zoomed
 * out, and for the likes of the Maldives still under a pixel zoomed right in.
 * These are the ones that need somewhere visible to aim.
 */
const SMALL_KM2 = 12_000;

/**
 * How near a speck of a country you have to click for it to count. Roughly the
 * size the marker standing in for it covers on a world map, so what you can aim
 * at is what you can hit.
 */
const SMALL_TARGET_KM = 250;

/**
 * The flat map draws its countries as SVG paths, which it can do at any detail
 * for nothing. The globe builds a 3D mesh out of every one of them, and the
 * 1:50m coastline is far more of it than a globe can spin: at full detail it
 * drops to single figures for frames a second, which takes the reveal flight
 * down with it. So the globe gets its own coarser copy of the world — every
 * country still there and still clickable, drawn from about a tenth of the
 * points. These two numbers are what buy that back, and they were picked by
 * measuring: together they land the globe on the vertex count it used to run
 * at 60fps.
 */
const GLOBE_TOLERANCE_DEG = 0.2;
const GLOBE_MIN_ISLAND_KM2 = 500;

type Pt = [number, number];

/** Square of the distance from p to the segment a-b. */
function sqSegDist(p: Pt, a: Pt, b: Pt): number {
  let x = a[0];
  let y = a[1];
  const dx = b[0] - x;
  const dy = b[1] - y;
  if (dx || dy) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  return (p[0] - x) ** 2 + (p[1] - y) ** 2;
}

/**
 * Ramer-Douglas-Peucker: drops the points that sit close enough to the line
 * between their neighbours to not be missed. The ends are always kept, so a
 * ring stays closed.
 */
function simplifyRing(points: Pt[], tolerance: number): Pt[] {
  if (points.length <= 4) return points;
  const maxSq = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [from, to] = stack.pop()!;
    let worst = 0;
    let at = -1;
    for (let i = from + 1; i < to; i++) {
      const d = sqSegDist(points[i], points[from], points[to]);
      if (d > worst) {
        worst = d;
        at = i;
      }
    }
    if (worst > maxSq && at > 0) {
      keep[at] = 1;
      stack.push([from, at], [at, to]);
    }
  }
  const out = points.filter((_, i) => keep[i]);
  // Fewer than four points isn't a ring any more — keep the original instead.
  return out.length >= 4 ? out : points;
}

/**
 * Do two segments cross, not counting the ends they share with a neighbour?
 */
function segmentsCross(a1: Pt, a2: Pt, b1: Pt, b2: Pt): boolean {
  const side = (o: Pt, p: Pt, q: Pt) =>
    (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const d1 = side(b1, b2, a1);
  const d2 = side(b1, b2, a2);
  const d3 = side(a1, a2, b1);
  const d4 = side(a1, a2, b2);
  // Strictly opposite sides both ways. Touching counts as not crossing, which
  // is what we want: coastlines meet at shared vertices all the time.
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/**
 * Does this ring cross itself?
 *
 * Ramer-Douglas-Peucker is blind to topology. It drops the points that sit near
 * the line between their neighbours, and where a coastline doubles back on
 * itself — a fjord, a spit, the mouth of an inlet — the survivors can end up
 * crossing. **Fifteen of the world's 1,632 rings do it at the tolerance above**,
 * and they are exactly the countries you would guess: Canada, Russia, the
 * United States, the United Kingdom, Chile, Greenland, India, Mexico, Pakistan,
 * Panama, the Netherlands, Papua New Guinea, Turkmenistan, The Gambia, Western
 * Sahara.
 *
 * It matters because everything downstream assumes a ring is simple. The globe
 * decides which triangles of a country to keep by asking whether their centre
 * is inside it, and "inside" has no answer for a ring that crosses itself — so
 * a country comes out with patches of its middle missing.
 *
 * O(n²) in the ring's length, which is only affordable because it is asked of
 * the *simplified* ring: 20,000 points across the whole world rather than
 * 550,000. Measured at about 35 ms for all of them.
 */
function crossesItself(ring: Pt[]): boolean {
  const n = ring.length - 1; // the last point repeats the first
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      // Adjacent segments share a vertex, and the first and last close the ring.
      if (i === 0 && j === n - 1) continue;
      if (segmentsCross(ring[i], ring[i + 1], ring[j], ring[j + 1])) return true;
    }
  }
  return false;
}

/**
 * Simplify, but never into a ring that crosses itself: halve the tolerance and
 * try again, and keep the full-detail ring rather than ship a broken one.
 *
 * All fifteen of the world's problem rings come good within three halvings, so
 * the fallback has never yet been reached — it is there because a coastline
 * that defeats it should cost points rather than correctness. The whole repair
 * costs about 15% more points across the world and 35 ms once, at load.
 */
function simplifyRingSafely(points: Pt[], tolerance: number): Pt[] {
  let tol = tolerance;
  // Four goes — the tolerance, then an eighth of it — and one crossing test
  // apiece, which is the expensive half and shouldn't be paid twice for a ring
  // that was fine to begin with.
  for (let tries = 0; tries <= 3; tries++) {
    const out = simplifyRing(points, tol);
    if (!crossesItself(out)) return out;
    tol /= 2;
  }
  return points;
}

const ringKm2 = (ring: Pt[]) =>
  geoArea({ type: "Polygon", coordinates: [ring] } as unknown as ExtendedFeature) *
  EARTH_KM2;

/** The same countries, cheap enough to spin: fewer islands, fewer points. */
function coarsenForGlobe(features: CountryFeature[]): CountryFeature[] {
  return features.map((f) => {
    const g = f.geometry;
    if (g.type !== "Polygon" && g.type !== "MultiPolygon") return f;

    const parts: Pt[][][] =
      g.type === "MultiPolygon" ? (g.coordinates as Pt[][][]) : [g.coordinates as Pt[][]];

    // Biggest landmass first, so a country always keeps at least its main body
    // however small that is — an island state is nothing but small islands.
    const ranked = parts
      .map((rings) => ({ rings, km2: ringKm2(rings[0]) }))
      .sort((a, b) => b.km2 - a.km2);

    const kept = ranked
      .filter((p, i) => i === 0 || p.km2 >= GLOBE_MIN_ISLAND_KM2)
      .map(({ rings }) =>
        rings
          .map((ring) => simplifyRingSafely(ring, GLOBE_TOLERANCE_DEG))
          .filter((ring) => ring.length >= 4),
      )
      .filter((rings) => rings.length > 0);

    if (!kept.length) return f;
    return {
      ...f,
      geometry: { type: "MultiPolygon", coordinates: kept },
    } as CountryFeature;
  });
}

export interface CountryProps {
  NAME?: string;
  /** Unabbreviated English name ("Dem. Rep. Congo" -> the full thing). */
  NAME_EN?: string;
  NAME_LONG?: string;
  ISO_A2?: string;
  /** ISO_A2 with de-facto codes filled in (e.g. Norway, France). */
  ISO_A2_EH?: string;
  CONTINENT?: string;
  SUBREGION?: string;
  POP_EST?: number;
  /** Natural Earth's label anchor — a point inside the country's main body. */
  LABEL_X?: number;
  LABEL_Y?: number;
}

export type CountryFeature = Feature<Geometry, CountryProps>;

export interface WorldShapes {
  features: CountryFeature[];
  /**
   * The same countries at a detail a 3D globe can spin. Only for drawing and
   * clicking on the globe — never for deciding whether a guess was right.
   */
  globeFeatures: CountryFeature[];
  /** Lowercase ISO alpha-2 code -> country polygon. */
  byCode: Record<string, CountryFeature>;
  /**
   * The countries too small to aim at, and the spot to aim at instead. Both
   * maps mark these, and a click near one counts as finding it.
   */
  smallTargets: Record<string, Coord>;
}

/** Where to aim for a country: Natural Earth's label anchor, else its centroid. */
function aimPoint(f: CountryFeature): Coord {
  const { LABEL_X, LABEL_Y } = f.properties ?? {};
  if (typeof LABEL_X === "number" && typeof LABEL_Y === "number")
    return { lat: LABEL_Y, lng: LABEL_X };
  const [lng, lat] = geoCentroid(f as ExtendedFeature);
  return { lat, lng };
}

let pending: Promise<WorldShapes> | null = null;

/** Fetches the country polygons once per session and caches the result. */
export function loadWorldShapes(): Promise<WorldShapes> {
  pending ??= fetch(WORLD_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`world shapes: HTTP ${r.status}`);
      return r.json() as Promise<FeatureCollection<Geometry, CountryProps>>;
    })
    .then((collection) => {
      const features = collection.features;
      const byCode: Record<string, CountryFeature> = {};
      const areaOf = new Map<CountryFeature, number>();
      for (const f of features) {
        const code = (f.properties?.ISO_A2_EH || f.properties?.ISO_A2 || "").toLowerCase();
        if (!code || code === "-99") continue;
        const km2 = geoArea(f as ExtendedFeature) * EARTH_KM2;
        areaOf.set(f, km2);
        // A code can be claimed by more than one polygon: Australia shares "AU"
        // with two of its external territories, one of them a 3 km² reef. The
        // biggest is the country everyone means by the code.
        const held = byCode[code];
        if (!held || km2 > (areaOf.get(held) ?? 0)) byCode[code] = f;
      }

      const smallTargets: Record<string, Coord> = {};
      for (const [code, f] of Object.entries(byCode))
        if ((areaOf.get(f) ?? 0) < SMALL_KM2) smallTargets[code] = aimPoint(f);

      return { features, globeFeatures: coarsenForGlobe(features), byCode, smallTargets };
    })
    .catch((err) => {
      // Let a later attempt retry rather than caching the failure forever.
      pending = null;
      throw err;
    });
  return pending;
}

/**
 * A crude box round every separate landmass, worked out once. Point-in-polygon
 * over 242 coastlines is far too much to do on every mouse move, and almost all
 * of them can be ruled out by four comparisons first.
 *
 * One box per landmass rather than per country, which matters more than it
 * sounds: Canada's box is most of a hemisphere, and a point anywhere in it
 * would otherwise have to be tested against all several hundred of its islands.
 * Per landmass, a click on the mainland tests the mainland and nothing else.
 */
interface Boxed {
  feature: CountryFeature;
  /** Outer ring first, then any holes — a single polygon of the country. */
  rings: Pt[][];
  west: number;
  east: number;
  south: number;
  north: number;
}

const boxesFor = new WeakMap<WorldShapes, Boxed[]>();

function landBoxes(shapes: WorldShapes): Boxed[] {
  let boxes = boxesFor.get(shapes);
  if (boxes) return boxes;
  boxes = [];
  for (const feature of shapes.features) {
    const g = feature.geometry;
    if (g.type !== "Polygon" && g.type !== "MultiPolygon") continue;
    const parts: Pt[][][] =
      g.type === "MultiPolygon" ? (g.coordinates as Pt[][][]) : [g.coordinates as Pt[][]];
    for (const rings of parts) {
      let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
      for (const [lng, lat] of rings[0]) {
        if (lng < west) west = lng;
        if (lng > east) east = lng;
        if (lat < south) south = lat;
        if (lat > north) north = lat;
      }
      if (west <= east) boxes.push({ feature, rings, west, east, south, north });
    }
  }
  boxesFor.set(shapes, boxes);
  return boxes;
}

/**
 * The country a point lands in, or null for open water. The maps use it to
 * turn away guesses dropped in the sea — there's no country there to be
 * looking for, so a click on it isn't an answer to anything.
 */
export function countryAt(
  shapes: WorldShapes | null,
  c: Coord,
): CountryFeature | null {
  if (!shapes) return null;
  for (const b of landBoxes(shapes)) {
    if (c.lng < b.west || c.lng > b.east || c.lat < b.south || c.lat > b.north) continue;
    const one = { type: "Polygon", coordinates: b.rings } as unknown as ExtendedFeature;
    if (geoContains(one, [c.lng, c.lat])) return b.feature;
  }
  return null;
}

/**
 * The point that stands in for wherever a click landed: the anchor of the
 * country it fell in. Modes whose answer is a country score a guess from here
 * rather than from the click itself, so that picking a country means the same
 * thing wherever inside it you happened to press — the question was never which
 * part of India, and two clicks 3,000 km apart in the same country shouldn't
 * score differently.
 *
 * A click that found no country keeps its own position. Both maps turn those
 * away before they ever become a guess, so this is only the honest fallback.
 */
export function anchorAt(shapes: WorldShapes | null, c: Coord): Coord {
  const feature = countryAt(shapes, c);
  return feature ? aimPoint(feature) : c;
}

/** ISO alpha-2 of a country on the map, lowercased. */
export const codeOf = (f: CountryFeature) =>
  (f.properties?.ISO_A2_EH || f.properties?.ISO_A2 || "").toLowerCase();

/** The map's own name for a country, unabbreviated where it has one. */
export const nameOf = (f: CountryFeature) =>
  f.properties?.NAME_EN || f.properties?.NAME_LONG || f.properties?.NAME || "";

/**
 * The map's own name for the country a point landed in, or null for open
 * water. What a mode names the country it was asking about and what it calls
 * the country you picked instead both come from here, so a country is called
 * the same thing whichever of the two it turns out to be.
 */
export function countryNameAt(shapes: WorldShapes | null, c: Coord): string | null {
  const feature = countryAt(shapes, c);
  return feature ? nameOf(feature) || null : null;
}

/**
 * The country a missed guess landed in, for painting red on the reveal beside
 * the green answer — because "the answer was Peru" is half a lesson next to
 * "and this is where you pressed", and on a world map a pin can be hard to
 * place in a country by eye even once you're looking straight at it.
 *
 * Null whenever there's nothing to paint: mid-round, on a guess that found the
 * right country, or on a round the clock took with nothing clicked.
 *
 * Taken from the raw click rather than from the marker, which modes that ask
 * for a country move to that country's anchor — and a handful of those sit out
 * at sea or inside a neighbour, which would paint the wrong country or none.
 */
export function missedCountryCode(
  shapes: WorldShapes | null,
  result: { hit: boolean; click: Coord | null } | null,
  revealed: boolean,
): string | null {
  if (!revealed || !result || result.hit || !result.click) return null;
  const feature = countryAt(shapes, result.click);
  return feature ? codeOf(feature) || null : null;
}

/** The country polygons once they've downloaded; null until then. */
export function useWorldShapes(): WorldShapes | null {
  const [shapes, setShapes] = useState<WorldShapes | null>(null);
  useEffect(() => {
    let live = true;
    loadWorldShapes()
      .then((s) => { if (live) setShapes(s); })
      .catch(() => { /* maps still work, hit tests fall back to distance */ });
    return () => { live = false; };
  }, []);
  return shapes;
}

/**
 * True when the point falls inside that country's borders — or, for a country
 * too small to land a click on, near enough to the marker standing in for it.
 * Without that a question like the Maldives would be unanswerable: 67 km² of
 * atoll is under a pixel on a world map however far you zoom in.
 *
 * The reach is only ever granted to the country being asked for, so it can't
 * cost anyone a round: at worst a click on Malaysia also counts as Singapore,
 * and only while Singapore is the one you're looking for.
 */
export function isInCountry(
  shapes: WorldShapes | null,
  code: string,
  c: Coord,
): boolean {
  const key = code.toLowerCase();
  const feature = shapes?.byCode[key];
  if (!feature) return false;
  if (geoContains(feature as ExtendedFeature, [c.lng, c.lat])) return true;
  const spot = shapes?.smallTargets[key];
  return !!spot && haversineKm(c, spot) <= SMALL_TARGET_KM;
}
