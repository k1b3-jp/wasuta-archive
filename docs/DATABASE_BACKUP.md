# Database backup

The `Database backup` GitHub Actions workflow creates a logical Supabase/Postgres
backup every day at 04:00 JST and uploads it to a private Cloudflare R2 bucket.
It can also be run manually from the Actions page.

Each archive contains:

- `roles.sql`
- `schema.sql`
- `data.sql`
- a separate SHA-256 checksum object

## Required GitHub Actions secrets

The repository already uses the first three secrets for Supabase deployment:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Add these R2 secrets:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`

The R2 token only needs Object Read & Write permission for the backup bucket.
Keep the bucket private.

## Retention

Configure an R2 lifecycle rule for prefix `database/` that deletes objects after
30 days. The workflow intentionally does not delete remote backups itself, so a
compromised GitHub credential cannot also erase older backups.

## Restore check

Download an archive and its `.sha256` file, then verify and extract it:

```bash
sha256sum --check wasuta-archive-*.tar.gz.sha256
tar -xzf wasuta-archive-*.tar.gz
```

Restore into an empty test database in this order:

```bash
psql "$TEST_DATABASE_URL" -f roles.sql
psql "$TEST_DATABASE_URL" -f schema.sql
psql "$TEST_DATABASE_URL" -f data.sql
```

Never test a restore against the production database. Run a test restore at least
monthly and after changing the backup workflow.
