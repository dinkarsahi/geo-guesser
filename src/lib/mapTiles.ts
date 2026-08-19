/**
 * Imagery that gets sharper as you go in, for the globe's tile engine.
 *
 * The globe's ordinary skin is one 4096×2048 photograph of the whole Earth
 * (`textures.ts`), which is about eleven pixels to a degree — a pixel is ten
 * kilometres. Wrapped on a sphere that's plenty from arm's length and nothing
 * at all once you're down among the coastlines: zooming in magnifies the same
 * blur rather than showing you anything you couldn't see before.
 *
 * A slippy map answers that by not being one picture. The world is cut into
 * 256-pixel tiles at every zoom level, each level twice the detail of the one
 * above, and only the tiles the camera can actually see are fetched. Going in
 * fetches a deeper level, so the coastline you're heading for keeps resolving —
 * which is the whole of what this is for.
 *
 * three-globe has the engine built in (`globeTileEngineUrl`, and it tracks the
 * camera itself); all that's wanted here is where the tiles come from.
 */

/**
 * The same imagery again, cut for the **flat map** rather than the globe.
 *
 * A second scheme and not a second URL, because the two maps are in different
 * projections and tiles are cut to one or the other. The globe wants Web
 * Mercator, which is what a slippy map means everywhere on the web. The flat
 * map is plate carrée — longitude and latitude straight onto x and y — and
 * Mercator tiles dropped onto it would be stretched further wrong the nearer
 * they got to the poles. NASA publishes both, which is what makes this
 * possible at all; a source without a `flat` simply leaves the flat map on its
 * photograph.
 */
export interface FlatTiles {
  /** One tile, by column, row and level of the grid below. */
  url: (col: number, row: number, level: number) => string;
  /** The deepest level the grid holds. */
  maxLevel: number;
}

/**
 * How much of the world one tile covers, in degrees square, at a given level.
 *
 * **The number that matters here, and the one it is easiest to be wrong
 * about.** A tile is 512 pixels of half a degree and a bit — 0.5625° — at level
 * 0, and every level halves it. That is the service's ladder, read off its
 * capabilities document; it is not something to infer from how many columns a
 * level has.
 *
 * That inference is the trap, and it cost a round trip. Counting columns and
 * calling a tile `360 / cols` degrees looks right, and *is* right from level 3
 * down, where the grid happens to divide the world exactly. At the top it is
 * not: level 1 has three columns of **144°** each, covering 432° — half a world
 * of padding past the date line — and treating them as 120° squeezes every
 * coastline to 83% of where it belongs. It reads as the borders sliding off the
 * map until you zoom in far enough to reach the levels that do divide evenly,
 * which is precisely what it looked like.
 *
 * The columns and rows follow from this rather than the other way round: as
 * many as it takes to cover 360° and 180°. Where the last of them hangs past
 * the date line or the pole, it is placed by its own extent like any other and
 * the map clips what falls off.
 */
export const flatTileSpan = (level: number) => 288 / 2 ** level;

/**
 * How wide the whole world is, in pixels, at level 0 of that ladder — 360° of
 * it at 0.5625° a pixel. Every level doubles it, which is all the choosing of a
 * level amounts to.
 */
export const FLAT_WORLD_PX = 640;

/** Where a map's skin comes from, and how far it can be trusted. */
export interface TileSource {
  /** One tile, by slippy-map column, row and zoom level. Web Mercator. */
  url: (x: number, y: number, level: number) => string;
  /**
   * The deepest level the service actually holds.
   *
   * **Not optional and not a guess.** Asked for a level past its last, every
   * one of these services answers 400 rather than something sensible, and the
   * engine draws nothing where a tile didn't arrive — so an over-generous
   * number doesn't cost detail, it strips the globe bare the moment you go too
   * close. Checked against the live service, not read off a page.
   */
  maxLevel: number;
  /**
   * How near the camera may get before it has outrun the imagery.
   *
   * Past this the deepest tiles are being magnified, which is the blur this
   * whole file exists to get away from — so the zoom stops where the pictures
   * stop rather than carrying on into mush.
   */
  minAltitude: number;
  /**
   * Who the imagery belongs to, in the words that source asks for.
   *
   * Printed on the credits page and not on the map itself: NASA's GIBS asks to
   * be acknowledged without saying where, so one page carries it. Kept per
   * source rather than written out once on that page, because the two that
   * aren't mounted are not free of the question — Esri's terms want their line
   * where the imagery is drawn, so swapping `WORLD_TILES` to it means putting
   * this back on the map as well as changing the page.
   */
  credit: string;
  /** The same imagery cut for the flat map, where the service publishes it. */
  flat?: FlatTiles;
}

/**
 * How far past its last level a source may still be pushed.
 *
 * At 1 the zoom would stop exactly where the imagery matches the screen
 * pixel-for-pixel — honest, and meaner than it needs to be. Magnifying the
 * deepest tiles a little is not the blur this file was written to escape: it is
 * the same coastline seen slightly soft, and it is what lets a player lean in on
 * the place they've found instead of being held at arm's length by a globe that
 * won't let them look. Three is about where soft turns to mush, and it is the
 * difference between a shallow source feeling capped and feeling broken.
 *
 * It costs nothing on a deep source: Esri runs into the floor below long before
 * this could matter to it.
 */
