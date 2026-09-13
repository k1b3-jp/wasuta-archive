-- Generated from data/research/official-discography.json. Re-run `yarn research:songs-migration` after refreshing the artifact.
-- Official release dates are recorded independently from first-performance dates.

create temporary table official_song_seed (
  slug text not null,
  title text not null,
  release_date date not null,
  source_title text not null,
  source_url text not null
) on commit drop;

insert into official_song_seed (slug, title, release_date, source_title, source_url)
values
  ('song-a6a4d34044c69b45', 'Cat Walkin''', '2022-07-18', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-a7ada333eed70d28', 'Congrats!', '2021-03-03', '春花火', 'https://wa-suta.world/discography/detail.php?id=1017975'),
  ('song-75b58dfe48debc2f', 'Do on Do ～坊っちゃんいっしょに踊りゃんせ～', '2019-10-30', '遮二無二 生きる！ / バスタブ・アロマティック', 'https://wa-suta.world/discography/detail.php?id=1017065'),
  ('song-197b070e13576ea7', 'Doki Doki♡today', '2015-10-05', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-40342a41c251a810', 'GOGO!プリパライフ', '2017-10-18', '最上級ぱらどっくす', 'https://wa-suta.world/discography/detail.php?id=1015206'),
  ('song-00bc4d67d87df375', 'JUMPING SUMMER', '2018-06-20', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-274d53982cc56195', 'Just be yourself', '2017-04-19', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-5146f87d0ae13ffe', 'KIRA KIRA ホログラム', '2018-10-31', 'GIRLS, BE AMBITIOUS!', 'https://wa-suta.world/discography/detail.php?id=1016075'),
  ('song-b33bad8a19f98aa2', 'Love Unmelt', '2019-03-06', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-1a94ebe065ef2d6c', 'Magical Word', '2017-10-18', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-ab504b6baeb95a7e', 'Never Ending The World', '2020-11-25', 'What''s "standard"!?', 'https://wa-suta.world/discography/detail.php?id=1017766'),
  ('song-c37bea867fb30b72', 'NEW にゃーくにゃくにゃ水族館2', '2017-10-18', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-481d0dfe9101c5c4', 'Overture', '2015-10-05', 'いぬねこ。青春真っ盛り （イベント会場限定商品）SOLD OUT！', 'https://wa-suta.world/discography/detail.php?id=1011013'),
  ('song-f4bde5dba53db582', 'PLATONIC GIRL', '2018-06-20', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-26a742f366199231', 'SHINING FLOWER', '2019-10-30', '遮二無二 生きる！ / バスタブ・アロマティック', 'https://wa-suta.world/discography/detail.php?id=1017065'),
  ('song-302c0c4a94830df2', 'Stay with me baby', '2017-10-18', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-61364aada3003c1f', 'Sweet Fancy Chu-n', '2025-09-24', 'Sweet Fancy Chu-n / アレグロめいてるランナップ', 'https://wa-suta.world/discography/detail.php?id=1020984'),
  ('song-269f899c19d08b40', 'The World Standard Dancing Club', '2022-06-13', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-7598a64c63232d73', 'Tokimeki＊Sing A Song', '2023-02-22', 'すまん、犬。', 'https://wa-suta.world/discography/detail.php?id=1019474'),
  ('song-a2f86da0645da75e', 'TOXICATS', '2020-11-25', 'What''s "standard"!?', 'https://wa-suta.world/discography/detail.php?id=1017766'),
  ('song-49675e97568a1bb9', 'Zili Zili Love', '2015-10-05', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-46b439e220875b02', 'アレグロめいてるランナップ', '2025-09-24', 'Sweet Fancy Chu-n / アレグロめいてるランナップ', 'https://wa-suta.world/discography/detail.php?id=1020984'),
  ('song-1205257225a4f71b', 'アンバランス・アンサーズ', '2019-06-26', 'The Legend of WASUTA', 'https://wa-suta.world/discography/detail.php?id=1016863'),
  ('song-2a2d34831c1c78f4', 'いぬねこ。青春真っ盛り', '2015-10-05', '「劇場版プリパラみ～んなでかがやけ！キラリン☆スターライブ！」主題歌
テレビ東京系アニメ「アイドルタイムプリパラ」オープニングテーマ
Just be yourself', 'https://wa-suta.world/discography/detail.php?id=1014810'),
  ('song-e8f1353306d7803d', 'いぬねこ。青春真っ盛り -2022 ver.-', '2022-08-17', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-09a83b7c078c01ce', 'いまはむかし', '2016-05-04', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-2e07cc4a82f8c40a', 'うるとらみらくるくるふぁいなるアルティメットチョコびーむ', '2016-05-04', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-3e98ee8818e37349', 'うるとらみらくるくるふぁいなるアルティメットチョコびーむ -2022 ver.-', '2022-08-17', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-da30cd243148ab5b', 'えいきゅーむちゅーでこうしんちゅっ！♡', '2024-02-21', 'えいきゅーむちゅーでこうしんちゅっ！♡', 'https://wa-suta.world/discography/detail.php?id=1020059'),
  ('song-92e8cd23b21e8fea', 'オーダーメイドとレディーメイド（廣川奈々聖&小玉梨々華）', '2022-08-17', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-57354998bdcfdfbc', 'おやすみ', '2019-06-26', 'The Legend of WASUTA', 'https://wa-suta.world/discography/detail.php?id=1016863'),
  ('song-7c39141886b3b161', 'きゅんビート（松田美里&三品瑠香）', '2022-08-17', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-52d65b531e8716de', 'グーチョキパンツの正義さん', '2017-02-22', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-7fa02af8a1d177e7', 'くらえ！必殺！！ねこパンチ★ ～私達、戦うにゃこたん【レベル５】～', '2019-03-06', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-31ff114e7170aae5', 'ぐるトレ', '2019-03-06', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-303f330d693c4041', 'サンデー！サンシャイン！', '2020-08-12', 'サンデー！サンシャイン！', 'https://wa-suta.world/discography/detail.php?id=1017614'),
  ('song-38e727255d199f12', 'スイカ割り', '2016-05-04', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-2ccb54fbc07213b8', 'スーパーありがとう', '2019-03-06', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-cbe85f0b90ced864', 'スタンドアロン・コンプレックス', '2018-06-20', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-9393efff5f4b189b', 'すまん、犬。', '2023-02-22', 'すまん、犬。', 'https://wa-suta.world/discography/detail.php?id=1019474'),
  ('song-a0bb7a1b25e81f3f', 'セラセラヴィ。', '2023-08-30', 'メロメロ！ラヴロック', 'https://wa-suta.world/discography/detail.php?id=1019811'),
  ('song-7c69a89a8adc767b', 'タピオカミルクティー', '2018-06-20', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-2eaf6b3049c377c2', 'ちいさな ちいさな', '2015-10-05', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-92b9213590aa9905', 'デデスパボン！', '2018-10-31', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-b64c32c697ca9005', 'どんな君でも大好き♡ってお話', '2026-09-02', 'わったらいふ！', 'https://wa-suta.world/discography/detail.php?id=1021443'),
  ('song-7a698b9a59394912', 'にこにこハンブンコ', '2016-05-04', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-5000956d0b0c3965', 'ねぇ愛してみて', '2017-10-18', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-1f4a32c585a4ceb6', 'バスタブ・アロマティック', '2019-10-30', '遮二無二 生きる！ / バスタブ・アロマティック', 'https://wa-suta.world/discography/detail.php?id=1017065'),
  ('song-c66babb885f6e328', 'ハロー to the world', '2020-11-25', 'What''s "standard"!?', 'https://wa-suta.world/discography/detail.php?id=1017766'),
  ('song-f5c07503067ea7a5', 'ハロハロフレンズ', '2017-10-18', '最上級ぱらどっくす', 'https://wa-suta.world/discography/detail.php?id=1015206'),
  ('song-97a6844ad15bbe9c', 'ぱわわわわん!!! パワーパフ ガールズ', '2016-09-28', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-0d0442412ca4f037', 'プリティー☆チャンネル', '2018-06-20', 'JUMPING SUMMER', 'https://wa-suta.world/discography/detail.php?id=1015772'),
  ('song-6bd711a0c587f0c0', 'プロローグ', '2019-03-06', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-2a30e2d7e313007d', 'べちょべちょパンケーキ？ feat.そこの君。a.k.a.ヲタ', '2020-08-12', 'サンデー！サンシャイン！', 'https://wa-suta.world/discography/detail.php?id=1017614'),
  ('song-f5a810eba2b0808c', 'マッシュ・ド・アート', '2022-08-17', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-f3dcb437d237b102', 'ミライバルダンス', '2022-01-11', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-1079ac9b23f36b08', 'ミラクルマジカルヘルシーパワー', '2024-02-21', 'えいきゅーむちゅーでこうしんちゅっ！♡', 'https://wa-suta.world/discography/detail.php?id=1020059'),
  ('song-e7edfc3f454d4082', 'メラにゃイザー !!!!! ～君に、あ・げ・う♪～', '2019-06-26', 'The Legend of WASUTA', 'https://wa-suta.world/discography/detail.php?id=1016863'),
  ('song-616f3c1cd7b09752', 'メロメロ！ラヴロック', '2023-08-30', 'メロメロ！ラヴロック', 'https://wa-suta.world/discography/detail.php?id=1019811'),
  ('song-048199a1bdc113bc', 'やーだー', '2018-10-31', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-27331fb7029fa28c', 'ゆうめいに、にゃりたい。', '2017-02-22', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-9e3bfa724a906571', 'ゆるぷれいる', '2019-06-26', 'The Legend of WASUTA', 'https://wa-suta.world/discography/detail.php?id=1016863'),
  ('song-331d2f98674a9199', 'ヨ・キエロ・ビビール', '2018-10-31', 'GIRLS, BE AMBITIOUS!', 'https://wa-suta.world/discography/detail.php?id=1016075'),
  ('song-814f4b920492544b', 'らんらん・時代', '2015-10-05', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-99282b96e2f970b8', 'リル・リル・トリップ', '2022-01-11', 'ミライバルダンス', 'https://wa-suta.world/discography/detail.php?id=1018825'),
  ('song-1aefb01ab6e33dad', 'わーるどすたんだーど', '2025-02-26', 'わーるどすたんだーど', 'https://wa-suta.world/discography/detail.php?id=1020631'),
  ('song-86fc509b47f825f4', 'わったらいふ！', '2026-09-02', 'わったらいふ！', 'https://wa-suta.world/discography/detail.php?id=1021443'),
  ('song-5c690016a85ec502', 'ワンダフル・ワールド', '2016-05-04', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-f6fee1740d14b6c3', '悪戯ロマンス', '2025-02-26', 'わーるどすたんだーど', 'https://wa-suta.world/discography/detail.php?id=1020631'),
  ('song-20ab5ce5f380b7c4', '雨のキモチ', '2021-08-18', '詠み人知らずの青春歌', 'https://wa-suta.world/discography/detail.php?id=1018438'),
  ('song-f3afa59bf045a465', '詠み人知らずの青春歌', '2021-08-18', '詠み人知らずの青春歌', 'https://wa-suta.world/discography/detail.php?id=1018438'),
  ('song-b0bc15e1a7dd5552', '詠み人知らずの青春歌 -2022 ver.-', '2022-08-17', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-40f415835d7047b4', '夏恋ジレンマ', '2024-08-21', '夏恋ジレンマ', 'https://wa-suta.world/discography/detail.php?id=1020288'),
  ('song-23e49b72819ad05b', '完全なるアイドル', '2016-09-28', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-4120e91ade5d134c', '空とサカナ', '2022-05-30', '我々はネコである。', 'https://wa-suta.world/discography/detail.php?id=1019116'),
  ('song-cee46324e553b300', '君とtea for two♡', '2024-08-21', '夏恋ジレンマ', 'https://wa-suta.world/discography/detail.php?id=1020288'),
  ('song-7ffee81f11eb3f4e', '好きな人とか居ますか', '2016-05-04', 'The World Standard', 'https://wa-suta.world/discography/detail.php?id=1011662'),
  ('song-4ab4cfd4603c056f', '最上級ぱらどっくす', '2017-10-18', '最上級ぱらどっくす', 'https://wa-suta.world/discography/detail.php?id=1015206'),
  ('song-291352c823cf8068', '四季ドロップス', '2020-08-12', 'サンデー！サンシャイン！', 'https://wa-suta.world/discography/detail.php?id=1017614'),
  ('song-227fa9162ee46ed3', '遮二無二 生きる！', '2019-10-30', '遮二無二 生きる！ / バスタブ・アロマティック', 'https://wa-suta.world/discography/detail.php?id=1017065'),
  ('song-09227d619c97754e', '春花火', '2021-03-03', '春花火', 'https://wa-suta.world/discography/detail.php?id=1017975'),
  ('song-cdfa851f29b30c10', '星の降らないタイムライン', '2023-08-30', 'メロメロ！ラヴロック', 'https://wa-suta.world/discography/detail.php?id=1019811'),
  ('song-3c8cca1da6cf5de4', '清濁あわせていただくにゃー', '2020-11-25', 'What''s "standard"!?', 'https://wa-suta.world/discography/detail.php?id=1017766'),
  ('song-439af1a75f6310f1', '大志を抱け！カルビアンビシャス！', '2018-10-31', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-3d0adb9cca992ddd', '誰も悪くない', '2019-06-26', 'The Legend of WASUTA', 'https://wa-suta.world/discography/detail.php?id=1016863'),
  ('song-3fb5cdd1e0130d51', '暮れないハート', '2019-03-06', 'CAT’CH THE WORLD', 'https://wa-suta.world/discography/detail.php?id=1016369'),
  ('song-b4911406959c409e', '萌ってかエモ', '2020-11-25', 'What''s "standard"!?', 'https://wa-suta.world/discography/detail.php?id=1017766'),
  ('song-f0917c7dcf944a07', '約束だから', '2017-10-18', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-81f5a2cdb7c2fc3d', '恋するにゃこたん～フリもフラレもあなたのまま～', '2017-10-18', 'パラドックス ワールド', 'https://wa-suta.world/discography/detail.php?id=1015207'),
  ('song-ec5c6178e66eff21', '恋に恋する眠り姫', '2024-02-21', 'えいきゅーむちゅーでこうしんちゅっ！♡', 'https://wa-suta.world/discography/detail.php?id=1020059');

insert into public.sources (url, title, publisher, published_on, source_kind, availability_status, accessed_at)
select distinct on (source_url)
       source_url, source_title, 'わーすた', release_date, 'official', 'available', now()
from official_song_seed
order by source_url, release_date
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  published_on = excluded.published_on,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

insert into public.songs (slug, title, release_date, status)
select seed.slug, seed.title, seed.release_date, 'published'
from official_song_seed seed
where not exists (
  select 1 from public.songs song
  where lower(btrim(song.title)) = lower(btrim(seed.title))
);

update public.songs song
set release_date = coalesce(song.release_date, seed.release_date),
    slug = coalesce(song.slug, seed.slug)
from official_song_seed seed
where lower(btrim(song.title)) = lower(btrim(seed.title));

insert into public.song_sources (
  song_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at
)
select song.song_id, seed.source_title, seed.source_url, current_date, source.source_id,
       fact.fact_kind, 'verified', now()
from official_song_seed seed
join public.songs song on lower(btrim(song.title)) = lower(btrim(seed.title))
join public.sources source on source.url = seed.source_url
cross join (values ('title'), ('release_date')) as fact(fact_kind)
where not exists (
  select 1 from public.song_sources existing
  where existing.song_id = song.song_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = fact.fact_kind
);

insert into public.timeline_occurrences (
  occurrence_kind, occurred_on, date_precision, is_group_wide, status, song_id
)
select 'release', seed.release_date, 'day', true, 'published', song.song_id
from official_song_seed seed
join public.songs song on lower(btrim(song.title)) = lower(btrim(seed.title))
where not exists (
  select 1 from public.timeline_occurrences occurrence
  where occurrence.song_id = song.song_id and occurrence.occurrence_kind = 'release'
);

insert into public.occurrence_sources (
  occurrence_id, source_id, fact_kind, verification_status, verified_at
)
select occurrence.occurrence_id, source.source_id, 'occurred_on', 'verified', now()
from official_song_seed seed
join public.songs song on lower(btrim(song.title)) = lower(btrim(seed.title))
join public.timeline_occurrences occurrence
  on occurrence.song_id = song.song_id and occurrence.occurrence_kind = 'release'
join public.sources source on source.url = seed.source_url
on conflict do nothing;
