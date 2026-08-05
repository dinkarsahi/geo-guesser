const KEY = "spoton.player";

/**
 * What this player calls themselves, kept between visits.
 *
 * A name is the whole of what this app knows about who is playing: there are
 * no accounts to sign into and nowhere to store one if there were. It exists
 * so a table of scores can say who is leading, and it never leaves the device
 * except inside a result line the player sends themselves.
 */
export function loadName(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    // Private browsing, or storage turned off. A name is a convenience, not a
    // requirement — the player can simply type it again.
    return "";
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(KEY, name);
  } catch {
    /* see above */
  }
}
