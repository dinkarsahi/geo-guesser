// three-globe's example textures, served from a CDN (per the chosen setup).
// The globe and the flat map draw from the same files, so the two views of the
// world are literally the same imagery.
const CDN = "https://cdn.jsdelivr.net/npm/three-globe/example/img";

/** Colourful satellite terrain, equirectangular, 4096x2048. */
export const DAY_TEXTURE = `${CDN}/earth-blue-marble.jpg`;
/** Greyscale relief, used for night mode and as the globe's bump map. */
export const GREY_TEXTURE = `${CDN}/earth-topology.png`;
