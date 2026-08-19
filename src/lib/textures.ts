// three-globe's example texture, served from a CDN (per the chosen setup).
//
// One photograph of the whole world, and only the flat map still draws it —
// underneath the tiles, where it stands in for any tile still on its way and
// for ground just outside the ones fetched. The globe has no use for it at all:
// given a tile engine, three-globe hides the photographed globe entirely.
const EXAMPLES = "https://cdn.jsdelivr.net/npm/three-globe/example";
const CDN = `${EXAMPLES}/img`;

/** Colourful satellite terrain, equirectangular, 4096x2048. */
export const DAY_TEXTURE = `${CDN}/earth-blue-marble.jpg`;

// ---------------------------------------------------------------------------
// The bench's textures. Delete this block with `ScrapbookGlobe`.
//
// A tiled globe cannot have a specular ocean: three-slippy-map-globe builds
// every tile as a `MeshLambertMaterial`, which has no specular term at all,
// and three-globe hides the photographed sphere outright the moment a tile URL
// is set (`state.tileEngine.visible = !(state.globeObj.visible = ...)`). The
// sphere underneath is a `MeshPhongMaterial`, which does. So a shine on the
// water means giving the tiles up and going back to one photograph — which is
// the trade the bench exists to let somebody look at.
// ---------------------------------------------------------------------------

/** Height, as a greyscale map. Fakes relief the flat photograph hasn't got. */
export const TOPOLOGY_TEXTURE = `${CDN}/earth-topology.png`;

/**
 * Where the water is: white sea, black land.
 *
 * Handed to a Phong material as its `specularMap` this is what makes the
 * oceans catch the light and leaves the land matte — the shine is the mask,
 * not a lighting trick.
 */
export const WATER_TEXTURE = `${CDN}/earth-water.png`;

/**
 * The whole world at 8192x4096, with a **flat ocean**, in one request.
 *
 * The same NASA service the game's tiles come from, asked through its WMS door
 * instead of its tile door: one `GetMap` for the entire globe rather than a
 * grid of squares. Two things make it the photograph to imitate MapTap with.
 *
 * It is `BlueMarble_ShadedRelief` rather than the
 * `BlueMarble_ShadedRelief_Bathymetry` the game draws, and dropping the
 * bathymetry is exactly what flattens the sea: no ridges, no trenches, no
 * shelf — one even colour from coast to coast, which is the thing MapTap's
 * globe is doing. And 8192 across is twice the Blue Marble photograph
 * three-globe ships, which puts it level with MapTap's own (8193x4096,
 * measured) at about five kilometres to the pixel.
 *
 * **It is slow, and knowingly so: 17 seconds to the first byte, measured, and
 * the same again next time** — the server draws it per request and caches
 * nothing. Fine for a bench and unshippable as it stands. MapTap solve exactly
 * this by keeping their copy on their own domain, and so would we: pull the
 * image once, serve it ourselves, and the WMS call goes away.
 */
export const FLAT_OCEAN_TEXTURE =
  "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi" +
  "?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_ShadedRelief" +
  "&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH=8192&HEIGHT=4096&FORMAT=image/jpeg";

/** Stars, for behind the globe. MapTap has them and they cost nothing. */
export const NIGHT_SKY_TEXTURE = `${CDN}/night-sky.png`;

/**
 * Cloud cover, transparent where the sky is clear — and **not shippable as
 * it stands**.
 *
 * Two things wrong with it for a real game, both fine on a bench. It is 5 MB,
 * which is three times the whole Blue Marble photograph and would be paid for
 * on every visit. And three-globe's example, which is where this URL comes
 * from, credits it only to turban/webgl-earth — no licence travels with the
 * image itself, where every other texture here is NASA's or Natural Earth's
 * and clearly free. If clouds graduate, they graduate on a NASA cloud layer
 * with its provenance written down, not on this file.
 */
export const CLOUDS_TEXTURE = `${EXAMPLES}/clouds/clouds.png`;
