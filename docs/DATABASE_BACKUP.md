# Database and Storage backup

The `Database backup` GitHub Actions workflow creates a logical Supabase/Postgres
backup every day at 04:00 JST and uploads it to a private Cloudflare R2 bucket.
It can also be run manually from the Actions page.

Each archive contains:

- `roles.sql`
- `schema.sql`
- `data.sql`
- a separate SHA-256 checksum object

The same run also backs up every object in the Supabase Storage `event_pics`
bucket. Storage files are content-addressed in R2:

- `storage/objects/<first two hash characters>/<SHA-256>` contains file data
- `storage/manifests/YYYY/MM/*.tsv` maps each original path to its SHA-256

Content addressing avoids uploading duplicate files every day and preserves old
content when a source object is overwritten or deleted. Manifests are small and
provide the original `event_pics/<path>` needed for a restore.

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

Storage objects and manifests do not expire automatically. This is intentional:
deleted or overwritten source images remain recoverable. Monitor the R2 bucket
size and add a longer retention policy later if it approaches the free allowance.

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

## Restore Storage

Download the desired TSV manifest. Each row contains the SHA-256 and original
path separated by a tab. Download the corresponding content-addressed R2 object,
verify its SHA-256, and upload it back to the listed `event_pics` path using the
Supabase CLI or Dashboard. Restoring Storage metadata from the database dump
alone does not restore the file content.
