import { CONTACT_EMAIL, POLICY_UPDATED } from "../lib/site";

interface TermsProps {
  /** The other two pages this one keeps pointing at. */
  onPrivacy: () => void;
  onCredits: () => void;
}

/**
 * The rules for using SpotOn.
 *
 * Not a stated AdSense requirement, and here anyway for two reasons. It is
 * what every site with a privacy policy also has, and its absence reads as a
 * site that has not been thought about. And it is the only place a rule about
 * **leaderboard names** can be written down: the game asks for a name and puts
 * it on a table the whole world can read, and without a line saying so there
 * is nothing but manners between a stranger and an obscenity at the top of
 * Today's Round.
 *
 * Short, and in the same plain English as the privacy policy. The reader is
 * somebody who typed a name into a box to play a geography game, and a page of
 * defined terms and clause numbers would be a costume rather than a document.
 * Everything here is either true of the app today or a thing we would actually
 * do — a term nobody intends to enforce is worse than no term.
 */
export default function Terms({ onPrivacy, onCredits }: TermsProps) {
  const mailto = `mailto:${CONTACT_EMAIL}`;

  return (
    <div className="menu doc">
      <h1>Terms of use</h1>
      <p className="muted menu-sub">
        The short version: play fair, pick a name you would not mind a stranger
        reading, and understand that a game about geography is not a guarantee
        about geography.
      </p>

      <div className="doc-body">
        <p className="doc-updated">Last updated {POLICY_UPDATED}</p>

        <section className="doc-section">
          <h2>Using SpotOn</h2>
          <p>
            SpotOn is free to play and needs no account. By using it you agree to
            these terms. If you do not, please do not use the site.
          </p>
          <p>
            You may play as much as you like, and link to any page here. Please do
            not try to break the site, interfere with other players' games, or
            automate play in order to put false scores on a leaderboard.
          </p>
        </section>

        <section className="doc-section">
          <h2>The name you play under</h2>
          <p>
            Scores on Today's Round and in a duel are filed with{" "}
            <strong>the name you type</strong>, and those tables are public — see{" "}
            <button className="doc-link" onClick={onPrivacy}>Privacy</button>. Choose accordingly: a nickname works
            exactly as well as a real name.
          </p>
          <p>
            <strong>We may remove any name we judge offensive,</strong> impersonating,
            or otherwise unsuitable for a table anybody might read, and we may remove
            a score we believe was not honestly played for. There is no appeal
            process, because there is no account to appeal from — but if you think we
            have got it wrong, write to us.
          </p>
        </section>

        <section className="doc-section">
          <h2>What the game is worth</h2>
          <p>
            SpotOn is a game, not a reference work. The distances, borders, fare
            zones, populations, head offices and time zones behind it come from
            public data sources named on the <button className="doc-link" onClick={onCredits}>Credits</button> page, and
            may be out of date or simply wrong. <strong>Do not rely on anything here
            for navigation, travel, business or any other real decision.</strong>
          </p>
          <p>
            The site is provided as it is, without warranty of any kind. We do not
            promise it will be available, that scores will be preserved, or that a
            game will work on every device. We may change or withdraw any part of it
            at any time — including the games, the leaderboards and these terms.
          </p>
          <p>
            Nothing in these terms limits liability for death or personal injury
            caused by negligence, for fraud, or for anything else that cannot be
            limited by law.
          </p>
        </section>

        <section className="doc-section">
          <h2>What belongs to other people</h2>
          <p>
            The game itself is ours. A good deal of what it draws is not: the
            satellite imagery, the country shapes, the London Underground data, the
            flags, the brand marks and the open source it is built on all belong to
            others and are used under their own licences. Those are set out on the{" "}
            <button className="doc-link" onClick={onCredits}>Credits</button> page, and using SpotOn does not give you
            any rights in them.
          </p>
          <p>
            Company names, logos and trade marks shown in Corporate HQ Spotter are
            the property of their owners. SpotOn is not affiliated with, endorsed by
            or sponsored by any company, transport authority or agency shown.
          </p>
        </section>

        <section className="doc-section">
          <h2>Advertising</h2>
          <p>
            SpotOn carries advertising, which is what pays for it. The adverts come
            from third parties and we do not control or endorse what they show or
            what they link to. How advertising affects your privacy is described on
            the <button className="doc-link" onClick={onPrivacy}>Privacy</button> page.
          </p>
        </section>

        <section className="doc-section">
          <h2>Which law applies</h2>
          <p>
            These terms are governed by the law of England and Wales, and the courts
            of England and Wales have jurisdiction. If you are a consumer elsewhere,
            this does not take away rights your own country's law gives you.
          </p>
        </section>

        <section className="doc-section">
          <h2>Getting in touch</h2>
          <p>
            Everything — a question, a complaint, a name to remove — goes to{" "}
            <a href={mailto}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
