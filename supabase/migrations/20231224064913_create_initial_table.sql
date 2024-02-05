-- Eventsテーブルの作成
create table Events (
    event_id integer primary key generated always as identity,
    event_name text,
    date date,
    location text,
    image_url text,
    description text
);

-- Event_Tag_Namesテーブルの作成
create table Event_Tag_Names (
    tag_id integer primary key generated always as identity,
    name text
);

-- Event_Tagsテーブルの作成
create table Event_Tags (
    event_id integer references Events(event_id),
    tag_id integer references Event_Tag_Names(tag_id),
    primary key (event_id, tag_id)
);

-- Youtube_Tag_Namesテーブルの作成
create table Youtube_Tag_Names (
    tag_id integer primary key generated always as identity,
    name text
);

-- Youtube_Linksテーブルの作成
create table Youtube_Links (
    youtube_link_id integer primary key generated always as identity,
    url text
);

-- Youtube_Tagsテーブルの作成
create table Youtube_Tags (
    youtube_link_id integer references Youtube_Links(youtube_link_id),
    tag_id integer references Youtube_Tag_Names(tag_id),
    primary key (youtube_link_id, tag_id)
);

-- Event_Youtube_Linksテーブルの作成
create table Event_Youtube_Links (
    event_id integer references Events(event_id),
    youtube_link_id integer references Youtube_Links(youtube_link_id),
    primary key (event_id, youtube_link_id)
);
