-- Create the table expected by the app API routes.
create extension if not exists pgcrypto;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  number text,
  checkedin boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists entries_created_at_idx on public.entries (created_at desc);

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