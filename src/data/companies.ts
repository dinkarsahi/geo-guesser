import type { Country } from "./countries";

export interface Company {
  name: string;
  /** Simple Icons slug — see `logoUrl`. */
  slug: string;
  /** ISO alpha-2 of the country the head office is in. */
  code: string;
  /** Town or city of the head office. */
  city: string;
  /** Where that head office is, for the reveal and for scoring a miss. */
  lat: number;
  lng: number;
  fact: string;
}

/** A company with the map's own name for the country it's headquartered in. */
export interface CompanyTarget extends Company {
  country: string;
}

/**
 * Brand marks from the Simple Icons CDN, which serves a single SVG per company
 * in that company's own colour. Every slug below was checked against it: the
 * project drops logos it can't distribute, so a plausible-looking name is no
 * guarantee, and a company whose mark has gone is better left out than shown
 * as a broken image.
 */
export function logoUrl(slug: string): string {
  return `https://cdn.simpleicons.org/${slug}`;
}

/**
 * Where the world's better-known companies actually keep their head office —
 * which is often not where you'd guess, and occasionally not the country the
 * brand feels like it belongs to.
 *
 * Facts are about the company rather than the place. By the time the card
 * appears the map has already flown to the country and lit it up, so "Nokia is
 * headquartered in Finland" would be telling the player what they just watched.
 */
