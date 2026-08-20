// One photograph of the whole world, served from this site rather than from a
// package CDN.
//
// Only the flat map still draws it — underneath the tiles, where it stands in
// for any tile still on its way and for ground just outside the ones fetched.
// The globe has no use for it at all: given a tile engine, three-globe hides
// the photographed globe entirely.
//
// It used to be hotlinked from `cdn.jsdelivr.net/npm/three-globe/example/img`,
// which is three-globe's *example* asset on a package CDN — a fine thing to
// borrow for a demo and not something to build a business on. That was item C6
// of the ad-readiness register, and the last thing here still fetched from
// somebody else's server.
//
// **Copied into `public/` rather than imported from the dependency**, which
// was the first attempt and is not available: three-globe's `exports` field
// refuses deep imports, so Vite cannot reach into `example/img` to bundle it.
// The copy is byte-identical to what the CDN served. It is a NASA photograph
// in an MIT project, so nothing is owed for it beyond the credit line the maps
// already print — and it is a photograph of the Earth, which is not going to
// be revised, so the duplicate cannot meaningfully drift.
//
// If it ever needs refreshing:
//   cp node_modules/three-globe/example/img/earth-blue-marble.jpg public/

/** Colourful satellite terrain, equirectangular, 4096x2048. */
export const DAY_TEXTURE = "/earth-blue-marble.jpg";
