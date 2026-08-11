begin;

select plan(8);

insert into public.user_roles (user_id, role)
values
  ('30000000-0000-0000-0000-000000000001', 'admin'),
  ('30000000-0000-0000-0000-000000000002', 'editor');

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';
set local role authenticated;

select lives_ok(
  $$select public.create_milestone_draft(
    'pgtap-solo-publish',
    'pgTAP solo publish',
    'anniversary',
    'A solo-maintainer publishing test.',
    '2026-08-11',
    true,
    'https://example.com/pgtap-solo-publish',
    'Solo publish source',
    'official'
  )$$,
  'an admin can create a complete draft'
);

select lives_ok(
  format(
    'select public.confirm_and_publish_milestone(%s)',
    (select milestone_id from public.milestones where slug = 'pgtap-solo-publish')
  ),
  'an admin can confirm and publish the draft in one action'
);

select is(
  (select status from public.milestones where slug = 'pgtap-solo-publish'),
  'published',
  'the milestone is published'
);

select is(
  (
    select verification_status
    from public.milestone_sources
    where milestone_id = (
      select milestone_id from public.milestones where slug = 'pgtap-solo-publish'
    )
  ),
  'verified',
  'the title source is verified by the confirmation action'
);

select is(
  (
    select verification_status
    from public.occurrence_sources
    where occurrence_id = (
      select occurrence_id
      from public.timeline_occurrences
      where milestone_id = (
        select milestone_id from public.milestones where slug = 'pgtap-solo-publish'
      )
    )
  ),
  'verified',
  'the occurrence date source is verified by the confirmation action'
);

select is(
  (
    select availability_status
    from public.sources
    where url = 'https://example.com/pgtap-solo-publish'
  ),
  'available',
  'the source is marked available when confirmed'
);

select results_eq(
  $$select action from public.archive_audit_log
    where entity_id = (
      select milestone_id from public.milestones where slug = 'pgtap-solo-publish'
    )
    order by audit_id$$,
  $$values ('create_draft'::text), ('submit_for_review'::text), ('publish'::text)$$,
  'the shortcut retains the full audit history'
);

reset role;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000002';
set local role authenticated;

select throws_ok(
  format(
    'select public.confirm_and_publish_milestone(%s)',
    (select milestone_id from public.milestones where slug = 'pgtap-solo-publish')
  ),
  '42501',
  null,
  'an editor cannot use the solo admin publishing shortcut'
);

reset role;

select * from finish();

rollback;
