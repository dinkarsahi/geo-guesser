/**
 * Build the New York subway dataset from the MTA's own open data.
 *
 * Written the way the tube generator is written, and for the reason it exists:
 * go to the authority that publishes the thing rather than to somebody's copy
 * of it.
 *
 * Two sources, because neither has everything:
 *
 * - **The Subway Stations dataset** on New York State's open data portal, for
 *   the names, the boroughs, the routes and — the part that matters —
 *   `complex_id`, the MTA's own answer to "which of these platforms are one
 *   station". Times Sq-42 St is several rows and one place to point at.
 * - **The GTFS static feed**, for what actually joins what. Every trip in it
 *   is an ordered list of stops, so consecutive pairs are the network. It also
 *   carries `route_color`, so the map is drawn in the MTA's own colours rather
 *   than in a palette copied off a picture.
 *
 * **The obvious shortcut does not work and this is the record of it.** MTA
 * stop ids run in order along each physical line — R01, R03, R04 down the
 * Astoria line — so building edges by sorting each line's stops looks right
 * and is right *within* a line. It leaves the lines unjoined: 81 stations came
 * out unreachable, whole branches of Brooklyn and Queens floating free,
 * because a line that continues into another is two `line` values with two
 * separate id blocks. "How many stops away" is a walk over this graph, so an
 * unreachable station is a round with no answer. The connectivity check at the
 * bottom is what caught it and is why it stays.
 *
 * Run: node tools/gen-subway-mta.mjs — it writes src/data/subwayData.ts.
 *
 * Staten Island is left out. Its railway is part of the MTA and no part of the
 * subway graph — not one track joins it.
 */
import { writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const STATIONS = "https://data.ny.gov/resource/39hk-dx4f.json?$limit=1000";
const GTFS = "https://rrgtfsfeeds.s3.amazonaws.com/gtfs_subway.zip";

const BOROUGHS = { M: "Manhattan", Bk: "Brooklyn", Q: "Queens", Bx: "The Bronx" };

/**
 * Pull named files out of a zip without a dependency.
 *
 * A zip ends with a central directory listing every entry and where its data
 * starts. Node can inflate a raw deflate stream, which is all the compression
 * a GTFS feed uses, so forty lines here saves adding a package to the tree
 * for one build script.
 */
function unzip(buffer, wanted) {
  const end = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (end < 0) throw new Error("not a zip");
  const count = buffer.readUInt16LE(end + 10);
  let at = buffer.readUInt32LE(end + 16);
  const out = new Map();
  for (let i = 0; i < count; i++) {
    const nameLen = buffer.readUInt16LE(at + 28);
    const extraLen = buffer.readUInt16LE(at + 30);
    const commentLen = buffer.readUInt16LE(at + 32);
    const name = buffer.toString("utf8", at + 46, at + 46 + nameLen);
    const method = buffer.readUInt16LE(at + 10);
    const size = buffer.readUInt32LE(at + 20);
    const localAt = buffer.readUInt32LE(at + 42);
    if (wanted.includes(name)) {
      // The local header repeats the name and extra fields at its own lengths.
      const lName = buffer.readUInt16LE(localAt + 26);
      const lExtra = buffer.readUInt16LE(localAt + 28);
      const from = localAt + 30 + lName + lExtra;
      const raw = buffer.subarray(from, from + size);
      out.set(name, method === 0 ? raw : inflateRawSync(raw));
    }
    at += 46 + nameLen + extraLen + commentLen;
  }
  for (const name of wanted) if (!out.has(name)) throw new Error(`${name} missing from feed`);
  return out;
}

/** CSV with quoted fields — GTFS route descriptions are full of commas. */
function rows(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length);
  const header = split(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}
function split(line) {
  const out = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { out.push(cell); cell = ""; }
    else cell += ch;
  }
  out.push(cell);
  return out;
}

