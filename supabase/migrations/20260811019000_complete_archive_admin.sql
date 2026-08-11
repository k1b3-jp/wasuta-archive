-- Complete the solo-admin correction, archive-record, source-state, and draft-discard workflows.

create or replace function public.revise_published_milestone(
  milestone_to_revise bigint, revised_title text, revised_kind text, revised_description text,
  revised_occurred_on date, revised_is_group_wide boolean, revised_source_url text,
  revised_source_title text, revised_source_kind text, revision_reason text
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare source_to_use bigint; occurrence_to_revise bigint;
begin
  if not public.has_role_at_least('admin') then raise exception 'admin role required' using errcode = '42501'; end if;
  if nullif(btrim(revision_reason), '') is null then raise exception 'revision reason is required' using errcode = '22023'; end if;
  if nullif(btrim(revised_title), '') is null or revised_occurred_on is null or revised_source_url !~ '^https?://' then raise exception 'valid revised facts are required' using errcode = '22023'; end if;
  select occurrence_id into occurrence_to_revise from public.timeline_occurrences where milestone_id = milestone_to_revise and status = 'published' for update;
  if occurrence_to_revise is null then raise exception 'published milestone not found' using errcode = 'P0002'; end if;
  insert into public.sources (url, title, source_kind, availability_status, accessed_at)
    values (revised_source_url, btrim(revised_source_title), revised_source_kind, 'available', now())
    on conflict (url) do update set title = excluded.title, source_kind = excluded.source_kind, availability_status = 'available', accessed_at = now(), updated_at = now()
    returning source_id into source_to_use;
  update public.milestones set title=btrim(revised_title), kind=btrim(revised_kind), description=nullif(btrim(revised_description),''), updated_at=now() where milestone_id=milestone_to_revise and status='published';
  update public.timeline_occurrences set occurred_on=revised_occurred_on, is_group_wide=coalesce(revised_is_group_wide,false), updated_at=now() where occurrence_id=occurrence_to_revise;
  delete from public.milestone_sources where milestone_id=milestone_to_revise;
  insert into public.milestone_sources values (milestone_to_revise,source_to_use,'title','verified',auth.uid(),now(),null);
  delete from public.occurrence_sources where occurrence_id=occurrence_to_revise;
  insert into public.occurrence_sources values (occurrence_to_revise,source_to_use,'occurred_on','verified',auth.uid(),now(),null);
  insert into public.archive_audit_log(entity_type,entity_id,action,from_status,to_status,actor_id,reason) values('milestone',milestone_to_revise,'revise_published','published','published',auth.uid(),btrim(revision_reason));
end $$;

create or replace function public.discard_milestone_draft(milestone_to_discard bigint, discard_reason text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.has_role_at_least('admin') then raise exception 'admin role required' using errcode = '42501'; end if;
  if nullif(btrim(discard_reason),'') is null then raise exception 'discard reason is required' using errcode = '22023'; end if;
  if not exists(select 1 from public.milestones where milestone_id=milestone_to_discard and status='draft' for update) then raise exception 'milestone draft not found' using errcode = 'P0002'; end if;
  delete from public.occurrence_sources where occurrence_id in(select occurrence_id from public.timeline_occurrences where milestone_id=milestone_to_discard);
  delete from public.occurrence_members where occurrence_id in(select occurrence_id from public.timeline_occurrences where milestone_id=milestone_to_discard);
  delete from public.timeline_occurrences where milestone_id=milestone_to_discard;
  delete from public.milestone_members where milestone_id=milestone_to_discard;
  delete from public.milestone_events where milestone_id=milestone_to_discard;
  delete from public.milestone_sources where milestone_id=milestone_to_discard;
  delete from public.milestones where milestone_id=milestone_to_discard;
  insert into public.archive_audit_log(entity_type,entity_id,action,from_status,actor_id,reason) values('milestone',milestone_to_discard,'discard_draft','draft',auth.uid(),btrim(discard_reason));
end $$;

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

create or replace function public.update_source_state(source_to_update bigint, next_availability text, next_archived_url text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.has_role_at_least('admin') then raise exception 'admin role required' using errcode='42501'; end if;
 if next_availability not in ('unchecked','available','suspect','unavailable') or (nullif(btrim(next_archived_url),'') is not null and next_archived_url !~ '^https?://') then raise exception 'invalid source state' using errcode='22023'; end if;
 update public.sources set availability_status=next_availability,archived_url=nullif(btrim(next_archived_url),''),updated_at=now() where source_id=source_to_update;
 if not found then raise exception 'source not found' using errcode='P0002'; end if;
 insert into public.archive_audit_log(entity_type,entity_id,action,actor_id,reason) values('source',source_to_update,'update_source_state',auth.uid(),next_availability);
end $$;

revoke all on function public.revise_published_milestone(bigint,text,text,text,date,boolean,text,text,text,text) from public;
revoke all on function public.discard_milestone_draft(bigint,text) from public;
revoke all on function public.save_archive_record(text,bigint,text,text,date,date,text,text,text,text,text,boolean) from public;
revoke all on function public.update_source_state(bigint,text,text) from public;
grant execute on function public.revise_published_milestone(bigint,text,text,text,date,boolean,text,text,text,text) to authenticated;
grant execute on function public.discard_milestone_draft(bigint,text) to authenticated;
grant execute on function public.save_archive_record(text,bigint,text,text,date,date,text,text,text,text,text,boolean) to authenticated;
grant execute on function public.update_source_state(bigint,text,text) to authenticated;
