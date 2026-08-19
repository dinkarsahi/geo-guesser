import * as THREE from "three";
import { INTRO_MS } from "./useGame";

/**
 * The arrival: a fall through space that ends at the Earth.
 *
 * It exists because of a gap nobody designed — press Start and the map is
 * there before its imagery is, so the first thing a round showed was an empty
 * dark rectangle, or a globe that popped into being a moment after the
 * question. The tiles have to travel and there is nothing to be done about
 * that; what can be done is make the wait part of the game rather than a pause
 * in front of it.
 *
 * **Once a game, before the first round, and never between rounds** — by then
 * the map is drawn and there is nothing left to cover. `useGame` owns that
 * window; this only fills it.
 *
 * So the camera starts a long way out and falls inward while the world turns
 * under it, and a handful of planets slide past on the way. **The planets are
 * not animated.** They are put in the corridor the camera is about to fly
 * down, and the camera's own motion sweeps them past — parallax rather than
 * choreography, which is both less code and more convincing, since near ones
 * genuinely pass faster than far ones.
 *
 * **Everything here is drawn rather than downloaded** — the planets' surfaces
 * are painted onto canvases at load, a few dozen fills apiece. That is the
 * whole trick: this exists to cover a download, so anything in it that had to
 * download first would be covering itself. The one thing on screen that does
 * have to travel is the Earth, and by the time the camera is near enough for
 * its surface to matter, the tiles have had three seconds they didn't have.
 */

/**
 * How long the fall takes — the intro window itself, so the two can never
 * disagree about when the game begins.
 *
 * **Why a duel can afford it.** A room's rounds are worked out by arithmetic
 * from `match.startAt`, so a *local* pause could never hold the clock: it
 * would simply cost that player the seconds they spent watching, and only the
 * player whose tiles were slow. `matchOptions` moves the room's start back by
 * this instead, so the pause is inside the timetable — every device shifts by
 * the same constant and nobody's thirty seconds is any shorter.
 */
export const FLIGHT_MS = INTRO_MS;

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
  /**
   * How long the fall has, which is however much of the intro is left rather
   * than a fixed length. A globe takes a second or two to build before it can
   * animate anything, so a fixed fall started at that point would still be
   * falling after the round had opened — the world rushing past while the
   * clock ran. Given what's left, it lands on the moment the round begins.
   */
  ms: number = FLIGHT_MS,
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
  const opening = requestAnimationFrame(() => pointOfView(target, ms));

    // What a material was showing before the fade began, so a disc that starts
  // three-quarters transparent doesn't jump to fully solid on the first frame
  // of being taken away.
  const opacities = new WeakMap<THREE.Material, number>();
  const baseOpacity = (material: THREE.Material) => {
    const known = opacities.get(material);
    if (known !== undefined) return known;
    opacities.set(material, material.opacity);
    return material.opacity;
  };

  let fade = 0;
  const landed = window.setTimeout(() => {
    controls.maxDistance = homeDistance;
    // Faded rather than cut. At the end of the fall a planet can be square in
    // front of the player, and having one blink out of existence is a worse
    // interruption than the pause this was built to hide.
    const startedAt = performance.now();
    const dim = (now: number) => {
      const gone = Math.min(1, (now - startedAt) / FADE_MS);
      // Walked rather than reached into: a planet is a group now, and the
      // ringed one keeps its disc in a second mesh that has to dim with it.
      for (const planet of planets) {
        planet.traverse((part) => {
          const material = (part as THREE.Mesh).material as
            | THREE.MeshPhongMaterial
            | undefined;
          if (material) material.opacity = (1 - gone) * baseOpacity(material);
        });
      }
      if (gone < 1) fade = requestAnimationFrame(dim);
      else drop();
    };
    fade = requestAnimationFrame(dim);
  }, ms);

  let dropped = false;
  const drop = () => {
    if (dropped) return;
    dropped = true;
    for (const planet of planets) {
      scene.remove(planet);
      planet.traverse((part) => {
        const mesh = part as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose();
      });
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
 * Not the solar system in order, and deliberately not labelled as one — a
 * player who counted them and found eight would be owed an ordering nobody is
 * going to give them. What they have to be is recognisable *as planets*: a
 * banded gas giant, a ringed one, a rusty rock, an ice giant, a cratered moon.
 * Plain coloured balls read as marbles, which is what these were until they
 * were given surfaces.
 *
 * **Every surface is painted here, at load, onto a canvas** — 512 by 256, a
 * few dozen fills. Nothing is fetched, which is the whole point: this animation
 * exists to cover a download, so anything in it that had to download first
 * would be covering itself.
 *
 * Placed rather than animated. The camera falls from fourteen globe radii to
 * two along an arc, so anything standing between those two distances sweeps
 * past on its own, and the near ones sweep faster — which is the thing that
 * sells the motion, and is free.
 */
type Surface = "bands" | "rings" | "rust" | "ice" | "rock";

interface PlanetSpec {
  /** How far from the middle it stands, in the same units as the globe's 100. */
  distance: number;
  radius: number;
  surface: Surface;
  /** How far the poles are tipped, which is what stops them looking stamped. */
  tilt: number;
}

const PLANETS: PlanetSpec[] = [
  { distance: 1150, radius: 74, surface: "bands", tilt: 0.05 },
  { distance: 900, radius: 30, surface: "ice", tilt: -0.4 },
  { distance: 720, radius: 96, surface: "rings", tilt: 0.47 },
  { distance: 560, radius: 26, surface: "rock", tilt: 0.1 },
  { distance: 430, radius: 48, surface: "rust", tilt: 0.44 },
  { distance: 330, radius: 18, surface: "rock", tilt: -0.2 },
];

function makePlanets(): THREE.Object3D[] {
  return PLANETS.map((spec, i) => {
    const material = new THREE.MeshPhongMaterial({
      map: paintSurface(spec.surface),
      shininess: spec.surface === "ice" ? 22 : 3,
      // Transparent from the start, so the fade at the end has something to
      // work on — a material switched to transparent partway through is a
      // shader recompile at the exact moment the round is trying to begin.
      transparent: true,
      opacity: 1,
    });
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(spec.radius, 32, 24),
      material,
    );

    // The body and its rings turn together, so the whole object is tipped
    // rather than the sphere alone. Upright, a ringed planet looks like a
    // diagram of one.
    const planet = new THREE.Group();
    planet.add(body);
    planet.rotation.z = spec.tilt;
    planet.rotation.x = spec.tilt * 0.6;

    if (spec.surface === "rings") planet.add(makeRings(spec.radius));

    // Spread around the corridor rather than strung along one line. The angles
    // are fixed rather than random so that the fall is the same fall every
    // time: a different arrangement every round would be one more thing
    // changing under a player who is trying to learn the map.
    const around = (i * 2.399) % (Math.PI * 2);
    const above = Math.sin(i * 1.7) * 0.55;
    const ring = Math.cos(above);
    planet.position.set(
      Math.cos(around) * ring * spec.distance,
      Math.sin(above) * spec.distance,
      Math.sin(around) * ring * spec.distance,
    );
    return planet;
  });
}

/**
 * The flat disc round the ringed one.
 *
 * Drawn as a ring of its own rather than as part of the sphere, with a gap
 * between the two — the gap is most of what makes it read as Saturn rather
 * than as a ball with a stripe. `DoubleSide` because the camera passes it and
 * sees the underneath, and a ring that vanishes when you get past it is worse
 * than no ring.
 */
function makeRings(radius: number): THREE.Mesh {
  const rings = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.45, radius * 2.25, 64),
    new THREE.MeshPhongMaterial({
      color: 0xd8c9a8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    }),
  );
  rings.rotation.x = Math.PI / 2;
  return rings;
}

