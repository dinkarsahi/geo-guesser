import * as THREE from "three";

/**
 * The arrival: a fall through space that ends at the Earth.
 *
 * **On the bench only.** It exists because of a gap nobody designed — press
 * Start and the map is there before its imagery is, so the first thing a round
 * shows is an empty dark rectangle, or a globe that pops into being a moment
 * after the question. The tiles have to travel and there is nothing to be done
 * about that; what can be done is make the wait part of the game rather than a
 * pause in front of it.
 *
 * So the camera starts a long way out and falls inward while the world turns
 * under it, and a handful of planets slide past on the way. **The planets are
 * not animated.** They are put in the corridor the camera is about to fly
 * down, and the camera's own motion sweeps them past — parallax rather than
 * choreography, which is both less code and more convincing, since near ones
 * genuinely pass faster than far ones.
 *
 * Everything here draws instantly: spheres and points, no textures, nothing
 * fetched. That is the whole trick. The one thing on screen that *does* have
 * to travel is the Earth, and by the time the camera is near enough for its
 * surface to matter, the tiles have had three seconds they didn't have before.
 */

/**
 * How long the fall takes.
 *
 * Long enough to cover a cold tile fetch on a middling connection, short
 * enough that somebody who has played six rounds isn't waiting on it. Past
 * about four seconds an animation stops being an arrival and becomes a thing
 * between you and the game.
 */
export const FLIGHT_MS = 3400;

/** How far out it starts, in globe radii — the Earth as a bright dot. */
const START_ALTITUDE = 14;

/** How far round the world turns on the way in. Most of a rotation. */
const SPIN_DEGREES = 260;

/** How long the planets take to fade once the fall is over. */
const FADE_MS = 500;

interface Controls {
  maxDistance: number;
}

interface PointOfView {
  (pov: { lat?: number; lng?: number; altitude?: number }, transitionMs?: number): void;
}

/**
 * Fall towards the given place, and give back the way to stop.
 *
 * The teardown matters more than usual here: a round can be left in the middle
 * of the fall, and a timer that fires into a scene that has gone takes the
 * planets with it whether or not anything is still drawing them.
 */
export function flyIn(
  scene: THREE.Scene,
  controls: Controls,
  pointOfView: PointOfView,
  target: { lat: number; lng: number; altitude: number },
): () => void {
  const planets = makePlanets();
  for (const planet of planets) scene.add(planet);

  // The orbit controls clamp how far the camera may be from the middle, and
  // the game's limit is far nearer than this starts. Opened for the fall and
  // closed again at the end of it — left open, the player could pull the
  // world away to a dot mid-round.
  const flightDistance = (1 + START_ALTITUDE) * 100;
  const homeDistance = controls.maxDistance;
  controls.maxDistance = flightDistance;

  // Set instantly, then tweened on the next frame. Both in one call would be
  // a tween from wherever the camera happened to be, which is the middle of
  // the world on a globe that has only just been built.
  pointOfView({ lat: target.lat, lng: target.lng - SPIN_DEGREES, altitude: START_ALTITUDE });
  const opening = requestAnimationFrame(() => pointOfView(target, FLIGHT_MS));

  let fade = 0;
  const landed = window.setTimeout(() => {
    controls.maxDistance = homeDistance;
    // Faded rather than cut. At the end of the fall a planet can be square in
    // front of the player, and having one blink out of existence is a worse
    // interruption than the pause this was built to hide.
    const startedAt = performance.now();
    const dim = (now: number) => {
      const gone = Math.min(1, (now - startedAt) / FADE_MS);
      for (const planet of planets) {
        (planet.material as THREE.MeshPhongMaterial).opacity = 1 - gone;
      }
      if (gone < 1) fade = requestAnimationFrame(dim);
      else drop();
    };
    fade = requestAnimationFrame(dim);
  }, FLIGHT_MS);

  let dropped = false;
  const drop = () => {
    if (dropped) return;
    dropped = true;
    for (const planet of planets) {
      scene.remove(planet);
      planet.geometry.dispose();
      (planet.material as THREE.Material).dispose();
    }
  };

  return () => {
    cancelAnimationFrame(opening);
    cancelAnimationFrame(fade);
    clearTimeout(landed);
    controls.maxDistance = homeDistance;
    drop();
  };
}

/**
 * The things that go past on the way in.
 *
 * Not the solar system, and deliberately not labelled as one — they are
 * scenery, and a player who counted them and found eight would be owed an
 * ordering nobody is going to give them. What they have to be is *various*:
 * different sizes at different distances, so the fall has depth in it rather
 * than being a zoom.
 *
 * Placed rather than animated. The camera falls from fourteen globe radii to
 * two along an arc, so anything standing between those two distances sweeps
 * past on its own, and the near ones sweep faster — which is the thing that
 * sells the motion, and is free.
 */
function makePlanets(): THREE.Mesh[] {
  // Distance from the middle, how big, and what colour. Ordered outermost
  // first, so reading this is reading the order they arrive in.
  const spec: { distance: number; radius: number; colour: number }[] = [
    { distance: 1150, radius: 70, colour: 0xd9a066 },
    { distance: 900, radius: 34, colour: 0x8fb8de },
    { distance: 720, radius: 96, colour: 0xc4643c },
    { distance: 560, radius: 26, colour: 0xe8d8b0 },
    { distance: 430, radius: 52, colour: 0x7a6fa8 },
    { distance: 330, radius: 18, colour: 0xb8b0a4 },
  ];

  return spec.map(({ distance, radius, colour }, i) => {
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 24, 24),
      // Transparent from the start, so the fade at the end has something to
      // work on — a material switched to transparent partway through is a
      // shader recompile at the exact moment the round is trying to begin.
      new THREE.MeshPhongMaterial({
        color: colour,
        shininess: 4,
        transparent: true,
        opacity: 1,
      }),
    );
    // Spread around the corridor rather than strung along one line: the angles
    // are fixed rather than random so that the fall is the same fall every
    // time. A different arrangement every round would be one more thing
    // changing under a player who is trying to learn the map.
    const around = (i * 2.399) % (Math.PI * 2);
    const above = Math.sin(i * 1.7) * 0.55;
    const ring = Math.cos(above);
    planet.position.set(
      Math.cos(around) * ring * distance,
      Math.sin(above) * distance,
      Math.sin(around) * ring * distance,
    );
    return planet;
  });
}
