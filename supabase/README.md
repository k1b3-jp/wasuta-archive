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
