import type { Country } from "./countries";

/** A country and the number of people who live in it. */
export interface PopulationTarget extends Country {
  population: number;
}

/**
 * The vintage of the figures, shown against every number the mode prints. A
 * population is only ever true of a moment, and the moment matters: several of
 * these move by a million a year, and the answer to "who has 84 million?"
 * depends entirely on which year you asked.
 */
export const POPULATION_AS_OF = "2025";

/**
 * The footnote the asterisk stands for. Kept honest about the ragged edge:
 * the World Bank's series is one consistent set of mid-year estimates, but it
 * has never covered Taiwan, and it skips the smallest dependencies entirely,
 * so eighteen of the entries below fall back to whatever count that territory
 * last published — a census as old as 2021 in a few cases.
 */
export const POPULATION_NOTE =
  "World Bank estimates for 2025; a few small territories use their own latest official count.";

/**
 * How many people live in each country on the map, by ISO alpha-2. Straight
 * from the World Bank's SP.POP.TOTL series for 2025 except where marked *,
 * which are the places that series has no row for.
 *
 * These are the whole state as the World Bank counts it, which is worth
 * knowing for the handful of countries that also appear here as territories in
 * their own right: France's number includes its overseas departments but not
 * its overseas collectivities, and the United Kingdom's excludes both the crown
 * dependencies and the overseas territories. Both of those are listed
 * separately below, so nobody is counted twice.
 */
