# SpotOn

A geography guessing game. `npm install --legacy-peer-deps`, then `npm run dev`.

## Head to Head

One door on the menu for playing other people, and two games behind it. They
differ in who you're playing, and whether you're playing them now.

**Today's Round** is you against the world, once a day. Pick one of the six games
and you play the same five rounds as everyone else who picked it today, on one
table. Nothing is handed around: the code is worked out from the game and the
date, so two people who choose City Spotter are already on it. One go each, and
it starts again at your midnight.

**Duel a Friend** is you against the people you invited, right now. The host
picks a game, reads out a code, and presses go; from that moment everyone answers
the same round at the same second, with a live table between rounds. When the
five rounds are done there's one table saying who won, and the code is finished —
no standings that go on afterwards.

## One round a day

The day turns over at each player's own midnight, taken from their device's
calendar date. That means a given day's code is live somewhere across a 26-hour
spread rather than switching for everyone at once — Auckland finishes today's
round before London starts it, and both are on the same code. It's how Wordle
does it, and it's what makes the reset land at midnight for everybody instead of
at midnight for one timezone and teatime for another.

A code is a mode letter, a kind letter (`D` for the day's round, `V` for a room),
and five characters. For a daily code those five are a scramble of the day
number, not a hash of it — multiplication by a constant sharing no factor with
the code space, which is one-to-one over that space. So no two days can collide,
rather than merely being unlikely to: `src/lib/match.ts` has the arithmetic. The
seed the rounds are dealt from is a hash of the finished code.

The map settings used to go into the code too, which quietly cut each game into
four tables and put the player who likes the flat map in a different contest from
the player who likes the globe. They're a matter of taste rather than of
difficulty, so they're each player's own now: six games, six tables a day.

Because a code is derived rather than issued, it's also the thing that makes one
go a day stick: there is no second code to mint and play again. And because the
algorithm ships in the bundle, anyone can work out next week's codes and practise
— the game is client-side and self-scored, so this is a leaderboard for people
who want to play, not a contest to defend.

## How a room stays in step

There is no live connection between the players and nothing to reconnect to. The
only thing that travels is the moment the first round opens, written into the
room's row when the host presses go. After that every device works out for itself
which round should be on screen — the rounds are 40 seconds apart, and
the rounds themselves come from the code as they always have.

That means a phone that locks for a minute rejoins the room where the room is,
with the rounds it slept through marked zero, rather than finishing a minute
after everyone has gone. Two devices whose clocks disagree would be a head start,
so the room runs on the server's clock: every Supabase response carries a `Date`,
and `serverNow()` in `src/lib/supabase.ts` is the local clock corrected onto it.

Rounds are filed one at a time as they're marked, which is what puts everyone
else's score on the screen between rounds, and what lets a player who walks off
after round three still count for the three they played.

## The leaderboard and the rooms

The daily table falls back to games finished on the device when there's no
Supabase behind it. Rooms need one outright — they're a shared clock and a list
of who's in, and there's nowhere else for either to live.

1. Create a project at [supabase.com](https://supabase.com) (the free tier is
   ample — a result is four small columns).
2. In the project's SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql).
   It creates the results table and the three small room tables, the policies,
   the unique index that makes a code one attempt per player, and the sweeps
   that clear out finished days and finished rooms. Safe to run again.
3. Copy `.env.example` to `.env` and fill in the project URL and anon key from
   Settings → API. Both are public values; the policies are what protect the
   table. Whatever hosts the built site needs those two variables set at build
   time too.

Without them the app still plays and the Leaderboard tab says so; Duel a Friend
says so too, and won't open a room it has nowhere to put.

### On the host, not just here

`.env` is gitignored, so a host that builds from the repo — Vercel, in our case
— never sees it. Setting it up locally is not setting it up for the people you
send a code to: their bundle is built on the host, and if the variables aren't
there, every score they play is filed to their own browser and nobody can see
anybody. The game looks like it works right up until the standings are empty.

So the two variables have to be set on the host as well, for Production *and*
Preview (a preview build with no leaderboard is a preview of a different game):

```
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

Adding them doesn't rebuild anything — they're baked in at build time, so an
existing deployment carries on without them until you `vercel redeploy`.

To check a live build rather than trust it, look for the project ref in the
served bundle; if it isn't there, neither is the leaderboard:

```
curl -s https://spot0n.vercel.app/assets/index-*.js | grep -c supabase.co
```

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
