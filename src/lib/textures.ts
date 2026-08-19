// three-globe's example texture, served from a CDN (per the chosen setup).
//
// One photograph of the whole world, and only the flat map still draws it —
// underneath the tiles, where it stands in for any tile still on its way and
// for ground just outside the ones fetched. The globe has no use for it at all:
// given a tile engine, three-globe hides the photographed globe entirely.
const CDN = "https://cdn.jsdelivr.net/npm/three-globe/example/img";

/** Colourful satellite terrain, equirectangular, 4096x2048. */
export const DAY_TEXTURE = `${CDN}/earth-blue-marble.jpg`;

/**
 * Cloud cover, white on black, equirectangular, 2048x1024.
 *
 * NASA's Blue Marble cloud composite, and **served from our own domain rather
 * than fetched from theirs**: Visible Earth sends no `Access-Control-Allow-
 * Origin`, and a texture without one cannot be handed to WebGL at all. So it
 * lives in `public/` — which is where a picture the game needs in order to
 * draw itself belongs anyway, rather than depending on somebody else's uptime.
 *
 * Greyscale on purpose. The globe uses it as an **alpha** map and supplies the
 * white itself, so the image says only where cloud is and how thick, never
 * what colour it is.
 *
 * 830 KB, which is the price of the sky and the reason there is no starfield
 * beside it in this file — see `makeStars` in `globeSky.ts`, which draws that
 * instead of downloading it.
 */
export const CLOUD_TEXTURE = "/earth-clouds.jpg";
