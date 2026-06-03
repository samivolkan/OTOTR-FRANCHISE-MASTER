# Database Buildout Roadmap

Date: 2026-06-03
Scope: OTOTR Supabase/Postgres database, migrations, RLS, seeds, generated types and app integration.

No remote database command is allowed from this plan. `supabase db push` is explicitly blocked until a separate production approval exists.

## First 10 Stages

1. Freeze the database working source.
   - Active folder: `OTOTR-FRANCHISE-MASTER`.
   - Raw SQL stays under `packages/database/raw-migrations`.
   - CLI-ready local structure lives under `supabase`.
   - Old folders remain reference-only.

2. Create the local Supabase workspace skeleton.
   - Add `supabase/config.toml` for local development only.
   - Add `supabase/migrations`.
   - Add `supabase/schemas` as a reserved declarative schema area.
   - Add `supabase/seed.sql` as a safe local seed entrypoint.

3. Document the database package rules.
   - Raw migrations are not production-ready.
   - Reviewed migrations must be copied into `supabase/migrations` only after audit.
   - Manual-only SQL must stay out of the automatic chain.

4. Define the initial canonical migration order.
   - Start with schema foundations.
   - Add RLS/security after base tables exist.
   - Add RPC/functions after schema and helper policies are stable.
   - Keep seed/demo/cleanup separate.

5. Identify destructive and manual-only files.
   - Files with `delete from` or cleanup intent stay manual-only.
   - No destructive SQL is added to the reviewed chain without explicit approval.

6. Add RLS verification queries.
   - Include table RLS checks.
   - Include policy inventory checks.
   - Include `security definer` and view safety checks.
   - Include function execute-grant checks.

7. Map app code to database contracts.
   - Flutter branch app: Supabase repositories, RPC calls, storage uploads.
   - Expo technician app: live Supabase REST/auth/realtime calls.
   - Admin prototype: currently mostly demo/localStorage, live scripts need review before use.

8. Prepare local validation commands.
   - `supabase start`
   - `supabase db reset`
   - `supabase migration list`
   - type generation only after the repo adopts generated types.

9. Block remote deployment by process.
   - No `supabase db push`.
   - No production/staging connection without explicit approval.
   - No service role in mobile/browser code.

10. Record validation blockers.
   - Current machine is missing Supabase CLI.
   - Current machine is missing Docker.
   - Local DB reset cannot run until both are installed and Docker is running.

## Completed Outputs For First 5 Work Items

1. Audit report:
   - `docs/database-migration-audit.md`

2. App to database contract map:
   - `docs/database-app-contract-map.md`

3. Raw SQL classification:
   - `docs/database-raw-sql-classification.md`

4. Deployment checklist:
   - `docs/database-deployment-checklist.md`

5. Local validation runbook and blocker record:
   - `docs/database-local-validation.md`

## Completed Outputs For Baseline Work Items 1-5

1. Schema foundation 1 review:
   - `docs/reviewed-baseline-001-expertise-report-backbone.md`

2. Baseline migration draft:
   - `supabase/migrations/202606030001_reviewed_expertise_report_backbone.sql`

3. RLS/security definer review:
   - `security definer` functions in baseline draft now set `search_path = public`.
   - `public_report_verification` now uses `security_invoker = true`.

4. App contract check:
   - covered and missing tables/RPCs are listed in `docs/reviewed-baseline-001-expertise-report-backbone.md`.

5. Local validation waiting state:
   - Supabase CLI and Docker are still required before `supabase db reset`.

## Next 5 Baseline Work Items

6. Review and draft report template schema migration:
   - source: `packages/database/raw-migrations/schema-foundations/2026-05-25-report-template-system.sql`
   - goal: cover `report_templates`, report answers, group status, final reports and storage policies.

7. Review task ownership/RPC compatibility:
   - sources: `2026-05-24-technical-task-ownership-rules.sql`, `2026-05-25-manager-readonly-task-data.sql`
   - goal: fix task status vocabulary and ownership behavior before app validation.

