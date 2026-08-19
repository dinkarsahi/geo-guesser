/**
 * Why a miss in a country game is measured middle to middle.
 *
 * This is the single most misread rule in SpotOn. Asked for a flag and given
 * the country next door, players expect a near miss because the two countries
 * *touch* — and are handed a distance of several hundred kilometres. The reason
 * is that neither end of the measurement is a border: the click is moved to the
 * middle of whichever country was pressed, and the answer is the middle of the
 * country asked for.
 *
 * That is deliberate, and the picture exists to show why. Measured border to
 * border, pressing the far corner of a neighbour would score better than
 * pressing its middle — the game would be marking which *part* of the wrong
 * country you chose, which is not a question anybody was asked.
 *
 * Flat shapes rather than real coastlines, on purpose: this is about two points
 * and the line between them, and a recognisable map would have the reader
 * looking at the geography instead of the rule. The layout is spread out for
 * the same reason — every label has its own lane, because a diagram whose words
 * overlap is read as a mistake rather than as an explanation.
 */
export default function AnchorDiagram() {
  return (
    <figure className="curve">
      <svg
        viewBox="0 0 640 320"
        className="curve-svg"
        role="img"
        aria-label="The click is moved to the middle of the country pressed, and the distance is measured from there to the middle of the country asked for — not between the two borders."
      >
        {/* Two countries sharing a border, which is the case that makes the
            rule look wrong. */}
        <path className="anchor-shape anchor-wrong" d="M40 110 L300 96 L300 250 L58 240 L28 176 Z" />
        <path className="anchor-shape anchor-right" d="M300 96 L560 108 L600 180 L548 254 L300 250 Z" />

        {/* Each dot says what it is, on a leader down to its own line of text.
            The labels used to sit beside the dots and ran into the arrow and
            into each other — a diagram whose words overlap is read as a mistake
            rather than as an explanation. */}
        <line className="anchor-leader" x1={165} y1={180} x2={165} y2={266} />
        <line className="anchor-leader" x1={450} y1={180} x2={450} y2={266} />
        <text className="curve-axis" x={165} y={284} textAnchor="middle">
          middle of the country you pressed
        </text>
        <text className="curve-axis" x={450} y={284} textAnchor="middle">
          middle of the country asked for
        </text>

        {/* Where the press landed: just inside the wrong country, a few miles
            from the answer's own edge — which is exactly why it feels close. */}
        <circle className="anchor-press" cx={286} cy={140} r={5.5} />
        <text className="curve-mark" x={286} y={124} textAnchor="middle">
          you pressed here
        </text>

        {/* The move onto that country's own point. Unlabelled on purpose: an
            arrow from the press to the dot, with the dot named below, says it
            without another line of text to find room for. */}
        <path className="anchor-move" d="M278 146 L174 167" markerEnd="url(#anchor-arrow)" />

        <circle className="anchor-dot" cx={165} cy={172} r={6.5} />
        <circle className="anchor-dot anchor-dot-right" cx={450} cy={172} r={6.5} />

        {/* The measured line — the whole point of the picture — on its own lane
            with its label directly beneath it. */}
        <line className="anchor-measure" x1={165} y1={172} x2={450} y2={172} />
        <text className="curve-mark" x={307} y={200} textAnchor="middle">
          this is the distance you are marked on
        </text>

        {/* Short on purpose: the paragraph under the figure carries the
            reasoning, and a caption long enough to need the full width ran out
            past the edges of the card the figure sits in. */}
        <text className="curve-note" x={320} y={310} textAnchor="middle">
          Not the gap between the borders.
        </text>

        <defs>
          <marker
            id="anchor-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 0 L10 5 L0 10 z" className="anchor-arrowhead" />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}
