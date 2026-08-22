/**
 * How every game climbs, and where each one stops.
 *
 * A round of SpotOn used to be a flat shuffle of everything in the pool, which
 * deals a first round as hard as its fifth and, in the games whose pools have a
 * long tail, deals mostly from the tail. So each game now has a **ladder**: its
 * targets written out in bands, easiest band first, and `useGame`'s `easierBy`
 * takes one from each. Round one is somewhere everybody knows and round five is
 * somewhere only the keen will get.
 *
 * **Two pools, and which you get depends on how you are playing.**
 *
 * - **Today's round** is dealt from the bands written below and nothing else.
 *   It is the front door: most of the people who see it followed a link from a
 *   friend and have never played, and a last round they cannot answer is a tab
 *   that closes.
 * - **A duel and a game off the shelf** get everything — the bands *plus* the
 *   whole tail the bands leave out — and **the tail is the last band**. Somebody
 *   who picked Currency Spotter off a shelf of seven, or who set up a duel, has
 *   asked for the whole world, and the Vanuatu vatu is a fair way to settle a
 *   fifth round between two people who both want one.
 *
 * That is the `wide` argument, and it is `match?.kind !== "daily"` at every
 * call site: absent means off the shelf, `"room"` means a duel, and only
 * `"daily"` narrows.
 *
 * **The tail can only ever be a fifth round**, however big it is, because
 * `bandOf` hands anything the bands do not name straight to the hardest band
 * and the deal asks for bands rather than cutting the pool into equal slices.
 * That is what the change to `climbingDeal` bought: fifty-nine hard currencies
 * behind ninety-five easy ones, cut into fifths, would have put hard ones in
 * the fourth round as well as the fifth.
 *
 * **Written bands should stay roughly equal in size.** Not for the deal's sake
 * any more — it asks each target which band it is in — but because a band is
 * one round's worth of question, and a band twice the size of its neighbour is
 * a difficulty step twice as big.
 *
 * **Not every game needs a written ladder.** Three of the seven have a real
 * measurement to hand and use it instead — see the table in CLAUDE.md. Writing
 * a list is for the games where the thing that makes a target easy is whether
 * you have *heard of it*, and there is no column in any dataset for that.
 */

/**
 * How many bands every game climbs through. Five, because a game is five rounds
 * and a band is one round's worth of question — but the two are counted
 * separately on purpose, and `climbingDeal` maps one onto the other, so a
 * ten-round game would climb these same five twice as slowly rather than
 * needing five more written.
 */
export const BANDS = 5;

/** Targets, in bands, easiest band first. */
type Bands = readonly (readonly string[])[];

/**
 * `K` is only what the ladder needs to read — a code, or a name. `pool` stays
 * generic in the target it is handed so that filtering a list of cities gives
 * back cities rather than the bare shape the key was read off.
 */
export interface Ladder<K> {
  /**
   * The targets this game may ask about. `wide` is every way of playing except
   * today's round — see "Two pools" above.
   */
  pool: <T extends K>(all: T[], wide: boolean) => T[];
  /** Which band a target sits in, 0 easiest. Anything unlisted is the hardest. */
  bandOf: (t: K) => number;
  /** Every key the ladder names, for the games that share one. */
  keys: ReadonlySet<string>;
  /** How many bands there are, which is also the index of the hardest plus one. */
  count: number;
}

/**
 * @param wideKeepsTheRest whether the wide pool takes in everything the bands
 *   do not name. True for the games with a long tail worth keeping for the last
 *   round; false for City, whose three dropped answers are dropped outright.
 */
