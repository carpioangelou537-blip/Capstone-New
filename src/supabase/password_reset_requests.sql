-- Remove the retired admin password recovery queue from an existing project.
-- Password reset links and password changes continue through Supabase Auth.
drop table if exists public.password_reset_requests;
drop function if exists public.set_password_reset_request_fields();
