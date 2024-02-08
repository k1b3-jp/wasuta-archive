-- Eventsテーブルにサンプルデータを追加
insert into public.Events (event_name, date, location)
values 
('単独ライブ', '2023-12-24', 'Zepp Haneda'),
('リリイベ1部', '2023-12-23', 'ララポート豊洲'),
('リリイベ2部', '2023-12-23', 'ララポート豊洲'),
('イベントテスト', '2023-12-20', ''),
('イベントテスト2', '2023-12-20', ''),
('イベントテスト3', '2023-12-21', ''),
('イベントテスト4', '2023-12-21', ''),
('イベントテスト5', '2023-12-21', ''),
('イベントテスト6', '2023-12-22', ''),
('イベントテスト7', '2023-12-22', ''),
('イベントテスト8', '2023-12-22', ''),
('イベントテスト9', '2023-12-23', ''),
('イベントテスト10', '2023-12-23', ''),
('イベントテスト11', '2023-12-23', ''),
('イベントテスト12', '2023-12-24', ''),
('イベントテスト13', '2023-12-24', ''),
('mumoイベント', '2023-12-24', '');

-- Event_Tag_Namesテーブルにサンプルデータを追加
insert into public.Event_Tag_Names (name)
values 
('単独'),
('リリイベ');

-- Event_Tagsテーブルにサンプルデータを追加
insert into public.Event_Tags (event_id, tag_id)
values 
(1, 1),
(2, 2);

-- Youtube_Tag_Namesテーブルにサンプルデータを追加
insert into public.Youtube_Tag_Names (name)
values 
('4K'),
('最前');

-- Youtube_Linksテーブルにサンプルデータを追加
insert into public.Youtube_Links (url)
values 
('https://youtu.be/sample1'),
('https://youtu.be/sample2');

-- Youtube_Tagsテーブルにサンプルデータを追加
insert into public.Youtube_Tags (youtube_link_id, tag_id)
values 
(1, 1),
(2, 2);
