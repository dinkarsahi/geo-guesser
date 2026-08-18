/**
 * The facts about the site itself, as opposed to the game.
 *
 * One place, because they appear in several: the address is printed on the
 * privacy page, offered in the footer, and named as the way to have a score
 * removed. An address that says one thing in the footer and another in the
 * policy is the sort of mistake nobody notices until a request goes nowhere.
 */

/** Where anything about the site goes — questions, and erasure requests. */
export const CONTACT_EMAIL = "contactus@playspoton.com";

/**
 * When the privacy policy last changed, printed at the top of it.
 *
 * Written by hand rather than taken from the build date: it is a statement
 * about when the *terms* last moved, and a date that ticks forward on every
 * deployment tells the reader nothing and quietly claims something untrue.
 * Change it when the words change.
 */
export const POLICY_UPDATED = "18 August 2026";

/**
 * Where the scores are kept, in the terms a privacy policy has to use.
 *
 * The Supabase project is in `eu-central-1`, which is Frankfurt. It matters to
 * a reader in the UK or the EU, and it is the one detail of the hosting that a
 * policy is actually required to be specific about.
 */
export const DATA_REGION = "the European Union (Frankfurt, Germany)";