/**
 * A planet's surface, painted onto a canvas and wrapped round a sphere.
 *
 * Latitude bands are horizontal stripes here, because the texture is
 * equirectangular: a stripe across the image is a belt around the world, which
 * is exactly what a gas giant's clouds are. The rocks get the same treatment
 * plus craters, which are simply darker discs with a lighter rim.
 */
function paintSurface(surface: Surface): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const paint = canvas.getContext("2d")!;

  // Every number below is fixed rather than random, for the same reason the
  // positions are: the arrival should be the same arrival every round.
  const palettes: Record<Surface, { base: string; bands: string[] }> = {
    bands: { base: "#c9a227", bands: ["#e3c98f", "#b07d46", "#d9b26a", "#8f5f33"] },
    rings: { base: "#d9c9a3", bands: ["#efe3c4", "#c8b189", "#e5d6ae", "#b39a72"] },
    rust: { base: "#a8462a", bands: ["#c05a34", "#8e3a22", "#b8583a", "#7d3520"] },
    ice: { base: "#3f7fb5", bands: ["#5b9fd0", "#356f9f", "#4d8ec2", "#2c5f8a"] },
    rock: { base: "#8d8880", bands: ["#9d978e", "#7e7970", "#948e85", "#736e66"] },
  };
  const { base, bands } = palettes[surface];

  paint.fillStyle = base;
  paint.fillRect(0, 0, width, height);

  // Belts of uneven width, so the banding doesn't read as a barcode.
  let y = 0;
  let step = 0;
  while (y < height) {
    const thickness = 8 + ((step * 13) % 23);
    paint.fillStyle = bands[step % bands.length];
    paint.globalAlpha = 0.55;
    paint.fillRect(0, y, width, thickness);
    y += thickness;
    step++;
  }
  paint.globalAlpha = 1;

  if (surface === "bands") {
    // The one storm that makes a banded planet recognisable rather than
    // generic. Kept to a third of the way down, where Jupiter's sits.
    paint.fillStyle = "#c4553a";
    paint.beginPath();
    paint.ellipse(width * 0.62, height * 0.62, 34, 17, 0, 0, Math.PI * 2);
    paint.fill();
  }

  if (surface === "rock" || surface === "rust") {
    for (let i = 0; i < 46; i++) {
      const cx = ((i * 137) % width) + 6;
      const cy = ((i * 89) % height) + 4;
      const r = 3 + ((i * 7) % 11);
      paint.globalAlpha = 0.35;
      paint.fillStyle = "#000";
      paint.beginPath();
      paint.arc(cx, cy, r, 0, Math.PI * 2);
      paint.fill();
      paint.globalAlpha = 0.25;
      paint.strokeStyle = "#fff";
      paint.lineWidth = 1.5;
      paint.beginPath();
      paint.arc(cx, cy, r, Math.PI * 0.9, Math.PI * 1.9);
      paint.stroke();
    }
    paint.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
