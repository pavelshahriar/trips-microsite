-- ============================================================
-- WC26 Predictions — run this in Supabase SQL Editor
-- ============================================================

-- 1. Predictors — one row per logged-in user
create table if not exists predictors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade unique not null,
  display_name text not null,
  emoji       text not null default '⚽',
  avatar_url  text,
  created_at  timestamptz default now()
);

-- 2. Tournament predictions — one row per predictor (submit once)
create table if not exists tournament_predictions (
  id                  uuid primary key default gen_random_uuid(),
  predictor_id        uuid references predictors(id) on delete cascade unique not null,
  world_cup_winner    text,
  golden_boot         text,
  golden_ball         text,
  golden_glove        text,
  best_young_player   text,
  dark_horse          text,
  first_eliminated    text,
  england_exit_round  text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- 3. Match predictions — one row per predictor per match
create table if not exists match_predictions (
  id               uuid primary key default gen_random_uuid(),
  predictor_id     uuid references predictors(id) on delete cascade not null,
  match_id         text not null,   -- e.g. 'houston-germany', 'kc-argentina', 'philly-brazil'
  winner           text,            -- team name or 'draw'
  score_home       int,
  score_away       int,
  first_scorer     text,
  var_controversy  boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(predictor_id, match_id)
);

-- ── Row Level Security ──────────────────────────────────────

alter table predictors           enable row level security;
alter table tournament_predictions enable row level security;
alter table match_predictions    enable row level security;

-- Predictors: anyone can read, only owner can write
create policy "Public read predictors"
  on predictors for select using (true);

create policy "Users insert own predictor"
  on predictors for insert
  with check (auth.uid() = user_id);

create policy "Users update own predictor"
  on predictors for update
  using (auth.uid() = user_id);

-- Tournament predictions: anyone can read, only owner can write
create policy "Public read tournament_predictions"
  on tournament_predictions for select using (true);

create policy "Users insert own tournament_predictions"
  on tournament_predictions for insert
  with check (
    predictor_id in (select id from predictors where user_id = auth.uid())
  );

create policy "Users update own tournament_predictions"
  on tournament_predictions for update
  using (
    predictor_id in (select id from predictors where user_id = auth.uid())
  );

-- Match predictions: anyone can read, only owner can write
create policy "Public read match_predictions"
  on match_predictions for select using (true);

create policy "Users insert own match_predictions"
  on match_predictions for insert
  with check (
    predictor_id in (select id from predictors where user_id = auth.uid())
  );

create policy "Users update own match_predictions"
  on match_predictions for update
  using (
    predictor_id in (select id from predictors where user_id = auth.uid())
  );
