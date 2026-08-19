import * as THREE from "three";
import { CLOUD_TEXTURE } from "./textures";

/**
 * The sky around the globe: stars behind it, and weather drifting over it.
 *
 * Both are objects standing *beside* the globe rather than paint on its
 * surface, and that is the whole reason they exist. The globe is tiled — the
 * world cut into squares that sharpen as you zoom — and a tiled surface can
 * take nothing at all from a material: three-slippy-map-globe builds every
 * tile as a `MeshLambertMaterial`, so a shine on the ocean or relief on the
 * mountains is impossible there and always will be. These two cost the tiles
 * nothing, because they never touch them.
 *
 * Judged on the bench before it came near a game — a copy of City Spotter with
 * this against a photographed globe that could have the shine but was five
 * kilometres to the pixel where the tiles are six hundred metres. The sky won
 * on the arithmetic: all of the sharpness, most of the look.
 *
 * Handed the scene and the globe's radius, it hangs both and gives back the
 * way to take them down again. Call that on unmount — a round ends, the map
 * goes, and a cloud shell still turning in a scene nobody is drawing is a
 * timer and a texture nothing will ever collect.
 *
 * `clouds: false` leaves the weather off and keeps the stars. Only the bench
 * asks for it, and only so the two can be looked at side by side — the cloud
 * layer is the half of this that costs 830 KB and covers the coastlines the
 * game is asking about, so it is the half worth being able to switch off and
 * argue with.
 */
export function addSky(
  scene: THREE.Scene,
  globeRadius: number,
  { clouds: wanted = true }: { clouds?: boolean } = {},
): () => void {
  const stars = makeStars();
  scene.add(stars);

  if (!wanted) {
    return () => {
      scene.remove(stars);
      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();
    };
  }

  // How far above the surface the weather hangs, in globe radii. Small enough
  // to read as cloud on the world rather than a second shell around it, and
  // still clear of the pins and the arc, which stand on the surface itself.
  const cloudAltitude = 0.004;
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius * (1 + cloudAltitude), 64, 64),
    // White, with the photograph deciding only *where* — the cloud map is
    // greyscale, so as an alpha map it is thick where the cloud is thick and
    // gone where the sky is clear. As a colour map instead it would paint grey
    // haze over the whole world.
    //
    // Kept out of the depth buffer: the shell wraps the entire globe, and
    // writing depth it hides the pins and the arc underneath it.
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      // Thin on purpose. NASA's composite is a real day's weather over the
      // whole planet, which is far cloudier than the tidy wisps a globe
      // usually wears — at half opacity it whited out the north Atlantic and
      // most of west Africa's coast. In a game whose answer is a coastline,
      // cloud that hides one has stopped being decoration and started being
      // the difficulty. This is about as thick as it can be while every
      // shoreline stays readable underneath.
      opacity: 0.26,
      depthWrite: false,
    }),
  );
  clouds.renderOrder = 1;
  scene.add(clouds);

  let dropped = false;
  const loader = new THREE.TextureLoader();
  loader.load(CLOUD_TEXTURE, (texture) => {
    // A round can end while eight hundred kilobytes are still on their way.
    // Arriving into a scene nobody is drawing, the texture is dropped rather
    // than hung on a mesh that has already been taken down.
    if (dropped) {
      texture.dispose();
      return;
    }
    const material = clouds.material as THREE.MeshPhongMaterial;
    material.alphaMap = texture;
    material.needsUpdate = true;
  });

  // Turned against the world rather than with it, and by the clock rather than
  // by the frame: per frame it drifts more than twice as fast on a 144 Hz
  // monitor as on a 60 Hz laptop, which makes the weather a property of the
  // hardware. Slow enough to read as drift — at this rate a cloud crosses a
  // country in about a minute, which is longer than a round.
  const degreesPerSecond = -0.2;
  let last = performance.now();
  let frame = requestAnimationFrame(function drift(now) {
    const seconds = (now - last) / 1000;
    last = now;
    clouds.rotation.y += ((degreesPerSecond * seconds) / 180) * Math.PI;
    frame = requestAnimationFrame(drift);
  });

  return () => {
    dropped = true;
    cancelAnimationFrame(frame);
    scene.remove(clouds);
    scene.remove(stars);
    clouds.geometry.dispose();
    const material = clouds.material as THREE.MeshPhongMaterial;
    material.alphaMap?.dispose();
    material.dispose();
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
