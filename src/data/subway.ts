import type { Coord } from "../lib/geo";
import {
  subwayConnections as rawConnections,
  subwayStationsRaw,
  subwayTrunks,
} from "./subwayData";
import type { SubwayConnectionRaw, SubwayTrunk } from "./subwayData";

export type { SubwayConnectionRaw, SubwayTrunk } from "./subwayData";

/**
 * The New York subway, arranged the way `tube.ts` arranges London.
 *
 * Deliberately the same shape — the same station type, the same graph walk,
 * the same nearest-station lookup — because `NewYorkMap` is a copy of
 * `LondonMap` and a copy that has to be fed differently is a copy that drifts.
 * What differs is what the two networks actually are:
 *
 * - **No fare zones.** New York has a flat fare, so there is no zone to score
 *   by, none to shade the map in and none to print in a reveal. `zone` is here
 *   because the copied map reads it; it is 1 for every station and means
 *   nothing.
 * - **No Mind the Gap.** London's circle is sized off the zone, so it has
 *   nothing to be sized from here. This game is marked on the ride alone.
 * - **Colours by trunk, not by service.** Every train up Eighth Avenue is
 *   blue whatever letter it carries, so ten colours cover twenty-three
 *   services. That is why a station carries `routes` — the letters are how a
 *   New Yorker names a station, and the colour cannot do it for them.
 */
export interface SubwayStation extends Coord {
  name: string;
  /** Which borough it is in — the closest thing here to London's zone. */
  borough: string;
  /** The services calling there, e.g. ["4", "5", "6"]. */
  routes: string[];
  /** Always 1. Only the copied map reads it — see above. */
  zone: number;
  /**
   * The trunk colours this station sits on, named as the key names them.
   *
   * Here so the copied map works verbatim: London's stations carry line names
   * and the map colours a dot by matching them against `tubeLines`. New York's
   * carry route letters, and the colour belongs to the trunk rather than the
   * letter — so this is the translation, done once in the data rather than by
   * teaching the map a second way to look a colour up.
   */
  lines: string[];
  fact: string;
}

/** Readable list: ["A"] -> "A"; ["A","B"] -> "A and B". */
function listRoutes(routes: string[]): string {
  if (routes.length === 1) return `the ${routes[0]} train`;
  const last = routes[routes.length - 1];
  return `the ${routes.slice(0, -1).join(", ")} and ${last} trains`;
}

/**
 * A station's fact, generated rather than written.
 *
 * London's are hand-written for the fifty best-known stations and generated
 * for the rest. Four hundred and twenty-four of these would be a book, so they
 * are all generated for now — the borough and the services, which between them
 * are how anybody actually describes a station here.
 */
function factFor(s: { name: string; borough: string; routes: string[] }): string {
  return `${s.name} is in ${s.borough}, served by ${listRoutes(s.routes)}.`;
}

export const subwayStations: SubwayStation[] = subwayStationsRaw.map((s) => ({
  name: s.name,
  lat: s.lat,
  lng: s.lng,
  borough: s.borough,
  routes: s.routes,
  zone: 1,
  lines: subwayTrunks
    .filter((t) => t.name.split("·").some((r) => s.routes.includes(r)))
    .map((t) => t.name),
  fact: factFor(s),
}));

export const subwayConnections: SubwayConnectionRaw[] = rawConnections;

/** The colours the map draws, for the key under it. */
export const subwayLines: SubwayTrunk[] = subwayTrunks;

/** Name -> coordinate, used when drawing the network. */
export const subwayCoords: Record<string, Coord> = Object.fromEntries(
  subwayStations.map((s) => [s.name, { lat: s.lat, lng: s.lng }]),
);

/**
 * The borough outlines drawn faintly under the network.
 *
 * New York City's own boundary file, thinned to about sixty metres of detail —
 * far finer than a faint stroke can show — and **vendored** rather than
 * fetched from somebody's server, which is the lesson the tube map's outlines
 * taught the hard way.
 */
export const BOROUGHS_URL = "/nyc-boroughs.json";

/** Adjacency, built once: name -> the stations one stop away. */
const neighbours = (() => {
  const map = new Map<string, Set<string>>();
  for (const c of subwayConnections) {
    if (!map.has(c.a)) map.set(c.a, new Set());
    if (!map.has(c.b)) map.set(c.b, new Set());
    map.get(c.a)!.add(c.b);
    map.get(c.b)!.add(c.a);
  }
  return map;
})();

/**
 * How many stops apart two stations are, counted over the network rather than
 * measured across the ground — the same breadth-first walk the tube uses, and
 * the same reason: a river or a park can put two stations a few hundred metres
 * and forty minutes apart.
 *
 * The generator refuses to write a file with an unreachable station in it, so
 * this cannot be asked a question with no answer.
 */
export function stopsBetween(a: string, b: string): number {
  if (a === b) return 0;
  const seen = new Set([a]);
  let edge = [a];
  let stops = 0;
  while (edge.length) {
    stops += 1;
    const next: string[] = [];
    for (const here of edge) {
      for (const there of neighbours.get(here) ?? []) {
        if (seen.has(there)) continue;
        if (there === b) return stops;
        seen.add(there);
        next.push(there);
      }
    }
    edge = next;
  }
  return Infinity;
}

/** The station whose patch of the map a click landed in. */
export function nearestStation(c: Coord): SubwayStation {
  let best = subwayStations[0];
  let bestD = Infinity;
  for (const s of subwayStations) {
    // Squared degrees is enough to rank candidates a few hundred metres apart,
    // and this runs on every mouse move.
    const d = (s.lat - c.lat) ** 2 + (s.lng - c.lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

/** "4 stops away", and the two ends of the scale in words. */
export function formatStops(stops: number): string {
  if (stops === 0) return "the right station";
  return `${stops} stop${stops === 1 ? "" : "s"} away`;
}