const POPULATION: Record<string, number> = {
  // --- Europe ------------------------------------------------------
  ad: 82_904, // Andorra
  al: 2_349_580, // Albania
  at: 9_208_163, // Austria
  ax: 30_654, // Åland *
  ba: 3_140_095, // Bosnia and Herzegovina
  be: 11_941_781, // Belgium
  bg: 6_433_302, // Bulgaria
  by: 9_085_991, // Belarus
  ch: 9_092_436, // Switzerland
  cz: 10_886_878, // Czech Republic
  de: 83_491_249, // Germany
  dk: 6_009_169, // Denmark
  ee: 1_366_475, // Estonia
  es: 49_355_143, // Spain
  fi: 5_646_436, // Finland
  fo: 54_900, // Faroe Islands
  fr: 68_720_337, // France
  gb: 69_487_000, // United Kingdom
  gg: 64_781, // Guernsey *
  gr: 10_413_962, // Greece
  hr: 3_876_200, // Croatia
  hu: 9_514_251, // Hungary
  ie: 5_484_367, // Ireland
  im: 84_118, // Isle of Man
  is: 392_404, // Iceland
  it: 58_915_656, // Italy
  je: 103_267, // Jersey *
  li: 41_024, // Liechtenstein
  lt: 2_888_774, // Lithuania
  lu: 686_970, // Luxembourg
  lv: 1_847_785, // Latvia
  mc: 38_341, // Monaco
  md: 2_360_527, // Moldova
  me: 623_129, // Montenegro
  mk: 1_820_909, // North Macedonia
  mt: 579_704, // Malta
  nl: 18_087_633, // Netherlands
  no: 5_610_870, // Norway
  pl: 36_435_861, // Poland
  pt: 10_804_871, // Portugal
  ro: 19_020_271, // Romania
  rs: 6_549_143, // Serbia
  ru: 143_513_328, // Russia
  se: 10_596_620, // Sweden
  si: 2_130_986, // Slovenia
  sk: 5_413_813, // Slovakia
  sm: 34_109, // San Marino
  ua: 38_980_376, // Ukraine
  va: 882, // Vatican City *
  xk: 1_576_876, // Kosovo

  // --- Asia --------------------------------------------------------
  ae: 11_513_149, // United Arab Emirates
  af: 43_844_111, // Afghanistan
  am: 3_086_700, // Armenia
  az: 10_246_996, // Azerbaijan
  bd: 175_686_899, // Bangladesh
  bh: 1_600_366, // Bahrain
  bn: 466_330, // Brunei
  bt: 796_682, // Bhutan
  cn: 1_406_585_000, // People's Republic of China
  cy: 1_370_754, // Cyprus
  ge: 3_935_766, // Georgia
  hk: 7_498_900, // Hong Kong
  id: 285_721_236, // Indonesia
  il: 10_122_800, // Israel
  in: 1_463_865_525, // India
  iq: 47_020_774, // Iraq
  ir: 92_417_681, // Iran
  jo: 11_520_684, // Jordan
  jp: 123_366_734, // Japan
  kg: 7_343_064, // Kyrgyzstan
  kh: 17_847_982, // Cambodia
  kp: 26_571_036, // North Korea
  kr: 51_684_564, // South Korea
  kw: 4_865_298, // Kuwait
  kz: 20_843_754, // Kazakhstan
  la: 7_873_046, // Laos
  lb: 5_849_421, // Lebanon
  lk: 21_756_000, // Sri Lanka
  mm: 54_850_648, // Myanmar
  mn: 3_568_978, // Mongolia
  mo: 685_900, // Macau
  my: 35_977_838, // Malaysia
  np: 29_618_118, // Nepal
  om: 5_494_691, // Oman
  ph: 116_786_962, // Philippines
  pk: 255_219_554, // Pakistan
  ps: 5_413_596, // Palestine
  qa: 2_972_215, // Qatar
  sa: 36_973_555, // Saudi Arabia
  sg: 6_111_175, // Singapore
  sy: 25_620_427, // Syria
  th: 71_619_863, // Thailand
  tj: 10_786_734, // Tajikistan
  tl: 1_418_517, // East Timor
  tm: 7_618_847, // Turkmenistan
  tr: 85_878_556, // Turkey
  tw: 23_243_565, // Taiwan *
  uz: 37_053_428, // Uzbekistan
  vn: 101_598_527, // Vietnam
  ye: 41_773_878, // Yemen

  // --- Africa ------------------------------------------------------
  ao: 39_040_039, // Angola
  bf: 24_074_580, // Burkina Faso
  bi: 14_390_003, // Burundi
  bj: 14_814_460, // Benin
  bw: 2_562_122, // Botswana
  cd: 112_832_473, // Democratic Republic of the Congo
  cf: 5_513_282, // Central African Republic
  cg: 6_484_437, // Republic of the Congo
  ci: 32_711_547, // Ivory Coast
  cm: 29_879_337, // Cameroon
  cv: 527_326, // Cape Verde
  dj: 1_184_076, // Djibouti
  dz: 47_435_312, // Algeria
  eg: 118_365_995, // Egypt
  eh: 600_904, // Western Sahara *
  er: 3_607_003, // Eritrea
  et: 135_472_051, // Ethiopia
  ga: 2_593_130, // Gabon
  gh: 35_064_272, // Ghana
  gm: 2_822_093, // The Gambia
  gn: 15_099_727, // Guinea
  gq: 1_938_431, // Equatorial Guinea
  gw: 2_249_515, // Guinea-Bissau
  ke: 57_532_493, // Kenya
  km: 882_847, // Comoros
  lr: 5_731_206, // Liberia
  ls: 2_363_325, // Lesotho
  ly: 7_458_555, // Libya
  ma: 38_430_770, // Morocco
  mg: 32_740_678, // Madagascar
  ml: 25_198_821, // Mali
  mr: 5_315_065, // Mauritania
  mw: 22_216_120, // Malawi
  mz: 35_631_653, // Mozambique
  na: 3_092_816, // Namibia
  ne: 27_917_831, // Niger
  ng: 237_527_782, // Nigeria
  rw: 14_569_341, // Rwanda
  sd: 51_662_147, // Sudan
  sl: 8_819_794, // Sierra Leone
  sn: 18_931_966, // Senegal
  so: 19_654_739, // Somalia
  ss: 12_188_788, // South Sudan
  st: 240_254, // São Tomé and Príncipe
  sz: 1_256_174, // Eswatini
  td: 21_003_705, // Chad
  tg: 8_591_626, // Togo
  tn: 12_348_573, // Tunisia
  tz: 70_545_865, // Tanzania
  ug: 51_384_894, // Uganda
  za: 64_747_319, // South Africa
  zm: 21_913_874, // Zambia
  zw: 16_950_795, // Zimbabwe

  // --- North America -----------------------------------------------
  ag: 94_209, // Antigua and Barbuda
  ai: 16_010, // Anguilla *
  aw: 108_785, // Aruba
  bb: 282_623, // Barbados
  bl: 10_562, // Saint Barthélemy *
  bm: 64_555, // Bermuda
  bs: 403_033, // The Bahamas
  bz: 422_924, // Belize
  ca: 41_651_653, // Canada
  cr: 5_152_950, // Costa Rica
  cu: 10_937_203, // Cuba
  cw: 156_263, // Curaçao
  dm: 65_871, // Dominica
  do: 11_520_487, // Dominican Republic
  gd: 117_303, // Grenada
  gl: 56_831, // Greenland
  gt: 18_687_881, // Guatemala
  hn: 11_005_850, // Honduras
  ht: 11_906_095, // Haiti
  jm: 2_837_077, // Jamaica
  kn: 46_922, // Saint Kitts and Nevis
  ky: 75_844, // Cayman Islands
  lc: 180_149, // Saint Lucia
  mf: 24_941, // Saint Martin
  ms: 4_386, // Montserrat *
  mx: 131_946_900, // Mexico
  ni: 7_007_502, // Nicaragua
  pa: 4_571_189, // Panama
  pm: 5_819, // Saint Pierre and Miquelon *
  pr: 3_184_835, // Puerto Rico
  sv: 6_365_503, // El Salvador
  sx: 43_923, // Sint Maarten
  tc: 46_855, // Turks and Caicos Islands
  tt: 1_367_764, // Trinidad and Tobago
  us: 341_784_857, // United States of America
  vc: 99_924, // Saint Vincent and the Grenadines
  vg: 39_732, // British Virgin Islands
  vi: 103_792, // United States Virgin Islands

  // --- South America -----------------------------------------------
  ar: 45_851_378, // Argentina
  bo: 12_581_843, // Bolivia
  br: 212_812_405, // Brazil
  cl: 19_859_921, // Chile
  co: 53_425_635, // Colombia
  ec: 18_289_896, // Ecuador
  fk: 3_662, // Falkland Islands *
  gy: 835_986, // Guyana
  pe: 34_576_665, // Peru
  py: 7_013_078, // Paraguay
  sr: 639_850, // Suriname
  uy: 3_384_688, // Uruguay
  ve: 28_516_896, // Venezuela

  // --- Oceania -----------------------------------------------------
  as: 46_029, // American Samoa
  au: 27_614_411, // Australia
  ck: 15_040, // Cook Islands *
  fj: 933_154, // Fiji
  fm: 113_683, // Federated States of Micronesia
  gu: 168_999, // Guam
  ki: 136_488, // Kiribati
  mh: 36_282, // Marshall Islands
  mp: 43_541, // Northern Mariana Islands
  nc: 295_333, // New Caledonia
  nf: 2_188, // Norfolk Island *
  nr: 12_025, // Nauru
  nu: 1_681, // Niue *
  nz: 5_324_700, // New Zealand
  pf: 282_465, // French Polynesia
  pg: 10_762_817, // Papua New Guinea
  pn: 40, // Pitcairn Islands *
  pw: 17_663, // Palau
  sb: 838_645, // Solomon Islands
  to: 103_742, // Tonga
  tv: 9_492, // Tuvalu
  vu: 335_169, // Vanuatu
  wf: 11_620, // Wallis and Futuna *
  ws: 219_306, // Samoa

  // --- Indian and South Atlantic Ocean ------------------------------
  io: 3_000, // British Indian Ocean Territory *
  mu: 1_243_741, // Mauritius
  mv: 529_676, // Maldives
  sc: 122_730, // Seychelles
  sh: 5_651, // Saint Helena *
};

