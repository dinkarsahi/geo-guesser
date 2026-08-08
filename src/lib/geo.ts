export interface Coord {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two lat/lng points, in kilometres.
 */
export function haversineKm(a: Coord, b: Coord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * A round is marked out of 100. Small numbers stay meaningful — 87 reads as
 * "nearly perfect" at a glance in a way 4,350 never did.
 */
export const MAX_ROUND_SCORE = 100;

/**
 * What a finished game is marked: the average round, to the nearest whole
 * number, out of the same 100 a single round is marked out of.
 *
 * An average rather than a total so that the mark means one thing regardless
 * of how long the game was — 78 is 78 whether it took five rounds or ten, and
 * reads directly as how well the rounds went. A total can only be read against
 * a denominator you have to be told.
 */
export const finalScore = (total: number, rounds: number): number =>
  rounds === 0 ? 0 : Math.round(total / rounds);

/**
 * Convert a guess distance into a 0..MAX_ROUND_SCORE score.
 * Score decays exponentially with distance; `scaleKm` sets how forgiving
 * the mode is (large for the world, tiny for the tube map).
 * A perfect click scores the max; the score halves roughly every
 * 0.69 * scaleKm.
 *
 * `spotOnKm` is a radius around the answer that costs nothing — anywhere
 * inside it is full marks. A place with an area rather than a point can say
 * so with a `hitTest`; this is for the ones that are a point on the map but
 * not a point on the ground. A city is a coordinate here and forty miles of
 * streets in life, and marking someone down for landing on the near edge of
 * it was measuring their aim rather than their geography.
 *
 * The decay is measured from the edge of that radius, not from the centre, so
 * there's no step at the boundary: a click just outside it scores just under
 * full marks rather than dropping several points for the last metre.
 */
export function scoreFromDistance(
  distanceKm: number,
  scaleKm: number,
  spotOnKm = 0,
): number {
  const beyond = Math.max(0, distanceKm - spotOnKm);
  return Math.round(MAX_ROUND_SCORE * Math.exp(-beyond / scaleKm));
}

/**
 * Human-friendly distance string (metres under 1 km, else km).
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}