const OVERZOOM = 3;

/**
 * The altitude at which a given level stops being worth going nearer.
 *
 * Level 9 lands at about 0.05 by eye — roughly where 300 metres a pixel matches
 * a pixel on the screen — and every level below it doubles the detail, so it
 * buys half the altitude. The floor is where the globe itself becomes the
 * problem rather than the pictures: nearer than this the horizon bends
 * strangely and a click at a shallow angle stops landing where the cursor is.
 */
const floorFor = (maxLevel: number) =>
  Math.max(0.004, (0.05 * 2 ** (9 - maxLevel)) / OVERZOOM);

const GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";
/** The same service in plate carrée, for the flat map — see `FlatTiles`. */
const GIBS_FLAT = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best";

/**
 * NASA's, and free of everything: public domain imagery, no account, no key, no
 * meter, and commercial use is expressly fine. All it asks is the credit below.
 *
 * The catch is depth. In Web Mercator, GIBS stops at level 9 — a quarter of a
 * kilometre to the pixel — where a paid service goes on to a metre or two. For
 * *this* game that may be the right trade: SpotOn asks where a city is, which is
 * settled by coastlines and mountain ranges, and level 8 is already sixteen
 * times sharper than the single photograph the globe wears today.
 */
export const NASA_BLUE_MARBLE: TileSource = {
  // Shaded relief and bathymetry, so the sea has shape to it rather than being
  // a flat blue. Static and cloudless, which is the point of choosing it over
  // the daily pass below: a game cannot have weather deciding whether the
  // country it just asked for is visible.
  url: (x, y, level) =>
    `${GIBS}/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/${level}/${y}/${x}.jpeg`,
  maxLevel: 8,
  minAltitude: floorFor(8),
  credit: "Imagery courtesy of NASA EOSDIS GIBS",
  // The flat map's grid reaches further than the globe's: 160 columns of 512
  // pixels is 82,000 across the world, where the flat map at its deepest zoom
  // is nearer 23,000. So unlike the globe, the flat map never runs out — the
  // pictures outlast the zoom rather than the other way round.
  flat: {
    url: (col, row, level) =>
      `${GIBS_FLAT}/BlueMarble_ShadedRelief_Bathymetry/default/500m/${level}/${row}/${col}.jpeg`,
    maxLevel: 7,
  },
};

/**
 * The same service, one level deeper and photographed yesterday.
 *
 * VIIRS true colour is a real pass of a real satellite, so it brings real
 * weather with it: cloud over whichever country it happened to be cloudy over,
 * and darkness at whichever pole is having its winter. Wonderful to look at and
 * a poor thing to be marked on — kept here because one level is one level, and
 * because a choice worth making is worth keeping the alternative to.
 *
 * Yesterday rather than today: the current day is still being assembled, and
 * the far side of the world hasn't been flown over yet.
 */
const lastFullDay = new Date(Date.now() - 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

export const NASA_TRUE_COLOUR: TileSource = {
  url: (x, y, level) =>
    `${GIBS}/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${lastFullDay}/GoogleMapsCompatible_Level9/${level}/${y}/${x}.jpg`,
  maxLevel: 9,
  minAltitude: floorFor(9),
  credit: "Imagery courtesy of NASA EOSDIS GIBS",
  flat: {
    url: (col, row, level) =>
      `${GIBS_FLAT}/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${lastFullDay}/250m/${level}/${row}/${col}.jpg`,
    maxLevel: 8,
  },
};

/**
 * The imagery every map in the game draws, in daylight.
 *
 * One name so there is one place to change it, and NASA's because it is the
 * only one of the three a shipped game can stand on: public domain, no key, no
 * meter, commercial use expressly fine, and nothing owed but the credit line
 * the maps print. The other two below are what it was chosen over.
 */
export const WORLD_TILES = NASA_BLUE_MARBLE;

/**
 * Esri's World Imagery, in the usual `{z}/{y}/{x}` slippy scheme — **note the
 * y before the x**, which is Esri's order and not the more common one.
 *
 * Far and away the deepest of the three: it carries on to a metre or two a
 * pixel, where the Sahara resolves down to dry riverbeds. It is also the one
 * that isn't free.
 *
 * **This is the anonymous legacy endpoint, and shipping a game on it is not an
 * option.** Esri's terms want an ArcGIS account for it and don't cover
 * commercial use of this URL at all. Doing it properly means their keyed
 * service and a bill: their tile meter works out at pennies a game, which no
 * ad-supported game survives, so it would have to be the session meter — one
 * charge per player per twelve hours, which is affordable but is a different
 * endpoint and a token to carry. Left here as the thing to hold NASA against,
 * and not as a thing to ship.
 */
export const ESRI_WORLD_IMAGERY: TileSource = {
  url: (x, y, level) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${level}/${y}/${x}`,
  maxLevel: 17,
  minAltitude: floorFor(17),
  credit: "Imagery © Esri, Maxar, Earthstar Geographics",
  // No `flat`: this service is cut in Web Mercator only, so choosing it leaves
  // the flat map on its photograph while the globe goes tiled.
};
