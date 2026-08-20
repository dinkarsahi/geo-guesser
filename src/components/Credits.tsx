/**
 * Where everything in SpotOn came from.
 *
 * Four of the credits below are owed rather than offered — NASA's imagery asks
 * for its line, Transport for London's open data asks for its, and the MIT and
 * ISC licences on the code require their notices to travel with anything built
 * on them. The rest are here because a page that names only the sources that
 * can insist is a worse page than one that names them all.
 *
 * It is a page rather than a corner of a map: a credit drawn on the map is on
 * screen for the length of a round, and somebody who goes looking afterwards
 * needs an address to look at.
 */

/** The libraries the game is built on, with the notices their licences require. */
const SOFTWARE: { name: string; licence: string; holder: string }[] = [
  { name: "React and React DOM", licence: "MIT", holder: "Meta Platforms, Inc. and affiliates" },
  { name: "three.js", licence: "MIT", holder: "2010–2026 three.js authors" },
  { name: "react-globe.gl", licence: "MIT", holder: "2019 Vasco Asturiano" },
  { name: "react-simple-maps", licence: "MIT", holder: "2017 Richard Zimerman" },
  { name: "prop-types", licence: "MIT", holder: "2013–present, Facebook, Inc." },
  { name: "d3-geo", licence: "ISC", holder: "2010–2024 Mike Bostock" },
];

interface CreditsProps {
  onAbout: () => void;
}

export default function Credits({ onAbout }: CreditsProps) {
  return (
    <div className="menu doc">
      <h1>Credits</h1>
      <p className="muted menu-sub">
        SpotOn is built on other people's maps, measurements and code. This is who they
        belong to.
      </p>

      <div className="doc-body">
        <section className="doc-section">
          <h2>The world</h2>
          <p>
            <strong>Satellite imagery courtesy of NASA EOSDIS GIBS.</strong> Both world
            maps draw NASA's Blue Marble imagery, served as tiles from the Global Imagery
            Browse Services. NASA's imagery is free to use and NASA does not endorse
            SpotOn.
          </p>
          <p>
            <strong>Country shapes from Natural Earth.</strong> Every border, coastline
            and country outline in the game — and the point each country is measured to —
            comes from the Natural Earth 1:50m public domain dataset.
          </p>
        </section>

        <section className="doc-section">
          <h2>The Underground</h2>
          <p>
            <strong>Data provided by Transport for London.</strong> The station names,
            positions, fare zones and line assignments behind Tube Station Spotter
            originate in TfL's open data.
          </p>
          <p>
            SpotOn is not affiliated with, endorsed by or sponsored by Transport for
            London. The map it draws is built from the stations' own coordinates and is
            not TfL's diagram; line names and colours are used to identify the real
            lines. The borough outlines behind the network are drawn from openly
            published boundary data.
          </p>
        </section>

        <section className="doc-section">
          <h2>Flags and logos</h2>
          <p>
            <strong>
              Company names and logos are trademarks of their respective owners.
            </strong>{" "}
            SpotOn is not affiliated with, endorsed by or sponsored by any company shown
            in Corporate HQ Spotter. The logos are used only to identify the companies
            the game asks about.
          </p>
          <p>
            The brand marks come from the Simple Icons project, released into the public
            domain under CC0. National flags are served by flagcdn.com.
          </p>
        </section>

        <section className="doc-section">
          <h2>The code</h2>
          <p>
            SpotOn is built with the following open source software, whose licences
            require the notices below to be included.
          </p>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Licence</th>
                  <th>Copyright</th>
                </tr>
              </thead>
              <tbody>
                {SOFTWARE.map((s) => (
                  <tr key={s.name}>
                    <th scope="row">{s.name}</th>
                    <td>{s.licence}</td>
                    <td>© {s.holder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="doc-licence">
            <strong>The MIT Licence.</strong> Permission is hereby granted, free of
            charge, to any person obtaining a copy of this software and associated
            documentation files (the "Software"), to deal in the Software without
            restriction, including without limitation the rights to use, copy, modify,
            merge, publish, distribute, sublicense, and/or sell copies of the Software,
            and to permit persons to whom the Software is furnished to do so, subject to
            the following conditions: the above copyright notice and this permission
            notice shall be included in all copies or substantial portions of the
            Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
            EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
            OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
            ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
            DEALINGS IN THE SOFTWARE.
          </p>
          <p className="doc-licence">
            <strong>The ISC Licence.</strong> Permission to use, copy, modify, and/or
            distribute this software for any purpose with or without fee is hereby
            granted, provided that the above copyright notice and this permission notice
            appear in all copies. THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR
            DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
            WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE
            LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY
            DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
            ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
            CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
          </p>
        </section>

        <section className="doc-section">
          <h2>Everything else</h2>
          <p>
            The questions, the scoring, the maps as drawn and the games themselves are
            SpotOn's own. Country facts, city coordinates, populations, currencies and
            time zones are compiled from public sources.
          </p>
          <p>
            <button className="btn btn-ghost" onClick={onAbout}>
              How the game works
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
