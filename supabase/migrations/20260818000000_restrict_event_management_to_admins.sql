-- Event management is reserved for administrators. Public reads remain unchanged.

alter table public.events enable row level security;
alter table public.event_tags enable row level security;
alter table public.event_tag_names enable row level security;

create or replace function public.is_admin(u uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.user_roles r
    where r.user_id = u and r.role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

grant select on public.events, public.event_tags, public.event_tag_names
  to anon, authenticated;
grant insert, update, delete on public.events, public.event_tags, public.event_tag_names
  to authenticated;

do $$
declare
  sequence_name text;
begin
  sequence_name := pg_get_serial_sequence('public.events', 'event_id');
  if sequence_name is not null then
    execute format('grant usage, select on sequence %s to authenticated', sequence_name);
  end if;

  sequence_name := pg_get_serial_sequence('public.event_tag_names', 'tag_id');
  if sequence_name is not null then
    execute format('grant usage, select on sequence %s to authenticated', sequence_name);
  end if;
end
$$;

drop policy if exists "events_insert_authenticated" on public.events;
drop policy if exists "events_update_authenticated" on public.events;
drop policy if exists "events_write_admin_only" on public.events;
drop policy if exists "events_update_admin_only" on public.events;

create policy "events_write_admin_only"
  on public.events
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "events_update_admin_only"
  on public.events
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "event_tags_insert_authenticated" on public.event_tags;
drop policy if exists "event_tags_update_authenticated" on public.event_tags;
drop policy if exists "event_tags_write_admin_only" on public.event_tags;
drop policy if exists "event_tags_update_admin_only" on public.event_tags;

create policy "event_tags_write_admin_only"
  on public.event_tags
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "event_tags_update_admin_only"
  on public.event_tags
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "event_tag_names_select_public" on public.event_tag_names;
drop policy if exists "event_tag_names_write_admin_only" on public.event_tag_names;
drop policy if exists "event_tag_names_update_admin_only" on public.event_tag_names;
drop policy if exists "event_tag_names_delete_admin_only" on public.event_tag_names;

create policy "event_tag_names_select_public"
  on public.event_tag_names
  for select
  to public
  using (true);

create policy "event_tag_names_write_admin_only"
  on public.event_tag_names
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "event_tag_names_update_admin_only"
  on public.event_tag_names
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "event_tag_names_delete_admin_only"
  on public.event_tag_names
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "storage_objects_insert_authenticated" on storage.objects;
drop policy if exists "storage_objects_update_authenticated" on storage.objects;
drop policy if exists "storage_objects_delete_authenticated" on storage.objects;
drop policy if exists "storage_objects_admin_write_only" on storage.objects;
drop policy if exists "storage_objects_admin_update_only" on storage.objects;
drop policy if exists "storage_objects_admin_delete_only" on storage.objects;

create policy "storage_objects_admin_write_only"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'event_pics'
    and public.is_admin(auth.uid())
  );

create policy "storage_objects_admin_update_only"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'event_pics'
    and public.is_admin(auth.uid())
  )
  with check (
    bucket_id = 'event_pics'
    and public.is_admin(auth.uid())
  );

create policy "storage_objects_admin_delete_only"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'event_pics'
    and public.is_admin(auth.uid())
  );
