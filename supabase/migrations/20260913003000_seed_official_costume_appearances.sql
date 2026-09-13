-- Generated from data/research/official-costume-appearances.json.
-- These dates are confirmed appearances, not claimed costume debut dates.

create temporary table official_costume_appearance_seed (
  costume_name text not null,
  appearance_date date not null,
  event_id integer not null,
  source_title text not null,
  source_url text not null
) on commit drop;

insert into official_costume_appearance_seed (
  costume_name, appearance_date, event_id, source_title, source_url
)
values
  ('「詠み人知らずの青春歌」衣装', '2021-09-04', 768, '「詠み人知らずの青春歌」mu-moショップスペシャルイベント', 'https://www.wa-suta.world/en/news/detail.php?id=1093769'),
  ('「我々はネコである」衣装', '2022-08-14', 799, '「我々はネコである。」mu-moショップスペシャルイベント②', 'https://www.wa-suta.world/en/schedule/detail.php?id=1094690'),
  ('「すまん、犬。」衣装', '2023-02-19', 817, '「すまん、犬。」mu-moショップスペシャルイベント', 'https://wa-suta.world/schedule/detail.php?id=1097487'),
  ('「メロメロ！ラヴロック」衣装', '2023-08-19', 834, '「メロメロ！ラヴロック」mu-moショップスペシャルイベント①', 'https://wa-suta.world/news/detail.php?id=1109896'),
  ('「ミラクルマジカルヘルシーパワー衣装」衣装', '2023-12-10', 842, '「えいきゅーむちゅーでこうしんちゅっ！♡」リリースイベント（大宮）', 'https://wa-suta.world/news/detail.php?id=1112790');

do $$
begin
  if exists (
    select 1
    from official_costume_appearance_seed seed
    left join public.costumes costume on costume.name = seed.costume_name
    left join public.events event on event.event_id = seed.event_id
      and event.date = seed.appearance_date
    where costume.costume_id is null or event.event_id is null
  ) then
    raise exception 'Costume appearance seed does not match the existing costume/event data';
  end if;
end $$;

insert into public.sources (
  url, title, publisher, published_on, source_kind,
  availability_status, accessed_at
)
select source_url, source_title, 'わーすた', null, 'official',
       'available', now()
from official_costume_appearance_seed
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

insert into public.costume_sources (
  costume_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at, note
)
select costume.costume_id, seed.source_title, seed.source_url, current_date,
       source.source_id, 'appearance', 'verified', now(),
       seed.appearance_date || 'の着用を公式告知で確認。初登場日の根拠ではありません。'
from official_costume_appearance_seed seed
join public.costumes costume on costume.name = seed.costume_name
join public.sources source on source.url = seed.source_url
where not exists (
  select 1
  from public.costume_sources existing
  where existing.costume_id = costume.costume_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'appearance'
);

insert into public.costume_events (costume_id, event_id, relation_type)
select costume.costume_id, seed.event_id, 'worn_at'
from official_costume_appearance_seed seed
join public.costumes costume on costume.name = seed.costume_name
join public.events event on event.event_id = seed.event_id
  and event.date = seed.appearance_date
on conflict (costume_id, event_id, relation_type) do nothing;
