import type { Country } from "./countries";

/**
 * A thing a country sells more of than anything else.
 *
 * **This data is hand-written, and wants checking before the game leaves the
 * bench.** "Main export" is a moving target rather than a fact: it depends on
 * the year, on how finely goods are categorised, and on whether services count
 * at all. Norway's largest export by value has swapped between crude petroleum
 * and natural gas twice in five years, and Morocco's has gone from phosphates
 * to cars within a decade.
 *
 * So the rule used here is: a country's largest **goods** export by value in
 * recent years, and **anywhere the answer flips year to year has been left out
 * rather than guessed at**. Thailand is famous for rubber and exports more
 * cars; Costa Rica is famous for bananas and exports more medical instruments;
 * Rwanda is famous for coffee and exports more gold. All three are absent, and
 * a short quiz that is right beats a long one that is wrong.
 *
 * Written from general knowledge rather than extracted from anyone's database,
 * which also keeps it clear of the line the tube data ended up on the wrong
 * side of: individual facts belong to nobody, a compiled dataset can belong to
 * somebody.
 */
export interface Export {
  /** Stable key, e.g. "crude-petroleum". */
  id: string;
  /** How it is named in the question. */
  name: string;
  /** One character, shown beside the name — the flag round's trick. */
  emoji: string;
}

/**
 * An export and every country on the map whose largest it is.
 *
 * Built around the *good* rather than a country, because that is the shape of
 * the question: twenty-five countries answer to crude petroleum and any of
 * them is right. The same arrangement the currency round uses, for the same
 * reason.
 */
export interface ExportTarget extends Export {
  /** Countries whose main export this is, alphabetically. */
  countries: Country[];
  /** Stand-in location, only used before a guess picks a nearer one. */
  lat: number;
  lng: number;
  fact: string;
}

const GOODS: Record<string, { name: string; emoji: string }> = {
  "crude-petroleum": { name: "Crude petroleum", emoji: "🛢️" },
  "petroleum-gas": { name: "Petroleum gas", emoji: "🔥" },
  "refined-petroleum": { name: "Refined petroleum", emoji: "⛽" },
  coal: { name: "Coal", emoji: "🪨" },
  gold: { name: "Gold", emoji: "🥇" },
  copper: { name: "Copper", emoji: "🟫" },
  "iron-ore": { name: "Iron ore", emoji: "⛏️" },
  bauxite: { name: "Bauxite", emoji: "🧱" },
  diamonds: { name: "Diamonds", emoji: "💎" },
  uranium: { name: "Uranium", emoji: "☢️" },
  cars: { name: "Cars", emoji: "🚗" },
  "integrated-circuits": { name: "Integrated circuits", emoji: "🔌" },
  "broadcasting-equipment": { name: "Broadcasting equipment", emoji: "📡" },
  medicaments: { name: "Medicaments", emoji: "💊" },
  aircraft: { name: "Aircraft", emoji: "✈️" },
  garments: { name: "Clothing", emoji: "👕" },
  coffee: { name: "Coffee", emoji: "☕" },
  cocoa: { name: "Cocoa beans", emoji: "🍫" },
  tea: { name: "Tea", emoji: "🍵" },
  tobacco: { name: "Tobacco", emoji: "🚬" },
  soybeans: { name: "Soybeans", emoji: "🌱" },
  "palm-oil": { name: "Palm oil", emoji: "🌴" },
  bananas: { name: "Bananas", emoji: "🍌" },
  fish: { name: "Fish", emoji: "🐟" },
  beef: { name: "Beef", emoji: "🥩" },
  cotton: { name: "Cotton", emoji: "🧵" },
  timber: { name: "Timber", emoji: "🪵" },
  wheat: { name: "Wheat", emoji: "🌾" },
};

/**
 * ISO alpha-2 (lowercase, as the country pool holds it) → what it sells most
 * of. A country missing from here never comes up, which is how every other
 * pool in the game works.
 */