function ladder<K>(
  bands: Bands,
  keyOf: (t: K) => string,
  wideKeepsTheRest: boolean,
): Ladder<K> {
  const band = new Map<string, number>();
  const order = new Map<string, number>();
  bands.forEach((names, i) =>
    names.forEach((key) => {
      band.set(key, i);
      order.set(key, order.size);
    }),
  );
  const hardest = bands.length - 1;
  // **In the ladder's own order, not the order the pool arrived in.** The deal
  // picks the nth member of a band, so the order inside a band decides which
  // target a given seed lands on — and the pool arrives in whatever order the
  // map data or the data file happens to hold. Sorting here means the written
  // list is the only thing that decides, which is what makes a day's rounds a
  // fact about the ladder rather than about the shape of some file. It is also
  // what let the bands be introduced mid-day without moving that day's round.
  // The tail keeps the order it came in, after everything named.
  const rank = (t: K) => order.get(keyOf(t)) ?? Number.MAX_SAFE_INTEGER;
  return {
    pool: (all, wide) =>
      wide && wideKeepsTheRest
        ? [...all].sort((a, b) => rank(a) - rank(b))
        : all.filter((t) => band.has(keyOf(t))).sort((a, b) => rank(a) - rank(b)),
    // Anything the bands do not name is the hardest band, which is the whole
    // of how the wide pool works: the extra material can only ever be a last
    // round, however much of it there is.
    bandOf: (t) => band.get(keyOf(t)) ?? hardest,
    keys: new Set(band.keys()),
    count: bands.length,
  };
}

/**
 * Bands cut from a measurement rather than written down: rank the pool and
 * slice it into `count` equal pieces. For the games whose difficulty is a real
 * number — a fare zone, a population, how many countries keep a clock.
 *
 * Returns a lookup rather than a formula, because a band is a fact about a
 * target's place *in this pool* and the pool is what is being ranked.
 */
export function bandsByMeasure<T>(
  pool: T[],
  easierBy: (t: T) => number,
  count: number,
): (t: T) => number {
  const ranked = [...pool].sort((a, b) => easierBy(b) - easierBy(a));
  const at = new Map<T, number>();
  ranked.forEach((t, i) => at.set(t, Math.min(count - 1, Math.floor((i * count) / ranked.length))));
  return (t) => at.get(t) ?? count - 1;
}

// ---------------------------------------------------------------------------
// Countries, by how well known the country is.
//
// Used twice: Flag Spotter ranks by it directly, and Population Spotter takes
// the *list* as its pool while ranking by population instead — the question
// there is a number, but you still have to know the country to find it, and a
// game that asks for the population of Sao Tome is asking two hard questions at
// once. Currency and Corporate HQ have their own ladders, because knowing
// Switzerland is not the same as knowing the franc or knowing Nestle.
// ---------------------------------------------------------------------------

const COUNTRY_BANDS = [
  // The flags almost nobody misses.
  ["gb", "us", "fr", "jp", "ca", "de", "it", "br",
   "cn", "in", "au", "es", "ru", "mx", "ar", "ch",
   "ie", "nl", "se", "gr", "pt", "za", "kr", "tr"],

  // Known without having to think about it.
  ["no", "dk", "fi", "pl", "be", "at", "il", "eg",
   "sa", "pk", "ng", "ke", "jm", "cu", "nz", "cl",
   "co", "pe", "th", "vn", "id", "ph", "my", "ua"],

  // Known if you follow a World Cup or a news bulletin.
  ["cz", "hu", "ro", "hr", "rs", "bg", "is", "ir",
   "iq", "ae", "ma", "dz", "tn", "gh", "et", "tz",
   "bd", "lk", "np", "mm", "kh", "ve", "ec", "uy"],

  // A keen player's countries.
  ["bo", "py", "cr", "pa", "do", "gt", "hn", "ni",
   "sv", "sk", "si", "ee", "lv", "lt", "by", "al",
   "ba", "mk", "ge", "am", "az", "kz", "uz", "mn"],

  // The hard end, and still somewhere with a football team.
  ["jo", "om", "ye", "sy", "af", "la", "pg", "ao",
   "mz", "zm", "zw", "bw", "na", "mg", "sn", "ci",
   "cm", "ml", "bf", "ne", "td", "sd", "ug", "cd"],
] as const;

/** Countries by flag recognisability — Flag Spotter, and the pool for both. */
export const COUNTRY_LADDER = ladder<{ code: string }>(COUNTRY_BANDS, (c) => c.code, true);

