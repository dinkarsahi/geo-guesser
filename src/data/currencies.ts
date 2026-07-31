import type { Country } from "./countries";

export interface Currency {
  /** ISO 4217 code, e.g. "EUR". */
  code: string;
  /** How it's written, e.g. "€". Falls back to the code where there's no sign. */
  symbol: string;
  /** Full name, e.g. "Euro". */
  name: string;
}

/**
 * A currency and every country on the map that spends it. The round is built
 * around the currency rather than a country, because that's what the question
 * is: twenty countries answer to the euro and any of them is right.
 */
export interface CurrencyTarget extends Currency {
  /** Countries whose main currency this is, alphabetically. */
  countries: Country[];
  /** Stand-in location, only used before a guess picks a nearer one. */
  lat: number;
  lng: number;
  fact: string;
}

/** ISO 4217 code -> how to write it and what to call it. */
const MONEY: Record<string, { symbol: string; name: string }> = {
  AED: { symbol: "د.إ", name: "UAE Dirham" },
  AFN: { symbol: "؋", name: "Afghan Afghani" },
  ALL: { symbol: "L", name: "Albanian Lek" },
  AMD: { symbol: "֏", name: "Armenian Dram" },
  ANG: { symbol: "ƒ", name: "Netherlands Antillean Guilder" },
  AOA: { symbol: "Kz", name: "Angolan Kwanza" },
  ARS: { symbol: "$", name: "Argentine Peso" },
  AUD: { symbol: "$", name: "Australian Dollar" },
  AWG: { symbol: "ƒ", name: "Aruban Florin" },
  AZN: { symbol: "₼", name: "Azerbaijani Manat" },
  BAM: { symbol: "KM", name: "Bosnia-Herzegovina Convertible Mark" },
  BBD: { symbol: "$", name: "Barbadian Dollar" },
  BDT: { symbol: "৳", name: "Bangladeshi Taka" },
  BGN: { symbol: "лв", name: "Bulgarian Lev" },
  BHD: { symbol: ".د.ب", name: "Bahraini Dinar" },
  BIF: { symbol: "FBu", name: "Burundian Franc" },
  BMD: { symbol: "$", name: "Bermudian Dollar" },
  BND: { symbol: "$", name: "Brunei Dollar" },
  BOB: { symbol: "Bs.", name: "Bolivian Boliviano" },
  BRL: { symbol: "R$", name: "Brazilian Real" },
  BSD: { symbol: "$", name: "Bahamian Dollar" },
  BTN: { symbol: "Nu.", name: "Bhutanese Ngultrum" },
  BWP: { symbol: "P", name: "Botswana Pula" },
  BYN: { symbol: "Br", name: "Belarusian Ruble" },
  BZD: { symbol: "$", name: "Belize Dollar" },
  CAD: { symbol: "$", name: "Canadian Dollar" },
  CDF: { symbol: "FC", name: "Congolese Franc" },
  CHF: { symbol: "Fr.", name: "Swiss Franc" },
  CLP: { symbol: "$", name: "Chilean Peso" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
  COP: { symbol: "$", name: "Colombian Peso" },
  CRC: { symbol: "₡", name: "Costa Rican Colón" },
  CUP: { symbol: "$", name: "Cuban Peso" },
  CVE: { symbol: "$", name: "Cape Verdean Escudo" },
  CZK: { symbol: "Kč", name: "Czech Koruna" },
  DJF: { symbol: "Fdj", name: "Djiboutian Franc" },
  DKK: { symbol: "kr", name: "Danish Krone" },
  DOP: { symbol: "$", name: "Dominican Peso" },
  DZD: { symbol: "د.ج", name: "Algerian Dinar" },
  EGP: { symbol: "£", name: "Egyptian Pound" },
  ERN: { symbol: "Nfk", name: "Eritrean Nakfa" },
  ETB: { symbol: "Br", name: "Ethiopian Birr" },
  EUR: { symbol: "€", name: "Euro" },
  FJD: { symbol: "$", name: "Fijian Dollar" },
  FKP: { symbol: "£", name: "Falkland Islands Pound" },
  GBP: { symbol: "£", name: "Pound Sterling" },
  GEL: { symbol: "₾", name: "Georgian Lari" },
  GHS: { symbol: "₵", name: "Ghanaian Cedi" },
  GIP: { symbol: "£", name: "Gibraltar Pound" },
  GMD: { symbol: "D", name: "Gambian Dalasi" },
  GNF: { symbol: "FG", name: "Guinean Franc" },
  GTQ: { symbol: "Q", name: "Guatemalan Quetzal" },
  GYD: { symbol: "$", name: "Guyanese Dollar" },
  HKD: { symbol: "$", name: "Hong Kong Dollar" },
  HNL: { symbol: "L", name: "Honduran Lempira" },
  HTG: { symbol: "G", name: "Haitian Gourde" },
  HUF: { symbol: "Ft", name: "Hungarian Forint" },
  IDR: { symbol: "Rp", name: "Indonesian Rupiah" },
  ILS: { symbol: "₪", name: "Israeli New Shekel" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  IQD: { symbol: "ع.د", name: "Iraqi Dinar" },
  IRR: { symbol: "﷼", name: "Iranian Rial" },
  ISK: { symbol: "kr", name: "Icelandic Króna" },
  JMD: { symbol: "$", name: "Jamaican Dollar" },
  JOD: { symbol: "د.ا", name: "Jordanian Dinar" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  KES: { symbol: "KSh", name: "Kenyan Shilling" },
  KGS: { symbol: "с", name: "Kyrgyzstani Som" },
  KHR: { symbol: "៛", name: "Cambodian Riel" },
  KMF: { symbol: "CF", name: "Comorian Franc" },
  KPW: { symbol: "₩", name: "North Korean Won" },
  KRW: { symbol: "₩", name: "South Korean Won" },
  KWD: { symbol: "د.ك", name: "Kuwaiti Dinar" },
  KYD: { symbol: "$", name: "Cayman Islands Dollar" },
  KZT: { symbol: "₸", name: "Kazakhstani Tenge" },
  LAK: { symbol: "₭", name: "Lao Kip" },
  LBP: { symbol: "ل.ل", name: "Lebanese Pound" },
  LKR: { symbol: "Rs", name: "Sri Lankan Rupee" },
  LRD: { symbol: "$", name: "Liberian Dollar" },
  LSL: { symbol: "L", name: "Lesotho Loti" },
  LYD: { symbol: "ل.د", name: "Libyan Dinar" },
  MAD: { symbol: "د.م.", name: "Moroccan Dirham" },
  MDL: { symbol: "L", name: "Moldovan Leu" },
  MGA: { symbol: "Ar", name: "Malagasy Ariary" },
  MKD: { symbol: "ден", name: "Macedonian Denar" },
  MMK: { symbol: "K", name: "Burmese Kyat" },
  MNT: { symbol: "₮", name: "Mongolian Tögrög" },
  MOP: { symbol: "MOP$", name: "Macanese Pataca" },
  MRU: { symbol: "UM", name: "Mauritanian Ouguiya" },
  MUR: { symbol: "₨", name: "Mauritian Rupee" },
  MVR: { symbol: ".ރ", name: "Maldivian Rufiyaa" },
  MWK: { symbol: "MK", name: "Malawian Kwacha" },
  MXN: { symbol: "$", name: "Mexican Peso" },
  MYR: { symbol: "RM", name: "Malaysian Ringgit" },
  MZN: { symbol: "MT", name: "Mozambican Metical" },
  NAD: { symbol: "$", name: "Namibian Dollar" },
  NGN: { symbol: "₦", name: "Nigerian Naira" },
  NIO: { symbol: "C$", name: "Nicaraguan Córdoba" },
  NOK: { symbol: "kr", name: "Norwegian Krone" },
  NPR: { symbol: "₨", name: "Nepalese Rupee" },
  NZD: { symbol: "$", name: "New Zealand Dollar" },
  OMR: { symbol: "ر.ع.", name: "Omani Rial" },
  PAB: { symbol: "B/.", name: "Panamanian Balboa" },
  PEN: { symbol: "S/", name: "Peruvian Sol" },
  PGK: { symbol: "K", name: "Papua New Guinean Kina" },
  PHP: { symbol: "₱", name: "Philippine Peso" },
  PKR: { symbol: "₨", name: "Pakistani Rupee" },
  PLN: { symbol: "zł", name: "Polish Złoty" },
  PYG: { symbol: "₲", name: "Paraguayan Guaraní" },
  QAR: { symbol: "ر.ق", name: "Qatari Riyal" },
  RON: { symbol: "lei", name: "Romanian Leu" },
  RSD: { symbol: "дин.", name: "Serbian Dinar" },
  RUB: { symbol: "₽", name: "Russian Ruble" },
  RWF: { symbol: "FRw", name: "Rwandan Franc" },
  SAR: { symbol: "ر.س", name: "Saudi Riyal" },
  SBD: { symbol: "$", name: "Solomon Islands Dollar" },
  SCR: { symbol: "₨", name: "Seychellois Rupee" },
  SDG: { symbol: "ج.س.", name: "Sudanese Pound" },
  SEK: { symbol: "kr", name: "Swedish Krona" },
  SGD: { symbol: "$", name: "Singapore Dollar" },
  SHP: { symbol: "£", name: "Saint Helena Pound" },
  SLE: { symbol: "Le", name: "Sierra Leonean Leone" },
  SOS: { symbol: "Sh", name: "Somali Shilling" },
  SRD: { symbol: "$", name: "Surinamese Dollar" },
  SSP: { symbol: "£", name: "South Sudanese Pound" },
  STN: { symbol: "Db", name: "São Tomé and Príncipe Dobra" },
  SYP: { symbol: "£", name: "Syrian Pound" },
  SZL: { symbol: "L", name: "Swazi Lilangeni" },
  THB: { symbol: "฿", name: "Thai Baht" },
  TJS: { symbol: "SM", name: "Tajikistani Somoni" },
  TMT: { symbol: "m", name: "Turkmenistan Manat" },
  TND: { symbol: "د.ت", name: "Tunisian Dinar" },
  TOP: { symbol: "T$", name: "Tongan Paʻanga" },
  TRY: { symbol: "₺", name: "Turkish Lira" },
  TTD: { symbol: "$", name: "Trinidad and Tobago Dollar" },
  TWD: { symbol: "NT$", name: "New Taiwan Dollar" },
  TZS: { symbol: "TSh", name: "Tanzanian Shilling" },
  UAH: { symbol: "₴", name: "Ukrainian Hryvnia" },
  UGX: { symbol: "USh", name: "Ugandan Shilling" },
  USD: { symbol: "$", name: "US Dollar" },
  UYU: { symbol: "$", name: "Uruguayan Peso" },
  UZS: { symbol: "so'm", name: "Uzbekistani Som" },
  VES: { symbol: "Bs.", name: "Venezuelan Bolívar" },
  VND: { symbol: "₫", name: "Vietnamese Đồng" },
  VUV: { symbol: "VT", name: "Vanuatu Vatu" },
  WST: { symbol: "T", name: "Samoan Tālā" },
  XAF: { symbol: "FCFA", name: "Central African CFA Franc" },
  XCD: { symbol: "$", name: "East Caribbean Dollar" },
  XOF: { symbol: "CFA", name: "West African CFA Franc" },
  XPF: { symbol: "₣", name: "CFP Franc" },
  YER: { symbol: "﷼", name: "Yemeni Rial" },
  ZAR: { symbol: "R", name: "South African Rand" },
  ZMW: { symbol: "ZK", name: "Zambian Kwacha" },
  ZWL: { symbol: "$", name: "Zimbabwean Dollar" },
};

/**
 * What each country mainly spends, by ISO alpha-2. Only the everyday currency
 * counts: plenty of places will take dollars, but the question is what comes
 * out of the cash machine.
 */
const SPENDS: Record<string, string> = {
  // --- Europe ---------------------------------------------------------
  ad: "EUR", al: "ALL", at: "EUR", ax: "EUR", ba: "BAM", be: "EUR", bg: "BGN",
  by: "BYN", ch: "CHF", cy: "EUR", cz: "CZK", de: "EUR", dk: "DKK", ee: "EUR",
  es: "EUR", fi: "EUR", fo: "DKK", fr: "EUR", gb: "GBP", gg: "GBP", gi: "GIP",
  gr: "EUR", hr: "EUR", hu: "HUF", ie: "EUR", im: "GBP", is: "ISK", it: "EUR",
  je: "GBP", li: "CHF", lt: "EUR", lu: "EUR", lv: "EUR", mc: "EUR", md: "MDL",
  me: "EUR", mk: "MKD", mt: "EUR", nl: "EUR", no: "NOK", pl: "PLN", pt: "EUR",
  ro: "RON", rs: "RSD", ru: "RUB", se: "SEK", si: "EUR", sk: "EUR", sm: "EUR",
  ua: "UAH", va: "EUR", xk: "EUR",

  // --- Americas -------------------------------------------------------
  ag: "XCD", ai: "XCD", ar: "ARS", aw: "AWG", bb: "BBD", bl: "EUR", bm: "BMD",
  bo: "BOB", br: "BRL", bs: "BSD", bz: "BZD", ca: "CAD", cl: "CLP", co: "COP",
  cr: "CRC", cu: "CUP", cw: "ANG", dm: "XCD", do: "DOP", ec: "USD", fk: "FKP",
  gd: "XCD", gf: "EUR", gl: "DKK", gt: "GTQ", gy: "GYD", hn: "HNL", ht: "HTG",
  jm: "JMD", kn: "XCD", ky: "KYD", lc: "XCD", mf: "EUR", mx: "MXN", ms: "XCD",
  ni: "NIO", pa: "PAB", pe: "PEN", pm: "EUR", pr: "USD", py: "PYG", sr: "SRD",
  sv: "USD", sx: "ANG", tc: "USD", tt: "TTD", us: "USD", uy: "UYU", vc: "XCD",
  ve: "VES", vg: "USD", vi: "USD",

  // --- Africa ---------------------------------------------------------
  ao: "AOA", bf: "XOF", bi: "BIF", bj: "XOF", bw: "BWP", cd: "CDF", cf: "XAF",
  cg: "XAF", ci: "XOF", cm: "XAF", cv: "CVE", dj: "DJF", dz: "DZD", eg: "EGP",
  eh: "MAD", er: "ERN", et: "ETB", ga: "XAF", gh: "GHS", gm: "GMD", gn: "GNF",
  gq: "XAF", gw: "XOF", io: "USD", ke: "KES", km: "KMF", lr: "LRD", ls: "LSL", ly: "LYD",
  ma: "MAD", mg: "MGA", ml: "XOF", mr: "MRU", mu: "MUR", mw: "MWK", mz: "MZN",
  na: "NAD", ne: "XOF", ng: "NGN", rw: "RWF", sc: "SCR", sd: "SDG", sh: "SHP",
  sl: "SLE", sn: "XOF", so: "SOS", ss: "SSP", st: "STN", sz: "SZL", td: "XAF",
  tg: "XOF", tn: "TND", tz: "TZS", ug: "UGX", za: "ZAR", zm: "ZMW", zw: "ZWL",

  // --- Asia and the Middle East ---------------------------------------
  ae: "AED", af: "AFN", am: "AMD", az: "AZN", bd: "BDT", bh: "BHD", bn: "BND",
  bt: "BTN", cn: "CNY", ge: "GEL", hk: "HKD", id: "IDR", il: "ILS", in: "INR",
  iq: "IQD", ir: "IRR", jo: "JOD", jp: "JPY", kg: "KGS", kh: "KHR", kp: "KPW",
  kr: "KRW", kw: "KWD", kz: "KZT", la: "LAK", lb: "LBP", lk: "LKR", mm: "MMK",
  mn: "MNT", mo: "MOP", mv: "MVR", my: "MYR", np: "NPR", om: "OMR", ph: "PHP",
  pk: "PKR", ps: "ILS", qa: "QAR", sa: "SAR", sg: "SGD", sy: "SYP", th: "THB",
  tj: "TJS", tl: "USD", tm: "TMT", tr: "TRY", tw: "TWD", uz: "UZS", vn: "VND",
  ye: "YER",

  // --- Oceania --------------------------------------------------------
  as: "USD", au: "AUD", ck: "NZD", fj: "FJD", fm: "USD", gu: "USD", ki: "AUD",
  mh: "USD", mp: "USD", nc: "XPF", nf: "AUD", nr: "AUD", nu: "NZD", nz: "NZD",
  pf: "XPF", pg: "PGK", pn: "NZD", pw: "USD", sb: "SBD", to: "TOP", tv: "AUD", vu: "VUV",
  wf: "XPF", ws: "WST",
};

/** Readable list: "A", "A and B", "A, B and C". */
function listNames(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Where the currency's countries sit on average — the fallback location. */
function middleOf(countries: Country[]): { lat: number; lng: number } {
  const lat = countries.reduce((a, c) => a + c.lat, 0) / countries.length;
  const lng = countries.reduce((a, c) => a + c.lng, 0) / countries.length;
  // The country nearest that average, so the marker lands on land rather than
  // in whatever ocean happens to be in the middle of the group.
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

function factFor(money: Currency, countries: Country[]): string {
  if (countries.length === 1)
    return `The ${money.name} (${money.code}) is the money of ${countries[0].name}.`;
  const named = countries.slice(0, 3).map((c) => c.name);
  return `The ${money.name} (${money.code}) is spent across ${countries.length} countries on this map, among them ${listNames(named)}.`;
}

let cachedFor: Country[] | null = null;
let cached: CurrencyTarget[] = [];

/**
 * Every currency on the map, each carrying the countries that spend it. Built
 * from the same country pool the flag round uses, so a currency can never be
 * asked about unless there's somewhere on the map to click for it. Cached by
 * pool identity, which keeps the array stable and with it the game's memory of
 * what it has already dealt.
 */
export function currencyPool(countries: Country[]): CurrencyTarget[] {
  if (!countries.length) return [];
  if (countries === cachedFor) return cached;

  const groups = new Map<string, Country[]>();
  for (const c of countries) {
    const code = SPENDS[c.code];
    if (!code || !MONEY[code]) continue;
    const group = groups.get(code);
    if (group) group.push(c);
    else groups.set(code, [c]);
  }

  const out: CurrencyTarget[] = [];
  for (const [code, group] of groups) {
    group.sort((a, b) => a.name.localeCompare(b.name));
    const money = { code, ...MONEY[code] };
    out.push({ ...money, countries: group, ...middleOf(group), fact: factFor(money, group) });
  }

  cachedFor = countries;
  cached = out.sort((a, b) => a.code.localeCompare(b.code));
  return cached;
}
