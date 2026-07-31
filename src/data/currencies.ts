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

/**
 * Something worth knowing about the money itself, by ISO 4217 code. The point
 * of the card is to tell you something the reveal hasn't already: "the Belarusian
 * ruble is the money of Belarus" is no use to anyone who has just been shown
 * Belarus. Anything without an entry falls back to a fact about the country it
 * belongs to, which at least isn't circular.
 */
const writtenFacts: Record<string, string> = {
  EUR: "The bridges and arches on euro notes were invented so they'd favour no country — until a Dutch town went and built them all for real.",
  USD: "The dollar sign is thought to come from the Spanish peso, written as a p over an s until the two collapsed into one stroke.",
  GBP: "Sterling has been minted in one form or another for over 1,200 years, making it the oldest currency still in use.",
  JPY: "The yen has no small change: the sen, worth a hundredth of one, was abolished in 1953 and prices have been whole numbers since.",
  CHF: "Swiss notes are printed on cotton and linen rather than paper, and will survive a cycle in the washing machine.",
  CNY: "The renminbi is the currency and the yuan is the unit you count in — the same distinction as sterling and the pound.",
  INR: "The rupee only got its own sign in 2010, drawn as the Devanagari letter र crossed with a bar.",
  RUB: "The ruble takes its name from a word meaning 'to chop': the earliest ones were lumps hacked off a silver bar.",
  KRW: "South Korea's smallest everyday coin is 10 won — the ones and fives were left behind by decades of inflation.",
  BRL: "The real was brought in during 1994 to break an inflation rate that had passed 2,000% a year, and it worked.",
  CAD: "Canada stopped making the penny in 2012; cash totals are simply rounded to the nearest five cents.",
  AUD: "Australia was the first country to put its money on polymer, in 1988, and the notes outlast paper several times over.",
  NZD: "New Zealand rounds cash to the nearest ten cents, having retired every coin smaller than that.",
  SEK: "Krona, krone and króna are all just 'crown' — the Nordic countries picked the same name and then went their separate ways.",
  ISK: "Iceland's króna has had no small change since 2003, when the eyrir was finally given up on.",
  ZAR: "The rand is named after the Witwatersrand, the ridge of rock that South Africa's gold came out of.",
  TRY: "The lira lost six zeroes overnight in 2005: a million old lira became one new one.",
  KWD: "The Kuwaiti dinar is the highest-valued currency unit in the world, worth several US dollars.",
  XOF: "The West African CFA franc and its Central African twin are worth exactly the same and are not accepted in each other's countries.",
  XAF: "The Central African CFA franc is pegged to the euro, a legacy of having once been pegged to the French franc.",
  XCD: "The East Caribbean dollar has been pinned to the US dollar at the same rate since 1976.",
  XPF: "The CFP franc is the money of France's Pacific territories, half a world from the euro it's pegged to.",
  VND: "Vietnam's đồng runs to five and six figures for ordinary prices — a cup of coffee costs tens of thousands.",
  BYN: "Belarus struck four zeroes off the ruble in 2016: 10,000 old rubles became one new one.",
  PLN: "Złoty simply means 'golden', a name it kept through the centuries after the gold went.",
  HUF: "The forint replaced the pengő in 1946, which by then held the record for the worst hyperinflation ever recorded.",
  ILS: "The shekel is one of the oldest units of money named anywhere, appearing in Mesopotamian records as a weight of barley.",
  MXN: "The Mexican peso is the direct descendant of the Spanish dollar, the coin the US dollar was itself modelled on.",
  ARS: "Argentina has replaced its currency five times since 1970, lopping off thirteen zeroes along the way.",
  NGN: "The naira was named by shortening 'Nigeria', chosen when the country left sterling behind in 1973.",
  THB: "The baht started as a unit of weight — about 15 grams — and gold is still sold by the baht in Thailand.",
  MYR: "The ringgit means 'jagged', after the milled edges of the Spanish silver dollars that once circulated there.",
  IDR: "Indonesia's rupiah shares its root with the Indian rupee, both from a Sanskrit word for wrought silver.",
  PHP: "The peso is called the piso in Filipino, and its sign is a P with two bars.",
  SGD: "Singapore and Brunei accept each other's money at face value, an arrangement running since 1967.",
  BND: "Brunei's dollar is interchangeable with Singapore's, and either is accepted in both countries.",
  HKD: "Hong Kong's notes are issued by three commercial banks rather than a central one, so they come in three designs.",
  MOP: "The pataca takes its name from a Portuguese term for the Mexican silver dollars that reached Macau by sea.",
  TWD: "Taiwan's dollar is still called the 'new' Taiwan dollar, seventy-five years after it replaced the old one.",
  PKR: "Pakistan's rupee kept the name it inherited at partition, as did India's, and the two have drifted far apart in value.",
  BDT: "The taka's name comes from the Sanskrit for a silver coin, and it's what Bengali speakers have long called money of any kind.",
  LKR: "Sri Lanka's rupee notes are printed the tall way up on the back, one of very few currencies to turn sideways.",
  NPR: "Nepal's rupee is pegged to India's, at a rate unchanged since 1993.",
  BTN: "Bhutan's ngultrum is pegged one-to-one with the Indian rupee, which circulates there just as freely.",
  SAR: "The riyal is pegged to the US dollar, which is why oil is priced in dollars without troubling the Saudi budget.",
  AED: "The dirham takes its name from the drachma, carried east by Greek traders and never given back.",
  EGP: "The Egyptian pound began as a copy of sterling in 1834 and has kept the pound sign ever since.",
  KES: "The shilling outlasted the empire that brought it: Kenya, Uganda, Tanzania and Somalia all still count in them.",
  ETB: "Ethiopia's birr means 'silver', and the country used salt bars as money well into the twentieth century.",
  GHS: "The cedi is named after the cowrie shell, which served as money along the Gold Coast for centuries.",
  MAD: "The dirham cannot legally leave Morocco, so what you don't spend has to be changed back before you fly.",
  DKK: "Denmark's krone is tied to the euro within a hair's breadth, without ever having joined it.",
  NOK: "Norway's krone is one of the few European currencies that floats freely against the euro.",
  CZK: "The koruna is another 'crown', kept on after the Czech Republic joined the EU and declined the euro.",
  RON: "The leu means 'lion', after Dutch thaler coins stamped with one that circulated in the region.",
  BGN: "The lev also means 'lion', and is pegged to the euro at a rate fixed since the Deutschmark days.",
  UAH: "The hryvnia is named after a neck ring of silver used as money in medieval Kyiv.",
  GEL: "The lari is one of very few currencies whose sign was chosen by public competition, in 2014.",
  KZT: "The tenge shares a root with 'tanga' and, distantly, with the word money itself across Turkic languages.",
  MNT: "Mongolia's tögrög means 'circle', named for the shape of a coin rather than anything it's worth.",
  PEN: "The sol is named for the sun, and for Inti, the sun god the currency was briefly named after outright.",
  CLP: "Chile's peso has no decimal places in practice — the centavo was abandoned to inflation long ago.",
  COP: "Colombia's peso is another descendant of the Spanish silver dollar, as are most pesos in the Americas.",
  CRC: "The colón is named after Christopher Columbus — Colón in Spanish — as is Costa Rica's neighbour's old currency.",
  PAB: "Panama mints its own coins as balboas but prints no notes, using US dollars for anything larger.",
  UYU: "Uruguay's peso is one of the few currencies where the sign is written $ but never confused with the dollar locally.",
  JMD: "Jamaica's dollar replaced the pound in 1969, one of the last Caribbean countries to make the switch.",
  TTD: "Trinidad and Tobago's dollar is the most traded currency of the English-speaking Caribbean.",
  FJD: "Fiji's dollar carried a portrait of Elizabeth II until 2013, when it was replaced with local wildlife.",
  PGK: "The kina is named after a pearl shell that served as money across Papua New Guinea long before coins.",
  WST: "Samoa's tālā is simply 'dollar' rendered in Samoan, as is the sene for cent.",
  TOP: "Tonga's paʻanga is named after a seed, and the country once issued a coin-shaped note.",
  MVR: "The rufiyaa's name comes from the same Sanskrit root as the rupee, carried across the Indian Ocean.",
  MMK: "The kyat began as a unit of weight for gold and silver, and Myanmar once issued notes in denominations of 45 and 90.",
  KHR: "Cambodia runs on two currencies at once: prices are often in US dollars, with riel used as the small change.",
  LAK: "The kip has no coins in circulation at all — everything is paid in notes.",
  IRR: "Iranians quote prices in tomans, worth ten rials each, so the number on the note is rarely the number said aloud.",
  IQD: "The Iraqi dinar is divided into 1,000 fils, though inflation retired the fils decades ago.",
  JOD: "The Jordanian dinar is divided into 1,000 fils and is one of the highest-valued currencies in the world.",
  LBP: "Lebanon's pound was pegged at 1,507 to the dollar for twenty-five years before the peg broke in 2019.",
  SYP: "The Syrian pound began life tied to the French franc, a leftover of the mandate years.",
  YER: "The rial and the older Maria Theresa thaler circulated side by side in Yemen well into the twentieth century.",
  OMR: "The Omani rial is worth more than two US dollars, among the highest-valued currencies anywhere.",
  QAR: "Qatar and Dubai shared a single riyal until 1973, when each went its own way.",
  BHD: "The Bahraini dinar is divided into 1,000 fils and is worth more than two and a half US dollars.",
  UZS: "Uzbekistan's som means simply 'pure', as in pure gold — a name shared with the Kyrgyz som.",
  AFN: "The afghani was reissued in 2002 at one new for a thousand old, ending a period when rival warlords printed their own.",
  ZMW: "Zambia's kwacha means 'dawn', from a slogan of the independence movement.",
  MWK: "Malawi's kwacha shares its name and its meaning — 'dawn' — with Zambia's, from the same era.",
  BWP: "The pula is Setswana for 'rain', which in a country that is mostly desert is the highest possible praise.",
  NAD: "Namibia's dollar is pegged one-to-one with the South African rand, which is legal tender there too.",
  LSL: "Lesotho's loti is pegged to the rand at par, and the rand is accepted everywhere in the country.",
  SZL: "The lilangeni is pegged to the rand at par; its plural, emalangeni, is what you'll see printed on the notes.",
  MGA: "The ariary is one of only two currencies left in the world not divisible by ten — it splits into five iraimbilanja.",
  MRU: "The ouguiya is the other non-decimal currency, divided into five khoums.",
  RWF: "Rwanda's franc is one of a dozen African francs that outlived the colonial currency they were named after.",
  CDF: "The Congolese franc has been reintroduced twice, most recently in 1998 after the zaire was abandoned.",
  AOA: "The kwanza is named after the river, and has been redenominated twice since Angola's independence.",
  MZN: "Mozambique's metical is named after a gold coin traded along the Swahili coast for centuries.",
  ZWL: "Zimbabwe once printed a hundred-trillion-dollar note, which now sells to collectors for rather more than it was worth.",
  SLE: "Sierra Leone's leone lost three zeroes in 2022, and the leone is named after the country, not the other way round.",
  GMD: "The dalasi's name comes from 'dala', a West African word for a five-franc coin.",
  CVE: "Cape Verde's escudo is pegged to the euro, a leftover of its long peg to the Portuguese escudo.",
  STN: "São Tomé and Príncipe knocked three zeroes off the dobra in 2018 and pegged what was left to the euro.",
  ALL: "The lek is named after Alexander the Great, who appears on the earliest of its coins as Leka i Madh.",
  AMD: "Dram simply means 'money' in Armenian, and shares its root with the Greek drachma.",
  AZN: "Manat comes from the Russian moneta, meaning coin — as does Turkmenistan's currency of the same name.",
  BAM: "The convertible mark was pegged to the Deutschmark when it was introduced in 1995, and moved to the euro with it.",
  BBD: "Barbados has held its dollar at exactly two to the US dollar since 1975.",
  BOB: "The boliviano is named after Simón Bolívar, as is the Venezuelan bolívar and indeed Bolivia.",
  BSD: "The Bahamian dollar runs one-to-one with the US dollar, and both circulate side by side in the islands.",
  BZD: "Belize holds its dollar at two to the US dollar, a rate unchanged since 1978.",
  CUP: "Cuba ran two currencies at once for a quarter of a century, until the convertible peso was finally scrapped in 2021.",
  DJF: "Djibouti's franc has been pegged to the US dollar since 1973, one of the longest-standing pegs in Africa.",
  DZD: "The dinar traces its name to the Roman denarius, as do the dinars of a dozen other countries.",
  ERN: "The nakfa is named after the mountain town that served as the base of Eritrea's independence fighters.",
  FKP: "The Falkland Islands pound is held at exactly one pound sterling, and the islands mint their own coins.",
  GIP: "Gibraltar prints its own pound, worth exactly one sterling — though British shops are under no obligation to take it.",
  GTQ: "The quetzal is named after the bird, whose tail feathers the Maya used as money in their own right.",
  HNL: "The lempira is named after a chief who led the resistance to Spanish conquest in the 1530s.",
  HTG: "The gourde is named after the fruit: Haiti's King Henri Christophe once made actual gourds legal tender.",
  KGS: "Som means 'pure', as in pure gold, and is the name Kyrgyzstan and Uzbekistan both landed on.",
  KMF: "The Comorian franc is pegged to the euro, at a rate inherited from the French franc.",
  KPW: "Won, yen and yuan are the same word — all three come from the character meaning 'round', after the shape of a coin.",
  KYD: "The Cayman Islands dollar is worth more than one US dollar, making it the highest-valued currency in the Americas.",
  LRD: "Liberia used US dollars as its money until 1943, and both still change hands there today.",
  LYD: "The Libyan dinar splits into 1,000 dirham, one of the few currencies with three decimal places.",
  MDL: "Moldova's leu means 'lion', the same name and the same Dutch coins behind it as Romania's.",
  MKD: "The denar is another descendant of the Roman denarius, chosen in 1992 for exactly that history.",
  NIO: "The córdoba is named after Francisco Hernández de Córdoba, the conquistador who founded Granada and León.",
  PYG: "The guaraní is named after the language, which Paraguay speaks alongside Spanish as an official tongue.",
  RSD: "The Serbian dinar has been in use on and off since medieval times, and is named for the Roman denarius.",
  SHP: "Saint Helena prints its own pound, worth one sterling, for an island 1,900 km from the nearest continent.",
  SRD: "Suriname replaced its guilder with the dollar in 2004, at a thousand guilders to one.",
  TJS: "The somoni is named after Ismail Samani, the ninth-century emir Tajikistan traces its nationhood to.",
  TND: "The Tunisian dinar splits into 1,000 millimes, and taking it out of the country is against the law.",
  UGX: "The Ugandan shilling has no subunit left in use — the cent was retired to inflation years ago.",
  VES: "Venezuela has struck fourteen zeroes off the bolívar since 2008, across three separate redenominations.",
  VUV: "The vatu has no subdivision at all: there are no cents, and never have been.",
  ANG: "The Netherlands Antillean guilder outlived the country it was named for by two decades, and is now being replaced by the Caribbean guilder.",
  SOS: "The Somali shilling kept circulating through decades without a functioning central bank, on trust alone.",
  MUR: "Mauritius put a woman on its banknotes decades before most countries did, and prints them in four scripts.",
  SCR: "The Seychelles rupee is one of the few currencies whose notes are designed around the country's wildlife rather than its people.",
  SBD: "The Solomon Islands dollar replaced the Australian dollar in 1977, and shell money is still used ceremonially.",
  GYD: "Guyana's dollar replaced the British West Indies dollar, which had served a dozen colonies at once.",
  DOP: "The Dominican peso is the only currency in the Caribbean still called a peso, the rest having gone over to dollars.",
  BMD: "The Bermudian dollar is pegged one-to-one with the US dollar, and both are accepted across the islands.",
  AWG: "The florin takes its name from Florence, whose gold coin set the standard for European money for two centuries.",
  BIF: "Burundi's franc is one of the last of the Belgian Congo francs still in circulation under its own name.",
  GNF: "Guinea left the CFA franc in 1960 to print its own, one of the first African countries to cut the tie.",
  SDG: "Sudan has swapped between the pound and the dinar twice, returning to the pound in 2007.",
  TMT: "Turkmenistan's manat lost four zeroes in 2009, and shares its name and its Russian root with Azerbaijan's.",
  SSP: "South Sudan printed its own pound within weeks of independence in 2011, making it the newest currency in the world.",
  TZS: "Tanzania is one of four East African countries still counting in shillings, all of them left over from a single colonial one.",
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

/**
 * What to say once the answer is out. Naming the country the currency belongs
 * to is worthless by then — the map has just shown it — so a currency without a
 * fact of its own borrows the one belonging to the country that spends it. The
 * card is already titled with the currency, so nothing is left unexplained.
 */
function factFor(money: Currency, countries: Country[]): string {
  const written = writtenFacts[money.code];
  if (written) return written;
  if (countries.length === 1) return countries[0].fact;
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