const SELLS: Record<string, string> = {
  // --- Oil and gas ------------------------------------------------------
  sa: "crude-petroleum", iq: "crude-petroleum", kw: "crude-petroleum",
  ae: "crude-petroleum", ir: "crude-petroleum", om: "crude-petroleum",
  ao: "crude-petroleum", ng: "crude-petroleum", ly: "crude-petroleum",
  az: "crude-petroleum", kz: "crude-petroleum", ru: "crude-petroleum",
  ve: "crude-petroleum", co: "crude-petroleum", ec: "crude-petroleum",
  gq: "crude-petroleum", cg: "crude-petroleum", ga: "crude-petroleum",
  td: "crude-petroleum", ss: "crude-petroleum", bn: "crude-petroleum",
  gy: "crude-petroleum", cm: "crude-petroleum", eg: "crude-petroleum",
  tl: "crude-petroleum",
  qa: "petroleum-gas", tt: "petroleum-gas", dz: "petroleum-gas",
  tm: "petroleum-gas", no: "petroleum-gas",
  in: "refined-petroleum", by: "refined-petroleum", bh: "refined-petroleum",

  // --- Dug up -----------------------------------------------------------
  au: "iron-ore", mr: "iron-ore", lr: "iron-ore",
  cl: "copper", zm: "copper", cd: "copper", pe: "copper", mn: "copper",
  ch: "gold", gh: "gold", uz: "gold", bf: "gold", ml: "gold", tz: "gold",
  pg: "gold", sr: "gold", kg: "gold", sd: "gold", zw: "gold",
  bw: "diamonds", na: "diamonds",
  gn: "bauxite", ne: "uranium", mz: "coal",

  // --- Made -------------------------------------------------------------
  de: "cars", jp: "cars", mx: "cars", es: "cars", sk: "cars", cz: "cars",
  hu: "cars", ro: "cars", si: "cars", ma: "cars",
  tw: "integrated-circuits", kr: "integrated-circuits", my: "integrated-circuits",
  ph: "integrated-circuits", sg: "integrated-circuits",
  cn: "broadcasting-equipment", vn: "broadcasting-equipment",
  ie: "medicaments", be: "medicaments", dk: "medicaments",
  fr: "aircraft",
  bd: "garments", kh: "garments", lk: "garments", ht: "garments",
  ls: "garments", jo: "garments", tn: "garments", pk: "garments",

  // --- Grown and caught -------------------------------------------------
  et: "coffee", hn: "coffee", ug: "coffee", bi: "coffee",
  ci: "cocoa", st: "cocoa",
  ke: "tea", mw: "tobacco", id: "palm-oil",
  br: "soybeans", py: "soybeans", ar: "soybeans",
  gt: "bananas", uy: "beef", bj: "cotton", sb: "timber", ua: "wheat",
  is: "fish", mv: "fish", sc: "fish",
};

/**
 * Something worth knowing once the answer is out, which is not the same as
 * naming the countries — the map has just painted every one of them green.
 */
const writtenFacts: Record<string, string> = {
  "crude-petroleum":
    "The most traded good on Earth by value, and the reason a handful of otherwise small economies sit near the top of every trade table.",
  "petroleum-gas":
    "Hard to move without either a pipeline or the cost of chilling it to −162°C, which is why the countries selling most of it are either next door to their customers or very committed.",
  "refined-petroleum":
    "Crude oil that somebody else pulled out of the ground: a refinery is a way of exporting skilled work, which is why the biggest sellers are rarely the biggest producers.",
  gold: "Switzerland leads this list without mining any — roughly two thirds of the world's gold passes through Swiss refineries and leaves again as a Swiss export.",
  diamonds:
    "Botswana turned a diamond find into the fastest-growing economy in the world for three decades, which is close to the only time that has ever happened.",
  cars: "The most valuable manufactured export there is, and the one that turned central Europe into a single factory floor — Slovakia builds more cars per head than anywhere else.",
  "integrated-circuits":
    "One Taiwanese company makes most of the world's advanced chips, which is why a single island appears in the supply chain of very nearly everything electrical.",
  "broadcasting-equipment":
    "Mostly telephones. It is the biggest single category in world trade after oil and cars, and almost all of it is assembled within a few hundred miles of the South China Sea.",
  coffee:
    "Grown almost entirely in the tropics and drunk almost entirely outside them — one of the most lopsided trades in the world.",
  cocoa:
    "Côte d'Ivoire and Ghana grow about two thirds of the world's cocoa between them, and earn a small fraction of what the chocolate made from it sells for.",
  bananas:
    "Nearly every exported banana is a Cavendish: one clone, planted everywhere, which is exactly why a single fungus can threaten the whole trade.",
  garments:
    "The first rung of industrialisation that almost every country has climbed, and the one Bangladesh climbed further than anybody expected.",
  fish: "For a small island the sea is the entire economy — the Maldives and the Seychelles both sell more fish than anything else, and most of it is tuna.",
  "palm-oil":
    "In roughly half the packaged goods in a supermarket, and grown on land that was rainforest within living memory.",
  wheat:
    "Ukraine and Russia together supplied about a quarter of the world's wheat exports before 2022, which is why a war was felt in bread prices thousands of miles away.",
  uranium:
    "Niger's mines have supplied a good share of the fuel in French reactors for fifty years, which is a large part of why France's electricity is the least carbon-heavy in Europe.",
  bauxite: "The rock aluminium is made from. It takes about four tonnes of it to make one tonne of metal, so it is shipped in enormous quantity.",
  aircraft:
    "France's largest export is essentially one company's order book — and an Airbus is assembled from parts that have crossed several borders before they meet in Toulouse.",
  medicaments:
    "Ireland's figure is one of the strangest in world trade: a small country selling more medicine than almost anyone, because that is where the patents are held.",
  coal: "Mozambique's coal leaves through a port and a railway built for it, which is the usual shape of the trade — a mine is only worth as much as the line running out of it.",
  copper:
    "Chile alone digs about a quarter of the world's copper, and an electric car needs roughly four times as much of it as a petrol one.",
  "iron-ore":
    "Australia ships more of it than the rest of the world combined, almost all from one corner of Western Australia and almost all to China.",
  tea: "Kenya sells more black tea than any other country — a crop the British planted there barely a century ago, on land chosen for its altitude.",
  tobacco:
    "Malawi is more dependent on a single crop than almost any country on Earth, with tobacco making up around half of everything it sells abroad.",
  soybeans:
    "Mostly eaten by animals rather than people: the great majority is crushed for meal and fed to pigs and chickens, which is why the trade tracks meat consumption.",
  beef: "Uruguay has more cattle than people by about three to one, and tags every one of them — it was the first country able to trace a steak back to its field.",
  cotton:
    "Benin's cotton is picked by hand and mostly spun somewhere else, which is the oldest pattern in the trade and the hardest one to break.",
  timber:
    "The Solomon Islands have been logging faster than the forest grows for years, which makes this an export with an end date attached to it.",
};

