-- 既存の緩いポリシーを削除し、管理者限定のRLSへ置換

-- events
drop policy if exists "Enable ALL for authenticated users only" on public.events;
drop policy if exists "Enable insert for authenticated users only" on public.events;
drop policy if exists "Enable update for authenticated users only" on public.events;
drop policy if exists "Enable delete for authenticated users only" on public.events;

-- event_tags
drop policy if exists "Enable ALL for authenticated users only" on public.event_tags;
drop policy if exists "Enable insert for authenticated users only" on public.event_tags;
drop policy if exists "Enable update for authenticated users only" on public.event_tags;
drop policy if exists "Enable delete for authenticated users only" on public.event_tags;

-- event_youtube_links
drop policy if exists "Enable ALL for authenticated users only" on public.event_youtube_links;
drop policy if exists "Enable insert for authenticated users only" on public.event_youtube_links;
drop policy if exists "Enable update for authenticated users only" on public.event_youtube_links;
drop policy if exists "Enable delete for authenticated users only" on public.event_youtube_links;

-- youtube_links
drop policy if exists "Enable ALL for authenticated users only" on public.youtube_links;
drop policy if exists "Enable insert for authenticated users only" on public.youtube_links;
drop policy if exists "Enable update for authenticated users only" on public.youtube_links;
drop policy if exists "Enable delete for authenticated users only" on public.youtube_links;

-- youtube_tags
drop policy if exists "Enable ALL for authenticated users only" on public.youtube_tags;
drop policy if exists "Enable insert for authenticated users only" on public.youtube_tags;
drop policy if exists "Enable update for authenticated users only" on public.youtube_tags;
drop policy if exists "Enable delete for authenticated users only" on public.youtube_tags;

-- storage.objects
drop policy if exists "Enable ALL for authenticated users only" on storage.objects;

-- 公開読み取り（既存のselect許可は維持/必要に応じて再作成）
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='events' and policyname='events_select_public'
  ) then
    create policy "events_select_public" on public.events for select to public using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='event_tags' and policyname='event_tags_select_public'
  ) then
    create policy "event_tags_select_public" on public.event_tags for select to public using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='event_youtube_links' and policyname='event_youtube_links_select_public'
  ) then
    create policy "event_youtube_links_select_public" on public.event_youtube_links for select to public using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='youtube_links' and policyname='youtube_links_select_public'
  ) then
    create policy "youtube_links_select_public" on public.youtube_links for select to public using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='youtube_tags' and policyname='youtube_tags_select_public'
  ) then
    create policy "youtube_tags_select_public" on public.youtube_tags for select to public using (true);
  end if;
end $$;

-- 管理者限定の書き込み系ポリシー
create policy "events_write_admin_only" on public.events for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "events_update_admin_only" on public.events for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "events_delete_admin_only" on public.events for delete to authenticated using (public.is_admin(auth.uid()));

create policy "event_tags_write_admin_only" on public.event_tags for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "event_tags_update_admin_only" on public.event_tags for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "event_tags_delete_admin_only" on public.event_tags for delete to authenticated using (public.is_admin(auth.uid()));

create policy "event_youtube_links_write_admin_only" on public.event_youtube_links for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "event_youtube_links_update_admin_only" on public.event_youtube_links for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "event_youtube_links_delete_admin_only" on public.event_youtube_links for delete to authenticated using (public.is_admin(auth.uid()));

create policy "youtube_links_write_admin_only" on public.youtube_links for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "youtube_links_update_admin_only" on public.youtube_links for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "youtube_links_delete_admin_only" on public.youtube_links for delete to authenticated using (public.is_admin(auth.uid()));

create policy "youtube_tags_write_admin_only" on public.youtube_tags for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "youtube_tags_update_admin_only" on public.youtube_tags for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "youtube_tags_delete_admin_only" on public.youtube_tags for delete to authenticated using (public.is_admin(auth.uid()));

-- ストレージ: 管理者のみ書き込み/削除
create policy "storage_objects_admin_write_only" on storage.objects for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "storage_objects_admin_update_only" on storage.objects for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "storage_objects_admin_delete_only" on storage.objects for delete to authenticated using (public.is_admin(auth.uid()));