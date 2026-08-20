// AUTO-GENERATED from the MTA's open data — see tools/gen-subway-mta.mjs,
// which is the only thing that should write this file. Do not edit by hand.
//
// Data from the Metropolitan Transportation Authority: the Subway Stations
// dataset on data.ny.gov for the places, and the GTFS static feed for what
// joins them and for the colours they are drawn in.

export interface SubwayTrunk { id: number; name: string; color: string; long: string; }
export interface SubwayStationRaw {
  name: string;
  lat: number;
  lng: number;
  borough: string;
  routes: string[];
}
export interface SubwayConnectionRaw { a: string; b: string; color: string; }

export const subwayTrunks: SubwayTrunk[] = [
  {
    "id": 1,
    "name": "A·C·E",
    "color": "#0062CF",
    "long": "8 Avenue Express"
  },
  {
    "id": 2,
    "name": "FX·B·D·F·M",
    "color": "#EB6800",
    "long": "Brooklyn F Express"
  },
  {
    "id": 3,
    "name": "G",
    "color": "#799534",
    "long": "Brooklyn-Queens Crosstown"
  },
  {
    "id": 4,
    "name": "J·Z",
    "color": "#8E5C33",
    "long": "Nassau St Local"
  },
  {
    "id": 5,
    "name": "GS·FS·H·L",
    "color": "#7C858C",
    "long": "42 St Shuttle"
  },
  {
    "id": 6,
    "name": "N·Q·R·W",
    "color": "#F6BC26",
    "long": "Broadway Local"
  },
  {
    "id": 7,
    "name": "1·2·3",
    "color": "#D82233",
    "long": "Broadway - 7 Avenue Local"
  },
  {
    "id": 8,
    "name": "6X·4·5·6",
    "color": "#009952",
    "long": "Pelham Bay Park Express"
  },
  {
    "id": 9,
    "name": "7X·7",
    "color": "#9A38A1",
    "long": "Flushing Express"
  }
];

