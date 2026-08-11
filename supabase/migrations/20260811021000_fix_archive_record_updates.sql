-- Preserve editable slugs and safely remove undated timeline occurrences.
create or replace function public.save_archive_record(
  record_kind text, record_id bigint, record_slug text, record_title text,
  record_primary_date date, record_secondary_date date, record_description text,
  record_image_url text, record_source_url text, record_source_title text,
  record_source_kind text, publish_record boolean
) returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare saved_id bigint; canonical_id bigint; saved_status text := case when publish_record then 'published' else 'draft' end; occurrence_type text;
begin
  if not public.has_role_at_least('admin') then raise exception 'admin role required' using errcode='42501'; end if;
  if record_kind not in ('song','costume') or record_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or nullif(btrim(record_title),'') is null then raise exception 'valid archive record is required' using errcode='22023'; end if;
  if record_source_url !~ '^https?://' or nullif(btrim(record_source_title),'') is null then raise exception 'valid source is required' using errcode='22023'; end if;
  if record_source_kind not in ('official','web','video','social','book','internal') then raise exception 'invalid source kind' using errcode='22023'; end if;
  insert into public.sources(url,title,source_kind,availability_status,accessed_at) values(record_source_url,btrim(record_source_title),record_source_kind,case when publish_record then 'available' else 'unchecked' end,now())
    on conflict(url) do update set title=excluded.title,source_kind=excluded.source_kind,availability_status=excluded.availability_status,accessed_at=now(),updated_at=now() returning source_id into canonical_id;
  if record_kind='song' then
    if record_id is null then insert into public.songs(slug,title,release_date,first_performed_date,description,image_url,status) values(record_slug,btrim(record_title),record_secondary_date,record_primary_date,nullif(btrim(record_description),''),nullif(btrim(record_image_url),''),saved_status) returning song_id into saved_id;
    else update public.songs set slug=record_slug,title=btrim(record_title),release_date=record_secondary_date,first_performed_date=record_primary_date,description=nullif(btrim(record_description),''),image_url=nullif(btrim(record_image_url),''),status=saved_status where song_id=record_id returning song_id into saved_id; end if;
    if saved_id is null then raise exception 'song not found' using errcode='P0002'; end if;
    delete from public.song_sources where song_id=saved_id;
    insert into public.song_sources(song_id,label,url,accessed_on,canonical_source_id,fact_kind,verification_status,verified_by,verified_at) values(saved_id,btrim(record_source_title),record_source_url,current_date,canonical_id,'first_performed_date',case when publish_record then 'verified' else 'unverified' end,case when publish_record then auth.uid() end,case when publish_record then now() end);
    occurrence_type := 'first_performance';
  else
    if record_id is null then insert into public.costumes(slug,name,debut_date,description,image_url,status) values(record_slug,btrim(record_title),record_primary_date,nullif(btrim(record_description),''),nullif(btrim(record_image_url),''),saved_status) returning costume_id into saved_id;
    else update public.costumes set slug=record_slug,name=btrim(record_title),debut_date=record_primary_date,description=nullif(btrim(record_description),''),image_url=nullif(btrim(record_image_url),''),status=saved_status where costume_id=record_id returning costume_id into saved_id; end if;
    if saved_id is null then raise exception 'costume not found' using errcode='P0002'; end if;
    delete from public.costume_sources where costume_id=saved_id;
    insert into public.costume_sources(costume_id,label,url,accessed_on,canonical_source_id,fact_kind,verification_status,verified_by,verified_at) values(saved_id,btrim(record_source_title),record_source_url,current_date,canonical_id,'debut_date',case when publish_record then 'verified' else 'unverified' end,case when publish_record then auth.uid() end,case when publish_record then now() end);
    occurrence_type := 'costume_debut';
  end if;
  if record_primary_date is null then
    delete from public.timeline_occurrences where (record_kind='song' and song_id=saved_id) or (record_kind='costume' and costume_id=saved_id);
  else
    update public.timeline_occurrences set occurred_on=record_primary_date,status=saved_status,updated_at=now() where (record_kind='song' and song_id=saved_id) or (record_kind='costume' and costume_id=saved_id);
    if not found then insert into public.timeline_occurrences(occurrence_kind,occurred_on,is_group_wide,status,song_id,costume_id) values(occurrence_type,record_primary_date,true,saved_status,case when record_kind='song' then saved_id end,case when record_kind='costume' then saved_id end); end if;
  end if;
  insert into public.archive_audit_log(entity_type,entity_id,action,to_status,actor_id) values(record_kind,saved_id,case when record_id is null then 'create_record' else 'update_record' end,saved_status,auth.uid());
  return saved_id;
end $$;

revoke all on function public.save_archive_record(text,bigint,text,text,date,date,text,text,text,text,text,boolean) from public;
grant execute on function public.save_archive_record(text,bigint,text,text,date,date,text,text,text,text,text,boolean) to authenticated;