// --- the places a player can point at ---------------------------------------
const platforms = (await fetch(STATIONS).then((r) => {
  if (!r.ok) throw new Error(`stations: ${r.status}`);
  return r.json();
})).filter((p) => p.borough !== "SI");
process.stderr.write(`${platforms.length} platform rows off the portal\n`);

const routeOrder = (r) => "1234567ABCDEFGJLMNQRSWZ".indexOf(r);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round4 = (n) => Math.round(n * 1e4) / 1e4;

const complexes = new Map();
for (const p of platforms) {
  let c = complexes.get(p.complex_id);
  if (!c) {
    c = { id: p.complex_id, names: new Map(), lats: [], lngs: [], routes: new Set(), borough: p.borough };
    complexes.set(p.complex_id, c);
  }
  c.names.set(p.stop_name, (c.names.get(p.stop_name) ?? 0) + 1);
  c.lats.push(Number(p.gtfs_latitude));
  c.lngs.push(Number(p.gtfs_longitude));
  for (const r of (p.daytime_routes ?? "").split(/\s+/).filter(Boolean)) c.routes.add(r);
}
for (const c of complexes.values()) {
  c.name = [...c.names].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  c.lat = round4(mean(c.lats));
  c.lng = round4(mean(c.lngs));
  c.routeList = [...c.routes].sort((a, b) => routeOrder(a) - routeOrder(b));
}

/**
 * London has no two stations called the same thing. New York has four called
 * 86 St, in four different neighbourhoods — merging them would be a lie and
 * leaving them bare is a question with several unmarked answers, so a repeated
 * name takes its routes, which is how New Yorkers tell them apart anyway.
 */
const nameCount = new Map();
for (const c of complexes.values()) nameCount.set(c.name, (nameCount.get(c.name) ?? 0) + 1);
for (const c of complexes.values()) {
  c.label = nameCount.get(c.name) > 1 ? `${c.name} (${c.routeList.join("·")})` : c.name;
}
const takenLabels = new Set();
for (const c of [...complexes.values()].sort((a, b) => Number(a.id) - Number(b.id))) {
  if (!takenLabels.has(c.label)) {
    takenLabels.add(c.label);
    continue;
  }
  // Same name and the same routes: the borough is what is left to tell them by.
  c.label = `${c.label}, ${BOROUGHS[c.borough] ?? c.borough}`;
  takenLabels.add(c.label);
}

// --- what actually joins what -----------------------------------------------
process.stderr.write("fetching the GTFS feed…\n");
const zip = Buffer.from(
  await fetch(GTFS).then((r) => {
    if (!r.ok) throw new Error(`gtfs: ${r.status}`);
    return r.arrayBuffer();
  }),
);
const files = unzip(zip, ["trips.txt", "stop_times.txt", "routes.txt"]);

const routeColour = new Map(
  rows(files.get("routes.txt").toString("utf8")).map((r) => [
    r.route_id,
    `#${(r.route_color || "808183").toUpperCase()}`,
  ]),
);
const routeName = new Map(
  rows(files.get("routes.txt").toString("utf8")).map((r) => [r.route_id, r.route_long_name]),
);
const tripRoute = new Map(
  rows(files.get("trips.txt").toString("utf8")).map((t) => [t.trip_id, t.route_id]),
);

// A platform's GTFS id is the complex's id with a direction letter on the end.
const complexOfStop = new Map(platforms.map((p) => [p.gtfs_stop_id, p.complex_id]));
const parentOf = (stopId) => complexOfStop.get(stopId.replace(/[NS]$/, ""));

