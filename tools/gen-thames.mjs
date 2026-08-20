/**
 * Trace the Thames out of the borough boundaries, rather than drawing it by
 * hand.
 *
 * The tube map's river was 29 points typed from memory, and the comment above
 * them said so: "rough course of the River Thames". Measured against the real
 * thing it is 154 m out at the median and 523 m at worst — which nobody would
 * notice, except that the map *also* draws the borough outlines, and London's
 * borough boundaries run down the middle of the Thames. So the map drew the
 * river twice, in two different places, about half a kilometre apart. That is
 * the kind of disagreement a player finds and cannot unsee.
 *
 * **Where the real line comes from.** The boundary file the map already uses is
 * the ONS "generalised, clipped" edition, which stops at the riverbank — so
 * north-bank and south-bank boroughs share almost no vertices and the river is
 * a gap rather than a line. The **full extent** edition of the same dataset
 * carries the boroughs out to the middle of the water, where they meet: Tower
 * Hamlets and Southwark share 742 vertices along it. Those shared vertices
 * *are* the Thames, at the ONS's own precision, under the same Open Government
 * Licence as everything else here.
 *
 * Run: node tools/gen-thames.mjs — it writes src/data/thames.ts.
 */
import { writeFileSync } from "node:fs";

const SERVICE =
  "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services" +
  "/Local_Authority_Districts_December_2023_Boundaries_UK_BFE/FeatureServer/0/query" +
  "?where=LAD23CD%20LIKE%20'E09%25'&outFields=LAD23NM&outSR=4326&f=geojson&resultRecordCount=40";

/**
 * Which bank each borough is on, west to east.
 *
 * Richmond upon Thames is on both, which is why this is a pair of lists rather
 * than a test: a borough that straddles the river shares vertices with itself
 * and would trace nothing.
 */
const NORTH = [
  "Hounslow", "Hammersmith and Fulham", "Kensington and Chelsea", "Westminster",
  "City of London", "Tower Hamlets", "Newham", "Barking and Dagenham", "Havering",
];
const SOUTH = [
  "Richmond upon Thames", "Wandsworth", "Lambeth", "Southwark", "Lewisham",
  "Greenwich", "Bexley",
];

const key = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;

const geo = await fetch(SERVICE).then((r) => {
  if (!r.ok) throw new Error(`boundaries: ${r.status}`);
  return r.json();
});

/** Every ring of a feature, each an ordered list of points. */
function ringsOf(feature) {
  const g = feature.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return polys.flat();
}

const byName = new Map(geo.features.map((f) => [f.properties.LAD23NM, f]));
for (const name of [...NORTH, ...SOUTH]) {
  if (!byName.has(name)) throw new Error(`no borough called ${name} in the file`);
}

const southPoints = new Set();
for (const name of SOUTH) {
  for (const ring of ringsOf(byName.get(name))) for (const p of ring) southPoints.add(key(p));
}

/**
 * Walk each north-bank borough's rings and keep the stretches that the south
 * bank also has. A ring is a loop, so a run can straddle its start — hence the
 * doubling before scanning.
 */
const runs = [];
for (const name of NORTH) {
  for (const ring of ringsOf(byName.get(name))) {
    const shared = ring.map((p) => southPoints.has(key(p)));
    if (!shared.some(Boolean)) continue;
    const n = ring.length;
    let run = [];
    for (let i = 0; i < n * 2; i++) {
      const at = i % n;
      if (shared[at]) {
        run.push(ring[at]);
      } else if (run.length) {
        if (run.length > 3) runs.push(run);
        run = [];
        if (i >= n) break;
      }
    }
    if (run.length > 3) runs.push(run);
  }
}
process.stderr.write(`${runs.length} shared stretches\n`);

/**
 * Chain the stretches end to end, nearest first.
 *
 * Sorting them west to east and concatenating is the obvious thing and it does
 * not work: the Thames loops north and south round the Isle of Dogs and the
 * Greenwich peninsula, so two stretches that are neighbours in longitude can be
 * miles apart on the water. Done that way the line jumped 12 km in one place —
 * a straight bar drawn across London. Chaining by whichever loose end is
 * actually nearest follows the river instead of the compass.
 */
