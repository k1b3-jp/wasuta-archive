-- Keep archive mutations behind the audited Security Definer RPCs. This also
-- narrows local databases that briefly applied the preceding grant migration
-- while it was being validated.
revoke insert, update, delete on table
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
from authenticated;
