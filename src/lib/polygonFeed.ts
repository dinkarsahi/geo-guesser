import { useEffect, useRef, useState } from "react";

/**
 * Hand the globe its country outlines a few at a time instead of all at once.
 *
 * **This is the fix for the thing that made the arrival look broken.** Building
 * the 242 outlines is roughly three seconds of geometry on the main thread, and
 * it was landing on exactly the seconds the fall through space needed: the
 * camera froze at the top, then jumped most of the way down when the thread
 * came back, which is what "messy at the start and a jerk at the end" actually
 * was. Nothing about the easing could have helped — there were no frames to
 * ease.
 *
 * The two obvious fixes were both tried and both worse. Holding the outlines
 * back until the fall lands moves the freeze to the moment the round opens,
 * which in a duel is answering time. Coarsening them further costs accuracy in
 * the one place the globe is already known to drift from the ground.
 *
 * Slicing costs nothing, because three-globe's polygon layer is a data join
 * keyed on the feature: a country already in the scene keeps the geometry it
 * has, and only the ones newly arrived are built. So feeding the list in
 * pieces builds each country exactly once, in the same total time, with the
 * browser free to draw a frame in between. The freeze becomes a fall.
 *
 * **The slice adapts rather than being a number somebody guessed.** How long
 * 242 outlines take is a fact about the machine, and a size tuned on this one
 * is a size wrong everywhere else, so the gap between frames is measured and
 * the slice halves when the last one cost too much and doubles when it cost
 * little. A phone converges on a handful at a time and a desktop on dozens,
 * and neither was told anything.
 *
 * Once the whole list is in, this stands aside for good and hands back the
 * array it was given. That matters at the reveal, where the mode adds painted
 * shapes to the end: staged again, they would arrive a frame after the answer.
 */

/**
 * How long a slice may cost before it is judged too big.
 *
 * A frame and a half at sixty hertz. Not one frame: the aim is a fall the eye
 * reads as continuous rather than a locked sixty, and holding out for a single
 * frame's budget drives the slice down to one or two countries, which spends
 * the whole intro and leaves half the world unbuilt when the round opens.
 */
const BUDGET_MS = 26;

/** Where it starts before it has measured anything, and how far it may go. */
const FIRST_SLICE = 8;
const MOST = 64;

export function usePolygonFeed(all: object[]): object[] {
  const [filled, setFilled] = useState(0);
  // Once the list has been fed through once, it is never staged again — see
  // above. State rather than a ref because the render below asks it, and a ref
  // read during render is a value React is entitled to have moved on from.
  const [done, setDone] = useState(false);
  // Refs, because the loop reads and writes them on frames it does not itself
  // cause a render on.
  const filledRef = useRef(0);
  const sliceRef = useRef(FIRST_SLICE);

  useEffect(() => {
    if (done) return;
    const total = all.length;
    // Nothing to feed yet: the shapes are still downloading, and this runs
    // again with a list in it when they land.
    if (total === 0) return;

    let frame = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const gap = now - last;
      last = now;
      // What the slice just handed over actually cost, including the geometry
      // three-globe built for it. Halve or double from there — a proportional
      // step finds the machine's size in a few frames, where adding and
      // subtracting a constant would take the whole intro to get there.
      if (gap > BUDGET_MS) sliceRef.current = Math.max(1, Math.floor(sliceRef.current / 2));
      else if (gap < BUDGET_MS * 0.6)
        sliceRef.current = Math.min(MOST, sliceRef.current * 2);

      const next = Math.min(total, filledRef.current + sliceRef.current);
      filledRef.current = next;
      setFilled(next);
      if (next >= total) {
        setDone(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [all, done]);

  return done || filled >= all.length ? all : all.slice(0, filled);
}
