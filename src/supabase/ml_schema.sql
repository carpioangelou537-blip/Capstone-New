-- Minimal, rerunnable migration for the classical ML integration.
-- Run this in the Supabase SQL Editor after the base Alumni Tracer schema.
-- Existing alumni and survey_responses tables provide model training labels.

-- Course competency management was removed from the app.
drop table if exists public.course_competencies;

-- Store the Supabase Auth login email for admin alumni details.
alter table public.alumni
  add column if not exists email text not null default '';

-- Job description text gives NLP skill extraction useful source material.
alter table public.jobs
  add column if not exists description text not null default '';
alter table public.events
  add column if not exists description text not null default '';

-- The app reads job descriptions from jobs; signed-in users can manage them
-- under the same policies used by the existing job-posting feature.
grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;
