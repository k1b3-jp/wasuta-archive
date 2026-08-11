-- Create a complete milestone draft atomically and reserve verification for reviewers.

drop policy if exists milestone_sources_write_editor on public.milestone_sources;
drop policy if exists occurrence_sources_write_editor on public.occurrence_sources;

create policy milestone_sources_select_editor
  on public.milestone_sources for select to authenticated
  using (public.has_role_at_least('viewer'));

create policy milestone_sources_insert_editor
  on public.milestone_sources for insert to authenticated
  with check (
    public.has_role_at_least('editor')
    and verification_status = 'unverified'
    and verified_by is null
    and verified_at is null
  );

create policy milestone_sources_update_reviewer
  on public.milestone_sources for update to authenticated
  using (public.has_role_at_least('reviewer'))
  with check (public.has_role_at_least('reviewer'));

create policy milestone_sources_delete_unverified_editor
  on public.milestone_sources for delete to authenticated
  using (
    public.has_role_at_least('editor')
    and verification_status = 'unverified'
  );

create policy occurrence_sources_select_editor
  on public.occurrence_sources for select to authenticated
  using (public.has_role_at_least('viewer'));

create policy occurrence_sources_insert_editor
  on public.occurrence_sources for insert to authenticated
  with check (
    public.has_role_at_least('editor')
    and verification_status = 'unverified'
    and verified_by is null
    and verified_at is null
  );

create policy occurrence_sources_update_reviewer
  on public.occurrence_sources for update to authenticated
  using (public.has_role_at_least('reviewer'))
  with check (public.has_role_at_least('reviewer'));

create policy occurrence_sources_delete_unverified_editor
  on public.occurrence_sources for delete to authenticated
  using (
    public.has_role_at_least('editor')
    and verification_status = 'unverified'
  );

create or replace function public.create_milestone_draft(
  draft_slug text,
  draft_title text,
  draft_kind text,
  draft_description text,
  draft_occurred_on date,
  draft_is_group_wide boolean,
  draft_source_url text,
  draft_source_title text,
  draft_source_kind text default 'web'
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  created_milestone_id bigint;
  created_occurrence_id bigint;
  selected_source_id bigint;
begin
  if not public.has_role_at_least('editor') then
    raise exception 'editor role required' using errcode = '42501';
  end if;

  if draft_slug is null or draft_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'valid milestone slug is required' using errcode = '22023';
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

  insert into public.sources (
    url, title, source_kind, availability_status, accessed_at
  )
  values (
    draft_source_url,
    btrim(draft_source_title),
    draft_source_kind,
    'unchecked',
    now()
  )
  on conflict (url) do update set
    title = excluded.title,
    accessed_at = excluded.accessed_at,
    updated_at = now()
  returning source_id into selected_source_id;

  insert into public.milestones (
    slug, title, kind, description, status
  )
  values (
    draft_slug,
    btrim(draft_title),
    btrim(draft_kind),
    nullif(btrim(draft_description), ''),
    'draft'
  )
  returning milestone_id into created_milestone_id;

  insert into public.milestone_sources (
    milestone_id, source_id, fact_kind, verification_status
  )
  values (
    created_milestone_id, selected_source_id, 'title', 'unverified'
  );

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
    draft_occurred_on,
    'day',
    coalesce(draft_is_group_wide, false),
    'draft',
    created_milestone_id
  )
  returning occurrence_id into created_occurrence_id;

  insert into public.occurrence_sources (
    occurrence_id, source_id, fact_kind, verification_status
  )
  values (
    created_occurrence_id, selected_source_id, 'occurred_on', 'unverified'
  );

  insert into public.archive_audit_log (
    entity_type, entity_id, action, to_status, actor_id
  )
  values (
    'milestone', created_milestone_id, 'create_draft', 'draft', auth.uid()
  );

  return created_milestone_id;
end;
$$;

revoke all on function public.create_milestone_draft(
  text, text, text, text, date, boolean, text, text, text
) from public;

grant execute on function public.create_milestone_draft(
  text, text, text, text, date, boolean, text, text, text
) to authenticated;
