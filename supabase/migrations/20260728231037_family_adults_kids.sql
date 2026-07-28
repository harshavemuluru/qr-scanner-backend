-- A registration now represents a family unit: up to 2 adults and up to
-- 3 kids sharing one QR code, keyed by the same unique phone number.
alter table public.entries
  add column if not exists adults jsonb not null default '[]'::jsonb,
  add column if not exists kids jsonb not null default '[]'::jsonb;

-- Backfill existing rows (single adult name + single child) into the
-- new shape, without touching rows already migrated.
update public.entries
set adults = jsonb_build_array(jsonb_build_object('name', name)),
    kids = jsonb_build_array(jsonb_build_object('name', child_name, 'age', age))
where adults = '[]'::jsonb
  and kids = '[]'::jsonb
  and name is not null
  and child_name is not null;

update public.entries
set adults = jsonb_build_array(jsonb_build_object('name', name))
where adults = '[]'::jsonb
  and kids = '[]'::jsonb
  and name is not null
  and child_name is null;

-- The new admin page can delete registrations; the app enforces admin
-- login at the route level, so RLS stays permissive like the other
-- policies below (select/insert/update were already anon-open).
drop policy if exists "entries_delete_all" on public.entries;
create policy "entries_delete_all"
  on public.entries
  for delete
  to anon, authenticated
  using (true);

notify pgrst, 'reload schema';
