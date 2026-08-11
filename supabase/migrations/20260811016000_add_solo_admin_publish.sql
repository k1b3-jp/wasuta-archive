-- Solo-maintainer shortcut: verify and publish a milestone in one admin action.

create or replace function public.confirm_and_publish_milestone(
  milestone_to_publish bigint
)
returns public.milestones
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_status text;
  published public.milestones;
begin
  if not public.has_role_at_least('admin') then
    raise exception 'admin role required' using errcode = '42501';
  end if;

  select status into current_status
  from public.milestones
  where milestone_id = milestone_to_publish;

  if current_status not in ('draft', 'review') then
    raise exception 'milestone must be in draft or review status' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.milestone_sources
    where milestone_id = milestone_to_publish
  ) then
    raise exception 'at least one milestone source is required' using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.timeline_occurrences
    where milestone_id = milestone_to_publish
      and occurred_on is not null
      and status in ('draft', 'review')
  ) then
    raise exception 'milestone occurrence date is required' using errcode = '23514';
  end if;

  update public.milestone_sources
  set verification_status = 'verified',
      verified_by = auth.uid(),
      verified_at = now()
  where milestone_id = milestone_to_publish;

  update public.occurrence_sources occurrence_source
  set verification_status = 'verified',
      verified_by = auth.uid(),
      verified_at = now()
  where exists (
    select 1
    from public.timeline_occurrences occurrence
    where occurrence.occurrence_id = occurrence_source.occurrence_id
      and occurrence.milestone_id = milestone_to_publish
  );

  update public.sources source
  set availability_status = 'available',
      accessed_at = now(),
      updated_at = now()
  where source.source_id in (
    select source_id
    from public.milestone_sources
    where milestone_id = milestone_to_publish
    union
    select occurrence_source.source_id
    from public.occurrence_sources occurrence_source
    join public.timeline_occurrences occurrence
      on occurrence.occurrence_id = occurrence_source.occurrence_id
    where occurrence.milestone_id = milestone_to_publish
  );

  if current_status = 'draft' then
    perform public.submit_milestone_for_review(milestone_to_publish);
  end if;

  select * into published
  from public.publish_milestone(milestone_to_publish);

  return published;
end;
$$;

revoke all on function public.confirm_and_publish_milestone(bigint) from public;
grant execute on function public.confirm_and_publish_milestone(bigint) to authenticated;
