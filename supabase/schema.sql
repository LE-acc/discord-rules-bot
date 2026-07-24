-- ═══════════════════════════════════════════════════════════════
-- NutriAI — PostgreSQL / Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Every table is owned by a user and protected by Row-Level Security.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  name          text,
  avatar_url    text,
  locale        text not null default 'ar' check (locale in ('ar','en')),
  theme         text not null default 'dark' check (theme in ('light','dark','system')),
  height_cm     numeric,
  age           int,
  sex           text check (sex in ('male','female')),
  activity_level text default 'light',
  week_start    text not null default 'sunday' check (week_start in ('sunday','monday')),
  -- Goals
  goal_calories int not null default 2200,
  goal_protein  int not null default 160,
  goal_carbs    int not null default 220,
  goal_fat      int not null default 70,
  goal_fiber    int not null default 30,
  goal_water    int not null default 3000,
  goal_steps    int not null default 8000,
  weight_start  numeric default 90,
  weight_target numeric default 77,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Meals ─────────────────────────────────────────────────────
create table if not exists public.meals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null check (category in ('breakfast','lunch','dinner','snack')),
  items       jsonb not null default '[]',   -- array of FoodItem
  calories    numeric not null default 0,
  protein     numeric not null default 0,
  carbs       numeric not null default 0,
  fat         numeric not null default 0,
  fiber       numeric not null default 0,
  sugar       numeric not null default 0,
  sodium      numeric not null default 0,
  source      text not null default 'chat' check (source in ('chat','photo','voice','barcode','search','manual')),
  confidence  numeric not null default 0.9,
  note        text,
  image_url   text,
  logged_at   timestamptz not null default now()
);
create index if not exists meals_user_date_idx on public.meals (user_id, logged_at desc);

-- ── Weight entries ────────────────────────────────────────────
create table if not exists public.weight_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  weight      numeric not null,
  body_fat    numeric,
  note        text,
  photo_url   text,
  recorded_at date not null default current_date
);
create index if not exists weight_user_idx on public.weight_entries (user_id, recorded_at desc);

-- ── Body measurements ─────────────────────────────────────────
create table if not exists public.body_measurements (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  waist numeric, chest numeric, hips numeric, arms numeric, thighs numeric,
  recorded_at date not null default current_date
);

-- ── Exercises ─────────────────────────────────────────────────
create table if not exists public.exercises (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null check (type in ('gym','walking','running','cycling','swimming','other')),
  name            text not null,
  duration_min    int not null,
  distance_km     numeric,
  calories_burned int not null default 0,
  logged_at       timestamptz not null default now()
);
create index if not exists exercises_user_idx on public.exercises (user_id, logged_at desc);

-- ── Daily metrics (water + steps) ─────────────────────────────
create table if not exists public.daily_metrics (
  user_id uuid not null references auth.users(id) on delete cascade,
  date    date not null default current_date,
  water   int not null default 0,   -- ml
  steps   int not null default 0,
  primary key (user_id, date)
);

-- ── Chat history ──────────────────────────────────────────────
create table if not exists public.chat_messages (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  image_url  text,
  meal_id    uuid references public.meals(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists chat_user_idx on public.chat_messages (user_id, created_at);

-- ── Fasting sessions ──────────────────────────────────────────
create table if not exists public.fasting_sessions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  protocol      text not null,
  fasting_hours int not null,
  eating_hours  int not null,
  started_at    timestamptz not null default now(),
  ends_at       timestamptz not null,
  completed     boolean not null default false
);

-- ── Custom foods & favourites ─────────────────────────────────
create table if not exists public.custom_foods (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  name      text not null,
  name_ar   text,
  brand     text,
  serving   numeric not null default 100,
  calories numeric, protein numeric, carbs numeric, fat numeric,
  fiber numeric, sugar numeric, sodium numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, food_id)
);

-- ── Client state snapshot (local-first multi-device sync) ──────
-- The PWA is local-first; this table lets an authenticated user sync
-- their full local state across devices with a single debounced upsert.
-- The granular relational tables above remain available for server-side
-- analytics, exports, and integrations.
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- Row-Level Security: users only ever touch their own data.
-- ═══════════════════════════════════════════════════════════════
alter table public.profiles          enable row level security;
alter table public.meals             enable row level security;
alter table public.weight_entries    enable row level security;
alter table public.body_measurements enable row level security;
alter table public.exercises         enable row level security;
alter table public.daily_metrics     enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.fasting_sessions  enable row level security;
alter table public.custom_foods      enable row level security;
alter table public.favorites         enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','meals','weight_entries','body_measurements','exercises',
    'daily_metrics','chat_messages','fasting_sessions','custom_foods','favorites','user_state'
  ]
  loop
    execute format('drop policy if exists "own_select" on public.%I;', t);
    execute format('drop policy if exists "own_insert" on public.%I;', t);
    execute format('drop policy if exists "own_update" on public.%I;', t);
    execute format('drop policy if exists "own_delete" on public.%I;', t);

    if t = 'profiles' then
      execute 'create policy "own_select" on public.profiles for select using (auth.uid() = id);';
      execute 'create policy "own_insert" on public.profiles for insert with check (auth.uid() = id);';
      execute 'create policy "own_update" on public.profiles for update using (auth.uid() = id);';
    else
      execute format('create policy "own_select" on public.%I for select using (auth.uid() = user_id);', t);
      execute format('create policy "own_insert" on public.%I for insert with check (auth.uid() = user_id);', t);
      execute format('create policy "own_update" on public.%I for update using (auth.uid() = user_id);', t);
      execute format('create policy "own_delete" on public.%I for delete using (auth.uid() = user_id);', t);
    end if;
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- Auto-provision a profile row on sign-up.
-- ═══════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage buckets for meal photos & progress photos (run once).
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true), ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;
