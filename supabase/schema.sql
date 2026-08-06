-- The leaderboard: one table, and the rules that make a code one attempt.
--
-- Run this once against a fresh Supabase project (SQL Editor → New query →
-- paste → Run). Safe to run again; every statement checks first.
--
-- The client reaches this with the anon key, which ships in the bundle and is
-- meant to be public. What that key can do is entirely what the policies below
-- allow: read the standings, and file a result. Nothing can update or delete a
-- row, which is what makes a score final once it's up.

create table if not exists public.match_results (
  id         bigint generated always as identity primary key,
  -- The match code as it's read out: mode letter, setup letter, five of seed.
  code       text not null check (code ~ '^[0-9A-Z]{7}$'),
  player     text not null check (char_length(btrim(player)) between 1 and 16),
  -- A match's mark: the average of its rounds, out of the same 100 each round
  -- is marked out of.
  score      integer not null check (score between 0 and 100),
  ms         integer not null check (ms >= 0),
  created_at timestamptz not null default now()
);

-- One go per player per code. This is the lock: a second finish under the same
-- name is refused by Postgres, so it holds however the player got there —
-- reloading the page, clearing their browser, or coming back on another phone.
-- Case- and space-insensitive, because "Sam" and "sam " are one person.
create unique index if not exists match_results_one_go
  on public.match_results (code, lower(btrim(player)));

-- How a board is read: everyone on a code, best score first, ties to whoever
-- was quicker.
create index if not exists match_results_board
  on public.match_results (code, score desc, ms asc);

alter table public.match_results enable row level security;

-- A leaderboard nobody can read isn't one. Codes are 7 characters from a
-- 31-letter alphabet, so they aren't guessable in practice, but note that
-- anyone holding a code can read its table — which is the point of it.
drop policy if exists "read the standings" on public.match_results;
create policy "read the standings"
  on public.match_results for select
  to anon, authenticated
  using (true);

-- Filing a result. There is no auth in this game and nothing to check a name
-- against, so this is open; the unique index above is what stops the same
-- player filing twice, and the absence of an update or delete policy is what
-- stops anyone touching a score that's already up.
drop policy if exists "file a result" on public.match_results;
create policy "file a result"
  on public.match_results for insert
  to anon, authenticated
  with check (true);
