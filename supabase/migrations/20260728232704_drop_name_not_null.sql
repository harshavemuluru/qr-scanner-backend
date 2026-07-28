-- The app no longer populates the legacy `name` column (adults/kids
-- jsonb replaced it), but it was created NOT NULL — every insert was
-- failing. Drop the constraint; the column stays for old-row backfill.
alter table public.entries alter column name drop not null;

notify pgrst, 'reload schema';
