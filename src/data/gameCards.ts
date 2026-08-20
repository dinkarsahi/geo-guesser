import { TUBE_TAGLINE } from "./tube";
import type { ModeId } from "../modes/ModeProps";

/**
 * The words on a game's card, in one place because two screens read them.
 *
 * The shelf in `AllGames` is the obvious one. The other is the draw on
 * Today's Round, which prints the `blurb` of whichever game the day landed on
 * — a player who is handed a game they didn't choose is owed the same sentence
 * about it that somebody choosing it off the shelf gets to read first.
 *
 * Kept out of `App` for that second reader rather than on principle: `App`
 * renders `HeadToHead`, so `HeadToHead` importing from `App` would be a cycle.
 * Kept out of `lib/match` too — `MATCH_MODES` there is the machinery a code is
 * built from (an id, a letter, a title for a heading), where this is copy, and
 * a screen wanting the words shouldn't have to pull in the code format to get
 * them.
 */
// Every card says three things: the game's name, a line asking whether the
// player fancies it, and a sentence saying what a round actually involves. The
// `hook` is the middle one, and it is a question rather than a description —
// eight descriptions on a shelf are read as a list, eight questions as a dare.
//
// `tagline` is a different thing and still the tube's alone: the line that game
// is known by, printed on its setup screen and paid out as its full-marks
// announcement. The tube's hook is that same line, so both come from the one
// constant and can't drift apart.
export interface GameCard {
  title: string;
  hook: string;
  blurb: string;
  emoji: string;
  tagline?: string;
  /**
   * A line of small print under the blurb, for a game that shows somebody
   * else's property. Corporate HQ Spotter's alone: it puts real brand marks on
   * screen, and the disclaimer belongs where they are about to appear as well
   * as on the credits page, where somebody has to go looking for it.
   */
  smallprint?: string;
}

export const MODES: (GameCard & { id: ModeId })[] = [
  {
    id: "city",
    title: "City Spotter",
    hook: "Know your cities?",
    blurb: "With just the name, can you spin the globe and spot where it is?",
    emoji: "🏙️",
  },
  {
    id: "flag",
    title: "Flag Spotter",
    hook: "Will you capture the flag or raise the white flag?",
    blurb: "Can you spot which country the flag belongs to?",
    emoji: "🚩",
  },
  {
    id: "currency",
    title: "Currency Spotter",
    hook: "Are you good with money?",
    blurb: "Using a currency and its symbol, can you spot a country which spends it?",
    emoji: "💱",
  },
  {
    id: "company",
    title: "Corporate HQ Spotter",
    hook: "Can you navigate the corporate landscape?",
    blurb:
      "With just the company logo, can you spot which country it's headquartered in?",
    emoji: "🏢",
    smallprint:
      "Company names and logos are trademarks of their respective owners. SpotOn is not affiliated with, endorsed by or sponsored by any company shown.",
  },
  {
    id: "population",
    title: "Population Spotter",
    hook: "Good with numbers?",
    blurb: "Can you spot the country given its population figure?",
    emoji: "👥",
  },
  {
    id: "tube",
    title: "Tube Station Spotter",
    hook: TUBE_TAGLINE,
    tagline: TUBE_TAGLINE,
    blurb: "With just the station name, can you spot it on the tube map?",
    emoji: "🚇",
  },
  {
    id: "timezone",
    title: "Time Zone Spotter",
    hook: "Can you handle the jet lag?",
    blurb: "Read the clock, and spot a country in that time zone.",
    emoji: "🕰️",
  },
];

