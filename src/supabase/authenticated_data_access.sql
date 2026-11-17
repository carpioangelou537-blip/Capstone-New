-- Restore authenticated read/write access for profile and skill data.
-- Row-level security still limits alumni to their own rows and admins
-- to all rows. Run in the Supabase SQL Editor; safe to rerun.

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.alumni,
  public.alumni_skills_history, public.skill_recommendations
  to authenticated;

alter table public.alumni enable row level security;
alter table public.alumni_skills_history enable row level security;
alter table public.skill_recommendations enable row level security;

drop policy if exists "read alumni" on public.alumni;
create policy "read alumni" on public.alumni for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in insert alumni" on public.alumni;
create policy "signed in insert alumni" on public.alumni for insert
  with check (
    (user_id = auth.uid() and role = 'alumni')
    or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
drop policy if exists "signed in update alumni" on public.alumni;
create policy "signed in update alumni" on public.alumni for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in delete alumni" on public.alumni;
create policy "signed in delete alumni" on public.alumni for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists "read alumni_skills_history" on public.alumni_skills_history;
create policy "read alumni_skills_history" on public.alumni_skills_history for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in insert alumni_skills_history" on public.alumni_skills_history;
create policy "signed in insert alumni_skills_history" on public.alumni_skills_history for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in update alumni_skills_history" on public.alumni_skills_history;
create policy "signed in update alumni_skills_history" on public.alumni_skills_history for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in delete alumni_skills_history" on public.alumni_skills_history;
create policy "signed in delete alumni_skills_history" on public.alumni_skills_history for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists "read skill_recommendations" on public.skill_recommendations;
drop policy if exists "read course_recommendations" on public.skill_recommendations;
create policy "read skill_recommendations" on public.skill_recommendations for select
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in insert skill_recommendations" on public.skill_recommendations;
drop policy if exists "signed in insert course_recommendations" on public.skill_recommendations;
create policy "signed in insert skill_recommendations" on public.skill_recommendations for insert
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in update skill_recommendations" on public.skill_recommendations;
drop policy if exists "signed in update course_recommendations" on public.skill_recommendations;
create policy "signed in update skill_recommendations" on public.skill_recommendations for update
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
drop policy if exists "signed in delete skill_recommendations" on public.skill_recommendations;
drop policy if exists "signed in delete course_recommendations" on public.skill_recommendations;
create policy "signed in delete skill_recommendations" on public.skill_recommendations for delete
  using (user_id = auth.uid() or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create index if not exists alumni_user_id_idx
  on public.alumni (user_id);
create index if not exists alumni_skills_history_user_id_idx
  on public.alumni_skills_history (user_id);
create index if not exists skill_recommendations_user_id_idx
  on public.skill_recommendations (user_id);