8. Review branch work order RPC layer:
   - source: `2026-05-25-branch-work-order-rpc.sql`
   - goal: cover `create_branch_work_order` and `update_branch_work_order_task_status`.

9. Review list/save/lock mobile RPC layer:
   - sources: `2026-05-25-list-branch-technicians.sql`, report template RPC functions.
   - goal: cover mobile/Flutter RPC contract.

10. Build local seed design:
   - local-only seed for one branch, users, package, vehicle, case, tasks and report template.
   - no delete/cleanup behavior in `supabase/seed.sql`.

## Completed Outputs For Baseline Work Items 6-10

6. Report template schema migration:
   - `supabase/migrations/202606030002_reviewed_report_template_system.sql`

7. Task ownership/RPC compatibility:
   - `supabase/migrations/202606030003_reviewed_task_ownership_rules.sql`

8. Branch work order RPC layer:
   - `supabase/migrations/202606030004_reviewed_branch_work_order_rpc.sql`

9. List/save/lock mobile RPC layer:
   - `supabase/migrations/202606030005_reviewed_list_branch_technicians.sql`
   - report save/lock/unlock RPCs are in migration 002.

10. Local seed design:
   - `docs/database-local-seed-design.md`
   - no executable seed data has been added yet.

Review summary:

- `docs/reviewed-baseline-002-005-report-rpc-seed.md`

## Next 5 Baseline Work Items After 6-10

11. Static SQL dependency audit across reviewed migrations 001-005:
   - check helper/function/table references before local reset.

12. Prepare a local-only smoke seed SQL draft after auth-user strategy is chosen.

13. Add SQL verification scripts for expected tables, RPCs, policies and grants.

14. Re-run app static contract check against reviewed migrations 001-005.

15. When Supabase CLI/Docker are available, run local migration validation:
   - `supabase start`
   - `supabase migration list`
   - `supabase db reset`

## Completed Outputs For Baseline Work Items 11-15

11. Static SQL dependency audit:
   - `docs/reviewed-baseline-001-005-dependency-audit.md`

12. Local-only smoke seed SQL draft:
   - `supabase/seeds/local_smoke_seed.template.sql`
   - auth user UUID strategy is still required before execution.

13. Expected tables/RPCs/policies/grants verification scripts:
   - `packages/database/expected-contract-verification.sql`
   - use together with `packages/database/rls-verification-checklist.sql`.

14. App contract re-check against reviewed migrations 001-005:
   - `docs/reviewed-baseline-001-005-app-contract-check.md`

15. Local validation blocker/run commands:
   - Supabase CLI and Docker are still unavailable.
   - `supabase start`, `supabase migration list`, and `supabase db reset` remain pending.

## Next 5 Baseline Work Items After 11-15

16. Install/verify Supabase CLI and Docker, then validate `supabase/config.toml`.

17. Run local migration reset and capture exact SQL errors, if any.

18. Fix only local migration syntax/dependency errors found by reset.

19. Create local auth users and run the smoke seed template with local UUIDs.

20. Run RLS/app smoke verification with branch manager and technician sessions.

## Later Stages

11. Install and pin Supabase CLI version for the project.

12. Run `supabase init` or validate the hand-authored local config against the installed CLI.

13. Create the first reviewed baseline migration from the audited schema-foundation files.

14. Apply reviewed baseline to local Supabase only.

15. Add RLS/security migrations in reviewed order.

16. Add RPC/function migrations in reviewed order.

17. Create local-only seed files for deterministic test users, branches, cases and report templates.

18. Generate Supabase database types if the frontend starts consuming generated types.

19. Update Flutter and Expo code only where schema/RPC contracts change.

20. Build automated role-matrix tests for admin, region manager, branch user and technician.

21. Run app checks after local DB validation:
   - Flutter analyze/test.
   - Expo typecheck.
   - Admin prototype smoke tests.

22. Prepare staging migration runbook with backup/export commands.

23. Apply to staging only after explicit approval.

24. Run staging app smoke tests and RLS access tests.

25. Prepare production deployment checklist and rollback/remediation notes.

26. Apply to production only after explicit approval, backup and a clean staging result.
