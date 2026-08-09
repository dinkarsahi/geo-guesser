// Cuts the countries that keep more than one clock into their time-zone pieces.
//
// Australia is one shape on the map and three clocks on the ground, and a game
// about clocks shouldn't light up Queensland for a question Perth answers. So
// every country the clock table lists twice is cut here, once, into the parts
// that keep each clock — outer edge from the country polygon the game already
// draws, inner edges from the zone boundaries.
//
// Inputs:
//   combined.json — every IANA zone as its own polygon, from
//     github.com/evansiroky/timezone-boundary-builder/releases ->
//     timezones.geojson.zip. The unmerged build on purpose: its "now" and
//     "1970" builds hand you regions labelled with one member zone's name, and
//     at least one of those groupings disagrees with what ICU says the member
//     keeps. A file where every polygon is exactly one zone can't drift from
//     the clock, because the clock is worked out from the name.
//   ne_50m_admin_0_countries — fetched and cached beside this script. The same
//     polygons the game draws, so a piece's border is the border on screen.
//
// Run:  npm i polygon-clipping && node gen-zones.mjs combined.json
// Out:  public/zone-pieces.json

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import clip from "polygon-clipping";

const NE_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson";
const NE_FILE = new URL("ne_50m.geojson", import.meta.url);

/** How far off the true line a dropped point may sit, in degrees. */
const TOLERANCE = 0.02;
/** Islands this small are clipping noise, not places. Square degrees. */
const MIN_AREA = 0.01;
/**
 * A whole piece this small is a border the two datasets drew differently, not
 * a second clock. Scaled down for countries that are small outright: every
 * piece Kiribati has is a speck, and they're still its clocks.
 */
const MIN_PIECE = 0.02;
const PIECE_SHARE = 30;
/**
 * The other half of telling a place from a mismatched border: how round it is,
 * 4πA/P², where a circle is 1. Crimea is drawn on Kyiv's clock by this data,
 * and what's left over when Ukraine is cut against Simferopol is a hairline
 * down the Russian frontier — as big as the Chatham Islands and a hundredth as
 * compact. Waived once a piece is large enough to be a region whatever shape
 * it is, which is what saves the Chilean panhandle and Greenland's north.
 */
const MIN_ROUNDNESS = 0.05;
const BIG_PIECE = 0.4;
/**
 * How much of the zone boundary's own wiggle to drop before clipping. The cut
 * is against a coastline drawn by somebody else at a finer scale, and handing
 * the clipper two megabytes of Amazon riverbank makes it give up — literally:
 * `polygon-clipping` throws rather than finish. Well under the tolerance the
 * output is simplified to anyway, so it costs nothing that survives.
 */
const PRE_TOLERANCE = 0.005;
/** Coordinate places kept — three is about 100 m, finer than any zoom shows. */
const PLACES = 3;

const tzFile = process.argv[2] ?? "combined.json";
const root = new URL(process.argv[3] ?? "../", import.meta.url);
const outFile = new URL("public/zone-pieces.json", root);

if (!existsSync(NE_FILE)) {
  const res = await fetch(NE_URL);
  writeFileSync(NE_FILE, Buffer.from(await res.arrayBuffer()));
}

// Which countries need cutting up at all, and which zone stands for each of
// their clocks. Read off the generated table rather than restated, so a piece
// is always labelled with a name the game already knows how to read a time
// from — the two can't drift apart.
const tzTable = readFileSync(new URL("src/data/timeZoneData.ts", root), "utf8");
const countryZones = {};
for (const [, code, list] of tzTable.matchAll(/^ {2}(\w{2}): \[(.*)\],$/gm))
  countryZones[code] = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const multi = Object.keys(countryZones).filter((c) => countryZones[c].length > 1);
console.log(`${multi.length} countries keep more than one clock:`, multi.join(" "));

