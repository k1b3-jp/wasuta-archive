-- RLS policies do not grant table privileges by themselves. Make the archive
-- readable through its public policies on a database rebuilt from migrations.
-- Writes remain available only through the explicitly granted RPC workflows.

grant usage on schema public to anon, authenticated;

grant select on table
  public.events,
  public.members,
  public.sources,
  public.songs,
  public.song_sources,
  public.song_events,
  public.song_members,
  public.costumes,
  public.costume_sources,
  public.costume_events,
  public.costume_members,
  public.milestones,
  public.milestone_sources,
  public.milestone_events,
  public.milestone_members,
  public.event_sources,
  public.event_members,
  public.timeline_occurrences,
  public.occurrence_sources,
  public.occurrence_members
to anon, authenticated;

grant select on table public.archive_audit_log to authenticated;
