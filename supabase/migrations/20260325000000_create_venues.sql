CREATE TABLE IF NOT EXISTS public.venues (
  id text PRIMARY KEY,
  name text NOT NULL,
  keywords text[] NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'venues'
      AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON public.venues FOR SELECT USING (true);
  END IF;
END $$;

INSERT INTO public.venues (id, name, keywords, lat, lng) VALUES
('paris', 'Paris, France', ARRAY['フランス', 'Paris', 'JAPAN EXPO'], 48.8566, 2.3522),
('madrid', 'Madrid, Spain', ARRAY['スペイン', 'マドリード', 'Spain'], 40.4168, -3.7038),
('bangkok', 'Bangkok, Thailand', ARRAY['バンコク', 'Thailand', 'PATTAYA', 'タイ'], 13.7563, 100.5018),
('taipei', 'Taipei, Taiwan', ARRAY['台湾', '台北', 'Breeze MEGA Studio', 'Jack'], 25.0330, 121.5654),
('shanghai', 'Shanghai, China', ARRAY['上海'], 31.2304, 121.4737),
('hongkong', 'Hong Kong', ARRAY['香港', 'Hong Kong', 'Youth Square'], 22.3193, 114.1694),
('singapore', 'Singapore', ARRAY['シンガポール'], 1.3521, 103.8198),
('manila', 'Manila, Philippines', ARRAY['フィリピン', 'マニラ'], 14.5995, 120.9842),
('hochiminh', 'Ho Chi Minh, Vietnam', ARRAY['ベトナム', 'ホーチミン'], 10.8231, 106.6297),
('kuala', 'Kuala Lumpur, Malaysia', ARRAY['マレーシア', 'クアラルンプール', 'KL Live'], 3.1390, 101.6869),
('montreal', 'Montreal, Canada', ARRAY['カナダ', 'モントリオール'], 45.5017, -73.5673),
('losangeles', 'Los Angeles, USA', ARRAY['ロサンゼルス', 'Los Angeles'], 34.0522, -118.2437),
('hawaii', 'Hawaii, USA', ARRAY['ハワイ'], 21.3069, -157.8583),
('brazil', 'Sao Paulo, Brazil', ARRAY['ブラジル', 'DISTRITO ANHEMB'], -23.5505, -46.6333),
('mongolia', 'Ulaanbaatar, Mongolia', ARRAY['モンゴル', 'ウランバートル'], 47.9212, 106.9185),
('korea', 'Seoul, South Korea', ARRAY['韓国', 'WEST BRIDGE', 'K-Stage O!'], 37.5665, 126.9780),
('odaiba', 'お台場 (Odaiba)', ARRAY['お台場', 'Zepp DiverCity', 'Diversity', 'ZeppDiverCity', 'ダイバーシティ', 'TOWER mini ダイバーシティ', '青海', 'フジテレビ'], 35.6250, 139.7753),
('toyosu', '豊洲 (Toyosu)', ARRAY['豊洲PIT', 'ららぽーと豊洲', 'PIT', '新豊洲'], 35.6476, 139.7893),
('shinjuku', '新宿 (Shinjuku)', ARRAY['新宿', 'BLAZE', 'ReNY', 'FACE', 'MARZ', 'LOFT', 'R''sアートコート', '新宿DHNoA', 'グレースバリ新宿'], 35.6938, 139.7034),
('shibuya', '渋谷 (Shibuya)', ARRAY['渋谷', 'O-EAST', 'O-WEST', 'O-nest', 'WWW', 'RizM', 'duo MUSIC EXCHANGE', 'LINE CUBE', 'SHIBUYA', 'HARLEM', 'CLUB TK', 'SOUND MUSEUM', 'TAKE OFF7'], 35.6580, 139.7016),
('harajuku', '原宿・表参道 (Harajuku)', ARRAY['原宿', 'ASTRO HALL', '表参道', 'JOL原宿', 'ラフォーレミュージアム', 'AREA-Q', '代々木競技場', '代々木公園', 'ゆうめいに、にゃりたい'], 35.6698, 139.7042),
('shinagawa', '品川 (Shinagawa)', ARRAY['品川', 'ステラボール', 'グランドホール', 'きゅりあん'], 35.6285, 139.7388),
('akasaka', '赤坂 (Akasaka)', ARRAY['赤坂', 'BLITZ', 'マイナビBLITZ', 'ドイツ文化会館'], 35.6733, 139.7328),
('roppongi', '六本木 (Roppongi)', ARRAY['六本木', 'EX THEATER', 'EXシアター', 'SUMMER STATION'], 35.6628, 139.7314),
('shinkiba', '新木場 (Shinkiba)', ARRAY['新木場', 'STUDIO COAST', 'GARDEN FACTORY'], 35.6429, 139.8273),
('ebisu', '恵比寿 (Ebisu)', ARRAY['恵比寿', 'LIQUIDROOM', 'LIQUID ROOM', 'CreAto', 'ザ・ガーデンホール', 'The Garden Room'], 35.6466, 139.7101),
('akihabara', '秋葉原 (Akihabara)', ARRAY['秋葉原', '神田明神', 'AKIBAカルチャーズ', '神田スクエア', 'KANDA SQUARE'], 35.6983, 139.7731),
('yoyogi', '代々木・千駄ヶ谷 (Yoyogi)', ARRAY['代々木', '山野ホール', '東京体育館'], 35.6692, 139.6999),
('nakano', '中野 (Nakano)', ARRAY['中野サンプラザ'], 35.7077, 139.6644),
('daikanyama', '代官山 (Daikanyama)', ARRAY['代官山', 'UNIT'], 35.6483, 139.7040),
('shirokane', '白金高輪 (Shirokane)', ARRAY['白金高輪', 'SELENE', '白金高輪SELENE'], 35.6428, 139.7335),
('shimokitazawa', '下北沢 (Shimokitazawa)', ARRAY['下北沢', 'GARDEN', 'シャングリラ', '北沢タウンホール'], 35.6616, 139.6670),
('ikebukuro', '池袋 (Ikebukuro)', ARRAY['池袋', 'harevutai', 'サンシャイン', 'グレースバリ池袋'], 35.7295, 139.7109),
('tokyo_other', '東京 その他 (Tokyo - Generic)', ARRAY['東京', 'TOKYO', 'ヒューリックホール', 'よみうりランド', 'サンリオピューロランド', 'J:COM', 'タワーレコード', 'HMV', '有明', 'TFT', '立川', '武蔵野の森', 'NHKホール', '両国国技館', '日比谷公園', '大手町三井', '室町三井', 'ベルエポック', '海の森水上', '日テレ', 'こくみん共済', '国立音楽院', 'サンライズビル', 'エイベックス', 'としまえん', '都内某所', 'グレースバリ', 'オルタナティブシアター', 'アレーナホール', 'TIAT SKY', 'HY TOWN', 'acoute', '味の素スタジアム', 'セルリアンタワー', 'Flat House', '日本テレビ', 'ルネこだいら', '(未定)', '某所', '関東近郊', '関東地方', 'カメイドクロック', 'アイランドスタジオ', 'NEW PIER HALL', 'MOVIX亀有', '昭和記念公園', 'イタリア文化会館'], 35.6895, 139.6917),
('makuhari', '幕張 (Makuhari)', ARRAY['幕張メッセ', '幕張', '千葉', '柏の葉', '流山おおたか', 'マザー牧場', 'テラスモール松戸', 'イオンモール', '和洋女子大学', '舞浜アンフィシアター'], 35.6480, 140.0347),
('saitama', '埼玉 (Saitama)', ARRAY['さいたま', '埼玉', '大宮', 'ステラタウン', '熊谷', '所沢', '西川口', '浦和', '新三郷', 'コクーン', 'ジャパンパビリオン', '本庄第一高等学校', '平成国際大学'], 35.8988, 139.6341),
('yokohama', '横浜 (Yokohama)', ARRAY['横浜', 'パシフィコ', '赤レンガ', 'YOKOHAMA', 'KT Zepp', 'Zeepp', '新都市ホール', 'Bay Hall', '1000 CLUB', '日産グローバル', 'プレミアヨコハマ', '港北', '山下公園', '日産 グローバル'], 35.4605, 139.6328),
('kawasaki', '川崎 (Kawasaki)', ARRAY['川崎', 'CLUB CITTA', 'ラゾーナ', 'SUPERNOVA', 'チネチッタ'], 35.5300, 139.6967),
('kanagawa_other', '神奈川 その他 (Kanagawa)', ARRAY['神奈川', '湘南', '橋本', 'ビナウォーク', '多摩', 'OTODAMA'], 35.4475, 139.6425),
('nagoya', '名古屋 (Nagoya)', ARRAY['名古屋', '愛知', '栄', '大須', 'DIAMOND HALL', 'THE BOTTOM LINE', 'RAD HALL', 'SPADE BOX', 'ReNY limited', 'Zepp Nagoya', 'Lives NAGOYA', 'Aichi Sky Expo', 'Electric Lady Land', '東別院', 'オアシス21', '金城学院', '東建ホール', '久屋大通', '近鉄パッセ', '大高緑地', 'ラグーナテンボス'], 35.1709, 136.8815),
('osaka_namba', '難波・心斎橋 (Namba)', ARRAY['なんば', '味園ユニバース', 'BIG CAT', 'Zepp Namba', '心斎橋', 'SUNHALL', 'DROP', 'FANJ twice', 'OCAT'], 34.6666, 135.5000),
('osaka_umeda', '梅田 (Umeda)', ARRAY['梅田', 'umeda TRAD', 'amHALL', 'ヨドバシカメラマルチメディア梅田', 'Banana Hall'], 34.7024, 135.4959),
('osaka_other', '大阪 その他 (Osaka)', ARRAY['大阪', 'OSAKA', '服部緑地', '万博記念公園', 'GORILLA HALL', 'あべの', 'カンテレ', 'Zepp Osaka Bayside', 'サンケイホール', 'YOLO BASE', 'ABCラジオ', 'もりのみや', 'セブンパーク', 'くずはモール', '長居公園'], 34.6937, 135.5023),
('kobe', '神戸 (Kobe)', ARRAY['神戸', '兵庫', 'VARIT', 'SLOPE', '文化ホール', '淡路島'], 34.6901, 135.1955),
('kyoto', '京都 (Kyoto)', ARRAY['京都', 'KBSホール', 'KYOTO'], 35.0116, 135.7681),
('shiga', '滋賀 (Shiga)', ARRAY['大津', '烏丸半島', '竜王町', '桃配'], 35.0045, 135.8686),
('fukuoka', '福岡 (Fukuoka)', ARRAY['福岡', '博多', 'DRUM', 'BEAT STATION', 'INSA', 'スカラエスパシオ', 'キャナルシティ', 'ベイサイドプレイス', '北九州', '天神'], 33.5902, 130.4017),
('saga', '佐賀 (Saga)', ARRAY['佐賀'], 33.2494, 130.2998),
('kumamoto', '熊本 (Kumamoto)', ARRAY['熊本'], 32.8031, 130.7079),
('kagoshima', '鹿児島 (Kagoshima)', ARRAY['鹿児島'], 31.5966, 130.5571),
('okinawa', '沖縄 (Okinawa)', ARRAY['沖縄', '那覇', '桜坂', 'ミュージックタウン', 'サンエー'], 26.2124, 127.6809),
('sapporo', '札幌 (Sapporo)', ARRAY['札幌', '北海道', 'Zepp Sapporo', 'Sound Lab mole', 'DUCE SAPPORO', 'アリオ札幌', 'PLANT', 'キロロ'], 43.0618, 141.3545),
('sendai', '仙台 (Sendai)', ARRAY['仙台', '宮城', 'darwin', 'Rensa', 'EBeanS', '勾当台'], 38.2682, 140.8694),
('aomori', '青森 (Aomori)', ARRAY['青森', '青い公園'], 40.8246, 140.7406),
('hiroshima', '広島 (Hiroshima)', ARRAY['広島', 'CLUB QUATTRO', 'SECOND CRUTCH', 'Mazda', 'SIX ONE'], 34.3853, 132.4553),
('yamanashi', '山梨 (Yamanashi)', ARRAY['山梨', '山中湖', '甲府', 'CONVICTION'], 35.6638, 138.5683),
('shizuoka', '静岡 (Shizuoka)', ARRAY['静岡', 'ROXY'], 34.9756, 138.3828),
('ishikawa', '石川 (Ishikawa)', ARRAY['金沢', '本多の森', 'Eight Hall', 'AZ', 'GOLD CREEK'], 36.5613, 136.6562),
('gunma', '群馬 (Gunma)', ARRAY['群馬', '共愛学園前橋国際大学'], 36.3911, 139.0608),
('ibaraki', '茨城 (Ibaraki)', ARRAY['茨城', 'つくば', '土浦', 'よう・そろー'], 36.3418, 140.4468)
ON CONFLICT (id) DO NOTHING;
