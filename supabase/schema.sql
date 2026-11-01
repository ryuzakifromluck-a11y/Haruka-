-- Haruka's SAT Journey — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

-- 1) Database-level allowlist (defence in depth; the app also checks ALLOWED_EMAILS on the server).
create table if not exists public.allowed_emails (
  email text primary key check (email = lower(email))
);
alter table public.allowed_emails enable row level security;
-- No policies: the table is invisible to the browser. Manage it from the SQL editor only.

-- Replace with Haruka's real address (lowercase):
-- insert into public.allowed_emails (email) values ('haruka@example.com');

create or replace function public.is_allowlisted()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_allowlisted() from public;
grant execute on function public.is_allowlisted() to authenticated;

-- 2) One row per user holding all study progress as JSON.
create table if not exists public.study_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.study_state enable row level security;

drop policy if exists "own state: select" on public.study_state;
drop policy if exists "own state: insert" on public.study_state;
drop policy if exists "own state: update" on public.study_state;
drop policy if exists "own state: delete" on public.study_state;

create policy "own state: select" on public.study_state
  for select to authenticated
  using (auth.uid() = user_id and public.is_allowlisted());

create policy "own state: insert" on public.study_state
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_allowlisted());

create policy "own state: update" on public.study_state
  for update to authenticated
  using (auth.uid() = user_id and public.is_allowlisted())
  with check (auth.uid() = user_id and public.is_allowlisted());

create policy "own state: delete" on public.study_state
  for delete to authenticated
  using (auth.uid() = user_id and public.is_allowlisted());

-- Anonymous users get nothing.
revoke all on public.study_state from anon;
