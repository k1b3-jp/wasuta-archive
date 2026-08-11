begin;

select plan(25);

select has_table('public', 'sources', 'sources table exists');
select has_table('public', 'members', 'members table exists');
select has_table('public', 'milestones', 'milestones table exists');
select has_table('public', 'timeline_occurrences', 'timeline occurrences table exists');
select has_table('public', 'occurrence_sources', 'occurrence sources table exists');

select has_column('public', 'members', 'timeline_key', 'members expose a stable timeline key');
select has_column('public', 'songs', 'status', 'songs have publication status');
select has_column('public', 'costumes', 'status', 'costumes have publication status');
select col_is_pk('public', 'sources', 'source_id', 'sources use source_id as primary key');
select col_is_unique('public', 'sources', array['url'], 'source URLs are unique');

select results_eq(
  $$select count(*)::bigint from public.members where timeline_key is not null$$,
  array[4::bigint],
  'the four current members have timeline identities'
);

select results_eq(
  $$select array_agg(timeline_key order by member_id) from public.members where timeline_key is not null$$,
  $$values (array['nanase', 'miri', 'ririka', 'ruka']::text[])$$,
  'existing public member query keys remain stable'
);

select results_eq(
  $$select count(*)::bigint from public.timeline_occurrences where occurrence_kind = 'milestone' and status = 'published'$$,
  array[1::bigint],
  'the reviewed milestone seed creates one published occurrence'
);

select results_eq(
  $$select count(*)::bigint from public.occurrence_sources where verification_status = 'verified' and fact_kind = 'occurred_on'$$,
  array[1::bigint],
  'the reviewed milestone occurrence has a verified date source'
);

select throws_ok(
  $$insert into public.timeline_occurrences (occurrence_kind, occurred_on, date_precision, event_id, song_id) values ('event', current_date, 'day', 118, 1)$$,
  '23514',
  null,
  'an occurrence cannot reference more than one parent'
);

select throws_ok(
  $$insert into public.timeline_occurrences (occurrence_kind, occurred_on, date_precision, event_id) values ('event', current_date, 'unknown', 118)$$,
  '23514',
  null,
  'unknown precision requires a null occurrence date'
);

select throws_ok(
  $$insert into public.timeline_occurrences (occurrence_kind, occurred_on, date_precision, event_id) values ('event', null, 'day', 118)$$,
  '23514',
  null,
  'known precision requires an occurrence date'
);

select throws_ok(
  $$insert into public.members (slug, name, timeline_key, short_name) values ('invalid member slug', 'invalid member', 'invalid key', 'invalid')$$,
  '23514',
  null,
  'member slugs and timeline keys reject invalid formats'
);

insert into public.milestones (slug, title, kind, status)
values
  ('pgtap-draft-milestone', 'pgTAP draft milestone', 'test', 'draft'),
  ('pgtap-published-milestone', 'pgTAP published milestone', 'test', 'published');

insert into public.songs (title, status)
values
  ('pgTAP draft song', 'draft'),
  ('pgTAP published song', 'published');

insert into public.costumes (name, status)
values
  ('pgTAP draft costume', 'draft'),
  ('pgTAP published costume', 'published');

set local role anon;

select is(
  (select count(*) from public.milestones where slug = 'pgtap-draft-milestone'),
  0::bigint,
  'anonymous readers cannot see draft milestones'
);

select is(
  (select count(*) from public.milestones where slug = 'pgtap-published-milestone'),
  1::bigint,
  'anonymous readers can see published milestones'
);

select is(
  (select count(*) from public.songs where title = 'pgTAP draft song'),
  0::bigint,
  'anonymous readers cannot see draft songs'
);

select is(
  (select count(*) from public.songs where title = 'pgTAP published song'),
  1::bigint,
  'anonymous readers can see published songs'
);

select is(
  (select count(*) from public.costumes where name = 'pgTAP draft costume'),
  0::bigint,
  'anonymous readers cannot see draft costumes'
);

select is(
  (select count(*) from public.costumes where name = 'pgTAP published costume'),
  1::bigint,
  'anonymous readers can see published costumes'
);

select is(
  (
    select count(*)
    from public.timeline_occurrences
    where occurrence_kind = 'milestone' and status = 'published'
  ),
  1::bigint,
  'anonymous readers can see the published milestone occurrence'
);

reset role;

select * from finish();

rollback;