/** Where the group sits on average — the fallback location before a guess. */
function middleOf(countries: Country[]): { lat: number; lng: number } {
  const lat = countries.reduce((a, c) => a + c.lat, 0) / countries.length;
  const lng = countries.reduce((a, c) => a + c.lng, 0) / countries.length;
  // The country nearest that average, so the marker lands on land rather than
  // in whatever ocean happens to sit in the middle of the group.
  let best = countries[0];
  let bestDist = Infinity;
  for (const c of countries) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return { lat: best.lat, lng: best.lng };
}

function listNames(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * What to say once the answer is out. Naming the countries is worthless by
 * then — the map has just painted them — so a good without a written fact
 * borrows the one belonging to the country that sells it, exactly as the
 * currency round does.
 */
function factFor(good: Export, countries: Country[]): string {
  const written = writtenFacts[good.id];
  if (written) return written;
  if (countries.length === 1) return countries[0].fact;
  const named = countries.slice(0, 3).map((c) => c.name);
  return `${good.name} is the largest export of ${countries.length} countries on this map, among them ${listNames(named)}.`;
}

let cachedFor: Country[] | null = null;
let cached: ExportTarget[] = [];

/**
 * Every export on the map, each carrying the countries whose main one it is.
 *
 * Built from the same country pool the flag round uses, so a good can never be
 * asked about unless there is somewhere on the map to click for it. Cached by
 * pool identity, which keeps the array stable and with it the game's memory of
 * what it has already dealt.
 *
 * **Goods with a single country are kept.** A question with one right answer
 * is the hardest and the best kind here — "whose main export is uranium?" is a
 * real question in a way that "which of twenty-five oil producers did you
 * mean?" is not.
 */
export function exportPool(countries: Country[]): ExportTarget[] {
  if (!countries.length) return [];
  if (countries === cachedFor) return cached;

  const groups = new Map<string, Country[]>();
  for (const c of countries) {
    const id = SELLS[c.code];
    if (!id || !GOODS[id]) continue;
    const group = groups.get(id);
    if (group) group.push(c);
    else groups.set(id, [c]);
  }

  const out: ExportTarget[] = [];
  for (const [id, group] of groups) {
    group.sort((a, b) => a.name.localeCompare(b.name));
    const good = { id, ...GOODS[id] };
    out.push({ ...good, countries: group, ...middleOf(group), fact: factFor(good, group) });
  }

  cachedFor = countries;
  cached = out.sort((a, b) => a.name.localeCompare(b.name));
  return cached;
}

/**
 * What one country sells most of, by ISO alpha-2 — null where nothing is on
 * file. The pool answers the opposite question (who sells this), which is no
 * help to a reveal holding a country and wanting to name its trade.
 */
export function exportOf(code: string): Export | null {
  const id = SELLS[code.toLowerCase()];
  const good = id ? GOODS[id] : undefined;
  return good ? { id, ...good } : null;
}
