/**
 * Rebuild the tube dataset from Transport for London's own open data.
 *
 * Why this exists: `src/data/tubeData.ts` was generated from a third-party
 * GitHub dataset that declares **no licence**, which grants no permission to
 * redistribute it — and in the UK, database right sits on top of copyright for
 * a compilation like this. The data originates with TfL, whose open data
 * licence is free and asks only for the credit line already printed on
 * `/credits`. So the fix is to go to the source rather than to the copy.
 *
 * It also happens to be better data. The old set predates the Northern line
 * extension, is missing Wood Lane outright, and carries two spelling mistakes
 * that reached the screen.
 *
 * Run: node tools/gen-tube-tfl.mjs > src/data/tubeDataTfl.ts
 * No key is needed for this volume; TfL ask for one only at scale.
 */
import { writeFileSync } from "node:fs";

const LINES = {
  bakerloo: "Bakerloo", central: "Central", circle: "Circle", district: "District",
  "hammersmith-city": "Hammersmith & City", jubilee: "Jubilee",
  metropolitan: "Metropolitan", northern: "Northern", piccadilly: "Piccadilly",
  victoria: "Victoria", "waterloo-city": "Waterloo & City",
};

/**
 * TfL's official line colours, from their published design standard. Quoted
 * here because the API doesn't serve them — eleven hex values, and the reason
 * they are worth having is that the old set only approximated them: its
 * Central line was an orange (#F15B2E) where the real one is a red (#E32017).
 */
const COLOURS = {
  bakerloo: "#B36305", central: "#E32017", circle: "#FFD300", district: "#00782A",
  "hammersmith-city": "#F3A9BB", jubilee: "#A0A5A9", metropolitan: "#9B0056",
  northern: "#000000", piccadilly: "#003688", victoria: "#0098D4",
  "waterloo-city": "#95CDBA",
};

/**
 * TfL names stations operationally: where two physically separate stations
 * share a name, both are listed. That is right for a journey planner and wrong
 * for a guessing game, where two right answers to "Hammersmith" is a question
 * with no answer. So a few are merged, and a few are renamed to what the
 * station is actually called — keeping the game's existing convention, which
 * already merged Paddington and Hammersmith and split Edgware Road.
 */
const RENAME = {
  "Battersea Power": "Battersea Power Station",
  // Two stations 150 metres apart across the Marylebone Road, both really
  // called Edgware Road. The game already merges them and says why: nobody
  // asked for "Edgware Road" can be expected to pick which, so the question
  // has one answer and either side of the road is it. Same for Hammersmith
  // and Paddington, which TfL lists twice for operational reasons.
  "Edgware Road (Bakerloo)": "Edgware Road",
  "Edgware Road (Circle Line)": "Edgware Road",
  "Paddington (H&C Line)-Underground": "Paddington",
  "Hammersmith (Dist&Picc Line)": "Hammersmith",
  "Hammersmith (H&C Line)": "Hammersmith",
  // The Central line one is the one everybody means by "Shepherd's Bush"; the
  // H&C one is genuinely called Shepherd's Bush Market, which is the name the
  // game already uses for it.
  "Shepherd's Bush (Central)": "Shepherd's Bush",
};

/** Stations TfL leaves without a zone. Both are on a boundary. */
const ZONE_FALLBACK = { "Bromley-by-Bow": 2.5, "Canning Town": 2.5 };

const clean = (n) => n.replace(/\s+Underground Station$/i, "").replace(/\s+Station$/i, "").trim();
const nameOf = (raw) => RENAME[clean(raw)] ?? clean(raw);

const raw = {};
for (const id of Object.keys(LINES)) {
  raw[id] = [];
  for (const dir of ["outbound", "inbound"]) {
    const r = await fetch(
      `https://api.tfl.gov.uk/Line/${id}/Route/Sequence/${dir}?serviceTypes=Regular`,
    );
    if (!r.ok) throw new Error(`${id} ${dir}: ${r.status}`);
    raw[id].push(await r.json());
  }
  process.stderr.write(`fetched ${id}\n`);
}

const stations = new Map();
const edges = new Set();

for (const [lineId, docs] of Object.entries(raw)) {
  for (const doc of docs) {
    for (const seq of doc.stopPointSequences ?? []) {
      const pts = seq.stopPoint ?? [];
      for (const p of pts) {
        const name = nameOf(p.name);
        if (!stations.has(name)) {
          stations.set(name, { name, lats: [], lngs: [], zones: new Set(), lines: new Set() });
        }
        const s = stations.get(name);
        // A merged station is the mean of the buildings that make it up, which
        // for Hammersmith is the street between the two of them.
        s.lats.push(p.lat);
        s.lngs.push(p.lon);
        if (p.zone) for (const z of String(p.zone).split("+")) s.zones.add(z.trim());
        s.lines.add(LINES[lineId]);
      }
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = nameOf(pts[i].name);
        const b = nameOf(pts[i + 1].name);
        // A merge can make a connection join a station to itself.
        if (a === b) continue;
        edges.add([a, b].sort().join("\u0000") + "\u0001" + COLOURS[lineId]);
      }
    }
  }
}

/** A station billed for two zones keeps the boundary as a half — 2/3 is 2.5. */
const zoneOf = (s) => {
  if (ZONE_FALLBACK[s.name] !== undefined && !s.zones.size) return ZONE_FALLBACK[s.name];
  const nums = [...s.zones].map(Number).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (!nums.length) return ZONE_FALLBACK[s.name] ?? 1;
  return nums.length === 1 ? nums[0] : (nums[0] + nums[nums.length - 1]) / 2;
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round4 = (n) => Math.round(n * 1e4) / 1e4;

const outStations = [...stations.values()]
  .map((s) => ({
    name: s.name,
    lat: round4(mean(s.lats)),
    lng: round4(mean(s.lngs)),
    zone: zoneOf(s),
    lines: [...s.lines].sort(),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const outConnections = [...edges]
  .map((k) => {
    const [pair, color] = k.split("\u0001");
    const [a, b] = pair.split("\u0000");
    return { a, b, color };
  })
  .sort((x, y) => (x.a + x.b + x.color).localeCompare(y.a + y.b + y.color));

const outLines = Object.keys(LINES).map((id, i) => ({
  id: i + 1,
  name: LINES[id],
  color: COLOURS[id],
}));

const body = `// AUTO-GENERATED from Transport for London's open data — see
// tools/gen-tube-tfl.mjs, which is the only thing that should write this file.
// Data provided by Transport for London. Do not edit by hand.
import type { TubeConnectionRaw, TubeLineDef, TubeStationRaw } from "./tubeData";

export const tflLineDefs: TubeLineDef[] = ${JSON.stringify(outLines, null, 2)};

export const tflStationsRaw: TubeStationRaw[] = ${JSON.stringify(outStations, null, 2)};

export const tflConnections: TubeConnectionRaw[] = ${JSON.stringify(outConnections, null, 2)};
`;

writeFileSync(new URL("../src/data/tubeDataTfl.ts", import.meta.url), body);
process.stderr.write(`stations ${outStations.length}, connections ${outConnections.length}\n`);
