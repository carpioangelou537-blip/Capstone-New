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
--    job_applications         -> alumni job applications
--    admin_activity_logs      -> audit trail of every admin action
--
--  Security model:
--    - Anyone may READ (keeps the landing page stats and directory
--      browsing working for the demo).
--    - Only SIGNED-IN users may INSERT / UPDATE / DELETE.
--    - `user_id` columns store the Supabase Auth user UUID.
-- =====================================================================

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
  user_id             text,
  full_name           text not null,
  program             text not null,
  grad_year           integer,
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

drop trigger if exists trg_alumni_updated_at on public.alumni;
create trigger trg_alumni_updated_at
before update on public.alumni
for each row
execute function public.set_updated_at();

-- ------------------------------- jobs ----------------------------------
create table if not exists public.jobs (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  company    text not null,
  skills     jsonb default '[]'::jsonb,
  link       text default '',
  created_at timestamptz default timezone('utc', now())
);

-- ------------------------------- events --------------------------------
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  date       date,
  rsvps      jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc', now())
);

-- ------------------------------- notifications -------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  text       text default '',
  date       date,
  target     text default '',
  created_at timestamptz default timezone('utc', now())
);

-- --------------------------- survey_responses --------------------------
-- Append-only employment survey history. The alumni table stores the latest
-- snapshot used for matching; this table preserves every submitted survey.
create table if not exists public.survey_responses (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
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
  user_id       text not null,
  skills        jsonb default '[]'::jsonb,
  snapshot_date date default current_date,
  created_at    timestamptz default timezone('utc', now())
);

-- ----------------------- course_recommendations ------------------------
-- AI-generated skill/course suggestions per alumnus, regenerated when a
-- survey is submitted.
create table if not exists public.course_recommendations (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  skill      text not null,
  demand     integer default 0,
  reason     text default '',
  created_at timestamptz default timezone('utc', now())
);

-- --------------------------- job_applications --------------------------
create table if not exists public.job_applications (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  job_id     uuid,
  status     text default 'applied',
  applied_at date default current_date,
  created_at timestamptz default timezone('utc', now())
);

-- --------------------------- admin_activity_logs -----------------------
create table if not exists public.admin_activity_logs (
  id             uuid primary key default gen_random_uuid(),
  admin_user_id  text,
  action         text not null,
  detail         text default '',
  created_at     timestamptz default timezone('utc', now())
);

-- ------------------------------- RLS ------------------------------------
alter table public.alumni                 enable row level security;
alter table public.jobs                   enable row level security;
alter table public.events                 enable row level security;
alter table public.notifications          enable row level security;
alter table public.survey_responses       enable row level security;
alter table public.alumni_skills_history  enable row level security;
alter table public.course_recommendations enable row level security;
alter table public.job_applications       enable row level security;
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
drop policy if exists "read job_applications"       on public.job_applications;
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
drop policy if exists "signed in insert job_applications"       on public.job_applications;
drop policy if exists "signed in update job_applications"       on public.job_applications;
drop policy if exists "signed in delete job_applications"       on public.job_applications;
drop policy if exists "signed in insert admin_activity_logs"    on public.admin_activity_logs;
drop policy if exists "signed in update admin_activity_logs"    on public.admin_activity_logs;
drop policy if exists "signed in delete admin_activity_logs"    on public.admin_activity_logs;

-- Anyone can read (demo: landing page + directory browsing).
create policy "read alumni"                 on public.alumni                 for select using (true);
create policy "read jobs"                   on public.jobs                   for select using (true);
create policy "read events"                 on public.events                 for select using (true);
create policy "read notifications"          on public.notifications          for select using (true);
create policy "read survey_responses"       on public.survey_responses       for select using (true);
create policy "read alumni_skills_history"  on public.alumni_skills_history  for select using (true);
create policy "read course_recommendations" on public.course_recommendations for select using (true);
create policy "read job_applications"       on public.job_applications       for select using (true);
create policy "read admin_activity_logs"    on public.admin_activity_logs    for select using (true);

-- Only signed-in users can make changes.
create policy "signed in insert alumni"                 on public.alumni                 for insert with check (auth.uid() is not null);
create policy "signed in update alumni"                 on public.alumni                 for update using (auth.uid() is not null);
create policy "signed in delete alumni"                 on public.alumni                 for delete using (auth.uid() is not null);

create policy "signed in insert jobs"                   on public.jobs                   for insert with check (auth.uid() is not null);
create policy "signed in update jobs"                   on public.jobs                   for update using (auth.uid() is not null);
create policy "signed in delete jobs"                   on public.jobs                   for delete using (auth.uid() is not null);

