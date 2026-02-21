# Manual SQL migrations (AutoLoc)

This folder contains **manual** SQL migrations that add database objects Prisma cannot express: GIST exclusion constraints, CHECK constraints, and partial indexes. They are versioned here and must be applied **after** Prisma migrations.

## When to execute

1. **After every Prisma migration**  
   Run the manual script(s) once the schema is up to date. Order of operations:
   - `npx prisma migrate dev` (or `migrate deploy` in CI/production)
   - Then run the manual file(s) for that environment.

2. **New environments**  
   When provisioning a new database (dev, staging, prod), apply Prisma migrations first, then run all SQL files in `prisma/manual/` in chronological order (by filename, e.g. `2026-setup-hardening.sql`).

3. **Idempotency**  
   The scripts are written to be **idempotent**: safe to run multiple times. They use `IF NOT EXISTS` (for extensions and indexes) and conditional blocks (for constraints) so re-running does not create duplicates or fail.

## How to run

From the project root (backend app):

```bash
# After prisma migrate dev / deploy
psql "$DATABASE_URL" -f prisma/manual/2026-setup-hardening.sql
```

Or with Supabase SQL editor: paste the contents of the file and execute (ensure the same database/schema as your app).

## How to verify constraints

After running the manual migration, you can confirm that constraints and indexes exist.

**List exclusion and CHECK constraints on a table:**

```sql
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = '"Reservation"'::regclass
  AND contype IN ('c', 'x');
```

**List partial (and normal) indexes:**

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'Reservation';
```

**GIST exclusion (no double booking):**

```sql
SELECT conname FROM pg_constraint
WHERE conrelid = '"Reservation"'::regclass AND contype = 'x';
-- Should include: autoloc_reservation_no_double_booking
```

**Extension:**

```sql
SELECT * FROM pg_extension WHERE extname = 'btree_gist';
```

## Rollback

- **CHECK constraints and exclusion**  
  To remove a constraint (e.g. for debugging or a change of rule):
  ```sql
  ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS autoloc_reservation_no_double_booking;
  ALTER TABLE "Reservation" DROP CONSTRAINT IF EXISTS autoloc_ck_Reservation_dates_order;
  -- etc.
  ```
  Rollback is **manual**: there is no automated “down” script. Document any rollback in your runbook and keep this README in sync.

- **Partial indexes**  
  Dropping them is safe and recovers space; queries may slow down:
  ```sql
  DROP INDEX IF EXISTS idx_Reservation_vehicule_dates_active;
  DROP INDEX IF EXISTS idx_Reservation_statut_pending;
  -- etc.
  ```

- **Extension**  
  `btree_gist` can be dropped with `DROP EXTENSION btree_gist;` only if no objects depend on it (so after dropping the GIST constraint above).

For production, prefer **fixing forward** (new manual migration that adjusts or drops constraints) rather than ad-hoc rollback, and keep a changelog of manual changes.

## Why database-level integrity matters

- **Defense in depth**  
  Application code can have bugs or be bypassed (e.g. direct SQL, other services). CHECK and exclusion constraints guarantee that invalid or conflicting data cannot be stored.

- **Critical business rules**  
  Rules like “no overlapping reservations for the same vehicle” and “dates and amounts must be valid” are enforced once, in one place, for all writers.

- **Audit and compliance**  
  Stored constraints are visible in the schema and can be reviewed and audited independently of application versions.

- **Performance**  
  Partial indexes keep hot-path queries (e.g. active reservations, pending payments) fast without indexing the whole table.

Manual migrations in this folder are part of the **production-ready** schema: treat them as required after Prisma migrations and track their execution in deployment and runbooks.
