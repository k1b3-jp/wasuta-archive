begin;

select plan(19);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.events'::regclass),
  'events has row level security enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.event_tags'::regclass),
  'event_tags has row level security enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.event_tag_names'::regclass),
  'event_tag_names has row level security enabled'
);
select is(
  (
    select count(*)
    from pg_policies
    where ((schemaname = 'public' and tablename in ('events', 'event_tags', 'event_tag_names'))
       or (schemaname = 'storage' and tablename = 'objects'))
      and policyname like '%authenticated'
  ),
  0::bigint,
  'no broad authenticated event or image write policies remain'
);

insert into public.events (event_name, date)
values ('pgtap permission fixture', current_date);
insert into public.event_tag_names (name)
values ('pgtap permission tag');

set local request.jwt.claim.sub = '70000000-0000-0000-0000-000000000001';
set local role authenticated;

select throws_ok(
  $$insert into public.events (event_name, date) values ('forbidden event', current_date)$$,
  '42501', null, 'a general user cannot create an event'
);
select lives_ok(
  $$update public.events set event_name = 'forbidden update' where event_name = 'pgtap permission fixture'$$,
  'an unauthorized event update safely affects zero rows'
);

reset role;
select is(
  (select event_name from public.events where event_name = 'pgtap permission fixture'),
  'pgtap permission fixture',
  'a general user cannot update an event'
);

set local request.jwt.claim.sub = '70000000-0000-0000-0000-000000000001';
set local role authenticated;
select throws_ok(
  $$insert into public.event_tags (event_id, tag_id)
    select e.event_id, t.tag_id
    from public.events e, public.event_tag_names t
    where e.event_name = 'pgtap permission fixture'
      and t.name = 'pgtap permission tag'$$,
  '42501', null, 'a general user cannot register an event tag'
);
select throws_ok(
  $$insert into public.event_tag_names (name) values ('forbidden tag name')$$,
  '42501', null, 'a general user cannot create an event tag name'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner)
    values ('event_pics', 'pgtap-general-user.jpg', auth.uid())$$,
  '42501', null, 'a general user cannot upload an event image'
);

reset role;
insert into public.user_roles (user_id, role)
values ('70000000-0000-0000-0000-000000000002', 'admin');
set local request.jwt.claim.sub = '70000000-0000-0000-0000-000000000002';
set local role authenticated;

select lives_ok(
  $$insert into public.events (event_name, date) values ('pgtap admin event', current_date)$$,
  'an administrator can create an event'
);
select lives_ok(
  $$update public.events set location = 'admin update' where event_name = 'pgtap admin event'$$,
  'an administrator can update an event'
);
select lives_ok(
  $$insert into public.event_tags (event_id, tag_id)
    select e.event_id, t.tag_id
    from public.events e, public.event_tag_names t
    where e.event_name = 'pgtap admin event'
      and t.name = 'pgtap permission tag'$$,
  'an administrator can register an event tag'
);
select lives_ok(
  $$update public.event_tags set tag_id = tag_id
    where event_id = (select event_id from public.events where event_name = 'pgtap admin event')$$,
  'an administrator can update an event tag'
);
select lives_ok(
  $$insert into public.event_tag_names (name) values ('pgtap admin tag name')$$,
  'an administrator can create an event tag name'
);
select lives_ok(
  $$update public.event_tag_names set name = 'pgtap renamed admin tag'
    where name = 'pgtap admin tag name'$$,
  'an administrator can update an event tag name'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner)
    values ('event_pics', 'pgtap-admin.jpg', auth.uid())$$,
  'an administrator can upload an event image'
);
select lives_ok(
  $$update storage.objects set metadata = '{"tested":true}'::jsonb
    where bucket_id = 'event_pics' and name = 'pgtap-admin.jpg'$$,
  'an administrator can update an event image'
);
reset role;
select ok(
  exists(
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_objects_admin_delete_only'
      and cmd = 'DELETE'
      and qual like '%is_admin(auth.uid())%'
  ),
  'event image deletion is restricted to administrators'
);

select * from finish();
rollback;
