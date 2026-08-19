import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import * as THREE from "three";
import type { GuessMapProps, MapHighlight } from "./mapTypes";
import { countryAt, useWorldShapes, type CountryFeature } from "../lib/worldShapes";
import { WORLD_TILES } from "../lib/mapTiles";
import {
  CLOUDS_TEXTURE,
  FLAT_OCEAN_TEXTURE,
  NIGHT_SKY_TEXTURE,
  TOPOLOGY_TEXTURE,
  WATER_TEXTURE,
} from "../lib/textures";
import MapZoomControls from "./MapZoomControls";

/**
 * The bench's globe: `GlobeMap` with three skins and a switch between them.
 *
 * A **copy** of the shipped globe rather than a flag inside it, which is the
 * bench rule — what is tried here can be got wrong without a real game being
 * got wrong with it. Everything below the skin is the shipped globe verbatim,
 * and is meant to stay that way: a copy that drifts is a copy that gets judged
 * instead of the thing it stands in for. Delete the file when the argument is
 * settled, and `textures.ts`'s bench block with it.
 *
 * The three, and what each is for:
 *
 * - **Tiles** — what SpotOn draws today, and the thing the other two have to
 *   beat. Sharp: NASA's grid goes to about 600 metres a pixel, so detail keeps
 *   arriving as you go in.
 * - **Tiles + sky** — the same globe with the **clouds and the starfield**
 *   added. Both are objects of their own, standing beside the globe rather
 *   than painted on it, so neither cares that the surface is made of tiles.
 *   This is the one that costs nothing: all the sharpness, most of the look.
 * - **Flat ocean** — MapTap's kind of globe. One photograph 8192 across, with
 *   the sea flattened to an even colour, plus the sky and a **shine on the
 *   water**.
 *
 * **What the third one can have that the first two can't, and why.** A shine
 * needs a material that knows what shininess is. three-slippy-map-globe builds
 * every tile as a `MeshLambertMaterial`, which has no specular term at all,
 * and three-globe hides the photographed sphere — the `MeshPhongMaterial` one,
 * which does — the moment a tile URL is set. So the shine and the bump map
 * belong to the photograph and can never be had on tiles, however they are
 * asked for. Everything else crosses over freely, which is the whole point of
 * the middle skin.
 *
 * **What it costs.** One photograph of the whole world is one photograph
 * however near you stand: 8192 across is about five kilometres to the pixel,
 * against 600 metres for the tiles, so zoom stops meaning anything long before
 * the tiles run out. The camera floor is set per skin for exactly that reason.
 * MapTap's own is the same 8193x4096, which is why their globe doesn't offer
 * deep zoom either — the look and the sharpness were never available together.
 *
 * **The flat sea is NASA's own, not something painted on.** The photograph is
 * `BlueMarble_ShadedRelief` where the game draws
 * `BlueMarble_ShadedRelief_Bathymetry`, and dropping the bathymetry is what
 * empties the ocean of ridges and trenches. Its blue is very dark, so the
 * colour is lifted with an **emissive map** — the same land-and-water mask the
 * shine uses, which adds light on water and none on land. A canvas repaint was
 * the obvious way and the wrong one: three 8192x4096 canvases is over 400 MB
 * of memory to change a colour the GPU can change for nothing.
 *
 * **Flat ocean takes about twenty seconds to appear, every time, and it is
 * NASA's end rather than ours.** That photograph is a WMS `GetMap`, which the
 * server *draws* on request: 17 seconds to the first byte, measured twice, and
 * then 2.4 MB to fetch. Nothing is cached at their end, so it is 17 seconds
 * again on the next flip. This is precisely why MapTap host their own
 * `hi-rez-v3.jpg` and why theirs is instant — **if this skin ever graduates,
 * the photograph gets pulled once and served from our own domain**, and the
 * live WMS call goes.
 *
 * The other skins go black for a second or two on a flip, which is the ordinary
 * cost: remounting throws the globe's textures away with the globe, so they
 * are fetched and decoded again. The obvious fix, `THREE.Cache.enabled`, is a
 * trap here: it is global, and the tiled skins load their tiles through the
 * same loader, so switching it on would hold every tile ever fetched in memory
 * for as long as the tab is open.
 */const MAX_ALTITUDE = 3.5; // farthest button zoom

