-- Password recovery request tracking for an existing Supabase project.
-- Safe to re-run. Recovery links and password changes remain handled by
-- Supabase Auth; this table stores only the requested email and follow-up state.

create table if not exists public.password_reset_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  requested_at timestamptz not null default timezone('utc', now()),
  handled_at   timestamptz,
  handled_by   uuid references auth.users(id) on delete set null
);

alter table public.password_reset_requests enable row level security;

create or replace function public.set_password_reset_request_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.requested_at = timezone('utc', now());
    new.handled_at = null;
    new.handled_by = null;
  else
    new.email = old.email;
    new.requested_at = old.requested_at;
    if old.handled_at is not null then
      new.handled_at = old.handled_at;
      new.handled_by = old.handled_by;
    elsif new.handled_at is not null then
      new.handled_at = timezone('utc', now());
      new.handled_by = auth.uid();
    else
      new.handled_by = null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_password_reset_request_fields on public.password_reset_requests;
create trigger trg_password_reset_request_fields
before insert or update on public.password_reset_requests
for each row
execute function public.set_password_reset_request_fields();

drop policy if exists "public insert password_reset_requests" on public.password_reset_requests;
drop policy if exists "admin read password_reset_requests" on public.password_reset_requests;
drop policy if exists "admin update password_reset_requests" on public.password_reset_requests;

create policy "public insert password_reset_requests" on public.password_reset_requests for insert
  to anon, authenticated
  with check (
    char_length(email) between 3 and 320
    and
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and handled_at is null
    and handled_by is null
  );
create policy "admin read password_reset_requests" on public.password_reset_requests for select
  to authenticated
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
create policy "admin update password_reset_requests" on public.password_reset_requests for update
  to authenticated
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

revoke all on public.password_reset_requests from public, anon, authenticated;
grant insert on public.password_reset_requests to anon, authenticated;
grant select, update on public.password_reset_requests to authenticated;
