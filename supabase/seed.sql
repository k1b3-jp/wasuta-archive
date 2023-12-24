-- Usersテーブルにサンプルデータを追加
insert into public.Users (email, password, nickname)
values 
('alice@example.com', 'password123', 'Alice'),
('bob@example.com', 'password456', 'Bob');

-- Eventsテーブルにサンプルデータを追加
insert into public.Events (user_id, event_name, event_time, date, location)
values 
(1, '単独ライブ', '2023-12-24 17:00:00', '2023-12-24', 'Zepp Haneda'),
(2, 'リリイベ1部', '2023-12-23 13:00:00', '2023-12-23', 'ララポート豊洲');

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
