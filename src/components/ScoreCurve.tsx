import { MAX_ROUND_SCORE } from "../lib/geo";

/** One reading called out on the curve: a point, and what it is worth. */
interface Mark {
  /** Where along the bottom axis, in the chart's own units. */
  at: number;
  /** How that reading is written — "1,200 km", "×5", "4 stops". */
  reads: string;
}

interface ScoreCurveProps {
  /** What the bottom axis measures — "How far your click landed from it". */
  measures: string;
  /** The scoring rule itself, handed the axis value and giving back a mark. */
  score: (at: number) => number;
  /** Where the axis starts. Not always zero — a ratio begins at one. */
  min?: number;
  /** Where the axis ends. */
  max: number;
  /** Where the labelled ticks along the bottom go. */
  ticks: number[];
  /** How a tick is written. */
  tick: (at: number) => string;
  /** The readings worth calling out, left to right. */
  marks: Mark[];
  /** The top of the scale, where a curve isn't marked out of a full hundred. */
  ceiling?: number;
}

const WIDTH = 640;
const HEIGHT = 300;
const PAD = { top: 26, right: 24, bottom: 52, left: 46 };
const PLOT = {
  w: WIDTH - PAD.left - PAD.right,
  h: HEIGHT - PAD.top - PAD.bottom,
};

/**
 * A scoring curve, drawn from the rule that scores it.
 *
 * **The function is passed in, not described.** Every curve on the FAQ is the
 * same one the game marks with — `scoreFromDistance`, `scoreFromStops` and the
 * rest — so a graph here cannot quietly disagree with the game the way a
 * hand-drawn shape or a table of remembered numbers would. Change a scale and
 * these redraw.
 *
 * Drawn as inline SVG rather than pulled from a charting library: four curves
 * and a handful of labels is not worth a dependency, and this way the whole
 * thing inherits the page's own colours and scales with its column.
 *
 * The shape is what the page is really trying to show. All four curves are
 * Gaussian, which leaves the top slowly and then falls away — so a near miss
 * is paid nearly in full while a wild guess is paid nearly nothing, and the
 * difference between 100 and 94 is much smaller than it looks.
 */
export default function ScoreCurve({
  measures,
  score,
  min = 0,
  max,
  ticks,
  tick,
  marks,
  ceiling = MAX_ROUND_SCORE,
}: ScoreCurveProps) {
  const x = (at: number) => PAD.left + ((at - min) / (max - min)) * PLOT.w;
  const y = (points: number) => PAD.top + (1 - points / MAX_ROUND_SCORE) * PLOT.h;

  // Sampled finely enough that the curve reads as a curve rather than as the
  // straight lines it is actually made of.
  const steps = 160;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const at = min + (i / steps) * (max - min);
    return [x(at), y(score(at))] as const;
  });
  const line = points.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join(" ");
  const area = `${line} L${x(max)} ${y(0)} L${x(min)} ${y(0)} Z`;

  const gridlines = [0, 25, 50, 75, 100];

  return (
    <figure className="curve">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="curve-svg"
        role="img"
        aria-label={`${measures}: ${marks
          .map((m) => `${m.reads} scores ${score(m.at)}`)
          .join(", ")}`}
      >
        {gridlines.map((points_) => (
          <g key={points_}>
            <line
              className="curve-grid"
              x1={PAD.left}
              x2={PAD.left + PLOT.w}
              y1={y(points_)}
              y2={y(points_)}
            />
            <text className="curve-axis" x={PAD.left - 10} y={y(points_) + 4} textAnchor="end">
              {points_}
            </text>
          </g>
        ))}

        {/* Where a curve's own top is below a hundred — population's is 95,
            because the last five points belong to naming the right country and
            nothing else can earn them. */}
        {ceiling < MAX_ROUND_SCORE && (
          <>
            <line
              className="curve-ceiling"
              x1={PAD.left}
              x2={PAD.left + PLOT.w}
              y1={y(ceiling)}
              y2={y(ceiling)}
            />
            <text className="curve-note" x={PAD.left + PLOT.w} y={y(ceiling) - 8} textAnchor="end">
              {ceiling} — the most a wrong country can score
            </text>
          </>
        )}

        <path className="curve-area" d={area} />
        <path className="curve-line" d={line} />

        {marks.map((m) => {
          const px = x(m.at);
          const py = y(score(m.at));
          // Labels sit above their point, and flip to the left near the right
          // edge so nothing is written off the side of the chart.
          const flip = px > PAD.left + PLOT.w * 0.62;
          return (
            <g key={m.at}>
              <line className="curve-drop" x1={px} x2={px} y1={py} y2={y(0)} />
              <circle className="curve-dot" cx={px} cy={py} r={4.5} />
              <text
                className="curve-mark"
                x={flip ? px - 10 : px + 10}
                y={py - 10}
                textAnchor={flip ? "end" : "start"}
              >
                {m.reads} → {score(m.at)}
              </text>
            </g>
          );
        })}

        <line
          className="curve-axis-line"
          x1={PAD.left}
          x2={PAD.left + PLOT.w}
          y1={y(0)}
          y2={y(0)}
        />
        {ticks.map((t) => (
          <text key={t} className="curve-axis" x={x(t)} y={y(0) + 20} textAnchor="middle">
            {tick(t)}
          </text>
        ))}
        <text
          className="curve-axis-label"
          x={PAD.left + PLOT.w / 2}
          y={HEIGHT - 12}
          textAnchor="middle"
        >
          {measures}
        </text>
        <text className="curve-axis-label" x={PAD.left - 34} y={PAD.top - 12}>
          points
        </text>
      </svg>
    </figure>
  );
}
