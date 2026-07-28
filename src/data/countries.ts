import type { Coord } from "../lib/geo";

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

/** lat/lng are the country's approximate geographic centre. */
export const countries: Country[] = [
  {
    name: "France",
    code: "fr",
    lat: 46.2276,
    lng: 2.2137,
    fact: "France is the most visited country in the world, drawing around 90 million tourists a year.",
  },
  {
    name: "Japan",
    code: "jp",
    lat: 36.2048,
    lng: 138.2529,
    fact: "Japan is made up of roughly 14,000 islands stretched along the Pacific.",
  },
  {
    name: "Brazil",
    code: "br",
    lat: -14.235,
    lng: -51.9253,
    fact: "Brazil holds about 60% of the Amazon rainforest within its borders.",
  },
  {
    name: "Australia",
    code: "au",
    lat: -25.2744,
    lng: 133.7751,
    fact: "Australia is the only country that is also a continent in its own right.",
  },
  {
    name: "Canada",
    code: "ca",
    lat: 56.1304,
    lng: -106.3468,
    fact: "Canada has the longest coastline of any country — over 200,000 km.",
  },
  {
    name: "Egypt",
    code: "eg",
    lat: 26.8206,
    lng: 30.8025,
    fact: "The Great Pyramid of Giza was the tallest human-made structure for about 3,800 years.",
  },
  {
    name: "India",
    code: "in",
    lat: 20.5937,
    lng: 78.9629,
    fact: "India is the most populous country in the world, home to over 1.4 billion people.",
  },
  {
    name: "Kenya",
    code: "ke",
    lat: -0.0236,
    lng: 37.9062,
    fact: "The Great Rift Valley runs the length of Kenya and is visible from space.",
  },
  {
    name: "Norway",
    code: "no",
    lat: 60.472,
    lng: 8.4689,
    fact: "Norway's coastline of fjords would stretch over 100,000 km if pulled straight.",
  },
  {
    name: "Peru",
    code: "pe",
    lat: -9.19,
    lng: -75.0152,
    fact: "Machu Picchu sits about 2,430 m above sea level in the Andes.",
  },
  {
    name: "Italy",
    code: "it",
    lat: 41.8719,
    lng: 12.5674,
    fact: "Italy has more UNESCO World Heritage Sites than any other country.",
  },
  {
    name: "Germany",
    code: "de",
    lat: 51.1657,
    lng: 10.4515,
    fact: "Germany has no official speed limit on large stretches of its Autobahn.",
  },
  {
    name: "Mexico",
    code: "mx",
    lat: 23.6345,
    lng: -102.5528,
    fact: "Mexico introduced chocolate, chillies and corn to the rest of the world.",
  },
  {
    name: "South Africa",
    code: "za",
    lat: -30.5595,
    lng: 22.9375,
    fact: "South Africa has three capital cities: Pretoria, Cape Town and Bloemfontein.",
  },
  {
    name: "Thailand",
    code: "th",
    lat: 15.87,
    lng: 100.9925,
    fact: "Thailand is the only Southeast Asian country never colonised by a European power.",
  },
  {
    name: "Argentina",
    code: "ar",
    lat: -38.4161,
    lng: -63.6167,
    fact: "Aconcagua in Argentina is the highest mountain outside of Asia.",
  },
  {
    name: "Turkey",
    code: "tr",
    lat: 38.9637,
    lng: 35.2433,
    fact: "Istanbul is the only major city that sits on two continents at once.",
  },
  {
    name: "Iceland",
    code: "is",
    lat: 64.9631,
    lng: -19.0208,
    fact: "Iceland runs almost entirely on renewable geothermal and hydro power.",
  },
  {
    name: "New Zealand",
    code: "nz",
    lat: -40.9006,
    lng: 174.886,
    fact: "New Zealand was the first country to give women the right to vote, in 1893.",
  },
  {
    name: "Nigeria",
    code: "ng",
    lat: 9.082,
    lng: 8.6753,
    fact: "Nigeria is Africa's most populous country and home to Nollywood, a huge film industry.",
  },
  {
    name: "Indonesia",
    code: "id",
    lat: -0.7893,
    lng: 113.9213,
    fact: "Indonesia spans more than 17,000 islands across three time zones.",
  },
  {
    name: "South Korea",
    code: "kr",
    lat: 35.9078,
    lng: 127.7669,
    fact: "South Korea has some of the fastest average internet speeds in the world.",
  },
  {
    name: "Spain",
    code: "es",
    lat: 40.4637,
    lng: -3.7492,
    fact: "Spain produces almost half of the world's olive oil.",
  },
  {
    name: "Sweden",
    code: "se",
    lat: 60.1282,
    lng: 18.6435,
    fact: "Sweden has one of the highest numbers of islands of any country — about 267,000.",
  },
  {
    name: "Portugal",
    code: "pt",
    lat: 39.3999,
    lng: -8.2245,
    fact: "Portugal's borders have been essentially unchanged since 1139, among Europe's oldest.",
  },
  {
    name: "Greece",
    code: "gr",
    lat: 39.0742,
    lng: 21.8243,
    fact: "Greece has thousands of islands, but only about 200 are inhabited.",
  },
  {
    name: "Kazakhstan",
    code: "kz",
    lat: 48.0196,
    lng: 66.9237,
    fact: "Kazakhstan is the largest landlocked country in the world.",
  },
  {
    name: "Chile",
    code: "cl",
    lat: -35.6751,
    lng: -71.543,
    fact: "Chile stretches over 4,300 km north to south but averages only ~180 km wide.",
  },
  {
    name: "Morocco",
    code: "ma",
    lat: 31.7917,
    lng: -7.0926,
    fact: "Morocco's Sahara dunes at Erg Chebbi can rise as high as 150 m.",
  },
  {
    name: "Vietnam",
    code: "vn",
    lat: 14.0583,
    lng: 108.2772,
    fact: "Vietnam is the world's second-largest exporter of coffee.",
  },
];
