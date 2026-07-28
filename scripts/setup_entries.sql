-- Create the table expected by the app API routes.
create extension if not exists pgcrypto;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  adults jsonb not null default '[]'::jsonb,
  kids jsonb not null default '[]'::jsonb,
  number text,
  checkedin boolean not null default false,
  created_at timestamptz not null default now(),
  -- Legacy columns from the single adult/child schema; unused by the
  -- app but kept nullable in case older data still references them.
  name text,
  email text,
  child_name text,
  age integer
);

create index if not exists entries_created_at_idx on public.entries (created_at desc);
create unique index if not exists entries_number_key on public.entries (number);

alter table public.entries enable row level security;

drop policy if exists "entries_select_all" on public.entries;
create policy "entries_select_all"
  on public.entries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "entries_insert_all" on public.entries;
create policy "entries_insert_all"
  on public.entries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "entries_update_all" on public.entries;
create policy "entries_update_all"
  on public.entries
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "entries_delete_all" on public.entries;
create policy "entries_delete_all"
  on public.entries
  for delete
  to anon, authenticated
  using (true);
