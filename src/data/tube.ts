import { MAX_ROUND_SCORE, type Coord } from "../lib/geo";
import { tubeStationsRaw, tubeConnections as rawConnections, tubeLineDefs } from "./tubeData";
import type { TubeConnectionRaw, TubeLineDef } from "./tubeData";
import { stationFacts } from "./tubeFacts";

export type { TubeConnectionRaw, TubeLineDef } from "./tubeData";

export interface TubeStation extends Coord {
  name: string;
  /** Fare zone (may be fractional, e.g. 2.5 for a boundary station). */
  zone: number;
  /** Underground lines serving this station (short names). */
  lines: string[];
  fact: string;
}

/**
 * Screen colours per line. Pushed further apart than the muted dataset values
 * so each line reads as its own hue at map scale — the raw "Central" was an
 * orange easily confused with Bakerloo brown.
 */
export const lineColors: Record<string, string> = {
  Bakerloo: "#8B4A17", // brown
  Central: "#E1251B", // red
  Circle: "#EFC00C", // yellow
  District: "#00782A", // green
  "Hammersmith & City": "#F589B0", // pink
  Jubilee: "#8C9195", // grey / silver
  Metropolitan: "#9B0056", // magenta / purple
  Northern: "#000000", // black
  Piccadilly: "#0019A8", // dark blue
  Victoria: "#00A0E2", // light blue
  "Waterloo & City": "#1FC3B4", // turquoise / aqua
};

/** All 11 lines, in the palette actually drawn on the map (used by the key). */
export const tubeLines: TubeLineDef[] = tubeLineDefs.map((l) => ({
  ...l,
  color: lineColors[l.name] ?? l.color,
}));

/** Dataset hex -> line name, so connection colours can be re-mapped. */
const lineNameByRawColor: Record<string, string> = Object.fromEntries(
  tubeLineDefs.map((l) => [l.color, l.name]),
);

/** The dataset carries a couple of misspelled duplicates of real stations. */
const stationAliases: Record<string, string> = {
  "Picadilly Circus": "Piccadilly Circus",
};
const canonical = (name: string) => stationAliases[name] ?? name;

/** "Zone 3", or "Zone 2/3" for a boundary station. */
export function zoneLabel(zone: number): string {
  if (Number.isInteger(zone)) return `Zone ${zone}`;
  return `Zone ${Math.floor(zone)}/${Math.ceil(zone)}`;
}

/** Readable list: ["A"] -> "A"; ["A","B"] -> "A and B"; ["A","B","C"] -> "A, B and C". */
function listLines(lines: string[]): string {
  if (lines.length === 1) return `the ${lines[0]} line`;
  const last = lines[lines.length - 1];
  return `the ${lines.slice(0, -1).join(", ")} and ${last} lines`;
}

/** Fallback fact for stations without a hand-written one. */
function autoFact(s: { name: string; zone: number; lines: string[] }): string {
  return `${s.name} is in ${zoneLabel(s.zone)}, served by ${listLines(s.lines)}.`;
}

export const tubeStations: TubeStation[] = tubeStationsRaw
  .filter((s) => !(s.name in stationAliases))
  .map((s) => ({
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    zone: s.zone,
    lines: s.lines,
    fact: stationFacts[s.name] ?? autoFact(s),
  }));

/** Connections re-pointed at canonical stations and recoloured, duplicates dropped. */
export const tubeConnections: TubeConnectionRaw[] = (() => {
  const seen = new Set<string>();
  const out: TubeConnectionRaw[] = [];
  for (const c of rawConnections) {
    const a = canonical(c.a);
    const b = canonical(c.b);
    if (a === b) continue;
    const line = lineNameByRawColor[c.color];
    const color = (line && lineColors[line]) || c.color;
    const key = `${color}|${a < b ? `${a}|${b}` : `${b}|${a}`}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ a, b, color });
  }
  return out;
})();

/** Name -> coordinate lookup, used when drawing the network. */
export const stationCoords: Record<string, Coord> = Object.fromEntries(
  tubeStations.map((s) => [s.name, { lat: s.lat, lng: s.lng }]),
);

/**
 * Interchanges joined on foot rather than by track. The dataset only knows
 * about trains, but the map draws these as one interchange and so does anyone
 * standing in them.
 */
const footLinks: [string, string][] = [["Bank", "Monument"]];

/**
 * Who neighbours whom on the network, ignoring which line you'd ride. Changing
 * lines at a station costs nothing here: what's being counted is stations, not
 * journeys.
 */
const neighbours: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  const known = new Set(tubeStations.map((s) => s.name));
  const link = (a: string, b: string) => {
    const list = map.get(a);
    if (!list) map.set(a, [b]);
    else if (!list.includes(b)) list.push(b);
  };
  for (const c of tubeConnections) {
    if (!known.has(c.a) || !known.has(c.b)) continue;
    link(c.a, c.b);
    link(c.b, c.a);
  }
  for (const [a, b] of footLinks) {
    if (!known.has(a) || !known.has(b)) continue;
    link(a, b);
    link(b, a);
  }
  return map;
})();

/** BFS results from a station, so repeat rounds on the same target are free. */
const stopsFrom = new Map<string, Map<string, number>>();

/** Every station's distance in stops from `origin`. */
function stopDistances(origin: string): Map<string, number> {
  const cached = stopsFrom.get(origin);
  if (cached) return cached;

  const dist = new Map<string, number>([[origin, 0]]);
  let frontier = [origin];
  let depth = 0;
  while (frontier.length) {
    depth += 1;
    const next: string[] = [];
    for (const name of frontier) {
      for (const n of neighbours.get(name) ?? []) {
        if (dist.has(n)) continue;
        dist.set(n, depth);
        next.push(n);
      }
    }
    frontier = next;
  }

  stopsFrom.set(origin, dist);
  return dist;
}

/**
 * How many stops apart two stations are — the fewest you'd ride through to get
 * from one to the other, changing lines freely. Infinity if the network in the
 * dataset doesn't join them up at all.
 */
export function stopsBetween(a: string, b: string): number {
  return stopDistances(a).get(b) ?? Infinity;
}

/**
 * Score a tube guess out of MAX_ROUND_SCORE by stops rather than metres. Two
 * stations a few hundred metres apart can be a long ride from each other, and
 * two a mile apart can be one stop — on a tube map it's the stops you know.
 * The right station is full marks; from there the score halves roughly every
 * three stops, so a near miss still pays and the far side of London doesn't.
 */
export function scoreFromStops(stops: number): number {
  if (!Number.isFinite(stops)) return 0;
  return Math.round(MAX_ROUND_SCORE * Math.exp(-stops / 4));
}

/** "Spot on", "1 stop away", "6 stops away". */
export function formatStops(stops: number): string {
  if (!Number.isFinite(stops)) return "off the network";
  if (stops === 0) return "spot on";
  return `${stops} ${stops === 1 ? "stop" : "stops"} away`;
}

/**
 * The station whose patch of the map a point falls in — the nearest one. A
 * station has no borders to be inside of, so its catchment stands in for the
 * area a player is aiming at.
 */
export function nearestStation(c: Coord): TubeStation {
  let best = tubeStations[0];
  let bestDist = Infinity;
  for (const s of tubeStations) {
    // Plain squared distance is enough to rank candidates this close together.
    const dLat = s.lat - c.lat;
    const dLng = (s.lng - c.lng) * Math.cos((c.lat * Math.PI) / 180);
    const d = dLat * dLat + dLng * dLng;
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}
