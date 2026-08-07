# SpotOn

A geography guessing game. `npm install --legacy-peer-deps`, then `npm run dev`.

## The head-to-head leaderboard

Head to Head works without any of this — codes are self-contained, and standings
fall back to games finished on the device. Setting up Supabase is what makes the
standings shared, so two people racing on two phones see each other, and what
makes a code one go each.

1. Create a project at [supabase.com](https://supabase.com) (the free tier is
   ample — a result is four small columns).
2. In the project's SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql).
   It creates the table, the policies, and the unique index that makes a code
   one attempt per player.
3. Copy `.env.example` to `.env` and fill in the project URL and anon key from
   Settings → API. Both are public values; the policies are what protect the
   table. Whatever hosts the built site needs those two variables set at build
   time too.

Without them the app builds and runs exactly as before, and the Leaderboard tab
says so.

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
