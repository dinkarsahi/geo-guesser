import { CONTACT_EMAIL, DATA_REGION, POLICY_UPDATED } from "../lib/site";

/**
 * What SpotOn knows about the people who play it.
 *
 * Written from the code rather than from a template: every claim below is
 * something the app actually does, and the browser keys are named one by one
 * because those are the ones that exist. A policy that lists cookies the site
 * doesn't set, or omits the ones it does, is worse than none — it is the one
 * document on the site that has to be checkable. **Store something new and
 * this page is part of that change**, count and all.
 *
 * Kept in plain English on purpose. The reader is somebody who typed a name
 * into a box to play a geography game, and the honest summary of their position
 * is short enough to say in a sentence.
 */
export default function Privacy() {
  const mailto = `mailto:${CONTACT_EMAIL}`;

  return (
    <div className="menu doc">
      <h1>Privacy</h1>
      <p className="muted menu-sub">
        No accounts, no sign-in, no tracking. The only thing SpotOn asks you for is a
        name to put on a leaderboard.
      </p>

      <div className="doc-body">
        <p className="doc-updated">Last updated {POLICY_UPDATED}</p>

        <section className="doc-section">
          <h2>Who we are</h2>
          <p>
            SpotOn is a geography game. We are responsible for the information described
            below. Anything to do with it — a question, a correction, a request to remove
            a score — goes to <a href={mailto}>{CONTACT_EMAIL}</a>, and that is the only
            address we use.
          </p>
        </section>

        <section className="doc-section">
          <h2>What you give us</h2>
          <p>
            When you finish a round that goes on a table — Today's Round, or a duel with
            friends — we file <strong>the name you typed</strong>, your score, how long
            each round took, and the code of the game you played. That is the whole of it.
          </p>
          <p>
            <strong>Those names are public.</strong> A leaderboard is a list of names and
            scores, and anyone who opens that game's table can read it. Nothing here needs
            your real name, and a nickname works exactly as well.
          </p>
          <p>
            Playing on your own, from All Games, files nothing anywhere. There is no
            account to make and no email address to give us.
          </p>
        </section>

        <section className="doc-section">
          <h2>What your own browser keeps</h2>
          <p>
            SpotOn stores six things on your device, and they stay there — they are not
            sent anywhere except as described above:
          </p>
          <ul className="doc-bullets">
            <li>
              <code>spoton.player</code> — the name you last played under, so you don't
              have to type it again.
            </li>
            <li>
              <code>spoton.results.v2</code> — the results this device has seen, so a
              table can still be shown when the network can't be reached.
            </li>
            <li>
              <code>spoton.played.v1</code> — which rounds this device has finished, which
              is what makes Today's Round one go a day.
            </li>
            <li>
              <code>spoton.rooms.v1</code> — the name this device joined each duel under,
              so a reloaded page can return to the room it was in.
            </li>
            <li>
              <code>spoton.prefs.v1</code> — whether you play on the globe or the flat
              map, whether borders are drawn, and whether the tube map is white or
              dark, so you aren't asked every game.
            </li>
            <li>
              <code>spoton.draw.v2</code> — the day you last watched Today's Round
              being drawn, so the animation plays once a day and a reload before you
              have played goes straight to the game it landed on.
            </li>
          </ul>
          <p>
            All six are needed for the game to work, so they are set without asking.
            Clearing your browser's data for this site removes them, and the game will
            treat you as a first-time visitor.
          </p>
        </section>

        <section className="doc-section">
          <h2>What other companies see</h2>
          <p>
            Our host and our database keep the ordinary technical logs any website keeps,
            which include IP addresses, in order to serve the site and keep it secure. The
            scores themselves are held in a database in {DATA_REGION}.
          </p>
          <p>
            The maps, flags and logos you see are fetched by your browser directly from
            the services that publish them — NASA's imagery service, jsDelivr, flagcdn.com
            and Simple Icons. As with any image on any website, those services can see the
            request your browser makes, including your IP address.
          </p>
        </section>

        <section className="doc-section">
          <h2>Advertising</h2>
          <p>
            SpotOn carries advertising. Third-party vendors, including Google, use cookies
            to serve ads based on your previous visits to this site and to other sites.
          </p>
          <p>
            You can turn off personalised advertising in{" "}
            <a href="https://myadcenter.google.com/">Google's ad settings</a>, or opt out
            of other vendors' advertising cookies at{" "}
            <a href="https://www.aboutads.info/choices/">aboutads.info</a>. If you are in
            the UK, the EEA or Switzerland, you will be asked to make a choice before any
            advertising cookies are set, and you can change that choice at any time.
          </p>
        </section>

        <section className="doc-section">
          <h2>Why we are allowed to hold it</h2>
          <p>
            The names and scores are held on the basis of our legitimate interest in
            running a leaderboard, which is the point of the game and cannot be done
            without them. Advertising cookies are set on the basis of your consent, which
            is what the banner asks for.
          </p>
        </section>

        <section className="doc-section">
          <h2>How long we keep it</h2>
          <p>
            A filed score stays on its table indefinitely, so that a game can be looked up
            afterwards. Ask us and we will remove yours.
          </p>
        </section>

        <section className="doc-section">
          <h2>Removing a score</h2>
          <p>
            <strong>Nothing in SpotOn can edit or delete a score once it is filed.</strong>{" "}
            That is deliberate — it is what makes a leaderboard final — so removal is done
            by hand rather than by a button.
          </p>
          <p>
            Email <a href={mailto}>{CONTACT_EMAIL}</a> with the name you played under and
            roughly when you played, and we will delete the entry. The same address is
            where to write if you want to know what we hold about you, have it corrected,
            or object to our holding it at all.
          </p>
          <p>
            If you think we have got this wrong, you can complain to the Information
            Commissioner's Office at <a href="https://ico.org.uk/">ico.org.uk</a>, or to
            the data protection authority where you live.
          </p>
        </section>

        <section className="doc-section">
          <h2>Children</h2>
          <p>
            SpotOn is not directed at children under 13, and we do not knowingly collect
            anything from them. If a child has put a name on a table and you would like it
            taken off, write to <a href={mailto}>{CONTACT_EMAIL}</a> and we will remove it.
          </p>
        </section>

        <section className="doc-section">
          <h2>Changes</h2>
          <p>
            If this policy changes, the date at the top changes with it. There is no
            mailing list to notify, because we don't have your email address.
          </p>
        </section>
      </div>
    </div>
  );
}
