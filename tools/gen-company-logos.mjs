/**
 * Vendor the company logos, so a monetised game stops leaning on a
 * volunteer-run CDN.
 *
 * Item C3 of the ad-readiness register. Every round of Corporate HQ Spotter
 * currently fetches its mark from `cdn.simpleicons.org` — free, kindly run by
 * people who owe us nothing, and the round's question is unreadable if it is
 * slow or down. The icons are CC0, so copying them is expressly permitted.
 *
 * **Fetched from the CDN, not from the repository, and that is the whole
 * trick.** Simple Icons stores each mark as a single black path and the CDN
 * paints it: ask GitHub for nvidia.svg and you get no `fill` at all, ask the
 * CDN and you get `fill="#76B900"`. Vendoring from the repository would turn
 * all 488 logos black, which is a visible change to the game and a worse one —
 * the colour is half of what makes a mark recognisable.
 *
 * Run: node tools/gen-company-logos.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync(new URL("../src/data/companies.ts", import.meta.url), "utf8");
const slugs = [...new Set([...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]))];
process.stderr.write(`${slugs.length} slugs in companies.ts\n`);

const outDir = new URL("../public/logos/", import.meta.url);
mkdirSync(outDir, { recursive: true });

// Politely: a handful at a time rather than 488 at once.
const BATCH = 8;
const failed = [];
let bytes = 0;

for (let i = 0; i < slugs.length; i += BATCH) {
  const batch = slugs.slice(i, i + BATCH);
  await Promise.all(
    batch.map(async (slug) => {
      try {
        const r = await fetch(`https://cdn.simpleicons.org/${slug}`);
        if (!r.ok) throw new Error(`${r.status}`);
        const svg = await r.text();
        // A mark with no fill is one the CDN did not paint, which means the
        // file is not what the game is drawing today. Better to know.
        if (!svg.includes("<svg") || !svg.includes("fill=")) throw new Error("no fill");
        writeFileSync(new URL(`${slug}.svg`, outDir), svg);
        bytes += svg.length;
      } catch (e) {
        failed.push(`${slug} (${e.message})`);
      }
    }),
  );
  if (i % 80 === 0) process.stderr.write(`  ${i}/${slugs.length}\n`);
}

process.stderr.write(`\nwrote ${slugs.length - failed.length} logos, ${Math.round(bytes / 1024)} KB\n`);
if (failed.length) {
  process.stderr.write(`FAILED (${failed.length}): ${failed.join(", ")}\n`);
  process.exitCode = 1;
}
