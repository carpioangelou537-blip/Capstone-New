-- =====================================================================
--  Alumni Tracer System — Supabase schema (expanded)
--  Run this in the Supabase SQL Editor against the project that
--  matches the credentials in your root `.env` file:
--    VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
--
--  Idempotent: safe to run as many times as you like.
--
--  ONE TABLE PER FEATURE.
--    alumni                   -> core identity / verification / profile
--    survey_responses         -> latest employment survey per alumnus
--    alumni_skills_history    -> timestamped skill snapshots
--    course_recommendations   -> AI-generated skill/course suggestions
--    admin_activity_logs      -> audit trail of every admin action
--
--  Security model:
--    - Admin access requires trusted Supabase app_metadata.role = 'admin'.
--    - Alumni can read and modify only their own private records.
--    - Jobs, events, and notifications are public to read; admin-managed.
--    - `user_id` columns store the Supabase Auth user UUID.
-- =====================================================================

-- This feature was removed; discard its old table when upgrading.
drop table if exists public.course_competencies;

-- ------------------------------- helpers -------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ------------------------------- alumni --------------------------------
create table if not exists public.alumni (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid,
  role                text not null default 'alumni',
  full_name           text not null,
  email               text not null default '',
  program             text not null,
  grad_year           integer,
  date_of_birth       date,
  address             text default '',
  contact_number      text default '',
  employed            text default 'Unknown',
  job_title           text default '',
  company_name        text default '',
  business_name       text default '',
  years               text default '',
  skills              jsonb default '[]'::jsonb,
  survey_completed    boolean default false,
  avatar_url          text,
  verification_status text default 'pending',
  is_self             boolean default false,
  created_at          timestamptz default timezone('utc', now()),
  updated_at          timestamptz default timezone('utc', now())
);

alter table public.alumni add column if not exists date_of_birth date;
alter table public.alumni add column if not exists email text not null default '';
alter table public.alumni add column if not exists address text default '';
alter table public.alumni add column if not exists contact_number text default '';
alter table public.alumni add column if not exists role text not null default 'alumni';
alter table public.alumni alter column role set default 'alumni';
update public.alumni set role = 'alumni' where role is null or role = '';
alter table public.alumni alter column role set not null;
alter table public.alumni drop constraint if exists alumni_role_check;
alter table public.alumni add constraint alumni_role_check check (role in ('alumni', 'admin'));

drop trigger if exists trg_alumni_updated_at on public.alumni;
create trigger trg_alumni_updated_at
before update on public.alumni
for each row
execute function public.set_updated_at();

create or replace function public.attach_auth_user_id()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    if auth.jwt() -> 'app_metadata' ->> 'role' is distinct from 'admin' then
      new.user_id = auth.uid();
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.set_alumni_auth_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.user_id = auth.uid();
      new.role = 'alumni';
    elsif auth.jwt() -> 'app_metadata' ->> 'role' is distinct from 'admin' then
      new.user_id = old.user_id;
      new.role = old.role;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_alumni_auth_fields on public.alumni;
create trigger trg_alumni_auth_fields
before insert or update on public.alumni
for each row
execute function public.set_alumni_auth_fields();

-- ------------------------------- jobs ----------------------------------
create table if not exists public.jobs (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid,
  title      text not null,
  company    text not null,
  description text default '',
  skills     jsonb default '[]'::jsonb,
  link       text default '',
  created_at timestamptz default timezone('utc', now())
);
alter table public.jobs add column if not exists created_by uuid;
alter table public.jobs add column if not exists description text default '';

-- ------------------------------- events --------------------------------
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid,
  title      text not null,
  description text default '',
  date       date,
  rsvps      jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc', now())
);
alter table public.events add column if not exists created_by uuid;
alter table public.events add column if not exists description text default '';

-- ------------------------------- notifications -------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid,
  text       text default '',
  date       date,
  target     text default '',
  created_at timestamptz default timezone('utc', now())
);
alter table public.notifications add column if not exists created_by uuid;
alter table public.notifications add column if not exists link text default '';

-- --------------------------- survey_responses --------------------------
-- Append-only employment survey history. The alumni table stores the latest
-- snapshot used for matching; this table preserves every submitted survey.
create table if not exists public.survey_responses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,
  employed      text default 'Unknown',
  job_title     text default '',
  company_name  text default '',
  business_name text default '',
  years         text default '',
  skills        jsonb default '[]'::jsonb,
  submitted_at  timestamptz default timezone('utc', now()),
  updated_at    timestamptz default timezone('utc', now())
);

drop index if exists survey_responses_user_id_key;

