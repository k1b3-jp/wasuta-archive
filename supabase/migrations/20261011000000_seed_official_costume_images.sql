-- Generated from data/research/official-costumes.json.
-- Stores official public thumbnail URLs only. Image files are not copied.

create temporary table official_costume_image_seed (
  costume_name text not null,
  source_url text not null,
  image_url text not null
) on commit drop;

insert into official_costume_image_seed (costume_name, source_url, image_url)
values
  ('制服衣装2024 A/W', 'https://tws-tws.com/contents/1045435', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236916/medium_e1458aea78bf4b238907a3d70146075c93236a4e0ba563c570d65c5038e595d5.jpg'),
  ('「わーるどすたんだーど」衣装', 'https://tws-tws.com/contents/1045436', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236917/medium_5ca5247917cf26efdf4f7879fea663a7c9a4bee71ab2d6f2ec077b0f572bda1d.jpg'),
  ('「夏恋ジレンマ」衣装', 'https://tws-tws.com/contents/1045437', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236918/medium_770c1eee858c9b2298fa50ad7b0ca66bd98043eb52feed24682c3d10d62335bf.jpg'),
  ('制服衣装2024 S/S', 'https://tws-tws.com/contents/1045439', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236920/medium_5ab24d82c5367b4f06bc0c73fc9177f22292018da852b356f6ce66b108dd140c.jpg'),
  ('「わーすた9周年ライブ」衣装', 'https://tws-tws.com/contents/1045438', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236919/medium_02a88bae74631eb5bf99945865cba12ece3e9818ec37493fd8e01586a1932619.jpg'),
  ('「えいきゅーむちゅーでこうしんちゅっ！♡」衣装', 'https://tws-tws.com/contents/1045442', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236921/medium_7edb9ec2331edca676e27acb1248b7a1bf40dd1cc7f173e295cd5d44e2b7b4ce.jpg'),
  ('制服衣装2023 A/W', 'https://tws-tws.com/contents/1045444', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236923/medium_f6f6301beaae32fb3eac7bb4aa81459250833b5269811cad103de37647ff340b.jpg'),
  ('「わーすたワンマンライブin沖縄」衣装', 'https://tws-tws.com/contents/1045443', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236922/medium_090a31e9a1d10555f4aad7cc7ca4c2c2111603b9ca7cc48cf1c83ba9e7ac296f.jpg'),
  ('制服衣装2023 S/S', 'https://tws-tws.com/contents/1045446', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236924/medium_63051b07c57f8a33abfd8ff91c4e5adc8061b13f65d040a889363bd7d517ce70.jpg'),
  ('「ミラクルマジカルヘルシーパワー衣装」衣装', 'https://tws-tws.com/contents/1045448', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236925/medium_240ea7e29b1ca09c2cab04d630efe27c210956c62618769fa9751ec6dcf711eb.jpg'),
  ('「メロメロ！ラヴロック」衣装', 'https://tws-tws.com/contents/1045450', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236926/medium_1c783982469f85e2f232d4edc564e1fe4687528187342846f18b4906b73bf32f.jpg'),
  ('スタスタ衣装', 'https://tws-tws.com/contents/1045461', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236933/medium_dc434a88ac1d978ce2c89a6ce937d93610de5af8679fdaf84cfe11da9a7634f7.jpg'),
  ('制服衣装2021 A/W', 'https://tws-tws.com/contents/1045459', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236932/medium_3fa223e6dca34feb68ca3347639bec02cc9fbe6818a444d2c63c657f9878cf8f.jpg'),
  ('「詠み人知らずの青春歌」衣装', 'https://tws-tws.com/contents/1045458', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236931/medium_ce93994eb7af6f482ea8df27824aacaf9ab7fd9926379ee98cad90c194e4321a.jpg'),
  ('制服衣装2021 S/S', 'https://tws-tws.com/contents/1045455', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236930/medium_e925a97b24c0e5502cf3f5518e1f945a009b0fb1375e187b171bb4f8264f56d1.jpg'),
  ('「春花火」衣装', 'https://tws-tws.com/contents/1045454', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236929/medium_97e8f87abd61c3d0a8a407794a1080a0dc6d69711b959d8ab5d654dd23ceeab1.jpg'),
  ('What''s "standard"!?衣装', 'https://tws-tws.com/contents/1045452', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236928/medium_638b424446d91ffec58351104341f2a4f7d7692299a660671a263edb905419ba.jpg'),
  ('制服衣装2020S/S', 'https://tws-tws.com/contents/1045451', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236927/medium_eb2f64958ee0ded24428ef6802d559317fe4f4f5166e651f8977513189df7fd8.jpg'),
  ('サンデー！サンシャイン！ 衣装', 'https://tws-tws.com/contents/1045462', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236934/medium_db1c0fdde686a391b056c6ba5531f573bf44a36e1c9b4ae7e62e1dcdf87cdc9a.jpg'),
  ('わーすた 5th Anniversary 衣装', 'https://tws-tws.com/contents/1045464', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236935/medium_73ff3efc1fd388bf9273e359be234f09569df5f84bb4c4696062aaaa4ac80cd0.jpg'),
  ('「わーすたBEST」 衣装', 'https://tws-tws.com/contents/1045466', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236936/medium_c6f6b309ceb7665a694eb48afbf259d371501fc703e64dd0d82d2dfea4e143ed.jpg'),
  ('「バスタブ・アロマティック」衣装', 'https://tws-tws.com/contents/1045470', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236937/medium_7f2464742a6b1b65ffe120d731bdadd777beb709d392ee68145a1e5f2e3dfef1.jpg'),
  ('「遮二無二 生きる！」 衣装', 'https://tws-tws.com/contents/1045472', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236938/medium_1d3df741a1d5ac6df4d57161620abfac2c4ac40d54ea1c7ce793538037b7b806.jpg'),
  ('MiniAL「The Legend of WASUTA」衣装', 'https://tws-tws.com/contents/1045475', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236939/medium_dc12b8ac8434c1cbab120e90922895c3ee517ee5cd586c0c787c373f2fd9ae97.jpg'),
  ('3rdAL「CAT''CH THE WORLD」くらえ!必殺!!ねこパンチ★ ～私達、戦うにゃこたん【レベル5】～衣装', 'https://tws-tws.com/contents/1045477', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236940/medium_c412e14e4a48aa82ee6c934af6d9487b99559231892a3aaa8ace75ec54d16446.jpg'),
  ('わーすたぷらねっと～Cinema～衣装', 'https://tws-tws.com/contents/1045481', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236941/medium_0175b5098f4d257a358f7537b851477691a44087820bb5744ff32d4e0bcd571b.jpg'),
  ('制服衣装2018A/W', 'https://tws-tws.com/contents/1045485', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236942/medium_5014be907972d345e8315e1f124974567a266953ecfea213a4ba9dce954ff344.jpg'),
  ('「すまん、犬。」衣装', 'https://tws-tws.com/contents/1045490', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236947/medium_bfad86235a7b804a94631aa85cb000ea663f28334a141ca6357b72d949c0751d.jpg'),
  ('制服衣装2022 A/W', 'https://tws-tws.com/contents/1045489', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236946/medium_7fc7d8c848b99354375ea5893950b38ca21508c5fb15c17851cecb9b222b3e02.jpg'),
  ('「我々はネコである」衣装', 'https://tws-tws.com/contents/1045488', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236945/medium_4896855c77b7c60d6b118031bab2b24ed5d44d2a53de5ded2d21563f05cc6e57.jpg'),
  ('制服衣装2022 S/S', 'https://tws-tws.com/contents/1045487', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236944/medium_763b9bb1901712780c98fc0eaf8b2c564cabb87742780e8fd5526f9992a24c5b.jpg'),
  ('ミライバルダンス衣装', 'https://tws-tws.com/contents/1045486', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236943/medium_0a44206e0fa3e14afdbca5330f41e8006cbf40a390404c3073700054fc60c853.jpg'),
  ('JUMPING SUMMER ツアー セーラー衣装', 'https://tws-tws.com/contents/1045515', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236971/medium_6d05bae78c35e7b27b7cb0d3f5ab056493ad190a02ec30770b68f4cce95b3581.jpg'),
  ('わーすたぷらねっと～future～衣装', 'https://tws-tws.com/contents/1045514', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236970/medium_8d8a708c958e285e740b79c865ae7c1557e9add1130e9454ac18678eac3e2091.jpg'),
  ('2stAL「JUMPING SUMMER 」タピオカミルクティー衣装', 'https://tws-tws.com/contents/1045513', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236969/medium_f071fb2e90a92fb3536e14369f059d5dba589d6fd1703216200507ddff26d8f4.jpg'),
  ('わーすたぷらねっと～fantasy～衣装', 'https://tws-tws.com/contents/1045512', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236968/medium_197969e49bbbc94983b874708009d7a6330b547eb2ba3489c443d3b25ddcbe09.jpg'),
  ('キラッとプリ チャン衣装', 'https://tws-tws.com/contents/1045511', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236967/medium_a11e1296943e4000cd8bffce95a63b08a879bd14ea1bcfc689626ef6279fb2c7.jpg'),
  ('WELCOME TO DREAM衣装', 'https://tws-tws.com/contents/1045510', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236966/medium_f6660e22d1547ccba3c05a56d71bd8332d148a46b461e73100069ab1b2664205.jpg'),
  ('わーすたぷらねっと～Nature～衣装', 'https://tws-tws.com/contents/1045509', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236965/medium_cdef9aeb13ca529445769669809cda0fc8a6a55bcc9da1f98f3a8cd19365669e.jpg'),
  ('制服衣装2017S/S', 'https://tws-tws.com/contents/1045508', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236963/medium_80e5740b45d709c282d4165363fbf8dad944cd58c609fc950ed3e152e97b7af8.jpg'),
  ('制服衣装2017A/W', 'https://tws-tws.com/contents/1045507', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236962/medium_cfccfff9c3c9bc4695bd6388b2a31f8280e557a2bc896a8373156eab01db5dd4.jpg'),
  ('わーすたパリJAPAN EXPO衣装 パン衣装', 'https://tws-tws.com/contents/1045506', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236961/medium_139b4bbb9ea4eef93e135595b6d500ec1a30c0d4520184be01d3f5af82b7f762.jpg'),
  ('3rd SG「Just be yourself」衣装', 'https://tws-tws.com/contents/1045504', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236960/medium_b07db85b482d44c24727042dbf014beeffee6761dd628d39b60a15ae9ac790aa.jpg'),
  ('2stAL「パラドックス ワールド 」最上級パラドックス衣装', 'https://tws-tws.com/contents/1045503', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236959/medium_84598901e49af94bf8ca767e38fdf185d940a4e74242160cbac4d18571bb0d9c.jpg'),
  ('2ndSG「ゆうめいに、にゃりたい。」衣装', 'https://tws-tws.com/contents/1045502', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236958/medium_be8690746b9db3c3dc0772a82a19e2b840c759a558425f2434a1e499dff948ef.jpg'),
  ('制服衣装2016A/W', 'https://tws-tws.com/contents/1045501', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236957/medium_22e5a1aa9983fde66fc932f0a9c850cdc69825088b28bc3e71954790c812db3c.jpg'),
  ('1stSG「完全なるアイドル」', 'https://tws-tws.com/contents/1045500', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236956/medium_6c59c8ece27495b1b87c9ec5f1586fce94a470b28d6b1ef63538fc83b85e55bb.jpg'),
  ('PPG衣装', 'https://tws-tws.com/contents/1045499', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236955/medium_d234aa8ff850086274716896f86b416383e091b51e7e20b8e2ae93f02eaeb303.jpg'),
  ('制服衣装2016S/S', 'https://tws-tws.com/contents/1045498', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236954/medium_e69d1f7273b5d2fe1be2646ddb9f579365a5fc7fb2213912cfa05f331976619b.jpg'),
  ('DASAII衣装', 'https://tws-tws.com/contents/1045497', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236953/medium_c635835d0cb457de053d3a286938f02551f8699badc2fd5dfa9b16c0328596eb.jpg'),
  ('1stAL「The World Standard」うるチョコ衣装', 'https://tws-tws.com/contents/1045496', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236952/medium_cd12f3a66803b5023567f9723ca0d55d901d5e46d619231521623280949ecf1d.jpg'),
  ('制服衣装2015A/W', 'https://tws-tws.com/contents/1045495', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236951/medium_fef481cf42956abcbe59e48cc49ecededac77961aaa5fd8d4390e934fb30b59c.jpg'),
  ('ディーラー衣装', 'https://tws-tws.com/contents/1045494', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236950/medium_ee1483836158fe8a45dd9bd055cf960e63ad3f68aa6616444df35f9847dc5ad6.jpg'),
  ('初期制服衣装', 'https://tws-tws.com/contents/1045492', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236949/medium_ef0fd331b2989bf395d5667d2cfab411f97b954a46d203909c763f057a3e43f7.jpg'),
  ('初期ネコミミ衣装', 'https://tws-tws.com/contents/1045491', 'https://tws-tws.com/s3/skiyaki/uploads/image/file/236948/medium_638b3af7af0660229a42e1806900916cd85417df344afce94280c02172a0985d.jpg');

do $$
begin
  if exists (
    select 1
    from official_costume_image_seed seed
    left join public.costumes costume
      on lower(btrim(costume.name)) = lower(btrim(seed.costume_name))
    where costume.costume_id is null
  ) then
    raise exception 'Costume image seed does not match the existing costume data';
  end if;
end $$;

update public.costumes costume
set image_url = seed.image_url
from official_costume_image_seed seed
where lower(btrim(costume.name)) = lower(btrim(seed.costume_name));

insert into public.costume_sources (
  costume_id, label, url, accessed_on, canonical_source_id,
  fact_kind, verification_status, verified_at, note
)
select costume.costume_id, source.title, seed.source_url, current_date,
       source.source_id, 'image', 'verified', now(),
       '公式サイトの公開一覧に表示されるサムネイル画像URL。画像ファイルは複製していません。'
from official_costume_image_seed seed
join public.costumes costume
  on lower(btrim(costume.name)) = lower(btrim(seed.costume_name))
join public.sources source on source.url = seed.source_url
where not exists (
  select 1
  from public.costume_sources existing
  where existing.costume_id = costume.costume_id
    and existing.canonical_source_id = source.source_id
    and existing.fact_kind = 'image'
);
