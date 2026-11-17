-- DFD/ERD additions for an existing Alumni Tracer Supabase database.
-- Run after schema.sql has created public.events, public.jobs, and the
-- Supabase Auth schema. Safe to rerun.

-- DB6: include event type while retaining the existing RSVP flow.
alter table public.events
  add column if not exists type text not null default 'event';

-- DB5: add DFD notification fields while retaining the app's legacy `text`.
alter table public.notifications
  add column if not exists title text not null default '',
  add column if not exists body text not null default '',
  add column if not exists type text not null default 'general';

update public.notifications
set body = coalesce(text, '')
where body = '' and coalesce(text, '') <> '';

create or replace function public.sync_notification_body()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.body <> '' then
      new.text = new.body;
    else
      new.body = coalesce(new.text, '');
    end if;
  elsif new.body is distinct from old.body then
    new.text = coalesce(new.body, '');
  else
    new.body = coalesce(new.text, '');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notifications_sync_body on public.notifications;
create trigger trg_notifications_sync_body
before insert or update on public.notifications
for each row
execute function public.sync_notification_body();

-- DB7: normalized event RSVP/feedback records.
-- Existing app RSVP data remains in events.rsvps.
create table if not exists public.posts_response (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  response   text not null check (response in ('going', 'not_going')),
  feedback   text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint posts_response_event_user_key unique (event_id, user_id)
);

-- DB8: saved job alignment results. Current app alignment is still computed
-- on demand and is not automatically written to this table.
create table if not exists public.job_alignment (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  job_id         uuid not null references public.jobs(id) on delete cascade,
  program        text not null default '',
  score          numeric(5, 2) not null check (score >= 0 and score <= 100),
  matched_skills jsonb not null default '[]'::jsonb,
  missing_skills jsonb not null default '[]'::jsonb,
  reason         text not null default '',
  calculated_at  timestamptz not null default timezone('utc', now()),
  constraint job_alignment_user_job_key unique (user_id, job_id)
);

-- DB10: retained for future employment-history features.
create table if not exists public.alumni_job_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  company    text not null default '',
  started_at date,
  ended_at   date,
  created_at timestamptz not null default timezone('utc', now()),
  constraint alumni_job_history_dates_check
    check (ended_at is null or started_at is null or ended_at >= started_at)
);

-- Restrict account-linked records to their owner or a trusted admin.
alter table public.posts_response enable row level security;
alter table public.job_alignment enable row level security;
alter table public.alumni_job_history enable row level security;

revoke all on public.posts_response, public.job_alignment,
  public.alumni_job_history from anon;
grant select, insert, update, delete on public.posts_response,
  public.job_alignment, public.alumni_job_history to authenticated;

drop policy if exists "read posts_response" on public.posts_response;
create policy "read posts_response" on public.posts_response for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in insert posts_response" on public.posts_response;
create policy "signed in insert posts_response" on public.posts_response for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in update posts_response" on public.posts_response;
create policy "signed in update posts_response" on public.posts_response for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in delete posts_response" on public.posts_response;
create policy "signed in delete posts_response" on public.posts_response for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists "read job_alignment" on public.job_alignment;
create policy "read job_alignment" on public.job_alignment for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in insert job_alignment" on public.job_alignment;
create policy "signed in insert job_alignment" on public.job_alignment for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in update job_alignment" on public.job_alignment;
create policy "signed in update job_alignment" on public.job_alignment for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in delete job_alignment" on public.job_alignment;
create policy "signed in delete job_alignment" on public.job_alignment for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists "read alumni_job_history" on public.alumni_job_history;
create policy "read alumni_job_history" on public.alumni_job_history for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in insert alumni_job_history" on public.alumni_job_history;
create policy "signed in insert alumni_job_history" on public.alumni_job_history for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in update alumni_job_history" on public.alumni_job_history;
create policy "signed in update alumni_job_history" on public.alumni_job_history for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in delete alumni_job_history" on public.alumni_job_history;
create policy "signed in delete alumni_job_history" on public.alumni_job_history for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create index if not exists posts_response_user_idx
  on public.posts_response (user_id);
create index if not exists job_alignment_user_idx
  on public.job_alignment (user_id);
create index if not exists alumni_job_history_user_idx
  on public.alumni_job_history (user_id);
