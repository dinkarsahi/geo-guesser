import { useEffect, useState } from "react";
import type { Feature, MultiPolygon } from "geojson";
import type { Coord } from "./geo";

/**
 * The twenty countries that keep more than one clock, cut into the parts that
 * keep each of them — Western Australia apart from Queensland, Kaliningrad
 * apart from the rest of Russia.
 *
 * Built offline by `.tmpdata/gen-zones.mjs` from the time zone boundary
 * project's polygons, clipped to the same Natural Earth borders the game
 * draws. Fetched rather than bundled: it's most of a megabyte and only the
 * clock game has any use for it, so nobody playing the other six pays for it.
 *
 * Every piece is labelled with a zone the clock table already names, so the
 * time on a piece is read the same way the time on a country is — this file
 * says where, and never what time it is there.
 */
const PIECES_URL = `${import.meta.env.BASE_URL}zone-pieces.json`;

/** A box round a piece: four comparisons that rule out almost every click. */
interface Box {
  west: number;
  east: number;
  south: number;
  north: number;
}

export interface ZonePiece {
  /** The country this is part of, lowercase ISO alpha-2. */
  code: string;
  /** The IANA zone this part keeps — a name from the clock table. */
  zone: string;
  /** Its outline, ready to draw. */
  feature: Feature<MultiPolygon>;
  /** Its rings, for the point tests below. */
  rings: Ring[][];
  box: Box;
}

type Ring = [number, number][];

/** Country code -> the parts it's cut into. Countries not here are undivided. */
export type ZonePieces = Record<string, ZonePiece[]>;

interface RawPiece {
  z: string;
  g: Ring[][];
}

function build(raw: Record<string, RawPiece[]>): ZonePieces {
  const out: ZonePieces = {};
  for (const [code, pieces] of Object.entries(raw)) {
    out[code] = pieces.map(({ z, g }) => {
      let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
      for (const rings of g)
        for (const [lng, lat] of rings[0]) {
          if (lng < west) west = lng;
          if (lng > east) east = lng;
          if (lat < south) south = lat;
          if (lat > north) north = lat;
        }
      return {
        code,
        zone: z,
        rings: g,
        box: { west, east, south, north },
        feature: {
          type: "Feature",
          properties: { code, zone: z },
          geometry: { type: "MultiPolygon", coordinates: g },
        },
      };
    });
  }
  return out;
}

let pending: Promise<ZonePieces> | null = null;

/** Fetches the pieces once per session and caches the result. */
export function loadZonePieces(): Promise<ZonePieces> {
  pending ??= fetch(PIECES_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`zone pieces: HTTP ${r.status}`);
      return r.json() as Promise<Record<string, RawPiece[]>>;
    })
    .then(build)
    .catch((err) => {
      // Let a later attempt retry rather than caching the failure forever.
      pending = null;
      throw err;
    });
  return pending;
}

/** The pieces once they've downloaded; null until then. */
export function useZonePieces(): ZonePieces | null {
  const [pieces, setPieces] = useState<ZonePieces | null>(null);
  useEffect(() => {
    let live = true;
    loadZonePieces()
      .then((p) => { if (live) setPieces(p); })
      // An empty set rather than nothing at all: a country with no parts is a
      // country marked and drawn whole, which is what the game did before this
      // file existed. Better than a mode that never finishes loading.
      .catch(() => { if (live) setPieces({}); });
    return () => { live = false; };
  }, []);
  return pieces;
}

/** Ray casting, in plate carrée — the same flat space the file is stored in. */
function inRing(c: Coord, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > c.lat !== yj > c.lat && c.lng < ((xj - xi) * (c.lat - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

/** Inside the outline and not down one of its holes. */
function inPiece(c: Coord, piece: ZonePiece): boolean {
  const { box } = piece;
  if (c.lng < box.west || c.lng > box.east || c.lat < box.south || c.lat > box.north)
    return false;
  for (const rings of piece.rings) {
    if (!inRing(c, rings[0])) continue;
    let holed = false;
    for (let i = 1; i < rings.length; i++) if (inRing(c, rings[i])) holed = true;
    if (!holed) return true;
  }
  return false;
}

/** Square of the distance from a point to a segment, in degrees. */
function sqSegDist(c: Coord, a: [number, number], b: [number, number]): number {
  let x = a[0];
  let y = a[1];
  const dx = b[0] - x;
  const dy = b[1] - y;
  if (dx || dy) {
    const t = ((c.lng - x) * dx + (c.lat - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  return (c.lng - x) ** 2 + (c.lat - y) ** 2;
}

function sqDistToPiece(c: Coord, piece: ZonePiece): number {
  let best = Infinity;
  for (const rings of piece.rings)
    for (const ring of rings)
      for (let i = 1; i < ring.length; i++) {
        const d = sqSegDist(c, ring[i - 1], ring[i]);
        if (d < best) best = d;
      }
  return best;
}

/** The parts of a country, or null for one the file doesn't divide. */
export function piecesOf(pieces: ZonePieces | null, code: string): ZonePiece[] | null {
  return pieces?.[code.toLowerCase()] ?? null;
}

/**
 * Which part of a country a point landed in.
 *
 * Nearest rather than strictly containing, because these outlines are
 * simplified and the country outline the click was tested against isn't: a
 * press on the Vancouver waterfront lands a kilometre outside every piece
 * British Columbia has, and it is still British Columbia. Only ever asked
 * about a point already known to be in this country, so the nearest piece of
 * it is the right answer by construction.
 */
export function pieceAt(
  pieces: ZonePieces | null,
  code: string,
  c: Coord,
): ZonePiece | null {
  const parts = piecesOf(pieces, code);
  if (!parts) return null;
  for (const piece of parts) if (inPiece(c, piece)) return piece;
  let best: ZonePiece | null = null;
  let bestSq = Infinity;
  for (const piece of parts) {
    const d = sqDistToPiece(c, piece);
    if (d < bestSq) {
      bestSq = d;
      best = piece;
    }
  }
  return best;
}