create policy "signed in insert events"                 on public.events                 for insert with check (auth.uid() is not null);
create policy "signed in update events"                 on public.events                 for update using (auth.uid() is not null);
create policy "signed in delete events"                 on public.events                 for delete using (auth.uid() is not null);

create policy "signed in insert notifications"          on public.notifications          for insert with check (auth.uid() is not null);
create policy "signed in update notifications"          on public.notifications          for update using (auth.uid() is not null);
create policy "signed in delete notifications"          on public.notifications          for delete using (auth.uid() is not null);

create policy "signed in insert survey_responses"       on public.survey_responses       for insert with check (auth.uid() is not null);
create policy "signed in update survey_responses"       on public.survey_responses       for update using (auth.uid() is not null);
create policy "signed in delete survey_responses"       on public.survey_responses       for delete using (auth.uid() is not null);

create policy "signed in insert alumni_skills_history"  on public.alumni_skills_history  for insert with check (auth.uid() is not null);
create policy "signed in update alumni_skills_history"  on public.alumni_skills_history  for update using (auth.uid() is not null);
create policy "signed in delete alumni_skills_history"  on public.alumni_skills_history  for delete using (auth.uid() is not null);

create policy "signed in insert course_recommendations" on public.course_recommendations for insert with check (auth.uid() is not null);
create policy "signed in update course_recommendations" on public.course_recommendations for update using (auth.uid() is not null);
create policy "signed in delete course_recommendations" on public.course_recommendations for delete using (auth.uid() is not null);

create policy "signed in insert job_applications"       on public.job_applications       for insert with check (auth.uid() is not null);
create policy "signed in update job_applications"       on public.job_applications       for update using (auth.uid() is not null);
create policy "signed in delete job_applications"       on public.job_applications       for delete using (auth.uid() is not null);

create policy "signed in insert admin_activity_logs"    on public.admin_activity_logs    for insert with check (auth.uid() is not null);
create policy "signed in update admin_activity_logs"    on public.admin_activity_logs    for update using (auth.uid() is not null);
create policy "signed in delete admin_activity_logs"    on public.admin_activity_logs    for delete using (auth.uid() is not null);

create index if not exists alumni_user_id_idx                 on public.alumni (user_id);
create index if not exists survey_responses_user_id_idx       on public.survey_responses (user_id);
create index if not exists skills_history_user_id_idx         on public.alumni_skills_history (user_id);
create index if not exists recommendations_user_id_idx        on public.course_recommendations (user_id);
create index if not exists job_applications_user_id_idx       on public.job_applications (user_id);
create index if not exists job_applications_job_id_idx        on public.job_applications (job_id);
create index if not exists admin_activity_logs_admin_idx      on public.admin_activity_logs (admin_user_id);

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

    -- Survey responses (the seeded users above, keyed by '' since they have
    -- no real Auth user_id — real sign-ups get their own user_id).
    insert into public.survey_responses (user_id, employed, job_title, company_name, business_name, years, skills) values
      ('', 'Employed',       'Junior Web Developer',        'Iligan Digital Solutions', '', '1', '["JavaScript","React"]'),
      ('', 'Employed',       'Data & Systems Coordinator',  'CDO Analytics Hub',        '', '3', '["SQL","Project Management","Python"]'),
      ('', 'Employed',       'Frontend Developer',          'Iligan Digital Solutions', '', '1', '["React","Node.js","UI/UX"]'),
      ('', 'Self Employed',  '',                            '',                         'Reyes Network Consulting', '4', '["Networking","Cybersecurity"]'),
      ('', 'Unemployed',     '',                            '',                         '', '', '["Java","Data Analysis"]');

    insert into public.alumni_skills_history (user_id, skills, snapshot_date) values
      ('', '["JavaScript","React","SQL"]', current_date - 30),
      ('', '["React","Node.js","UI/UX"]',  current_date - 20);

    insert into public.course_recommendations (user_id, skill, demand, reason) values
      ('', 'Networking',  1, 'Requested by IT Support Specialist at Northern Mindanao Hospital'),
      ('', 'Node.js',     1, 'Requested by Junior Web Developer at Iligan Digital Solutions');

    insert into public.job_applications (user_id, job_id, status, applied_at) select
      '', id, 'applied', current_date - 3 from public.jobs where title = 'Data Analyst';

    insert into public.admin_activity_logs (admin_user_id, action, detail) values
      ('', 'approved_alumnus',    'Maria Santos'),
      ('', 'published_job',       'Junior Web Developer at Iligan Digital Solutions');
  end if;
end $$;