// ---------------------------------------------------------------------------
// Cities, by whether you could put a pin near them.
//
// Kept generous, because a city round is marked on *distance*: somebody who
// knows only that Ulaanbaatar is in Mongolia still scores, where a flag you
// don't know is worth nothing at all. So all but three of the 195 survive. The
// three that don't — Apia, Papeete and Noumea — are Pacific islands whose names
// carry no clue at all to anyone who hasn't been there, and no partial credit
// is available for a guess made at random.
// ---------------------------------------------------------------------------

const CITY_BANDS = [
  ["London", "Paris", "Rome", "Madrid", "Berlin", "Moscow", "New York", "Tokyo",
   "Beijing", "Sydney", "Los Angeles", "Toronto", "Dubai", "Amsterdam", "Barcelona",
   "Cairo", "Rio de Janeiro", "Mexico City", "Buenos Aires", "Mumbai", "Delhi",
   "Shanghai", "Hong Kong", "Singapore", "Bangkok", "Istanbul", "Athens", "Dublin",
   "Lisbon", "Vienna", "Venice", "Milan", "Chicago", "San Francisco", "Seoul",
   "Cape Town", "Brussels", "Copenhagen", "Stockholm"],

  ["Oslo", "Helsinki", "Prague", "Warsaw", "Budapest", "Zürich", "Geneva", "Munich",
   "Hamburg", "Naples", "Marseille", "Seville", "Porto", "Edinburgh", "Reykjavík",
   "Kyiv", "Bucharest", "Belgrade", "Sofia", "Zagreb", "Nairobi", "Casablanca",
   "Marrakesh", "Lagos", "Accra", "Addis Ababa", "Tunis", "Algiers", "Osaka",
   "Kuala Lumpur", "Manila", "Jakarta", "Hanoi", "Ho Chi Minh City", "Melbourne",
   "Auckland", "Wellington", "Vancouver", "Montreal"],

  ["Tallinn", "Riga", "Vilnius", "Kraków", "Bratislava", "Ljubljana", "Sarajevo",
   "Minsk", "Tirana", "Valletta", "Nicosia", "Luxembourg", "Bergen", "Karachi",
   "Lahore", "Tehran", "Baghdad", "Kabul", "Beirut", "Amman", "Doha", "Muscat",
   "Dhaka", "Colombo", "Kathmandu", "Chennai", "Tashkent", "Almaty", "Baku",
   "Tbilisi", "Yerevan", "Sapporo", "Busan", "Chengdu", "Yangon", "Phnom Penh",
   "Perth", "Brisbane", "Canberra"],

  ["Skopje", "Podgorica", "Chișinău", "Tromsø", "New Orleans", "Denver", "Seattle",
   "Anchorage", "Honolulu", "Calgary", "Halifax", "Havana", "Kingston",
   "Santo Domingo", "Panama City", "San José", "Guatemala City", "Managua",
   "Monterrey", "Mérida", "São Paulo", "Brasília", "Manaus", "Salvador", "Santiago",
   "Lima", "La Paz", "Quito", "Bogotá", "Medellín", "Caracas", "Montevideo",
   "Asunción", "Adelaide", "Darwin", "Hobart", "Christchurch", "Dakar", "Abidjan"],

  ["Andorra la Vella", "Bamako", "Ouagadougou", "Kinshasa", "Luanda", "Windhoek",
   "Gaborone", "Harare", "Maputo", "Antananarivo", "Kampala", "Dar es Salaam",
   "Khartoum", "Asmara", "Djibouti", "Xi'an", "Harbin", "Ulaanbaatar", "Bishkek",
   "Samarkand", "Thimphu", "Malé", "Chiang Mai", "Vientiane", "Alice Springs",
   "Suva", "Port Moresby", "Iqaluit", "Whitehorse", "Oaxaca", "Belmopan", "Ushuaia",
   "Valparaíso", "Cusco", "Georgetown", "Paramaribo"],
] as const;

