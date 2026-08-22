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
 * **The ladder is also the floor, and that is half its job.** What a ladder
 * leaves out is not in the pool at all, so a game can no longer ask which
 * country spends the Vanuatu vatu or where the head office of Draugiem.lv is.
 * The hard end is meant to be *hard*, not *unanswerable*: a player who has
 * finished five rounds should feel they were beaten by the last one rather than
 * that it was a trick. Everything in the bottom band below is a place, a brand
 * or a currency somebody could reasonably have met.
 *
 * **Bands should stay roughly equal in size.** `climbingDeal` cuts the ranked
 * pool into as many slices as there are rounds and takes one from each, and it
 * cuts *by count* — it knows nothing about the bands written here. Equal bands
 * are what make the two line up. Where they drift a little the game still
 * climbs; where one band is half the pool it does not.
 *
 * **Not every game needs a written ladder.** Three of the seven have a real
 * measurement to hand and use it instead — see the table in CLAUDE.md. Writing
 * a list is for the games where the thing that makes a target easy is whether
 * you have *heard of it*, and there is no column in any dataset for that.
 */

/** Targets, in bands, easiest band first. */
type Bands = readonly (readonly string[])[];

/**
 * `K` is only what the ladder needs to read — a code, or a name. `pool` stays
 * generic in the target it is handed so that filtering a list of cities gives
 * back cities rather than the bare shape the key was read off.
 */
export interface Ladder<K> {
  /** Only the targets the ladder names — which is where the pool now stops. */
  pool: <T extends K>(all: T[]) => T[];
  /** Bigger is easier, which is what `useGame`'s `easierBy` wants. */
  easierBy: (t: K) => number;
  /** Every key the ladder names, for the games that share one. */
  keys: ReadonlySet<string>;
}

function ladder<K>(bands: Bands, keyOf: (t: K) => string): Ladder<K> {
  const order = bands.flat();
  const rank = new Map(order.map((key, i) => [key, i]));
  return {
    pool: (all) => all.filter((t) => rank.has(keyOf(t))),
    // **The place in the flattened list, not the band's index.** Ranking by
    // band would leave every target in a band tied, and `climbingDeal` sorts
    // before it slices — so the pool's own order would decide who fell in which
    // slice, and a pool that is rebuilt or reordered would quietly re-deal a
    // day that had already been played. The bands are how the order is written
    // down and read; the order is what the deal runs on.
    easierBy: (t) => order.length - (rank.get(keyOf(t)) ?? order.length),
    keys: new Set(rank.keys()),
  };
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
export const COUNTRY_LADDER = ladder<{ code: string }>(COUNTRY_BANDS, (c) => c.code);

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

export const CITY_LADDER = ladder<{ name: string }>(CITY_BANDS, (c) => c.name);

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

export const CURRENCY_LADDER = ladder<{ code: string }>(CURRENCY_BANDS, (c) => c.code);

// ---------------------------------------------------------------------------
// Companies, by whether you know the brand *and* could place it.
//
// The other steep cut: 120 of 486. The pool was assembled from Simple Icons,
// which carries every brand that has ever had a logo drawn for it, so most of
// it is regional software nobody outside one country has met — Kueski, Xendit,
// Viblo, Draugiem.lv. Those are not hard rounds, they are rounds with no
// question in them.
//
// Banded on the *pair* rather than on the brand: Nokia is not the hardest name
// here but everyone knows it is Finnish, while Zara is a household name whose
// country is a real question.
//
// **Three famous brands are left out for being traps rather than questions.**
// IKEA, Airbus and Garmin are filed here under the Netherlands, the Netherlands
// and Switzerland, and each of those is the legally correct answer and the
// opposite of what everyone believes — the data's own facts say so ("Is Swedish
// by birth, but the brand is owned from the Netherlands"; "Is registered in
// Switzerland though most of its engineers sit in Kansas"). A round nobody can
// win by knowing the brand is not a hard round, it is an unfair one. Shell,
// which really did move to London in 2022, is kept but sits in the fourth band
// rather than the first.
// ---------------------------------------------------------------------------

const COMPANY_BANDS = [
  ["Apple", "Google", "Nike", "McDonald's", "Coca-Cola", "Tesla", "Boeing", "Ford",
   "Starbucks", "Netflix", "Toyota", "Sony", "Samsung", "Ferrari", "Emirates",
   "Adidas", "BMW", "Volkswagen", "Mastercard", "Spotify", "Visa", "Nokia", "Zara"],

  ["Intel", "Nvidia", "PayPal", "Uber", "Airbnb", "Meta", "British Airways",
   "General Motors", "FedEx", "Honda", "Nissan", "Panasonic", "Hyundai", "LG",
   "Porsche", "Audi", "Lamborghini", "Fiat", "Puma", "Siemens", "Philips Hue",
   "Volvo", "Ericsson"],

  ["Cisco", "Qualcomm", "AMD", "Dell", "HP", "Motorola", "eBay", "Reddit",
   "Pinterest", "Zoom", "Dropbox", "GitHub", "Shopify", "Vodafone", "HSBC",
   "Barclays", "Tesco", "Rolls-Royce", "Aston Martin", "Bentley", "McLaren",
   "Ryanair", "Lufthansa", "DHL"],

  ["Mazda", "Subaru", "Suzuki", "Mitsubishi", "Hitachi", "Toshiba", "Sharp",
   "Fujifilm", "Nikon", "Yamaha Corporation", "Uniqlo", "Sega", "Konami", "Kia",
   "Huawei", "Xiaomi", "Lenovo", "Alibaba.com", "WeChat", "ByteDance", "ASUS",
   "Acer", "HTC", "Shell"],

  ["Bosch", "SAP", "Deutsche Bank", "Red Bull", "ABB", "Renault", "Peugeot",
   "Citroën", "Ubisoft", "Hermès", "Dior", "Carrefour", "Ducati", "Maserati",
   "Telefónica", "SEAT", "Booking.com", "KLM", "H&M", "Klarna", "Škoda",
   "Qantas", "Atlassian"],
] as const;

export const COMPANY_LADDER = ladder<{ name: string }>(COMPANY_BANDS, (c) => c.name);

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
 * Nothing on it needs a written list, but it does need a floor: the eight
 * stations in zones 7 to 9 are not in London at all — they are the far end of
 * the Metropolitan line, out past Rickmansworth into Buckinghamshire — and no
 * amount of knowing the tube map helps with somewhere that isn't on the part of
 * it anybody looks at.
 */
export const OUTERMOST_TUBE_ZONE = 6;
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
 * The floor is `MIN_CLOCK_COUNTRIES`, and it is what takes out the quarter-hour
 * oddities — Nepal's UTC+5:45, the Chathams' UTC+12:45 — which are famous only
 * for being odd and are a single small target on the map.
 */
export const MIN_CLOCK_COUNTRIES = 2;
export const clockFame = (t: { countries: unknown[] }): number => t.countries.length;
