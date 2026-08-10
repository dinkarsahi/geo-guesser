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

-- Rooms: a game against people you know, played at the same time.
--
-- The daily table above needs no coordination — everyone plays the same code
-- whenever suits them and the scores meet at the end. A room does: it has to
-- start for four people at once. These three tables are the whole of that
-- coordination, and the only thing that actually passes between the players is
-- `starts_at`. Everything after it each device works out from the clock.

create table if not exists public.duel_rooms (
  code       text primary key check (code ~ '^[0-9A-Z]{7}$'),
  mode       text not null check (
               mode in ('city','flag','currency','company','population','tube',
                        'timezone')),
  -- The host's map, so a room is one contest rather than four.
  flat       boolean not null default false,
  borders    boolean not null default true,
  host       text not null check (char_length(btrim(host)) between 1 and 16),
  -- When round one opens. Null while the room is still filling up.
  starts_at  timestamptz,
  created_at timestamptz not null default now()
);

-- The list of games, restated for a table that already exists.
--
-- "create table if not exists" does nothing at all to a table that's already
-- there, constraints included, so a project set up before a game was added
-- would go on refusing rooms for it — and refuse them from inside Postgres,
-- where the app can only report that the room couldn't be opened. Dropping and
-- re-adding the check is the one statement that's right whether the table was
-- made a minute ago or a year ago.
alter table public.duel_rooms drop constraint if exists duel_rooms_mode_check;
alter table public.duel_rooms add constraint duel_rooms_mode_check
  check (mode in ('city','flag','currency','company','population','tube','timezone'));

create table if not exists public.duel_players (
  id        bigint generated always as identity primary key,
  code      text not null check (code ~ '^[0-9A-Z]{7}$'),
  player    text not null check (char_length(btrim(player)) between 1 and 16),
  joined_at timestamptz not null default now()
);

-- One of each name in a room. Two Sams in one game is two names on one table.
create unique index if not exists duel_players_one_name
  on public.duel_players (code, lower(btrim(player)));

create index if not exists duel_players_room
  on public.duel_players (code, joined_at);

-- A round at a time rather than a game at a time, so the room can see itself
-- between rounds, and so a player who walks off after round three still counts
-- for the three they played.
create table if not exists public.duel_scores (
  id         bigint generated always as identity primary key,
  code       text not null check (code ~ '^[0-9A-Z]{7}$'),
  player     text not null check (char_length(btrim(player)) between 1 and 16),
  round      smallint not null check (round between 1 and 20),
  score      integer not null check (score between 0 and 100),
  ms         integer not null check (ms >= 0),
  created_at timestamptz not null default now()
);

-- One score per round per player: the lock that makes a round final, and what
-- makes a reload during a room harmless rather than a second score.
create unique index if not exists duel_scores_one_go
  on public.duel_scores (code, lower(btrim(player)), round);

create index if not exists duel_scores_room on public.duel_scores (code);

alter table public.duel_rooms   enable row level security;
alter table public.duel_players enable row level security;
alter table public.duel_scores  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['duel_rooms', 'duel_players', 'duel_scores'] loop
    execute format('drop policy if exists "read the room" on public.%I', t);
    execute format(
      'create policy "read the room" on public.%I for select to anon, authenticated using (true)', t);
    -- Dropped on all three, re-made on two: the list of players is the one
    -- insert here with a condition on it, and it is written out below.
    execute format('drop policy if exists "join the room" on public.%I', t);
  end loop;
  foreach t in array array['duel_rooms', 'duel_scores'] loop
    execute format(
      'create policy "join the room" on public.%I for insert to anon, authenticated with check (true)', t);
  end loop;
end $$;

-- A room takes its players before it starts, and not during.
--
-- A duel's rounds turn over on everyone's screen at once, and a round closes
-- early only when every player in the room has answered it. So somebody who
-- types the code in at round three isn't merely behind: they are two rounds
-- nobody can close, and the other players sit out the full thirty seconds of
-- every remaining round waiting for answers that aren't coming.
--
-- Said here rather than only on the join screen because that screen is working
-- from a room it fetched up to a poll and a half ago. Join and Start pressed in
-- the same second are decided by the row, which is the only thing both devices
-- can see.
create policy "join the room"
  on public.duel_players for insert
  to anon, authenticated
  with check (exists (
    select 1 from public.duel_rooms r
    where r.code = duel_players.code and r.starts_at is null));

-- Starting a room is the one update anything here is allowed to make, and only
-- on a room that hasn't started: once a moment is written down, four people are
-- counting on it, and moving it would drop them into different rounds.
--
-- The column grant is what keeps this to `starts_at` alone — RLS decides which
-- rows may be touched, not which columns, and Supabase grants update on every
-- column of a new table by default.
revoke update on public.duel_rooms from anon, authenticated;
grant update (starts_at) on public.duel_rooms to anon, authenticated;

drop policy if exists "start the room" on public.duel_rooms;
create policy "start the room"
  on public.duel_rooms for update
  to anon, authenticated
  using (starts_at is null)
  with check (starts_at is not null);

-- Clearing out finished days.
--
-- A code lasts until the player's own midnight, so one day's code is live
-- somewhere in the world across a 26-hour spread — from the first midnight in
-- Kiribati to the last in Baker Island. A sweep at any particular hour would
-- therefore catch a table somebody is still playing. Waiting 48 hours from the
-- row rather than firing at a wall-clock time clears the gap with room over,
-- and needs no notion of whose day it was.
--
-- Note this deletes through the policies above rather than around them: cron
-- runs as the table's owner, which is also why there's still no delete policy
-- for the anon key to reach.
create extension if not exists pg_cron;

select cron.unschedule('sweep-old-match-results')
where exists (select 1 from cron.job where jobname = 'sweep-old-match-results');

select cron.schedule(
  'sweep-old-match-results',
  '17 * * * *',
  $$delete from public.match_results where created_at < now() - interval '48 hours'$$
);

-- Rooms are shorter-lived than days: five rounds is under four minutes, and a
-- room that never started is a code somebody typed once. An hour is generous
-- either way, and a code that outlives its game is a code that can be typed
-- into by mistake.
select cron.unschedule('sweep-old-duels')
where exists (select 1 from cron.job where jobname = 'sweep-old-duels');

select cron.schedule(
  'sweep-old-duels',
  '23 * * * *',
  $$
  delete from public.duel_scores  where created_at < now() - interval '3 hours';
  delete from public.duel_players where joined_at  < now() - interval '3 hours';
  delete from public.duel_rooms   where created_at < now() - interval '3 hours';
  $$
);
