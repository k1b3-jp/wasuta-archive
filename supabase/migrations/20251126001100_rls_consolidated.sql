-- Consolidated migration: RLS relaxations and bucket creation

-- YouTube-related inserts: allow authenticated users
drop policy if exists "youtube_links_write_admin_only" on public.youtube_links;
drop policy if exists "youtube_tags_write_admin_only" on public.youtube_tags;
drop policy if exists "event_youtube_links_write_admin_only" on public.event_youtube_links;

create policy "youtube_links_insert_authenticated"
  on public.youtube_links
  for insert
  to authenticated
  with check (true);

create policy "youtube_tags_insert_authenticated"
  on public.youtube_tags
  for insert
  to authenticated
  with check (true);

create policy "event_youtube_links_insert_authenticated"
  on public.event_youtube_links
  for insert
  to authenticated
  with check (true);

-- Events: insert and update for authenticated
drop policy if exists "events_write_admin_only" on public.events;
drop policy if exists "events_update_admin_only" on public.events;

-- Audit columns
alter table public.events add column if not exists created_by uuid;
alter table public.events add column if not exists updated_by uuid;

create policy "events_insert_authenticated"
  on public.events
  for insert
  to authenticated
  with check (true);

create policy "events_update_authenticated"
  on public.events
  for update
  to authenticated
  using (true)
  with check (true);

-- Event tags: insert and update for authenticated
drop policy if exists "event_tags_write_admin_only" on public.event_tags;
drop policy if exists "event_tags_update_admin_only" on public.event_tags;

create policy "event_tags_insert_authenticated"
  on public.event_tags
  for insert
  to authenticated
  with check (true);

create policy "event_tags_update_authenticated"
  on public.event_tags
  for update
  to authenticated
  using (true)
  with check (true);

-- Storage objects: insert, update, delete for authenticated
drop policy if exists "storage_objects_admin_write_only" on storage.objects;
drop policy if exists "storage_objects_admin_update_only" on storage.objects;
drop policy if exists "storage_objects_admin_delete_only" on storage.objects;

create policy "storage_objects_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (true);

create policy "storage_objects_update_authenticated"
  on storage.objects
  for update
  to authenticated
  using (true)
  with check (true);

create policy "storage_objects_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (true);

-- Create event_pics bucket (idempotent)
insert into storage.buckets (id, name, public)
values ('event_pics', 'event_pics', true)
on conflict (id) do nothing;

-- Enforce bucket constraints (MIME and size)
update storage.buckets
  set file_size_limit = 5242880,
      allowed_mime_types = '{image/*}'
where id = 'event_pics';
