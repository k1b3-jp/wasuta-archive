begin;

select plan(9);

insert into public.user_roles (user_id, role)
values
  ('40000000-0000-0000-0000-000000000001', 'editor'),
  ('40000000-0000-0000-0000-000000000002', 'admin');

set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000001';
set local role authenticated;

select lives_ok(
  $$select public.create_milestone_draft(
    'pgtap-updated-draft', 'Before edit', 'anniversary', 'Before description',
    '2026-08-01', true, 'https://example.com/before-edit', 'Before source', 'web'
  )$$,
  'an editor can create the draft to revise'
);

select lives_ok(
  format(
    $$select public.update_milestone_draft(%s, 'After edit', 'group_history',
      'After description', '2026-08-12', false,
      'https://example.com/after-edit', 'After source', 'official')$$,
    (select milestone_id from public.milestones where slug = 'pgtap-updated-draft')
  ),
  'an editor can update a complete draft atomically'
);

select is((select title from public.milestones where slug = 'pgtap-updated-draft'), 'After edit', 'title is updated');
select is((select description from public.milestones where slug = 'pgtap-updated-draft'), 'After description', 'description is updated');
select is((select occurred_on from public.timeline_occurrences where milestone_id = (select milestone_id from public.milestones where slug = 'pgtap-updated-draft')), '2026-08-12'::date, 'date is updated');
select is((select is_group_wide from public.timeline_occurrences where milestone_id = (select milestone_id from public.milestones where slug = 'pgtap-updated-draft')), false, 'group-wide setting is updated');
select is((select sources.url from public.occurrence_sources join public.sources using (source_id) where occurrence_id = (select occurrence_id from public.timeline_occurrences where milestone_id = (select milestone_id from public.milestones where slug = 'pgtap-updated-draft'))), 'https://example.com/after-edit', 'source relation is replaced');

reset role;
set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000002';
set local role authenticated;
select public.confirm_and_publish_milestone((select milestone_id from public.milestones where slug = 'pgtap-updated-draft'));

select throws_ok(
  format(
    $$select public.update_milestone_draft(%s, 'Forbidden edit', 'group_history',
      '', '2026-08-13', false, 'https://example.com/forbidden', 'Forbidden', 'official')$$,
    (select milestone_id from public.milestones where slug = 'pgtap-updated-draft')
  ),
  'P0002', null,
  'a published milestone cannot be edited through the draft RPC'
);

reset role;
set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000099';
set local role authenticated;
select throws_ok(
  $$select public.update_milestone_draft(1, 'No role', 'test', '', '2026-08-13', false,
    'https://example.com/no-role-update', 'No role', 'web')$$,
  '42501', null,
  'a user without editor role cannot update drafts'
);

reset role;
select * from finish();
rollback;
