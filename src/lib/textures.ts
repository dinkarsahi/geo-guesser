// three-globe's example texture, served from a CDN (per the chosen setup).
//
// One photograph of the whole world, and only the flat map still draws it —
// underneath the tiles, where it stands in for any tile still on its way and
// for ground just outside the ones fetched. The globe has no use for it at all:
// given a tile engine, three-globe hides the photographed globe entirely.
const CDN = "https://cdn.jsdelivr.net/npm/three-globe/example/img";

/** Colourful satellite terrain, equirectangular, 4096x2048. */
export const DAY_TEXTURE = `${CDN}/earth-blue-marble.jpg`;
