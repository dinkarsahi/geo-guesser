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
 * `scaleKm` sets how forgiving the mode is (large for the world, tiny for the
 * tube map): it's the distance at which a guess is worth 37 of the 100.
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
 *
 * Squared in the exponent, which is the whole shape of it — the same curve the
 * tube map is marked on, and for the same reason. A plain decay falls hardest
 * at the very first kilometre, so the player who put Lima two countries over
 * and the player who put it in Kazakhstan were being separated by a curve that
 * had already spent most of its fall on the first of them. This one leaves
 * full marks slowly and then drops away: at a fifth of the scale it's still 96
 * and at half of it 78, while twice the scale is worth 2 rather than 14.
 *
 * Which is what the world is actually like. Land is not spread evenly around
 * the answer — there are far more wrong places a long way off than near by, so
 * landing within a few hundred kilometres of somewhere isn't a near miss, it's
 * the top slice of the answers available, and it should be paid like one.
 */
export function scoreFromDistance(
  distanceKm: number,
  scaleKm: number,
  spotOnKm = 0,
): number {
  const beyond = Math.max(0, distanceKm - spotOnKm) / scaleKm;
  return Math.round(MAX_ROUND_SCORE * Math.exp(-beyond * beyond));
}

/**
 * Human-friendly distance string (metres under 1 km, else km).
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}
