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
 * The tube game's own line, borrowed from the announcement every passenger on
 * the network has heard. It stands on the menu card, under the title on the way
 * in, and in place of "Spot on!" when the right station is picked — the same
 * words in all three places, which is what makes it the game's rather than a
 * joke made once.
 */
export const TUBE_TAGLINE = "See it. Say it. Spot it.";

/**
 * The same line, paid out: the one place it earns an exclamation mark, because
 * the menu is naming the game and the reveal is congratulating you. Derived
 * from the tagline rather than written out again, so the words can only be
 * changed in one place and the punctuation is the only thing that differs.
 */
export const TUBE_SPOT_ON = TUBE_TAGLINE.replace(/\.$/, "!");

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

/**
 * What the dataset calls a station, and what it should be called here.
 *
 * The dataset tags stations that shared a name with the initial of their line,
 * which is nobody's name for them — a player asked to find "Shepherd's Bush
 * (H)" is being asked about a station that doesn't exist under that name on any
 * map, sign or ticket. Two of those tags are stale rather than merely ugly: the
 * Hammersmith & City one became Shepherd's Bush Market in 2008, which is
 * exactly the ambiguity the tag was invented to paper over, so the Central line
 * one is now just Shepherd's Bush.
 *
 * Where two entries end up under one name they become one station — see
 * `tubeStations`.
 */
const stationNames: Record<string, string> = {
  // A misspelling that left the dataset holding two Piccadilly Circuses.
  "Picadilly Circus": "Piccadilly Circus",
  "Shepherd's Bush (C)": "Shepherd's Bush",
  "Shepherd's Bush (H)": "Shepherd's Bush Market",
  // Both of these really are called Edgware Road, by TfL and by everyone else.
  // They're separate stations 150 metres apart across the Marylebone Road, and
  // no player asked for "Edgware Road" can be expected to pick which — so the
  // question has one answer and either side of the road is it.
  "Edgware Road (B)": "Edgware Road",
  "Edgware Road (C)": "Edgware Road",
};
const canonical = (name: string) => stationNames[name] ?? name;

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

/**
 * Every station to be found, under the name it's known by — and one entry per
 * name, so two rows that renamed onto the same station become that station.
 *
 * Merged rather than deduplicated: a misspelling is one station written twice
 * and either row will do, but the two Edgware Roads are two real sets of
 * platforms and both belong to the answer. So the point is the midpoint of
 * them, 76 metres from either, and the lines are the lines of both. Which
 * makes a click on either side of the road the right click, which is the whole
 * of what a player asked to find "Edgware Road" can fairly be held to.
 */
export const tubeStations: TubeStation[] = (() => {
  interface Merge {
    lat: number;
    lng: number;
    zone: number;
    lines: string[];
    /** How many dataset rows have been folded in, for the average. */
    parts: number;
  }
  const byName = new Map<string, Merge>();

  for (const s of tubeStationsRaw) {
    const name = canonical(s.name);
    const found = byName.get(name);
    if (!found) {
      byName.set(name, {
        lat: s.lat,
        lng: s.lng,
        zone: s.zone,
        lines: [...s.lines],
        parts: 1,
      });
      continue;
    }
    found.lat += s.lat;
    found.lng += s.lng;
    found.parts += 1;
    // The zone of the first row stands: the pairs here agree on it, and a
    // station can only be in one.
    for (const line of s.lines) if (!found.lines.includes(line)) found.lines.push(line);
  }

  return [...byName].map(([name, m]) => {
    const station = {
      name,
      lat: m.lat / m.parts,
      lng: m.lng / m.parts,
      zone: m.zone,
      lines: m.lines,
    };
    return { ...station, fact: stationFacts[name] ?? autoFact(station) };
  });
})();

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
 * How wide the "you knew where that was" shoulder is, in stops. Six puts the
 * halfway mark at five stops and near enough nothing at twelve.
 */
const STOPS_SCALE = 6;

/**
 * Score a tube guess out of MAX_ROUND_SCORE by stops rather than metres. Two
 * stations a few hundred metres apart can be a long ride from each other, and
 * two a mile apart can be one stop — on a tube map it's the stops you know.
 *
 * Squared in the exponent, which is the whole shape of it: the curve leaves
 * full marks slowly and then falls off a cliff, rather than dropping hardest
 * at the very first stop the way a plain decay does.
 *
 * That's what the network is actually like. Two stations picked at random are
 * fourteen stops apart on average and thirteen at the median; only one pair in
 * fifty is within two stops, and one in fourteen within four. So landing three
 * stops out isn't a near miss, it's the top few per cent of the answers
 * available — and when somebody clicks the station next door, four times in
 * five that is exactly one stop. Charging twenty-two points for it, as a plain
 * decay did, was billing a right answer at the rate of a wrong one.
 *
 * The far end is unchanged in spirit: by the distance between two stations
 * picked at random, this is worth a point.
 */
export function scoreFromStops(stops: number): number {
  if (!Number.isFinite(stops)) return 0;
  const out = stops / STOPS_SCALE;
  return Math.round(MAX_ROUND_SCORE * Math.exp(-out * out));
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
