-- Public registration flow: entries now capture child's name + age,
-- and phone number must be unique so re-registering isn't possible.
alter table public.entries
  add column if not exists child_name text,
  add column if not exists age integer;

-- Postgres unique indexes treat each NULL as distinct, so pre-existing
-- rows with a null number won't block this from being created.
create unique index if not exists entries_number_key on public.entries (number);

notify pgrst, 'reload schema';
