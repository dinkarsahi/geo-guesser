import type { Coord } from "../lib/geo";
import type { CountryProps, WorldShapes } from "../lib/worldShapes";

export interface Country extends Coord {
  name: string;
  /** ISO 3166-1 alpha-2 code (lowercase) — used for flagcdn image URLs. */
  code: string;
  fact: string;
}

/**
 * Flag image URL from flagcdn.com. `code` is the lowercase ISO alpha-2 code.
 * Width 320 gives a crisp flag on the prompt card.
 */
export function flagUrl(code: string): string {
  return `https://flagcdn.com/w320/${code}.png`;
}

/**
 * On the map but out of the game: nobody lives there and there's no national
 * flag to recognise. Heard Island and South Georgia join the ice on the finer
 * map — between them they're home to a few dozen researchers.
 */
const NOT_PLAYABLE = new Set(["aq", "tf", "hm", "gs"]);

/**
 * Hand-written facts, by ISO alpha-2 code. Everything else in the world gets a
 * fact built from the map data instead (see `autoFact`) — the same fallback the
 * tube map uses for stations without a write-up. That way the pool is every
 * country on the map rather than just the ones somebody got round to.
 */
const writtenFacts: Record<string, string> = {
  fr: "France is the most visited country in the world, drawing around 90 million tourists a year.",
  jp: "Japan is made up of roughly 14,000 islands stretched along the Pacific.",
  br: "Brazil holds about 60% of the Amazon rainforest within its borders.",
  au: "Australia is the only country that is also a continent in its own right.",
  ca: "Canada has the longest coastline of any country — over 200,000 km.",
  eg: "The Great Pyramid of Giza was the tallest human-made structure for about 3,800 years.",
  in: "India is the most populous country in the world, home to over 1.4 billion people.",
  ke: "The Great Rift Valley runs the length of Kenya and is visible from space.",
  no: "Norway's coastline of fjords would stretch over 100,000 km if pulled straight.",
  pe: "Machu Picchu sits about 2,430 m above sea level in the Andes.",
  it: "Italy has more UNESCO World Heritage Sites than any other country.",
  de: "Germany has no official speed limit on large stretches of its Autobahn.",
  mx: "Mexico introduced chocolate, chillies and corn to the rest of the world.",
  za: "South Africa has three capital cities: Pretoria, Cape Town and Bloemfontein.",
  th: "Thailand is the only Southeast Asian country never colonised by a European power.",
  ar: "Aconcagua in Argentina is the highest mountain outside of Asia.",
  tr: "Istanbul is the only major city that sits on two continents at once.",
  is: "Iceland runs almost entirely on renewable geothermal and hydro power.",
  nz: "New Zealand was the first country to give women the right to vote, in 1893.",
  ng: "Nigeria is Africa's most populous country and home to Nollywood, a huge film industry.",
  id: "Indonesia spans more than 17,000 islands across three time zones.",
  kr: "South Korea has some of the fastest average internet speeds in the world.",
  es: "Spain produces almost half of the world's olive oil.",
  se: "Sweden has one of the highest numbers of islands of any country — about 267,000.",
  pt: "Portugal's borders have been essentially unchanged since 1139, among Europe's oldest.",
  gr: "Greece has thousands of islands, but only about 200 are inhabited.",
  kz: "Kazakhstan is the largest landlocked country in the world.",
  cl: "Chile stretches over 4,300 km north to south but averages only ~180 km wide.",
  ma: "Morocco's Sahara dunes at Erg Chebbi can rise as high as 150 m.",
  vn: "Vietnam is the world's second-largest exporter of coffee.",
  us: "The contiguous United States spans four time zones, and six once Alaska and Hawaii join in.",
  gb: "The United Kingdom is made up of four nations: England, Scotland, Wales and Northern Ireland.",
  ru: "Russia is the largest country on Earth and stretches across eleven time zones.",
  cn: "China's Grand Canal, still in use, is the longest artificial waterway in the world.",
  nl: "About a quarter of the Netherlands lies below sea level.",
  ch: "Switzerland has four national languages: German, French, Italian and Romansh.",
  mn: "Mongolia is the most sparsely populated sovereign country in the world.",
  np: "Nepal has the only national flag that isn't a rectangle.",
  bt: "Bhutan measures its progress in Gross National Happiness.",
  bo: "Bolivia's Salar de Uyuni is the largest salt flat on Earth.",
  cu: "Cuba is the largest island in the Caribbean.",
  mg: "Around 90% of the wildlife in Madagascar is found nowhere else.",
  cd: "The Congo is the deepest river in the world, over 220 m at its deepest point.",
  sa: "Saudi Arabia has no permanent rivers anywhere in the country.",
  ir: "Iran's Persepolis has stood since around 500 BC.",
  et: "Ethiopia follows its own calendar, which runs about seven years behind the Gregorian one.",
  ua: "Ukraine's rich black soil makes it one of the world's great grain exporters.",
  pl: "Poland's Białowieża Forest is one of the last stretches of primeval forest left in Europe.",
  ie: "Ireland has no native snakes.",
  fi: "Finland has around 188,000 lakes — more per person than any other country.",
};