export const CITY_LADDER = ladder<{ name: string }>(CITY_BANDS, (c) => c.name, false);

// ---------------------------------------------------------------------------
// Currencies, by whether the code and the sign mean anything to you.
//
// The steepest cut of the seven: 95 of 154 survive. A currency round shows a
// three-letter code and a symbol and nothing else, so a currency you have not
// met is not a hard question but a blank one — there is nothing on screen to
// reason from. Everything dropped is a currency whose own country is the only
// place it is ever seen: the Aruban florin, the Saint Helena pound, the
// Vanuatu vatu.
// ---------------------------------------------------------------------------

const CURRENCY_BANDS = [
  ["EUR", "USD", "GBP", "JPY", "CHF", "CNY", "INR", "CAD", "AUD", "RUB",
   "BRL", "MXN", "ZAR", "KRW", "SEK", "NOK", "DKK", "NZD", "TRY"],

  ["PLN", "THB", "SGD", "HKD", "ILS", "EGP", "ARS", "CLP", "COP", "PEN",
   "PHP", "IDR", "MYR", "VND", "PKR", "SAR", "AED", "QAR", "ISK"],

  ["CZK", "HUF", "RON", "UAH", "BGN", "RSD", "MAD", "KES", "NGN", "GHS",
   "ETB", "TWD", "KWD", "BHD", "OMR", "JOD", "LBP", "IRR", "IQD"],

  ["NPR", "LKR", "BDT", "AFN", "MMK", "KHR", "LAK", "MNT", "KZT", "UZS",
   "AZN", "GEL", "AMD", "BYN", "ALL", "MKD", "BAM", "MDL", "TND"],

  ["DZD", "LYD", "SDG", "SYP", "YER", "TZS", "UGX", "ZMW", "MWK", "BWP",
   "NAD", "MZN", "AOA", "RWF", "XOF", "XAF", "CUP", "DOP", "JMD"],
] as const;

export const CURRENCY_LADDER = ladder<{ code: string }>(CURRENCY_BANDS, (c) => c.code, true);

// ---------------------------------------------------------------------------
// Companies, by whether you know the brand *and* could place it.
//
// The written bands are 150 of the 486, and the rest are the last band of a
// duel or a game off the shelf. The pool was assembled from Simple Icons,
// which carries every brand that has ever had a logo drawn for it, so most of
// it is regional software nobody outside one country has met — Kueski, Xendit,
// Viblo, Draugiem.lv. Those are not hard rounds, they are rounds with no
// question in them.
//
// Banded on the *pair* rather than on the brand: Nokia is not the hardest name
// here but everyone knows it is Finnish, while Zara is a household name whose
// country is a real question.
//
// A trap — a brand whose registered country is the opposite of what everyone
// believes — belongs in the **last** band and nowhere else. Three of them are
// down there and the note beside them says which. Shell, which really did move
// to London in 2022, is a milder case and sits in the fourth.
// ---------------------------------------------------------------------------

