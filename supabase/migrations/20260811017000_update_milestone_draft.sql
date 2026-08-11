-- Allow editors to revise a sourced milestone while it remains a draft.

create or replace function public.update_milestone_draft(
  milestone_to_update bigint,
  draft_title text,
  draft_kind text,
  draft_description text,
  draft_occurred_on date,
  draft_is_group_wide boolean,
  draft_source_url text,
  draft_source_title text,
  draft_source_kind text default 'web'
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  selected_source_id bigint;
  selected_occurrence_id bigint;
begin
  if not public.has_role_at_least('editor') then
    raise exception 'editor role required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.milestones
    where milestone_id = milestone_to_update and status = 'draft'
    for update
  ) then
    raise exception 'editable milestone draft not found' using errcode = 'P0002';
  end if;
  if nullif(btrim(draft_title), '') is null or length(btrim(draft_title)) > 200 then
    raise exception 'valid milestone title is required' using errcode = '22023';
  end if;
  if nullif(btrim(draft_kind), '') is null or length(btrim(draft_kind)) > 80 then
    raise exception 'valid milestone kind is required' using errcode = '22023';
  end if;
  if draft_occurred_on is null then
    raise exception 'milestone date is required' using errcode = '22023';
  end if;
  if draft_source_url is null or draft_source_url !~ '^https?://' then
    raise exception 'absolute http source URL is required' using errcode = '22023';
  end if;
  if nullif(btrim(draft_source_title), '') is null then
    raise exception 'source title is required' using errcode = '22023';
  end if;
  if draft_source_kind not in ('official', 'web', 'video', 'social', 'book', 'internal') then
    raise exception 'invalid source kind' using errcode = '22023';
  end if;

  select occurrence_id into selected_occurrence_id
  from public.timeline_occurrences
  where milestone_id = milestone_to_update and status = 'draft'
  for update;
  if selected_occurrence_id is null then
    raise exception 'editable milestone occurrence not found' using errcode = 'P0002';
  end if;

  insert into public.sources (url, title, source_kind, availability_status, accessed_at)
  values (draft_source_url, btrim(draft_source_title), draft_source_kind, 'unchecked', now())
  on conflict (url) do update set
    title = excluded.title,
    source_kind = excluded.source_kind,
    accessed_at = excluded.accessed_at,
    updated_at = now()
  returning source_id into selected_source_id;

  update public.milestones set
    title = btrim(draft_title),
    kind = btrim(draft_kind),
    description = nullif(btrim(draft_description), ''),
    updated_at = now()
  where milestone_id = milestone_to_update;

  update public.timeline_occurrences set
    occurred_on = draft_occurred_on,
    is_group_wide = coalesce(draft_is_group_wide, false),
    updated_at = now()
  where occurrence_id = selected_occurrence_id;

  delete from public.milestone_sources where milestone_id = milestone_to_update;
  insert into public.milestone_sources (milestone_id, source_id, fact_kind, verification_status)
  values (milestone_to_update, selected_source_id, 'title', 'unverified');

  delete from public.occurrence_sources where occurrence_id = selected_occurrence_id;
  insert into public.occurrence_sources (occurrence_id, source_id, fact_kind, verification_status)
  values (selected_occurrence_id, selected_source_id, 'occurred_on', 'unverified');

  insert into public.archive_audit_log (
    entity_type, entity_id, action, from_status, to_status, actor_id
  ) values (
    'milestone', milestone_to_update, 'update_draft', 'draft', 'draft', auth.uid()
  );
end;
$$;

revoke all on function public.update_milestone_draft(
  bigint, text, text, text, date, boolean, text, text, text
) from public;
grant execute on function public.update_milestone_draft(
  bigint, text, text, text, date, boolean, text, text, text
) to authenticated;