/**
 * How a zone behaves, as a string: its offset at four dates a year apart in
 * quarters — the same test that decided the clock table's own entries.
 *
 * Zones with the same signature keep the same clock all year and are the same
 * answer to every question this game asks, which is what lets the country's
 * one named zone stand for the dozen the boundary file splits it into:
 * Canada's Pacific coast arrives as Vancouver, Dawson Creek and half a dozen
 * more, and all of them are the Vancouver the clock table named.
 */
const SAMPLES = [0, 1, 2, 3].map((q) => Date.UTC(2026, q * 3, 15));
const sigs = new Map();
function signature(zone) {
  let sig = sigs.get(zone);
  if (sig) return sig;
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, hour12: false, year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  sig = SAMPLES.map((at) => {
    const p = {};
    for (const part of fmt.formatToParts(new Date(at))) p[part.type] = part.value;
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
    return Math.round((asUtc - at) / 60_000);
  }).join(",");
  sigs.set(zone, sig);
  return sig;
}

const zones = JSON.parse(readFileSync(tzFile, "utf8")).features;
const world = JSON.parse(readFileSync(NE_FILE, "utf8")).features;

const codeOf = (f) =>
  (f.properties?.ISO_A2_EH || f.properties?.ISO_A2 || "").toLowerCase();

const asMulti = (g) => (g.type === "MultiPolygon" ? g.coordinates : [g.coordinates]);

function bbox(multiPoly) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const rings of multiPoly)
    for (const [lng, lat] of rings[0]) {
      if (lng < west) west = lng;
      if (lng > east) east = lng;
      if (lat < south) south = lat;
      if (lat > north) north = lat;
    }
  return { west, east, south, north };
}

const overlaps = (a, b) =>
  a.west <= b.east && b.west <= a.east && a.south <= b.north && b.south <= a.north;

/** Shoelace area of a ring, in square degrees — only ever compared, never used. */
function ringArea(ring) {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++)
    sum += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(sum / 2);
}

const areaOf = (multiPoly) => multiPoly.reduce((sum, r) => sum + ringArea(r[0]), 0);
const biggest = (multiPoly) => Math.max(...multiPoly.map((r) => ringArea(r[0])));

function perimeter(ring) {
  let total = 0;
  for (let i = 1; i < ring.length; i++)
    total += Math.hypot(ring[i][0] - ring[i - 1][0], ring[i][1] - ring[i - 1][1]);
  return total;
}

/** 4πA/P² of the biggest polygon: 1 for a circle, near nothing for a hairline. */
function roundness(multiPoly) {
  const main = multiPoly.reduce(
    (best, rings) => (ringArea(rings[0]) > ringArea(best[0]) ? rings : best),
    multiPoly[0],
  );
  const p = perimeter(main[0]);
  return p ? (4 * Math.PI * ringArea(main[0])) / (p * p) : 0;
}

function sqSegDist(p, a, b) {
  let x = a[0], y = a[1];
  const dx = b[0] - x, dy = b[1] - y;
  if (dx || dy) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = b[0]; y = b[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  return (p[0] - x) ** 2 + (p[1] - y) ** 2;
}

/** Ramer-Douglas-Peucker, ends always kept so a ring stays closed. */
function simplify(points, tolerance) {
  if (points.length <= 4) return points;
  const maxSq = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [from, to] = stack.pop();
    let worst = 0, at = -1;
    for (let i = from + 1; i < to; i++) {
      const d = sqSegDist(points[i], points[from], points[to]);
      if (d > worst) { worst = d; at = i; }
    }
    if (worst > maxSq && at > 0) {
      keep[at] = 1;
      stack.push([from, at], [at, to]);
    }
  }
  const out = points.filter((_, i) => keep[i]);
  return out.length >= 4 ? out : points;
}

const round = (n) => Number(n.toFixed(PLACES));

