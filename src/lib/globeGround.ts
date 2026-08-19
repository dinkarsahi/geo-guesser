import * as THREE from "three";

/**
 * The sea under the tiles: one plain sphere, a hair inside the globe.
 *
 * It exists because of what a tiled globe looks like before its tiles arrive.
 * Given a tile engine, three-globe hides the photographed sphere outright
 * (`globeObj.visible = !globeTileEngineUrl`), so until the first squares come
 * back off the network there is no Earth in the scene at all — the arrival
 * opened on a ring of atmosphere with nothing inside it, and then filled in
 * square by square like a page loading. That was the messiest thing about the
 * beginning of a round, and no amount of easing on the camera touches it.
 *
 * So: a sphere in deep ocean blue, drawn under everything the tile engine
 * lays down. The world is the right shape and the right colour from the first
 * frame, and the tiles resolve *onto* it rather than out of nothing — which
 * reads as detail arriving rather than as the planet being assembled.
 *
 * It stays for the whole game rather than being taken down at the landing,
 * and that is worth its few hundred triangles: tiles are dropped and refetched
 * every time the zoom crosses a level, and a gap mid-round shows sea now
 * instead of a hole through the planet.
 *
 * **Deliberately unlit.** `MeshBasicMaterial`, so it owes nothing to where the
 * scene's light happens to be. Lambert like the tiles themselves, it would
 * carry a night side — and a half-dark planet that then brightens as the
 * pictures land is a worse first impression than the hole it replaced.
 */
export function addGround(scene: THREE.Scene, globeRadius: number): () => void {
  const ground = new THREE.Mesh(
    // Just inside the shell the tiles are laid on, so there is nothing for the
    // two to fight over: every tile wins its pixels outright rather than
    // flickering against a surface at the same radius.
    new THREE.SphereGeometry(globeRadius * 0.998, 64, 48),
    new THREE.MeshBasicMaterial({
      // Blue Marble's deep water, read off the imagery rather than picked: the
      // point is that the tiles land on something the same colour they are, so
      // the joins don't announce themselves.
      color: 0x0d2b46,
    }),
  );
  // Invisible to the raycaster, and this is not decoration. A guess on the
  // globe is a ray through the scene, and a sphere the size of the world
  // standing in front of the tiles would take every click before the polygons
  // or the globe itself could — which is to say it would swallow the game.
  ground.raycast = () => {};
  scene.add(ground);

  return () => {
    scene.remove(ground);
    ground.geometry.dispose();
    (ground.material as THREE.Material).dispose();
  };
}
