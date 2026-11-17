-- Read-only database diagnostic. Run in Supabase SQL Editor and inspect the
-- counts; it does not expose account emails or modify any rows.
select 'admin_auth_accounts' as item, count(*)::bigint as row_count
from auth.users
where raw_app_meta_data ->> 'role' = 'admin'
union all
select 'alumni', count(*)::bigint from public.alumni
union all
select 'jobs', count(*)::bigint from public.jobs
union all
select 'events', count(*)::bigint from public.events
union all
select 'notifications', count(*)::bigint from public.notifications
union all
select 'survey_responses', count(*)::bigint from public.survey_responses
union all
select 'alumni_skills_history', count(*)::bigint from public.alumni_skills_history
union all
select 'skill_recommendations', count(*)::bigint from public.skill_recommendations
order by item;
