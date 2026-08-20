import type { Coord } from "../lib/geo";
import {
  stationCoords,
  tubeConnections,
  tubeLines,
  tubeStations,
  type TubeConnectionRaw,
  type TubeLineDef,
  type TubeStation,
} from "./tube";

/**
 * London borough boundaries, drawn as faint outlines under the network — our
 * own geographic rendering, never TfL's diagram.
 *
 * **Vendored rather than fetched from someone else's repository.** It used to
 * come live from `raw.githubusercontent.com`, which is two problems in one: the
 * repository declares no licence, so nothing granted permission to redistribute
 * it, and raw.githubusercontent is not a CDN and can be throttled or blocked
 * out from under a running game. This file is the Office for National
 * Statistics' own boundary set, published under the Open Government Licence,
 * which asks for an attribution and grants everything else.
 *
 * **Both are here on purpose.** The legacy one is still what the game draws;
 * the vendored one stands beside it on the bench, so the swap gets looked at
 * before it is made rather than after. See `ScrapbookTube`.
 */
export const LEGACY_BOROUGHS_URL =
  "https://raw.githubusercontent.com/clementamiri/London-Borough-TopoJson/master/london-topojson.json";
export const LONDON_BOROUGHS_URL = "/london-boroughs.json";

/**
 * Everything `LondonMap` draws that could come from somewhere else.
 *
 * It exists so the bench can hand the map a second dataset and judge **the
 * real renderer** rather than a copy of it. That is a deliberate departure from
 * the usual rule that a bench duplicates what it is testing: what is on trial
 * here is the data, so the drawing has to be identical by construction — which
 * one shared component gives and a duplicate only promises. The shipped game
 * passes nothing and gets `SHIPPED_TUBE`.
 */
export interface TubeData {
  stations: TubeStation[];
  connections: TubeConnectionRaw[];
  lines: TubeLineDef[];
  coords: Record<string, Coord>;
  /** Where the borough outlines are fetched from. */
  boroughUrl: string;
}

export const SHIPPED_TUBE: TubeData = {
  stations: tubeStations,
  connections: tubeConnections,
  lines: tubeLines,
  coords: stationCoords,
  boroughUrl: LEGACY_BOROUGHS_URL,
};