export const subwayStationsRaw: SubwayStationRaw[] = [
  {
    "name": "1 Av",
    "lat": 40.731,
    "lng": -73.9816,
    "borough": "Manhattan",
    "routes": [
      "L"
    ]
  },
  {
    "name": "103 St (1)",
    "lat": 40.7994,
    "lng": -73.9684,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "103 St (6)",
    "lat": 40.7906,
    "lng": -73.9475,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "103 St (B·C)",
    "lat": 40.7961,
    "lng": -73.9615,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "103 St-Corona Plaza",
    "lat": 40.7499,
    "lng": -73.8627,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "104 St (A)",
    "lat": 40.6817,
    "lng": -73.8377,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "104 St (J·Z)",
    "lat": 40.6952,
    "lng": -73.8443,
    "borough": "Queens",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "110 St",
    "lat": 40.795,
    "lng": -73.9442,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "110 St-Malcolm X Plaza",
    "lat": 40.7991,
    "lng": -73.9518,
    "borough": "Manhattan",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "111 St (7)",
    "lat": 40.7517,
    "lng": -73.8553,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "111 St (A)",
    "lat": 40.6843,
    "lng": -73.8322,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "111 St (J)",
    "lat": 40.6974,
    "lng": -73.8363,
    "borough": "Queens",
    "routes": [
      "J"
    ]
  },
  {
    "name": "116 St (2·3)",
    "lat": 40.8021,
    "lng": -73.9496,
    "borough": "Manhattan",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "116 St (6)",
    "lat": 40.7986,
    "lng": -73.9416,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "116 St (B·C)",
    "lat": 40.8051,
    "lng": -73.9549,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "116 St-Columbia University",
    "lat": 40.8077,
    "lng": -73.9641,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "121 St",
    "lat": 40.7005,
    "lng": -73.8283,
    "borough": "Queens",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "125 St (1)",
    "lat": 40.8156,
    "lng": -73.9584,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "125 St (2·3)",
    "lat": 40.8078,
    "lng": -73.9455,
    "borough": "Manhattan",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "125 St (4·5·6)",
    "lat": 40.8041,
    "lng": -73.9376,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5",
      "6"
    ]
  },
  {
    "name": "125 St (A·B·C·D)",
    "lat": 40.8111,
    "lng": -73.9523,
    "borough": "Manhattan",
    "routes": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  {
    "name": "135 St (2·3)",
    "lat": 40.8142,
    "lng": -73.9408,
    "borough": "Manhattan",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "135 St (B·C)",
    "lat": 40.8179,
    "lng": -73.9476,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "137 St-City College",
    "lat": 40.822,
    "lng": -73.9537,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "138 St-Grand Concourse",
    "lat": 40.8132,
    "lng": -73.9298,
    "borough": "The Bronx",
    "routes": [
      "4",
      "5"
    ]
  },
  {
    "name": "14 St (1·2·3·F·L·M)",
    "lat": 40.7378,
    "lng": -73.9977,
    "borough": "Manhattan",
    "routes": [
      "1",
      "2",
      "3",
      "F",
      "L",
      "M"
    ]
  },
  {
    "name": "14 St (A·C·E·L)",
    "lat": 40.7403,
    "lng": -74.0021,
    "borough": "Manhattan",
    "routes": [
      "A",
      "C",
      "E",
      "L"
    ]
  },
  {
    "name": "14 St-Union Sq",
    "lat": 40.7351,
    "lng": -73.9904,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5",
      "6",
      "L",
      "N",
      "Q",
      "R",
      "W"
    ]
  },
  {
    "name": "145 St (1)",
    "lat": 40.8266,
    "lng": -73.9504,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "145 St (3)",
    "lat": 40.8204,
    "lng": -73.9362,
    "borough": "Manhattan",
    "routes": [
      "3"
    ]
  },
  {
    "name": "145 St (A·B·C·D)",
    "lat": 40.8248,
    "lng": -73.9442,
    "borough": "Manhattan",
    "routes": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  {
    "name": "149 St-Hostos",
    "lat": 40.8184,
    "lng": -73.927,
    "borough": "The Bronx",
    "routes": [
      "2",
      "4",
      "5"
    ]
  },
  {
    "name": "15 St-Prospect Park",
    "lat": 40.6604,
    "lng": -73.9795,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G"
    ]
  },
  {
    "name": "155 St (B·D)",
    "lat": 40.8301,
    "lng": -73.9382,
    "borough": "Manhattan",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "155 St (C)",
    "lat": 40.8305,
    "lng": -73.9415,
    "borough": "Manhattan",
    "routes": [
      "C"
    ]
  },
  {
    "name": "157 St",
    "lat": 40.834,
    "lng": -73.9449,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "161 St-Yankee Stadium",
    "lat": 40.8279,
    "lng": -73.9257,
    "borough": "The Bronx",
    "routes": [
      "4",
      "B",
      "D"
    ]
  },
  {
    "name": "163 St-Amsterdam Av",
    "lat": 40.836,
    "lng": -73.9399,
    "borough": "Manhattan",
    "routes": [
      "C"
    ]
  },
  {
    "name": "167 St (4)",
    "lat": 40.8355,
    "lng": -73.9214,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "167 St (B·D)",
    "lat": 40.8338,
    "lng": -73.9184,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "168 St",
    "lat": 40.8406,
    "lng": -73.9398,
    "borough": "Manhattan",
    "routes": [
      "1",
      "A",
      "C"
    ]
  },
  {
    "name": "169 St",
    "lat": 40.7105,
    "lng": -73.7936,
    "borough": "Queens",
    "routes": [
      "F"
    ]
  },
  {
    "name": "170 St (4)",
    "lat": 40.8401,
    "lng": -73.9178,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "170 St (B·D)",
    "lat": 40.8393,
    "lng": -73.9134,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "174 St",
    "lat": 40.8373,
    "lng": -73.8877,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "174-175 Sts",
    "lat": 40.8459,
    "lng": -73.9101,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "175 St",
    "lat": 40.8474,
    "lng": -73.9397,
    "borough": "Manhattan",
    "routes": [
      "A"
    ]
  },
  {
    "name": "176 St",
    "lat": 40.8485,
    "lng": -73.9118,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "18 Av (D)",
    "lat": 40.608,
    "lng": -74.0017,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "18 Av (F)",
    "lat": 40.6298,
    "lng": -73.977,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "18 Av (N)",
    "lat": 40.6207,
    "lng": -73.9904,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "18 St",
    "lat": 40.741,
    "lng": -73.9979,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "181 St (1)",
    "lat": 40.8495,
    "lng": -73.9336,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "181 St (A)",
    "lat": 40.8517,
    "lng": -73.938,
    "borough": "Manhattan",
    "routes": [
      "A"
    ]
  },
  {
    "name": "182-183 Sts",
    "lat": 40.8561,
    "lng": -73.9007,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "183 St",
    "lat": 40.8584,
    "lng": -73.9039,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "190 St",
    "lat": 40.859,
    "lng": -73.9342,
    "borough": "Manhattan",
    "routes": [
      "A"
    ]
  },
  {
    "name": "191 St",
    "lat": 40.8552,
    "lng": -73.9294,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "2 Av",
    "lat": 40.7234,
    "lng": -73.9899,
    "borough": "Manhattan",
    "routes": [
      "F"
    ]
  },
  {
    "name": "20 Av (D)",
    "lat": 40.6046,
    "lng": -73.9982,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "20 Av (N)",
    "lat": 40.6174,
    "lng": -73.985,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "207 St",
    "lat": 40.8646,
    "lng": -73.9188,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "21 St",
    "lat": 40.7441,
    "lng": -73.9497,
    "borough": "Queens",
    "routes": [
      "G"
    ]
  },
  {
    "name": "21 St-Queensbridge",
    "lat": 40.7542,
    "lng": -73.9428,
    "borough": "Queens",
    "routes": [
      "M"
    ]
  },
  {
    "name": "215 St",
    "lat": 40.8694,
    "lng": -73.9153,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "219 St",
    "lat": 40.8839,
    "lng": -73.8626,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "225 St",
    "lat": 40.888,
    "lng": -73.8603,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "23 St (1)",
    "lat": 40.7441,
    "lng": -73.9957,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "23 St (C·E)",
    "lat": 40.7459,
    "lng": -73.998,
    "borough": "Manhattan",
    "routes": [
      "C",
      "E"
    ]
  },
  {
    "name": "23 St (F·M)",
    "lat": 40.7429,
    "lng": -73.9928,
    "borough": "Manhattan",
    "routes": [
      "F",
      "M"
    ]
  },
  {
    "name": "23 St (R·W)",
    "lat": 40.7413,
    "lng": -73.9893,
    "borough": "Manhattan",
    "routes": [
      "R",
      "W"
    ]
  },
  {
    "name": "23 St-Baruch College",
    "lat": 40.7399,
    "lng": -73.9866,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "231 St",
    "lat": 40.8789,
    "lng": -73.9048,
    "borough": "The Bronx",
    "routes": [
      "1"
    ]
  },
  {
    "name": "233 St",
    "lat": 40.8932,
    "lng": -73.8575,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "238 St",
    "lat": 40.8847,
    "lng": -73.9009,
    "borough": "The Bronx",
    "routes": [
      "1"
    ]
  },
  {
    "name": "25 Av",
    "lat": 40.5977,
    "lng": -73.9868,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "25 St",
    "lat": 40.6604,
    "lng": -73.9981,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "28 St (1)",
    "lat": 40.7472,
    "lng": -73.9934,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "28 St (6)",
    "lat": 40.7431,
    "lng": -73.9843,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "28 St (R·W)",
    "lat": 40.7455,
    "lng": -73.9887,
    "borough": "Manhattan",
    "routes": [
      "R",
      "W"
    ]
  },
  {
    "name": "3 Av",
    "lat": 40.7328,
    "lng": -73.9861,
    "borough": "Manhattan",
    "routes": [
      "L"
    ]
  },
  {
    "name": "3 Av-138 St",
    "lat": 40.8105,
    "lng": -73.9261,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "3 Av-149 St",
    "lat": 40.8161,
    "lng": -73.9178,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "30 Av",
    "lat": 40.7668,
    "lng": -73.9215,
    "borough": "Queens",
    "routes": [
      "N",
      "W"
    ]
  },
  {
    "name": "33 St",
    "lat": 40.7461,
    "lng": -73.9821,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "33 St-Rawson St",
    "lat": 40.7446,
    "lng": -73.931,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "34 St-Herald Sq",
    "lat": 40.7496,
    "lng": -73.9879,
    "borough": "Manhattan",
    "routes": [
      "B",
      "D",
      "F",
      "M",
      "N",
      "Q",
      "R",
      "W"
    ]
  },
  {
    "name": "34 St-Hudson Yards",
    "lat": 40.7559,
    "lng": -74.0019,
    "borough": "Manhattan",
    "routes": [
      "7"
    ]
  },
  {
    "name": "34 St-Penn Station (1·2·3)",
    "lat": 40.7504,
    "lng": -73.9911,
    "borough": "Manhattan",
    "routes": [
      "1",
      "2",
      "3"
    ]
  },
  {
    "name": "34 St-Penn Station (A·C·E)",
    "lat": 40.7523,
    "lng": -73.9934,
    "borough": "Manhattan",
    "routes": [
      "A",
      "C",
      "E"
    ]
  },
  {
    "name": "36 Av",
    "lat": 40.7568,
    "lng": -73.9296,
    "borough": "Queens",
    "routes": [
      "N",
      "W"
    ]
  },
  {
    "name": "36 St (D·N·R)",
    "lat": 40.6551,
    "lng": -74.0035,
    "borough": "Brooklyn",
    "routes": [
      "D",
      "N",
      "R"
    ]
  },
  {
    "name": "36 St (M·R)",
    "lat": 40.752,
    "lng": -73.9288,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "39 Av-Dutch Kills",
    "lat": 40.7529,
    "lng": -73.9328,
    "borough": "Queens",
    "routes": [
      "N",
      "W"
    ]
  },
  {
    "name": "4 Av-9 St",
    "lat": 40.6706,
    "lng": -73.989,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G",
      "R"
    ]
  },
  {
    "name": "40 St-Lowery St",
    "lat": 40.7438,
    "lng": -73.924,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "42 St-Bryant Pk",
    "lat": 40.754,
    "lng": -73.9833,
    "borough": "Manhattan",
    "routes": [
      "7",
      "B",
      "D",
      "F",
      "M"
    ]
  },
  {
    "name": "45 St",
    "lat": 40.6489,
    "lng": -74.01,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "46 St",
    "lat": 40.7563,
    "lng": -73.9133,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "46 St-Bliss St",
    "lat": 40.7431,
    "lng": -73.9184,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "47-50 Sts-Rockefeller Ctr",
    "lat": 40.7587,
    "lng": -73.9813,
    "borough": "Manhattan",
    "routes": [
      "B",
      "D",
      "F",
      "M"
    ]
  },
  {
    "name": "49 St",
    "lat": 40.7599,
    "lng": -73.9841,
    "borough": "Manhattan",
    "routes": [
      "N",
      "R",
      "W"
    ]
  },
  {
    "name": "5 Av/53 St",
    "lat": 40.7602,
    "lng": -73.9752,
    "borough": "Manhattan",
    "routes": [
      "E",
      "F"
    ]
  },
  {
    "name": "5 Av/59 St",
    "lat": 40.7648,
    "lng": -73.9733,
    "borough": "Manhattan",
    "routes": [
      "N",
      "R",
      "W"
    ]
  },
  {
    "name": "50 St (1)",
    "lat": 40.7617,
    "lng": -73.9838,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "50 St (C·E)",
    "lat": 40.7625,
    "lng": -73.986,
    "borough": "Manhattan",
    "routes": [
      "C",
      "E"
    ]
  },
  {
    "name": "50 St (D)",
    "lat": 40.6363,
    "lng": -73.9948,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "51 St",
    "lat": 40.7573,
    "lng": -73.9705,
    "borough": "Manhattan",
    "routes": [
      "6",
      "E",
      "F"
    ]
  },
  {
    "name": "52 St",
    "lat": 40.7441,
    "lng": -73.9125,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "53 St",
    "lat": 40.6451,
    "lng": -74.014,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "55 St",
    "lat": 40.6314,
    "lng": -73.9955,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "57 St",
    "lat": 40.764,
    "lng": -73.9774,
    "borough": "Manhattan",
    "routes": [
      "M"
    ]
  },
  {
    "name": "57 St-7 Av",
    "lat": 40.7647,
    "lng": -73.9807,
    "borough": "Manhattan",
    "routes": [
      "N",
      "Q",
      "R",
      "W"
    ]
  },
  {
    "name": "59 St (4·5·6·N·R·W)",
    "lat": 40.7626,
    "lng": -73.9676,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5",
      "6",
      "N",
      "R",
      "W"
    ]
  },
  {
    "name": "59 St (N·R)",
    "lat": 40.6414,
    "lng": -74.0179,
    "borough": "Brooklyn",
    "routes": [
      "N",
      "R"
    ]
  },
  {
    "name": "59 St-Columbus Circle",
    "lat": 40.7683,
    "lng": -73.9818,
    "borough": "Manhattan",
    "routes": [
      "1",
      "A",
      "B",
      "C",
      "D"
    ]
  },
  {
    "name": "61 St-Woodside",
    "lat": 40.7456,
    "lng": -73.903,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "62 St",
    "lat": 40.6257,
    "lng": -73.9966,
    "borough": "Brooklyn",
    "routes": [
      "D",
      "N"
    ]
  },
  {
    "name": "63 Dr-Rego Park",
    "lat": 40.7298,
    "lng": -73.8616,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "65 St",
    "lat": 40.7497,
    "lng": -73.8985,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "66 St-Lincoln Center",
    "lat": 40.7734,
    "lng": -73.9822,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "67 Av",
    "lat": 40.7265,
    "lng": -73.8527,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "68 St-Hunter College",
    "lat": 40.7681,
    "lng": -73.9639,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "69 St",
    "lat": 40.7463,
    "lng": -73.8964,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "7 Av (B·D·E)",
    "lat": 40.7629,
    "lng": -73.9816,
    "borough": "Manhattan",
    "routes": [
      "B",
      "D",
      "E"
    ]
  },
  {
    "name": "7 Av (B·Q)",
    "lat": 40.6771,
    "lng": -73.9724,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q"
    ]
  },
  {
    "name": "7 Av (F·G)",
    "lat": 40.6663,
    "lng": -73.9803,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G"
    ]
  },
  {
    "name": "71 St",
    "lat": 40.6196,
    "lng": -73.9989,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "72 St (1·2·3)",
    "lat": 40.7785,
    "lng": -73.982,
    "borough": "Manhattan",
    "routes": [
      "1",
      "2",
      "3"
    ]
  },
  {
    "name": "72 St (B·C)",
    "lat": 40.7756,
    "lng": -73.9764,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "72 St (Q)",
    "lat": 40.7688,
    "lng": -73.9584,
    "borough": "Manhattan",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "74 St-Broadway",
    "lat": 40.7467,
    "lng": -73.8914,
    "borough": "Queens",
    "routes": [
      "7",
      "E",
      "F",
      "M",
      "R"
    ]
  },
  {
    "name": "75 Av",
    "lat": 40.7183,
    "lng": -73.8373,
    "borough": "Queens",
    "routes": [
      "E",
      "F"
    ]
  },
  {
    "name": "75 St-Elderts Ln",
    "lat": 40.6913,
    "lng": -73.8671,
    "borough": "Queens",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "77 St (6)",
    "lat": 40.7736,
    "lng": -73.9599,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "77 St (R)",
    "lat": 40.6297,
    "lng": -74.0255,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "79 St (1)",
    "lat": 40.7839,
    "lng": -73.9799,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "79 St (D)",
    "lat": 40.6135,
    "lng": -74.0006,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "8 Av",
    "lat": 40.6351,
    "lng": -74.0117,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "8 St-NYU",
    "lat": 40.7303,
    "lng": -73.9926,
    "borough": "Manhattan",
    "routes": [
      "R",
      "W"
    ]
  },
  {
    "name": "80 St",
    "lat": 40.6794,
    "lng": -73.859,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "81 St-Museum of Natural History",
    "lat": 40.7814,
    "lng": -73.9721,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "82 St-Jackson Hts",
    "lat": 40.7477,
    "lng": -73.8837,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "85 St-Forest Pkwy",
    "lat": 40.6924,
    "lng": -73.86,
    "borough": "Queens",
    "routes": [
      "J"
    ]
  },
  {
    "name": "86 St (1)",
    "lat": 40.7886,
    "lng": -73.9762,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "86 St (4·5·6)",
    "lat": 40.7795,
    "lng": -73.9556,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5",
      "6"
    ]
  },
  {
    "name": "86 St (B·C)",
    "lat": 40.7859,
    "lng": -73.9689,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "86 St (N)",
    "lat": 40.5927,
    "lng": -73.9782,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "86 St (Q)",
    "lat": 40.7779,
    "lng": -73.9518,
    "borough": "Manhattan",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "86 St (R)",
    "lat": 40.6227,
    "lng": -74.0284,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "88 St",
    "lat": 40.6798,
    "lng": -73.8515,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "9 Av",
    "lat": 40.6463,
    "lng": -73.9943,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "90 St-Elmhurst Av",
    "lat": 40.7484,
    "lng": -73.8766,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "96 St (1·2·3)",
    "lat": 40.7939,
    "lng": -73.9723,
    "borough": "Manhattan",
    "routes": [
      "1",
      "2",
      "3"
    ]
  },
  {
    "name": "96 St (6)",
    "lat": 40.7857,
    "lng": -73.9511,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "96 St (B·C)",
    "lat": 40.7916,
    "lng": -73.9647,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "96 St (Q)",
    "lat": 40.7843,
    "lng": -73.9472,
    "borough": "Manhattan",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Alabama Av",
    "lat": 40.677,
    "lng": -73.8987,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Allerton Av",
    "lat": 40.8655,
    "lng": -73.8674,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Aqueduct Racetrack",
    "lat": 40.6721,
    "lng": -73.8359,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Aqueduct-N Conduit Av",
    "lat": 40.6682,
    "lng": -73.8341,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Astor Pl",
    "lat": 40.7301,
    "lng": -73.9911,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Astoria Blvd",
    "lat": 40.7703,
    "lng": -73.9178,
    "borough": "Queens",
    "routes": [
      "N",
      "W"
    ]
  },
  {
    "name": "Astoria-Ditmars Blvd",
    "lat": 40.775,
    "lng": -73.912,
    "borough": "Queens",
    "routes": [
      "N",
      "W"
    ]
  },
  {
    "name": "Atlantic Av",
    "lat": 40.6753,
    "lng": -73.9031,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Atlantic Av-Barclays Ctr",
    "lat": 40.6842,
    "lng": -73.9778,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3",
      "4",
      "5",
      "B",
      "D",
      "N",
      "Q",
      "R"
    ]
  },
  {
    "name": "Avenue H",
    "lat": 40.6293,
    "lng": -73.9616,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Avenue I",
    "lat": 40.6253,
    "lng": -73.9761,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Avenue J",
    "lat": 40.625,
    "lng": -73.9608,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Avenue M",
    "lat": 40.6176,
    "lng": -73.9594,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Avenue N",
    "lat": 40.6151,
    "lng": -73.9742,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Avenue P",
    "lat": 40.6089,
    "lng": -73.973,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Avenue U (F)",
    "lat": 40.5961,
    "lng": -73.9734,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Avenue U (N)",
    "lat": 40.5975,
    "lng": -73.9791,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "Avenue U (Q)",
    "lat": 40.5993,
    "lng": -73.9559,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Avenue X",
    "lat": 40.5896,
    "lng": -73.9742,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Bay 50 St",
    "lat": 40.5888,
    "lng": -73.9838,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "Bay Pkwy (D)",
    "lat": 40.6019,
    "lng": -73.9937,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "Bay Pkwy (F)",
    "lat": 40.6208,
    "lng": -73.9753,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Bay Pkwy (N)",
    "lat": 40.6118,
    "lng": -73.9818,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "Bay Ridge Av",
    "lat": 40.635,
    "lng": -74.0234,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "Bay Ridge-95 St",
    "lat": 40.6166,
    "lng": -74.0309,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "Baychester Av",
    "lat": 40.8787,
    "lng": -73.8386,
    "borough": "The Bronx",
    "routes": [
      "5"
    ]
  },
  {
    "name": "Beach 105 St",
    "lat": 40.5832,
    "lng": -73.8276,
    "borough": "Queens",
    "routes": [
      "A",
      "S"
    ]
  },
  {
    "name": "Beach 25 St",
    "lat": 40.6001,
    "lng": -73.7614,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Beach 36 St",
    "lat": 40.5954,
    "lng": -73.7682,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Beach 44 St",
    "lat": 40.5929,
    "lng": -73.776,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Beach 60 St",
    "lat": 40.5924,
    "lng": -73.7885,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Beach 67 St",
    "lat": 40.5909,
    "lng": -73.7969,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Beach 90 St",
    "lat": 40.588,
    "lng": -73.8136,
    "borough": "Queens",
    "routes": [
      "A",
      "S"
    ]
  },
  {
    "name": "Beach 98 St",
    "lat": 40.5853,
    "lng": -73.8206,
    "borough": "Queens",
    "routes": [
      "A",
      "S"
    ]
  },
  {
    "name": "Bedford Av",
    "lat": 40.7173,
    "lng": -73.9569,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Bedford Park Blvd",
    "lat": 40.8732,
    "lng": -73.8871,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "Bedford Park Blvd-Lehman College",
    "lat": 40.8734,
    "lng": -73.8901,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "Bedford-Nostrand Avs",
    "lat": 40.6896,
    "lng": -73.9535,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Bergen St (2·3)",
    "lat": 40.6808,
    "lng": -73.9751,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "Bergen St (F·G)",
    "lat": 40.6861,
    "lng": -73.9909,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G"
    ]
  },
  {
    "name": "Beverley Rd",
    "lat": 40.644,
    "lng": -73.9645,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Beverly Rd",
    "lat": 40.6451,
    "lng": -73.949,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Bleecker St",
    "lat": 40.7256,
    "lng": -73.9954,
    "borough": "Manhattan",
    "routes": [
      "6",
      "B",
      "D",
      "F",
      "M"
    ]
  },
  {
    "name": "Borough Hall",
    "lat": 40.6932,
    "lng": -73.9906,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3",
      "4",
      "5",
      "R"
    ]
  },
  {
    "name": "Botanic Garden",
    "lat": 40.6705,
    "lng": -73.9587,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3",
      "4",
      "5",
      "S"
    ]
  },
  {
    "name": "Bowery",
    "lat": 40.7203,
    "lng": -73.9939,
    "borough": "Manhattan",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Bowling Green",
    "lat": 40.7048,
    "lng": -74.0141,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5"
    ]
  },
  {
    "name": "Briarwood",
    "lat": 40.7092,
    "lng": -73.8206,
    "borough": "Queens",
    "routes": [
      "E",
      "F"
    ]
  },
  {
    "name": "Brighton Beach",
    "lat": 40.5776,
    "lng": -73.9614,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q"
    ]
  },
  {
    "name": "Broad Channel",
    "lat": 40.6084,
    "lng": -73.8159,
    "borough": "Queens",
    "routes": [
      "A",
      "S"
    ]
  },
  {
    "name": "Broad St",
    "lat": 40.7065,
    "lng": -74.0111,
    "borough": "Manhattan",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Broadway (G)",
    "lat": 40.7061,
    "lng": -73.9503,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Broadway (N·W)",
    "lat": 40.7618,
    "lng": -73.9255,
    "borough": "Queens",
    "routes": [
      "N",
      "W"
    ]
  },
  {
    "name": "Broadway Junction",
    "lat": 40.6789,
    "lng": -73.9044,
    "borough": "Brooklyn",
    "routes": [
      "A",
      "C",
      "J",
      "L",
      "Z"
    ]
  },
  {
    "name": "Bronx Park East",
    "lat": 40.8488,
    "lng": -73.8685,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Brook Av",
    "lat": 40.8076,
    "lng": -73.9192,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Brooklyn Bridge-City Hall",
    "lat": 40.7132,
    "lng": -74.0038,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5",
      "6",
      "J",
      "Z"
    ]
  },
  {
    "name": "Buhre Av",
    "lat": 40.8468,
    "lng": -73.8326,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Burke Av",
    "lat": 40.8714,
    "lng": -73.8672,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Burnside Av",
    "lat": 40.8535,
    "lng": -73.9077,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "Bushwick Av-Aberdeen St",
    "lat": 40.6828,
    "lng": -73.9052,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Canal St (1)",
    "lat": 40.7229,
    "lng": -74.0063,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Canal St (6·J·N·Q·R·W·Z)",
    "lat": 40.7187,
    "lng": -74.0006,
    "borough": "Manhattan",
    "routes": [
      "6",
      "J",
      "N",
      "Q",
      "R",
      "W",
      "Z"
    ]
  },
  {
    "name": "Canal St (A·C·E)",
    "lat": 40.7208,
    "lng": -74.0052,
    "borough": "Manhattan",
    "routes": [
      "A",
      "C",
      "E"
    ]
  },
  {
    "name": "Canarsie-Rockaway Pkwy",
    "lat": 40.6467,
    "lng": -73.9018,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Carroll St",
    "lat": 40.6803,
    "lng": -73.995,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G"
    ]
  },
  {
    "name": "Castle Hill Av",
    "lat": 40.8343,
    "lng": -73.8512,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Cathedral Pkwy (110 St) (1)",
    "lat": 40.804,
    "lng": -73.9668,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Cathedral Pkwy (110 St) (B·C)",
    "lat": 40.8006,
    "lng": -73.9582,
    "borough": "Manhattan",
    "routes": [
      "B",
      "C"
    ]
  },
  {
    "name": "Central Av",
    "lat": 40.6979,
    "lng": -73.9274,
    "borough": "Brooklyn",
    "routes": [
      "M"
    ]
  },
  {
    "name": "Chambers St (1·2·3)",
    "lat": 40.7155,
    "lng": -74.0093,
    "borough": "Manhattan",
    "routes": [
      "1",
      "2",
      "3"
    ]
  },
  {
    "name": "Chambers St (2·3·A·C·E·R·W)",
    "lat": 40.7126,
    "lng": -74.0096,
    "borough": "Manhattan",
    "routes": [
      "2",
      "3",
      "A",
      "C",
      "E",
      "R",
      "W"
    ]
  },
  {
    "name": "Chauncey St",
    "lat": 40.6829,
    "lng": -73.9105,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Christopher St-Stonewall",
    "lat": 40.7334,
    "lng": -74.0029,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Church Av (2·5)",
    "lat": 40.6508,
    "lng": -73.9496,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Church Av (B·Q)",
    "lat": 40.6505,
    "lng": -73.963,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q"
    ]
  },
  {
    "name": "Church Av (F·G)",
    "lat": 40.644,
    "lng": -73.9797,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G"
    ]
  },
  {
    "name": "City Hall",
    "lat": 40.7133,
    "lng": -74.007,
    "borough": "Manhattan",
    "routes": [
      "R",
      "W"
    ]
  },
  {
    "name": "Clark St",
    "lat": 40.6975,
    "lng": -73.9931,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "Classon Av",
    "lat": 40.6889,
    "lng": -73.9601,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Cleveland St",
    "lat": 40.6799,
    "lng": -73.8846,
    "borough": "Brooklyn",
    "routes": [
      "J"
    ]
  },
  {
    "name": "Clinton-Washington Avs (C)",
    "lat": 40.6833,
    "lng": -73.9658,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Clinton-Washington Avs (G)",
    "lat": 40.6881,
    "lng": -73.9668,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Coney Island-Stillwell Av",
    "lat": 40.5774,
    "lng": -73.9812,
    "borough": "Brooklyn",
    "routes": [
      "D",
      "F",
      "N",
      "Q"
    ]
  },
  {
    "name": "Cortelyou Rd",
    "lat": 40.6409,
    "lng": -73.9639,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Court Sq",
    "lat": 40.7471,
    "lng": -73.945,
    "borough": "Queens",
    "routes": [
      "7",
      "E",
      "F",
      "G"
    ]
  },
  {
    "name": "Crescent St",
    "lat": 40.6832,
    "lng": -73.8738,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Crown Hts-Utica Av",
    "lat": 40.6689,
    "lng": -73.9329,
    "borough": "Brooklyn",
    "routes": [
      "3",
      "4"
    ]
  },
  {
    "name": "Cypress Av",
    "lat": 40.8054,
    "lng": -73.914,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Cypress Hills",
    "lat": 40.6899,
    "lng": -73.8725,
    "borough": "Brooklyn",
    "routes": [
      "J"
    ]
  },
  {
    "name": "DeKalb Av (B·Q·R)",
    "lat": 40.6906,
    "lng": -73.9818,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q",
      "R"
    ]
  },
  {
    "name": "DeKalb Av (L)",
    "lat": 40.7038,
    "lng": -73.9184,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Delancey St-Essex St",
    "lat": 40.7185,
    "lng": -73.9878,
    "borough": "Manhattan",
    "routes": [
      "F",
      "J",
      "M",
      "Z"
    ]
  },
  {
    "name": "Ditmas Av",
    "lat": 40.6361,
    "lng": -73.9782,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Dyckman St (1)",
    "lat": 40.8605,
    "lng": -73.9255,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Dyckman St (A)",
    "lat": 40.8655,
    "lng": -73.9273,
    "borough": "Manhattan",
    "routes": [
      "A"
    ]
  },
  {
    "name": "E 143 St-St Mary's St",
    "lat": 40.8087,
    "lng": -73.9077,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "E 149 St",
    "lat": 40.8121,
    "lng": -73.9041,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "E 180 St",
    "lat": 40.8419,
    "lng": -73.8735,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "East 105 St",
    "lat": 40.6506,
    "lng": -73.8995,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "East Broadway",
    "lat": 40.7137,
    "lng": -73.9902,
    "borough": "Manhattan",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Eastchester-Dyre Av",
    "lat": 40.8883,
    "lng": -73.8308,
    "borough": "The Bronx",
    "routes": [
      "5"
    ]
  },
  {
    "name": "Eastern Pkwy-Brooklyn Museum",
    "lat": 40.672,
    "lng": -73.9644,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "Elder Av",
    "lat": 40.8286,
    "lng": -73.8792,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Elmhurst Av",
    "lat": 40.7425,
    "lng": -73.882,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "Euclid Av",
    "lat": 40.6754,
    "lng": -73.8721,
    "borough": "Brooklyn",
    "routes": [
      "A",
      "C"
    ]
  },
  {
    "name": "Far Rockaway-Mott Av",
    "lat": 40.604,
    "lng": -73.7554,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Flatbush Av-Brooklyn College",
    "lat": 40.6328,
    "lng": -73.9476,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Flushing Av (G)",
    "lat": 40.7004,
    "lng": -73.9502,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Flushing Av (J·M)",
    "lat": 40.7003,
    "lng": -73.9411,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "M"
    ]
  },
  {
    "name": "Flushing-Main St",
    "lat": 40.7596,
    "lng": -73.83,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "Fordham Rd (4)",
    "lat": 40.8628,
    "lng": -73.901,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "Fordham Rd (B·D)",
    "lat": 40.8613,
    "lng": -73.8977,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "Forest Av",
    "lat": 40.7044,
    "lng": -73.9031,
    "borough": "Queens",
    "routes": [
      "M"
    ]
  },
  {
    "name": "Forest Hills-71 Av",
    "lat": 40.7217,
    "lng": -73.8445,
    "borough": "Queens",
    "routes": [
      "E",
      "F",
      "M",
      "R"
    ]
  },
  {
    "name": "Fort Hamilton Pkwy (D)",
    "lat": 40.6409,
    "lng": -73.9943,
    "borough": "Brooklyn",
    "routes": [
      "D"
    ]
  },
  {
    "name": "Fort Hamilton Pkwy (F·G)",
    "lat": 40.6508,
    "lng": -73.9758,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G"
    ]
  },
  {
    "name": "Fort Hamilton Pkwy (N)",
    "lat": 40.6314,
    "lng": -74.0054,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "Franklin Av",
    "lat": 40.681,
    "lng": -73.9563,
    "borough": "Brooklyn",
    "routes": [
      "C",
      "S"
    ]
  },
  {
    "name": "Franklin St",
    "lat": 40.7193,
    "lng": -74.0069,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Freeman St",
    "lat": 40.83,
    "lng": -73.8919,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Fresh Pond Rd",
    "lat": 40.7062,
    "lng": -73.8959,
    "borough": "Queens",
    "routes": [
      "M"
    ]
  },
  {
    "name": "Fulton St (2·3·4·5·A·C·J·Z)",
    "lat": 40.7101,
    "lng": -74.0078,
    "borough": "Manhattan",
    "routes": [
      "2",
      "3",
      "4",
      "5",
      "A",
      "C",
      "J",
      "Z"
    ]
  },
  {
    "name": "Fulton St (G)",
    "lat": 40.6871,
    "lng": -73.9754,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Gates Av",
    "lat": 40.6896,
    "lng": -73.9223,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Graham Av",
    "lat": 40.7146,
    "lng": -73.9441,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Grand Army Plaza",
    "lat": 40.6752,
    "lng": -73.971,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "Grand Av-Newtown",
    "lat": 40.737,
    "lng": -73.8772,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "Grand Central-42 St",
    "lat": 40.752,
    "lng": -73.9774,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5",
      "6",
      "7",
      "S"
    ]
  },
  {
    "name": "Grand St (B·D)",
    "lat": 40.7183,
    "lng": -73.9938,
    "borough": "Manhattan",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "Grand St (L)",
    "lat": 40.7119,
    "lng": -73.9407,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Grant Av",
    "lat": 40.677,
    "lng": -73.865,
    "borough": "Brooklyn",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Greenpoint Av",
    "lat": 40.7314,
    "lng": -73.9544,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Gun Hill Rd (2·5)",
    "lat": 40.8779,
    "lng": -73.8663,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Gun Hill Rd (5)",
    "lat": 40.8695,
    "lng": -73.8464,
    "borough": "The Bronx",
    "routes": [
      "5"
    ]
  },
  {
    "name": "Halsey St (J)",
    "lat": 40.6864,
    "lng": -73.9166,
    "borough": "Brooklyn",
    "routes": [
      "J"
    ]
  },
  {
    "name": "Halsey St (L)",
    "lat": 40.6956,
    "lng": -73.9041,
    "borough": "Queens",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Harlem-148 St",
    "lat": 40.8239,
    "lng": -73.9365,
    "borough": "Manhattan",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Hewes St",
    "lat": 40.7069,
    "lng": -73.9534,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "M"
    ]
  },
  {
    "name": "High St",
    "lat": 40.6993,
    "lng": -73.9905,
    "borough": "Brooklyn",
    "routes": [
      "A",
      "C"
    ]
  },
  {
    "name": "Houston St",
    "lat": 40.7283,
    "lng": -74.0054,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Howard Beach-JFK Airport",
    "lat": 40.6605,
    "lng": -73.8303,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Hoyt St",
    "lat": 40.6905,
    "lng": -73.9851,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "Hoyt-Schermerhorn Sts",
    "lat": 40.6885,
    "lng": -73.985,
    "borough": "Brooklyn",
    "routes": [
      "A",
      "C",
      "G"
    ]
  },
  {
    "name": "Hunters Point Av",
    "lat": 40.7422,
    "lng": -73.9489,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "Hunts Point Av",
    "lat": 40.8209,
    "lng": -73.8905,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Intervale Av",
    "lat": 40.8222,
    "lng": -73.8967,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Inwood-207 St",
    "lat": 40.8681,
    "lng": -73.9199,
    "borough": "Manhattan",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Jackson Av",
    "lat": 40.8165,
    "lng": -73.9078,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Jamaica Center-Parsons/Archer",
    "lat": 40.7021,
    "lng": -73.8011,
    "borough": "Queens",
    "routes": [
      "E",
      "J",
      "Z"
    ]
  },
  {
    "name": "Jamaica-179 St",
    "lat": 40.7126,
    "lng": -73.7838,
    "borough": "Queens",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Jamaica-Van Wyck",
    "lat": 40.7026,
    "lng": -73.8169,
    "borough": "Queens",
    "routes": [
      "E"
    ]
  },
  {
    "name": "Jay St-MetroTech",
    "lat": 40.6923,
    "lng": -73.9866,
    "borough": "Brooklyn",
    "routes": [
      "A",
      "C",
      "F",
      "R"
    ]
  },
  {
    "name": "Jefferson St",
    "lat": 40.7066,
    "lng": -73.9229,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Junction Blvd",
    "lat": 40.7491,
    "lng": -73.8695,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "Junius St",
    "lat": 40.6635,
    "lng": -73.9024,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Kew Gardens-Union Tpke",
    "lat": 40.7144,
    "lng": -73.831,
    "borough": "Queens",
    "routes": [
      "E",
      "F"
    ]
  },
  {
    "name": "Kings Hwy (B·Q)",
    "lat": 40.6087,
    "lng": -73.9577,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q"
    ]
  },
  {
    "name": "Kings Hwy (F)",
    "lat": 40.6032,
    "lng": -73.9724,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Kings Hwy (N)",
    "lat": 40.6039,
    "lng": -73.9804,
    "borough": "Brooklyn",
    "routes": [
      "N"
    ]
  },
  {
    "name": "Kingsbridge Rd (4)",
    "lat": 40.8678,
    "lng": -73.8972,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "Kingsbridge Rd (B·D)",
    "lat": 40.867,
    "lng": -73.8935,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "Kingston Av",
    "lat": 40.6694,
    "lng": -73.9422,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Kingston-Throop Avs",
    "lat": 40.6799,
    "lng": -73.9409,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Knickerbocker Av",
    "lat": 40.6987,
    "lng": -73.9197,
    "borough": "Brooklyn",
    "routes": [
      "M"
    ]
  },
  {
    "name": "Kosciuszko St",
    "lat": 40.6933,
    "lng": -73.9288,
    "borough": "Brooklyn",
    "routes": [
      "J"
    ]
  },
  {
    "name": "Lafayette Av",
    "lat": 40.6861,
    "lng": -73.9739,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Lexington Av/63 St",
    "lat": 40.7646,
    "lng": -73.9661,
    "borough": "Manhattan",
    "routes": [
      "M",
      "Q"
    ]
  },
  {
    "name": "Liberty Av",
    "lat": 40.6745,
    "lng": -73.8965,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Livonia Av",
    "lat": 40.664,
    "lng": -73.9006,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Longwood Av",
    "lat": 40.8161,
    "lng": -73.8964,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Lorimer St (G·L)",
    "lat": 40.7134,
    "lng": -73.9508,
    "borough": "Brooklyn",
    "routes": [
      "G",
      "L"
    ]
  },
  {
    "name": "Lorimer St (J·M)",
    "lat": 40.7039,
    "lng": -73.9474,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "M"
    ]
  },
  {
    "name": "Marble Hill-225 St",
    "lat": 40.8746,
    "lng": -73.9098,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Marcy Av",
    "lat": 40.7084,
    "lng": -73.9578,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "M",
      "Z"
    ]
  },
  {
    "name": "Mets-Willets Point",
    "lat": 40.7546,
    "lng": -73.8456,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "Middle Village-Metropolitan Av",
    "lat": 40.7114,
    "lng": -73.8896,
    "borough": "Queens",
    "routes": [
      "M"
    ]
  },
  {
    "name": "Middletown Rd",
    "lat": 40.8439,
    "lng": -73.8363,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Montrose Av",
    "lat": 40.7077,
    "lng": -73.9399,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Morgan Av",
    "lat": 40.7062,
    "lng": -73.9331,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Morris Park",
    "lat": 40.8544,
    "lng": -73.8605,
    "borough": "The Bronx",
    "routes": [
      "5"
    ]
  },
  {
    "name": "Morrison Av-Soundview",
    "lat": 40.8295,
    "lng": -73.8745,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Mosholu Pkwy",
    "lat": 40.8798,
    "lng": -73.8847,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "Mt Eden Av",
    "lat": 40.8444,
    "lng": -73.9147,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "Myrtle Av",
    "lat": 40.6972,
    "lng": -73.9357,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "M",
      "Z"
    ]
  },
  {
    "name": "Myrtle-Willoughby Avs",
    "lat": 40.6946,
    "lng": -73.949,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Myrtle-Wyckoff Avs",
    "lat": 40.6996,
    "lng": -73.912,
    "borough": "Brooklyn",
    "routes": [
      "L",
      "M"
    ]
  },
  {
    "name": "Nassau Av",
    "lat": 40.7246,
    "lng": -73.9513,
    "borough": "Brooklyn",
    "routes": [
      "G"
    ]
  },
  {
    "name": "Neck Rd",
    "lat": 40.5952,
    "lng": -73.9552,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Neptune Av",
    "lat": 40.581,
    "lng": -73.9746,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Nereid Av",
    "lat": 40.8984,
    "lng": -73.8544,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Nevins St",
    "lat": 40.6882,
    "lng": -73.9805,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "3",
      "4",
      "5"
    ]
  },
  {
    "name": "New Lots Av (3)",
    "lat": 40.6662,
    "lng": -73.8841,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "New Lots Av (L)",
    "lat": 40.6587,
    "lng": -73.8992,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Newkirk Av-Little Haiti",
    "lat": 40.64,
    "lng": -73.9484,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Newkirk Plaza",
    "lat": 40.6351,
    "lng": -73.9628,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q"
    ]
  },
  {
    "name": "Northern Blvd",
    "lat": 40.7529,
    "lng": -73.906,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "Norwood Av",
    "lat": 40.6814,
    "lng": -73.88,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Norwood-205 St",
    "lat": 40.8748,
    "lng": -73.8789,
    "borough": "The Bronx",
    "routes": [
      "D"
    ]
  },
  {
    "name": "Nostrand Av (3)",
    "lat": 40.6698,
    "lng": -73.9505,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Nostrand Av (A·C)",
    "lat": 40.6804,
    "lng": -73.9504,
    "borough": "Brooklyn",
    "routes": [
      "A",
      "C"
    ]
  },
  {
    "name": "Ocean Pkwy",
    "lat": 40.5763,
    "lng": -73.9685,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Ozone Park-Lefferts Blvd",
    "lat": 40.686,
    "lng": -73.8258,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Park Pl",
    "lat": 40.6748,
    "lng": -73.9576,
    "borough": "Brooklyn",
    "routes": [
      "S"
    ]
  },
  {
    "name": "Parkchester",
    "lat": 40.8332,
    "lng": -73.8608,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Parkside Av",
    "lat": 40.6553,
    "lng": -73.9615,
    "borough": "Brooklyn",
    "routes": [
      "Q"
    ]
  },
  {
    "name": "Parsons Blvd",
    "lat": 40.7076,
    "lng": -73.8033,
    "borough": "Queens",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Pelham Bay Park",
    "lat": 40.8525,
    "lng": -73.8281,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Pelham Pkwy (2·5)",
    "lat": 40.8572,
    "lng": -73.8676,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Pelham Pkwy (5)",
    "lat": 40.859,
    "lng": -73.8554,
    "borough": "The Bronx",
    "routes": [
      "5"
    ]
  },
  {
    "name": "Pennsylvania Av",
    "lat": 40.6646,
    "lng": -73.8949,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "President St-Medgar Evers College",
    "lat": 40.6679,
    "lng": -73.9507,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Prince St",
    "lat": 40.7243,
    "lng": -73.9977,
    "borough": "Manhattan",
    "routes": [
      "R",
      "W"
    ]
  },
  {
    "name": "Prospect Av (2·5)",
    "lat": 40.8196,
    "lng": -73.9018,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Prospect Av (R)",
    "lat": 40.6654,
    "lng": -73.9929,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "Prospect Park",
    "lat": 40.6616,
    "lng": -73.9622,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q",
      "S"
    ]
  },
  {
    "name": "Queens Plaza",
    "lat": 40.749,
    "lng": -73.9372,
    "borough": "Queens",
    "routes": [
      "E",
      "F",
      "R"
    ]
  },
  {
    "name": "Queensboro Plaza",
    "lat": 40.7506,
    "lng": -73.9402,
    "borough": "Queens",
    "routes": [
      "7",
      "N",
      "W"
    ]
  },
  {
    "name": "Ralph Av",
    "lat": 40.6788,
    "lng": -73.9208,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Rector St (1)",
    "lat": 40.7075,
    "lng": -74.0138,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Rector St (R·W)",
    "lat": 40.7072,
    "lng": -74.0133,
    "borough": "Manhattan",
    "routes": [
      "R",
      "W"
    ]
  },
  {
    "name": "Rockaway Av (3)",
    "lat": 40.6625,
    "lng": -73.9089,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Rockaway Av (C)",
    "lat": 40.6783,
    "lng": -73.9119,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Rockaway Blvd",
    "lat": 40.6804,
    "lng": -73.8439,
    "borough": "Queens",
    "routes": [
      "A"
    ]
  },
  {
    "name": "Rockaway Park-Beach 116 St",
    "lat": 40.5809,
    "lng": -73.8356,
    "borough": "Queens",
    "routes": [
      "A",
      "S"
    ]
  },
  {
    "name": "Roosevelt Island",
    "lat": 40.7591,
    "lng": -73.9533,
    "borough": "Manhattan",
    "routes": [
      "M"
    ]
  },
  {
    "name": "Saratoga Av",
    "lat": 40.6615,
    "lng": -73.9163,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Seneca Av",
    "lat": 40.7028,
    "lng": -73.9077,
    "borough": "Queens",
    "routes": [
      "M"
    ]
  },
  {
    "name": "Sheepshead Bay",
    "lat": 40.5869,
    "lng": -73.9542,
    "borough": "Brooklyn",
    "routes": [
      "B",
      "Q"
    ]
  },
  {
    "name": "Shepherd Av",
    "lat": 40.6741,
    "lng": -73.8808,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Simpson St",
    "lat": 40.8241,
    "lng": -73.8931,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Smith-9 Sts",
    "lat": 40.6736,
    "lng": -73.996,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "G"
    ]
  },
  {
    "name": "South Ferry",
    "lat": 40.7026,
    "lng": -74.0133,
    "borough": "Manhattan",
    "routes": [
      "1",
      "R",
      "W"
    ]
  },
  {
    "name": "Spring St (6)",
    "lat": 40.7223,
    "lng": -73.9971,
    "borough": "Manhattan",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Spring St (C·E)",
    "lat": 40.7262,
    "lng": -74.0037,
    "borough": "Manhattan",
    "routes": [
      "C",
      "E"
    ]
  },
  {
    "name": "St Lawrence Av",
    "lat": 40.8315,
    "lng": -73.8676,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Steinway St",
    "lat": 40.7569,
    "lng": -73.9207,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "Sterling St",
    "lat": 40.6627,
    "lng": -73.9508,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Sutphin Blvd",
    "lat": 40.7055,
    "lng": -73.8107,
    "borough": "Queens",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Sutphin Blvd-Archer Av-JFK Airport",
    "lat": 40.7005,
    "lng": -73.808,
    "borough": "Queens",
    "routes": [
      "E",
      "J",
      "Z"
    ]
  },
  {
    "name": "Sutter Av",
    "lat": 40.6694,
    "lng": -73.902,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Sutter Av-Rutland Rd",
    "lat": 40.6647,
    "lng": -73.9226,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Times Sq-42 St",
    "lat": 40.7557,
    "lng": -73.9876,
    "borough": "Manhattan",
    "routes": [
      "1",
      "2",
      "3",
      "7",
      "A",
      "C",
      "E",
      "N",
      "Q",
      "R",
      "S",
      "W"
    ]
  },
  {
    "name": "Tremont Av",
    "lat": 40.8504,
    "lng": -73.9052,
    "borough": "The Bronx",
    "routes": [
      "B",
      "D"
    ]
  },
  {
    "name": "Union St",
    "lat": 40.6773,
    "lng": -73.9831,
    "borough": "Brooklyn",
    "routes": [
      "R"
    ]
  },
  {
    "name": "Utica Av",
    "lat": 40.6794,
    "lng": -73.9307,
    "borough": "Brooklyn",
    "routes": [
      "A",
      "C"
    ]
  },
  {
    "name": "Van Cortlandt Park-242 St",
    "lat": 40.8892,
    "lng": -73.8986,
    "borough": "The Bronx",
    "routes": [
      "1"
    ]
  },
  {
    "name": "Van Siclen Av (3)",
    "lat": 40.6654,
    "lng": -73.8894,
    "borough": "Brooklyn",
    "routes": [
      "3"
    ]
  },
  {
    "name": "Van Siclen Av (C)",
    "lat": 40.6727,
    "lng": -73.8904,
    "borough": "Brooklyn",
    "routes": [
      "C"
    ]
  },
  {
    "name": "Van Siclen Av (J·Z)",
    "lat": 40.678,
    "lng": -73.8917,
    "borough": "Brooklyn",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Vernon Blvd-Jackson Av",
    "lat": 40.7426,
    "lng": -73.9536,
    "borough": "Queens",
    "routes": [
      "7"
    ]
  },
  {
    "name": "W 4 St-Wash Sq",
    "lat": 40.7323,
    "lng": -74.0005,
    "borough": "Manhattan",
    "routes": [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "M"
    ]
  },
  {
    "name": "W 8 St-NY Aquarium",
    "lat": 40.5761,
    "lng": -73.9759,
    "borough": "Brooklyn",
    "routes": [
      "F",
      "Q"
    ]
  },
  {
    "name": "Wakefield-241 St",
    "lat": 40.9031,
    "lng": -73.8506,
    "borough": "The Bronx",
    "routes": [
      "2"
    ]
  },
  {
    "name": "Wall St (2·3)",
    "lat": 40.7068,
    "lng": -74.0091,
    "borough": "Manhattan",
    "routes": [
      "2",
      "3"
    ]
  },
  {
    "name": "Wall St (4·5)",
    "lat": 40.7076,
    "lng": -74.0119,
    "borough": "Manhattan",
    "routes": [
      "4",
      "5"
    ]
  },
  {
    "name": "West Farms Sq-E Tremont Av",
    "lat": 40.8403,
    "lng": -73.88,
    "borough": "The Bronx",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Westchester Sq-E Tremont Av",
    "lat": 40.8399,
    "lng": -73.843,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Whitlock Av",
    "lat": 40.8265,
    "lng": -73.8863,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  },
  {
    "name": "Wilson Av",
    "lat": 40.6888,
    "lng": -73.904,
    "borough": "Brooklyn",
    "routes": [
      "L"
    ]
  },
  {
    "name": "Winthrop St",
    "lat": 40.6567,
    "lng": -73.9502,
    "borough": "Brooklyn",
    "routes": [
      "2",
      "5"
    ]
  },
  {
    "name": "Woodhaven Blvd (J·Z)",
    "lat": 40.6939,
    "lng": -73.8516,
    "borough": "Queens",
    "routes": [
      "J",
      "Z"
    ]
  },
  {
    "name": "Woodhaven Blvd (M·R)",
    "lat": 40.7331,
    "lng": -73.8692,
    "borough": "Queens",
    "routes": [
      "M",
      "R"
    ]
  },
  {
    "name": "Woodlawn",
    "lat": 40.886,
    "lng": -73.8788,
    "borough": "The Bronx",
    "routes": [
      "4"
    ]
  },
  {
    "name": "WTC Cortlandt",
    "lat": 40.7118,
    "lng": -74.0122,
    "borough": "Manhattan",
    "routes": [
      "1"
    ]
  },
  {
    "name": "York St",
    "lat": 40.7014,
    "lng": -73.9868,
    "borough": "Brooklyn",
    "routes": [
      "F"
    ]
  },
  {
    "name": "Zerega Av",
    "lat": 40.8365,
    "lng": -73.847,
    "borough": "The Bronx",
    "routes": [
      "6"
    ]
  }
];

