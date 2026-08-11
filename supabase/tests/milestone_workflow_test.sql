begin;

select plan(14);

insert into public.user_roles (user_id, role)
values
  ('10000000-0000-0000-0000-000000000001', 'editor'),
  ('10000000-0000-0000-0000-000000000002', 'reviewer');

insert into public.sources (url, title, source_kind, availability_status)
values ('https://example.com/pgtap-milestone', 'pgTAP milestone source', 'web', 'available');

insert into public.milestones (slug, title, kind, status)
values ('pgtap-review-workflow', 'pgTAP review workflow', 'test', 'draft');

insert into public.milestone_sources (
  milestone_id, source_id, fact_kind, verification_status
)
select milestone_id, source_id, 'title', 'unverified'
from public.milestones, public.sources
where milestones.slug = 'pgtap-review-workflow'
  and sources.url = 'https://example.com/pgtap-milestone';

insert into public.timeline_occurrences (
  occurrence_kind, occurred_on, date_precision, status, milestone_id
)
select 'milestone', '2026-08-11', 'day', 'draft', milestone_id
from public.milestones
where slug = 'pgtap-review-workflow';

insert into public.occurrence_sources (
  occurrence_id, source_id, fact_kind, verification_status, verified_at
)
select occurrence_id, source_id, 'occurred_on', 'verified', now()
from public.timeline_occurrences, public.sources
where timeline_occurrences.milestone_id = (
    select milestone_id from public.milestones where slug = 'pgtap-review-workflow'
  )
  and sources.url = 'https://example.com/pgtap-milestone';

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local role authenticated;

select lives_ok(
  format(
    'select public.submit_milestone_for_review(%s)',
    (select milestone_id from public.milestones where slug = 'pgtap-review-workflow')
  ),
  'an editor can submit a sourced draft milestone for review'
);

select is(
  (select status from public.milestones where slug = 'pgtap-review-workflow'),
  'review',
  'submission changes milestone status to review'
);

select throws_ok(
  format(
    'select public.publish_milestone(%s)',
    (select milestone_id from public.milestones where slug = 'pgtap-review-workflow')
  ),
  '42501',
  null,
  'an editor cannot publish a milestone'
);

reset role;

update public.milestone_sources
set verification_status = 'verified',
    verified_at = now(),
    verified_by = '10000000-0000-0000-0000-000000000002'
where milestone_id = (
  select milestone_id from public.milestones where slug = 'pgtap-review-workflow'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local role authenticated;

select lives_ok(
  format(
    'select public.publish_milestone(%s)',
    (select milestone_id from public.milestones where slug = 'pgtap-review-workflow')
  ),
  'a reviewer can publish a fully verified milestone'
);

select is(
  (select status from public.milestones where slug = 'pgtap-review-workflow'),
  'published',
  'publication changes milestone status to published'
);

select is(
  (
    select status
    from public.timeline_occurrences
    where milestone_id = (
      select milestone_id from public.milestones where slug = 'pgtap-review-workflow'
    )
  ),
  'published',
  'publication also publishes the verified occurrence'
);

select is(
  (
    select count(*)
    from public.archive_audit_log
    where entity_id = (
      select milestone_id from public.milestones where slug = 'pgtap-review-workflow'
    )
  ),
  2::bigint,
  'submit and publish actions are recorded in the audit log'
);

select throws_ok(
  format(
    'select public.withdraw_milestone(%s, %L)',
    (select milestone_id from public.milestones where slug = 'pgtap-review-workflow'),
    '   '
  ),
  '22023',
  null,
  'withdrawal requires a reason'
);

select lives_ok(
  format(
    'select public.withdraw_milestone(%s, %L)',
    (select milestone_id from public.milestones where slug = 'pgtap-review-workflow'),
    'source correction required'
  ),
  'a reviewer can withdraw a published milestone with a reason'
);

select is(
  (select status from public.milestones where slug = 'pgtap-review-workflow'),
  'withdrawn',
  'withdrawal changes milestone status to withdrawn'
);

select is(
  (
    select status
    from public.timeline_occurrences
    where milestone_id = (
      select milestone_id from public.milestones where slug = 'pgtap-review-workflow'
    )
  ),
  'withdrawn',
  'withdrawal also removes the occurrence from publication'
);

select is(
  (
    select reason
    from public.archive_audit_log
    where entity_id = (
      select milestone_id from public.milestones where slug = 'pgtap-review-workflow'
    )
      and action = 'withdraw'
  ),
  'source correction required',
  'withdrawal reason is retained in the audit log'
);

reset role;

insert into public.milestones (slug, title, kind, status)
values ('pgtap-direct-publish', 'pgTAP direct publish', 'test', 'draft');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local role authenticated;

select throws_ok(
  $$update public.milestones set status = 'published' where slug = 'pgtap-direct-publish'$$,
  '42501',
  null,
  'an editor cannot bypass the workflow with a direct status update'
);

select throws_ok(
  format(
    'select public.submit_milestone_for_review(%s)',
    (select milestone_id from public.milestones where slug = 'pgtap-direct-publish')
  ),
  '23514',
  null,
  'a milestone without a source cannot be submitted'
);

reset role;

select * from finish();

rollback;
