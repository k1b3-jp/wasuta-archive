-- Tighten archive reads now that songs and costumes have publication status.

drop policy if exists "songs are publicly readable" on public.songs;
drop policy if exists "song sources are publicly readable" on public.song_sources;
drop policy if exists "song events are publicly readable" on public.song_events;
drop policy if exists "costumes are publicly readable" on public.costumes;
drop policy if exists "costume sources are publicly readable" on public.costume_sources;
drop policy if exists "costume events are publicly readable" on public.costume_events;

create policy songs_select_published
  on public.songs for select to public
  using (status = 'published');

create policy song_sources_select_verified
  on public.song_sources for select to public
  using (
    verification_status = 'verified'
    and exists (
      select 1 from public.songs
      where songs.song_id = song_sources.song_id
        and songs.status = 'published'
    )
  );

create policy song_events_select_published
  on public.song_events for select to public
  using (
    exists (
      select 1 from public.songs
      where songs.song_id = song_events.song_id
        and songs.status = 'published'
    )
  );

create policy costumes_select_published
  on public.costumes for select to public
  using (status = 'published');

create policy costume_sources_select_verified
  on public.costume_sources for select to public
  using (
    verification_status = 'verified'
    and exists (
      select 1 from public.costumes
      where costumes.costume_id = costume_sources.costume_id
        and costumes.status = 'published'
    )
  );

create policy costume_events_select_published
  on public.costume_events for select to public
  using (
    exists (
      select 1 from public.costumes
      where costumes.costume_id = costume_events.costume_id
        and costumes.status = 'published'
    )
  );

drop policy if exists song_members_select_public on public.song_members;
drop policy if exists costume_members_select_public on public.costume_members;
drop policy if exists milestone_members_select_public on public.milestone_members;
drop policy if exists milestone_events_select_public on public.milestone_events;
drop policy if exists milestone_sources_select_verified on public.milestone_sources;
drop policy if exists occurrence_members_select_public on public.occurrence_members;
drop policy if exists occurrence_sources_select_verified on public.occurrence_sources;

create policy song_members_select_published
  on public.song_members for select to public
  using (
    exists (
      select 1 from public.songs
      where songs.song_id = song_members.song_id
        and songs.status = 'published'
    )
  );

create policy costume_members_select_published
  on public.costume_members for select to public
  using (
    exists (
      select 1 from public.costumes
      where costumes.costume_id = costume_members.costume_id
        and costumes.status = 'published'
    )
  );

create policy milestone_members_select_published
  on public.milestone_members for select to public
  using (
    exists (
      select 1 from public.milestones
      where milestones.milestone_id = milestone_members.milestone_id
        and milestones.status = 'published'
    )
  );

create policy milestone_events_select_published
  on public.milestone_events for select to public
  using (
    exists (
      select 1 from public.milestones
      where milestones.milestone_id = milestone_events.milestone_id
        and milestones.status = 'published'
    )
  );

create policy milestone_sources_select_published_verified
  on public.milestone_sources for select to public
  using (
    verification_status = 'verified'
    and exists (
      select 1 from public.milestones
      where milestones.milestone_id = milestone_sources.milestone_id
        and milestones.status = 'published'
    )
  );

create policy occurrence_members_select_published
  on public.occurrence_members for select to public
  using (
    exists (
      select 1 from public.timeline_occurrences
      where timeline_occurrences.occurrence_id = occurrence_members.occurrence_id
        and timeline_occurrences.status = 'published'
    )
  );

create policy occurrence_sources_select_published_verified
  on public.occurrence_sources for select to public
  using (
    verification_status = 'verified'
    and exists (
      select 1 from public.timeline_occurrences
      where timeline_occurrences.occurrence_id = occurrence_sources.occurrence_id
        and timeline_occurrences.status = 'published'
    )
  );

create policy songs_write_admin
  on public.songs for all to authenticated
  using (public.has_role_at_least('admin'))
  with check (public.has_role_at_least('admin'));

create policy song_sources_write_admin
  on public.song_sources for all to authenticated
  using (public.has_role_at_least('admin'))
  with check (public.has_role_at_least('admin'));

create policy song_events_write_admin
  on public.song_events for all to authenticated
  using (public.has_role_at_least('admin'))
  with check (public.has_role_at_least('admin'));

create policy costumes_write_admin
  on public.costumes for all to authenticated
  using (public.has_role_at_least('admin'))
  with check (public.has_role_at_least('admin'));

create policy costume_sources_write_admin
  on public.costume_sources for all to authenticated
  using (public.has_role_at_least('admin'))
  with check (public.has_role_at_least('admin'));

create policy costume_events_write_admin
  on public.costume_events for all to authenticated
  using (public.has_role_at_least('admin'))
  with check (public.has_role_at_least('admin'));
