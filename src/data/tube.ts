import type { Coord } from "../lib/geo";
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
function zoneLabel(zone: number): string {
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