const edges = new Map();
{
  // 35 MB of stop times, walked once. Consecutive stops on a trip are the
  // network, which is the only definition of "next stop" that survives
  // branches, express tracks and lines running into one another.
  const text = files.get("stop_times.txt").toString("utf8");
  let lastTrip = null;
  let lastComplex = null;
  let lastSeq = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("trip_id")) continue;
    const [trip, stop, , , seqText] = split(line);
    const seq = Number(seqText);
    const complex = parentOf(stop);
    if (trip !== lastTrip) {
      lastTrip = trip;
      lastComplex = complex;
      lastSeq = seq;
      continue;
    }
    if (complex && lastComplex && complex !== lastComplex && seq === lastSeq + 1) {
      const colour = routeColour.get(tripRoute.get(trip)) ?? "#808183";
      const key = [lastComplex, complex].sort().join("|") + "|" + colour;
      if (!edges.has(key)) edges.set(key, { a: lastComplex, b: complex, color: colour });
    }
    lastComplex = complex;
    lastSeq = seq;
  }
}

// --- is it one network? -----------------------------------------------------
const adjacency = new Map();
for (const { a, b } of edges.values()) {
  if (!adjacency.has(a)) adjacency.set(a, []);
  if (!adjacency.has(b)) adjacency.set(b, []);
  adjacency.get(a).push(b);
  adjacency.get(b).push(a);
}
const first = [...complexes.keys()][0];
const reached = new Set([first]);
const queue = [first];
while (queue.length) {
  for (const next of adjacency.get(queue.shift()) ?? []) {
    if (!reached.has(next)) {
      reached.add(next);
      queue.push(next);
    }
  }
}
const stranded = [...complexes.values()].filter((c) => !reached.has(c.id));
if (stranded.length) {
  throw new Error(
    `${stranded.length} stations unreachable, so "stops away" has no answer for them: ` +
      stranded.map((c) => c.label).join(", "),
  );
}

// --- out --------------------------------------------------------------------
const label = new Map([...complexes.values()].map((c) => [c.id, c.label]));

const outStations = [...complexes.values()]
  .map((c) => ({
    name: c.label,
    lat: c.lat,
    lng: c.lng,
    borough: BOROUGHS[c.borough] ?? c.borough,
    routes: c.routeList,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const outConnections = [...edges.values()]
  .map((e) => ({ a: label.get(e.a), b: label.get(e.b), color: e.color }))
  .filter((e) => e.a && e.b)
  .sort((x, y) => (x.a + x.b + x.color).localeCompare(y.a + y.b + y.color));

// The colours the map actually draws, each named by the services on it — New
// York colours by trunk rather than by service, so one colour is several
// letters and a key listing routes would have twenty-three rows.
const trunkNames = new Map();
for (const [id, colour] of routeColour) {
  const list = trunkNames.get(colour) ?? [];
  list.push(id);
  trunkNames.set(colour, list);
}
const outTrunks = [...trunkNames]
  .filter(([colour]) => outConnections.some((c) => c.color === colour))
  .map(([colour, ids], i) => ({
    id: i + 1,
    name: ids.sort((a, b) => routeOrder(a) - routeOrder(b)).join("·"),
    color: colour,
    long: routeName.get(ids[0]) ?? "",
  }));

writeFileSync(
  new URL("../src/data/subwayData.ts", import.meta.url),
  `// AUTO-GENERATED from the MTA's open data — see tools/gen-subway-mta.mjs,
// which is the only thing that should write this file. Do not edit by hand.
//
// Data from the Metropolitan Transportation Authority: the Subway Stations
// dataset on data.ny.gov for the places, and the GTFS static feed for what
// joins them and for the colours they are drawn in.

export interface SubwayTrunk { id: number; name: string; color: string; long: string; }
export interface SubwayStationRaw {
  name: string;
  lat: number;
  lng: number;
  borough: string;
  routes: string[];
}
export interface SubwayConnectionRaw { a: string; b: string; color: string; }

export const subwayTrunks: SubwayTrunk[] = ${JSON.stringify(outTrunks, null, 2)};

export const subwayStationsRaw: SubwayStationRaw[] = ${JSON.stringify(outStations, null, 2)};

export const subwayConnections: SubwayConnectionRaw[] = ${JSON.stringify(outConnections, null, 2)};
`,
);

process.stderr.write(
  `stations ${outStations.length}, connections ${outConnections.length}, colours ${outTrunks.length} — all reachable\n`,
);
