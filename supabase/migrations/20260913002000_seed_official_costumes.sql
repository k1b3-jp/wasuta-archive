-- Generated from data/research/official-costumes.json. Re-run `yarn research:costumes-migration` after refreshing the artifact.
-- Article publication dates are source metadata and must not be used as costume debut dates.

create temporary table official_costume_seed (
  slug text not null,
  name text not null,
  source_published_on date not null,
  source_url text not null
) on commit drop;

insert into official_costume_seed (slug, name, source_published_on, source_url)
values
  ('costume-03d311013b75657f', '制服衣装2024 A/W', '2024-12-19', 'https://tws-tws.com/contents/1045435'),
  ('costume-f133ef3d6166e357', '「わーるどすたんだーど」衣装', '2024-12-03', 'https://tws-tws.com/contents/1045436'),
  ('costume-3b375def7ef27122', '「夏恋ジレンマ」衣装', '2024-06-07', 'https://tws-tws.com/contents/1045437'),
  ('costume-dbe178e6a1626fc5', '制服衣装2024 S/S', '2024-04-05', 'https://tws-tws.com/contents/1045439'),
  ('costume-1da492c6ca4f7c2e', '「わーすた9周年ライブ」衣装', '2024-04-05', 'https://tws-tws.com/contents/1045438'),
  ('costume-744e3db3bd8146a0', '「えいきゅーむちゅーでこうしんちゅっ！♡」衣装', '2023-12-05', 'https://tws-tws.com/contents/1045442'),
  ('costume-42f3210e933f87d4', '制服衣装2023 A/W', '2023-10-17', 'https://tws-tws.com/contents/1045444'),
  ('costume-a80cbfdc8dc616d5', '「わーすたワンマンライブin沖縄」衣装', '2023-10-17', 'https://tws-tws.com/contents/1045443'),
  ('costume-990a518e8ff66132', '制服衣装2023 S/S', '2023-10-05', 'https://tws-tws.com/contents/1045446'),
  ('costume-df1189a21bcf417e', '「ミラクルマジカルヘルシーパワー衣装」衣装', '2023-09-28', 'https://tws-tws.com/contents/1045448'),
  ('costume-c00cf3bdb8d6de3e', '「メロメロ！ラヴロック」衣装', '2023-09-13', 'https://tws-tws.com/contents/1045450'),
  ('costume-ed22bc7718e9e94c', 'スタスタ衣装', '2023-04-10', 'https://tws-tws.com/contents/1045461'),
  ('costume-6e0cb71324d809e7', '制服衣装2021 A/W', '2023-04-10', 'https://tws-tws.com/contents/1045459'),
  ('costume-8cca5c34cc509fc8', '「詠み人知らずの青春歌」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045458'),
  ('costume-a7ef4bceb2d081e9', '制服衣装2021 S/S', '2023-04-10', 'https://tws-tws.com/contents/1045455'),
  ('costume-d6b3808da9466694', '「春花火」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045454'),
  ('costume-d51e6117e9d1ea67', 'What''s "standard"!?衣装', '2023-04-10', 'https://tws-tws.com/contents/1045452'),
  ('costume-d58099243edc9b94', '制服衣装2020S/S', '2023-04-10', 'https://tws-tws.com/contents/1045451'),
  ('costume-8dfcdebdfb1497cb', 'サンデー！サンシャイン！ 衣装', '2023-04-10', 'https://tws-tws.com/contents/1045462'),
  ('costume-750d9c55ebbed210', 'わーすた 5th Anniversary 衣装', '2023-04-10', 'https://tws-tws.com/contents/1045464'),
  ('costume-942294e6a1008d0e', '「わーすたBEST」 衣装', '2023-04-10', 'https://tws-tws.com/contents/1045466'),
  ('costume-d737ff5bc08f89c5', '「バスタブ・アロマティック」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045470'),
  ('costume-f2131a816fb3c6a0', '「遮二無二 生きる！」 衣装', '2023-04-10', 'https://tws-tws.com/contents/1045472'),
  ('costume-4b4d0318cc0b3f6c', 'MiniAL「The Legend of WASUTA」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045475'),
  ('costume-da92efaf7c696594', '3rdAL「CAT''CH THE WORLD」くらえ!必殺!!ねこパンチ★ ～私達、戦うにゃこたん【レベル5】～衣装', '2023-04-10', 'https://tws-tws.com/contents/1045477'),
  ('costume-6d4a021dcaa407fc', 'わーすたぷらねっと～Cinema～衣装', '2023-04-10', 'https://tws-tws.com/contents/1045481'),
  ('costume-f1297a254562af84', '制服衣装2018A/W', '2023-04-10', 'https://tws-tws.com/contents/1045485'),
  ('costume-09518479a7808327', '「すまん、犬。」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045490'),
  ('costume-6cba3ba89cc5eeca', '制服衣装2022 A/W', '2023-04-10', 'https://tws-tws.com/contents/1045489'),
  ('costume-945f1643693e05cd', '「我々はネコである」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045488'),
  ('costume-a707578f61e3c0b8', '制服衣装2022 S/S', '2023-04-10', 'https://tws-tws.com/contents/1045487'),
  ('costume-af9fda89024ef6b7', 'ミライバルダンス衣装', '2023-04-10', 'https://tws-tws.com/contents/1045486'),
  ('costume-b31b1ec5f854dd0c', 'JUMPING SUMMER ツアー セーラー衣装', '2023-04-10', 'https://tws-tws.com/contents/1045515'),
  ('costume-c5178a6a0805e692', 'わーすたぷらねっと～future～衣装', '2023-04-10', 'https://tws-tws.com/contents/1045514'),
  ('costume-211d041840a60539', '2stAL「JUMPING SUMMER 」タピオカミルクティー衣装', '2023-04-10', 'https://tws-tws.com/contents/1045513'),
  ('costume-b553321215fc7f21', 'わーすたぷらねっと～fantasy～衣装', '2023-04-10', 'https://tws-tws.com/contents/1045512'),
  ('costume-0ae7b689d83d0970', 'キラッとプリ チャン衣装', '2023-04-10', 'https://tws-tws.com/contents/1045511'),
  ('costume-4fe607ebd8c5f1a5', 'WELCOME TO DREAM衣装', '2023-04-10', 'https://tws-tws.com/contents/1045510'),
  ('costume-76aa16b85ceb044a', 'わーすたぷらねっと～Nature～衣装', '2023-04-10', 'https://tws-tws.com/contents/1045509'),
  ('costume-1248dc9604c60f54', '制服衣装2017S/S', '2023-04-10', 'https://tws-tws.com/contents/1045508'),
  ('costume-9867f4d83b245798', '制服衣装2017A/W', '2023-04-10', 'https://tws-tws.com/contents/1045507'),
  ('costume-e3ba4c7eb05e60f1', 'わーすたパリJAPAN EXPO衣装 パン衣装', '2023-04-10', 'https://tws-tws.com/contents/1045506'),
  ('costume-cfc8aa1b74c0815a', '3rd SG「Just be yourself」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045504'),
  ('costume-aba58b0d70430407', '2stAL「パラドックス ワールド 」最上級パラドックス衣装', '2023-04-10', 'https://tws-tws.com/contents/1045503'),
  ('costume-b75d3a72e51c0a30', '2ndSG「ゆうめいに、にゃりたい。」衣装', '2023-04-10', 'https://tws-tws.com/contents/1045502'),
  ('costume-9cfe045ec743fc3a', '制服衣装2016A/W', '2023-04-10', 'https://tws-tws.com/contents/1045501'),
  ('costume-b4aaf94e95a0b16a', '1stSG「完全なるアイドル」', '2023-04-10', 'https://tws-tws.com/contents/1045500'),
  ('costume-6600a033221dcc08', 'PPG衣装', '2023-04-10', 'https://tws-tws.com/contents/1045499'),
  ('costume-39fd0949970471b2', '制服衣装2016S/S', '2023-04-10', 'https://tws-tws.com/contents/1045498'),
  ('costume-0f54914ee55de0fa', 'DASAII衣装', '2023-04-10', 'https://tws-tws.com/contents/1045497'),
  ('costume-f7a93d3458de0b04', '1stAL「The World Standard」うるチョコ衣装', '2023-04-10', 'https://tws-tws.com/contents/1045496'),
  ('costume-a2e219f665bf700e', '制服衣装2015A/W', '2023-04-10', 'https://tws-tws.com/contents/1045495'),
  ('costume-056480957697af58', 'ディーラー衣装', '2023-04-10', 'https://tws-tws.com/contents/1045494'),
  ('costume-7e8b5d871688233d', '初期制服衣装', '2023-04-10', 'https://tws-tws.com/contents/1045492'),
  ('costume-af384288334eb5e6', '初期ネコミミ衣装', '2023-04-10', 'https://tws-tws.com/contents/1045491');

insert into public.sources (url, title, publisher, published_on, source_kind, availability_status, accessed_at)
select source_url, 'わーすた衣装博物館「' || name || '」', 'わーすた',
       source_published_on, 'official', 'available', now()
from official_costume_seed
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  published_on = excluded.published_on,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

insert into public.costumes (slug, name, status)
select seed.slug, seed.name, 'published'
from official_costume_seed seed
where not exists (
  select 1 from public.costumes costume
  where lower(btrim(costume.name)) = lower(btrim(seed.name))
);

update public.costumes costume
set slug = coalesce(costume.slug, seed.slug)
from official_costume_seed seed
where lower(btrim(costume.name)) = lower(btrim(seed.name));

insert into public.costume_sources (
  costume_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at,
  note
)
select costume.costume_id, source.title, seed.source_url, current_date, source.source_id,
       'name', 'verified', now(),
       '公開一覧で衣装名を確認。記事本文と画像は会員限定のため取得していません。'
from official_costume_seed seed
join public.costumes costume on lower(btrim(costume.name)) = lower(btrim(seed.name))
join public.sources source on source.url = seed.source_url
where not exists (
  select 1 from public.costume_sources existing
  where existing.costume_id = costume.costume_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'name'
);
