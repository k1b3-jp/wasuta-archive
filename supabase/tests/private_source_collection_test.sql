begin;
select plan(24);
select ok(not has_schema_privilege('anon','archive_research','USAGE'),'anonymous has no research schema access');
select ok(not has_schema_privilege('authenticated','archive_research','USAGE'),'authenticated has no research schema access');
select ok(not has_table_privilege('anon','archive_research.source_versions','SELECT'),'anonymous cannot read source bodies');
select ok(not has_table_privilege('authenticated','archive_research.source_versions','SELECT'),'ordinary authentication cannot read source bodies');
select ok(not has_function_privilege('anon','archive_research.suppress_source(text,text)','EXECUTE'),'anonymous cannot call suppression');
select ok((select bool_and(relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='archive_research' and c.relkind='r'),'research tables all enable RLS');
insert into archive_research.accounts(account_key,platform,owner_label,official_status) values('fixture-private','X','Fictional fixture','unresolved');
select lives_ok($$select archive_research.lock_account('fixture-private','123456')$$,'account lock permits initial immutable ID binding');
update archive_research.accounts set platform_user_id='123456' where account_key='fixture-private';
select lives_ok($$select archive_research.lock_account('fixture-private','123456')$$,'account lock permits the same immutable ID');
select throws_ok($$select archive_research.lock_account('fixture-private','987654')$$,'22023',null,'account lock rejects replacement of a bound immutable ID');
select ok(not has_function_privilege('authenticated','archive_research.lock_account(text,text)','EXECUTE'),'authenticated cannot lock or bind research account identities');

insert into archive_research.source_records(record_key,platform,platform_post_id,account_key,canonical_url,first_seen_at,last_seen_at)
values('fixture-private-post','X','123','fixture-private','https://example.com/fixture-private',now(),now());
insert into archive_research.source_versions(version_key,record_key,content_hash,text_content,date_precision,observed_at,content_status)
values('fixture-private-v1','fixture-private-post','fixture-hash','Fictional body','unknown',now(),'body_observed');
insert into archive_research.source_observations(observation_key,version_key,observed_at,method,metrics)
values('fixture-observation','fixture-private-v1',now(),'fixture','{"like_count":3}');
select throws_ok($$insert into archive_research.source_records(record_key,platform,platform_post_id,canonical_url,first_seen_at,last_seen_at) values('fixture-duplicate','X','123','https://example.com/other',now(),now())$$,'23505',null,'post IDs are unique within platform');
select throws_ok($$update archive_research.source_versions set date_precision='day' where version_key='fixture-private-v1'$$,'23514',null,'date precision cannot invent missing date');
select throws_ok($$insert into archive_research.passages(passage_key,version_key,locator) values('bad-passage','missing-version','fixture')$$,'23503',null,'passages require actual source revision');
select throws_ok($$insert into archive_research.editorial_proposals(proposal_key,passage_key,summary) values('bad-proposal','missing-passage','fixture')$$,'23503',null,'editorial text requires actual passage');
select throws_ok($$update archive_research.source_records set review_status='approved' where record_key='fixture-private-post'$$,'23514',null,'collection cannot self approve');
set local role anon;
select throws_ok($$select text_content from archive_research.source_versions$$,'42501',null,'direct anonymous query is denied');
reset role;
set local role authenticated;
select throws_ok($$select text_content from archive_research.source_versions$$,'42501',null,'authenticated direct query is denied');
reset role;
select lives_ok($$select archive_research.suppress_source('fixture-private-post','owner request fixture')$$,'private suppression succeeds');
select ok(exists(
 select 1 from pg_locks
 where pid=pg_backend_pid() and locktype='advisory' and granted
 and mode='ExclusiveLock' and objsubid=1
 and classid::bigint=((hashtextextended('archive_research:source:fixture-private-post',0)>>32)&4294967295)
 and objid::bigint=(hashtextextended('archive_research:source:fixture-private-post',0)&4294967295)
),'suppression retains the per-source transaction lock used by collection');
select ok(not has_function_privilege('authenticated','archive_research.lock_source(text)','EXECUTE'),'authenticated cannot lock research identities');

select is((select text_content from archive_research.source_versions where version_key='fixture-private-v1'),null::text,'suppression removes body from stored revision');
select ok((select content_suppressed from archive_research.source_records where record_key='fixture-private-post'),'suppression marks identity to prevent restoration');
select is((select metrics::text from archive_research.source_observations where observation_key='fixture-observation'),'{}','suppression also removes stored metrics');
select is((select count(*) from archive_research.collection_audit where record_key='fixture-private-post'),1::bigint,'suppression audited without original content');
select * from finish();
rollback;
