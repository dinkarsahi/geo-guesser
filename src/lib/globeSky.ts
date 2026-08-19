import * as THREE from "three";

/**
 * The sky behind the globe: a few thousand stars, and nothing else.
 *
 * It exists because the globe is **tiled** — the world cut into squares that
 * sharpen as you zoom — and a tiled surface can take nothing at all from a
 * material: three-slippy-map-globe builds every tile as a
 * `MeshLambertMaterial`, so a shine on the ocean or relief on the mountains is
 * impossible there and always will be. Stars cost the tiles nothing, because
 * they never touch them.
 *
 * **There used to be a cloud layer here and it has gone.** NASA's composite is
 * a real day's weather over the whole planet, which is far heavier than the
 * tidy wisps a globe usually wears: it laid haze over the coastlines the game
 * is asking about, and in a game whose answer *is* a coastline that had
 * stopped being decoration. It also cost 830 KB on every visit. Judged on the
 * bench with and without, and without won.
 *
 * Handed the scene and the globe's radius, it hangs the stars and gives back
 * the way to take them down again.
 */
export function addSky(scene: THREE.Scene, globeRadius: number): () => void {
  void globeRadius;
  const stars = makeStars();
  scene.add(stars);
  return () => {
    scene.remove(stars);
    stars.geometry.dispose();
    (stars.material as THREE.Material).dispose();
  };
}

/**
 * A few thousand dots on a very large sphere.
 *
 * Drawn rather than downloaded, and that is deliberate twice over. A starfield
 * photograph is the better part of a megabyte for something the player never
 * looks at directly, and the one every three.js example reaches for travels
 * with no licence at all — where every other picture in this game is NASA's or
 * Natural Earth's and plainly free to use. Random dots owe nobody anything.
 *
 * They also stay sharp. A photograph stretched across the whole sky is soft
 * the moment you look at it, and points drawn at a fixed pixel size are the
 * same crisp speck at every zoom.
 */
function makeStars(): THREE.Points {
  const count = 2200;
  // Far outside the camera's own limit, which is 520 from the centre, so the
  // sky can never be flown into however far the player zooms out.
  const radius = 3000;
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Sampled from the sphere's own surface rather than from angles picked at
    // random: uniform latitude and longitude crowds the poles, and a night sky
    // with a bald equator and two bright caps is a distinctly odd one.
    const z = Math.random() * 2 - 1;
    const angle = Math.random() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z);
    positions[i * 3] = Math.cos(angle) * ring * radius;
    positions[i * 3 + 1] = Math.sin(angle) * ring * radius;
    positions[i * 3 + 2] = z * radius;
    // Mostly faint with a few bright ones, because a sky of identical dots
    // reads as a texture and a sky with depth in it reads as stars.
    const brightness = 0.35 + Math.random() ** 3 * 0.65;
    colours[i * 3] = brightness;
    colours[i * 3 + 1] = brightness;
    colours[i * 3 + 2] = brightness * (0.92 + Math.random() * 0.08);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 1.6,
      // In pixels rather than in world units. Three thousand units out, a star
      // sized by distance is smaller than a pixel and simply isn't drawn.
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      // The sky is behind everything and takes part in nothing: not written to
      // the depth buffer, and never in front of the globe whatever the camera
      // does.
      depthWrite: false,
    }),
  );
}
