-- Adds the alumni profile fields shown in the profile and admin details.
alter table public.alumni
  add column if not exists email text not null default '',
  add column if not exists date_of_birth date,
  add column if not exists contact_number text default '',
  add column if not exists address text default '';

alter table public.events
  add column if not exists description text not null default '';

-- The app reads published events for signed-out visitors and alumni.
grant select on public.events to anon, authenticated;