/** Which globe is being looked at. `tiles` is what the games ship today. */
type Skin = "tiles" | "sky" | "maptap";

/**
 * The switch's own labels, and the order they stand in — cheapest first, so
 * reading left to right is reading what each addition costs.
 */
const SKINS: { id: Skin; name: string; note: string }[] = [
  { id: "tiles", name: "Tiles", note: "what ships today" },
  { id: "sky", name: "Tiles + sky", note: "sharp · clouds · stars" },
  { id: "maptap", name: "Flat ocean", note: "8k photo · shine · sky" },
];

/**
 * How near the camera may get to the photographed globe.
 *
 * 8192 pixels across the world is about five kilometres to each one, so past
 * this there is nothing left to resolve and going closer only magnifies them.
 * Half what a 4096 photograph could stand, because twice the pixels is twice
 * as near before they show. The tiled skins keep the imagery's own floor
 * (`WORLD_TILES.minAltitude`), which is far deeper — that is the trade.
 */
const PHOTO_MIN_ALTITUDE = 0.18;

/**
 * The colour the flat sea is lifted to.
 *
 * `BlueMarble_ShadedRelief` has an even ocean already, but a nearly black one;
 * MapTap's is a mid navy you can actually see a coastline against. Added as
 * emissive light through the water mask rather than painted into the
 * photograph, so it can be tuned by changing this line.
 */
const OCEAN_BLUE = 0x16336e;

/** How far above the surface the clouds hang, in globe radii. */
const CLOUD_ALTITUDE = 0.004;

/**
 * Degrees a second the cloud shell turns, against the world rather than with
 * it. Slow enough to be a drift rather than a spin — at this rate a cloud
 * crosses a country in about a minute, and a round lasts less than that.
 */
const CLOUD_SPIN = -0.2;

/** Constant, so the globe isn't handed a new one to re-apply on every render. */
const noSide = () => "rgba(0,0,0,0)";

interface ScrapbookGlobeProps extends GuessMapProps {
  /** Draw the country outlines over the terrain. */
  borders?: boolean;
  /**
   * ISO alpha-2 codes to highlight once the answer is out. Usually the one
   * country being asked about, but a currency lights up everywhere it's spent.
   */
  highlightCodes?: string[] | null;
  /**
   * The one country the player picked instead, washed red against the green.
   * Unlike `highlights` this changes nothing else about the reveal: the pins
   * and the arc between them are still the story, and this only says which
   * country the near one is standing in.
   */
  missCode?: string | null;
  /**
   * Shapes to paint once the answer is out, for a mode whose answer isn't a
   * place. Given these, the globe reveals by colouring the world in rather
   * than by dropping pins: no markers, no arc between them, and it settles far
   * enough out to see the whole band rather than diving at one end of it.
   */
  highlights?: MapHighlight[] | null;
}

/** Green for the clock that was asked about, red for the one picked instead. */
const TONE_CAP = { right: "rgba(34,197,94,0.5)", wrong: "rgba(225,29,72,0.5)" };
const TONE_LINE = { right: "#22c55e", wrong: "#fb7185" };

/** Minimal shape of the three OrbitControls we touch (three ships no types here). */
interface OrbitLike {
  enablePan: boolean;
  minDistance: number;
  maxDistance: number;
  rotateSpeed: number;
  zoomSpeed: number;
}

interface PointDatum {
  lat: number;
  lng: number;
  color: string;
}

