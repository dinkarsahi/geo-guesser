// AUTO-GENERATED from Transport for London's open data — see
// tools/gen-tube-tfl.mjs, which is the only thing that should write this file.
// Data provided by Transport for London. Do not edit by hand.
import type { TubeConnectionRaw, TubeLineDef, TubeStationRaw } from "./tubeData";

export const tflLineDefs: TubeLineDef[] = [
  {
    "id": 1,
    "name": "Bakerloo",
    "color": "#B36305"
  },
  {
    "id": 2,
    "name": "Central",
    "color": "#E32017"
  },
  {
    "id": 3,
    "name": "Circle",
    "color": "#FFD300"
  },
  {
    "id": 4,
    "name": "District",
    "color": "#00782A"
  },
  {
    "id": 5,
    "name": "Hammersmith & City",
    "color": "#F3A9BB"
  },
  {
    "id": 6,
    "name": "Jubilee",
    "color": "#A0A5A9"
  },
  {
    "id": 7,
    "name": "Metropolitan",
    "color": "#9B0056"
  },
  {
    "id": 8,
    "name": "Northern",
    "color": "#000000"
  },
  {
    "id": 9,
    "name": "Piccadilly",
    "color": "#003688"
  },
  {
    "id": 10,
    "name": "Victoria",
    "color": "#0098D4"
  },
  {
    "id": 11,
    "name": "Waterloo & City",
    "color": "#95CDBA"
  }
];

