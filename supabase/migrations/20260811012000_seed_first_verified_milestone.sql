-- Replace the timeline prototype milestone with a reviewed database record.

do $$
declare
  archive_source_id bigint;
  archive_milestone_id bigint;
  archive_occurrence_id bigint;
begin
  insert into public.sources (
    url, title, source_kind, availability_status, accessed_at
  )
  values (
    '/events/118',
    'わーすたアーカイブ 登録済みイベント情報',
    'internal',
    'available',
    '2026-08-11T00:00:00+09:00'
  )
  on conflict (url) do update set
    title = excluded.title,
    availability_status = excluded.availability_status
  returning source_id into archive_source_id;

  insert into public.milestones (
    slug, title, kind, description, status
  )
  values (
    'four-member-first-one-man-live',
    '4人体制初のワンマンライブ',
    'group_structure',
    '「The World Standard〜改めまして、わーすたです!〜」を開催。登録済みイベント情報に4人体制初のワンマンライブとして記録されています。',
    'published'
  )
  on conflict (slug) do update set
    title = excluded.title,
    kind = excluded.kind,
    description = excluded.description,
    status = excluded.status,
    updated_at = now()
  returning milestone_id into archive_milestone_id;

  insert into public.milestone_sources (
    milestone_id, source_id, fact_kind, verification_status, verified_at
  )
  values (
    archive_milestone_id,
    archive_source_id,
    'title',
    'verified',
    '2026-08-11T00:00:00+09:00'
  )
  on conflict (milestone_id, source_id, fact_kind) do update set
    verification_status = excluded.verification_status,
    verified_at = excluded.verified_at;

  if exists (select 1 from public.events where event_id = 118) then
    insert into public.milestone_events (milestone_id, event_id)
    values (archive_milestone_id, 118)
    on conflict do nothing;
  end if;

  select occurrence_id into archive_occurrence_id
  from public.timeline_occurrences
  where milestone_id = archive_milestone_id
    and occurrence_kind = 'milestone'
  limit 1;

  if archive_occurrence_id is null then
    insert into public.timeline_occurrences (
      occurrence_kind,
      occurred_on,
      date_precision,
      is_group_wide,
      status,
      milestone_id
    )
    values (
      'milestone',
      '2022-01-10',
      'day',
      true,
      'published',
      archive_milestone_id
    )
    returning occurrence_id into archive_occurrence_id;
  end if;

  insert into public.occurrence_sources (
    occurrence_id, source_id, fact_kind, verification_status, verified_at
  )
  values (
    archive_occurrence_id,
    archive_source_id,
    'occurred_on',
    'verified',
    '2026-08-11T00:00:00+09:00'
  )
  on conflict (occurrence_id, source_id, fact_kind) do update set
    verification_status = excluded.verification_status,
    verified_at = excluded.verified_at;
end $$;