const COMPANIES: Company[] = [
  // --- United States ---------------------------------------------------
  { name: "Apple", slug: "apple", code: "us", city: "Cupertino", lat: 37.3318, lng: -122.0312,
    fact: "Founded in 1976 and long said to have started in a garage — which Steve Wozniak later called a bit of a myth, since most of the work happened elsewhere." },
  { name: "Nike", slug: "nike", code: "us", city: "Beaverton", lat: 45.545, lng: -122.858,
    fact: "The swoosh was drawn by a design student in 1971 for $35. She was given company stock years later, worth rather more." },
  { name: "Boeing", slug: "boeing", code: "us", city: "Arlington", lat: 38.88, lng: -77.1,
    fact: "Started in 1916 building seaplanes, and got through the lean years afterwards by selling furniture." },
  { name: "Tesla", slug: "tesla", code: "us", city: "Austin", lat: 30.2226, lng: -97.618,
    fact: "Its first car was a Lotus Elise with the petrol engine taken out and an electric motor put in." },
  { name: "Google", slug: "google", code: "us", city: "Mountain View", lat: 37.422, lng: -122.0841,
    fact: "The name is a misspelling of googol, the number one followed by a hundred zeroes." },
  { name: "Intel", slug: "intel", code: "us", city: "Santa Clara", lat: 37.3875, lng: -121.9635,
    fact: "The name is simply short for Integrated Electronics." },
  { name: "Nvidia", slug: "nvidia", code: "us", city: "Santa Clara", lat: 37.37, lng: -121.97,
    fact: "Was sketched out by three engineers in a roadside diner, which still stands." },
  { name: "Netflix", slug: "netflix", code: "us", city: "Los Gatos", lat: 37.2358, lng: -121.9624,
    fact: "Spent its first decade posting DVDs through the mail in red envelopes." },
  { name: "PayPal", slug: "paypal", code: "us", city: "San Jose", lat: 37.33, lng: -121.92,
    fact: "Took its present shape in 2000 through a merger with X.com, a bank Elon Musk had founded." },
  { name: "Uber", slug: "uber", code: "us", city: "San Francisco", lat: 37.7749, lng: -122.4194,
    fact: "Was thought up by two founders who couldn't get a taxi on a snowy night in Paris." },
  { name: "Airbnb", slug: "airbnb", code: "us", city: "San Francisco", lat: 37.77, lng: -122.4,
    fact: "Began when two flatmates put air mattresses on their floor during a design conference that had filled every hotel in the city." },

  // --- Japan -----------------------------------------------------------
  { name: "Toyota", slug: "toyota", code: "jp", city: "Toyota City", lat: 35.0827, lng: 137.156,
    fact: "The founding family is called Toyoda. The spelling was changed because Toyota takes eight strokes to write, a lucky number." },
  { name: "Sony", slug: "sony", code: "jp", city: "Tokyo", lat: 35.6304, lng: 139.7454,
    fact: "The name was invented from the Latin sonus, picked so it could be said in any language." },
  { name: "Honda", slug: "honda", code: "jp", city: "Tokyo", lat: 35.6716, lng: 139.7454,
    fact: "Started in 1946 by bolting surplus military radio generators onto bicycles." },
  { name: "Nissan", slug: "nissan", code: "jp", city: "Yokohama", lat: 35.466, lng: 139.622,
    fact: "Retired its Datsun badge in the 1980s, then brought it back briefly decades later." },
  { name: "Panasonic", slug: "panasonic", code: "jp", city: "Kadoma", lat: 34.74, lng: 135.57,
    fact: "Began in 1918 in a house that doubled as the factory, making a better lamp socket." },
  { name: "Mazda", slug: "mazda", code: "jp", city: "Hiroshima", lat: 34.39, lng: 132.47,
    fact: "Is the only carmaker to have put the rotary engine into mass production and kept it there." },
  { name: "Subaru", slug: "subaru", code: "jp", city: "Tokyo", lat: 35.69, lng: 139.7,
    fact: "Is named after the Pleiades — the six stars on the badge are the ones visible to the naked eye." },
  { name: "Suzuki", slug: "suzuki", code: "jp", city: "Hamamatsu", lat: 34.71, lng: 137.73,
    fact: "Spent its first thirty years building looms for weaving silk." },

  // --- Korea, China, Taiwan --------------------------------------------
  { name: "Samsung", slug: "samsung", code: "kr", city: "Suwon", lat: 37.2568, lng: 127.0534,
    fact: "Opened in 1938 as a grocery trader, exporting dried fish and noodles." },
  { name: "Hyundai", slug: "hyundai", code: "kr", city: "Seoul", lat: 37.5665, lng: 126.978,
    fact: "The name means 'modernity', and the group was building ships before it built cars." },
  { name: "LG", slug: "lg", code: "kr", city: "Seoul", lat: 37.5219, lng: 126.9245,
    fact: "The letters come from Lucky and Goldstar, the two companies that merged to form it." },
  { name: "Kia", slug: "kia", code: "kr", city: "Seoul", lat: 37.51, lng: 127.03,
    fact: "The name means roughly 'to rise out of Asia', and it started out making bicycle parts." },
  { name: "Kakao", slug: "kakao", code: "kr", city: "Jeju", lat: 33.45, lng: 126.57,
    fact: "Its messaging app is used by almost everyone in the country, to the point that its name is a verb there." },
  { name: "Huawei", slug: "huawei", code: "cn", city: "Shenzhen", lat: 22.65, lng: 114.05,
    fact: "Is owned by a committee of its own employees rather than by outside shareholders." },
  { name: "Xiaomi", slug: "xiaomi", code: "cn", city: "Beijing", lat: 39.9042, lng: 116.4074,
    fact: "The name means 'millet', picked to suggest starting from something very small." },
  { name: "Baidu", slug: "baidu", code: "cn", city: "Beijing", lat: 39.98, lng: 116.3,
    fact: "Is named after a line in a Song dynasty poem about searching a crowd for someone." },
  { name: "Lenovo", slug: "lenovo", code: "cn", city: "Beijing", lat: 40.04, lng: 116.3,
    fact: "Bought IBM's entire personal computer business in 2005, ThinkPad included." },
  { name: "Alibaba", slug: "alibabadotcom", code: "cn", city: "Hangzhou", lat: 30.2741, lng: 120.1551,
    fact: "Its founder chose the name after asking waiters in several countries whether they recognised it." },

  // --- India -----------------------------------------------------------
  { name: "Infosys", slug: "infosys", code: "in", city: "Bengaluru", lat: 12.9716, lng: 77.5946,
    fact: "Was started in 1981 with about $250, borrowed from one of the founders' wives." },
  { name: "Wipro", slug: "wipro", code: "in", city: "Bengaluru", lat: 12.93, lng: 77.63,
    fact: "Sold cooking oil for its first three decades before turning to software." },
  { name: "Tata", slug: "tata", code: "in", city: "Mumbai", lat: 19.076, lng: 72.8777,
    fact: "Two thirds of its holding company is owned by charitable trusts, so most of the profit goes to philanthropy." },
  { name: "Mahindra", slug: "mahindra", code: "in", city: "Mumbai", lat: 19.076, lng: 72.8777,
    fact: "Began as a steel trader, then built Jeeps under licence after independence." },
  { name: "Zomato", slug: "zomato", code: "in", city: "Gurugram", lat: 28.4595, lng: 77.0266,
    fact: "Started as a set of restaurant menus one employee scanned and put on the office network." },
  { name: "Paytm", slug: "paytm", code: "in", city: "Noida", lat: 28.5355, lng: 77.391,
    fact: "The name is short for 'pay through mobile'." },

  // --- Nordics ---------------------------------------------------------
  { name: "Nokia", slug: "nokia", code: "fi", city: "Espoo", lat: 60.2055, lng: 24.6559,
    fact: "Began as a paper mill on the Nokianvirta river, and spent years making rubber boots and car tyres." },
  // Stockholm proper falls in water on the 1:50m coastline, which can't resolve
  // the archipelago — so these two sit just inland of it, still in the city.
  { name: "Spotify", slug: "spotify", code: "se", city: "Stockholm", lat: 59.33, lng: 17.95,
    fact: "The name came from a founder mishearing a suggestion shouted across the room, and it stuck." },
  { name: "Ericsson", slug: "ericsson", code: "se", city: "Stockholm", lat: 59.404, lng: 17.954,
    fact: "Opened in 1876 as a small shop repairing telegraph equipment." },
  { name: "Volvo", slug: "volvo", code: "se", city: "Gothenburg", lat: 57.7089, lng: 11.9746,
    fact: "Means 'I roll' in Latin, and the name was first used on ball bearings." },
  { name: "Klarna", slug: "klarna", code: "se", city: "Stockholm", lat: 59.35, lng: 17.9,
    fact: "Was built on the idea that people would buy more online if they could pay after the parcel arrived." },

  // --- Germany, Austria, Switzerland ----------------------------------
  { name: "Adidas", slug: "adidas", code: "de", city: "Herzogenaurach", lat: 49.5683, lng: 10.8858,
    fact: "One of two brothers who fell out founded it; the other started Puma on the opposite bank of the same river." },
  { name: "BMW", slug: "bmw", code: "de", city: "Munich", lat: 48.1767, lng: 11.5561,
    fact: "The blue and white roundel is the Bavarian flag, not a spinning propeller — that story was invented for an advert." },
  { name: "Volkswagen", slug: "volkswagen", code: "de", city: "Wolfsburg", lat: 52.4227, lng: 10.7865,
    fact: "The name means simply 'people's car', and the town it's based in was built for the factory." },
  { name: "Siemens", slug: "siemens", code: "de", city: "Munich", lat: 48.1372, lng: 11.5755,
    fact: "Laid one of the first long-distance telegraph lines in 1849, from Berlin to Frankfurt." },
  { name: "SAP", slug: "sap", code: "de", city: "Walldorf", lat: 49.2933, lng: 8.6428,
    fact: "Was started in 1972 by five engineers who had just left IBM." },
  { name: "Porsche", slug: "porsche", code: "de", city: "Stuttgart", lat: 48.834, lng: 9.152,
    fact: "Its founder designed the original Volkswagen Beetle before the company built a car of its own." },
  { name: "Audi", slug: "audi", code: "de", city: "Ingolstadt", lat: 48.7665, lng: 11.4257,
    fact: "The name is Latin for 'listen' — a translation of the founder's surname, Horch." },
  { name: "Bosch", slug: "bosch", code: "de", city: "Gerlingen", lat: 48.8, lng: 9.06,
    fact: "Made the magneto ignition that first turned the petrol engine into something reliable." },
  { name: "Lufthansa", slug: "lufthansa", code: "de", city: "Cologne", lat: 50.9375, lng: 6.9603,
    fact: "Its crane emblem has been in use, with only small changes, since 1918." },
  { name: "Deutsche Bank", slug: "deutschebank", code: "de", city: "Frankfurt", lat: 50.1109, lng: 8.6821,
    fact: "Was founded in 1870 specifically to finance trade abroad, not at home." },

  // --- Italy, Spain, France --------------------------------------------
  { name: "Ferrari", slug: "ferrari", code: "it", city: "Maranello", lat: 44.5297, lng: 10.8642,
    fact: "The prancing horse was a WWI fighter pilot's emblem, given to Enzo Ferrari by the pilot's mother for luck." },
  { name: "Lamborghini", slug: "lamborghini", code: "it", city: "Sant'Agata Bolognese", lat: 44.6647, lng: 11.13,
    fact: "Was started by a tractor manufacturer who complained to Enzo Ferrari about his car and was told to stick to tractors." },
  { name: "Fiat", slug: "fiat", code: "it", city: "Turin", lat: 45.0703, lng: 7.6869,
    fact: "The name is an acronym: Fabbrica Italiana Automobili Torino." },
  { name: "Zara", slug: "zara", code: "es", city: "Arteixo", lat: 43.305, lng: -8.507,
    fact: "Its founder wanted to call it Zorba, after the film, but a bar two streets away already had the name." },
  { name: "Telefónica", slug: "telefonica", code: "es", city: "Madrid", lat: 40.4168, lng: -3.7038,
    fact: "Ran the country's telephone monopoly for over sixty years before it was privatised." },
  { name: "Iberia", slug: "iberia", code: "es", city: "Madrid", lat: 40.47, lng: -3.57,
    fact: "Was among the first airlines to fly the South Atlantic, in 1946." },
  { name: "Renault", slug: "renault", code: "fr", city: "Boulogne-Billancourt", lat: 48.8365, lng: 2.24,
    fact: "Its founder sold his first car by driving it up one of the steepest streets in Paris to prove it could." },
  { name: "Peugeot", slug: "peugeot", code: "fr", city: "Poissy", lat: 48.93, lng: 2.04,
    fact: "Made coffee grinders and corset stays before it made cars, and still makes the grinders." },
  { name: "Citroën", slug: "citroen", code: "fr", city: "Paris", lat: 48.83, lng: 2.28,
    fact: "Lit up the Eiffel Tower with its own name for nine years, the largest advertisement in the world at the time." },
  { name: "Ubisoft", slug: "ubisoft", code: "fr", city: "Saint-Mandé", lat: 48.841, lng: 2.418,
    fact: "Was founded by five siblings from a farming family in Brittany." },
  { name: "Hermès", slug: "hermes", code: "fr", city: "Paris", lat: 48.87, lng: 2.321,
    fact: "Started out making harnesses and bridles for horse-drawn carriages." },

  // --- Britain and Ireland ---------------------------------------------
  { name: "Shell", slug: "shell", code: "gb", city: "London", lat: 51.5074, lng: -0.1278,
    fact: "Grew out of a London shop that sold actual seashells, which is where the logo comes from." },
  { name: "Unilever", slug: "unilever", code: "gb", city: "London", lat: 51.51, lng: -0.1,
    fact: "Was formed in 1929 when a soap maker merged with a margarine company — both needed the same oils." },
  { name: "HSBC", slug: "hsbc", code: "gb", city: "London", lat: 51.505, lng: -0.019,
    fact: "The letters stand for Hongkong and Shanghai Banking Corporation." },
  { name: "Vodafone", slug: "vodafone", code: "gb", city: "Newbury", lat: 51.4014, lng: -1.323,
    fact: "The name is built out of voice, data and telephone." },
  { name: "easyJet", slug: "easyjet", code: "gb", city: "Luton", lat: 51.874, lng: -0.368,
    fact: "Launched in 1995 with two leased aircraft and a booking number painted down the fuselage." },
  { name: "British Airways", slug: "britishairways", code: "gb", city: "Harmondsworth", lat: 51.478, lng: -0.46,
    fact: "Traces its line back to the world's first daily international air service, flown in 1919." },
  { name: "Ryanair", slug: "ryanair", code: "ie", city: "Dublin", lat: 53.3498, lng: -6.2603,
    fact: "Flew its first route in 1985 with a single fifteen-seat aircraft." },

  // --- Eastern Europe and Russia ---------------------------------------
  { name: "Škoda", slug: "skoda", code: "cz", city: "Mladá Boleslav", lat: 50.412, lng: 14.903,
    fact: "Started in 1895 making bicycles, after one founder was sent a rude letter for complaining about a German one." },
  { name: "Wizz Air", slug: "wizzair", code: "hu", city: "Budapest", lat: 47.44, lng: 19.25,
    fact: "Launched in 2003 and now flies more routes across its region than any of its rivals." },
  { name: "Aeroflot", slug: "aeroflot", code: "ru", city: "Moscow", lat: 55.75, lng: 37.62,
    fact: "Was once the largest airline in the world, carrying over a hundred million passengers a year." },

  // --- Middle East, Africa, Turkey -------------------------------------
  { name: "Emirates", slug: "emirates", code: "ae", city: "Dubai", lat: 25.2532, lng: 55.3657,
    fact: "Began in 1985 with two leased aircraft and ten million dollars of start-up money." },
  { name: "Etihad Airways", slug: "etihadairways", code: "ae", city: "Abu Dhabi", lat: 24.4539, lng: 54.3773,
    fact: "Was founded in 2003 and reached a hundred destinations within a decade." },
  { name: "Qatar Airways", slug: "qatarairways", code: "qa", city: "Doha", lat: 25.2854, lng: 51.531,
    fact: "Operates some of the longest scheduled flights in the world, several of them over sixteen hours." },
  { name: "Turkish Airlines", slug: "turkishairlines", code: "tr", city: "Istanbul", lat: 41.05, lng: 28.9,
    fact: "Flies to more countries than any other airline in the world." },

  // --- Asia-Pacific ----------------------------------------------------
  { name: "Qantas", slug: "qantas", code: "au", city: "Sydney", lat: -33.934, lng: 151.178,
    fact: "The name is an acronym for Queensland and Northern Territory Aerial Services." },
  { name: "Grab", slug: "grab", code: "sg", city: "Singapore", lat: 1.34, lng: 103.78,
    fact: "Started as a taxi-booking app entered into a business school competition, where it came second." },
  { name: "Singapore Airlines", slug: "singaporeairlines", code: "sg", city: "Singapore", lat: 1.36, lng: 103.99,
    fact: "Split from Malaysia's national carrier in 1972, and the two divided the fleet between them." },
  { name: "AirAsia", slug: "airasia", code: "my", city: "Sepang", lat: 2.7456, lng: 101.7072,
    fact: "Was bought for a token one ringgit along with its debts, and was making money again within a year." },

  // --- The Americas beyond the US --------------------------------------
  { name: "Shopify", slug: "shopify", code: "ca", city: "Ottawa", lat: 45.4215, lng: -75.6972,
    fact: "Was built because its founders couldn't find decent software for selling snowboards online." },
  { name: "BlackBerry", slug: "blackberry", code: "ca", city: "Waterloo", lat: 43.4643, lng: -80.5204,
    fact: "Was named for its keyboard, whose keys were thought to look like the seeds of the fruit." },
  { name: "Bombardier", slug: "bombardier", code: "ca", city: "Montreal", lat: 45.5019, lng: -73.5674,
    fact: "Was founded to build a vehicle that could cross deep snow, after its founder's son died when roads were impassable." },
  { name: "Nubank", slug: "nubank", code: "br", city: "São Paulo", lat: -23.5505, lng: -46.6333,
    fact: "Grew into one of the largest digital banks in the world without ever opening a branch." },
  { name: "Avianca", slug: "avianca", code: "co", city: "Bogotá", lat: 4.711, lng: -74.0721,
    fact: "Founded in 1919, it's the second-oldest airline still flying." },
  { name: "Aeroméxico", slug: "aeromexico", code: "mx", city: "Mexico City", lat: 19.4326, lng: -99.1332,
    fact: "Flew its first route in 1934 with one aircraft and one pilot." },
];

let cachedFor: Country[] | null = null;
let cached: CompanyTarget[] = [];

/**
 * Every company whose home country is on the map, carrying that country's own
 * name so the reveal can use it. Cached by pool identity, which keeps the array
 * stable and with it the game's memory of what it has already dealt.
 */
export function companyPool(countries: Country[]): CompanyTarget[] {
  if (!countries.length) return [];
  if (countries === cachedFor) return cached;

  const nameByCode = new Map(countries.map((c) => [c.code, c.name]));
  cachedFor = countries;
  cached = COMPANIES.filter((c) => nameByCode.has(c.code)).map((c) => ({
    ...c,
    country: nameByCode.get(c.code)!,
  }));
  return cached;
}