export const subwayConnections: SubwayConnectionRaw[] = [
  {
    "a": "1 Av",
    "b": "3 Av",
    "color": "#7C858C"
  },
  {
    "a": "103 St (1)",
    "b": "96 St (1·2·3)",
    "color": "#D82233"
  },
  {
    "a": "103 St (6)",
    "b": "96 St (6)",
    "color": "#009952"
  },
  {
    "a": "103 St (B·C)",
    "b": "96 St (B·C)",
    "color": "#0062CF"
  },
  {
    "a": "103 St (B·C)",
    "b": "96 St (B·C)",
    "color": "#EB6800"
  },
  {
    "a": "103 St-Corona Plaza",
    "b": "Junction Blvd",
    "color": "#9A38A1"
  },
  {
    "a": "104 St (A)",
    "b": "Rockaway Blvd",
    "color": "#0062CF"
  },
  {
    "a": "104 St (J·Z)",
    "b": "Woodhaven Blvd (J·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "110 St-Malcolm X Plaza",
    "b": "96 St (1·2·3)",
    "color": "#D82233"
  },
  {
    "a": "110 St",
    "b": "103 St (6)",
    "color": "#009952"
  },
  {
    "a": "111 St (7)",
    "b": "103 St-Corona Plaza",
    "color": "#9A38A1"
  },
  {
    "a": "111 St (A)",
    "b": "104 St (A)",
    "color": "#0062CF"
  },
  {
    "a": "111 St (J)",
    "b": "104 St (J·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "111 St (J)",
    "b": "Woodhaven Blvd (J·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "116 St (2·3)",
    "b": "110 St-Malcolm X Plaza",
    "color": "#D82233"
  },
  {
    "a": "116 St (6)",
    "b": "110 St",
    "color": "#009952"
  },
  {
    "a": "116 St (B·C)",
    "b": "Cathedral Pkwy (110 St) (B·C)",
    "color": "#0062CF"
  },
  {
    "a": "116 St (B·C)",
    "b": "Cathedral Pkwy (110 St) (B·C)",
    "color": "#EB6800"
  },
  {
    "a": "116 St-Columbia University",
    "b": "Cathedral Pkwy (110 St) (1)",
    "color": "#D82233"
  },
  {
    "a": "121 St",
    "b": "104 St (J·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "121 St",
    "b": "111 St (J)",
    "color": "#8E5C33"
  },
  {
    "a": "125 St (1)",
    "b": "116 St-Columbia University",
    "color": "#D82233"
  },
  {
    "a": "125 St (2·3)",
    "b": "116 St (2·3)",
    "color": "#D82233"
  },
  {
    "a": "125 St (4·5·6)",
    "b": "116 St (6)",
    "color": "#009952"
  },
  {
    "a": "125 St (4·5·6)",
    "b": "86 St (4·5·6)",
    "color": "#009952"
  },
  {
    "a": "125 St (A·B·C·D)",
    "b": "116 St (B·C)",
    "color": "#0062CF"
  },
  {
    "a": "125 St (A·B·C·D)",
    "b": "116 St (B·C)",
    "color": "#EB6800"
  },
  {
    "a": "125 St (A·B·C·D)",
    "b": "145 St (A·B·C·D)",
    "color": "#0062CF"
  },
  {
    "a": "125 St (A·B·C·D)",
    "b": "59 St-Columbus Circle",
    "color": "#EB6800"
  },
  {
    "a": "135 St (2·3)",
    "b": "125 St (2·3)",
    "color": "#D82233"
  },
  {
    "a": "135 St (B·C)",
    "b": "125 St (A·B·C·D)",
    "color": "#0062CF"
  },
  {
    "a": "135 St (B·C)",
    "b": "125 St (A·B·C·D)",
    "color": "#EB6800"
  },
  {
    "a": "137 St-City College",
    "b": "125 St (1)",
    "color": "#D82233"
  },
  {
    "a": "138 St-Grand Concourse",
    "b": "125 St (4·5·6)",
    "color": "#009952"
  },
  {
    "a": "14 St (1·2·3·F·L·M)",
    "b": "14 St (A·C·E·L)",
    "color": "#7C858C"
  },
  {
    "a": "14 St (1·2·3·F·L·M)",
    "b": "Chambers St (1·2·3)",
    "color": "#D82233"
  },
  {
    "a": "14 St (1·2·3·F·L·M)",
    "b": "Christopher St-Stonewall",
    "color": "#D82233"
  },
  {
    "a": "14 St (1·2·3·F·L·M)",
    "b": "W 4 St-Wash Sq",
    "color": "#EB6800"
  },
  {
    "a": "14 St (A·C·E·L)",
    "b": "34 St-Penn Station (A·C·E)",
    "color": "#0062CF"
  },
  {
    "a": "14 St (A·C·E·L)",
    "b": "W 4 St-Wash Sq",
    "color": "#0062CF"
  },
  {
    "a": "14 St-Union Sq",
    "b": "14 St (1·2·3·F·L·M)",
    "color": "#7C858C"
  },
  {
    "a": "14 St-Union Sq",
    "b": "34 St-Herald Sq",
    "color": "#F6BC26"
  },
  {
    "a": "14 St-Union Sq",
    "b": "8 St-NYU",
    "color": "#F6BC26"
  },
  {
    "a": "14 St-Union Sq",
    "b": "Astor Pl",
    "color": "#009952"
  },
  {
    "a": "14 St-Union Sq",
    "b": "Brooklyn Bridge-City Hall",
    "color": "#009952"
  },
  {
    "a": "145 St (1)",
    "b": "137 St-City College",
    "color": "#D82233"
  },
  {
    "a": "145 St (3)",
    "b": "135 St (2·3)",
    "color": "#D82233"
  },
  {
    "a": "145 St (A·B·C·D)",
    "b": "125 St (A·B·C·D)",
    "color": "#EB6800"
  },
  {
    "a": "145 St (A·B·C·D)",
    "b": "135 St (B·C)",
    "color": "#0062CF"
  },
  {
    "a": "145 St (A·B·C·D)",
    "b": "135 St (B·C)",
    "color": "#EB6800"
  },
  {
    "a": "145 St (A·B·C·D)",
    "b": "168 St",
    "color": "#0062CF"
  },
  {
    "a": "149 St-Hostos",
    "b": "125 St (4·5·6)",
    "color": "#009952"
  },
  {
    "a": "149 St-Hostos",
    "b": "135 St (2·3)",
    "color": "#D82233"
  },
  {
    "a": "149 St-Hostos",
    "b": "138 St-Grand Concourse",
    "color": "#009952"
  },
  {
    "a": "15 St-Prospect Park",
    "b": "Fort Hamilton Pkwy (F·G)",
    "color": "#799534"
  },
  {
    "a": "15 St-Prospect Park",
    "b": "Fort Hamilton Pkwy (F·G)",
    "color": "#EB6800"
  },
  {
    "a": "155 St (B·D)",
    "b": "145 St (A·B·C·D)",
    "color": "#EB6800"
  },
  {
    "a": "155 St (C)",
    "b": "145 St (A·B·C·D)",
    "color": "#0062CF"
  },
  {
    "a": "157 St",
    "b": "145 St (1)",
    "color": "#D82233"
  },
  {
    "a": "161 St-Yankee Stadium",
    "b": "149 St-Hostos",
    "color": "#009952"
  },
  {
    "a": "161 St-Yankee Stadium",
    "b": "155 St (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "163 St-Amsterdam Av",
    "b": "155 St (C)",
    "color": "#0062CF"
  },
  {
    "a": "167 St (4)",
    "b": "161 St-Yankee Stadium",
    "color": "#009952"
  },
  {
    "a": "167 St (B·D)",
    "b": "161 St-Yankee Stadium",
    "color": "#EB6800"
  },
  {
    "a": "168 St",
    "b": "157 St",
    "color": "#D82233"
  },
  {
    "a": "168 St",
    "b": "163 St-Amsterdam Av",
    "color": "#0062CF"
  },
  {
    "a": "169 St",
    "b": "Jamaica-179 St",
    "color": "#0062CF"
  },
  {
    "a": "169 St",
    "b": "Parsons Blvd",
    "color": "#EB6800"
  },
  {
    "a": "170 St (4)",
    "b": "167 St (4)",
    "color": "#009952"
  },
  {
    "a": "170 St (B·D)",
    "b": "167 St (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "174 St",
    "b": "Freeman St",
    "color": "#009952"
  },
  {
    "a": "174 St",
    "b": "Freeman St",
    "color": "#D82233"
  },
  {
    "a": "174-175 Sts",
    "b": "170 St (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "175 St",
    "b": "168 St",
    "color": "#0062CF"
  },
  {
    "a": "176 St",
    "b": "Mt Eden Av",
    "color": "#009952"
  },
  {
    "a": "18 Av (D)",
    "b": "20 Av (D)",
    "color": "#EB6800"
  },
  {
    "a": "18 Av (F)",
    "b": "Avenue I",
    "color": "#EB6800"
  },
  {
    "a": "18 Av (N)",
    "b": "20 Av (N)",
    "color": "#F6BC26"
  },
  {
    "a": "18 St",
    "b": "14 St (1·2·3·F·L·M)",
    "color": "#D82233"
  },
  {
    "a": "181 St (1)",
    "b": "168 St",
    "color": "#D82233"
  },
  {
    "a": "181 St (A)",
    "b": "175 St",
    "color": "#0062CF"
  },
  {
    "a": "182-183 Sts",
    "b": "Tremont Av",
    "color": "#EB6800"
  },
  {
    "a": "183 St",
    "b": "Burnside Av",
    "color": "#009952"
  },
  {
    "a": "190 St",
    "b": "181 St (A)",
    "color": "#0062CF"
  },
  {
    "a": "191 St",
    "b": "181 St (1)",
    "color": "#D82233"
  },
  {
    "a": "2 Av",
    "b": "Delancey St-Essex St",
    "color": "#EB6800"
  },
  {
    "a": "20 Av (D)",
    "b": "Bay Pkwy (D)",
    "color": "#EB6800"
  },
  {
    "a": "20 Av (N)",
    "b": "Bay Pkwy (N)",
    "color": "#F6BC26"
  },
  {
    "a": "207 St",
    "b": "Dyckman St (1)",
    "color": "#D82233"
  },
  {
    "a": "21 St-Queensbridge",
    "b": "Roosevelt Island",
    "color": "#EB6800"
  },
  {
    "a": "21 St",
    "b": "Greenpoint Av",
    "color": "#799534"
  },
  {
    "a": "215 St",
    "b": "207 St",
    "color": "#D82233"
  },
  {
    "a": "219 St",
    "b": "Gun Hill Rd (2·5)",
    "color": "#009952"
  },
  {
    "a": "219 St",
    "b": "Gun Hill Rd (2·5)",
    "color": "#D82233"
  },
  {
    "a": "225 St",
    "b": "219 St",
    "color": "#009952"
  },
  {
    "a": "225 St",
    "b": "219 St",
    "color": "#D82233"
  },
  {
    "a": "23 St (1)",
    "b": "18 St",
    "color": "#D82233"
  },
  {
    "a": "23 St (C·E)",
    "b": "14 St (A·C·E·L)",
    "color": "#0062CF"
  },
  {
    "a": "23 St (F·M)",
    "b": "14 St (1·2·3·F·L·M)",
    "color": "#EB6800"
  },
  {
    "a": "23 St (R·W)",
    "b": "14 St-Union Sq",
    "color": "#F6BC26"
  },
  {
    "a": "23 St-Baruch College",
    "b": "14 St-Union Sq",
    "color": "#009952"
  },
  {
    "a": "231 St",
    "b": "Marble Hill-225 St",
    "color": "#D82233"
  },
  {
    "a": "233 St",
    "b": "225 St",
    "color": "#009952"
  },
  {
    "a": "233 St",
    "b": "225 St",
    "color": "#D82233"
  },
  {
    "a": "238 St",
    "b": "231 St",
    "color": "#D82233"
  },
  {
    "a": "25 Av",
    "b": "Bay 50 St",
    "color": "#EB6800"
  },
  {
    "a": "25 St",
    "b": "36 St (D·N·R)",
    "color": "#EB6800"
  },
  {
    "a": "25 St",
    "b": "36 St (D·N·R)",
    "color": "#F6BC26"
  },
  {
    "a": "28 St (1)",
    "b": "23 St (1)",
    "color": "#D82233"
  },
  {
    "a": "28 St (6)",
    "b": "23 St-Baruch College",
    "color": "#009952"
  },
  {
    "a": "28 St (R·W)",
    "b": "23 St (R·W)",
    "color": "#F6BC26"
  },
  {
    "a": "3 Av-138 St",
    "b": "125 St (4·5·6)",
    "color": "#009952"
  },
  {
    "a": "3 Av-149 St",
    "b": "149 St-Hostos",
    "color": "#009952"
  },
  {
    "a": "3 Av-149 St",
    "b": "149 St-Hostos",
    "color": "#D82233"
  },
  {
    "a": "3 Av",
    "b": "14 St-Union Sq",
    "color": "#7C858C"
  },
  {
    "a": "30 Av",
    "b": "Broadway (N·W)",
    "color": "#F6BC26"
  },
  {
    "a": "33 St-Rawson St",
    "b": "Queensboro Plaza",
    "color": "#9A38A1"
  },
  {
    "a": "33 St",
    "b": "28 St (6)",
    "color": "#009952"
  },
  {
    "a": "34 St-Herald Sq",
    "b": "23 St (F·M)",
    "color": "#EB6800"
  },
  {
    "a": "34 St-Herald Sq",
    "b": "28 St (R·W)",
    "color": "#F6BC26"
  },
  {
    "a": "34 St-Herald Sq",
    "b": "W 4 St-Wash Sq",
    "color": "#EB6800"
  },
  {
    "a": "34 St-Penn Station (1·2·3)",
    "b": "14 St (1·2·3·F·L·M)",
    "color": "#D82233"
  },
  {
    "a": "34 St-Penn Station (1·2·3)",
    "b": "28 St (1)",
    "color": "#D82233"
  },
  {
    "a": "34 St-Penn Station (A·C·E)",
    "b": "23 St (C·E)",
    "color": "#0062CF"
  },
  {
    "a": "36 Av",
    "b": "39 Av-Dutch Kills",
    "color": "#F6BC26"
  },
  {
    "a": "36 St (D·N·R)",
    "b": "45 St",
    "color": "#F6BC26"
  },
  {
    "a": "36 St (D·N·R)",
    "b": "9 Av",
    "color": "#EB6800"
  },
  {
    "a": "36 St (D·N·R)",
    "b": "9 Av",
    "color": "#F6BC26"
  },
  {
    "a": "36 St (D·N·R)",
    "b": "Atlantic Av-Barclays Ctr",
    "color": "#EB6800"
  },
  {
    "a": "36 St (D·N·R)",
    "b": "Atlantic Av-Barclays Ctr",
    "color": "#F6BC26"
  },
  {
    "a": "36 St (M·R)",
    "b": "21 St-Queensbridge",
    "color": "#EB6800"
  },
  {
    "a": "36 St (M·R)",
    "b": "Queens Plaza",
    "color": "#0062CF"
  },
  {
    "a": "36 St (M·R)",
    "b": "Queens Plaza",
    "color": "#EB6800"
  },
  {
    "a": "36 St (M·R)",
    "b": "Queens Plaza",
    "color": "#F6BC26"
  },
  {
    "a": "39 Av-Dutch Kills",
    "b": "Queensboro Plaza",
    "color": "#F6BC26"
  },
  {
    "a": "4 Av-9 St",
    "b": "7 Av (F·G)",
    "color": "#799534"
  },
  {
    "a": "4 Av-9 St",
    "b": "7 Av (F·G)",
    "color": "#EB6800"
  },
  {
    "a": "4 Av-9 St",
    "b": "Prospect Av (R)",
    "color": "#EB6800"
  },
  {
    "a": "4 Av-9 St",
    "b": "Prospect Av (R)",
    "color": "#F6BC26"
  },
  {
    "a": "40 St-Lowery St",
    "b": "33 St-Rawson St",
    "color": "#9A38A1"
  },
  {
    "a": "42 St-Bryant Pk",
    "b": "34 St-Herald Sq",
    "color": "#EB6800"
  },
  {
    "a": "42 St-Bryant Pk",
    "b": "Times Sq-42 St",
    "color": "#9A38A1"
  },
  {
    "a": "45 St",
    "b": "53 St",
    "color": "#F6BC26"
  },
  {
    "a": "46 St-Bliss St",
    "b": "40 St-Lowery St",
    "color": "#9A38A1"
  },
  {
    "a": "46 St-Bliss St",
    "b": "61 St-Woodside",
    "color": "#9A38A1"
  },
  {
    "a": "46 St",
    "b": "Steinway St",
    "color": "#0062CF"
  },
  {
    "a": "46 St",
    "b": "Steinway St",
    "color": "#EB6800"
  },
  {
    "a": "46 St",
    "b": "Steinway St",
    "color": "#F6BC26"
  },
  {
    "a": "47-50 Sts-Rockefeller Ctr",
    "b": "42 St-Bryant Pk",
    "color": "#EB6800"
  },
  {
    "a": "49 St",
    "b": "Times Sq-42 St",
    "color": "#F6BC26"
  },
  {
    "a": "5 Av/53 St",
    "b": "47-50 Sts-Rockefeller Ctr",
    "color": "#EB6800"
  },
  {
    "a": "5 Av/53 St",
    "b": "7 Av (B·D·E)",
    "color": "#0062CF"
  },
  {
    "a": "5 Av/59 St",
    "b": "57 St-7 Av",
    "color": "#F6BC26"
  },
  {
    "a": "50 St (1)",
    "b": "Times Sq-42 St",
    "color": "#D82233"
  },
  {
    "a": "50 St (C·E)",
    "b": "Times Sq-42 St",
    "color": "#0062CF"
  },
  {
    "a": "50 St (D)",
    "b": "55 St",
    "color": "#EB6800"
  },
  {
    "a": "51 St",
    "b": "5 Av/53 St",
    "color": "#0062CF"
  },
  {
    "a": "51 St",
    "b": "5 Av/53 St",
    "color": "#EB6800"
  },
  {
    "a": "51 St",
    "b": "Grand Central-42 St",
    "color": "#009952"
  },
  {
    "a": "52 St",
    "b": "46 St-Bliss St",
    "color": "#9A38A1"
  },
  {
    "a": "53 St",
    "b": "59 St (N·R)",
    "color": "#F6BC26"
  },
  {
    "a": "55 St",
    "b": "62 St",
    "color": "#EB6800"
  },
  {
    "a": "57 St-7 Av",
    "b": "49 St",
    "color": "#F6BC26"
  },
  {
    "a": "57 St-7 Av",
    "b": "Lexington Av/63 St",
    "color": "#F6BC26"
  },
  {
    "a": "57 St",
    "b": "47-50 Sts-Rockefeller Ctr",
    "color": "#EB6800"
  },
  {
    "a": "59 St (4·5·6·N·R·W)",
    "b": "5 Av/59 St",
    "color": "#F6BC26"
  },
  {
    "a": "59 St (4·5·6·N·R·W)",
    "b": "51 St",
    "color": "#009952"
  },
  {
    "a": "59 St (4·5·6·N·R·W)",
    "b": "Grand Central-42 St",
    "color": "#009952"
  },
  {
    "a": "59 St (N·R)",
    "b": "36 St (D·N·R)",
    "color": "#F6BC26"
  },
  {
    "a": "59 St (N·R)",
    "b": "8 Av",
    "color": "#F6BC26"
  },
  {
    "a": "59 St (N·R)",
    "b": "Bay Ridge Av",
    "color": "#F6BC26"
  },
  {
    "a": "59 St-Columbus Circle",
    "b": "125 St (A·B·C·D)",
    "color": "#0062CF"
  },
  {
    "a": "59 St-Columbus Circle",
    "b": "50 St (1)",
    "color": "#D82233"
  },
  {
    "a": "59 St-Columbus Circle",
    "b": "50 St (C·E)",
    "color": "#0062CF"
  },
  {
    "a": "59 St-Columbus Circle",
    "b": "7 Av (B·D·E)",
    "color": "#EB6800"
  },
  {
    "a": "61 St-Woodside",
    "b": "52 St",
    "color": "#9A38A1"
  },
  {
    "a": "61 St-Woodside",
    "b": "74 St-Broadway",
    "color": "#9A38A1"
  },
  {
    "a": "61 St-Woodside",
    "b": "Junction Blvd",
    "color": "#9A38A1"
  },
  {
    "a": "62 St",
    "b": "18 Av (N)",
    "color": "#F6BC26"
  },
  {
    "a": "62 St",
    "b": "71 St",
    "color": "#EB6800"
  },
  {
    "a": "62 St",
    "b": "Bay Pkwy (D)",
    "color": "#F6BC26"
  },
  {
    "a": "63 Dr-Rego Park",
    "b": "Woodhaven Blvd (M·R)",
    "color": "#0062CF"
  },
  {
    "a": "63 Dr-Rego Park",
    "b": "Woodhaven Blvd (M·R)",
    "color": "#EB6800"
  },
  {
    "a": "63 Dr-Rego Park",
    "b": "Woodhaven Blvd (M·R)",
    "color": "#F6BC26"
  },
  {
    "a": "65 St",
    "b": "Northern Blvd",
    "color": "#0062CF"
  },
  {
    "a": "65 St",
    "b": "Northern Blvd",
    "color": "#EB6800"
  },
  {
    "a": "65 St",
    "b": "Northern Blvd",
    "color": "#F6BC26"
  },
  {
    "a": "66 St-Lincoln Center",
    "b": "59 St-Columbus Circle",
    "color": "#D82233"
  },
  {
    "a": "67 Av",
    "b": "63 Dr-Rego Park",
    "color": "#0062CF"
  },
  {
    "a": "67 Av",
    "b": "63 Dr-Rego Park",
    "color": "#EB6800"
  },
  {
    "a": "67 Av",
    "b": "63 Dr-Rego Park",
    "color": "#F6BC26"
  },
  {
    "a": "68 St-Hunter College",
    "b": "59 St (4·5·6·N·R·W)",
    "color": "#009952"
  },
  {
    "a": "69 St",
    "b": "61 St-Woodside",
    "color": "#9A38A1"
  },
  {
    "a": "7 Av (B·D·E)",
    "b": "47-50 Sts-Rockefeller Ctr",
    "color": "#EB6800"
  },
  {
    "a": "7 Av (B·D·E)",
    "b": "50 St (C·E)",
    "color": "#0062CF"
  },
  {
    "a": "7 Av (B·Q)",
    "b": "Prospect Park",
    "color": "#EB6800"
  },
  {
    "a": "7 Av (B·Q)",
    "b": "Prospect Park",
    "color": "#F6BC26"
  },
  {
    "a": "7 Av (F·G)",
    "b": "15 St-Prospect Park",
    "color": "#799534"
  },
  {
    "a": "7 Av (F·G)",
    "b": "15 St-Prospect Park",
    "color": "#EB6800"
  },
  {
    "a": "7 Av (F·G)",
    "b": "Jay St-MetroTech",
    "color": "#EB6800"
  },
  {
    "a": "71 St",
    "b": "79 St (D)",
    "color": "#EB6800"
  },
  {
    "a": "72 St (1·2·3)",
    "b": "66 St-Lincoln Center",
    "color": "#D82233"
  },
  {
    "a": "72 St (1·2·3)",
    "b": "Times Sq-42 St",
    "color": "#D82233"
  },
  {
    "a": "72 St (B·C)",
    "b": "59 St-Columbus Circle",
    "color": "#0062CF"
  },
  {
    "a": "72 St (B·C)",
    "b": "59 St-Columbus Circle",
    "color": "#EB6800"
  },
  {
    "a": "72 St (Q)",
    "b": "86 St (Q)",
    "color": "#F6BC26"
  },
  {
    "a": "74 St-Broadway",
    "b": "21 St-Queensbridge",
    "color": "#EB6800"
  },
  {
    "a": "74 St-Broadway",
    "b": "36 St (M·R)",
    "color": "#EB6800"
  },
  {
    "a": "74 St-Broadway",
    "b": "65 St",
    "color": "#0062CF"
  },
  {
    "a": "74 St-Broadway",
    "b": "65 St",
    "color": "#EB6800"
  },
  {
    "a": "74 St-Broadway",
    "b": "65 St",
    "color": "#F6BC26"
  },
  {
    "a": "74 St-Broadway",
    "b": "69 St",
    "color": "#9A38A1"
  },
  {
    "a": "74 St-Broadway",
    "b": "Queens Plaza",
    "color": "#0062CF"
  },
  {
    "a": "74 St-Broadway",
    "b": "Queens Plaza",
    "color": "#EB6800"
  },
  {
    "a": "75 Av",
    "b": "Forest Hills-71 Av",
    "color": "#0062CF"
  },
  {
    "a": "75 Av",
    "b": "Forest Hills-71 Av",
    "color": "#EB6800"
  },
  {
    "a": "75 St-Elderts Ln",
    "b": "Crescent St",
    "color": "#8E5C33"
  },
  {
    "a": "75 St-Elderts Ln",
    "b": "Cypress Hills",
    "color": "#8E5C33"
  },
  {
    "a": "77 St (6)",
    "b": "68 St-Hunter College",
    "color": "#009952"
  },
  {
    "a": "77 St (R)",
    "b": "86 St (R)",
    "color": "#F6BC26"
  },
  {
    "a": "79 St (1)",
    "b": "72 St (1·2·3)",
    "color": "#D82233"
  },
  {
    "a": "79 St (D)",
    "b": "18 Av (D)",
    "color": "#EB6800"
  },
  {
    "a": "8 Av",
    "b": "Fort Hamilton Pkwy (N)",
    "color": "#F6BC26"
  },
  {
    "a": "8 St-NYU",
    "b": "Prince St",
    "color": "#F6BC26"
  },
  {
    "a": "80 St",
    "b": "88 St",
    "color": "#0062CF"
  },
  {
    "a": "81 St-Museum of Natural History",
    "b": "72 St (B·C)",
    "color": "#0062CF"
  },
  {
    "a": "81 St-Museum of Natural History",
    "b": "72 St (B·C)",
    "color": "#EB6800"
  },
  {
    "a": "82 St-Jackson Hts",
    "b": "74 St-Broadway",
    "color": "#9A38A1"
  },
  {
    "a": "85 St-Forest Pkwy",
    "b": "75 St-Elderts Ln",
    "color": "#8E5C33"
  },
  {
    "a": "85 St-Forest Pkwy",
    "b": "Cypress Hills",
    "color": "#8E5C33"
  },
  {
    "a": "86 St (1)",
    "b": "79 St (1)",
    "color": "#D82233"
  },
  {
    "a": "86 St (4·5·6)",
    "b": "59 St (4·5·6·N·R·W)",
    "color": "#009952"
  },
  {
    "a": "86 St (4·5·6)",
    "b": "77 St (6)",
    "color": "#009952"
  },
  {
    "a": "86 St (B·C)",
    "b": "81 St-Museum of Natural History",
    "color": "#0062CF"
  },
  {
    "a": "86 St (B·C)",
    "b": "81 St-Museum of Natural History",
    "color": "#EB6800"
  },
  {
    "a": "86 St (N)",
    "b": "Coney Island-Stillwell Av",
    "color": "#F6BC26"
  },
  {
    "a": "86 St (Q)",
    "b": "96 St (Q)",
    "color": "#F6BC26"
  },
  {
    "a": "86 St (R)",
    "b": "Bay Ridge-95 St",
    "color": "#F6BC26"
  },
  {
    "a": "88 St",
    "b": "Rockaway Blvd",
    "color": "#0062CF"
  },
  {
    "a": "9 Av",
    "b": "62 St",
    "color": "#F6BC26"
  },
  {
    "a": "9 Av",
    "b": "Fort Hamilton Pkwy (D)",
    "color": "#EB6800"
  },
  {
    "a": "90 St-Elmhurst Av",
    "b": "82 St-Jackson Hts",
    "color": "#9A38A1"
  },
  {
    "a": "96 St (1·2·3)",
    "b": "72 St (1·2·3)",
    "color": "#D82233"
  },
  {
    "a": "96 St (1·2·3)",
    "b": "86 St (1)",
    "color": "#D82233"
  },
  {
    "a": "96 St (6)",
    "b": "86 St (4·5·6)",
    "color": "#009952"
  },
  {
    "a": "96 St (B·C)",
    "b": "86 St (B·C)",
    "color": "#0062CF"
  },
  {
    "a": "96 St (B·C)",
    "b": "86 St (B·C)",
    "color": "#EB6800"
  },
  {
    "a": "Alabama Av",
    "b": "Broadway Junction",
    "color": "#8E5C33"
  },
  {
    "a": "Allerton Av",
    "b": "Pelham Pkwy (2·5)",
    "color": "#009952"
  },
  {
    "a": "Allerton Av",
    "b": "Pelham Pkwy (2·5)",
    "color": "#D82233"
  },
  {
    "a": "Aqueduct Racetrack",
    "b": "Rockaway Blvd",
    "color": "#0062CF"
  },
  {
    "a": "Aqueduct Racetrack",
    "b": "Rockaway Blvd",
    "color": "#7C858C"
  },
  {
    "a": "Aqueduct-N Conduit Av",
    "b": "Aqueduct Racetrack",
    "color": "#0062CF"
  },
  {
    "a": "Aqueduct-N Conduit Av",
    "b": "Aqueduct Racetrack",
    "color": "#7C858C"
  },
  {
    "a": "Aqueduct-N Conduit Av",
    "b": "Howard Beach-JFK Airport",
    "color": "#0062CF"
  },
  {
    "a": "Astor Pl",
    "b": "Bleecker St",
    "color": "#009952"
  },
  {
    "a": "Astoria Blvd",
    "b": "30 Av",
    "color": "#F6BC26"
  },
  {
    "a": "Astoria-Ditmars Blvd",
    "b": "Astoria Blvd",
    "color": "#F6BC26"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "7 Av (B·Q)",
    "color": "#EB6800"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "7 Av (B·Q)",
    "color": "#F6BC26"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "Bergen St (2·3)",
    "color": "#009952"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "Bergen St (2·3)",
    "color": "#D82233"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "Botanic Garden",
    "color": "#009952"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "Canal St (6·J·N·Q·R·W·Z)",
    "color": "#F6BC26"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "Grand St (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "Union St",
    "color": "#EB6800"
  },
  {
    "a": "Atlantic Av-Barclays Ctr",
    "b": "Union St",
    "color": "#F6BC26"
  },
  {
    "a": "Atlantic Av",
    "b": "Broadway Junction",
    "color": "#7C858C"
  },
  {
    "a": "Avenue H",
    "b": "Avenue J",
    "color": "#F6BC26"
  },
  {
    "a": "Avenue I",
    "b": "Bay Pkwy (F)",
    "color": "#EB6800"
  },
  {
    "a": "Avenue J",
    "b": "Avenue M",
    "color": "#F6BC26"
  },
  {
    "a": "Avenue M",
    "b": "Kings Hwy (B·Q)",
    "color": "#F6BC26"
  },
  {
    "a": "Avenue N",
    "b": "Avenue P",
    "color": "#EB6800"
  },
  {
    "a": "Avenue P",
    "b": "Kings Hwy (F)",
    "color": "#EB6800"
  },
  {
    "a": "Avenue U (F)",
    "b": "Avenue X",
    "color": "#EB6800"
  },
  {
    "a": "Avenue U (N)",
    "b": "86 St (N)",
    "color": "#F6BC26"
  },
  {
    "a": "Avenue U (Q)",
    "b": "Neck Rd",
    "color": "#F6BC26"
  },
  {
    "a": "Avenue X",
    "b": "Neptune Av",
    "color": "#EB6800"
  },
  {
    "a": "Bay 50 St",
    "b": "Coney Island-Stillwell Av",
    "color": "#EB6800"
  },
  {
    "a": "Bay Pkwy (D)",
    "b": "25 Av",
    "color": "#EB6800"
  },
  {
    "a": "Bay Pkwy (F)",
    "b": "Avenue N",
    "color": "#EB6800"
  },
  {
    "a": "Bay Pkwy (N)",
    "b": "Kings Hwy (N)",
    "color": "#F6BC26"
  },
  {
    "a": "Bay Ridge Av",
    "b": "77 St (R)",
    "color": "#F6BC26"
  },
  {
    "a": "Baychester Av",
    "b": "Gun Hill Rd (5)",
    "color": "#009952"
  },
  {
    "a": "Beach 105 St",
    "b": "Beach 98 St",
    "color": "#0062CF"
  },
  {
    "a": "Beach 105 St",
    "b": "Rockaway Park-Beach 116 St",
    "color": "#7C858C"
  },
  {
    "a": "Beach 25 St",
    "b": "Far Rockaway-Mott Av",
    "color": "#0062CF"
  },
  {
    "a": "Beach 36 St",
    "b": "Beach 25 St",
    "color": "#0062CF"
  },
  {
    "a": "Beach 44 St",
    "b": "Beach 36 St",
    "color": "#0062CF"
  },
  {
    "a": "Beach 60 St",
    "b": "Beach 44 St",
    "color": "#0062CF"
  },
  {
    "a": "Beach 67 St",
    "b": "Beach 60 St",
    "color": "#0062CF"
  },
  {
    "a": "Beach 90 St",
    "b": "Beach 98 St",
    "color": "#7C858C"
  },
  {
    "a": "Beach 90 St",
    "b": "Broad Channel",
    "color": "#0062CF"
  },
  {
    "a": "Beach 98 St",
    "b": "Beach 105 St",
    "color": "#7C858C"
  },
  {
    "a": "Beach 98 St",
    "b": "Beach 90 St",
    "color": "#0062CF"
  },
  {
    "a": "Bedford Av",
    "b": "1 Av",
    "color": "#7C858C"
  },
  {
    "a": "Bedford Park Blvd-Lehman College",
    "b": "Kingsbridge Rd (4)",
    "color": "#009952"
  },
  {
    "a": "Bedford Park Blvd",
    "b": "Kingsbridge Rd (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "Bedford-Nostrand Avs",
    "b": "Classon Av",
    "color": "#799534"
  },
  {
    "a": "Bergen St (2·3)",
    "b": "Grand Army Plaza",
    "color": "#009952"
  },
  {
    "a": "Bergen St (2·3)",
    "b": "Grand Army Plaza",
    "color": "#D82233"
  },
  {
    "a": "Bergen St (F·G)",
    "b": "Carroll St",
    "color": "#799534"
  },
  {
    "a": "Bergen St (F·G)",
    "b": "Carroll St",
    "color": "#EB6800"
  },
  {
    "a": "Beverley Rd",
    "b": "Cortelyou Rd",
    "color": "#F6BC26"
  },
  {
    "a": "Beverly Rd",
    "b": "Newkirk Av-Little Haiti",
    "color": "#009952"
  },
  {
    "a": "Beverly Rd",
    "b": "Newkirk Av-Little Haiti",
    "color": "#D82233"
  },
  {
    "a": "Bleecker St",
    "b": "2 Av",
    "color": "#EB6800"
  },
  {
    "a": "Bleecker St",
    "b": "Delancey St-Essex St",
    "color": "#EB6800"
  },
  {
    "a": "Bleecker St",
    "b": "Grand St (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "Bleecker St",
    "b": "Spring St (6)",
    "color": "#009952"
  },
  {
    "a": "Borough Hall",
    "b": "Hoyt St",
    "color": "#D82233"
  },
  {
    "a": "Borough Hall",
    "b": "Jay St-MetroTech",
    "color": "#F6BC26"
  },
  {
    "a": "Borough Hall",
    "b": "Nevins St",
    "color": "#009952"
  },
  {
    "a": "Botanic Garden",
    "b": "Crown Hts-Utica Av",
    "color": "#009952"
  },
  {
    "a": "Botanic Garden",
    "b": "Nostrand Av (3)",
    "color": "#009952"
  },
  {
    "a": "Botanic Garden",
    "b": "President St-Medgar Evers College",
    "color": "#009952"
  },
  {
    "a": "Botanic Garden",
    "b": "President St-Medgar Evers College",
    "color": "#D82233"
  },
  {
    "a": "Botanic Garden",
    "b": "Prospect Park",
    "color": "#7C858C"
  },
  {
    "a": "Bowery",
    "b": "Canal St (6·J·N·Q·R·W·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "Bowling Green",
    "b": "Borough Hall",
    "color": "#009952"
  },
  {
    "a": "Briarwood",
    "b": "Kew Gardens-Union Tpke",
    "color": "#0062CF"
  },
  {
    "a": "Briarwood",
    "b": "Kew Gardens-Union Tpke",
    "color": "#EB6800"
  },
  {
    "a": "Briarwood",
    "b": "Sutphin Blvd",
    "color": "#0062CF"
  },
  {
    "a": "Brighton Beach",
    "b": "Ocean Pkwy",
    "color": "#F6BC26"
  },
  {
    "a": "Broad Channel",
    "b": "Beach 67 St",
    "color": "#0062CF"
  },
  {
    "a": "Broad Channel",
    "b": "Beach 90 St",
    "color": "#7C858C"
  },
  {
    "a": "Broad Channel",
    "b": "Howard Beach-JFK Airport",
    "color": "#7C858C"
  },
  {
    "a": "Broadway (G)",
    "b": "Flushing Av (G)",
    "color": "#799534"
  },
  {
    "a": "Broadway (N·W)",
    "b": "36 Av",
    "color": "#F6BC26"
  },
  {
    "a": "Broadway Junction",
    "b": "Bushwick Av-Aberdeen St",
    "color": "#7C858C"
  },
  {
    "a": "Broadway Junction",
    "b": "Chauncey St",
    "color": "#8E5C33"
  },
  {
    "a": "Broadway Junction",
    "b": "Halsey St (J)",
    "color": "#8E5C33"
  },
  {
    "a": "Broadway Junction",
    "b": "Liberty Av",
    "color": "#0062CF"
  },
  {
    "a": "Broadway Junction",
    "b": "Utica Av",
    "color": "#0062CF"
  },
  {
    "a": "Bronx Park East",
    "b": "E 180 St",
    "color": "#009952"
  },
  {
    "a": "Bronx Park East",
    "b": "E 180 St",
    "color": "#D82233"
  },
  {
    "a": "Brook Av",
    "b": "3 Av-138 St",
    "color": "#009952"
  },
  {
    "a": "Brooklyn Bridge-City Hall",
    "b": "Fulton St (2·3·4·5·A·C·J·Z)",
    "color": "#009952"
  },
  {
    "a": "Brooklyn Bridge-City Hall",
    "b": "Fulton St (2·3·4·5·A·C·J·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "Buhre Av",
    "b": "Middletown Rd",
    "color": "#009952"
  },
  {
    "a": "Burke Av",
    "b": "Allerton Av",
    "color": "#009952"
  },
  {
    "a": "Burke Av",
    "b": "Allerton Av",
    "color": "#D82233"
  },
  {
    "a": "Burnside Av",
    "b": "176 St",
    "color": "#009952"
  },
  {
    "a": "Bushwick Av-Aberdeen St",
    "b": "Wilson Av",
    "color": "#7C858C"
  },
  {
    "a": "Canal St (1)",
    "b": "Franklin St",
    "color": "#D82233"
  },
  {
    "a": "Canal St (6·J·N·Q·R·W·Z)",
    "b": "14 St-Union Sq",
    "color": "#F6BC26"
  },
  {
    "a": "Canal St (6·J·N·Q·R·W·Z)",
    "b": "Brooklyn Bridge-City Hall",
    "color": "#009952"
  },
  {
    "a": "Canal St (6·J·N·Q·R·W·Z)",
    "b": "Brooklyn Bridge-City Hall",
    "color": "#8E5C33"
  },
  {
    "a": "Canal St (6·J·N·Q·R·W·Z)",
    "b": "City Hall",
    "color": "#F6BC26"
  },
  {
    "a": "Canal St (A·C·E)",
    "b": "Chambers St (2·3·A·C·E·R·W)",
    "color": "#0062CF"
  },
  {
    "a": "Canal St (A·C·E)",
    "b": "W 4 St-Wash Sq",
    "color": "#0062CF"
  },
  {
    "a": "Canarsie-Rockaway Pkwy",
    "b": "East 105 St",
    "color": "#7C858C"
  },
  {
    "a": "Carroll St",
    "b": "Smith-9 Sts",
    "color": "#799534"
  },
  {
    "a": "Carroll St",
    "b": "Smith-9 Sts",
    "color": "#EB6800"
  },
  {
    "a": "Castle Hill Av",
    "b": "Parkchester",
    "color": "#009952"
  },
  {
    "a": "Cathedral Pkwy (110 St) (1)",
    "b": "103 St (1)",
    "color": "#D82233"
  },
  {
    "a": "Cathedral Pkwy (110 St) (B·C)",
    "b": "103 St (B·C)",
    "color": "#0062CF"
  },
  {
    "a": "Cathedral Pkwy (110 St) (B·C)",
    "b": "103 St (B·C)",
    "color": "#EB6800"
  },
  {
    "a": "Central Av",
    "b": "Knickerbocker Av",
    "color": "#EB6800"
  },
  {
    "a": "Chambers St (1·2·3)",
    "b": "Chambers St (2·3·A·C·E·R·W)",
    "color": "#D82233"
  },
  {
    "a": "Chambers St (1·2·3)",
    "b": "WTC Cortlandt",
    "color": "#D82233"
  },
  {
    "a": "Chambers St (2·3·A·C·E·R·W)",
    "b": "Fulton St (2·3·4·5·A·C·J·Z)",
    "color": "#0062CF"
  },
  {
    "a": "Chambers St (2·3·A·C·E·R·W)",
    "b": "Fulton St (2·3·4·5·A·C·J·Z)",
    "color": "#D82233"
  },
  {
    "a": "Chambers St (2·3·A·C·E·R·W)",
    "b": "Rector St (R·W)",
    "color": "#F6BC26"
  },
  {
    "a": "Chauncey St",
    "b": "Gates Av",
    "color": "#8E5C33"
  },
  {
    "a": "Chauncey St",
    "b": "Halsey St (J)",
    "color": "#8E5C33"
  },
  {
    "a": "Christopher St-Stonewall",
    "b": "Houston St",
    "color": "#D82233"
  },
  {
    "a": "Church Av (2·5)",
    "b": "Beverly Rd",
    "color": "#009952"
  },
  {
    "a": "Church Av (2·5)",
    "b": "Beverly Rd",
    "color": "#D82233"
  },
  {
    "a": "Church Av (B·Q)",
    "b": "Beverley Rd",
    "color": "#F6BC26"
  },
  {
    "a": "Church Av (B·Q)",
    "b": "Newkirk Plaza",
    "color": "#EB6800"
  },
  {
    "a": "Church Av (F·G)",
    "b": "7 Av (F·G)",
    "color": "#EB6800"
  },
  {
    "a": "Church Av (F·G)",
    "b": "Ditmas Av",
    "color": "#EB6800"
  },
  {
    "a": "City Hall",
    "b": "Chambers St (2·3·A·C·E·R·W)",
    "color": "#F6BC26"
  },
  {
    "a": "Clark St",
    "b": "Borough Hall",
    "color": "#D82233"
  },
  {
    "a": "Classon Av",
    "b": "Clinton-Washington Avs (G)",
    "color": "#799534"
  },
  {
    "a": "Cleveland St",
    "b": "Alabama Av",
    "color": "#8E5C33"
  },
  {
    "a": "Cleveland St",
    "b": "Van Siclen Av (J·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "Clinton-Washington Avs (C)",
    "b": "Franklin Av",
    "color": "#0062CF"
  },
  {
    "a": "Clinton-Washington Avs (G)",
    "b": "Fulton St (G)",
    "color": "#799534"
  },
  {
    "a": "Cortelyou Rd",
    "b": "Newkirk Plaza",
    "color": "#F6BC26"
  },
  {
    "a": "Court Sq",
    "b": "21 St",
    "color": "#799534"
  },
  {
    "a": "Court Sq",
    "b": "51 St",
    "color": "#0062CF"
  },
  {
    "a": "Court Sq",
    "b": "51 St",
    "color": "#EB6800"
  },
  {
    "a": "Court Sq",
    "b": "Hunters Point Av",
    "color": "#9A38A1"
  },
  {
    "a": "Crescent St",
    "b": "Cleveland St",
    "color": "#8E5C33"
  },
  {
    "a": "Crescent St",
    "b": "Norwood Av",
    "color": "#8E5C33"
  },
  {
    "a": "Crown Hts-Utica Av",
    "b": "Kingston Av",
    "color": "#D82233"
  },
  {
    "a": "Crown Hts-Utica Av",
    "b": "Sutter Av-Rutland Rd",
    "color": "#009952"
  },
  {
    "a": "Cypress Av",
    "b": "Brook Av",
    "color": "#009952"
  },
  {
    "a": "Cypress Hills",
    "b": "Crescent St",
    "color": "#8E5C33"
  },
  {
    "a": "DeKalb Av (B·Q·R)",
    "b": "Atlantic Av-Barclays Ctr",
    "color": "#EB6800"
  },
  {
    "a": "DeKalb Av (B·Q·R)",
    "b": "Atlantic Av-Barclays Ctr",
    "color": "#F6BC26"
  },
  {
    "a": "DeKalb Av (B·Q·R)",
    "b": "Canal St (6·J·N·Q·R·W·Z)",
    "color": "#F6BC26"
  },
  {
    "a": "DeKalb Av (L)",
    "b": "Jefferson St",
    "color": "#7C858C"
  },
  {
    "a": "Delancey St-Essex St",
    "b": "Bowery",
    "color": "#8E5C33"
  },
  {
    "a": "Delancey St-Essex St",
    "b": "East Broadway",
    "color": "#EB6800"
  },
  {
    "a": "Ditmas Av",
    "b": "18 Av (F)",
    "color": "#EB6800"
  },
  {
    "a": "Dyckman St (1)",
    "b": "191 St",
    "color": "#D82233"
  },
  {
    "a": "Dyckman St (A)",
    "b": "190 St",
    "color": "#0062CF"
  },
  {
    "a": "E 143 St-St Mary's St",
    "b": "Cypress Av",
    "color": "#009952"
  },
  {
    "a": "E 149 St",
    "b": "E 143 St-St Mary's St",
    "color": "#009952"
  },
  {
    "a": "E 180 St",
    "b": "3 Av-149 St",
    "color": "#009952"
  },
  {
    "a": "E 180 St",
    "b": "Gun Hill Rd (2·5)",
    "color": "#009952"
  },
  {
    "a": "E 180 St",
    "b": "West Farms Sq-E Tremont Av",
    "color": "#009952"
  },
  {
    "a": "E 180 St",
    "b": "West Farms Sq-E Tremont Av",
    "color": "#D82233"
  },
  {
    "a": "East 105 St",
    "b": "New Lots Av (L)",
    "color": "#7C858C"
  },
  {
    "a": "East Broadway",
    "b": "York St",
    "color": "#EB6800"
  },
  {
    "a": "Eastchester-Dyre Av",
    "b": "Baychester Av",
    "color": "#009952"
  },
  {
    "a": "Eastern Pkwy-Brooklyn Museum",
    "b": "Botanic Garden",
    "color": "#009952"
  },
  {
    "a": "Eastern Pkwy-Brooklyn Museum",
    "b": "Botanic Garden",
    "color": "#D82233"
  },
  {
    "a": "Elder Av",
    "b": "Whitlock Av",
    "color": "#009952"
  },
  {
    "a": "Elmhurst Av",
    "b": "74 St-Broadway",
    "color": "#0062CF"
  },
  {
    "a": "Elmhurst Av",
    "b": "74 St-Broadway",
    "color": "#EB6800"
  },
  {
    "a": "Elmhurst Av",
    "b": "74 St-Broadway",
    "color": "#F6BC26"
  },
  {
    "a": "Euclid Av",
    "b": "Broadway Junction",
    "color": "#0062CF"
  },
  {
    "a": "Euclid Av",
    "b": "Grant Av",
    "color": "#0062CF"
  },
  {
    "a": "Flushing Av (G)",
    "b": "Myrtle-Willoughby Avs",
    "color": "#799534"
  },
  {
    "a": "Flushing Av (J·M)",
    "b": "Lorimer St (J·M)",
    "color": "#8E5C33"
  },
  {
    "a": "Flushing Av (J·M)",
    "b": "Lorimer St (J·M)",
    "color": "#EB6800"
  },
  {
    "a": "Flushing-Main St",
    "b": "Mets-Willets Point",
    "color": "#9A38A1"
  },
  {
    "a": "Fordham Rd (4)",
    "b": "183 St",
    "color": "#009952"
  },
  {
    "a": "Fordham Rd (B·D)",
    "b": "182-183 Sts",
    "color": "#EB6800"
  },
  {
    "a": "Forest Av",
    "b": "Fresh Pond Rd",
    "color": "#EB6800"
  },
  {
    "a": "Forest Hills-71 Av",
    "b": "67 Av",
    "color": "#0062CF"
  },
  {
    "a": "Forest Hills-71 Av",
    "b": "67 Av",
    "color": "#EB6800"
  },
  {
    "a": "Forest Hills-71 Av",
    "b": "67 Av",
    "color": "#F6BC26"
  },
  {
    "a": "Forest Hills-71 Av",
    "b": "74 St-Broadway",
    "color": "#0062CF"
  },
  {
    "a": "Forest Hills-71 Av",
    "b": "74 St-Broadway",
    "color": "#EB6800"
  },
  {
    "a": "Fort Hamilton Pkwy (D)",
    "b": "50 St (D)",
    "color": "#EB6800"
  },
  {
    "a": "Fort Hamilton Pkwy (F·G)",
    "b": "Church Av (F·G)",
    "color": "#799534"
  },
  {
    "a": "Fort Hamilton Pkwy (F·G)",
    "b": "Church Av (F·G)",
    "color": "#EB6800"
  },
  {
    "a": "Fort Hamilton Pkwy (N)",
    "b": "62 St",
    "color": "#F6BC26"
  },
  {
    "a": "Franklin Av",
    "b": "Nostrand Av (A·C)",
    "color": "#0062CF"
  },
  {
    "a": "Franklin Av",
    "b": "Park Pl",
    "color": "#7C858C"
  },
  {
    "a": "Franklin St",
    "b": "Chambers St (1·2·3)",
    "color": "#D82233"
  },
  {
    "a": "Freeman St",
    "b": "Simpson St",
    "color": "#009952"
  },
  {
    "a": "Freeman St",
    "b": "Simpson St",
    "color": "#D82233"
  },
  {
    "a": "Fresh Pond Rd",
    "b": "Middle Village-Metropolitan Av",
    "color": "#EB6800"
  },
  {
    "a": "Fulton St (2·3·4·5·A·C·J·Z)",
    "b": "Broad St",
    "color": "#8E5C33"
  },
  {
    "a": "Fulton St (2·3·4·5·A·C·J·Z)",
    "b": "High St",
    "color": "#0062CF"
  },
  {
    "a": "Fulton St (2·3·4·5·A·C·J·Z)",
    "b": "Wall St (2·3)",
    "color": "#D82233"
  },
  {
    "a": "Fulton St (2·3·4·5·A·C·J·Z)",
    "b": "Wall St (4·5)",
    "color": "#009952"
  },
  {
    "a": "Fulton St (G)",
    "b": "Hoyt-Schermerhorn Sts",
    "color": "#799534"
  },
  {
    "a": "Gates Av",
    "b": "Kosciuszko St",
    "color": "#8E5C33"
  },
  {
    "a": "Gates Av",
    "b": "Myrtle Av",
    "color": "#8E5C33"
  },
  {
    "a": "Graham Av",
    "b": "Lorimer St (G·L)",
    "color": "#7C858C"
  },
  {
    "a": "Grand Army Plaza",
    "b": "Eastern Pkwy-Brooklyn Museum",
    "color": "#009952"
  },
  {
    "a": "Grand Army Plaza",
    "b": "Eastern Pkwy-Brooklyn Museum",
    "color": "#D82233"
  },
  {
    "a": "Grand Av-Newtown",
    "b": "Elmhurst Av",
    "color": "#0062CF"
  },
  {
    "a": "Grand Av-Newtown",
    "b": "Elmhurst Av",
    "color": "#EB6800"
  },
  {
    "a": "Grand Av-Newtown",
    "b": "Elmhurst Av",
    "color": "#F6BC26"
  },
  {
    "a": "Grand Central-42 St",
    "b": "14 St-Union Sq",
    "color": "#009952"
  },
  {
    "a": "Grand Central-42 St",
    "b": "33 St",
    "color": "#009952"
  },
  {
    "a": "Grand Central-42 St",
    "b": "42 St-Bryant Pk",
    "color": "#9A38A1"
  },
  {
    "a": "Grand Central-42 St",
    "b": "Times Sq-42 St",
    "color": "#7C858C"
  },
  {
    "a": "Grand St (B·D)",
    "b": "DeKalb Av (B·Q·R)",
    "color": "#EB6800"
  },
  {
    "a": "Grand St (L)",
    "b": "Graham Av",
    "color": "#7C858C"
  },
  {
    "a": "Grant Av",
    "b": "80 St",
    "color": "#0062CF"
  },
  {
    "a": "Greenpoint Av",
    "b": "Nassau Av",
    "color": "#799534"
  },
  {
    "a": "Gun Hill Rd (2·5)",
    "b": "Burke Av",
    "color": "#009952"
  },
  {
    "a": "Gun Hill Rd (2·5)",
    "b": "Burke Av",
    "color": "#D82233"
  },
  {
    "a": "Gun Hill Rd (5)",
    "b": "Pelham Pkwy (5)",
    "color": "#009952"
  },
  {
    "a": "Halsey St (J)",
    "b": "Gates Av",
    "color": "#8E5C33"
  },
  {
    "a": "Halsey St (J)",
    "b": "Kosciuszko St",
    "color": "#8E5C33"
  },
  {
    "a": "Halsey St (L)",
    "b": "Myrtle-Wyckoff Avs",
    "color": "#7C858C"
  },
  {
    "a": "Harlem-148 St",
    "b": "145 St (3)",
    "color": "#D82233"
  },
  {
    "a": "Hewes St",
    "b": "Marcy Av",
    "color": "#8E5C33"
  },
  {
    "a": "Hewes St",
    "b": "Marcy Av",
    "color": "#EB6800"
  },
  {
    "a": "High St",
    "b": "Jay St-MetroTech",
    "color": "#0062CF"
  },
  {
    "a": "Houston St",
    "b": "Canal St (1)",
    "color": "#D82233"
  },
  {
    "a": "Howard Beach-JFK Airport",
    "b": "Aqueduct-N Conduit Av",
    "color": "#7C858C"
  },
  {
    "a": "Howard Beach-JFK Airport",
    "b": "Broad Channel",
    "color": "#0062CF"
  },
  {
    "a": "Hoyt St",
    "b": "Nevins St",
    "color": "#D82233"
  },
  {
    "a": "Hoyt-Schermerhorn Sts",
    "b": "Bergen St (F·G)",
    "color": "#799534"
  },
  {
    "a": "Hoyt-Schermerhorn Sts",
    "b": "Lafayette Av",
    "color": "#0062CF"
  },
  {
    "a": "Hunters Point Av",
    "b": "Vernon Blvd-Jackson Av",
    "color": "#9A38A1"
  },
  {
    "a": "Hunts Point Av",
    "b": "3 Av-138 St",
    "color": "#009952"
  },
  {
    "a": "Hunts Point Av",
    "b": "Longwood Av",
    "color": "#009952"
  },
  {
    "a": "Intervale Av",
    "b": "Prospect Av (2·5)",
    "color": "#009952"
  },
  {
    "a": "Intervale Av",
    "b": "Prospect Av (2·5)",
    "color": "#D82233"
  },
  {
    "a": "Inwood-207 St",
    "b": "Dyckman St (A)",
    "color": "#0062CF"
  },
  {
    "a": "Jackson Av",
    "b": "3 Av-149 St",
    "color": "#009952"
  },
  {
    "a": "Jackson Av",
    "b": "3 Av-149 St",
    "color": "#D82233"
  },
  {
    "a": "Jamaica Center-Parsons/Archer",
    "b": "Sutphin Blvd-Archer Av-JFK Airport",
    "color": "#0062CF"
  },
  {
    "a": "Jamaica Center-Parsons/Archer",
    "b": "Sutphin Blvd-Archer Av-JFK Airport",
    "color": "#8E5C33"
  },
  {
    "a": "Jamaica-179 St",
    "b": "169 St",
    "color": "#EB6800"
  },
  {
    "a": "Jamaica-179 St",
    "b": "Parsons Blvd",
    "color": "#0062CF"
  },
  {
    "a": "Jamaica-Van Wyck",
    "b": "Briarwood",
    "color": "#0062CF"
  },
  {
    "a": "Jamaica-Van Wyck",
    "b": "Kew Gardens-Union Tpke",
    "color": "#0062CF"
  },
  {
    "a": "Jay St-MetroTech",
    "b": "Bergen St (F·G)",
    "color": "#EB6800"
  },
  {
    "a": "Jay St-MetroTech",
    "b": "DeKalb Av (B·Q·R)",
    "color": "#F6BC26"
  },
  {
    "a": "Jay St-MetroTech",
    "b": "Hoyt-Schermerhorn Sts",
    "color": "#0062CF"
  },
  {
    "a": "Jefferson St",
    "b": "Morgan Av",
    "color": "#7C858C"
  },
  {
    "a": "Junction Blvd",
    "b": "74 St-Broadway",
    "color": "#9A38A1"
  },
  {
    "a": "Junction Blvd",
    "b": "90 St-Elmhurst Av",
    "color": "#9A38A1"
  },
  {
    "a": "Junius St",
    "b": "Pennsylvania Av",
    "color": "#009952"
  },
  {
    "a": "Junius St",
    "b": "Rockaway Av (3)",
    "color": "#D82233"
  },
  {
    "a": "Kew Gardens-Union Tpke",
    "b": "75 Av",
    "color": "#0062CF"
  },
  {
    "a": "Kew Gardens-Union Tpke",
    "b": "75 Av",
    "color": "#EB6800"
  },
  {
    "a": "Kew Gardens-Union Tpke",
    "b": "Forest Hills-71 Av",
    "color": "#0062CF"
  },
  {
    "a": "Kings Hwy (B·Q)",
    "b": "Avenue U (Q)",
    "color": "#F6BC26"
  },
  {
    "a": "Kings Hwy (B·Q)",
    "b": "Sheepshead Bay",
    "color": "#EB6800"
  },
  {
    "a": "Kings Hwy (F)",
    "b": "Avenue U (F)",
    "color": "#EB6800"
  },
  {
    "a": "Kings Hwy (N)",
    "b": "Avenue U (N)",
    "color": "#F6BC26"
  },
  {
    "a": "Kingsbridge Rd (4)",
    "b": "Fordham Rd (4)",
    "color": "#009952"
  },
  {
    "a": "Kingsbridge Rd (B·D)",
    "b": "Fordham Rd (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "Kingston Av",
    "b": "Crown Hts-Utica Av",
    "color": "#009952"
  },
  {
    "a": "Kingston Av",
    "b": "Nostrand Av (3)",
    "color": "#D82233"
  },
  {
    "a": "Kingston-Throop Avs",
    "b": "Utica Av",
    "color": "#0062CF"
  },
  {
    "a": "Knickerbocker Av",
    "b": "Myrtle-Wyckoff Avs",
    "color": "#EB6800"
  },
  {
    "a": "Kosciuszko St",
    "b": "Myrtle Av",
    "color": "#8E5C33"
  },
  {
    "a": "Lafayette Av",
    "b": "Clinton-Washington Avs (C)",
    "color": "#0062CF"
  },
  {
    "a": "Lexington Av/63 St",
    "b": "57 St",
    "color": "#EB6800"
  },
  {
    "a": "Lexington Av/63 St",
    "b": "72 St (Q)",
    "color": "#F6BC26"
  },
  {
    "a": "Liberty Av",
    "b": "Van Siclen Av (C)",
    "color": "#0062CF"
  },
  {
    "a": "Livonia Av",
    "b": "Sutter Av",
    "color": "#7C858C"
  },
  {
    "a": "Longwood Av",
    "b": "E 149 St",
    "color": "#009952"
  },
  {
    "a": "Lorimer St (G·L)",
    "b": "Bedford Av",
    "color": "#7C858C"
  },
  {
    "a": "Lorimer St (G·L)",
    "b": "Broadway (G)",
    "color": "#799534"
  },
  {
    "a": "Lorimer St (J·M)",
    "b": "Hewes St",
    "color": "#8E5C33"
  },
  {
    "a": "Lorimer St (J·M)",
    "b": "Hewes St",
    "color": "#EB6800"
  },
  {
    "a": "Marble Hill-225 St",
    "b": "215 St",
    "color": "#D82233"
  },
  {
    "a": "Marcy Av",
    "b": "Delancey St-Essex St",
    "color": "#8E5C33"
  },
  {
    "a": "Marcy Av",
    "b": "Delancey St-Essex St",
    "color": "#EB6800"
  },
  {
    "a": "Mets-Willets Point",
    "b": "111 St (7)",
    "color": "#9A38A1"
  },
  {
    "a": "Mets-Willets Point",
    "b": "Junction Blvd",
    "color": "#9A38A1"
  },
  {
    "a": "Middletown Rd",
    "b": "Westchester Sq-E Tremont Av",
    "color": "#009952"
  },
  {
    "a": "Montrose Av",
    "b": "Grand St (L)",
    "color": "#7C858C"
  },
  {
    "a": "Morgan Av",
    "b": "Montrose Av",
    "color": "#7C858C"
  },
  {
    "a": "Morris Park",
    "b": "E 180 St",
    "color": "#009952"
  },
  {
    "a": "Morrison Av-Soundview",
    "b": "Elder Av",
    "color": "#009952"
  },
  {
    "a": "Mosholu Pkwy",
    "b": "Bedford Park Blvd-Lehman College",
    "color": "#009952"
  },
  {
    "a": "Mt Eden Av",
    "b": "170 St (4)",
    "color": "#009952"
  },
  {
    "a": "Myrtle Av",
    "b": "Central Av",
    "color": "#EB6800"
  },
  {
    "a": "Myrtle Av",
    "b": "Flushing Av (J·M)",
    "color": "#8E5C33"
  },
  {
    "a": "Myrtle Av",
    "b": "Flushing Av (J·M)",
    "color": "#EB6800"
  },
  {
    "a": "Myrtle Av",
    "b": "Marcy Av",
    "color": "#8E5C33"
  },
  {
    "a": "Myrtle-Willoughby Avs",
    "b": "Bedford-Nostrand Avs",
    "color": "#799534"
  },
  {
    "a": "Myrtle-Wyckoff Avs",
    "b": "DeKalb Av (L)",
    "color": "#7C858C"
  },
  {
    "a": "Myrtle-Wyckoff Avs",
    "b": "Seneca Av",
    "color": "#EB6800"
  },
  {
    "a": "Nassau Av",
    "b": "Lorimer St (G·L)",
    "color": "#799534"
  },
  {
    "a": "Neck Rd",
    "b": "Sheepshead Bay",
    "color": "#F6BC26"
  },
  {
    "a": "Neptune Av",
    "b": "W 8 St-NY Aquarium",
    "color": "#EB6800"
  },
  {
    "a": "Nereid Av",
    "b": "233 St",
    "color": "#009952"
  },
  {
    "a": "Nereid Av",
    "b": "233 St",
    "color": "#D82233"
  },
  {
    "a": "Nevins St",
    "b": "Atlantic Av-Barclays Ctr",
    "color": "#009952"
  },
  {
    "a": "Nevins St",
    "b": "Atlantic Av-Barclays Ctr",
    "color": "#D82233"
  },
  {
    "a": "New Lots Av (3)",
    "b": "Van Siclen Av (3)",
    "color": "#D82233"
  },
  {
    "a": "New Lots Av (L)",
    "b": "Livonia Av",
    "color": "#7C858C"
  },
  {
    "a": "Newkirk Av-Little Haiti",
    "b": "Flatbush Av-Brooklyn College",
    "color": "#009952"
  },
  {
    "a": "Newkirk Av-Little Haiti",
    "b": "Flatbush Av-Brooklyn College",
    "color": "#D82233"
  },
  {
    "a": "Newkirk Plaza",
    "b": "Avenue H",
    "color": "#F6BC26"
  },
  {
    "a": "Newkirk Plaza",
    "b": "Kings Hwy (B·Q)",
    "color": "#EB6800"
  },
  {
    "a": "Northern Blvd",
    "b": "46 St",
    "color": "#0062CF"
  },
  {
    "a": "Northern Blvd",
    "b": "46 St",
    "color": "#EB6800"
  },
  {
    "a": "Northern Blvd",
    "b": "46 St",
    "color": "#F6BC26"
  },
  {
    "a": "Norwood Av",
    "b": "Cleveland St",
    "color": "#8E5C33"
  },
  {
    "a": "Norwood Av",
    "b": "Van Siclen Av (J·Z)",
    "color": "#8E5C33"
  },
  {
    "a": "Norwood-205 St",
    "b": "Bedford Park Blvd",
    "color": "#EB6800"
  },
  {
    "a": "Nostrand Av (3)",
    "b": "Botanic Garden",
    "color": "#D82233"
  },
  {
    "a": "Nostrand Av (3)",
    "b": "Kingston Av",
    "color": "#009952"
  },
  {
    "a": "Nostrand Av (A·C)",
    "b": "Hoyt-Schermerhorn Sts",
    "color": "#0062CF"
  },
  {
    "a": "Nostrand Av (A·C)",
    "b": "Kingston-Throop Avs",
    "color": "#0062CF"
  },
  {
    "a": "Ocean Pkwy",
    "b": "W 8 St-NY Aquarium",
    "color": "#F6BC26"
  },
  {
    "a": "Ozone Park-Lefferts Blvd",
    "b": "111 St (A)",
    "color": "#0062CF"
  },
  {
    "a": "Park Pl",
    "b": "Botanic Garden",
    "color": "#7C858C"
  },
  {
    "a": "Parkchester",
    "b": "Hunts Point Av",
    "color": "#009952"
  },
  {
    "a": "Parkchester",
    "b": "St Lawrence Av",
    "color": "#009952"
  },
  {
    "a": "Parkside Av",
    "b": "Church Av (B·Q)",
    "color": "#F6BC26"
  },
  {
    "a": "Parsons Blvd",
    "b": "169 St",
    "color": "#0062CF"
  },
  {
    "a": "Parsons Blvd",
    "b": "Kew Gardens-Union Tpke",
    "color": "#0062CF"
  },
  {
    "a": "Parsons Blvd",
    "b": "Sutphin Blvd",
    "color": "#EB6800"
  },
  {
    "a": "Pelham Bay Park",
    "b": "Buhre Av",
    "color": "#009952"
  },
  {
    "a": "Pelham Pkwy (2·5)",
    "b": "Bronx Park East",
    "color": "#009952"
  },
  {
    "a": "Pelham Pkwy (2·5)",
    "b": "Bronx Park East",
    "color": "#D82233"
  },
  {
    "a": "Pelham Pkwy (5)",
    "b": "Morris Park",
    "color": "#009952"
  },
  {
    "a": "Pennsylvania Av",
    "b": "Junius St",
    "color": "#D82233"
  },
  {
    "a": "Pennsylvania Av",
    "b": "Van Siclen Av (3)",
    "color": "#009952"
  },
  {
    "a": "President St-Medgar Evers College",
    "b": "Sterling St",
    "color": "#009952"
  },
  {
    "a": "President St-Medgar Evers College",
    "b": "Sterling St",
    "color": "#D82233"
  },
  {
    "a": "Prince St",
    "b": "Canal St (6·J·N·Q·R·W·Z)",
    "color": "#F6BC26"
  },
  {
    "a": "Prospect Av (2·5)",
    "b": "Jackson Av",
    "color": "#009952"
  },
  {
    "a": "Prospect Av (2·5)",
    "b": "Jackson Av",
    "color": "#D82233"
  },
  {
    "a": "Prospect Av (R)",
    "b": "25 St",
    "color": "#EB6800"
  },
  {
    "a": "Prospect Av (R)",
    "b": "25 St",
    "color": "#F6BC26"
  },
  {
    "a": "Prospect Park",
    "b": "Church Av (B·Q)",
    "color": "#EB6800"
  },
  {
    "a": "Prospect Park",
    "b": "Parkside Av",
    "color": "#F6BC26"
  },
  {
    "a": "Queens Plaza",
    "b": "59 St (4·5·6·N·R·W)",
    "color": "#F6BC26"
  },
  {
    "a": "Queens Plaza",
    "b": "Court Sq",
    "color": "#0062CF"
  },
  {
    "a": "Queens Plaza",
    "b": "Court Sq",
    "color": "#EB6800"
  },
  {
    "a": "Queensboro Plaza",
    "b": "59 St (4·5·6·N·R·W)",
    "color": "#F6BC26"
  },
  {
    "a": "Queensboro Plaza",
    "b": "Court Sq",
    "color": "#9A38A1"
  },
  {
    "a": "Ralph Av",
    "b": "Rockaway Av (C)",
    "color": "#0062CF"
  },
  {
    "a": "Rector St (1)",
    "b": "South Ferry",
    "color": "#D82233"
  },
  {
    "a": "Rector St (R·W)",
    "b": "South Ferry",
    "color": "#F6BC26"
  },
  {
    "a": "Rockaway Av (3)",
    "b": "Junius St",
    "color": "#009952"
  },
  {
    "a": "Rockaway Av (3)",
    "b": "Saratoga Av",
    "color": "#D82233"
  },
  {
    "a": "Rockaway Av (C)",
    "b": "Broadway Junction",
    "color": "#0062CF"
  },
  {
    "a": "Rockaway Blvd",
    "b": "Aqueduct-N Conduit Av",
    "color": "#0062CF"
  },
  {
    "a": "Rockaway Blvd",
    "b": "Aqueduct-N Conduit Av",
    "color": "#7C858C"
  },
  {
    "a": "Rockaway Park-Beach 116 St",
    "b": "Beach 105 St",
    "color": "#0062CF"
  },
  {
    "a": "Roosevelt Island",
    "b": "Lexington Av/63 St",
    "color": "#EB6800"
  },
  {
    "a": "Saratoga Av",
    "b": "Rockaway Av (3)",
    "color": "#009952"
  },
  {
    "a": "Saratoga Av",
    "b": "Sutter Av-Rutland Rd",
    "color": "#D82233"
  },
  {
    "a": "Seneca Av",
    "b": "Forest Av",
    "color": "#EB6800"
  },
  {
    "a": "Sheepshead Bay",
    "b": "Brighton Beach",
    "color": "#EB6800"
  },
  {
    "a": "Sheepshead Bay",
    "b": "Brighton Beach",
    "color": "#F6BC26"
  },
  {
    "a": "Shepherd Av",
    "b": "Euclid Av",
    "color": "#0062CF"
  },
  {
    "a": "Simpson St",
    "b": "Intervale Av",
    "color": "#009952"
  },
  {
    "a": "Simpson St",
    "b": "Intervale Av",
    "color": "#D82233"
  },
  {
    "a": "Smith-9 Sts",
    "b": "4 Av-9 St",
    "color": "#799534"
  },
  {
    "a": "Smith-9 Sts",
    "b": "4 Av-9 St",
    "color": "#EB6800"
  },
  {
    "a": "South Ferry",
    "b": "Borough Hall",
    "color": "#F6BC26"
  },
  {
    "a": "Spring St (6)",
    "b": "Canal St (6·J·N·Q·R·W·Z)",
    "color": "#009952"
  },
  {
    "a": "Spring St (C·E)",
    "b": "Canal St (A·C·E)",
    "color": "#0062CF"
  },
  {
    "a": "St Lawrence Av",
    "b": "Morrison Av-Soundview",
    "color": "#009952"
  },
  {
    "a": "Steinway St",
    "b": "36 St (M·R)",
    "color": "#0062CF"
  },
  {
    "a": "Steinway St",
    "b": "36 St (M·R)",
    "color": "#EB6800"
  },
  {
    "a": "Steinway St",
    "b": "36 St (M·R)",
    "color": "#F6BC26"
  },
  {
    "a": "Sterling St",
    "b": "Winthrop St",
    "color": "#009952"
  },
  {
    "a": "Sterling St",
    "b": "Winthrop St",
    "color": "#D82233"
  },
  {
    "a": "Sutphin Blvd-Archer Av-JFK Airport",
    "b": "111 St (J)",
    "color": "#8E5C33"
  },
  {
    "a": "Sutphin Blvd-Archer Av-JFK Airport",
    "b": "121 St",
    "color": "#8E5C33"
  },
  {
    "a": "Sutphin Blvd-Archer Av-JFK Airport",
    "b": "Jamaica-Van Wyck",
    "color": "#0062CF"
  },
  {
    "a": "Sutphin Blvd",
    "b": "Briarwood",
    "color": "#EB6800"
  },
  {
    "a": "Sutphin Blvd",
    "b": "Parsons Blvd",
    "color": "#0062CF"
  },
  {
    "a": "Sutter Av-Rutland Rd",
    "b": "Crown Hts-Utica Av",
    "color": "#D82233"
  },
  {
    "a": "Sutter Av-Rutland Rd",
    "b": "Saratoga Av",
    "color": "#009952"
  },
  {
    "a": "Sutter Av",
    "b": "Atlantic Av",
    "color": "#7C858C"
  },
  {
    "a": "Times Sq-42 St",
    "b": "34 St-Herald Sq",
    "color": "#F6BC26"
  },
  {
    "a": "Times Sq-42 St",
    "b": "34 St-Hudson Yards",
    "color": "#9A38A1"
  },
  {
    "a": "Times Sq-42 St",
    "b": "34 St-Penn Station (1·2·3)",
    "color": "#D82233"
  },
  {
    "a": "Times Sq-42 St",
    "b": "34 St-Penn Station (A·C·E)",
    "color": "#0062CF"
  },
  {
    "a": "Times Sq-42 St",
    "b": "57 St-7 Av",
    "color": "#F6BC26"
  },
  {
    "a": "Times Sq-42 St",
    "b": "59 St-Columbus Circle",
    "color": "#0062CF"
  },
  {
    "a": "Tremont Av",
    "b": "145 St (A·B·C·D)",
    "color": "#EB6800"
  },
  {
    "a": "Tremont Av",
    "b": "174-175 Sts",
    "color": "#EB6800"
  },
  {
    "a": "Tremont Av",
    "b": "Fordham Rd (B·D)",
    "color": "#EB6800"
  },
  {
    "a": "Union St",
    "b": "4 Av-9 St",
    "color": "#EB6800"
  },
  {
    "a": "Union St",
    "b": "4 Av-9 St",
    "color": "#F6BC26"
  },
  {
    "a": "Utica Av",
    "b": "Nostrand Av (A·C)",
    "color": "#0062CF"
  },
  {
    "a": "Utica Av",
    "b": "Ralph Av",
    "color": "#0062CF"
  },
  {
    "a": "Van Cortlandt Park-242 St",
    "b": "238 St",
    "color": "#D82233"
  },
  {
    "a": "Van Siclen Av (3)",
    "b": "New Lots Av (3)",
    "color": "#009952"
  },
  {
    "a": "Van Siclen Av (3)",
    "b": "Pennsylvania Av",
    "color": "#D82233"
  },
  {
    "a": "Van Siclen Av (C)",
    "b": "Shepherd Av",
    "color": "#0062CF"
  },
  {
    "a": "Van Siclen Av (J·Z)",
    "b": "Alabama Av",
    "color": "#8E5C33"
  },
  {
    "a": "Vernon Blvd-Jackson Av",
    "b": "Grand Central-42 St",
    "color": "#9A38A1"
  },
  {
    "a": "W 4 St-Wash Sq",
    "b": "Bleecker St",
    "color": "#EB6800"
  },
  {
    "a": "W 4 St-Wash Sq",
    "b": "Spring St (C·E)",
    "color": "#0062CF"
  },
  {
    "a": "W 8 St-NY Aquarium",
    "b": "Coney Island-Stillwell Av",
    "color": "#EB6800"
  },
  {
    "a": "W 8 St-NY Aquarium",
    "b": "Coney Island-Stillwell Av",
    "color": "#F6BC26"
  },
  {
    "a": "Wakefield-241 St",
    "b": "Nereid Av",
    "color": "#D82233"
  },
  {
    "a": "Wall St (2·3)",
    "b": "Clark St",
    "color": "#D82233"
  },
  {
    "a": "Wall St (4·5)",
    "b": "Bowling Green",
    "color": "#009952"
  },
  {
    "a": "West Farms Sq-E Tremont Av",
    "b": "174 St",
    "color": "#009952"
  },
  {
    "a": "West Farms Sq-E Tremont Av",
    "b": "174 St",
    "color": "#D82233"
  },
  {
    "a": "Westchester Sq-E Tremont Av",
    "b": "Zerega Av",
    "color": "#009952"
  },
  {
    "a": "Whitlock Av",
    "b": "Hunts Point Av",
    "color": "#009952"
  },
  {
    "a": "Wilson Av",
    "b": "Halsey St (L)",
    "color": "#7C858C"
  },
  {
    "a": "Winthrop St",
    "b": "Church Av (2·5)",
    "color": "#009952"
  },
  {
    "a": "Winthrop St",
    "b": "Church Av (2·5)",
    "color": "#D82233"
  },
  {
    "a": "Woodhaven Blvd (J·Z)",
    "b": "75 St-Elderts Ln",
    "color": "#8E5C33"
  },
  {
    "a": "Woodhaven Blvd (J·Z)",
    "b": "85 St-Forest Pkwy",
    "color": "#8E5C33"
  },
  {
    "a": "Woodhaven Blvd (M·R)",
    "b": "Grand Av-Newtown",
    "color": "#0062CF"
  },
  {
    "a": "Woodhaven Blvd (M·R)",
    "b": "Grand Av-Newtown",
    "color": "#EB6800"
  },
  {
    "a": "Woodhaven Blvd (M·R)",
    "b": "Grand Av-Newtown",
    "color": "#F6BC26"
  },
  {
    "a": "Woodlawn",
    "b": "Mosholu Pkwy",
    "color": "#009952"
  },
  {
    "a": "WTC Cortlandt",
    "b": "Rector St (1)",
    "color": "#D82233"
  },
  {
    "a": "York St",
    "b": "Jay St-MetroTech",
    "color": "#EB6800"
  },
  {
    "a": "Zerega Av",
    "b": "Castle Hill Av",
    "color": "#009952"
  }
];
