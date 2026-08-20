import { useMemo, useState } from "react";
import LondonMap from "../components/LondonMap";
import { loadSettings } from "../lib/preferences";
import { zoneLabel, type TubeStation } from "../data/tube";
import { tflConnections, tflLineDefs, tflStationsRaw } from "../data/tubeDataTfl";
import {
  LONDON_BOROUGHS_URL,
  SHIPPED_TUBE,
  type TubeData,
} from "../data/tubeSources";

/**
 * The bench: the tube network drawn from TfL's own data, beside the one we ship.
 *
 * **What is on trial here is where the data came from**, which is items C1 and
 * C2 of the ad-readiness register. The station table the game plays on was
 * generated from a third-party GitHub dataset that declares no licence, and
 * the borough outlines are fetched live from a second one. Neither grants
 * permission to redistribute, and UK database right sits on top of copyright
 * for a compilation like the first. Both originate with public bodies who
 * publish the same thing under terms that do grant it — TfL's open data, and
 * the ONS boundary set under the Open Government Licence.
 *
 * So this is not a new feature being tried. It is the same map from a clean
 * source, put next to the one we have so the differences can be *seen* rather
 * than taken on trust — because there are differences, and some of them reach
 * the game.
 *
 * **It hands the real `LondonMap` a second dataset rather than copying it.**
 * That departs from the usual rule that a bench duplicates what it tests, and
 * deliberately: the renderer is not what is being judged, so it has to be
 * identical on both sides, which one shared component gives by construction
 * and a duplicate only promises. See `TubeData`.
 */

/** A station with a fact, which is all `TubeStation` wants beyond the raw row. */
const withFact = (s: (typeof tflStationsRaw)[number]): TubeStation => ({
  ...s,
  fact: `${s.name} is in ${zoneLabel(s.zone)}.`,
});

const TFL_TUBE: TubeData = {
  stations: tflStationsRaw.map(withFact),
  connections: tflConnections,
  lines: tflLineDefs,
  coords: Object.fromEntries(tflStationsRaw.map((s) => [s.name, { lat: s.lat, lng: s.lng }])),
  boroughUrl: LONDON_BOROUGHS_URL,
};

/** What changed, worked out from the two sets rather than written down. */
function useDifferences() {
  return useMemo(() => {
    const ship = new Map(SHIPPED_TUBE.stations.map((s) => [s.name, s]));
    const tfl = new Map(TFL_TUBE.stations.map((s) => [s.name, s]));
    const gained = [...tfl.keys()].filter((n) => !ship.has(n)).sort();
    const lost = [...ship.keys()].filter((n) => !tfl.has(n)).sort();
    const common = [...ship.keys()].filter((n) => tfl.has(n));

    // Metres between the same station in the two sets.
    const moved = common
      .map((n) => {
        const a = ship.get(n)!;
        const b = tfl.get(n)!;
        const R = 6371000;
        const rad = (d: number) => (d * Math.PI) / 180;
        const dLat = rad(b.lat - a.lat);
        const dLng = rad(b.lng - a.lng);
        const h =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
        return { name: n, m: 2 * R * Math.asin(Math.sqrt(h)) };
      })
      .sort((x, y) => y.m - x.m);

    const zones = common
      .filter((n) => ship.get(n)!.zone !== tfl.get(n)!.zone)
      .map((n) => ({ name: n, from: ship.get(n)!.zone, to: tfl.get(n)!.zone }));

    return {
      gained,
      lost,
      common: common.length,
      median: moved[Math.floor(moved.length / 2)]?.m ?? 0,
      worst: moved.slice(0, 3),
      zones,
    };
  }, []);
}

export default function ScrapbookTube({ onExit }: { onExit: () => void }) {
  const [source, setSource] = useState<"shipped" | "tfl">("shipped");
  const [setup] = useState(loadSettings);
  const d = useDifferences();
  const data = source === "shipped" ? SHIPPED_TUBE : TFL_TUBE;

  return (
    <div className="menu setup bench">
      <h1>Where the tube data comes from</h1>
      <p className="muted menu-sub h2h-rules">
        The same network, drawn twice: the dataset the game ships with, and one
        rebuilt from Transport for London's own open data. Nothing here is
        scored and nothing is filed — it is here to be looked at before the
        swap is made.
      </p>

      {/* The switch sits on the map, because two versions have to be judged in
          the same second on the same view — a choice made on a screen before
          this one is judged from memory. */}
      <div className="bench-map">
        <div className="bench-switch">
          <button
            className={`bench-pick${source === "shipped" ? " is-on" : ""}`}
            onClick={() => setSource("shipped")}
          >
            What we ship
          </button>
          <button
            className={`bench-pick${source === "tfl" ? " is-on" : ""}`}
            onClick={() => setSource("tfl")}
          >
            From TfL
          </button>
        </div>
        <LondonMap
          data={data}
          dark={setup.tubeDark}
          onGuess={() => {}}
          guess={null}
          answer={null}
          disabled
          arriveAt={0}
        />
      </div>

      <div className="bench-notes">
        <p>
          <strong>{SHIPPED_TUBE.stations.length}</strong> stations shipped ·{" "}
          <strong>{TFL_TUBE.stations.length}</strong> from TfL · {d.common} in both
        </p>
        <p>
          <strong>Stations TfL has that we don't ({d.gained.length}):</strong>{" "}
          {d.gained.join(", ") || "none"}
        </p>
        <p>
          <strong>Names that change ({d.lost.length}):</strong>{" "}
          {d.lost.join(", ") || "none"}
        </p>
        <p>
          <strong>How far the shared stations move:</strong> {Math.round(d.median)} m in
          the middle of the pack, worst{" "}
          {d.worst.map((w) => `${w.name} ${Math.round(w.m)} m`).join(", ")}.
        </p>
        <p>
          {/* This is the one that reaches the score: the Mind the Gap circle is
              sized off the zone, so a zone that moves moves a radius. */}
          <strong>Fare zones that disagree ({d.zones.length}):</strong>{" "}
          {d.zones.map((z) => `${z.name} ${z.from}→${z.to}`).join(", ") || "none"}.
          These change Mind the Gap, which sizes its circle off the zone.
        </p>
      </div>

      <div className="button-row">
        <button className="btn btn-ghost" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}