/** Simplified, de-slivered, rounded — and closed again after the rounding. */
function tidy(multiPoly) {
  const ranked = multiPoly
    .map((rings) => ({ rings, area: ringArea(rings[0]) }))
    .sort((a, b) => b.area - a.area);
  // Islands are dropped against the piece they belong to rather than against a
  // flat figure: a speck beside Siberia is noise, and a speck beside another
  // speck is the rest of Kiribati.
  const floor = Math.min(MIN_AREA, ranked[0].area / 50);
  return ranked
    .filter((p, i) => i === 0 || p.area >= floor)
    .map(({ rings }) =>
      rings
        .map((ring) => simplify(ring, TOLERANCE).map(([x, y]) => [round(x), round(y)]))
        .map((ring) => {
          const [fx, fy] = ring[0];
          const [lx, ly] = ring[ring.length - 1];
          return fx === lx && fy === ly ? ring : [...ring, [fx, fy]];
        })
        // Wound the way Natural Earth winds, which is the opposite of the way
        // the clipper hands them back. d3 reads a ring's direction as which
        // side of it is inside, so a piece wound the other way is drawn as the
        // entire globe apart from itself — the whole map washed green.
        .map((ring) => [...ring].reverse())
        .filter((ring) => ring.length >= 4),
    )
    .filter((rings) => rings.length > 0);
}

// Every zone polygon, filed under how its clock behaves, so a country's one
// named zone can claim all of them at once.
const bySignature = new Map();
for (const f of zones) {
  const sig = signature(f.properties.tzid);
  const parts = asMulti(f.geometry);
  let held = bySignature.get(sig);
  if (!held) bySignature.set(sig, (held = []));
  for (const rings of parts)
    held.push({
      rings: rings.map((ring) => simplify(ring, PRE_TOLERANCE)),
      box: bbox([rings]),
    });
}

const out = {};
for (const code of multi.sort()) {
  const parts = world.filter((f) => codeOf(f) === code).flatMap((f) => asMulti(f.geometry));
  if (!parts.length) {
    console.warn(`  ${code}: not on the map`);
    continue;
  }
  const countryBox = bbox(parts);
  const floor = Math.min(MIN_PIECE, areaOf(parts) / PIECE_SHARE);
  const pieces = [];
  for (const zone of countryZones[code]) {
    // Only the polygons that reach this country — the rest of a clock kept
    // across three continents has nothing to say about it.
    const near = (bySignature.get(signature(zone)) ?? [])
      .filter((p) => overlaps(countryBox, p.box))
      .map((p) => p.rings);
    if (!near.length) continue;
    let cut;
    try {
      cut = clip.intersection(parts, near);
    } catch (err) {
      console.warn(`  ${code} x ${zone}: ${err.message}`);
      continue;
    }
    if (!cut.length) continue;
    // Judged after tidying, not before: simplification is what turns a
    // wandering frontier into the hairline it always was, and a piece has to
    // earn its place as the shape that will actually be drawn.
    const tidied = tidy(cut);
    if (!tidied.length) continue;
    // Measured on the largest island rather than the total, because the shape
    // of a mismatched frontier is dozens of crumbs that add up: Ukraine cut
    // against Simferopol is 68 blobs along the Russian border and not one of
    // them is Crimea, which this data draws on Kyiv's clock.
    const area = biggest(tidied);
    if (area < floor) continue;
    if (area < BIG_PIECE && roundness(tidied) < MIN_ROUNDNESS) {
      console.warn(`  ${code} x ${zone}: ${area.toFixed(3)} of frontier — dropped`);
      continue;
    }
    pieces.push({ z: zone, g: tidied });
  }
  // One piece is a country the boundary file doesn't actually divide, whatever
  // the clock table says — Ukraine's second zone is Crimea, and this data draws
  // Crimea on Kyiv's clock. Left whole, and marked the way it always was.
  if (pieces.length < 2) {
    console.warn(`  ${code}: ${pieces.length} piece(s) — left whole`);
    continue;
  }
  out[code] = pieces;
  console.log(`  ${code}: ${pieces.map((p) => p.z).join(", ")}`);
}

writeFileSync(outFile, JSON.stringify(out));
console.log(
  `\n${Object.keys(out).length} countries, ` +
    `${(readFileSync(outFile).length / 1024).toFixed(0)} KB -> ${outFile.pathname}`,
);
