# Supabase development workflow

Remote migrations are applied by GitHub Actions after changes are merged into
`main`. Do not manually push migrations to the remote project during feature
development.

Before committing a migration, keep local Supabase running and execute:

```bash
npm run test:supabase
```

This command performs the required local gate in order:

1. `supabase migration up --local`
2. `supabase db lint --local --level warning`
3. `supabase test db --local`

Add or update pgTAP coverage in `supabase/tests/` whenever a migration changes
constraints, publication rules, roles, or RLS policies.

The pull-request workflow runs the same checks against an ephemeral local
Supabase instance. The deployment job is skipped on pull requests and runs only
after merge to `main` (or a manual workflow dispatch).

## Backup and restore rehearsal

Remote backups are managed by the Supabase project. Before a large data import,
download a logical backup from the project dashboard or run the authenticated
CLI dump outside this repository. Never commit a dump because it may contain
user and authentication data.

Use the local stack for a restore rehearsal:

```bash
supabase db dump --local --data-only --file /tmp/wasuta-archive-data.sql
supabase db reset --local
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  --single-transaction --file /tmp/wasuta-archive-data.sql
npm run test:supabase
```

Confirm record counts for `events`, `songs`, `costumes`, `milestones`, and
`sources` before and after restoration. The reset command is destructive and
must only target the local project shown by `supabase status`.

## Data-quality operations

- `/archive/manage` maintains song, costume, and canonical source records.
- The source view can check up to 50 oldest links per run and records
  `available`, `suspect`, or `unavailable` without deleting the original URL.
- Store an Internet Archive or equivalent URL in `archived_url` when the
  original source becomes unavailable.
- `/api/archive/export.csv` exports the currently published public archive.
