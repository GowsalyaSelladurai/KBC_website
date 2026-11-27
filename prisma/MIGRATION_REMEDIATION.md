# Prisma Migration Remediation Notes

## Why `20261124100044_init_courses/migration.sql` Was Left Unchanged
1. `20261124100044_init_courses` is already recorded in `_prisma_migrations` on the active database (`kbc_saloon`) with checksum `28e116d3ccc4535ee8f1c898f7d721e50d9d6e598b9a5fe7d078d31422d6e9ba`.
2. Line 1 of `20261124100044_init_courses/migration.sql` contains an accidental PowerShell snippet prepended before `-- CreateEnum`, and `Lesson.pendingVideoId` exists in `prisma/schema.prisma` and the live database without appearing in `20261124100044_init_courses/migration.sql`.
3. Editing an already-applied migration in place would invalidate its SHA-256 checksum against `_prisma_migrations` and risk drift on existing databases.

## How to Initialize a Fresh Empty Database Reproducibly
Use `prisma/bootstrap_clean_db.sql` (generated from `prisma/schema.prisma` via `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`) or run `npx prisma db push` against a brand-new empty database.

## Future Clean Baseline Procedure (When Coordinated Across All Environments)
1. Back up the database.
2. Mark a new squashed baseline migration or align `_prisma_migrations` only during a planned maintenance window where every environment is synchronized.