export default function ScrapbookGlobe({
  onGuess,
  guess,
  answer,
  disabled = false,
  borders = false,
  highlightCodes = null,
  missCode = null,
  highlights = null,
}: ScrapbookGlobeProps) {
  // Which globe. The texture one is what's being looked at, so it opens; the
  // tiled one is here to be flipped back to, since the question is only ever
  // "better than what we ship?" and that is not answerable from memory.
  const [skin, setSkin] = useState<Skin>("sky");
  // Counted rather than flagged, so that flipping the skin — which remounts
  // the globe, and with it a second ready — re-runs the cloud effect below
  // instead of leaving it looking at a scene that has been thrown away.
  const [readyCount, setReadyCount] = useState(0);
  // How close the camera may get: the imagery's own limit, since a source runs
  // out of pictures at its own depth and there is nothing to see past it. A
  // photograph runs out very much sooner than the tiles do.
  // Two questions the skins answer between them, and every difference below
  // comes off one or the other: is the surface made of tiles, and is there a
  // sky around it. The middle skin exists because those are independent.
  const tiled = skin !== "maptap";
  const sky = skin !== "tiles";
  const minAltitude = tiled ? WORLD_TILES.minAltitude : PHOTO_MIN_ALTITUDE;
  // Painting the answer on rather than pinning it: see `highlights`.
  const painted = !!highlights?.length;
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const shapes = useWorldShapes();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 520 });
  // Land is the only valid guess, so the cursor says so while it's over some.
  const [overLand, setOverLand] = useState(false);

  // The canvas is the whole layer it's given, which is the whole window.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * The shine, as a material handed in rather than one fetched back out.
   *
   * `globeMaterial` is a **prop** on react-globe.gl and not one of the methods
   * it binds to the ref — the bound list is `pointOfView`, `scene`, `camera`,
   * `controls`, `getGlobeRadius` and a few more, and asking the ref for the
   * material throws. So the material is ours, and three-globe hangs the day
   * texture and the bump map on whatever material the globe is wearing when
   * those props are applied, which is this one.
   *
   * Rebuilt whenever the skin changes rather than kept for the component's
   * life, because three-globe disposes the globe's material when the globe
   * goes — and the globe goes on every flip. Held across one, the second visit
   * to this skin would dress the world in a material that had already been
   * thrown away.
   *
   * The mask does the work: white at sea and black on land, so the ocean takes
   * a highlight and every coastline stays matte. Grey and dull rather than
   * white and glassy — a hard highlight on water reads as polished plastic,
   * and what is wanted is the sheen off an ocean seen from orbit, which is
   * barely there at all.
   */
  const oceanMaterial = useMemo(() => {
    if (tiled) return undefined;
    const material = new THREE.MeshPhongMaterial();
    material.specular = new THREE.Color(0x2b3a4a);
    material.shininess = 12;
    // Lifts the flat sea to a blue you can see, and nothing else: emissive
    // light is emissive colour times emissive map, and the map is black over
    // every inch of land. So the continents are untouched and the ocean glows
    // evenly — which is also why it doesn't go dark round the far limb, the
    // way MapTap's doesn't either.
    material.emissive = new THREE.Color(OCEAN_BLUE);
    new THREE.TextureLoader().load(WATER_TEXTURE, (mask) => {
      // One download doing two jobs: white at sea and black on land is both
      // "where does the light catch" and "where is the sea".
      material.specularMap = mask;
      material.emissiveMap = mask;
      material.needsUpdate = true;
    });
    return material;
  }, [tiled]);

  // Tune the orbit controls and set an opening view once the globe is ready.
  const handleReady = () => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls() as unknown as OrbitLike;
    controls.enablePan = false;
    // Globe radius is 100, so distance 101 is an altitude of 0.01 — right down
    // on the surface. The drag limit follows the same floor the buttons use,
    // rather than letting a scroll wheel go where a button won't.
    controls.minDistance = 100 + minAltitude * 100;
    controls.maxDistance = 520; // how far you can zoom out
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 1; // a touch faster so deep zoom isn't tedious
    // Close enough that the globe fills most of the window it now owns.
    g.pointOfView({ lat: 20, lng: 0, altitude: 2 });
    // Counted last, and everything above it is the shipped globe's own
    // opening. Anything that throws in here takes the rest of the function
    // with it, and the rest of the function is the camera: a first attempt at
    // the shine went at the top of this and left the texture skin sitting at
    // three-globe's default distance, which read as the skin being wrong
    // rather than as one line above it having thrown.
    setReadyCount((n) => n + 1);
  };

  // Zoom by changing the camera altitude, keeping the current lat/lng centred.
  const zoomBy = (factor: number) => {
    const g = globeRef.current;
    if (!g) return;
    const pov = g.pointOfView();
    const altitude = Math.min(
      MAX_ALTITUDE,
      Math.max(minAltitude, pov.altitude * factor),
    );
    g.pointOfView({ altitude }, 350);
  };

  // The clouds: a second shell just above the surface, turning the other way.
  //
  // Its own sphere rather than anything three-globe offers, because the whole
  // point is that it moves independently — one texture on the globe can only
  // ever turn with the globe, and two shells drifting apart is what reads as
  // depth. Added to the scene and not to the globe object, so the drag that
  // spins the world doesn't carry the weather round with it.
  //
  // Torn down completely on the way out. Skinning back to tiles throws the
  // whole scene away, and a mesh, a geometry and a five-megabyte texture left
  // holding on to it is a leak that would be paid for on every flip.
  useEffect(() => {
    const g = globeRef.current;
    if (!sky || !g || !readyCount) return;
    const scene = g.scene();
    const radius = g.getGlobeRadius();
    let clouds: THREE.Mesh | null = null;
    let frame = 0;
    let last = performance.now();
    let dropped = false;

    new THREE.TextureLoader().load(CLOUDS_TEXTURE, (texture) => {
      // The round can end, or the skin flip, while five megabytes are still on
      // their way. Arriving into a scene nobody is looking at any more, the
      // texture is dropped rather than hung on the globe.
      if (dropped) {
        texture.dispose();
        return;
      }
      clouds = new THREE.Mesh(
        new THREE.SphereGeometry(radius * (1 + CLOUD_ALTITUDE), 75, 75),
        // Not written into the depth buffer: the cloud shell wraps the whole
        // globe, and writing depth it hides the pins and the arc standing on
        // the surface underneath it.
        new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        }),
      );
      scene.add(clouds);
      // Turned by the clock rather than by the frame, so the weather moves at
      // the same speed on a 60 Hz laptop and a 144 Hz monitor. Per frame, the
      // three-globe example's own way, it is more than twice as fast on one as
      // on the other.
      const drift = (now: number) => {
        const seconds = (now - last) / 1000;
        last = now;
        if (clouds) clouds.rotation.y += ((CLOUD_SPIN * seconds) / 180) * Math.PI;
        frame = requestAnimationFrame(drift);
      };
      frame = requestAnimationFrame(drift);
    });

    return () => {
      dropped = true;
      cancelAnimationFrame(frame);
      if (!clouds) return;
      scene.remove(clouds);
      clouds.geometry.dispose();
      const material = clouds.material as THREE.MeshPhongMaterial;
      material.map?.dispose();
      material.dispose();
    };
  }, [sky, readyCount]);

  // Fly to the true location when the answer is revealed — and, where the
  // answer is painted across half the world rather than pinned to one spot,
  // hang back far enough to take it in.
  //
  // `readyCount` is in here where the shipped globe has no such dependency:
  // flipping the skin builds a new globe looking at lat 20 from altitude 2,
  // and the one moment somebody wants to flip is at the reveal, with the pins
  // and the arc on screen. Without it the comparison throws away the thing
  // being compared.
  useEffect(() => {
    if (answer && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: answer.lat, lng: answer.lng, altitude: painted ? 2.4 : 1.6 },
        1200,
      );
    }
  }, [answer, painted, readyCount]);

  const points = useMemo<PointDatum[]>(() => {
    const pts: PointDatum[] = [];
    if (painted) return pts;
    if (guess) pts.push({ lat: guess.lat, lng: guess.lng, color: "#e11d48" });
    if (answer) pts.push({ lat: answer.lat, lng: answer.lng, color: "#22c55e" });
    return pts;
  }, [guess, answer, painted]);

  // Country outlines: every country when borders are on, plus the answer's own
  // country picked out once the round is scored.
  const codeOf = (f: CountryFeature) =>
    (f.properties?.ISO_A2_EH || f.properties?.ISO_A2 || "").toLowerCase();
  // Keyed by value, not by the array's identity, so a caller building the list
  // inline doesn't hand the globe a new set — and with it a re-style of all 242
  // countries — on every render.
  const litKey = answer ? (highlightCodes ?? []).join(",").toLowerCase() : "";
  const lit = useMemo(
    () => new Set(litKey ? litKey.split(",") : []),
    [litKey],
  );
  // Only once the round is over, which the answer's arrival is the sign of.
  const miss = answer ? (missCode ?? "").toLowerCase() : "";

  /**
   * These three have to keep the same identity between renders. The globe
   * re-applies an accessor to all 242 countries the moment it's handed a new
   * one, and written inline they were new on every render — including the ones
   * from following the pointer on and off land, which happens constantly while
   * you drag. Re-styling the whole world several times a second is what was
   * stamping on the flight out to the answer.
   */
  // Which of the polygons in the scene are painted patches rather than
  // countries, and in which colour. Keyed by the feature object itself, which
  // the mode keeps still between renders for exactly this reason.
  const toneOf = useMemo(() => {
    const map = new Map<object, "right" | "wrong">();
    for (const h of highlights ?? []) map.set(h.feature, h.tone);
    return map;
  }, [highlights]);

  const polygonCap = useCallback(
    (d: object) => {
      const tone = toneOf.get(d);
      if (tone) return TONE_CAP[tone];
      const code = codeOf(d as CountryFeature);
      if (lit.has(code)) return "rgba(34,197,94,0.45)";
      return code && code === miss ? TONE_CAP.wrong : "rgba(0,0,0,0)";
    },
    [lit, miss, toneOf],
  );
  const polygonStroke = useCallback(
    (d: object) => {
      const tone = toneOf.get(d);
      if (tone) return TONE_LINE[tone];
      const code = codeOf(d as CountryFeature);
      if (lit.has(code)) return "#22c55e";
      if (code && code === miss) return TONE_LINE.wrong;
      return borders ? "#f8fafc" : "";
    },
    [lit, miss, borders, toneOf],
  );
  // A hair above the countries they were cut out of, so the two don't fight
  // over the same pixels — and still flat enough that a click at a shallow
  // angle lands where the cursor is.
  const polygonAltitude = useCallback(
    (d: object) => (toneOf.has(d) ? 0.004 : 0.002),
    [toneOf],
  );

  // Every country is always in the scene: the polygons are what makes land
  // clickable (they sit in front of the globe, so they take the click), and
  // whether they're *drawn* is just a matter of their stroke colour below.
  // Drawn from the coarse copy — at full 1:50m detail the globe is a slideshow,
  // and the scoring never looks at these anyway.
  const polygons = useMemo<object[]>(
    () => [
      ...(shapes ? shapes.globeFeatures : []),
      ...(highlights ?? []).map((h) => h.feature),
    ],
    [shapes, highlights],
  );

  const arcs = useMemo(() => {
    if (painted) return [];
    if (guess && answer) {
      return [
        {
          startLat: guess.lat,
          startLng: guess.lng,
          endLat: answer.lat,
          endLng: answer.lng,
        },
      ];
    }
    return [];
  }, [guess, answer, painted]);

  return (
    <div
      ref={wrapRef}
      className="globe-wrap"
      style={{ cursor: disabled ? "default" : overLand ? "pointer" : "grab" }}
    >
      <Globe
        // Remounted outright when the skin changes rather than having its
        // props swapped under it. Switching a live globe between a tile engine
        // and a photograph leaves half of each in the scene — and a bench is
        // read by eye, so a skin has to be the whole of what it claims to be.
        key={skin}
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        // Stars, on the skin that has them. Free next to the rest of this, and
        // the single thing that most tells MapTap's globe from ours at a
        // glance: theirs stands in space and ours stands on the page.
        backgroundImageUrl={sky ? NIGHT_SKY_TEXTURE : undefined}
        // The surface, and the whole of the trade. Tiles resolve as you go in
        // and can never shine; the photograph shines, takes a bump map, and is
        // ten kilometres to the pixel wherever you stand. Only one of the two
        // is ever set — given a tile URL three-globe hides the photographed
        // sphere, so passing both would download a texture nobody sees.
        globeTileEngineUrl={tiled ? WORLD_TILES.url : undefined}
        globeImageUrl={tiled ? undefined : FLAT_OCEAN_TEXTURE}
        // Undefined on the tiled skin, which three-globe reads as "leave the
        // material alone" — its setter tests for exactly that.
        globeMaterial={oceanMaterial}
        // Relief the photograph hasn't got: it is a picture taken straight
        // down, so without this the Andes are a colour rather than a ridge.
        bumpImageUrl={tiled ? undefined : TOPOLOGY_TEXTURE}
        // How deep to ask. The service answers 400 past its last level and the
        // engine draws nothing where no tile arrived, so leaving this at the
        // default of 17 doesn't buy detail off a shallower service — it strips
        // the globe bare as soon as you go too close. Spread because it is
        // three-globe's prop, forwarded but not yet in react-globe.gl's types.
        {...({ globeTileEngineMaxLevel: WORLD_TILES.maxLevel } as object)}
        showAtmosphere
        atmosphereColor="#7fb2ff"
        // Wider on the photographed skin, where there are stars behind it to
        // sit against. Over the page's flat dark blue the same halo just looks
        // like a smudge round the edge.
        atmosphereAltitude={sky ? 0.25 : 0.18}
        onGlobeReady={handleReady}
        onGlobeClick={({ lat, lng }) => {
          // The bare globe is the sea. It's only a valid guess when the country
          // shapes never arrived — without them there'd be nothing to click.
          if (!disabled && !shapes) onGuess({ lat, lng });
        }}
        // Which polygon the ray struck is no use on its own: a click on open
        // ocean carries on through the globe and comes out of the far side,
        // where it hits whichever country happens to be there. That fired this
        // handler for Saudi Arabia over a point in the Atlantic. So the polygon
        // is ignored and the spot itself is asked what country it's in — the
        // same question the flat map asks, and the one the scoring will ask.
        onPolygonClick={(_polygon, _event, { lat, lng }) => {
          if (disabled) return;
          const c = { lat, lng };
          if (countryAt(shapes, c)) onGuess(c);
        }}
        onPolygonHover={(polygon) => setOverLand(!!polygon)}
        polygonsData={polygons}
        // Kept as flat to the surface as the stroke allows: the polygons are
        // what you click, so the further they float the further a click at a
        // shallow angle lands from the spot under the cursor. One height for
        // every country, revealed or not — lifting the revealed one was a
        // rebuild of its geometry at exactly the moment the camera starts
        // moving, and the green wash marks it perfectly well without. Only the
        // painted patches sit higher, and only because they overlap.
        polygonAltitude={polygonAltitude}
        polygonCapColor={polygonCap}
        polygonSideColor={noSide}
        // An empty colour draws no outline at all, which is how the invisible
        // click targets stay invisible when borders are off.
        polygonStrokeColor={polygonStroke}
        polygonsTransitionDuration={0}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius={0.55}
        pointsMerge={false}
        pointsTransitionDuration={0}
        arcsData={arcs}
        arcColor={() => "#c084fc"}
        arcStroke={0.6}
        arcAltitudeAutoScale={0.3}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={2500}
      />
      <MapZoomControls
        onZoomIn={() => zoomBy(0.6)}
        onZoomOut={() => zoomBy(1 / 0.6)}
      />
      {/* The switch, and it is on the map rather than on the setup screen
          because the two skins have to be compared in the same second and on
          the same view. A choice made before the round starts is a choice
          judged from memory. */}
      <div className="bench-skins">
        <span className="bench-skins-label">Globe</span>
        {SKINS.map((s) => (
          <button
            key={s.id}
            className={`bench-skin${skin === s.id ? " is-active" : ""}`}
            onClick={() => setSkin(s.id)}
            aria-pressed={skin === s.id}
          >
            <span className="bench-skin-name">{s.name}</span>
            <span className="muted bench-skin-note">{s.note}</span>
          </button>
        ))}
      </div>
      {!shapes && <p className="map-loading muted">Loading the world…</p>}
    </div>
  );
}
