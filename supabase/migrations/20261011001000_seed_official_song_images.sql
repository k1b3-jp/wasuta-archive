-- Generated from data/research/official-discography.json.
-- Stores official public jacket URLs only. Image files are not copied.

create temporary table official_song_image_seed (
  song_title text not null,
  source_url text not null,
  image_url text not null
) on commit drop;

insert into official_song_image_seed (song_title, source_url, image_url)
values
  ('Cat Walkin''', 'https://wa-suta.world/discography/detail.php?id=1019235', 'https://img.imageimg.net/artist/tws/img/product_1034610.jpg'),
  ('Congrats!', 'https://wa-suta.world/discography/detail.php?id=1017975', 'https://img.imageimg.net/artist/tws/img/product_1032401.jpg'),
  ('Do on Do ～坊っちゃんいっしょに踊りゃんせ～', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('Doki Doki♡today', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('GOGO!プリパライフ', 'https://wa-suta.world/discography/detail.php?id=1015206', 'https://img.imageimg.net/artist/tws/img/product_1026369.jpg'),
  ('JUMPING SUMMER', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('Just be yourself', 'https://wa-suta.world/discography/detail.php?id=1014810', 'https://img.imageimg.net/artist/tws/img/product_1025529.jpg'),
  ('KIRA KIRA ホログラム', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('Love Unmelt', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('Magical Word', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('Never Ending The World', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('NEW にゃーくにゃくにゃ水族館2', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('Overture', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('PLATONIC GIRL', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('SHINING FLOWER', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('Stay with me baby', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('Sweet Fancy Chu-n', 'https://wa-suta.world/discography/detail.php?id=1020984', 'https://img.imageimg.net/artist/tws/img/product_1037657.jpg'),
  ('The World Standard Dancing Club', 'https://wa-suta.world/discography/detail.php?id=1019182', 'https://img.imageimg.net/artist/tws/img/product_1034515.jpg'),
  ('Tokimeki＊Sing A Song', 'https://wa-suta.world/discography/detail.php?id=1019474', 'https://img.imageimg.net/artist/tws/img/product_1034971.jpg'),
  ('TOXICATS', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('Zili Zili Love', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('アレグロめいてるランナップ', 'https://wa-suta.world/discography/detail.php?id=1020984', 'https://img.imageimg.net/artist/tws/img/product_1037657.jpg'),
  ('アンバランス・アンサーズ', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('いぬねこ。青春真っ盛り', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('いぬねこ。青春真っ盛り -2022 ver.-', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('いまはむかし', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('うるとらみらくるくるふぁいなるアルティメットチョコびーむ', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('うるとらみらくるくるふぁいなるアルティメットチョコびーむ -2022 ver.-', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('えいきゅーむちゅーでこうしんちゅっ！♡', 'https://wa-suta.world/discography/detail.php?id=1020059', 'https://img.imageimg.net/artist/tws/img/product_1036045.jpg'),
  ('オーダーメイドとレディーメイド（廣川奈々聖&小玉梨々華）', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('おやすみ', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('きゅんビート（松田美里&三品瑠香）', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('グーチョキパンツの正義さん', 'https://wa-suta.world/discography/detail.php?id=1014584', 'https://img.imageimg.net/artist/tws/img/product_1024941.jpg'),
  ('くらえ！必殺！！ねこパンチ★ ～私達、戦うにゃこたん【レベル５】～', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('ぐるトレ', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('サンデー！サンシャイン！', 'https://wa-suta.world/discography/detail.php?id=1017614', 'https://img.imageimg.net/artist/tws/img/product_1031688.jpg'),
  ('スイカ割り', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('スーパーありがとう', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('スタンドアロン・コンプレックス', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('すまん、犬。', 'https://wa-suta.world/discography/detail.php?id=1019474', 'https://img.imageimg.net/artist/tws/img/product_1034971.jpg'),
  ('セラセラヴィ。', 'https://wa-suta.world/discography/detail.php?id=1019811', 'https://img.imageimg.net/artist/tws/img/product_1035584.jpg'),
  ('タピオカミルクティー', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('ちいさな ちいさな', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('デデスパボン！', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('どんな君でも大好き♡ってお話', 'https://wa-suta.world/discography/detail.php?id=1021443', 'https://img.imageimg.net/artist/tws/img/product_1038496.jpg'),
  ('にこにこハンブンコ', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('ねぇ愛してみて', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('バスタブ・アロマティック', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('ハロー to the world', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('ハロハロフレンズ', 'https://wa-suta.world/discography/detail.php?id=1015206', 'https://img.imageimg.net/artist/tws/img/product_1026369.jpg'),
  ('ぱわわわわん!!! パワーパフ ガールズ', 'https://wa-suta.world/discography/detail.php?id=1014156', 'https://img.imageimg.net/artist/tws/img/product_1024074.jpg'),
  ('プリティー☆チャンネル', 'https://wa-suta.world/discography/detail.php?id=1015772', 'https://img.imageimg.net/artist/tws/img/product_1027662.jpg'),
  ('プロローグ', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('べちょべちょパンケーキ？ feat.そこの君。a.k.a.ヲタ', 'https://wa-suta.world/discography/detail.php?id=1017614', 'https://img.imageimg.net/artist/tws/img/product_1031688.jpg'),
  ('マッシュ・ド・アート', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('ミライバルダンス', 'https://wa-suta.world/discography/detail.php?id=1018825', 'https://img.imageimg.net/artist/tws/img/product_1033908.jpg'),
  ('ミラクルマジカルヘルシーパワー', 'https://wa-suta.world/discography/detail.php?id=1020059', 'https://img.imageimg.net/artist/tws/img/product_1036045.jpg'),
  ('メラにゃイザー !!!!! ～君に、あ・げ・う♪～', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('メロメロ！ラヴロック', 'https://wa-suta.world/discography/detail.php?id=1019811', 'https://img.imageimg.net/artist/tws/img/product_1035584.jpg'),
  ('やーだー', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('ゆうめいに、にゃりたい。', 'https://wa-suta.world/discography/detail.php?id=1014584', 'https://img.imageimg.net/artist/tws/img/product_1024941.jpg'),
  ('ゆるぷれいる', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('ヨ・キエロ・ビビール', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('らんらん・時代', 'https://wa-suta.world/discography/detail.php?id=1011013', 'https://img.imageimg.net/artist/tws/img/product_1017947.jpg'),
  ('リル・リル・トリップ', 'https://wa-suta.world/discography/detail.php?id=1018825', 'https://img.imageimg.net/artist/tws/img/product_1033908.jpg'),
  ('わーるどすたんだーど', 'https://wa-suta.world/discography/detail.php?id=1020631', 'https://img.imageimg.net/artist/tws/img/product_1037091.jpg'),
  ('わったらいふ！', 'https://wa-suta.world/discography/detail.php?id=1021443', 'https://img.imageimg.net/artist/tws/img/product_1038496.jpg'),
  ('ワンダフル・ワールド', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('悪戯ロマンス', 'https://wa-suta.world/discography/detail.php?id=1020631', 'https://img.imageimg.net/artist/tws/img/product_1037091.jpg'),
  ('雨のキモチ', 'https://wa-suta.world/discography/detail.php?id=1018438', 'https://img.imageimg.net/artist/tws/img/product_1033212.jpg'),
  ('詠み人知らずの青春歌', 'https://wa-suta.world/discography/detail.php?id=1018438', 'https://img.imageimg.net/artist/tws/img/product_1033212.jpg'),
  ('詠み人知らずの青春歌 -2022 ver.-', 'https://wa-suta.world/discography/detail.php?id=1019116', 'https://img.imageimg.net/artist/tws/img/product_1034392.jpg'),
  ('夏恋ジレンマ', 'https://wa-suta.world/discography/detail.php?id=1020288', 'https://img.imageimg.net/artist/tws/img/product_1036478.jpg'),
  ('完全なるアイドル', 'https://wa-suta.world/discography/detail.php?id=1014156', 'https://img.imageimg.net/artist/tws/img/product_1024074.jpg'),
  ('空とサカナ', 'https://wa-suta.world/discography/detail.php?id=1019147', 'https://img.imageimg.net/artist/tws/img/product_1034446.jpg'),
  ('君とtea for two♡', 'https://wa-suta.world/discography/detail.php?id=1020288', 'https://img.imageimg.net/artist/tws/img/product_1036478.jpg'),
  ('好きな人とか居ますか', 'https://wa-suta.world/discography/detail.php?id=1011662', 'https://img.imageimg.net/artist/tws/img/product_1019147.jpg'),
  ('最上級ぱらどっくす', 'https://wa-suta.world/discography/detail.php?id=1015206', 'https://img.imageimg.net/artist/tws/img/product_1026369.jpg'),
  ('四季ドロップス', 'https://wa-suta.world/discography/detail.php?id=1017614', 'https://img.imageimg.net/artist/tws/img/product_1031688.jpg'),
  ('遮二無二 生きる！', 'https://wa-suta.world/discography/detail.php?id=1017065', 'https://img.imageimg.net/artist/tws/img/product_1030633.jpg'),
  ('春花火', 'https://wa-suta.world/discography/detail.php?id=1017975', 'https://img.imageimg.net/artist/tws/img/product_1032401.jpg'),
  ('星の降らないタイムライン', 'https://wa-suta.world/discography/detail.php?id=1019811', 'https://img.imageimg.net/artist/tws/img/product_1035584.jpg'),
  ('清濁あわせていただくにゃー', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('大志を抱け！カルビアンビシャス！', 'https://wa-suta.world/discography/detail.php?id=1016075', 'https://img.imageimg.net/artist/tws/img/product_1028328.jpg'),
  ('誰も悪くない', 'https://wa-suta.world/discography/detail.php?id=1016863', 'https://img.imageimg.net/artist/tws/img/product_1030217.jpg'),
  ('暮れないハート', 'https://wa-suta.world/discography/detail.php?id=1016369', 'https://img.imageimg.net/artist/tws/img/product_1029022.jpg'),
  ('萌ってかエモ', 'https://wa-suta.world/discography/detail.php?id=1017766', 'https://img.imageimg.net/artist/tws/img/product_1031992.jpg'),
  ('約束だから', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('恋するにゃこたん～フリもフラレもあなたのまま～', 'https://wa-suta.world/discography/detail.php?id=1015207', 'https://img.imageimg.net/artist/tws/img/product_1026370.jpg'),
  ('恋に恋する眠り姫', 'https://wa-suta.world/discography/detail.php?id=1020059', 'https://img.imageimg.net/artist/tws/img/product_1036045.jpg');

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
