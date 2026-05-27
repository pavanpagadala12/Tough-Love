-- ═══════════════════════════════════════════════════════════════════
--  Tough Love — Supabase Schema (v1)
--  Run this in the Supabase SQL editor for your project.
--  All changes are additive. Never DROP columns or tables.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── Shared helper: auto-update updated_at ─────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ───────────────────────────────────────────────────────────────────
--  profiles  (1:1 with auth.users, auto-created on signup)
-- ───────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,

  display_name  text,
  timezone      text        not null default 'UTC',
  locale        text        not null default 'en',
  time_format   text        not null default '12h'
    check (time_format in ('12h', '24h')),

  onboarding_completed boolean not null default false,

  -- Step 1 of two-step consent (set on onboarding screen 2).
  -- Step 2 is per-goal on the goals table.
  consent_letter        boolean not null default false,
  consent_reality_check boolean not null default false,
  consent_witness       boolean not null default false,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ───────────────────────────────────────────────────────────────────
--  goals
-- ───────────────────────────────────────────────────────────────────
create table public.goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,

  title       text not null,
  description text,

  due_at                  timestamptz,
  target_duration_minutes int,

  status      text not null default 'active'
    check (status in ('active', 'completed', 'failed', 'paused')),

  -- Stake Pyramid level shown during goal creation
  --   willpower = just you  |  reputation = with a witness  |  future = money (v2)
  stake_level text not null default 'willpower'
    check (stake_level in ('willpower', 'reputation', 'future')),

  -- 'daily'    = repeating habit with streak tracking
  -- 'one_time' = single commitment with optional due date
  cadence text not null default 'daily'
    check (cadence in ('daily', 'one_time')),

  -- Step 2 of two-step consent: user must also have consent_* = true in profiles
  stick_letter        boolean not null default false,
  stick_reality_check boolean not null default false,
  stick_witness       boolean not null default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "goals: all own" on public.goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger goals_updated_at
  before update on public.goals
  for each row execute function set_updated_at();


-- ───────────────────────────────────────────────────────────────────
--  goal_sessions  (one row per attempt on a goal)
-- ───────────────────────────────────────────────────────────────────
create table public.goal_sessions (
  id          uuid primary key default uuid_generate_v4(),
  goal_id     uuid not null references public.goals on delete cascade,
  user_id     uuid not null references public.profiles on delete cascade,

  started_at  timestamptz not null default now(),
  ended_at    timestamptz,

  outcome     text not null default 'in_progress'
    check (outcome in ('in_progress', 'completed', 'failed')),

  streak_insurance_used boolean not null default false,
  notes       text,

  created_at  timestamptz not null default now()
);

alter table public.goal_sessions enable row level security;

create policy "goal_sessions: all own" on public.goal_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
--  streaks  (one row per goal; upserted on session outcome)
-- ───────────────────────────────────────────────────────────────────
create table public.streaks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  goal_id         uuid not null references public.goals on delete cascade,

  current_streak  int not null default 0,
  longest_streak  int not null default 0,
  last_completed_at timestamptz,

  -- 'YYYY-MM' of the month when Streak Insurance was last used.
  -- Null means it has never been used (or was reset to a new month).
  insurance_used_month text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (user_id, goal_id)
);

alter table public.streaks enable row level security;

create policy "streaks: all own" on public.streaks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger streaks_updated_at
  before update on public.streaks
  for each row execute function set_updated_at();


-- ───────────────────────────────────────────────────────────────────
--  letters  (Letter to Future You)
--  On goal failure: set content = null, deleted_at = now()
--  The record stays so the user can see the letter existed.
-- ───────────────────────────────────────────────────────────────────
create table public.letters (
  id         uuid primary key default uuid_generate_v4(),
  goal_id    uuid not null references public.goals on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,

  content    text,           -- nulled on failure (deleted unread)
  deleted_at timestamptz,   -- set simultaneously with content nulling

  created_at timestamptz not null default now()
);

alter table public.letters enable row level security;

create policy "letters: all own" on public.letters
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
--  witnesses  (Witness Mode — one nominated contact per goal)
-- ───────────────────────────────────────────────────────────────────
create table public.witnesses (
  id            uuid primary key default uuid_generate_v4(),
  goal_id       uuid not null references public.goals on delete cascade,
  user_id       uuid not null references public.profiles on delete cascade,

  witness_name  text not null,
  witness_email text not null,
  notified_at   timestamptz,   -- set when failure notification is sent

  created_at    timestamptz not null default now()
);

alter table public.witnesses enable row level security;

create policy "witnesses: all own" on public.witnesses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
--  time_bank_entries  (Time Bank — earned guilt-free scroll minutes)
--  positive minutes = earned  |  negative minutes = spent
-- ───────────────────────────────────────────────────────────────────
create table public.time_bank_entries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  goal_id    uuid references public.goals,  -- nullable; some credits are global

  minutes    int  not null,
  reason     text not null,

  created_at timestamptz not null default now()
);

alter table public.time_bank_entries enable row level security;

create policy "time_bank: all own" on public.time_bank_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
--  push_subscriptions  (Web Push API)
-- ───────────────────────────────────────────────────────────────────
create table public.push_subscriptions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles on delete cascade,

  -- Full PushSubscription JSON from navigator.serviceWorker.pushManager
  subscription jsonb not null,

  created_at   timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- Functional expressions can't be inline UNIQUE constraints; use an index instead
create unique index push_subscriptions_user_endpoint_idx
  on public.push_subscriptions (user_id, (subscription->>'endpoint'));

create policy "push_subscriptions: all own" on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
--  world_clock_locations  (user's saved cities)
-- ───────────────────────────────────────────────────────────────────
create table public.world_clock_locations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,

  label       text not null,   -- display name, e.g. "London"
  timezone    text not null,   -- IANA tz string, e.g. "Europe/London"
  sort_order  int  not null default 0,

  created_at  timestamptz not null default now()
);

alter table public.world_clock_locations enable row level security;

create policy "world_clock_locations: all own" on public.world_clock_locations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ───────────────────────────────────────────────────────────────────
--  alarms  (Circadian Wake alarm + Reverse Alarm)
-- ───────────────────────────────────────────────────────────────────
create table public.alarms (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,

  type        text not null check (type in ('wake', 'reverse', 'custom')),
  label       text,
  target_time time not null,           -- HH:MM stored in user's local timezone

  enabled     boolean not null default true,

  -- ISO weekdays 1=Mon … 7=Sun. Empty array = one-shot alarm.
  days_of_week int[] not null default '{1,2,3,4,5,6,7}',

  -- Wake alarm: how many minutes before target_time to open the light-sleep
  -- detection window (smart wake only fires inside this window)
  light_sleep_window_minutes int not null default 30,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.alarms enable row level security;

create policy "alarms: all own" on public.alarms
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger alarms_updated_at
  before update on public.alarms
  for each row execute function set_updated_at();