const km = (a, b) =>
  Math.hypot((a[0] - b[0]) * Math.cos((51.5 * Math.PI) / 180) * 111.32, (a[1] - b[1]) * 110.57);

const left = runs.filter((r) => r.length > 8);

/**
 * Chain into as many pieces as it takes, rather than insisting on one line.
 *
 * Requiring a single unbroken river looked right and quietly lost most of it:
 * the chain ran out of near neighbours around Richmond, stopped, and wrote out
 * west London only — 503 points covering a fifth of the river. The stretches
 * genuinely do not all touch, because the boroughs meet mid-river in most
 * places and not in all of them. So the honest output is several polylines
 * with real gaps between them, not one line with invented bars across them.
 */
const pieces = [];
while (left.length) {
  let seed = left.reduce((best, r) =>
    Math.min(r[0][0], r[r.length - 1][0]) < Math.min(best[0][0], best[best.length - 1][0]) ? r : best,
  );
  left.splice(left.indexOf(seed), 1);
  if (seed[0][0] > seed[seed.length - 1][0]) seed = [...seed].reverse();
  const piece = [...seed];

  for (;;) {
    const tip = piece[piece.length - 1];
    let bestRun = null;
    let bestFlip = false;
    let bestGap = Infinity;
    for (const r of left) {
      const head = km(tip, r[0]);
      const tail = km(tip, r[r.length - 1]);
      if (head < bestGap) { bestGap = head; bestRun = r; bestFlip = false; }
      if (tail < bestGap) { bestGap = tail; bestRun = r; bestFlip = true; }
    }
    // Further than this and it is the next piece of river, not the next bend.
    if (!bestRun || bestGap > 1.5) break;
    left.splice(left.indexOf(bestRun), 1);
    for (const q of bestFlip ? [...bestRun].reverse() : bestRun) {
      const last = piece[piece.length - 1];
      if (last && km(last, q) < 0.001) continue;
      piece.push(q);
    }
  }
  pieces.push(piece);
}
pieces.sort((a, b) => a[0][0] - b[0][0]);

/**
 * Thinned to about sixty metres, which is finer than a five-pixel ribbon can
 * show at any zoom this map offers.
 */
const MIN = 0.0008;
const round = (n) => Math.round(n * 1e5) / 1e5;
const thin = (piece) => {
  const out = [piece[0]];
  for (const q of piece.slice(1, -1)) {
    const last = out[out.length - 1];
    if (Math.abs(q[0] - last[0]) > MIN || Math.abs(q[1] - last[1]) > MIN) out.push(q);
  }
  out.push(piece[piece.length - 1]);
  return out;
};
// A stray two-point fragment is a boundary artefact rather than a river.
const kept = pieces.map(thin).filter((piece) => piece.length > 4);
const body = kept
  .map(
    (piece) =>
      "  [\n" + piece.map((q) => `    [${round(q[0])}, ${round(q[1])}]`).join(",\n") + ",\n  ]",
  )
  .join(",\n");

writeFileSync(
  new URL("../src/data/thames.ts", import.meta.url),
  `// AUTO-GENERATED by tools/gen-thames.mjs. Do not edit by hand.
//
// The course of the Thames through London, traced from where the north-bank
// and south-bank boroughs meet in the middle of it — the Office for National
// Statistics' own boundaries, full-extent edition, under the Open Government
// Licence. Contains OS data (c) Crown copyright and database right.
//
// It replaced 29 points drawn from memory, which sat about 150 m off the real
// river at the median and 520 m at worst — visible, because the map draws the
// borough outlines too and they follow the true course.

/**
 * The river in pieces, each west to east.
 *
 * Several rather than one because the boroughs meet mid-river in most places
 * and not quite all of them, and a single line would have to invent the joins.
 */
export const THAMES: [number, number][][] = [
${body},
];
`,
);

process.stderr.write(
  `${pieces.length} pieces, ${kept.length} kept, ${kept.reduce((n, piece) => n + piece.length, 0)} points\n`,
);
