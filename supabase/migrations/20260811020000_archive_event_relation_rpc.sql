-- Save an archive record and its primary event relationship in one transaction.
create or replace function public.save_archive_record_with_event(
  record_kind text, record_id bigint, record_slug text, record_title text,
  record_primary_date date, record_secondary_date date, record_description text,
  record_image_url text, record_source_url text, record_source_title text,
  record_source_kind text, publish_record boolean, related_event_id integer
) returns bigint language plpgsql security definer set search_path=public,pg_temp as $$
declare saved_id bigint;
begin
  saved_id := public.save_archive_record(record_kind,record_id,record_slug,record_title,record_primary_date,record_secondary_date,record_description,record_image_url,record_source_url,record_source_title,record_source_kind,publish_record);
  if related_event_id is not null and not exists(select 1 from public.events where event_id=related_event_id) then raise exception 'related event not found' using errcode='P0002'; end if;
  if record_kind='song' then
    delete from public.song_events where song_id=saved_id;
    if related_event_id is not null then insert into public.song_events(song_id,event_id,relation_type) values(saved_id,related_event_id,'first_performance'); end if;
  else
    delete from public.costume_events where costume_id=saved_id;
    if related_event_id is not null then insert into public.costume_events(costume_id,event_id,relation_type) values(saved_id,related_event_id,'debut'); end if;
  end if;
  return saved_id;
end $$;
revoke all on function public.save_archive_record_with_event(text,bigint,text,text,date,date,text,text,text,text,text,boolean,integer) from public;
grant execute on function public.save_archive_record_with_event(text,bigint,text,text,date,date,text,text,text,text,text,boolean,integer) to authenticated;