-- ------------------------- alumni_skills_history -----------------------
-- Timestamped snapshot of an alumnus's skills every time they submit
-- or update their survey.
create table if not exists public.alumni_skills_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,
  skills        jsonb default '[]'::jsonb,
  snapshot_date date default current_date,
  created_at    timestamptz default timezone('utc', now())
);

-- ----------------------- course_recommendations ------------------------
-- AI-generated skill/course suggestions per alumnus, regenerated when a
-- survey is submitted.
create table if not exists public.course_recommendations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  skill      text not null,
  demand     integer default 0,
  reason     text default '',
  created_at timestamptz default timezone('utc', now())
);

drop table if exists public.job_applications;

-- --------------------------- admin_activity_logs -----------------------
create table if not exists public.admin_activity_logs (
  id             uuid primary key default gen_random_uuid(),
  admin_user_id  uuid,
  action         text not null,
  detail         text default '',
  created_at     timestamptz default timezone('utc', now())
);

-- Password recovery is handled directly through Supabase Auth.
drop table if exists public.password_reset_requests;
drop function if exists public.set_password_reset_request_fields();

-- Normalize legacy text IDs before adding real foreign-key relationships.
drop index if exists public.alumni_user_id_unique_idx;
drop policy if exists "read alumni" on public.alumni;
drop policy if exists "read survey_responses" on public.survey_responses;
drop policy if exists "read alumni_skills_history" on public.alumni_skills_history;
drop policy if exists "read course_recommendations" on public.course_recommendations;
drop policy if exists "signed in insert alumni" on public.alumni;
drop policy if exists "signed in update alumni" on public.alumni;
drop policy if exists "signed in delete alumni" on public.alumni;
drop policy if exists "signed in insert survey_responses" on public.survey_responses;
drop policy if exists "signed in update survey_responses" on public.survey_responses;
drop policy if exists "signed in delete survey_responses" on public.survey_responses;
drop policy if exists "signed in insert alumni_skills_history" on public.alumni_skills_history;
drop policy if exists "signed in update alumni_skills_history" on public.alumni_skills_history;
drop policy if exists "signed in delete alumni_skills_history" on public.alumni_skills_history;
drop policy if exists "signed in insert course_recommendations" on public.course_recommendations;
drop policy if exists "signed in update course_recommendations" on public.course_recommendations;
drop policy if exists "signed in delete course_recommendations" on public.course_recommendations;
do $$
declare
  item record;
  uuid_pattern constant text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  current_type text;
begin
  for item in
    select * from (values
      ('alumni', 'user_id'),
      ('survey_responses', 'user_id'),
      ('alumni_skills_history', 'user_id'),
      ('course_recommendations', 'user_id'),
      ('admin_activity_logs', 'admin_user_id')
    ) as columns_to_convert(table_name, column_name)
  loop
    select data_type into current_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = item.table_name
      and column_name = item.column_name;

    if current_type <> 'uuid' then
      execute format(
        'update public.%I set %I = null where %I is not null and btrim(%I::text) !~* %L',
        item.table_name, item.column_name, item.column_name, item.column_name, uuid_pattern
      );
      execute format(
        'alter table public.%I alter column %I drop not null',
        item.table_name, item.column_name
      );
      execute format(
        'alter table public.%I alter column %I type uuid using nullif(btrim(%I::text), %L)::uuid',
        item.table_name, item.column_name, item.column_name, ''
      );
    end if;
  end loop;
end;
$$;

-- Associate new Auth signups with an alumni profile automatically.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.alumni (user_id, full_name, email, program)
  values (
    new.id,
    coalesce(
      nullif(trim(concat_ws(
        ' ',
        nullif(new.raw_user_meta_data ->> 'firstName', ''),
        nullif(new.raw_user_meta_data ->> 'lastName', '')
      )), ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.email, ''),
      'New alumnus'
    ),
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'program', ''), 'Not provided')
  )
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_alumni on auth.users;
create trigger on_auth_user_created_alumni
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

drop trigger if exists trg_survey_responses_auth_user_id on public.survey_responses;
create trigger trg_survey_responses_auth_user_id
before insert on public.survey_responses
for each row
execute function public.attach_auth_user_id();

drop trigger if exists trg_alumni_skills_history_auth_user_id on public.alumni_skills_history;
create trigger trg_alumni_skills_history_auth_user_id
before insert on public.alumni_skills_history
for each row
execute function public.attach_auth_user_id();

drop trigger if exists trg_course_recommendations_auth_user_id on public.course_recommendations;
create trigger trg_course_recommendations_auth_user_id
before insert on public.course_recommendations
for each row
execute function public.attach_auth_user_id();

