-- Research is never exposed via PostgREST or the existing public sources table.
create schema archive_research;
revoke all on schema archive_research from public, anon, authenticated, service_role;
alter default privileges in schema archive_research revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema archive_research revoke all on functions from public, anon, authenticated, service_role;

create table archive_research.accounts (
  account_key text primary key,
  platform text not null check(platform in ('X','Ameba','Web','Interview')),
  platform_user_id text,
  member_id bigint references public.members(member_id) on delete restrict,
  owner_label text not null,
  official_status text not null check(official_status in ('supported','candidate','unresolved')),
  evidence_url text,
  evidence_locator text,
  created_at timestamptz not null default now(),
  unique(platform,platform_user_id)
);
create table archive_research.account_identifiers (
  account_key text not null references archive_research.accounts(account_key),
  identifier text not null,
  identifier_kind text not null check(identifier_kind in ('handle','url')),
  valid_from timestamptz,
  valid_to timestamptz,
  observed_at timestamptz not null,
  primary key(account_key,identifier_kind,identifier),
  check(valid_to is null or valid_from is null or valid_to>=valid_from)
);
create table archive_research.source_records (
  record_key text primary key,
  platform text not null,
  platform_post_id text,
  account_key text references archive_research.accounts(account_key),
  canonical_url text not null check(canonical_url ~ '^https://'),
  title text,
  public_source_id bigint unique references public.sources(source_id),
  review_status text not null default 'pending' check(review_status in ('pending','rejected')),
  availability text not null default 'unverified' check(availability in ('unverified','available','unavailable','deleted_confirmed','restricted')),
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  content_suppressed boolean not null default false,
  unique(platform,platform_post_id)
);
create table archive_research.source_versions (
  version_key text primary key,
  record_key text not null references archive_research.source_records(record_key),
  content_hash text not null,
  text_content text,
  published_at timestamptz,
  published_on date,
  date_precision text not null check(date_precision in ('instant','day','unknown')),
  original_publication_confirmed boolean not null default false,
  original_date_label text,
  observed_at timestamptz not null,
  content_status text not null check(content_status in ('metadata_only','body_observed','partial','suppressed')),
  usage_status text not null default 'unknown' check(usage_status in ('unknown','link_only','do_not_display')),
  public_metadata jsonb not null default '{}',
  unique(record_key,content_hash),
  check ((date_precision='unknown' and published_at is null and published_on is null)
    or (date_precision='day' and published_at is null and published_on is not null)
    or (date_precision='instant' and published_at is not null and published_on is not null))
);
create table archive_research.source_observations (
  observation_key text primary key,
  version_key text not null references archive_research.source_versions(version_key),
  observed_at timestamptz not null,
  method text not null,
  metrics jsonb not null default '{}',
  -- Request metadata must never contain authorization headers or raw error responses.
  request_context jsonb not null default '{}'
);
create table archive_research.source_contributors (
  record_key text not null references archive_research.source_records(record_key),
  contributor_key text not null,
  member_id bigint references public.members(member_id),
  label text not null,
  role text not null check(role in ('author','publisher','speaker')),
  primary key(record_key,contributor_key,role)
);
create table archive_research.passages (
  passage_key text primary key,
  version_key text not null references archive_research.source_versions(version_key),
  locator text not null,
  review_status text not null default 'pending' check(review_status in ('pending','rejected'))
);
-- Existing editorial work is retained as a proposal, never mistaken for original post text.
create table archive_research.editorial_proposals (
  proposal_key text primary key,
  passage_key text not null references archive_research.passages(passage_key),
  summary text not null,
  event_id integer references public.events(event_id),
  review_status text not null default 'pending' check(review_status='pending')
);
create table archive_research.coverage_runs (
  run_key text primary key,
  account_key text not null references archive_research.accounts(account_key),
  period_start timestamptz not null,
  period_end timestamptz not null,
  method text not null,
  status text not null check(status in ('planned','blocked_auth','running','partial','enumerated','access_denied','failed')),
  received_count integer not null default 0 check(received_count>=0),
  next_cursor text,
  known_total integer,
  limitations text not null,
  attempted_at timestamptz,
  check(period_end>period_start)
);
create index source_versions_record on archive_research.source_versions(record_key);
create index source_versions_published on archive_research.source_versions(published_at);
create index source_records_account on archive_research.source_records(account_key);