/**
 * On the map, and with a number against its name, but never the question. The
 * British Indian Ocean Territory has no permanent population at all — the
 * figure is the naval base's rotating staff, so "which country has 3,000
 * people?" has no honest answer there. It stays in the table so that clicking
 * it still scores something.
 */
const NOT_ASKED = new Set(["io"]);

/** How many people live in that country, or null if we don't have a figure. */
export function populationOf(code: string): number | null {
  return POPULATION[code.toLowerCase()] ?? null;
}

let cachedFor: Country[] | null = null;
let cached: PopulationTarget[] = [];

/**
 * Every country that can be asked about, carrying its population. Built from
 * the same pool the flag round uses, so a country can't come up unless there's
 * somewhere on the map to click for it. Cached by pool identity, which keeps
 * the array stable and with it the game's memory of what it has already dealt.
 */
export function populationPool(countries: Country[]): PopulationTarget[] {
  if (!countries.length) return [];
  if (countries === cachedFor) return cached;

  const out: PopulationTarget[] = [];
  for (const c of countries) {
    if (NOT_ASKED.has(c.code)) continue;
    const population = POPULATION[c.code];
    if (population === undefined) continue;
    out.push({ ...c, population });
  }

  cachedFor = countries;
  cached = out;
  return cached;
}

/**
 * How forgiving the scoring is, in natural logs of the ratio between the two
 * populations. Every other mode marks a guess on how far away it landed, which
 * here would reward knowing that Japan is near Korea over knowing how many
 * people live in either. So the only thing that counts is the number: a country
 * with the right sort of population scores well wherever on Earth it is.
 *
 * Squared in the exponent, like the distance modes and the tube map: the curve
 * leaves its top slowly and then falls off, rather than charging most for the
 * first step away from the answer. At 2, and marked out of `NEAR_COUNTRY_MAX`,
 * being out by half again scores 91 and a factor of two 84 — both of which are
 * knowing roughly how many people live there, which is most of what the
 * question asked. A factor of ten is 25 and a factor of fifty near enough
 * nothing.
 */
const RATIO_SCALE = 2;

/**
 * The most a country that isn't the answer can be worth.
 *
 * The question is which country has that many people in it, and there is one
 * right answer to it. Marked on the number alone, a guess at the wrong country
 * with a population within a few per cent of the right one rounded to a full
 * hundred — the game's word for "you found it" — handed out for not finding it.
 *
 * So the whole curve is marked out of this instead, and the last five points
 * belong to the country. Nothing else changes: knowing that about 12 million
 * people live somewhere is still nearly all of the question, and is still paid
 * as such. What it stops is the panel calling a miss a perfect answer.
 */
const NEAR_COUNTRY_MAX = 95;

/**
 * What a wrong country with that population is worth, given how many times out
 * its population is.
 *
 * Pulled out of the round so the FAQ can draw this exact curve rather than a
 * second copy of it written from the prose. A page explaining the scoring is
 * the last place a scoring formula should be duplicated: the copy is right on
 * the day it is written and quietly wrong ever after.
 */
export function scoreFromPopulationRatio(ratio: number): number {
  const off = Math.abs(Math.log(ratio)) / RATIO_SCALE;
  return Math.round(NEAR_COUNTRY_MAX * Math.exp(-off * off));
}