create or replace function public.attach_admin_auth_user_id()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.admin_user_id = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_admin_activity_logs_auth_user_id on public.admin_activity_logs;
create trigger trg_admin_activity_logs_auth_user_id
before insert on public.admin_activity_logs
for each row
execute function public.attach_admin_auth_user_id();

create or replace function public.attach_auth_created_by()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_jobs_created_by on public.jobs;
create trigger trg_jobs_created_by
before insert on public.jobs
for each row
execute function public.attach_auth_created_by();

drop trigger if exists trg_events_created_by on public.events;
create trigger trg_events_created_by
before insert on public.events
for each row
execute function public.attach_auth_created_by();

drop trigger if exists trg_notifications_created_by on public.notifications;
create trigger trg_notifications_created_by
before insert on public.notifications
for each row
execute function public.attach_auth_created_by();

-- ------------------------------- RLS ------------------------------------
alter table public.alumni                 enable row level security;
alter table public.jobs                   enable row level security;
alter table public.events                 enable row level security;
alter table public.notifications          enable row level security;
alter table public.survey_responses       enable row level security;
alter table public.alumni_skills_history  enable row level security;
alter table public.course_recommendations enable row level security;
alter table public.admin_activity_logs    enable row level security;

-- Legacy demo policies from the first schema version — dropped so the
-- new authenticated model below takes over cleanly.
drop policy if exists "anon insert alumni"        on public.alumni;
drop policy if exists "anon update alumni"        on public.alumni;
drop policy if exists "anon delete alumni"        on public.alumni;
drop policy if exists "anon insert jobs"          on public.jobs;
drop policy if exists "anon update jobs"          on public.jobs;
drop policy if exists "anon delete jobs"          on public.jobs;
drop policy if exists "anon insert events"        on public.events;
drop policy if exists "anon update events"        on public.events;
drop policy if exists "anon delete events"        on public.events;
drop policy if exists "anon insert notifications" on public.notifications;
drop policy if exists "anon update notifications" on public.notifications;
drop policy if exists "anon delete notifications" on public.notifications;

-- Re-run safety: drop THIS schema's policies first so the script can be
-- run again (create policy has no "if not exists").
drop policy if exists "read alumni"                 on public.alumni;
drop policy if exists "read jobs"                   on public.jobs;
drop policy if exists "read events"                 on public.events;
drop policy if exists "read notifications"          on public.notifications;
drop policy if exists "read survey_responses"       on public.survey_responses;
drop policy if exists "read alumni_skills_history"  on public.alumni_skills_history;
drop policy if exists "read course_recommendations" on public.course_recommendations;
drop policy if exists "read admin_activity_logs"    on public.admin_activity_logs;

drop policy if exists "signed in insert alumni"                 on public.alumni;
drop policy if exists "signed in update alumni"                 on public.alumni;
drop policy if exists "signed in delete alumni"                 on public.alumni;
drop policy if exists "signed in insert jobs"                   on public.jobs;
drop policy if exists "signed in update jobs"                   on public.jobs;
drop policy if exists "signed in delete jobs"                   on public.jobs;
drop policy if exists "signed in insert events"                 on public.events;
drop policy if exists "signed in update events"                 on public.events;
drop policy if exists "signed in delete events"                 on public.events;
drop policy if exists "signed in insert notifications"          on public.notifications;
drop policy if exists "signed in update notifications"          on public.notifications;
drop policy if exists "signed in delete notifications"          on public.notifications;
drop policy if exists "signed in insert survey_responses"       on public.survey_responses;
drop policy if exists "signed in update survey_responses"       on public.survey_responses;
drop policy if exists "signed in delete survey_responses"       on public.survey_responses;
drop policy if exists "signed in insert alumni_skills_history"  on public.alumni_skills_history;
drop policy if exists "signed in update alumni_skills_history"  on public.alumni_skills_history;
drop policy if exists "signed in delete alumni_skills_history"  on public.alumni_skills_history;
drop policy if exists "signed in insert course_recommendations" on public.course_recommendations;
drop policy if exists "signed in update course_recommendations" on public.course_recommendations;
drop policy if exists "signed in delete course_recommendations" on public.course_recommendations;
drop policy if exists "signed in insert admin_activity_logs"    on public.admin_activity_logs;
drop policy if exists "signed in update admin_activity_logs"    on public.admin_activity_logs;
drop policy if exists "signed in delete admin_activity_logs"    on public.admin_activity_logs;

