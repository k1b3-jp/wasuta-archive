begin;

select plan(10);

insert into public.user_roles (user_id, role)
values ('20000000-0000-0000-0000-000000000001', 'editor');

set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000001';
set local role authenticated;

select lives_ok(
  $$select public.create_milestone_draft(
    'pgtap-created-draft',
    'pgTAP created draft',
    'anniversary',
    'A sourced milestone draft.',
    '2026-08-11',
    true,
    'https://example.com/pgtap-created-draft',
    'Official milestone source',
    'official'
  )$$,
  'an editor can atomically create a sourced milestone draft'
);

select is(
  (select status from public.milestones where slug = 'pgtap-created-draft'),
  'draft',
  'the created milestone starts as draft'
);

select is(
  (
    select verification_status
    from public.milestone_sources
    where milestone_id = (
      select milestone_id from public.milestones where slug = 'pgtap-created-draft'
    )
  ),
  'unverified',
  'the title source starts unverified'
);

select is(
  (
    select status
    from public.timeline_occurrences
    where milestone_id = (
      select milestone_id from public.milestones where slug = 'pgtap-created-draft'
    )
  ),
  'draft',
  'the occurrence starts as draft'
);

select is(
  (
    select verification_status
    from public.occurrence_sources
    where occurrence_id = (
      select occurrence_id
      from public.timeline_occurrences
      where milestone_id = (
        select milestone_id from public.milestones where slug = 'pgtap-created-draft'
      )
    )
  ),
  'unverified',
  'the occurrence date source starts unverified'
);

reset role;

select is(
  (
    select count(*)
    from public.archive_audit_log
    where entity_id = (
      select milestone_id from public.milestones where slug = 'pgtap-created-draft'
    )
      and action = 'create_draft'
  ),
  1::bigint,
  'draft creation is written to the audit log'
);

set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000001';
set local role authenticated;

select lives_ok(
  $$update public.milestone_sources
    set verification_status = 'verified', verified_at = now()
    where milestone_id = (
      select milestone_id from public.milestones where slug = 'pgtap-created-draft'
    )$$,
  'an unauthorized source update is safely reduced to zero rows'
);

select is(
  (
    select verification_status
    from public.milestone_sources
    where milestone_id = (
      select milestone_id from public.milestones where slug = 'pgtap-created-draft'
    )
  ),
  'unverified',
  'an editor cannot verify their own milestone source'
);

select throws_ok(
  $$select public.create_milestone_draft(
    'pgtap-invalid-source',
    'pgTAP invalid source',
    'test',
    '',
    '2026-08-11',
    true,
    '/relative/source',
    'Invalid source',
    'web'
  )$$,
  '22023',
  null,
  'draft creation rejects relative source URLs'
);

reset role;
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000099';
set local role authenticated;

select throws_ok(
  $$select public.create_milestone_draft(
    'pgtap-no-role',
    'pgTAP no role',
    'test',
    '',
    '2026-08-11',
    true,
    'https://example.com/no-role',
    'No role source',
    'web'
  )$$,
  '42501',
  null,
  'authenticated users without editor role cannot create milestone drafts'
);

reset role;

select * from finish();

rollback;
