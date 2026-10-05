-- Adds the email field displayed in the admin alumni details.
-- Existing alumni email values are synchronized the next time they sign in.
alter table public.alumni
  add column if not exists email text not null default '';