export const tflStationsRaw: TubeStationRaw[] = [
  {
    "name": "Acton Town",
    "lat": 51.5031,
    "lng": -0.2805,
    "zone": 3,
    "lines": [
      "District",
      "Piccadilly"
    ]
  },
  {
    "name": "Aldgate",
    "lat": 51.5142,
    "lng": -0.0757,
    "zone": 1,
    "lines": [
      "Circle",
      "Metropolitan"
    ]
  },
  {
    "name": "Aldgate East",
    "lat": 51.515,
    "lng": -0.0724,
    "zone": 1,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Alperton",
    "lat": 51.5406,
    "lng": -0.2996,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Amersham",
    "lat": 51.6741,
    "lng": -0.6077,
    "zone": 9,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Angel",
    "lat": 51.5318,
    "lng": -0.1063,
    "zone": 1,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Archway",
    "lat": 51.5655,
    "lng": -0.1348,
    "zone": 2.5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Arnos Grove",
    "lat": 51.6164,
    "lng": -0.1331,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Arsenal",
    "lat": 51.5587,
    "lng": -0.1075,
    "zone": 2,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Baker Street",
    "lat": 51.5229,
    "lng": -0.1571,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Circle",
      "Hammersmith & City",
      "Jubilee",
      "Metropolitan"
    ]
  },
  {
    "name": "Balham",
    "lat": 51.4433,
    "lng": -0.153,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Bank",
    "lat": 51.5134,
    "lng": -0.0889,
    "zone": 1,
    "lines": [
      "Central",
      "Northern",
      "Waterloo & City"
    ]
  },
  {
    "name": "Barbican",
    "lat": 51.5203,
    "lng": -0.098,
    "zone": 1,
    "lines": [
      "Circle",
      "Hammersmith & City",
      "Metropolitan"
    ]
  },
  {
    "name": "Barking",
    "lat": 51.5393,
    "lng": 0.0811,
    "zone": 4,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Barkingside",
    "lat": 51.5857,
    "lng": 0.0886,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Barons Court",
    "lat": 51.4903,
    "lng": -0.2134,
    "zone": 2,
    "lines": [
      "District",
      "Piccadilly"
    ]
  },
  {
    "name": "Battersea Power Station",
    "lat": 51.4799,
    "lng": -0.1421,
    "zone": 1,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Bayswater",
    "lat": 51.5123,
    "lng": -0.1879,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Becontree",
    "lat": 51.5403,
    "lng": 0.127,
    "zone": 5,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Belsize Park",
    "lat": 51.5505,
    "lng": -0.1648,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Bermondsey",
    "lat": 51.4978,
    "lng": -0.064,
    "zone": 2,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Bethnal Green",
    "lat": 51.5272,
    "lng": -0.0555,
    "zone": 2,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Blackfriars",
    "lat": 51.5116,
    "lng": -0.1037,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Blackhorse Road",
    "lat": 51.5869,
    "lng": -0.0411,
    "zone": 3,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Bond Street",
    "lat": 51.5143,
    "lng": -0.1497,
    "zone": 1,
    "lines": [
      "Central",
      "Jubilee"
    ]
  },
  {
    "name": "Borough",
    "lat": 51.5012,
    "lng": -0.0934,
    "zone": 1,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Boston Manor",
    "lat": 51.4956,
    "lng": -0.3249,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Bounds Green",
    "lat": 51.607,
    "lng": -0.1242,
    "zone": 3.5,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Bow Road",
    "lat": 51.5269,
    "lng": -0.0251,
    "zone": 2,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Brent Cross",
    "lat": 51.5767,
    "lng": -0.2136,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Brixton",
    "lat": 51.4626,
    "lng": -0.1149,
    "zone": 2,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Bromley-by-Bow",
    "lat": 51.5248,
    "lng": -0.0115,
    "zone": 2.5,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Buckhurst Hill",
    "lat": 51.6266,
    "lng": 0.0468,
    "zone": 5,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Burnt Oak",
    "lat": 51.6028,
    "lng": -0.264,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Caledonian Road",
    "lat": 51.5485,
    "lng": -0.1185,
    "zone": 2,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Camden Town",
    "lat": 51.5393,
    "lng": -0.1427,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Canada Water",
    "lat": 51.4979,
    "lng": -0.0494,
    "zone": 2,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Canary Wharf",
    "lat": 51.5035,
    "lng": -0.0182,
    "zone": 2,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Canning Town",
    "lat": 51.5136,
    "lng": 0.0083,
    "zone": 2.5,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Cannon Street",
    "lat": 51.5115,
    "lng": -0.0904,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Canons Park",
    "lat": 51.6077,
    "lng": -0.2947,
    "zone": 5,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Chalfont & Latimer",
    "lat": 51.668,
    "lng": -0.5607,
    "zone": 8,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Chalk Farm",
    "lat": 51.5441,
    "lng": -0.1534,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Chancery Lane",
    "lat": 51.5182,
    "lng": -0.1116,
    "zone": 1,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Charing Cross",
    "lat": 51.5074,
    "lng": -0.1273,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Northern"
    ]
  },
  {
    "name": "Chesham",
    "lat": 51.7052,
    "lng": -0.6112,
    "zone": 9,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Chigwell",
    "lat": 51.6179,
    "lng": 0.075,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Chiswick Park",
    "lat": 51.4946,
    "lng": -0.268,
    "zone": 3,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Chorleywood",
    "lat": 51.6544,
    "lng": -0.5185,
    "zone": 7,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Clapham Common",
    "lat": 51.4617,
    "lng": -0.1383,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Clapham North",
    "lat": 51.4651,
    "lng": -0.13,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Clapham South",
    "lat": 51.4527,
    "lng": -0.1476,
    "zone": 2.5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Cockfosters",
    "lat": 51.6515,
    "lng": -0.1492,
    "zone": 5,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Colindale",
    "lat": 51.5954,
    "lng": -0.2499,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Colliers Wood",
    "lat": 51.4182,
    "lng": -0.1781,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Covent Garden",
    "lat": 51.5131,
    "lng": -0.1244,
    "zone": 1,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Croxley",
    "lat": 51.647,
    "lng": -0.4417,
    "zone": 7,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Dagenham East",
    "lat": 51.5441,
    "lng": 0.166,
    "zone": 5,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Dagenham Heathway",
    "lat": 51.5416,
    "lng": 0.1475,
    "zone": 5,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Debden",
    "lat": 51.6454,
    "lng": 0.0838,
    "zone": 6,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Dollis Hill",
    "lat": 51.552,
    "lng": -0.2391,
    "zone": 3,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Ealing Broadway",
    "lat": 51.515,
    "lng": -0.3015,
    "zone": 3,
    "lines": [
      "Central",
      "District"
    ]
  },
  {
    "name": "Ealing Common",
    "lat": 51.5101,
    "lng": -0.2883,
    "zone": 3,
    "lines": [
      "District",
      "Piccadilly"
    ]
  },
  {
    "name": "Earl's Court",
    "lat": 51.4921,
    "lng": -0.1934,
    "zone": 1.5,
    "lines": [
      "District",
      "Piccadilly"
    ]
  },
  {
    "name": "East Acton",
    "lat": 51.5166,
    "lng": -0.2472,
    "zone": 2,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "East Finchley",
    "lat": 51.5871,
    "lng": -0.165,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "East Ham",
    "lat": 51.5389,
    "lng": 0.0512,
    "zone": 3.5,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "East Putney",
    "lat": 51.4592,
    "lng": -0.211,
    "zone": 2.5,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Eastcote",
    "lat": 51.5765,
    "lng": -0.3974,
    "zone": 5,
    "lines": [
      "Metropolitan",
      "Piccadilly"
    ]
  },
  {
    "name": "Edgware",
    "lat": 51.6137,
    "lng": -0.2749,
    "zone": 5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Edgware Road",
    "lat": 51.5199,
    "lng": -0.1682,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Circle",
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Elephant & Castle",
    "lat": 51.4945,
    "lng": -0.1006,
    "zone": 1.5,
    "lines": [
      "Bakerloo",
      "Northern"
    ]
  },
  {
    "name": "Elm Park",
    "lat": 51.5498,
    "lng": 0.1986,
    "zone": 6,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Embankment",
    "lat": 51.5071,
    "lng": -0.1227,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Circle",
      "District",
      "Northern"
    ]
  },
  {
    "name": "Epping",
    "lat": 51.6937,
    "lng": 0.1138,
    "zone": 6,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Euston",
    "lat": 51.5278,
    "lng": -0.1318,
    "zone": 1,
    "lines": [
      "Northern",
      "Victoria"
    ]
  },
  {
    "name": "Euston Square",
    "lat": 51.5256,
    "lng": -0.1358,
    "zone": 1,
    "lines": [
      "Circle",
      "Hammersmith & City",
      "Metropolitan"
    ]
  },
  {
    "name": "Fairlop",
    "lat": 51.5956,
    "lng": 0.091,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Farringdon",
    "lat": 51.5203,
    "lng": -0.1049,
    "zone": 1,
    "lines": [
      "Circle",
      "Hammersmith & City",
      "Metropolitan"
    ]
  },
  {
    "name": "Finchley Central",
    "lat": 51.6009,
    "lng": -0.1925,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Finchley Road",
    "lat": 51.5468,
    "lng": -0.1798,
    "zone": 2,
    "lines": [
      "Jubilee",
      "Metropolitan"
    ]
  },
  {
    "name": "Finsbury Park",
    "lat": 51.5642,
    "lng": -0.1068,
    "zone": 2,
    "lines": [
      "Piccadilly",
      "Victoria"
    ]
  },
  {
    "name": "Fulham Broadway",
    "lat": 51.4801,
    "lng": -0.1954,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Gants Hill",
    "lat": 51.5765,
    "lng": 0.0662,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Gloucester Road",
    "lat": 51.4943,
    "lng": -0.1827,
    "zone": 1,
    "lines": [
      "Circle",
      "District",
      "Piccadilly"
    ]
  },
  {
    "name": "Golders Green",
    "lat": 51.5723,
    "lng": -0.194,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Goldhawk Road",
    "lat": 51.502,
    "lng": -0.2267,
    "zone": 2,
    "lines": [
      "Circle",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Goodge Street",
    "lat": 51.5206,
    "lng": -0.1344,
    "zone": 1,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Grange Hill",
    "lat": 51.6134,
    "lng": 0.0921,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Great Portland Street",
    "lat": 51.5238,
    "lng": -0.1443,
    "zone": 1,
    "lines": [
      "Circle",
      "Hammersmith & City",
      "Metropolitan"
    ]
  },
  {
    "name": "Green Park",
    "lat": 51.5069,
    "lng": -0.1428,
    "zone": 1,
    "lines": [
      "Jubilee",
      "Piccadilly",
      "Victoria"
    ]
  },
  {
    "name": "Greenford",
    "lat": 51.5424,
    "lng": -0.3461,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Gunnersbury",
    "lat": 51.4918,
    "lng": -0.2753,
    "zone": 3,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Hainault",
    "lat": 51.6037,
    "lng": 0.0935,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Hammersmith",
    "lat": 51.4928,
    "lng": -0.2243,
    "zone": 2,
    "lines": [
      "Circle",
      "District",
      "Hammersmith & City",
      "Piccadilly"
    ]
  },
  {
    "name": "Hampstead",
    "lat": 51.5562,
    "lng": -0.1775,
    "zone": 2.5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Hanger Lane",
    "lat": 51.5302,
    "lng": -0.2927,
    "zone": 3,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Harlesden",
    "lat": 51.5363,
    "lng": -0.2579,
    "zone": 3,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Harrow & Wealdstone",
    "lat": 51.5923,
    "lng": -0.3352,
    "zone": 5,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Harrow-on-the-Hill",
    "lat": 51.5792,
    "lng": -0.3372,
    "zone": 5,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Hatton Cross",
    "lat": 51.4667,
    "lng": -0.4232,
    "zone": 5.5,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Heathrow Terminal 4",
    "lat": 51.4585,
    "lng": -0.4458,
    "zone": 6,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Heathrow Terminal 5",
    "lat": 51.4701,
    "lng": -0.4906,
    "zone": 6,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Heathrow Terminals 2 & 3",
    "lat": 51.4712,
    "lng": -0.4523,
    "zone": 6,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Hendon Central",
    "lat": 51.5833,
    "lng": -0.2264,
    "zone": 3.5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "High Barnet",
    "lat": 51.6505,
    "lng": -0.1943,
    "zone": 5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "High Street Kensington",
    "lat": 51.5011,
    "lng": -0.1928,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Highbury & Islington",
    "lat": 51.5463,
    "lng": -0.1033,
    "zone": 2,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Highgate",
    "lat": 51.5775,
    "lng": -0.1459,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Hillingdon",
    "lat": 51.5537,
    "lng": -0.4498,
    "zone": 6,
    "lines": [
      "Metropolitan",
      "Piccadilly"
    ]
  },
  {
    "name": "Holborn",
    "lat": 51.5176,
    "lng": -0.1205,
    "zone": 1,
    "lines": [
      "Central",
      "Piccadilly"
    ]
  },
  {
    "name": "Holland Park",
    "lat": 51.5071,
    "lng": -0.2057,
    "zone": 2,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Holloway Road",
    "lat": 51.5527,
    "lng": -0.1132,
    "zone": 2,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Hornchurch",
    "lat": 51.5541,
    "lng": 0.2191,
    "zone": 6,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Hounslow Central",
    "lat": 51.4713,
    "lng": -0.3666,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Hounslow East",
    "lat": 51.4732,
    "lng": -0.3565,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Hounslow West",
    "lat": 51.4735,
    "lng": -0.3865,
    "zone": 5,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Hyde Park Corner",
    "lat": 51.503,
    "lng": -0.1524,
    "zone": 1,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Ickenham",
    "lat": 51.5618,
    "lng": -0.4422,
    "zone": 6,
    "lines": [
      "Metropolitan",
      "Piccadilly"
    ]
  },
  {
    "name": "Kennington",
    "lat": 51.4883,
    "lng": -0.106,
    "zone": 1.5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Kensal Green",
    "lat": 51.5305,
    "lng": -0.225,
    "zone": 2,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Kensington (Olympia)",
    "lat": 51.4976,
    "lng": -0.21,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Kentish Town",
    "lat": 51.5503,
    "lng": -0.1407,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Kenton",
    "lat": 51.5818,
    "lng": -0.3169,
    "zone": 4,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Kew Gardens",
    "lat": 51.4771,
    "lng": -0.2852,
    "zone": 3.5,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Kilburn",
    "lat": 51.5472,
    "lng": -0.2042,
    "zone": 2,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Kilburn Park",
    "lat": 51.535,
    "lng": -0.1942,
    "zone": 2,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "King's Cross St. Pancras",
    "lat": 51.5307,
    "lng": -0.1232,
    "zone": 1,
    "lines": [
      "Circle",
      "Hammersmith & City",
      "Metropolitan",
      "Northern",
      "Piccadilly",
      "Victoria"
    ]
  },
  {
    "name": "Kingsbury",
    "lat": 51.5848,
    "lng": -0.2788,
    "zone": 4,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Knightsbridge",
    "lat": 51.5017,
    "lng": -0.1605,
    "zone": 1,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Ladbroke Grove",
    "lat": 51.5174,
    "lng": -0.2104,
    "zone": 2,
    "lines": [
      "Circle",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Lambeth North",
    "lat": 51.4988,
    "lng": -0.1123,
    "zone": 1,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Lancaster Gate",
    "lat": 51.5117,
    "lng": -0.1755,
    "zone": 1,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Latimer Road",
    "lat": 51.5134,
    "lng": -0.2178,
    "zone": 2,
    "lines": [
      "Circle",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Leicester Square",
    "lat": 51.5114,
    "lng": -0.1284,
    "zone": 1,
    "lines": [
      "Northern",
      "Piccadilly"
    ]
  },
  {
    "name": "Leyton",
    "lat": 51.5566,
    "lng": -0.0055,
    "zone": 3,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Leytonstone",
    "lat": 51.5683,
    "lng": 0.0082,
    "zone": 3.5,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Liverpool Street",
    "lat": 51.5174,
    "lng": -0.0832,
    "zone": 1,
    "lines": [
      "Central",
      "Circle",
      "Hammersmith & City",
      "Metropolitan"
    ]
  },
  {
    "name": "London Bridge",
    "lat": 51.5057,
    "lng": -0.0889,
    "zone": 1,
    "lines": [
      "Jubilee",
      "Northern"
    ]
  },
  {
    "name": "Loughton",
    "lat": 51.6414,
    "lng": 0.0555,
    "zone": 6,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Maida Vale",
    "lat": 51.5298,
    "lng": -0.1858,
    "zone": 2,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Manor House",
    "lat": 51.5707,
    "lng": -0.0961,
    "zone": 2.5,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Mansion House",
    "lat": 51.5121,
    "lng": -0.094,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Marble Arch",
    "lat": 51.5134,
    "lng": -0.159,
    "zone": 1,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Marylebone",
    "lat": 51.5223,
    "lng": -0.1632,
    "zone": 1,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Mile End",
    "lat": 51.5251,
    "lng": -0.0336,
    "zone": 2,
    "lines": [
      "Central",
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Mill Hill East",
    "lat": 51.6082,
    "lng": -0.21,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Monument",
    "lat": 51.5107,
    "lng": -0.086,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Moor Park",
    "lat": 51.6298,
    "lng": -0.4325,
    "zone": 6.5,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Moorgate",
    "lat": 51.5182,
    "lng": -0.0883,
    "zone": 1,
    "lines": [
      "Circle",
      "Hammersmith & City",
      "Metropolitan",
      "Northern"
    ]
  },
  {
    "name": "Morden",
    "lat": 51.4021,
    "lng": -0.1948,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Mornington Crescent",
    "lat": 51.5347,
    "lng": -0.1388,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Neasden",
    "lat": 51.554,
    "lng": -0.2498,
    "zone": 3,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Newbury Park",
    "lat": 51.5757,
    "lng": 0.09,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Nine Elms",
    "lat": 51.4799,
    "lng": -0.1285,
    "zone": 1,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "North Acton",
    "lat": 51.5235,
    "lng": -0.2598,
    "zone": 2.5,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "North Ealing",
    "lat": 51.5175,
    "lng": -0.2889,
    "zone": 3,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "North Greenwich",
    "lat": 51.5005,
    "lng": 0.0043,
    "zone": 1,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "North Harrow",
    "lat": 51.5849,
    "lng": -0.3624,
    "zone": 5,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "North Wembley",
    "lat": 51.5626,
    "lng": -0.304,
    "zone": 4,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Northfields",
    "lat": 51.4993,
    "lng": -0.3147,
    "zone": 3,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Northolt",
    "lat": 51.5482,
    "lng": -0.3687,
    "zone": 5,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Northwick Park",
    "lat": 51.5785,
    "lng": -0.3181,
    "zone": 4,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Northwood",
    "lat": 51.6111,
    "lng": -0.4238,
    "zone": 6,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Northwood Hills",
    "lat": 51.6006,
    "lng": -0.4095,
    "zone": 6,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Notting Hill Gate",
    "lat": 51.5091,
    "lng": -0.1961,
    "zone": 1.5,
    "lines": [
      "Central",
      "Circle",
      "District"
    ]
  },
  {
    "name": "Oakwood",
    "lat": 51.6477,
    "lng": -0.1322,
    "zone": 5,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Old Street",
    "lat": 51.5259,
    "lng": -0.0878,
    "zone": 1,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Osterley",
    "lat": 51.4813,
    "lng": -0.3522,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Oval",
    "lat": 51.4819,
    "lng": -0.1124,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Oxford Circus",
    "lat": 51.5152,
    "lng": -0.1419,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Central",
      "Victoria"
    ]
  },
  {
    "name": "Paddington",
    "lat": 51.5172,
    "lng": -0.1767,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Circle",
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Park Royal",
    "lat": 51.5271,
    "lng": -0.2843,
    "zone": 3,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Parsons Green",
    "lat": 51.4753,
    "lng": -0.2012,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Perivale",
    "lat": 51.5367,
    "lng": -0.3234,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Piccadilly Circus",
    "lat": 51.5101,
    "lng": -0.1338,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Piccadilly"
    ]
  },
  {
    "name": "Pimlico",
    "lat": 51.4891,
    "lng": -0.1338,
    "zone": 1,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Pinner",
    "lat": 51.5929,
    "lng": -0.3812,
    "zone": 5,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Plaistow",
    "lat": 51.5313,
    "lng": 0.0175,
    "zone": 3,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Preston Road",
    "lat": 51.572,
    "lng": -0.2951,
    "zone": 4,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Putney Bridge",
    "lat": 51.4683,
    "lng": -0.2087,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Queen's Park",
    "lat": 51.5342,
    "lng": -0.2046,
    "zone": 2,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Queensbury",
    "lat": 51.5942,
    "lng": -0.2862,
    "zone": 4,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Queensway",
    "lat": 51.5103,
    "lng": -0.1872,
    "zone": 1,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Ravenscourt Park",
    "lat": 51.4941,
    "lng": -0.2359,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Rayners Lane",
    "lat": 51.5751,
    "lng": -0.3711,
    "zone": 5,
    "lines": [
      "Metropolitan",
      "Piccadilly"
    ]
  },
  {
    "name": "Redbridge",
    "lat": 51.5762,
    "lng": 0.0454,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Regent's Park",
    "lat": 51.5233,
    "lng": -0.1464,
    "zone": 1,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Richmond",
    "lat": 51.4632,
    "lng": -0.3013,
    "zone": 4,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Rickmansworth",
    "lat": 51.6402,
    "lng": -0.4737,
    "zone": 7,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Roding Valley",
    "lat": 51.6172,
    "lng": 0.0436,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Royal Oak",
    "lat": 51.5191,
    "lng": -0.1887,
    "zone": 2,
    "lines": [
      "Circle",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Ruislip",
    "lat": 51.5714,
    "lng": -0.4219,
    "zone": 6,
    "lines": [
      "Metropolitan",
      "Piccadilly"
    ]
  },
  {
    "name": "Ruislip Gardens",
    "lat": 51.5607,
    "lng": -0.4107,
    "zone": 5,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Ruislip Manor",
    "lat": 51.5732,
    "lng": -0.413,
    "zone": 6,
    "lines": [
      "Metropolitan",
      "Piccadilly"
    ]
  },
  {
    "name": "Russell Square",
    "lat": 51.5231,
    "lng": -0.1243,
    "zone": 1,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Seven Sisters",
    "lat": 51.5833,
    "lng": -0.0726,
    "zone": 3,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Shepherd's Bush",
    "lat": 51.5044,
    "lng": -0.2188,
    "zone": 2,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Shepherd's Bush Market",
    "lat": 51.5056,
    "lng": -0.2264,
    "zone": 2,
    "lines": [
      "Circle",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Sloane Square",
    "lat": 51.4923,
    "lng": -0.1564,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Snaresbrook",
    "lat": 51.5807,
    "lng": 0.0214,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "South Ealing",
    "lat": 51.501,
    "lng": -0.3074,
    "zone": 3,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "South Harrow",
    "lat": 51.5649,
    "lng": -0.3525,
    "zone": 5,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "South Kensington",
    "lat": 51.4941,
    "lng": -0.1741,
    "zone": 1,
    "lines": [
      "Circle",
      "District",
      "Piccadilly"
    ]
  },
  {
    "name": "South Kenton",
    "lat": 51.5702,
    "lng": -0.3084,
    "zone": 4,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "South Ruislip",
    "lat": 51.5569,
    "lng": -0.3989,
    "zone": 5,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "South Wimbledon",
    "lat": 51.4153,
    "lng": -0.192,
    "zone": 3.5,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "South Woodford",
    "lat": 51.5919,
    "lng": 0.0273,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Southfields",
    "lat": 51.4451,
    "lng": -0.2066,
    "zone": 3,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Southgate",
    "lat": 51.6323,
    "lng": -0.1278,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Southwark",
    "lat": 51.5043,
    "lng": -0.1053,
    "zone": 1,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "St. James's Park",
    "lat": 51.4995,
    "lng": -0.1336,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "St. John's Wood",
    "lat": 51.5345,
    "lng": -0.1739,
    "zone": 2,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "St. Paul's",
    "lat": 51.5149,
    "lng": -0.0976,
    "zone": 1,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Stamford Brook",
    "lat": 51.4949,
    "lng": -0.2457,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Stanmore",
    "lat": 51.6198,
    "lng": -0.3033,
    "zone": 5,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Stepney Green",
    "lat": 51.5219,
    "lng": -0.0466,
    "zone": 2,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Stockwell",
    "lat": 51.4722,
    "lng": -0.1226,
    "zone": 2,
    "lines": [
      "Northern",
      "Victoria"
    ]
  },
  {
    "name": "Stonebridge Park",
    "lat": 51.544,
    "lng": -0.2759,
    "zone": 3,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Stratford",
    "lat": 51.5418,
    "lng": -0.0035,
    "zone": 1,
    "lines": [
      "Central",
      "Jubilee"
    ]
  },
  {
    "name": "Sudbury Hill",
    "lat": 51.5569,
    "lng": -0.3364,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Sudbury Town",
    "lat": 51.5508,
    "lng": -0.3157,
    "zone": 4,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Swiss Cottage",
    "lat": 51.5437,
    "lng": -0.1749,
    "zone": 2,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "Temple",
    "lat": 51.511,
    "lng": -0.1143,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Theydon Bois",
    "lat": 51.6718,
    "lng": 0.1031,
    "zone": 6,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Tooting Bec",
    "lat": 51.4357,
    "lng": -0.1597,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Tooting Broadway",
    "lat": 51.4276,
    "lng": -0.1684,
    "zone": 3,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Tottenham Court Road",
    "lat": 51.5164,
    "lng": -0.1304,
    "zone": 1,
    "lines": [
      "Central",
      "Northern"
    ]
  },
  {
    "name": "Tottenham Hale",
    "lat": 51.5881,
    "lng": -0.0602,
    "zone": 3,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Totteridge & Whetstone",
    "lat": 51.6306,
    "lng": -0.1792,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Tower Hill",
    "lat": 51.51,
    "lng": -0.0765,
    "zone": 1,
    "lines": [
      "Circle",
      "District"
    ]
  },
  {
    "name": "Tufnell Park",
    "lat": 51.5568,
    "lng": -0.1384,
    "zone": 2,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "Turnham Green",
    "lat": 51.4951,
    "lng": -0.2546,
    "zone": 2.5,
    "lines": [
      "District",
      "Piccadilly"
    ]
  },
  {
    "name": "Turnpike Lane",
    "lat": 51.5903,
    "lng": -0.103,
    "zone": 3,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Upminster",
    "lat": 51.5591,
    "lng": 0.2509,
    "zone": 6,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Upminster Bridge",
    "lat": 51.5586,
    "lng": 0.2358,
    "zone": 6,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Upney",
    "lat": 51.5384,
    "lng": 0.1015,
    "zone": 4,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Upton Park",
    "lat": 51.5353,
    "lng": 0.0353,
    "zone": 3,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Uxbridge",
    "lat": 51.5466,
    "lng": -0.4779,
    "zone": 6,
    "lines": [
      "Metropolitan",
      "Piccadilly"
    ]
  },
  {
    "name": "Vauxhall",
    "lat": 51.4857,
    "lng": -0.1242,
    "zone": 1.5,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Victoria",
    "lat": 51.4964,
    "lng": -0.1431,
    "zone": 1,
    "lines": [
      "Circle",
      "District",
      "Victoria"
    ]
  },
  {
    "name": "Walthamstow Central",
    "lat": 51.583,
    "lng": -0.0199,
    "zone": 3,
    "lines": [
      "Victoria"
    ]
  },
  {
    "name": "Wanstead",
    "lat": 51.5755,
    "lng": 0.0285,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Warren Street",
    "lat": 51.525,
    "lng": -0.1383,
    "zone": 1,
    "lines": [
      "Northern",
      "Victoria"
    ]
  },
  {
    "name": "Warwick Avenue",
    "lat": 51.5233,
    "lng": -0.1838,
    "zone": 2,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Waterloo",
    "lat": 51.5033,
    "lng": -0.1148,
    "zone": 1,
    "lines": [
      "Bakerloo",
      "Jubilee",
      "Northern",
      "Waterloo & City"
    ]
  },
  {
    "name": "Watford",
    "lat": 51.6574,
    "lng": -0.4174,
    "zone": 7,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "Wembley Central",
    "lat": 51.5523,
    "lng": -0.2969,
    "zone": 4,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Wembley Park",
    "lat": 51.5632,
    "lng": -0.2793,
    "zone": 4,
    "lines": [
      "Jubilee",
      "Metropolitan"
    ]
  },
  {
    "name": "West Acton",
    "lat": 51.518,
    "lng": -0.281,
    "zone": 3,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "West Brompton",
    "lat": 51.4873,
    "lng": -0.1956,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "West Finchley",
    "lat": 51.6094,
    "lng": -0.1884,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  },
  {
    "name": "West Ham",
    "lat": 51.5281,
    "lng": 0.0051,
    "zone": 1,
    "lines": [
      "District",
      "Hammersmith & City",
      "Jubilee"
    ]
  },
  {
    "name": "West Hampstead",
    "lat": 51.5466,
    "lng": -0.1911,
    "zone": 2,
    "lines": [
      "Jubilee"
    ]
  },
  {
    "name": "West Harrow",
    "lat": 51.5797,
    "lng": -0.3534,
    "zone": 5,
    "lines": [
      "Metropolitan"
    ]
  },
  {
    "name": "West Kensington",
    "lat": 51.4905,
    "lng": -0.2066,
    "zone": 2,
    "lines": [
      "District"
    ]
  },
  {
    "name": "West Ruislip",
    "lat": 51.5697,
    "lng": -0.4379,
    "zone": 6,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Westbourne Park",
    "lat": 51.5211,
    "lng": -0.2011,
    "zone": 2,
    "lines": [
      "Circle",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Westminster",
    "lat": 51.5013,
    "lng": -0.1249,
    "zone": 1,
    "lines": [
      "Circle",
      "District",
      "Jubilee"
    ]
  },
  {
    "name": "White City",
    "lat": 51.512,
    "lng": -0.2243,
    "zone": 2,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Whitechapel",
    "lat": 51.5195,
    "lng": -0.06,
    "zone": 2,
    "lines": [
      "District",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Willesden Green",
    "lat": 51.5491,
    "lng": -0.2215,
    "zone": 2.5,
    "lines": [
      "Jubilee",
      "Metropolitan"
    ]
  },
  {
    "name": "Willesden Junction",
    "lat": 51.5323,
    "lng": -0.2443,
    "zone": 2.5,
    "lines": [
      "Bakerloo"
    ]
  },
  {
    "name": "Wimbledon",
    "lat": 51.4212,
    "lng": -0.2066,
    "zone": 3,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Wimbledon Park",
    "lat": 51.4346,
    "lng": -0.1997,
    "zone": 3,
    "lines": [
      "District"
    ]
  },
  {
    "name": "Wood Green",
    "lat": 51.5975,
    "lng": -0.1099,
    "zone": 3,
    "lines": [
      "Piccadilly"
    ]
  },
  {
    "name": "Wood Lane",
    "lat": 51.5097,
    "lng": -0.2245,
    "zone": 2,
    "lines": [
      "Circle",
      "Hammersmith & City"
    ]
  },
  {
    "name": "Woodford",
    "lat": 51.6069,
    "lng": 0.034,
    "zone": 4,
    "lines": [
      "Central"
    ]
  },
  {
    "name": "Woodside Park",
    "lat": 51.618,
    "lng": -0.1854,
    "zone": 4,
    "lines": [
      "Northern"
    ]
  }
];

export const tflConnections: TubeConnectionRaw[] = [
  {
    "a": "Acton Town",
    "b": "Chiswick Park",
    "color": "#00782A"
  },
  {
    "a": "Acton Town",
    "b": "Ealing Common",
    "color": "#003688"
  },
  {
    "a": "Acton Town",
    "b": "Ealing Common",
    "color": "#00782A"
  },
  {
    "a": "Acton Town",
    "b": "South Ealing",
    "color": "#003688"
  },
  {
    "a": "Acton Town",
    "b": "Turnham Green",
    "color": "#003688"
  },
  {
    "a": "Aldgate East",
    "b": "Liverpool Street",
    "color": "#F3A9BB"
  },
  {
    "a": "Aldgate East",
    "b": "Tower Hill",
    "color": "#00782A"
  },
  {
    "a": "Aldgate East",
    "b": "Whitechapel",
    "color": "#00782A"
  },
  {
    "a": "Aldgate East",
    "b": "Whitechapel",
    "color": "#F3A9BB"
  },
  {
    "a": "Aldgate",
    "b": "Liverpool Street",
    "color": "#9B0056"
  },
  {
    "a": "Aldgate",
    "b": "Liverpool Street",
    "color": "#FFD300"
  },
  {
    "a": "Aldgate",
    "b": "Tower Hill",
    "color": "#FFD300"
  },
  {
    "a": "Alperton",
    "b": "Park Royal",
    "color": "#003688"
  },
  {
    "a": "Alperton",
    "b": "Sudbury Town",
    "color": "#003688"
  },
  {
    "a": "Amersham",
    "b": "Chalfont & Latimer",
    "color": "#9B0056"
  },
  {
    "a": "Angel",
    "b": "King's Cross St. Pancras",
    "color": "#000000"
  },
  {
    "a": "Angel",
    "b": "Old Street",
    "color": "#000000"
  },
  {
    "a": "Archway",
    "b": "Highgate",
    "color": "#000000"
  },
  {
    "a": "Archway",
    "b": "Tufnell Park",
    "color": "#000000"
  },
  {
    "a": "Arnos Grove",
    "b": "Bounds Green",
    "color": "#003688"
  },
  {
    "a": "Arnos Grove",
    "b": "Southgate",
    "color": "#003688"
  },
  {
    "a": "Arsenal",
    "b": "Finsbury Park",
    "color": "#003688"
  },
  {
    "a": "Arsenal",
    "b": "Holloway Road",
    "color": "#003688"
  },
  {
    "a": "Baker Street",
    "b": "Bond Street",
    "color": "#A0A5A9"
  },
  {
    "a": "Baker Street",
    "b": "Edgware Road",
    "color": "#F3A9BB"
  },
  {
    "a": "Baker Street",
    "b": "Edgware Road",
    "color": "#FFD300"
  },
  {
    "a": "Baker Street",
    "b": "Finchley Road",
    "color": "#9B0056"
  },
  {
    "a": "Baker Street",
    "b": "Great Portland Street",
    "color": "#9B0056"
  },
  {
    "a": "Baker Street",
    "b": "Great Portland Street",
    "color": "#F3A9BB"
  },
  {
    "a": "Baker Street",
    "b": "Great Portland Street",
    "color": "#FFD300"
  },
  {
    "a": "Baker Street",
    "b": "Marylebone",
    "color": "#B36305"
  },
  {
    "a": "Baker Street",
    "b": "Regent's Park",
    "color": "#B36305"
  },
  {
    "a": "Baker Street",
    "b": "St. John's Wood",
    "color": "#A0A5A9"
  },
  {
    "a": "Balham",
    "b": "Clapham South",
    "color": "#000000"
  },
  {
    "a": "Balham",
    "b": "Tooting Bec",
    "color": "#000000"
  },
  {
    "a": "Bank",
    "b": "Liverpool Street",
    "color": "#E32017"
  },
  {
    "a": "Bank",
    "b": "London Bridge",
    "color": "#000000"
  },
  {
    "a": "Bank",
    "b": "Moorgate",
    "color": "#000000"
  },
  {
    "a": "Bank",
    "b": "St. Paul's",
    "color": "#E32017"
  },
  {
    "a": "Bank",
    "b": "Waterloo",
    "color": "#95CDBA"
  },
  {
    "a": "Barbican",
    "b": "Farringdon",
    "color": "#9B0056"
  },
  {
    "a": "Barbican",
    "b": "Farringdon",
    "color": "#F3A9BB"
  },
  {
    "a": "Barbican",
    "b": "Farringdon",
    "color": "#FFD300"
  },
  {
    "a": "Barbican",
    "b": "Moorgate",
    "color": "#9B0056"
  },
  {
    "a": "Barbican",
    "b": "Moorgate",
    "color": "#F3A9BB"
  },
  {
    "a": "Barbican",
    "b": "Moorgate",
    "color": "#FFD300"
  },
  {
    "a": "Barking",
    "b": "East Ham",
    "color": "#00782A"
  },
  {
    "a": "Barking",
    "b": "East Ham",
    "color": "#F3A9BB"
  },
  {
    "a": "Barkingside",
    "b": "Fairlop",
    "color": "#E32017"
  },
  {
    "a": "Barkingside",
    "b": "Newbury Park",
    "color": "#E32017"
  },
  {
    "a": "Barking",
    "b": "Upney",
    "color": "#00782A"
  },
  {
    "a": "Barons Court",
    "b": "Earl's Court",
    "color": "#003688"
  },
  {
    "a": "Barons Court",
    "b": "Hammersmith",
    "color": "#003688"
  },
  {
    "a": "Barons Court",
    "b": "Hammersmith",
    "color": "#00782A"
  },
  {
    "a": "Barons Court",
    "b": "West Kensington",
    "color": "#00782A"
  },
  {
    "a": "Battersea Power Station",
    "b": "Nine Elms",
    "color": "#000000"
  },
  {
    "a": "Bayswater",
    "b": "Notting Hill Gate",
    "color": "#00782A"
  },
  {
    "a": "Bayswater",
    "b": "Notting Hill Gate",
    "color": "#FFD300"
  },
  {
    "a": "Bayswater",
    "b": "Paddington",
    "color": "#00782A"
  },
  {
    "a": "Bayswater",
    "b": "Paddington",
    "color": "#FFD300"
  },
  {
    "a": "Becontree",
    "b": "Dagenham Heathway",
    "color": "#00782A"
  },
  {
    "a": "Becontree",
    "b": "Upney",
    "color": "#00782A"
  },
  {
    "a": "Belsize Park",
    "b": "Chalk Farm",
    "color": "#000000"
  },
  {
    "a": "Belsize Park",
    "b": "Hampstead",
    "color": "#000000"
  },
  {
    "a": "Bermondsey",
    "b": "Canada Water",
    "color": "#A0A5A9"
  },
  {
    "a": "Bermondsey",
    "b": "London Bridge",
    "color": "#A0A5A9"
  },
  {
    "a": "Bethnal Green",
    "b": "Liverpool Street",
    "color": "#E32017"
  },
  {
    "a": "Bethnal Green",
    "b": "Mile End",
    "color": "#E32017"
  },
  {
    "a": "Blackfriars",
    "b": "Mansion House",
    "color": "#00782A"
  },
  {
    "a": "Blackfriars",
    "b": "Mansion House",
    "color": "#FFD300"
  },
  {
    "a": "Blackfriars",
    "b": "Temple",
    "color": "#00782A"
  },
  {
    "a": "Blackfriars",
    "b": "Temple",
    "color": "#FFD300"
  },
  {
    "a": "Blackhorse Road",
    "b": "Tottenham Hale",
    "color": "#0098D4"
  },
  {
    "a": "Blackhorse Road",
    "b": "Walthamstow Central",
    "color": "#0098D4"
  },
  {
    "a": "Bond Street",
    "b": "Green Park",
    "color": "#A0A5A9"
  },
  {
    "a": "Bond Street",
    "b": "Marble Arch",
    "color": "#E32017"
  },
  {
    "a": "Bond Street",
    "b": "Oxford Circus",
    "color": "#E32017"
  },
  {
    "a": "Borough",
    "b": "Elephant & Castle",
    "color": "#000000"
  },
  {
    "a": "Borough",
    "b": "London Bridge",
    "color": "#000000"
  },
  {
    "a": "Boston Manor",
    "b": "Northfields",
    "color": "#003688"
  },
  {
    "a": "Boston Manor",
    "b": "Osterley",
    "color": "#003688"
  },
  {
    "a": "Bounds Green",
    "b": "Wood Green",
    "color": "#003688"
  },
  {
    "a": "Bow Road",
    "b": "Bromley-by-Bow",
    "color": "#00782A"
  },
  {
    "a": "Bow Road",
    "b": "Bromley-by-Bow",
    "color": "#F3A9BB"
  },
  {
    "a": "Bow Road",
    "b": "Mile End",
    "color": "#00782A"
  },
  {
    "a": "Bow Road",
    "b": "Mile End",
    "color": "#F3A9BB"
  },
  {
    "a": "Brent Cross",
    "b": "Golders Green",
    "color": "#000000"
  },
  {
    "a": "Brent Cross",
    "b": "Hendon Central",
    "color": "#000000"
  },
  {
    "a": "Brixton",
    "b": "Stockwell",
    "color": "#0098D4"
  },
  {
    "a": "Bromley-by-Bow",
    "b": "West Ham",
    "color": "#00782A"
  },
  {
    "a": "Bromley-by-Bow",
    "b": "West Ham",
    "color": "#F3A9BB"
  },
  {
    "a": "Buckhurst Hill",
    "b": "Loughton",
    "color": "#E32017"
  },
  {
    "a": "Buckhurst Hill",
    "b": "Woodford",
    "color": "#E32017"
  },
  {
    "a": "Burnt Oak",
    "b": "Colindale",
    "color": "#000000"
  },
  {
    "a": "Burnt Oak",
    "b": "Edgware",
    "color": "#000000"
  },
  {
    "a": "Caledonian Road",
    "b": "Holloway Road",
    "color": "#003688"
  },
  {
    "a": "Caledonian Road",
    "b": "King's Cross St. Pancras",
    "color": "#003688"
  },
  {
    "a": "Camden Town",
    "b": "Chalk Farm",
    "color": "#000000"
  },
  {
    "a": "Camden Town",
    "b": "Euston",
    "color": "#000000"
  },
  {
    "a": "Camden Town",
    "b": "Kentish Town",
    "color": "#000000"
  },
  {
    "a": "Camden Town",
    "b": "Mornington Crescent",
    "color": "#000000"
  },
  {
    "a": "Canada Water",
    "b": "Canary Wharf",
    "color": "#A0A5A9"
  },
  {
    "a": "Canary Wharf",
    "b": "North Greenwich",
    "color": "#A0A5A9"
  },
  {
    "a": "Canning Town",
    "b": "North Greenwich",
    "color": "#A0A5A9"
  },
  {
    "a": "Canning Town",
    "b": "West Ham",
    "color": "#A0A5A9"
  },
  {
    "a": "Cannon Street",
    "b": "Mansion House",
    "color": "#00782A"
  },
  {
    "a": "Cannon Street",
    "b": "Mansion House",
    "color": "#FFD300"
  },
  {
    "a": "Cannon Street",
    "b": "Monument",
    "color": "#00782A"
  },
  {
    "a": "Cannon Street",
    "b": "Monument",
    "color": "#FFD300"
  },
  {
    "a": "Canons Park",
    "b": "Queensbury",
    "color": "#A0A5A9"
  },
  {
    "a": "Canons Park",
    "b": "Stanmore",
    "color": "#A0A5A9"
  },
  {
    "a": "Chalfont & Latimer",
    "b": "Chesham",
    "color": "#9B0056"
  },
  {
    "a": "Chalfont & Latimer",
    "b": "Chorleywood",
    "color": "#9B0056"
  },
  {
    "a": "Chancery Lane",
    "b": "Holborn",
    "color": "#E32017"
  },
  {
    "a": "Chancery Lane",
    "b": "St. Paul's",
    "color": "#E32017"
  },
  {
    "a": "Charing Cross",
    "b": "Embankment",
    "color": "#000000"
  },
  {
    "a": "Charing Cross",
    "b": "Embankment",
    "color": "#B36305"
  },
  {
    "a": "Charing Cross",
    "b": "Leicester Square",
    "color": "#000000"
  },
  {
    "a": "Charing Cross",
    "b": "Piccadilly Circus",
    "color": "#B36305"
  },
  {
    "a": "Chigwell",
    "b": "Grange Hill",
    "color": "#E32017"
  },
  {
    "a": "Chigwell",
    "b": "Roding Valley",
    "color": "#E32017"
  },
  {
    "a": "Chiswick Park",
    "b": "Turnham Green",
    "color": "#00782A"
  },
  {
    "a": "Chorleywood",
    "b": "Rickmansworth",
    "color": "#9B0056"
  },
  {
    "a": "Clapham Common",
    "b": "Clapham North",
    "color": "#000000"
  },
  {
    "a": "Clapham Common",
    "b": "Clapham South",
    "color": "#000000"
  },
  {
    "a": "Clapham North",
    "b": "Stockwell",
    "color": "#000000"
  },
  {
    "a": "Cockfosters",
    "b": "Oakwood",
    "color": "#003688"
  },
  {
    "a": "Colindale",
    "b": "Hendon Central",
    "color": "#000000"
  },
  {
    "a": "Colliers Wood",
    "b": "South Wimbledon",
    "color": "#000000"
  },
  {
    "a": "Colliers Wood",
    "b": "Tooting Broadway",
    "color": "#000000"
  },
  {
    "a": "Covent Garden",
    "b": "Holborn",
    "color": "#003688"
  },
  {
    "a": "Covent Garden",
    "b": "Leicester Square",
    "color": "#003688"
  },
  {
    "a": "Croxley",
    "b": "Moor Park",
    "color": "#9B0056"
  },
  {
    "a": "Croxley",
    "b": "Watford",
    "color": "#9B0056"
  },
  {
    "a": "Dagenham East",
    "b": "Dagenham Heathway",
    "color": "#00782A"
  },
  {
    "a": "Dagenham East",
    "b": "Elm Park",
    "color": "#00782A"
  },
  {
    "a": "Debden",
    "b": "Loughton",
    "color": "#E32017"
  },
  {
    "a": "Debden",
    "b": "Theydon Bois",
    "color": "#E32017"
  },
  {
    "a": "Dollis Hill",
    "b": "Neasden",
    "color": "#A0A5A9"
  },
  {
    "a": "Dollis Hill",
    "b": "Willesden Green",
    "color": "#A0A5A9"
  },
  {
    "a": "Ealing Broadway",
    "b": "Ealing Common",
    "color": "#00782A"
  },
  {
    "a": "Ealing Broadway",
    "b": "West Acton",
    "color": "#E32017"
  },
  {
    "a": "Ealing Common",
    "b": "North Ealing",
    "color": "#003688"
  },
  {
    "a": "Earl's Court",
    "b": "Gloucester Road",
    "color": "#003688"
  },
  {
    "a": "Earl's Court",
    "b": "Gloucester Road",
    "color": "#00782A"
  },
  {
    "a": "Earl's Court",
    "b": "High Street Kensington",
    "color": "#00782A"
  },
  {
    "a": "Earl's Court",
    "b": "Kensington (Olympia)",
    "color": "#00782A"
  },
  {
    "a": "Earl's Court",
    "b": "West Brompton",
    "color": "#00782A"
  },
  {
    "a": "Earl's Court",
    "b": "West Kensington",
    "color": "#00782A"
  },
  {
    "a": "East Acton",
    "b": "North Acton",
    "color": "#E32017"
  },
  {
    "a": "East Acton",
    "b": "White City",
    "color": "#E32017"
  },
  {
    "a": "East Finchley",
    "b": "Finchley Central",
    "color": "#000000"
  },
  {
    "a": "East Finchley",
    "b": "Highgate",
    "color": "#000000"
  },
  {
    "a": "East Ham",
    "b": "Upton Park",
    "color": "#00782A"
  },
  {
    "a": "East Ham",
    "b": "Upton Park",
    "color": "#F3A9BB"
  },
  {
    "a": "East Putney",
    "b": "Putney Bridge",
    "color": "#00782A"
  },
  {
    "a": "East Putney",
    "b": "Southfields",
    "color": "#00782A"
  },
  {
    "a": "Eastcote",
    "b": "Rayners Lane",
    "color": "#003688"
  },
  {
    "a": "Eastcote",
    "b": "Rayners Lane",
    "color": "#9B0056"
  },
  {
    "a": "Eastcote",
    "b": "Ruislip Manor",
    "color": "#003688"
  },
  {
    "a": "Eastcote",
    "b": "Ruislip Manor",
    "color": "#9B0056"
  },
  {
    "a": "Edgware Road",
    "b": "Marylebone",
    "color": "#B36305"
  },
  {
    "a": "Edgware Road",
    "b": "Paddington",
    "color": "#00782A"
  },
  {
    "a": "Edgware Road",
    "b": "Paddington",
    "color": "#B36305"
  },
  {
    "a": "Edgware Road",
    "b": "Paddington",
    "color": "#F3A9BB"
  },
  {
    "a": "Edgware Road",
    "b": "Paddington",
    "color": "#FFD300"
  },
  {
    "a": "Elephant & Castle",
    "b": "Kennington",
    "color": "#000000"
  },
  {
    "a": "Elephant & Castle",
    "b": "Lambeth North",
    "color": "#B36305"
  },
  {
    "a": "Elm Park",
    "b": "Hornchurch",
    "color": "#00782A"
  },
  {
    "a": "Embankment",
    "b": "Temple",
    "color": "#00782A"
  },
  {
    "a": "Embankment",
    "b": "Temple",
    "color": "#FFD300"
  },
  {
    "a": "Embankment",
    "b": "Waterloo",
    "color": "#000000"
  },
  {
    "a": "Embankment",
    "b": "Waterloo",
    "color": "#B36305"
  },
  {
    "a": "Embankment",
    "b": "Westminster",
    "color": "#00782A"
  },
  {
    "a": "Embankment",
    "b": "Westminster",
    "color": "#FFD300"
  },
  {
    "a": "Epping",
    "b": "Theydon Bois",
    "color": "#E32017"
  },
  {
    "a": "Euston Square",
    "b": "Great Portland Street",
    "color": "#9B0056"
  },
  {
    "a": "Euston Square",
    "b": "Great Portland Street",
    "color": "#F3A9BB"
  },
  {
    "a": "Euston Square",
    "b": "Great Portland Street",
    "color": "#FFD300"
  },
  {
    "a": "Euston Square",
    "b": "King's Cross St. Pancras",
    "color": "#9B0056"
  },
  {
    "a": "Euston Square",
    "b": "King's Cross St. Pancras",
    "color": "#F3A9BB"
  },
  {
    "a": "Euston Square",
    "b": "King's Cross St. Pancras",
    "color": "#FFD300"
  },
  {
    "a": "Euston",
    "b": "King's Cross St. Pancras",
    "color": "#000000"
  },
  {
    "a": "Euston",
    "b": "King's Cross St. Pancras",
    "color": "#0098D4"
  },
  {
    "a": "Euston",
    "b": "Mornington Crescent",
    "color": "#000000"
  },
  {
    "a": "Euston",
    "b": "Warren Street",
    "color": "#000000"
  },
  {
    "a": "Euston",
    "b": "Warren Street",
    "color": "#0098D4"
  },
  {
    "a": "Fairlop",
    "b": "Hainault",
    "color": "#E32017"
  },
  {
    "a": "Farringdon",
    "b": "King's Cross St. Pancras",
    "color": "#9B0056"
  },
  {
    "a": "Farringdon",
    "b": "King's Cross St. Pancras",
    "color": "#F3A9BB"
  },
  {
    "a": "Farringdon",
    "b": "King's Cross St. Pancras",
    "color": "#FFD300"
  },
  {
    "a": "Finchley Central",
    "b": "Mill Hill East",
    "color": "#000000"
  },
  {
    "a": "Finchley Central",
    "b": "West Finchley",
    "color": "#000000"
  },
  {
    "a": "Finchley Road",
    "b": "Swiss Cottage",
    "color": "#A0A5A9"
  },
  {
    "a": "Finchley Road",
    "b": "Wembley Park",
    "color": "#9B0056"
  },
  {
    "a": "Finchley Road",
    "b": "West Hampstead",
    "color": "#A0A5A9"
  },
  {
    "a": "Finchley Road",
    "b": "Willesden Green",
    "color": "#9B0056"
  },
  {
    "a": "Finsbury Park",
    "b": "Highbury & Islington",
    "color": "#0098D4"
  },
  {
    "a": "Finsbury Park",
    "b": "Manor House",
    "color": "#003688"
  },
  {
    "a": "Finsbury Park",
    "b": "Seven Sisters",
    "color": "#0098D4"
  },
  {
    "a": "Fulham Broadway",
    "b": "Parsons Green",
    "color": "#00782A"
  },
  {
    "a": "Fulham Broadway",
    "b": "West Brompton",
    "color": "#00782A"
  },
  {
    "a": "Gants Hill",
    "b": "Newbury Park",
    "color": "#E32017"
  },
  {
    "a": "Gants Hill",
    "b": "Redbridge",
    "color": "#E32017"
  },
  {
    "a": "Gloucester Road",
    "b": "High Street Kensington",
    "color": "#FFD300"
  },
  {
    "a": "Gloucester Road",
    "b": "South Kensington",
    "color": "#003688"
  },
  {
    "a": "Gloucester Road",
    "b": "South Kensington",
    "color": "#00782A"
  },
  {
    "a": "Gloucester Road",
    "b": "South Kensington",
    "color": "#FFD300"
  },
  {
    "a": "Golders Green",
    "b": "Hampstead",
    "color": "#000000"
  },
  {
    "a": "Goldhawk Road",
    "b": "Hammersmith",
    "color": "#F3A9BB"
  },
  {
    "a": "Goldhawk Road",
    "b": "Hammersmith",
    "color": "#FFD300"
  },
  {
    "a": "Goldhawk Road",
    "b": "Shepherd's Bush Market",
    "color": "#F3A9BB"
  },
  {
    "a": "Goldhawk Road",
    "b": "Shepherd's Bush Market",
    "color": "#FFD300"
  },
  {
    "a": "Goodge Street",
    "b": "Tottenham Court Road",
    "color": "#000000"
  },
  {
    "a": "Goodge Street",
    "b": "Warren Street",
    "color": "#000000"
  },
  {
    "a": "Grange Hill",
    "b": "Hainault",
    "color": "#E32017"
  },
  {
    "a": "Green Park",
    "b": "Hyde Park Corner",
    "color": "#003688"
  },
  {
    "a": "Green Park",
    "b": "Oxford Circus",
    "color": "#0098D4"
  },
  {
    "a": "Green Park",
    "b": "Piccadilly Circus",
    "color": "#003688"
  },
  {
    "a": "Green Park",
    "b": "Victoria",
    "color": "#0098D4"
  },
  {
    "a": "Green Park",
    "b": "Westminster",
    "color": "#A0A5A9"
  },
  {
    "a": "Greenford",
    "b": "Northolt",
    "color": "#E32017"
  },
  {
    "a": "Greenford",
    "b": "Perivale",
    "color": "#E32017"
  },
  {
    "a": "Gunnersbury",
    "b": "Kew Gardens",
    "color": "#00782A"
  },
  {
    "a": "Gunnersbury",
    "b": "Turnham Green",
    "color": "#00782A"
  },
  {
    "a": "Hammersmith",
    "b": "Ravenscourt Park",
    "color": "#00782A"
  },
  {
    "a": "Hammersmith",
    "b": "Turnham Green",
    "color": "#003688"
  },
  {
    "a": "Hanger Lane",
    "b": "North Acton",
    "color": "#E32017"
  },
  {
    "a": "Hanger Lane",
    "b": "Perivale",
    "color": "#E32017"
  },
  {
    "a": "Harlesden",
    "b": "Stonebridge Park",
    "color": "#B36305"
  },
  {
    "a": "Harlesden",
    "b": "Willesden Junction",
    "color": "#B36305"
  },
  {
    "a": "Harrow & Wealdstone",
    "b": "Kenton",
    "color": "#B36305"
  },
  {
    "a": "Harrow-on-the-Hill",
    "b": "North Harrow",
    "color": "#9B0056"
  },
  {
    "a": "Harrow-on-the-Hill",
    "b": "Northwick Park",
    "color": "#9B0056"
  },
  {
    "a": "Harrow-on-the-Hill",
    "b": "West Harrow",
    "color": "#9B0056"
  },
  {
    "a": "Hatton Cross",
    "b": "Heathrow Terminal 4",
    "color": "#003688"
  },
  {
    "a": "Hatton Cross",
    "b": "Heathrow Terminals 2 & 3",
    "color": "#003688"
  },
  {
    "a": "Hatton Cross",
    "b": "Hounslow West",
    "color": "#003688"
  },
  {
    "a": "Heathrow Terminal 4",
    "b": "Heathrow Terminals 2 & 3",
    "color": "#003688"
  },
  {
    "a": "Heathrow Terminal 5",
    "b": "Heathrow Terminals 2 & 3",
    "color": "#003688"
  },
  {
    "a": "High Barnet",
    "b": "Totteridge & Whetstone",
    "color": "#000000"
  },
  {
    "a": "High Street Kensington",
    "b": "Notting Hill Gate",
    "color": "#00782A"
  },
  {
    "a": "High Street Kensington",
    "b": "Notting Hill Gate",
    "color": "#FFD300"
  },
  {
    "a": "Highbury & Islington",
    "b": "King's Cross St. Pancras",
    "color": "#0098D4"
  },
  {
    "a": "Hillingdon",
    "b": "Ickenham",
    "color": "#003688"
  },
  {
    "a": "Hillingdon",
    "b": "Ickenham",
    "color": "#9B0056"
  },
  {
    "a": "Hillingdon",
    "b": "Uxbridge",
    "color": "#003688"
  },
  {
    "a": "Hillingdon",
    "b": "Uxbridge",
    "color": "#9B0056"
  },
  {
    "a": "Holborn",
    "b": "Russell Square",
    "color": "#003688"
  },
  {
    "a": "Holborn",
    "b": "Tottenham Court Road",
    "color": "#E32017"
  },
  {
    "a": "Holland Park",
    "b": "Notting Hill Gate",
    "color": "#E32017"
  },
  {
    "a": "Holland Park",
    "b": "Shepherd's Bush",
    "color": "#E32017"
  },
  {
    "a": "Hornchurch",
    "b": "Upminster Bridge",
    "color": "#00782A"
  },
  {
    "a": "Hounslow Central",
    "b": "Hounslow East",
    "color": "#003688"
  },
  {
    "a": "Hounslow Central",
    "b": "Hounslow West",
    "color": "#003688"
  },
  {
    "a": "Hounslow East",
    "b": "Osterley",
    "color": "#003688"
  },
  {
    "a": "Hyde Park Corner",
    "b": "Knightsbridge",
    "color": "#003688"
  },
  {
    "a": "Ickenham",
    "b": "Ruislip",
    "color": "#003688"
  },
  {
    "a": "Ickenham",
    "b": "Ruislip",
    "color": "#9B0056"
  },
  {
    "a": "Kennington",
    "b": "Nine Elms",
    "color": "#000000"
  },
  {
    "a": "Kennington",
    "b": "Oval",
    "color": "#000000"
  },
  {
    "a": "Kennington",
    "b": "Waterloo",
    "color": "#000000"
  },
  {
    "a": "Kensal Green",
    "b": "Queen's Park",
    "color": "#B36305"
  },
  {
    "a": "Kensal Green",
    "b": "Willesden Junction",
    "color": "#B36305"
  },
  {
    "a": "Kentish Town",
    "b": "Tufnell Park",
    "color": "#000000"
  },
  {
    "a": "Kenton",
    "b": "South Kenton",
    "color": "#B36305"
  },
  {
    "a": "Kew Gardens",
    "b": "Richmond",
    "color": "#00782A"
  },
  {
    "a": "Kilburn Park",
    "b": "Maida Vale",
    "color": "#B36305"
  },
  {
    "a": "Kilburn Park",
    "b": "Queen's Park",
    "color": "#B36305"
  },
  {
    "a": "Kilburn",
    "b": "West Hampstead",
    "color": "#A0A5A9"
  },
  {
    "a": "Kilburn",
    "b": "Willesden Green",
    "color": "#A0A5A9"
  },
  {
    "a": "King's Cross St. Pancras",
    "b": "Russell Square",
    "color": "#003688"
  },
  {
    "a": "Kingsbury",
    "b": "Queensbury",
    "color": "#A0A5A9"
  },
  {
    "a": "Kingsbury",
    "b": "Wembley Park",
    "color": "#A0A5A9"
  },
  {
    "a": "Knightsbridge",
    "b": "South Kensington",
    "color": "#003688"
  },
  {
    "a": "Ladbroke Grove",
    "b": "Latimer Road",
    "color": "#F3A9BB"
  },
  {
    "a": "Ladbroke Grove",
    "b": "Latimer Road",
    "color": "#FFD300"
  },
  {
    "a": "Ladbroke Grove",
    "b": "Westbourne Park",
    "color": "#F3A9BB"
  },
  {
    "a": "Ladbroke Grove",
    "b": "Westbourne Park",
    "color": "#FFD300"
  },
  {
    "a": "Lambeth North",
    "b": "Waterloo",
    "color": "#B36305"
  },
  {
    "a": "Lancaster Gate",
    "b": "Marble Arch",
    "color": "#E32017"
  },
  {
    "a": "Lancaster Gate",
    "b": "Queensway",
    "color": "#E32017"
  },
  {
    "a": "Latimer Road",
    "b": "Wood Lane",
    "color": "#F3A9BB"
  },
  {
    "a": "Latimer Road",
    "b": "Wood Lane",
    "color": "#FFD300"
  },
  {
    "a": "Leicester Square",
    "b": "Piccadilly Circus",
    "color": "#003688"
  },
  {
    "a": "Leicester Square",
    "b": "Tottenham Court Road",
    "color": "#000000"
  },
  {
    "a": "Leyton",
    "b": "Leytonstone",
    "color": "#E32017"
  },
  {
    "a": "Leytonstone",
    "b": "Snaresbrook",
    "color": "#E32017"
  },
  {
    "a": "Leytonstone",
    "b": "Wanstead",
    "color": "#E32017"
  },
  {
    "a": "Leyton",
    "b": "Stratford",
    "color": "#E32017"
  },
  {
    "a": "Liverpool Street",
    "b": "Moorgate",
    "color": "#9B0056"
  },
  {
    "a": "Liverpool Street",
    "b": "Moorgate",
    "color": "#F3A9BB"
  },
  {
    "a": "Liverpool Street",
    "b": "Moorgate",
    "color": "#FFD300"
  },
  {
    "a": "London Bridge",
    "b": "Southwark",
    "color": "#A0A5A9"
  },
  {
    "a": "Maida Vale",
    "b": "Warwick Avenue",
    "color": "#B36305"
  },
  {
    "a": "Manor House",
    "b": "Turnpike Lane",
    "color": "#003688"
  },
  {
    "a": "Mile End",
    "b": "Stepney Green",
    "color": "#00782A"
  },
  {
    "a": "Mile End",
    "b": "Stepney Green",
    "color": "#F3A9BB"
  },
  {
    "a": "Mile End",
    "b": "Stratford",
    "color": "#E32017"
  },
  {
    "a": "Monument",
    "b": "Tower Hill",
    "color": "#00782A"
  },
  {
    "a": "Monument",
    "b": "Tower Hill",
    "color": "#FFD300"
  },
  {
    "a": "Moor Park",
    "b": "Northwood",
    "color": "#9B0056"
  },
  {
    "a": "Moor Park",
    "b": "Rickmansworth",
    "color": "#9B0056"
  },
  {
    "a": "Moorgate",
    "b": "Old Street",
    "color": "#000000"
  },
  {
    "a": "Morden",
    "b": "South Wimbledon",
    "color": "#000000"
  },
  {
    "a": "Neasden",
    "b": "Wembley Park",
    "color": "#A0A5A9"
  },
  {
    "a": "North Acton",
    "b": "West Acton",
    "color": "#E32017"
  },
  {
    "a": "North Ealing",
    "b": "Park Royal",
    "color": "#003688"
  },
  {
    "a": "North Harrow",
    "b": "Pinner",
    "color": "#9B0056"
  },
  {
    "a": "North Wembley",
    "b": "South Kenton",
    "color": "#B36305"
  },
  {
    "a": "North Wembley",
    "b": "Wembley Central",
    "color": "#B36305"
  },
  {
    "a": "Northfields",
    "b": "South Ealing",
    "color": "#003688"
  },
  {
    "a": "Northolt",
    "b": "South Ruislip",
    "color": "#E32017"
  },
  {
    "a": "Northwick Park",
    "b": "Preston Road",
    "color": "#9B0056"
  },
  {
    "a": "Northwood Hills",
    "b": "Pinner",
    "color": "#9B0056"
  },
  {
    "a": "Northwood",
    "b": "Northwood Hills",
    "color": "#9B0056"
  },
  {
    "a": "Notting Hill Gate",
    "b": "Queensway",
    "color": "#E32017"
  },
  {
    "a": "Oakwood",
    "b": "Southgate",
    "color": "#003688"
  },
  {
    "a": "Oval",
    "b": "Stockwell",
    "color": "#000000"
  },
  {
    "a": "Oxford Circus",
    "b": "Piccadilly Circus",
    "color": "#B36305"
  },
  {
    "a": "Oxford Circus",
    "b": "Regent's Park",
    "color": "#B36305"
  },
  {
    "a": "Oxford Circus",
    "b": "Tottenham Court Road",
    "color": "#E32017"
  },
  {
    "a": "Oxford Circus",
    "b": "Warren Street",
    "color": "#0098D4"
  },
  {
    "a": "Paddington",
    "b": "Royal Oak",
    "color": "#F3A9BB"
  },
  {
    "a": "Paddington",
    "b": "Royal Oak",
    "color": "#FFD300"
  },
  {
    "a": "Paddington",
    "b": "Warwick Avenue",
    "color": "#B36305"
  },
  {
    "a": "Parsons Green",
    "b": "Putney Bridge",
    "color": "#00782A"
  },
  {
    "a": "Pimlico",
    "b": "Vauxhall",
    "color": "#0098D4"
  },
  {
    "a": "Pimlico",
    "b": "Victoria",
    "color": "#0098D4"
  },
  {
    "a": "Plaistow",
    "b": "Upton Park",
    "color": "#00782A"
  },
  {
    "a": "Plaistow",
    "b": "Upton Park",
    "color": "#F3A9BB"
  },
  {
    "a": "Plaistow",
    "b": "West Ham",
    "color": "#00782A"
  },
  {
    "a": "Plaistow",
    "b": "West Ham",
    "color": "#F3A9BB"
  },
  {
    "a": "Preston Road",
    "b": "Wembley Park",
    "color": "#9B0056"
  },
  {
    "a": "Ravenscourt Park",
    "b": "Stamford Brook",
    "color": "#00782A"
  },
  {
    "a": "Rayners Lane",
    "b": "South Harrow",
    "color": "#003688"
  },
  {
    "a": "Rayners Lane",
    "b": "West Harrow",
    "color": "#9B0056"
  },
  {
    "a": "Redbridge",
    "b": "Wanstead",
    "color": "#E32017"
  },
  {
    "a": "Roding Valley",
    "b": "Woodford",
    "color": "#E32017"
  },
  {
    "a": "Royal Oak",
    "b": "Westbourne Park",
    "color": "#F3A9BB"
  },
  {
    "a": "Royal Oak",
    "b": "Westbourne Park",
    "color": "#FFD300"
  },
  {
    "a": "Ruislip Gardens",
    "b": "South Ruislip",
    "color": "#E32017"
  },
  {
    "a": "Ruislip Gardens",
    "b": "West Ruislip",
    "color": "#E32017"
  },
  {
    "a": "Ruislip",
    "b": "Ruislip Manor",
    "color": "#003688"
  },
  {
    "a": "Ruislip",
    "b": "Ruislip Manor",
    "color": "#9B0056"
  },
  {
    "a": "Seven Sisters",
    "b": "Tottenham Hale",
    "color": "#0098D4"
  },
  {
    "a": "Shepherd's Bush Market",
    "b": "Wood Lane",
    "color": "#F3A9BB"
  },
  {
    "a": "Shepherd's Bush Market",
    "b": "Wood Lane",
    "color": "#FFD300"
  },
  {
    "a": "Shepherd's Bush",
    "b": "White City",
    "color": "#E32017"
  },
  {
    "a": "Sloane Square",
    "b": "South Kensington",
    "color": "#00782A"
  },
  {
    "a": "Sloane Square",
    "b": "South Kensington",
    "color": "#FFD300"
  },
  {
    "a": "Sloane Square",
    "b": "Victoria",
    "color": "#00782A"
  },
  {
    "a": "Sloane Square",
    "b": "Victoria",
    "color": "#FFD300"
  },
  {
    "a": "Snaresbrook",
    "b": "South Woodford",
    "color": "#E32017"
  },
  {
    "a": "South Harrow",
    "b": "Sudbury Hill",
    "color": "#003688"
  },
  {
    "a": "South Woodford",
    "b": "Woodford",
    "color": "#E32017"
  },
  {
    "a": "Southfields",
    "b": "Wimbledon Park",
    "color": "#00782A"
  },
  {
    "a": "Southwark",
    "b": "Waterloo",
    "color": "#A0A5A9"
  },
  {
    "a": "St. James's Park",
    "b": "Victoria",
    "color": "#00782A"
  },
  {
    "a": "St. James's Park",
    "b": "Victoria",
    "color": "#FFD300"
  },
  {
    "a": "St. James's Park",
    "b": "Westminster",
    "color": "#00782A"
  },
  {
    "a": "St. James's Park",
    "b": "Westminster",
    "color": "#FFD300"
  },
  {
    "a": "St. John's Wood",
    "b": "Swiss Cottage",
    "color": "#A0A5A9"
  },
  {
    "a": "Stamford Brook",
    "b": "Turnham Green",
    "color": "#00782A"
  },
  {
    "a": "Stepney Green",
    "b": "Whitechapel",
    "color": "#00782A"
  },
  {
    "a": "Stepney Green",
    "b": "Whitechapel",
    "color": "#F3A9BB"
  },
  {
    "a": "Stockwell",
    "b": "Vauxhall",
    "color": "#0098D4"
  },
  {
    "a": "Stonebridge Park",
    "b": "Wembley Central",
    "color": "#B36305"
  },
  {
    "a": "Stratford",
    "b": "West Ham",
    "color": "#A0A5A9"
  },
  {
    "a": "Sudbury Hill",
    "b": "Sudbury Town",
    "color": "#003688"
  },
  {
    "a": "Tooting Bec",
    "b": "Tooting Broadway",
    "color": "#000000"
  },
  {
    "a": "Totteridge & Whetstone",
    "b": "Woodside Park",
    "color": "#000000"
  },
  {
    "a": "Turnpike Lane",
    "b": "Wood Green",
    "color": "#003688"
  },
  {
    "a": "Upminster",
    "b": "Upminster Bridge",
    "color": "#00782A"
  },
  {
    "a": "Waterloo",
    "b": "Westminster",
    "color": "#A0A5A9"
  },
  {
    "a": "Wembley Park",
    "b": "Willesden Green",
    "color": "#9B0056"
  },
  {
    "a": "West Finchley",
    "b": "Woodside Park",
    "color": "#000000"
  },
  {
    "a": "Wimbledon",
    "b": "Wimbledon Park",
    "color": "#00782A"
  }
];