const COMPANY_BANDS = [
  ["Apple", "Google", "Nike", "McDonald's", "Coca-Cola", "Tesla", "Boeing", "Ford",
   "Starbucks", "Netflix", "Toyota", "Sony", "Samsung", "Ferrari", "Emirates",
   "Adidas", "BMW", "Volkswagen", "Mastercard", "Spotify", "Visa", "Nokia", "Zara",
   // The airlines named after the place they fly from: a gift, and a first
   // round is meant to be one.
   "Air France", "Japan Airlines", "Turkish Airlines", "Qatar Airways",
   "Singapore Airlines", "Air India", "Ethiopian Airlines"],

  ["Intel", "Nvidia", "PayPal", "Uber", "Airbnb", "Meta", "British Airways",
   "General Motors", "FedEx", "Honda", "Nissan", "Panasonic", "Hyundai", "LG",
   "Porsche", "Audi", "Lamborghini", "Fiat", "Puma", "Siemens", "Philips Hue",
   "Volvo", "Ericsson", "American Express", "UPS", "Delta", "Snapchat", "Etsy",
   "Marriott", "Iberia"],

  ["Cisco", "Qualcomm", "AMD", "Dell", "HP", "Motorola", "eBay", "Reddit",
   "Pinterest", "Zoom", "Dropbox", "GitHub", "Shopify", "Vodafone", "HSBC",
   "Barclays", "Tesco", "Rolls-Royce", "Aston Martin", "Bentley", "McLaren",
   "Ryanair", "Lufthansa", "DHL", "3M", "Caterpillar", "Unilever", "GSK", "Sky",
   "Aeroflot"],

  ["Mazda", "Subaru", "Suzuki", "Mitsubishi", "Hitachi", "Toshiba", "Sharp",
   "Fujifilm", "Nikon", "Yamaha Corporation", "Uniqlo", "Sega", "Konami", "Kia",
   "Huawei", "Xiaomi", "Lenovo", "Alibaba.com", "WeChat", "ByteDance", "ASUS",
   "Acer", "HTC", "Shell", "Rakuten", "Baidu", "OPPO", "DJI", "Infosys", "Tata"],

  ["Bosch", "SAP", "Deutsche Bank", "Red Bull", "ABB", "Renault", "Peugeot",
   "Citroën", "Ubisoft", "Hermès", "Dior", "Carrefour", "Ducati", "Maserati",
   "Telefónica", "SEAT", "Booking.com", "KLM", "H&M", "Klarna", "Škoda",
   "Qantas", "Atlassian", "Adyen", "Scania", "Carlsberg", "Dacia",
   // The three that were out of the game altogether for being traps, and are
   // back here because a trap *is* a fifth round. Each is filed under a country
   // that is legally right and the opposite of what everyone believes: IKEA and
   // Airbus under the Netherlands, Garmin under Switzerland. The data's own
   // facts admit it — IKEA is Swedish by birth, they say, but the brand is
   // owned from the Netherlands. In the first band that punishes knowing the
   // brand; in the last one it is the question.
   "IKEA", "Airbus", "Garmin"],
] as const;

export const COMPANY_LADDER = ladder<{ name: string }>(COMPANY_BANDS, (c) => c.name, true);

// ---------------------------------------------------------------------------
// The three games with a real measurement to hand.
//
// A written list is for the games where "easy" means "you have heard of it".
// These three have something better, and a measurement never goes stale the way
// a list does — nobody has to remember to re-band it when the data changes.
// ---------------------------------------------------------------------------

/**
 * Tube stations, by how central and how well connected.
 *
 * The fare zone is the whole of it and the interchange is the tie-break: a zone
 * 1 station where five lines meet is one every visitor has stood in, and a
 * single-line stop in zone 6 is one only the people who live there use. **The
 * map carries no names**, so this really is knowledge and not a search.
 *
 * **No floor at all, and no wide pool either.** All 269 stations are in every
 * way of playing it, including today's round. This is the one game already
 * pitched at people who know the network — a Londoner who has never heard of
 * Roding Valley is not really a Londoner — and the eight stations out past
 * Rickmansworth, which are in Buckinghamshire rather than London, land in the
 * hardest band on their fare zone alone without being told to.
 */
export const tubeFame = (s: { zone: number; lines: string[] }): number =>
  10 - s.zone + s.lines.length;

/**
 * Clocks, by how many countries keep them.
 *
 * The right measure and a free one: a clock forty-six countries share is a band
 * across half a continent and hard to miss, while one kept by a single country
 * is a question about that country and nothing else. It also lands the
 * half-hours in roughly the right place without being told about them — India's
 * UTC+5:30 has company, Iran's UTC+3:30 has none.
 *
 * **No floor here either.** There are only thirty-five clocks in the world and
 * taking ten of them out would be taking a third of the game, so the
 * quarter-hour oddities — Nepal's UTC+5:45, the Chathams' UTC+12:45 — stay, and
 * this measure files them in the hardest band without being told to: a clock
 * one country keeps is one country to find.
 */
export const clockFame = (t: { countries: unknown[] }): number => t.countries.length;