-- The admin role is trusted only when stored in Supabase app_metadata.
-- Public profile and account-linked data are visible only to their owner/admin.
create policy "read alumni"                 on public.alumni                 for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "read jobs"                   on public.jobs                   for select using (true);
create policy "read events"                 on public.events                 for select using (true);
create policy "read notifications"          on public.notifications          for select using (true);
create policy "read survey_responses"       on public.survey_responses       for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "read alumni_skills_history"  on public.alumni_skills_history  for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "read course_recommendations" on public.course_recommendations for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "read admin_activity_logs"    on public.admin_activity_logs    for select
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

revoke all on public.alumni, public.survey_responses, public.alumni_skills_history,
  public.course_recommendations, public.admin_activity_logs from anon;
grant select on public.jobs, public.events, public.notifications to anon, authenticated;
grant select, insert, update, delete on public.alumni, public.jobs, public.events,
  public.notifications, public.survey_responses, public.alumni_skills_history,
  public.course_recommendations, public.admin_activity_logs
  to authenticated;

create policy "signed in insert alumni" on public.alumni for insert
  with check (user_id = auth.uid() and role = 'alumni'
    or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update alumni" on public.alumni for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete alumni" on public.alumni for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "signed in insert jobs" on public.jobs for insert
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update jobs" on public.jobs for update
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete jobs" on public.jobs for delete
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "signed in insert events" on public.events for insert
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update events" on public.events for update
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete events" on public.events for delete
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "signed in insert notifications" on public.notifications for insert
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update notifications" on public.notifications for update
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete notifications" on public.notifications for delete
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "signed in insert survey_responses" on public.survey_responses for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update survey_responses" on public.survey_responses for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete survey_responses" on public.survey_responses for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "signed in insert alumni_skills_history" on public.alumni_skills_history for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update alumni_skills_history" on public.alumni_skills_history for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete alumni_skills_history" on public.alumni_skills_history for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "signed in insert course_recommendations" on public.course_recommendations for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update course_recommendations" on public.course_recommendations for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete course_recommendations" on public.course_recommendations for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "signed in insert admin_activity_logs" on public.admin_activity_logs for insert
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in update admin_activity_logs" on public.admin_activity_logs for update
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "signed in delete admin_activity_logs" on public.admin_activity_logs for delete
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create index if not exists alumni_user_id_idx                 on public.alumni (user_id);
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.alumni'::regclass
      and conname = 'alumni_user_id_key'
  ) then
    alter table public.alumni
      add constraint alumni_user_id_key unique (user_id);
  end if;
end;
$$;

-- Link pre-existing profiles only when both sides have a unique, confirmed email.
with unique_email_matches as (
  select alumni.id as alumni_id, auth_user.id as auth_user_id
  from public.alumni as alumni
  join auth.users as auth_user
    on lower(trim(alumni.email)) = lower(trim(auth_user.email))
  where alumni.user_id is null
    and nullif(trim(alumni.email), '') is not null
    and auth_user.email_confirmed_at is not null
    and (
      select count(*)
      from public.alumni as same_email_alumni
      where lower(trim(same_email_alumni.email)) = lower(trim(alumni.email))
    ) = 1
    and (
      select count(*)
      from auth.users as same_email_user
      where lower(trim(same_email_user.email)) = lower(trim(auth_user.email))
        and same_email_user.email_confirmed_at is not null
    ) = 1
    and not exists (
      select 1
      from public.alumni as existing_link
      where existing_link.user_id = auth_user.id
        and existing_link.id <> alumni.id
    )
)
update public.alumni
set user_id = unique_email_matches.auth_user_id
from unique_email_matches
where public.alumni.id = unique_email_matches.alumni_id;

-- Retain historical rows while clearing IDs that no longer resolve to an account.
update public.alumni as alumni
set user_id = null
where alumni.user_id is not null
  and not exists (select 1 from auth.users as auth_user where auth_user.id = alumni.user_id);

-- Create profiles for existing Auth accounts that were not linked by email.
insert into public.alumni (user_id, full_name, email, program)
select
  auth_user.id,
  coalesce(
    nullif(trim(concat_ws(
      ' ',
      nullif(auth_user.raw_user_meta_data ->> 'firstName', ''),
      nullif(auth_user.raw_user_meta_data ->> 'lastName', '')
    )), ''),
    nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'name', ''),
    nullif(auth_user.email, ''),
    'New alumnus'
  ),
  coalesce(auth_user.email, ''),
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'program', ''), 'Not provided')
from auth.users as auth_user
where not exists (
  select 1
  from public.alumni
  where public.alumni.user_id = auth_user.id
)
on conflict (user_id) do nothing;