-- RLS + no schema/table grants: only local DB owner ingestion is supported in this phase.
alter table archive_research.accounts enable row level security;
alter table archive_research.account_identifiers enable row level security;
alter table archive_research.source_records enable row level security;
alter table archive_research.source_versions enable row level security;
alter table archive_research.source_observations enable row level security;
alter table archive_research.source_contributors enable row level security;
alter table archive_research.passages enable row level security;
alter table archive_research.editorial_proposals enable row level security;
alter table archive_research.coverage_runs enable row level security;
revoke all on all tables in schema archive_research from public, anon, authenticated, service_role;
revoke all on all sequences in schema archive_research from public, anon, authenticated, service_role;

create table archive_research.collection_audit (
 audit_id bigint generated always as identity primary key,
 record_key text not null references archive_research.source_records(record_key),
 action text not null, reason text not null, actor text not null, created_at timestamptz not null default now()
);
alter table archive_research.collection_audit enable row level security;
revoke all on archive_research.collection_audit from public,anon,authenticated,service_role;
revoke all on sequence archive_research.collection_audit_audit_id_seq from public, anon, authenticated;

-- Different period jobs share this account lock before binding immutable identity.
create function archive_research.lock_account(target_key text, expected_user_id text) returns void
language plpgsql set search_path=pg_catalog as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(
   pg_catalog.hashtextextended('archive_research:account:' || target_key, 0)
 );
 if expected_user_id is not null and exists(
   select 1 from archive_research.accounts
   where account_key=target_key and platform_user_id is not null
     and platform_user_id<>expected_user_id
 ) then
   raise exception 'account identity mismatch' using errcode='22023';
 end if;
end $$;
revoke all on function archive_research.lock_account(text,text) from public,anon,authenticated,service_role;

-- Serialize collection and suppression by source identity, even before a row exists.
create function archive_research.lock_source(target_key text) returns void
language sql volatile set search_path=pg_catalog as $$
 select pg_catalog.pg_advisory_xact_lock(
   pg_catalog.hashtextextended('archive_research:source:' || target_key, 0)
 );
$$;
revoke all on function archive_research.lock_source(text) from public,anon,authenticated,service_role;

-- Compliance action: discard stored content from every revision, keeping only internal identity.
create function archive_research.suppress_source(target_key text, reason text) returns void
language plpgsql set search_path=archive_research,public as $$
begin
 if nullif(btrim(reason),'') is null then raise exception 'reason required' using errcode='22023'; end if;
 perform archive_research.lock_source(target_key);
 update archive_research.source_observations set metrics='{}' where version_key in(select version_key from archive_research.source_versions where record_key=target_key);
 delete from archive_research.editorial_proposals where passage_key in(select p.passage_key from archive_research.passages p join archive_research.source_versions v using(version_key) where v.record_key=target_key);
 update archive_research.passages set locator='Content suppressed' where version_key in(select version_key from archive_research.source_versions where record_key=target_key);
 update archive_research.source_versions set text_content=null,public_metadata='{}',content_status='suppressed',usage_status='do_not_display' where record_key=target_key;
 update archive_research.source_records set content_suppressed=true,title=null,availability='restricted' where record_key=target_key;
 insert into archive_research.collection_audit(record_key,action,actor,reason)
 values(target_key,'suppress',current_user,btrim(reason));
end $$;
revoke all on function archive_research.suppress_source(text,text) from public,anon,authenticated,service_role;

-- Link account identity evidence to the exact source revision and passage.
create table archive_research.account_evidence (
 account_key text not null references archive_research.accounts(account_key),
 passage_key text not null references archive_research.passages(passage_key),
 fact_kind text not null check(fact_kind in ('official_identity','ownership','old_identifier')),
 review_status text not null default 'pending' check(review_status='pending'),
 primary key(account_key,passage_key,fact_kind)
);
alter table archive_research.account_evidence enable row level security;
revoke all on archive_research.account_evidence from public,anon,authenticated,service_role;
