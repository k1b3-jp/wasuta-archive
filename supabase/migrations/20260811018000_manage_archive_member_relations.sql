-- Let the solo administrator maintain explicit member relationships used by the timeline.

create or replace function public.replace_archive_member_relations(
  target_kind text,
  target_id bigint,
  selected_member_ids bigint[]
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_ids bigint[] := coalesce(selected_member_ids, array[]::bigint[]);
begin
  if not public.has_role_at_least('admin') then
    raise exception 'admin role required' using errcode = '42501';
  end if;
  if target_kind not in ('event', 'song', 'costume') or target_id is null or target_id <= 0 then
    raise exception 'valid archive target is required' using errcode = '22023';
  end if;
  if cardinality(normalized_ids) > 10 or cardinality(normalized_ids) <> (select count(distinct value) from unnest(normalized_ids) value) then
    raise exception 'member ids must be unique and limited to 10' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(normalized_ids) value left join public.members on member_id = value where members.member_id is null) then
    raise exception 'unknown member id' using errcode = '23503';
  end if;

  if target_kind = 'event' then
    if not exists (select 1 from public.events where event_id = target_id) then raise exception 'event not found' using errcode = 'P0002'; end if;
    delete from public.event_members where event_id = target_id;
    insert into public.event_members (event_id, member_id, relation_kind)
      select target_id::integer, value, 'appearance' from unnest(normalized_ids) value;
  elsif target_kind = 'song' then
    if not exists (select 1 from public.songs where song_id = target_id) then raise exception 'song not found' using errcode = 'P0002'; end if;
    delete from public.song_members where song_id = target_id;
    insert into public.song_members (song_id, member_id, relation_kind)
      select target_id, value, 'performer' from unnest(normalized_ids) value;
  else
    if not exists (select 1 from public.costumes where costume_id = target_id) then raise exception 'costume not found' using errcode = 'P0002'; end if;
    delete from public.costume_members where costume_id = target_id;
    insert into public.costume_members (costume_id, member_id, variant_note)
      select target_id, value, '' from unnest(normalized_ids) value;
  end if;

  delete from public.occurrence_members
  where occurrence_id in (
    select occurrence_id from public.timeline_occurrences
    where (target_kind = 'event' and event_id = target_id)
       or (target_kind = 'song' and song_id = target_id)
       or (target_kind = 'costume' and costume_id = target_id)
  );
  insert into public.occurrence_members (occurrence_id, member_id)
    select occurrence_id, member_id
    from public.timeline_occurrences cross join unnest(normalized_ids) member_id
    where (target_kind = 'event' and event_id = target_id)
       or (target_kind = 'song' and song_id = target_id)
       or (target_kind = 'costume' and costume_id = target_id);

  insert into public.archive_audit_log (entity_type, entity_id, action, actor_id, reason)
  values (target_kind, target_id, 'replace_member_relations', auth.uid(), array_to_string(normalized_ids, ','));
end;
$$;

revoke all on function public.replace_archive_member_relations(text, bigint, bigint[]) from public;
grant execute on function public.replace_archive_member_relations(text, bigint, bigint[]) to authenticated;
