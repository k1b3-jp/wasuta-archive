-- Generated from data/research/official-discography.json.
-- Stores official public jacket URLs only. Image files are not copied.

create temporary table official_song_image_seed (
  song_title text not null,
  source_title text not null,
  source_published_on date not null,
  source_url text not null,
  image_url text not null
) on commit drop;

insert into official_song_image_seed (
  song_title, source_title, source_published_on, source_url, image_url
)
values
  ('Cat Walkin''', 'Cat Walkin''', '2022-07-18', 'https://wa-suta.world/discography/detail.php?id=1019235', 'https://img.imageimg.net/artist/tws/img/product_1034610.jpg'),
  ('Congrats!', '春花火', '2021-03-03', 'https://wa-suta.world/discography/detail.php?id=1017975', 'https://img.imageimg.net/artist/tws/img/product_1032401.jpg'),
  ('Do on Do ～坊っちゃんいっしょに踊りゃんせ～', '遮二無二 生きる！ / バスタブ・アロマティック', '2019-10-30', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('Doki Doki♡today', 'いぬねこ。青春真っ盛り （イベント会場限定商品）SOLD OUT！', '2015-10-05', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('GOGO!プリパライフ', '最上級ぱらどっくす', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015206', 'https://img.imageimg.net/artist/tws/img/product_1026369.jpg'),
  ('JUMPING SUMMER', 'JUMPING SUMMER', '2018-06-20', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('Just be yourself', '「劇場版プリパラみ～んなでかがやけ！キラリン☆スターライブ！」主題歌
テレビ東京系アニメ「アイドルタイムプリパラ」オープニングテーマ
Just be yourself', '2017-04-19', 'https://wa-suta.world/discography/detail.php?id=1014810', 'https://img.imageimg.net/artist/tws/img/product_1025529.jpg'),
  ('KIRA KIRA ホログラム', 'GIRLS, BE AMBITIOUS!', '2018-10-31', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('Love Unmelt', 'CAT’CH THE WORLD', '2019-03-06', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('Magical Word', 'パラドックス ワールド', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('Never Ending The World', 'What''s "standard"!?', '2020-11-25', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('NEW にゃーくにゃくにゃ水族館2', 'パラドックス ワールド', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('Overture', 'いぬねこ。青春真っ盛り （イベント会場限定商品）SOLD OUT！', '2015-10-05', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('PLATONIC GIRL', 'JUMPING SUMMER', '2018-06-20', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('SHINING FLOWER', '遮二無二 生きる！ / バスタブ・アロマティック', '2019-10-30', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('Stay with me baby', 'パラドックス ワールド', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('Sweet Fancy Chu-n', 'Sweet Fancy Chu-n / アレグロめいてるランナップ', '2025-09-24', 'https://wa-suta.world/discography/detail.php?id=1020984', 'https://img.imageimg.net/artist/tws/img/product_1037657.jpg'),
  ('The World Standard Dancing Club', 'The World Standard Dancing Club', '2022-06-13', 'https://wa-suta.world/discography/detail.php?id=1019182', 'https://img.imageimg.net/artist/tws/img/product_1034515.jpg'),
  ('Tokimeki＊Sing A Song', 'すまん、犬。', '2023-02-22', 'https://wa-suta.world/discography/detail.php?id=1019474', 'https://img.imageimg.net/artist/tws/img/product_1034971.jpg'),
  ('TOXICATS', 'What''s "standard"!?', '2020-11-25', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('Zili Zili Love', 'いぬねこ。青春真っ盛り （イベント会場限定商品）SOLD OUT！', '2015-10-05', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('アレグロめいてるランナップ', 'Sweet Fancy Chu-n / アレグロめいてるランナップ', '2025-09-24', 'https://wa-suta.world/discography/detail.php?id=1020984', 'https://img.imageimg.net/artist/tws/img/product_1037657.jpg'),
  ('アンバランス・アンサーズ', 'The Legend of WASUTA', '2019-06-26', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('いぬねこ。青春真っ盛り', 'いぬねこ。青春真っ盛り （イベント会場限定商品）SOLD OUT！', '2015-10-05', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('いぬねこ。青春真っ盛り -2022 ver.-', '我々はネコである。', '2022-08-17', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('いまはむかし', 'The World Standard', '2016-05-04', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('うるとらみらくるくるふぁいなるアルティメットチョコびーむ', 'The World Standard', '2016-05-04', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('うるとらみらくるくるふぁいなるアルティメットチョコびーむ -2022 ver.-', '我々はネコである。', '2022-08-17', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('えいきゅーむちゅーでこうしんちゅっ！♡', 'えいきゅーむちゅーでこうしんちゅっ！♡', '2024-02-21', 'https://wa-suta.world/discography/detail.php?id=1020059', 'https://img.imageimg.net/artist/tws/img/product_1036045.jpg'),
  ('オーダーメイドとレディーメイド（廣川奈々聖&小玉梨々華）', '我々はネコである。', '2022-08-17', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('おやすみ', 'The Legend of WASUTA', '2019-06-26', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('きゅんビート（松田美里&三品瑠香）', '我々はネコである。', '2022-08-17', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('グーチョキパンツの正義さん', 'ゆうめいに、にゃりたい。', '2017-02-22', 'https://wa-suta.world/discography/detail.php?id=1014584', 'https://img.imageimg.net/artist/tws/img/product_1024941.jpg'),
  ('くらえ！必殺！！ねこパンチ★ ～私達、戦うにゃこたん【レベル５】～', 'CAT’CH THE WORLD', '2019-03-06', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('ぐるトレ', 'CAT’CH THE WORLD', '2019-03-06', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('サンデー！サンシャイン！', 'サンデー！サンシャイン！', '2020-08-12', 'https://wa-suta.world/discography/detail.php?id=1017614', 'https://img.imageimg.net/artist/tws/img/product_1031688.jpg'),
  ('スイカ割り', 'The World Standard', '2016-05-04', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('スーパーありがとう', 'CAT’CH THE WORLD', '2019-03-06', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('スタンドアロン・コンプレックス', 'JUMPING SUMMER', '2018-06-20', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('すまん、犬。', 'すまん、犬。', '2023-02-22', 'https://wa-suta.world/discography/detail.php?id=1019474', 'https://img.imageimg.net/artist/tws/img/product_1034971.jpg'),
  ('セラセラヴィ。', 'メロメロ！ラヴロック', '2023-08-30', 'https://wa-suta.world/discography/detail.php?id=1019811', 'https://img.imageimg.net/artist/tws/img/product_1035584.jpg'),
  ('タピオカミルクティー', 'JUMPING SUMMER', '2018-06-20', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('ちいさな ちいさな', 'いぬねこ。青春真っ盛り （イベント会場限定商品）SOLD OUT！', '2015-10-05', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('デデスパボン！', 'GIRLS, BE AMBITIOUS!', '2018-10-31', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('どんな君でも大好き♡ってお話', 'わったらいふ！', '2026-09-02', 'https://wa-suta.world/discography/detail.php?id=1021443', 'https://img.imageimg.net/artist/tws/img/product_1038496.jpg'),
  ('にこにこハンブンコ', 'The World Standard', '2016-05-04', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('ねぇ愛してみて', 'パラドックス ワールド', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('バスタブ・アロマティック', '遮二無二 生きる！ / バスタブ・アロマティック', '2019-10-30', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('ハロー to the world', 'What''s "standard"!?', '2020-11-25', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('ハロハロフレンズ', '最上級ぱらどっくす', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015206', 'https://img.imageimg.net/artist/tws/img/product_1026369.jpg'),
  ('ぱわわわわん!!! パワーパフ ガールズ', '完全なるアイドル', '2016-09-28', 'https://wa-suta.world/discography/detail.php?id=1014156', 'https://img.imageimg.net/artist/tws/img/product_1024074.jpg'),
  ('プリティー☆チャンネル', 'JUMPING SUMMER', '2018-06-20', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('プロローグ', 'CAT’CH THE WORLD', '2019-03-06', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('べちょべちょパンケーキ？ feat.そこの君。a.k.a.ヲタ', 'サンデー！サンシャイン！', '2020-08-12', 'https://wa-suta.world/discography/detail.php?id=1017614', 'https://img.imageimg.net/artist/tws/img/product_1031688.jpg'),
  ('マッシュ・ド・アート', '我々はネコである。', '2022-08-17', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('ミライバルダンス', 'ミライバルダンス', '2022-01-11', 'https://wa-suta.world/discography/detail.php?id=1018825', 'https://img.imageimg.net/artist/tws/img/product_1033908.jpg'),
  ('ミラクルマジカルヘルシーパワー', 'えいきゅーむちゅーでこうしんちゅっ！♡', '2024-02-21', 'https://wa-suta.world/discography/detail.php?id=1020059', 'https://img.imageimg.net/artist/tws/img/product_1036045.jpg'),
  ('メラにゃイザー !!!!! ～君に、あ・げ・う♪～', 'The Legend of WASUTA', '2019-06-26', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('メロメロ！ラヴロック', 'メロメロ！ラヴロック', '2023-08-30', 'https://wa-suta.world/discography/detail.php?id=1019811', 'https://img.imageimg.net/artist/tws/img/product_1035584.jpg'),
  ('やーだー', 'GIRLS, BE AMBITIOUS!', '2018-10-31', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('ゆうめいに、にゃりたい。', 'ゆうめいに、にゃりたい。', '2017-02-22', 'https://wa-suta.world/discography/detail.php?id=1014584', 'https://img.imageimg.net/artist/tws/img/product_1024941.jpg'),
  ('ゆるぷれいる', 'The Legend of WASUTA', '2019-06-26', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('ヨ・キエロ・ビビール', 'GIRLS, BE AMBITIOUS!', '2018-10-31', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('らんらん・時代', 'いぬねこ。青春真っ盛り （イベント会場限定商品）SOLD OUT！', '2015-10-05', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('リル・リル・トリップ', 'ミライバルダンス', '2022-01-11', 'https://wa-suta.world/discography/detail.php?id=1018825', 'https://img.imageimg.net/artist/tws/img/product_1033908.jpg'),
  ('わーるどすたんだーど', 'わーるどすたんだーど', '2025-02-26', 'https://wa-suta.world/discography/detail.php?id=1020631', 'https://img.imageimg.net/artist/tws/img/product_1037091.jpg'),
  ('わったらいふ！', 'わったらいふ！', '2026-09-02', 'https://wa-suta.world/discography/detail.php?id=1021443', 'https://img.imageimg.net/artist/tws/img/product_1038496.jpg'),
  ('ワンダフル・ワールド', 'The World Standard', '2016-05-04', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('悪戯ロマンス', 'わーるどすたんだーど', '2025-02-26', 'https://wa-suta.world/discography/detail.php?id=1020631', 'https://img.imageimg.net/artist/tws/img/product_1037091.jpg'),
  ('雨のキモチ', '詠み人知らずの青春歌', '2021-08-18', 'https://wa-suta.world/discography/detail.php?id=1018438', 'https://img.imageimg.net/artist/tws/img/product_1033212.jpg'),
  ('詠み人知らずの青春歌', '詠み人知らずの青春歌', '2021-08-18', 'https://wa-suta.world/discography/detail.php?id=1018438', 'https://img.imageimg.net/artist/tws/img/product_1033212.jpg'),
  ('詠み人知らずの青春歌 -2022 ver.-', '我々はネコである。', '2022-08-17', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('夏恋ジレンマ', '夏恋ジレンマ', '2024-08-21', 'https://wa-suta.world/discography/detail.php?id=1020288', 'https://img.imageimg.net/artist/tws/img/product_1036478.jpg'),
  ('完全なるアイドル', '完全なるアイドル', '2016-09-28', 'https://wa-suta.world/discography/detail.php?id=1014156', 'https://img.imageimg.net/artist/tws/img/product_1024074.jpg'),
  ('空とサカナ', '空とサカナ', '2022-05-30', 'https://wa-suta.world/discography/detail.php?id=1019147', 'https://img.imageimg.net/artist/tws/img/product_1034446.jpg'),
  ('君とtea for two♡', '夏恋ジレンマ', '2024-08-21', 'https://wa-suta.world/discography/detail.php?id=1020288', 'https://img.imageimg.net/artist/tws/img/product_1036478.jpg'),
  ('好きな人とか居ますか', 'The World Standard', '2016-05-04', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('最上級ぱらどっくす', '最上級ぱらどっくす', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015206', 'https://img.imageimg.net/artist/tws/img/product_1026369.jpg'),
  ('四季ドロップス', 'サンデー！サンシャイン！', '2020-08-12', 'https://wa-suta.world/discography/detail.php?id=1017614', 'https://img.imageimg.net/artist/tws/img/product_1031688.jpg'),
  ('遮二無二 生きる！', '遮二無二 生きる！ / バスタブ・アロマティック', '2019-10-30', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('春花火', '春花火', '2021-03-03', 'https://wa-suta.world/discography/detail.php?id=1017975', 'https://img.imageimg.net/artist/tws/img/product_1032401.jpg'),
  ('星の降らないタイムライン', 'メロメロ！ラヴロック', '2023-08-30', 'https://wa-suta.world/discography/detail.php?id=1019811', 'https://img.imageimg.net/artist/tws/img/product_1035584.jpg'),
  ('清濁あわせていただくにゃー', 'What''s "standard"!?', '2020-11-25', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('大志を抱け！カルビアンビシャス！', 'GIRLS, BE AMBITIOUS!', '2018-10-31', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('誰も悪くない', 'The Legend of WASUTA', '2019-06-26', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('暮れないハート', 'CAT’CH THE WORLD', '2019-03-06', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('萌ってかエモ', 'What''s "standard"!?', '2020-11-25', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('約束だから', 'パラドックス ワールド', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('恋するにゃこたん～フリもフラレもあなたのまま～', 'パラドックス ワールド', '2017-10-18', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('恋に恋する眠り姫', 'えいきゅーむちゅーでこうしんちゅっ！♡', '2024-02-21', 'https://wa-suta.world/discography/detail.php?id=1020059', 'https://img.imageimg.net/artist/tws/img/product_1036045.jpg');

do $$
begin
  if exists (
    select 1
    from official_song_image_seed seed
    left join public.songs song
      on lower(btrim(song.title)) = lower(btrim(seed.song_title))
    where song.song_id is null
  ) then
    raise exception 'Song image seed does not match the existing song data';
  end if;
end $$;

insert into public.sources (
  url, title, publisher, published_on, source_kind,
  availability_status, accessed_at
)
select distinct on (source_url)
       source_url, source_title, 'わーすた', source_published_on,
       'official', 'available', now()
from official_song_image_seed
order by source_url, source_published_on
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  published_on = excluded.published_on,
  source_kind = 'official',
  availability_status = 'available',
  accessed_at = now(),
  updated_at = now();

update public.songs song
set image_url = seed.image_url
from official_song_image_seed seed
where lower(btrim(song.title)) = lower(btrim(seed.song_title));

insert into public.song_sources (
  song_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at, note
)
select song.song_id, source.title, seed.source_url, current_date,
       source.source_id, 'image', 'verified', now(),
       '公式ディスコグラフィーで公開されている、初収録リリースの代表ジャケット画像URL。画像ファイルは複製していません。'
from official_song_image_seed seed
join public.songs song
  on lower(btrim(song.title)) = lower(btrim(seed.song_title))
join public.sources source on source.url = seed.source_url
where not exists (
  select 1
  from public.song_sources existing
  where existing.song_id = song.song_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'image'
);
