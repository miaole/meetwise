# @meetwise/db-mysql

Minimal **MySQL** schema skeleton for `docker/compose.mysql-local.yml` (host port **33069**).

- **Not** a port of the ~130 PostgreSQL migrations.
- `owner_user_id` columns are **application-tenant ready only** — **≠ RLS equivalent**. Do not treat filters as fail-closed authorization.
- `releaseEvidence=false`. Not HA. Do not cutover on this package alone.

## Layout

- `migrations/0001_skeleton.sql` — utf8mb4 / InnoDB: `mw_schema_migrations`, `owner_principal`, `job_queue`
- Apply: `pnpm mysql:migrate:local` → `scripts/mysql-migrate-local.mjs`
- Prove: `pnpm mysql-schema:skeleton:prove`

PG migrations under `packages/db/migrations` stay intact; this package does not weaken RLS.
