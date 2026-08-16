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
 * Esri's World Imagery, in the usual `{z}/{y}/{x}` slippy scheme — **note the
 * y before the x**, which is Esri's order and not the more common one.
 *
 * Chosen because it is aerial imagery rather than a drawn map, so it carries on
 * looking like the same world the flat map shows, and because it goes deep —
 * far past anything a player will zoom to.
 *
 * **It is somebody else's service, and it comes with strings**: attribution is
 * required wherever it's drawn (see `TILE_CREDIT`, which the globe prints), and
 * Esri's terms are written around having an account for anything beyond casual
 * use. Fine for a bench; a decision to be made deliberately before it goes near
 * the real game.
 */
export const satelliteTile = (x: number, y: number, level: number): string =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${level}/${y}/${x}`;

/** Required on screen wherever the tiles above are drawn. */
export const TILE_CREDIT = "Imagery © Esri, Maxar, Earthstar Geographics";
