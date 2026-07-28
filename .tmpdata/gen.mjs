import { readFileSync, writeFileSync } from "node:fs";

// Minimal CSV parser handling quoted fields that contain commas.
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

const dir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const stationsRows = parseCSV(readFileSync(dir + "london.stations.csv", "utf8")).slice(1);
const connRows = parseCSV(readFileSync(dir + "london.connections.csv", "utf8")).slice(1);
const lineRows = parseCSV(readFileSync(dir + "london.lines.csv", "utf8")).slice(1);

// 11 core London Underground lines (exclude 5 East London / now Overground, 13 DLR).
const UNDERGROUND = new Set([1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12]);

const shortName = (n) => n.replace(/\s+Line$/i, "").trim();
const lineById = new Map();
for (const [id, name, colour] of lineRows) {
  const nid = Number(id);
  if (!UNDERGROUND.has(nid)) continue;
  lineById.set(nid, { id: nid, name: shortName(name), color: "#" + colour });
}

const stationById = new Map();
for (const r of stationsRows) {
  const [id, lat, lng, name, , zone] = r;
  stationById.set(Number(id), {
    name, lat: Number(lat), lng: Number(lng), zone: Number(zone),
  });
}

// Keep only connections on the included lines.
const conns = connRows
  .map((r) => ({ s1: Number(r[0]), s2: Number(r[1]), line: Number(r[2]) }))
  .filter((c) => UNDERGROUND.has(c.line));

// Stations referenced by at least one included connection.
const usedIds = new Set();
for (const c of conns) { usedIds.add(c.s1); usedIds.add(c.s2); }

// lines serving each station (by short name)
const linesOf = new Map();
for (const c of conns) {
  const lname = lineById.get(c.line).name;
  for (const sid of [c.s1, c.s2]) {
    if (!linesOf.has(sid)) linesOf.set(sid, new Set());
    linesOf.get(sid).add(lname);
  }
}

const stationsOut = [...usedIds]
  .map((id) => {
    const s = stationById.get(id);
    return {
      name: s.name, lat: s.lat, lng: s.lng, zone: s.zone,
      lines: [...linesOf.get(id)].sort(),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const connsOut = conns
  .map((c) => ({
    a: stationById.get(c.s1).name,
    b: stationById.get(c.s2).name,
    color: lineById.get(c.line).color,
  }));

// Manual patch: Piccadilly Circus is absent from the source dataset entirely.
const BAKERLOO = "#AE6017", PICCADILLY = "#094FA3";
stationsOut.push({
  name: "Piccadilly Circus", lat: 51.5098, lng: -0.1342, zone: 1,
  lines: ["Bakerloo", "Piccadilly"],
});
connsOut.push(
  { a: "Oxford Circus", b: "Piccadilly Circus", color: BAKERLOO },
  { a: "Piccadilly Circus", b: "Charing Cross", color: BAKERLOO },
  { a: "Green Park", b: "Piccadilly Circus", color: PICCADILLY },
  { a: "Piccadilly Circus", b: "Leicester Square", color: PICCADILLY },
);
stationsOut.sort((a, b) => a.name.localeCompare(b.name));

const linesOut = [...lineById.values()].sort((a, b) => a.name.localeCompare(b.name));

const banner = "// AUTO-GENERATED from the open tubemaps dataset (github.com/nicola/tubemaps).\n// 11 core London Underground lines. Do not edit by hand — see .tmpdata/gen.mjs.\n";
const out =
  banner +
  "\nexport interface TubeLineDef { id: number; name: string; color: string; }\n" +
  "export interface TubeStationRaw { name: string; lat: number; lng: number; zone: number; lines: string[]; }\n" +
  "export interface TubeConnectionRaw { a: string; b: string; color: string; }\n\n" +
  "export const tubeLineDefs: TubeLineDef[] = " + JSON.stringify(linesOut, null, 2) + ";\n\n" +
  "export const tubeStationsRaw: TubeStationRaw[] = " + JSON.stringify(stationsOut) + ";\n\n" +
  "export const tubeConnections: TubeConnectionRaw[] = " + JSON.stringify(connsOut) + ";\n";

writeFileSync(dir + "../src/data/tubeData.ts", out);
console.log("lines:", linesOut.length, "stations:", stationsOut.length, "connections:", connsOut.length);
console.log("zones:", [...new Set(stationsOut.map((s) => s.zone))].sort((a, b) => a - b).join(", "));
