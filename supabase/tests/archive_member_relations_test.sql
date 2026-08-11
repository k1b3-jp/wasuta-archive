begin;
select plan(8);

insert into public.user_roles (user_id, role) values
  ('50000000-0000-0000-0000-000000000001', 'admin'),
  ('50000000-0000-0000-0000-000000000002', 'editor');

set local request.jwt.claim.sub = '50000000-0000-0000-0000-000000000001';
set local role authenticated;

select lives_ok(format('select public.replace_archive_member_relations(%L, %s, array[%s]::bigint[])', 'event', (select min(event_id) from public.events), (select string_agg(member_id::text, ',') from (select member_id from public.members order by member_id limit 2) selected)), 'admin can explicitly assign event members');
select is((select count(*) from public.event_members where event_id = (select min(event_id) from public.events)), 2::bigint, 'event receives the selected members');
select lives_ok(format('select public.replace_archive_member_relations(%L, %s, array[]::bigint[])', 'event', (select min(event_id) from public.events)), 'admin can mark an event group-wide by clearing member relations');
select is((select count(*) from public.event_members where event_id = (select min(event_id) from public.events)), 0::bigint, 'clearing removes explicit event members');
select throws_ok(format('select public.replace_archive_member_relations(%L, %s, array[999999]::bigint[])', 'event', (select min(event_id) from public.events)), '23503', null, 'unknown members are rejected');
select throws_ok(format('select public.replace_archive_member_relations(%L, %s, array[]::bigint[])', 'unknown', (select min(event_id) from public.events)), '22023', null, 'unknown archive kinds are rejected');
select is((select count(*) from public.archive_audit_log where action = 'replace_member_relations' and entity_type = 'event'), 2::bigint, 'successful changes are audited');

reset role;
set local request.jwt.claim.sub = '50000000-0000-0000-0000-000000000002';
set local role authenticated;
select throws_ok(format('select public.replace_archive_member_relations(%L, %s, array[]::bigint[])', 'event', (select min(event_id) from public.events)), '42501', null, 'editors cannot replace archive member relations');
reset role;
select * from finish();
rollback;
