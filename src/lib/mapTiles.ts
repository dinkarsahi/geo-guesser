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
  /**
   * How many columns the grid has at each level — the index is the level, and
   * the length is how many levels there are.
   *
   * **A table and not a formula, because this grid is not a quadtree.** The
   * levels go 2, 3, 5, 10, 20… columns: only from the third does it settle into
   * doubling, and assuming powers of two puts every tile in the wrong place at
   * the top three. Taken from the service's own capabilities document.
   *
   * A tile is `360 / cols` degrees square, laid from the top-left corner of the
   * world. Where that doesn't divide 180 evenly the bottom row hangs past the
   * south pole, which costs nothing: it's placed by its own extent and the map
   * clips what falls off.
   */
  cols: number[];
}

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
  /** Printed on the map. Every source here wants it, for its own reasons. */
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
 * The column counts of GIBS's plate carrée grids, by level. Checked against the
 * service's capabilities rather than assumed — see `FlatTiles.cols`.
 */
const GIBS_500M_COLS = [2, 3, 5, 10, 20, 40, 80, 160];
const GIBS_250M_COLS = [...GIBS_500M_COLS, 320];

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
    cols: GIBS_500M_COLS,
  },
};

/**
 * The same service, one level deeper and photographed yesterday.
 *
 * VIIRS true colour is a real pass of a real satellite, so it brings real
 * weather with it: cloud over whichever country it happened to be cloudy over,
 * and darkness at whichever pole is having its winter. Wonderful to look at and
 * a poor thing to be marked on — kept here because one level is one level, and
 * because the choice between the two is exactly what the bench is for.
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
    cols: GIBS_250M_COLS,
  },
};

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
