import { useEffect, useState } from "react";
import { geoContains, type ExtendedFeature } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Coord } from "./geo";

/**
 * Natural Earth 1:110m country polygons (GeoJSON, via jsDelivr). One shared
 * download backs three things: the flat map's shapes, the globe's borders, and
 * the "did the click land inside the right country?" test.
 */
const WORLD_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

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
      for (const f of features) {
        const code = (f.properties?.ISO_A2_EH || f.properties?.ISO_A2 || "").toLowerCase();
        if (code && code !== "-99") byCode[code] = f;
      }
      return { features, byCode };
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

/** True when the point falls inside that country's borders. */
export function isInCountry(
  shapes: WorldShapes | null,
  code: string,
  c: Coord,
): boolean {
  const feature = shapes?.byCode[code.toLowerCase()];
  if (!feature) return false;
  return geoContains(feature as ExtendedFeature, [c.lng, c.lat]);
}
