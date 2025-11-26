-- 認証ユーザーによる動画登録を許可するためのRLS緩和

-- 既存の admin 限定 Insert ポリシーを削除
drop policy if exists "youtube_links_write_admin_only" on public.youtube_links;
drop policy if exists "youtube_tags_write_admin_only" on public.youtube_tags;
drop policy if exists "event_youtube_links_write_admin_only" on public.event_youtube_links;

-- Insert は認証ユーザーなら許可（Update/Delete は従来通り admin のみ）
create policy "youtube_links_insert_authenticated"
  on public.youtube_links
  for insert
  to authenticated
  with check (true);

create policy "youtube_tags_insert_authenticated"
  on public.youtube_tags
  for insert
  to authenticated
  with check (true);

create policy "event_youtube_links_insert_authenticated"
  on public.event_youtube_links
  for insert
  to authenticated
  with check (true);