/** "1.4 billion people", "about 12 million people", "3,398 people". */
function people(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} billion people`;
  if (n >= 1e7) return `${Math.round(n / 1e6)} million people`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} million people`;
  if (n >= 1e4) return `${Math.round(n / 1e3).toLocaleString()},000 people`;
  return `${Math.round(n).toLocaleString()} people`;
}

/** Country names that take a plural verb — "the Philippines sit", not "sits". */
const PLURAL_NAME = /(Islands|Lands|Netherlands|Philippines|Emirates|Bahamas|States)\b/;

/**
 * A fact from the map data for countries without a written one. The subregion
 * is the more interesting half of the sentence, but it's no use when it just
 * repeats the country's own name ("Australia and New Zealand"), so those fall
 * back to the continent.
 */
function autoFact(name: string, props: CountryProps): string {
  const sub = props.SUBREGION ?? "";
  const where = !sub || sub.includes(name) ? props.CONTINENT : sub;
  const pop = typeof props.POP_EST === "number" ? props.POP_EST : null;
  const [sit, is] = PLURAL_NAME.test(name) ? ["sit", "are"] : ["sits", "is"];
  if (!where) return pop ? `${name} ${is} home to about ${people(pop)}.` : name;
  if (!pop) return `${name} ${sit} in ${where}.`;
  return `${name} ${sit} in ${where} and ${is} home to about ${people(pop)}.`;
}

/** The full English name, in preference to the map's abbreviated label. */
const nameOf = (p: CountryProps) => p.NAME_EN || p.NAME_LONG || p.NAME || "";

function build(shapes: WorldShapes): Country[] {
  const out: Country[] = [];
  for (const [code, feature] of Object.entries(shapes.byCode)) {
    if (NOT_PLAYABLE.has(code)) continue;
    const props = feature.properties ?? {};
    const name = nameOf(props);
    // Without a name to show or a point to score against there's no round to
    // play, so the country sits this one out.
    if (!name || typeof props.LABEL_X !== "number" || typeof props.LABEL_Y !== "number")
      continue;
    out.push({
      name,
      code,
      lat: props.LABEL_Y,
      lng: props.LABEL_X,
      fact: writtenFacts[code] ?? autoFact(name, props),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

let cachedFor: WorldShapes | null = null;
let cached: Country[] = [];

/**
 * Every country on the world map, ready to be guessed. Empty until the shapes
 * have downloaded. The result is cached by shapes identity, so the pool keeps
 * the same array (and so the same "recently seen" history) all session.
 */
export function countryPool(shapes: WorldShapes | null): Country[] {
  if (!shapes) return [];
  if (shapes !== cachedFor) {
    cachedFor = shapes;
    cached = build(shapes);
  }
  return cached;
}
