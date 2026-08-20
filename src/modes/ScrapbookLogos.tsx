import { useState } from "react";
import { ALL_COMPANIES, localLogoUrl, logoUrl } from "../data/companies";

/**
 * The bench: every company logo from both sources, side by side.
 *
 * **What is on trial is where the marks are served from**, which is item C3 of
 * the ad-readiness register. Corporate HQ Spotter fetches each one from
 * `cdn.simpleicons.org` on the round it is asked — a volunteer-run service
 * that owes a monetised game nothing, and if it is slow or down the question
 * is unreadable. The icons are CC0, so copying them is expressly permitted.
 *
 * The thing worth *seeing* is the colour. Simple Icons keeps each mark as a
 * single black path and the CDN paints it, so vendoring from the repository —
 * the obvious thing to do — would have turned all of these black. The script
 * fetches the CDN's own output instead, and this page is how you check that
 * worked: **each row shows the same company twice**, served from each place.
 * Two identical marks means nothing changed. Anything odd is impossible to
 * miss at this density, which a switch between two full screens would not be.
 */
export default function ScrapbookLogos({ onExit }: { onExit: () => void }) {
  // Which one is drawn large, as the game draws it, in the prompt-bar mock.
  const [source, setSource] = useState<"cdn" | "local">("cdn");
  const [broken, setBroken] = useState<string[]>([]);
  const sample = ALL_COMPANIES[0];

  const note = (slug: string, which: string) =>
    setBroken((b) => (b.includes(`${slug} (${which})`) ? b : [...b, `${slug} (${which})`]));

  return (
    <div className="menu setup">
      <h1>Where the logos come from</h1>
      <p className="muted menu-sub h2h-rules">
        Every mark in Corporate HQ Spotter, served from the Simple Icons CDN and
        from this site, one pair per company. Two that look alike is the answer.
        Nothing here is scored and nothing is filed.
      </p>

      {/* The question as the game actually draws it, so the swap is judged at
          the size a player sees rather than at thumbnail size. */}
      <div className="bench-prompt">
        <div className="bench-switch is-inline">
          <button
            className={`bench-pick${source === "cdn" ? " is-on" : ""}`}
            onClick={() => setSource("cdn")}
          >
            From the CDN
          </button>
          <button
            className={`bench-pick${source === "local" ? " is-on" : ""}`}
            onClick={() => setSource("local")}
          >
            From this site
          </button>
        </div>
        <span className="prompt-company">
          <span className="company-logo">
            <img
              src={source === "cdn" ? logoUrl(sample.slug) : localLogoUrl(sample.slug)}
              alt=""
              width={30}
              height={30}
            />
          </span>
          <span className="prompt-company-name">{sample.name}</span>
        </span>
      </div>

      <p className="bench-count">
        {ALL_COMPANIES.length} companies ·{" "}
        {broken.length === 0
          ? "every mark loaded from both places"
          : `${broken.length} did not load: ${broken.join(", ")}`}
      </p>

      <div className="logo-grid">
        {ALL_COMPANIES.map((c) => (
          <div className="logo-pair" key={c.slug}>
            <img
              src={logoUrl(c.slug)}
              alt=""
              width={26}
              height={26}
              onError={() => note(c.slug, "CDN")}
            />
            <img
              src={localLogoUrl(c.slug)}
              alt=""
              width={26}
              height={26}
              onError={() => note(c.slug, "local")}
            />
            <span>{c.name}</span>
          </div>
        ))}
      </div>

      <div className="button-row">
        <button className="btn btn-ghost" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}