update public.survey_responses as response
set user_id = null
where response.user_id is not null
and not exists (
  select 1 from public.alumni as alumnus where alumnus.user_id = response.user_id
);
update public.alumni_skills_history as history
set user_id = null
where history.user_id is not null
and not exists (
  select 1 from public.alumni as alumnus where alumnus.user_id = history.user_id
);
update public.course_recommendations as recommendation
set user_id = null
where recommendation.user_id is not null
and not exists (
  select 1 from public.alumni as alumnus where alumnus.user_id = recommendation.user_id
);
update public.admin_activity_logs as activity
set admin_user_id = null
where activity.admin_user_id is not null
and not exists (
  select 1 from auth.users as auth_user where auth_user.id = activity.admin_user_id
);

-- Foreign keys make these relationships visible in the Supabase schema diagram.
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.alumni'::regclass and conname = 'alumni_user_id_auth_users_fkey') then
    alter table public.alumni add constraint alumni_user_id_auth_users_fkey
      foreign key (user_id) references auth.users(id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.survey_responses'::regclass and conname = 'survey_responses_user_id_alumni_fkey') then
    alter table public.survey_responses add constraint survey_responses_user_id_alumni_fkey
      foreign key (user_id) references public.alumni(user_id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.alumni_skills_history'::regclass and conname = 'alumni_skills_history_user_id_alumni_fkey') then
    alter table public.alumni_skills_history add constraint alumni_skills_history_user_id_alumni_fkey
      foreign key (user_id) references public.alumni(user_id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.course_recommendations'::regclass and conname = 'course_recommendations_user_id_alumni_fkey') then
    alter table public.course_recommendations add constraint course_recommendations_user_id_alumni_fkey
      foreign key (user_id) references public.alumni(user_id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.admin_activity_logs'::regclass and conname = 'admin_activity_logs_admin_user_id_auth_users_fkey') then
    alter table public.admin_activity_logs add constraint admin_activity_logs_admin_user_id_auth_users_fkey
      foreign key (admin_user_id) references auth.users(id) on delete set null not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.jobs'::regclass and conname = 'jobs_created_by_auth_users_fkey') then
    alter table public.jobs add constraint jobs_created_by_auth_users_fkey
      foreign key (created_by) references auth.users(id) on delete set null not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.events'::regclass and conname = 'events_created_by_auth_users_fkey') then
    alter table public.events add constraint events_created_by_auth_users_fkey
      foreign key (created_by) references auth.users(id) on delete set null not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.notifications'::regclass and conname = 'notifications_created_by_auth_users_fkey') then
    alter table public.notifications add constraint notifications_created_by_auth_users_fkey
      foreign key (created_by) references auth.users(id) on delete set null not valid;
  end if;
end;
$$;

alter table public.alumni validate constraint alumni_user_id_auth_users_fkey;
alter table public.survey_responses validate constraint survey_responses_user_id_alumni_fkey;
alter table public.alumni_skills_history validate constraint alumni_skills_history_user_id_alumni_fkey;
alter table public.course_recommendations validate constraint course_recommendations_user_id_alumni_fkey;
alter table public.admin_activity_logs validate constraint admin_activity_logs_admin_user_id_auth_users_fkey;
alter table public.jobs validate constraint jobs_created_by_auth_users_fkey;
alter table public.events validate constraint events_created_by_auth_users_fkey;
alter table public.notifications validate constraint notifications_created_by_auth_users_fkey;

create index if not exists survey_responses_user_id_idx       on public.survey_responses (user_id);
create index if not exists skills_history_user_id_idx         on public.alumni_skills_history (user_id);
create index if not exists recommendations_user_id_idx        on public.course_recommendations (user_id);
create index if not exists admin_activity_logs_admin_idx      on public.admin_activity_logs (admin_user_id);
create index if not exists jobs_created_by_idx                on public.jobs (created_by);
create index if not exists events_created_by_idx              on public.events (created_by);
create index if not exists notifications_created_by_idx       on public.notifications (created_by);

-- ------------------------------- seed data ------------------------------
-- Mirrors the bundled SEED_* data so the connected dashboard looks the
-- same as the offline fallback. The current "self" alumnus is flagged
-- with is_self = true so row 1 maps to the signed-in user.
-- Guarded: seeds only run on a brand-new database (empty alumni table),
-- so re-running the script never duplicates them or wipes real sign-ups.
do $$
begin
  if not exists (select 1 from public.alumni) then
    insert into public.alumni (full_name, program, grad_year, employed, job_title, company_name, business_name, years, skills, survey_completed, verification_status, is_self) values
      ('You',                  'BS Computer Science',     extract(year from current_date), 'Employed',      'Junior Web Developer', 'Iligan Digital Solutions', '',                        '',  '["JavaScript","React"]', true,  'verified', true),
      ('Maria Santos',         'BS Information Technology','2022', 'Employed',     'Data & Systems Coordinator', 'CDO Analytics Hub',   '', '3', '["SQL","Project Management","Python"]', true,  'verified', false),
      ('Jerome Villanueva',    'BS Computer Science',     '2023', 'Employed',     'Frontend Developer',        'Iligan Digital Solutions', '', '1', '["React","Node.js","UI/UX"]',            true,  'verified', false),
      ('Angel Reyes',          'BS Information Technology','2021', 'Self Employed', '', '', 'Reyes Network Consulting', '4', '["Networking","Cybersecurity"]',           true,  'verified', false),
      ('Paolo Cruz',           'BS Computer Science',     extract(year from current_date), 'Unemployed',    '', '', '', '', '["Java","Data Analysis"]',                true,  'verified', false),
      ('Kristine Bautista',    'BS Information Technology',extract(year from current_date), 'Unknown',      '', '', '', '', '[]',                                    false, 'pending',  false);

    insert into public.jobs (title, company, skills, link) values
      ('Junior Web Developer', 'Iligan Digital Solutions', '["JavaScript","React"]', 'https://www.facebook.com/'),
      ('IT Support Specialist', 'Northern Mindanao Hospital', '["Networking","Cybersecurity"]', ''),
      ('Data Analyst', 'CDO Analytics Hub', '["Python","Data Analysis","SQL"]', 'https://www.linkedin.com/');

    insert into public.events (title, date, rsvps) values
      ('Homecoming & Career Fair', '2026-09-12', '[]'::jsonb),
      ('IT Alumni Tech Talk',      '2026-10-03', '["Maria Santos"]'::jsonb);

    insert into public.notifications (text, date, target) values
      ('Welcome to the Alumni Tracer System! Complete your survey to unlock job matches.', '2026-08-01', 'Complete the Alumni Survey');

    -- Demo history is intentionally unlinked; real submissions use Auth user IDs.
    insert into public.survey_responses (user_id, employed, job_title, company_name, business_name, years, skills) values
      (null, 'Employed',       'Junior Web Developer',        'Iligan Digital Solutions', '', '1', '["JavaScript","React"]'),
      (null, 'Employed',       'Data & Systems Coordinator',  'CDO Analytics Hub',        '', '3', '["SQL","Project Management","Python"]'),
      (null, 'Employed',       'Frontend Developer',          'Iligan Digital Solutions', '', '1', '["React","Node.js","UI/UX"]'),
      (null, 'Self Employed',  '',                            '',                         'Reyes Network Consulting', '4', '["Networking","Cybersecurity"]'),
      (null, 'Unemployed',     '',                            '',                         '', '', '["Java","Data Analysis"]');

    insert into public.alumni_skills_history (user_id, skills, snapshot_date) values
      (null, '["JavaScript","React","SQL"]', current_date - 30),
      (null, '["React","Node.js","UI/UX"]',  current_date - 20);

    insert into public.course_recommendations (user_id, skill, demand, reason) values
      (null, 'Networking',  1, 'Requested by IT Support Specialist at Northern Mindanao Hospital'),
      (null, 'Node.js',     1, 'Requested by Junior Web Developer at Iligan Digital Solutions');

    insert into public.admin_activity_logs (admin_user_id, action, detail) values
      (null, 'approved_alumnus',    'Maria Santos'),
      (null, 'published_job',       'Junior Web Developer at Iligan Digital Solutions');
  end if;
end $$;

-- Curated LinkedIn and Facebook listings are added even when this schema is
-- applied to an existing database. The link check makes reruns idempotent.
insert into public.jobs (title, company, skills, link)
select curated.title, curated.company, curated.skills::jsonb, curated.link
from (values
  ('Software Engineer', 'Robinsons Land Corporation', '["Java","Python","SQL","debugging"]', 'https://ph.linkedin.com/jobs/view/software-engineer-at-robinsons-land-corporation-4381568711'),
  ('IT QA Analyst', 'Robinsons Land Corporation', '["Software testing","bug reporting","documentation"]', 'https://ph.linkedin.com/jobs/view/it-qa-analyst-at-robinsons-land-corporation-4279868022'),
  ('IT Support Engineer', 'LinkedIn', '["Windows","troubleshooting","networking"]', 'https://www.linkedin.com/jobs/search/?keywords=IT%20Support%20Engineer&location=Iligan%20City%2C%20Philippines'),
  ('Technical Support Engineer', 'LinkedIn', '["Hardware","software","customer support"]', 'https://www.linkedin.com/jobs/search/?keywords=Technical%20Support%20Engineer&location=Iligan%20City%2C%20Philippines'),
  ('Web Developer', 'LinkedIn', '["HTML","CSS","JavaScript"]', 'https://www.linkedin.com/jobs/search/?keywords=Web%20Developer&location=Iligan%20City%2C%20Philippines'),
  ('Frontend Developer', 'LinkedIn', '["React","JavaScript","responsive design"]', 'https://www.linkedin.com/jobs/search/?keywords=Frontend%20Developer&location=Iligan%20City%2C%20Philippines'),
  ('Backend Developer', 'LinkedIn', '["Node.js","SQL","APIs"]', 'https://www.linkedin.com/jobs/search/?keywords=Backend%20Developer&location=Iligan%20City%2C%20Philippines'),
  ('Full-Stack Developer', 'LinkedIn', '["React","backend programming","databases"]', 'https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Developer&location=Iligan%20City%2C%20Philippines'),
  ('Junior Software Developer', 'LinkedIn', '["Programming","Git","debugging"]', 'https://www.linkedin.com/jobs/search/?keywords=Junior%20Software%20Developer&location=Iligan%20City%2C%20Philippines'),
  ('Database Administrator', 'LinkedIn', '["SQL","backups","database security"]', 'https://www.linkedin.com/jobs/search/?keywords=Database%20Administrator&location=Iligan%20City%2C%20Philippines'),
  ('Network Technician', 'LinkedIn', '["TCP/IP","routers","switches"]', 'https://www.linkedin.com/jobs/search/?keywords=Network%20Technician&location=Iligan%20City%2C%20Philippines'),
  ('System Administrator', 'LinkedIn', '["Windows/Linux","servers","security"]', 'https://www.linkedin.com/jobs/search/?keywords=System%20Administrator&location=Iligan%20City%2C%20Philippines'),
  ('Cybersecurity Analyst', 'LinkedIn', '["Network security","threat monitoring"]', 'https://www.linkedin.com/jobs/search/?keywords=Cybersecurity%20Analyst&location=Iligan%20City%2C%20Philippines'),
  ('Software Tester', 'LinkedIn', '["QA","test cases","bug reporting"]', 'https://www.linkedin.com/jobs/search/?keywords=Software%20Tester&location=Iligan%20City%2C%20Philippines'),
  ('UI/UX Designer', 'LinkedIn', '["Figma","wireframes","prototyping"]', 'https://www.linkedin.com/jobs/search/?keywords=UI%20UX%20Designer&location=Iligan%20City%2C%20Philippines'),
  ('IT Help Desk Technician', 'LinkedIn', '["Troubleshooting","ticketing","Windows"]', 'https://www.linkedin.com/jobs/search/?keywords=IT%20Help%20Desk&location=Iligan%20City%2C%20Philippines'),
  ('IT Project Assistant', 'LinkedIn', '["Documentation","Excel","coordination"]', 'https://www.linkedin.com/jobs/search/?keywords=IT%20Project%20Assistant&location=Iligan%20City%2C%20Philippines'),
  ('Data Analyst', 'LinkedIn', '["Excel","SQL","Power BI"]', 'https://www.linkedin.com/jobs/search/?keywords=Data%20Analyst&location=Iligan%20City%2C%20Philippines'),
  ('WordPress Developer', 'LinkedIn', '["WordPress","PHP","HTML","CSS"]', 'https://www.linkedin.com/jobs/search/?keywords=WordPress%20Developer&location=Iligan%20City%2C%20Philippines'),
  ('Process Developer', '1000 Miles Limited', '["Workflow automation","Odoo ERP","Power Automate"]', 'https://ph.linkedin.com/jobs/view/process-developer-at-1000-miles-limited-4184575937'),
  ('IT Staff', 'Facebook', '["Computer troubleshooting","MS Office"]', 'https://www.facebook.com/search/posts/?q=IT%20Staff%20Hiring%20Iligan%20City'),
  ('Computer Technician', 'Facebook', '["PC repair","Windows installation"]', 'https://www.facebook.com/search/posts/?q=Computer%20Technician%20Hiring%20Iligan'),
  ('Web Developer', 'Facebook', '["HTML","CSS","JavaScript"]', 'https://www.facebook.com/search/posts/?q=Web%20Developer%20Hiring%20Iligan%20City'),
  ('Frontend Developer', 'Facebook', '["React","CSS","responsive design"]', 'https://www.facebook.com/search/posts/?q=Frontend%20Developer%20Hiring%20Iligan'),
  ('Backend Developer', 'Facebook', '["Node.js","PHP","SQL"]', 'https://www.facebook.com/search/posts/?q=Backend%20Developer%20Hiring%20Iligan'),
  ('Full-Stack Developer', 'Facebook', '["Frontend","backend","databases"]', 'https://www.facebook.com/search/posts/?q=Full%20Stack%20Developer%20Hiring%20Iligan'),
  ('IT Support Technician', 'Facebook', '["Troubleshooting","networking"]', 'https://www.facebook.com/search/posts/?q=IT%20Support%20Technician%20Hiring%20Iligan'),
  ('Technical Support Representative', 'Facebook', '["Troubleshooting","communication"]', 'https://www.facebook.com/search/posts/?q=Technical%20Support%20Hiring%20Iligan%20City'),
  ('Network Technician', 'Facebook', '["TCP/IP","LAN","routers"]', 'https://www.facebook.com/search/posts/?q=Network%20Technician%20Hiring%20Iligan'),
  ('IT Help Desk Staff', 'Facebook', '["Ticketing","user support"]', 'https://www.facebook.com/search/posts/?q=IT%20Help%20Desk%20Hiring%20Iligan'),
  ('UI/UX Designer', 'Facebook', '["Figma","wireframes","prototypes"]', 'https://www.facebook.com/search/posts/?q=UI%20UX%20Designer%20Hiring%20Iligan'),
  ('Graphic Designer', 'Facebook', '["Canva","Photoshop","Illustrator"]', 'https://www.facebook.com/search/posts/?q=Graphic%20Designer%20Hiring%20Iligan'),
  ('WordPress Developer', 'Facebook', '["WordPress","PHP","CSS"]', 'https://www.facebook.com/search/posts/?q=WordPress%20Developer%20Hiring%20Iligan'),
  ('Software Developer', 'Facebook', '["Java","Python","SQL"]', 'https://www.facebook.com/search/posts/?q=Software%20Developer%20Hiring%20Iligan%20City'),
  ('Junior Programmer', 'Facebook', '["Programming","debugging"]', 'https://www.facebook.com/search/posts/?q=Junior%20Programmer%20Hiring%20Iligan'),
  ('Database Assistant', 'Facebook', '["SQL","Excel","data management"]', 'https://www.facebook.com/search/posts/?q=Database%20Assistant%20Hiring%20Iligan'),
  ('IT QA Tester', 'Facebook', '["Testing","test cases","bug reports"]', 'https://www.facebook.com/search/posts/?q=QA%20Tester%20Hiring%20Iligan'),
  ('Data Analyst', 'Facebook', '["Excel","SQL","Power BI"]', 'https://www.facebook.com/search/posts/?q=Data%20Analyst%20Hiring%20Iligan'),
  ('IT Encoder', 'Facebook', '["Typing","Excel","file management"]', 'https://www.facebook.com/search/posts/?q=IT%20Encoder%20Hiring%20Iligan'),
  ('Digital Content Specialist', 'Facebook', '["Canva","content creation","social media"]', 'https://www.facebook.com/search/posts/?q=Social%20Media%20Specialist%20Hiring%20Iligan')
) as curated(title, company, skills, link)
where not exists (
  select 1
  from public.jobs existing
  where existing.title = curated.title
    and existing.company = curated.company
    and existing.link = curated.link
);

-- Promote the existing admin@gmail.com Auth account.
-- Create/confirm this account in Supabase Auth first; SQL does not create passwords.
do $$
declare
  admin_id uuid;
begin
  select id
  into admin_id
  from auth.users
  where lower(email) = 'admin@gmail.com';

  if admin_id is null then
    raise notice 'No Auth account found for admin@gmail.com. Create and confirm it in Supabase Auth, then run this script again.';
    return;
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'admin'),
    updated_at = timezone('utc', now())
  where id = admin_id;

  update public.alumni
  set role = 'admin'
  where user_id = admin_id;

  if not found then
    insert into public.alumni (user_id, full_name, email, program, role)
    select
      id,
      coalesce(
        nullif(trim(concat_ws(
          ' ',
          nullif(raw_user_meta_data ->> 'firstName', ''),
          nullif(raw_user_meta_data ->> 'lastName', '')
        )), ''),
        nullif(raw_user_meta_data ->> 'full_name', ''),
        nullif(raw_user_meta_data ->> 'name', ''),
        email,
        'Administrator'
      ),
      coalesce(email, 'admin@gmail.com'),
      coalesce(nullif(raw_user_meta_data ->> 'program', ''), 'Administration'),
      'admin'
    from auth.users
    where id = admin_id
    on conflict (user_id) do update set role = 'admin';
  end if;
end;
$$;