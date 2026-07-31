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

      return { features, byCode, smallTargets };
    })
    .catch((err) => {
      // Let a later attempt retry rather than caching the failure forever.
      pending = null;
      throw err;
    });
  return pending;
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
 * True when a point is within reach of some speck of a country. The globe
 * throws away clicks that land in the sea, which would otherwise make the
 * island states unanswerable — every one of them is surrounded by it.
 */
export function nearSmallCountry(shapes: WorldShapes | null, c: Coord): boolean {
  if (!shapes) return false;
  return Object.values(shapes.smallTargets).some(
    (spot) => haversineKm(c, spot) <= SMALL_TARGET_KM,
  );
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
