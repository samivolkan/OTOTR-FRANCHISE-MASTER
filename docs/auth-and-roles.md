# Auth And Roles

Current status: role model exists in docs, demo data and SQL/RLS migrations, but final production auth is not yet frozen.

## Known Roles

- CEO
- HQ / Genel Merkez
- Admin
- Region Manager / Bolge Muduru
- Franchise Manager
- Branch Owner / Bayi
- Branch Manager / Sube Muduru
- Technician / Usta
- Finance
- Quality
- Support
- Customer/public report viewer

## Canonical Role References

Shared contract source:

- `packages/shared/src/erp-contracts.ts`
- `packages/shared/src/auth-contracts.test.ts`

Product-facing role names are defined as `OTOTR_ROLES`.

Current reviewed database role values are defined as `OTOTR_DB_ROLES`:

- `CEO`
- `GENERAL_MANAGER`
- `REGIONAL_MANAGER`
- `BRANCH_MANAGER`
- `INSPECTION_TECHNICIAN`
- `QUALITY_AUDITOR`
- `FINANCE`
- `LEGAL`

Temporary mapping is documented in `ROLE_TO_DB_ROLE` and `DB_ROLE_TO_ROLE`.

Important compatibility note:

- Current reviewed SQL does not yet have separate `BRANCH_OWNER`, `RECEPTION_STAFF`, `SUPPORT` or `CUSTOMER_PUBLIC` database roles.
- Until SQL role constraints are intentionally expanded, branch owner and reception-style product roles must map through existing branch/HQ database roles and RLS tests must verify the effective access.

## Access Principles

- HQ/admin can see global network data.
- Region manager can see assigned regions.
- Branch users can see only their branch.
- Technician users can see assigned work orders/tasks.
- Customer/public users can see only verified report outputs.

## Role Matrix Draft

This matrix is the working target for production RLS and app-side permissions. SQL constraints and app contracts must be updated intentionally before any role name outside `OTOTR_DB_ROLES` is used directly in production database rows.

| Product role | DB role today | Scope | Read access | Write/mutate access | Must not access |
| --- | --- | --- | --- | --- | --- |
| CEO | `CEO` | Global | All franchise, branch, operations, finance, quality, support, academy and audit data. | Global management actions except destructive/manual database operations. | Raw secrets, service-role keys in client surfaces. |
| HQ / Genel Merkez | `GENERAL_MANAGER` | Global | Global operational network data and dashboards. | HQ operational workflows, approvals, branch oversight. | Direct production destructive SQL without review. |
| Admin | `GENERAL_MANAGER` or `LEGAL` by module | Global/module | Admin module data according to assigned responsibility. | Admin actions allowed by module policy. | Finance/legal/security surfaces outside assigned module. |
| Region Manager | `REGIONAL_MANAGER` | Assigned regions | Branches, cases, quality, support and KPIs for assigned regions. | Regional follow-up and escalation actions. | Other regions and global finance unless explicitly granted. |
| Franchise Manager | `GENERAL_MANAGER` today | Global franchise pipeline | Franchise applications, candidate flow, onboarding status. | Franchise sales/onboarding actions. | Branch technician task mutation unless separately authorized. |
| Branch Owner / Bayi | `BRANCH_MANAGER` today | Own branch | Own branch operations, reports, staff status, branch finance summary. | Own branch operational actions. | Other branches, global HQ data, service-role operations. |
| Branch Manager / Sube Muduru | `BRANCH_MANAGER` | Own branch | Own branch work orders, customers, vehicles, reports, tasks, evidence and branch KPIs. | Work order management, task assignment, manager review, branch-local updates. | Other branches and HQ-only audit/security data. |
| Reception Staff | `BRANCH_MANAGER` today | Own branch, reduced fields | Appointment, intake, customer consent and front-desk status for own branch. | Intake and appointment updates. | Finance-sensitive, manager-only and technician-only mutation fields. |
| Technician / Usta | `INSPECTION_TECHNICIAN` | Assigned/claimed tasks | Assigned tasks, required case context and evidence linked to those tasks. | Claim/submit assigned tasks, upload required evidence, save allowed technical answers. | Unassigned tasks, branch finance, manager approval, other technicians' private work. |
| Finance | `FINANCE` | Global finance | Finance transactions, royalty/payment status, branch financial summaries. | Finance transaction and collection state updates. | Technician task mutation and non-finance private records. |
| Quality | `QUALITY_AUDITOR` | Global quality | Quality audits, findings, report gate issues, evidence and audit trails. | Quality review, findings, report gate controls. | Service-role/admin secrets and unrelated finance mutation. |
| Support | No direct DB role yet | Global/support queue | Support tickets and related branch/customer context needed for support. | Support ticket workflow actions. | Finance, legal and unrelated branch data unless policy grants context. |
| Customer/public report viewer | No direct DB role yet | Public verified report | Verified final report output via public verification route only. | None, except public verification read. | Raw work order data, evidence internals, customer PII beyond verified report payload. |

## Session Model Target

- Supabase Auth is the canonical session authority for live mobile/web flows.
- App authorization must resolve through `app_users.auth_user_id = auth.uid()` and database RLS helpers, not through editable user metadata.
- JWT/app metadata can be used only with a freshness caveat; RLS should prefer database-backed role and scope lookup for sensitive decisions.
- Mobile clients may store short-lived access and refresh tokens through platform-safe storage, but must never store service-role or secret keys.
- Logout must clear local session state and call the provider sign-out path when a live Supabase session exists.
- Sensitive workflows should assume deleted users may still have non-expired tokens until session revocation or expiry.

## Scope Rules

### Branch scope

- A branch-scoped user must have exactly one active branch context for normal branch operations.
- `branch_id` filters must be enforced by RLS, not only by UI filters.
- Branch users can read and mutate only rows linked to their branch unless a documented HQ override exists.

### Region scope

- Region managers must be resolved through `user_region_assignments` or a reviewed equivalent.
- Region access must derive to branch access only for branches inside assigned regions.
- Missing region assignment should fail closed.

### Technician scope

- Technician visibility is limited to tasks assigned to the technician or tasks explicitly available for claim in the same branch/workflow.
- Task mutation must require both branch/case visibility and task ownership/claim status.
- Evidence writes must be tied to the target task, report field or work order; orphan evidence should be rejected.

### Public report scope

- Public report access must go through a verified report identifier, QR token or equivalent public verification rule.
- Public users must not receive raw customer, task, audit, internal evidence or finance rows.
- Final report payloads must be treated as publishable snapshots, not broad table access.

## Database/RLS Direction

Supabase RLS is part of the security boundary. Any production-ready database chain must test:

- self user lookup,
- branch scope,
- region scope,
- technician task ownership,
- report visibility,
- public report verification,
- service-role-only operations.
- storage object access for report evidence, especially the `report-media` bucket.

## RLS Test Matrix

Before production use, run these tests on local or staging with non-production data:

| Scenario | Expected result |
| --- | --- |
| Unauthenticated user reads operational tables | Denied, except public verification surfaces. |
| Authenticated user without `app_users` row | Denied or empty result. |
| CEO reads branch/case/finance/quality data across branches | Allowed. |
| Region manager reads branch in assigned region | Allowed. |
| Region manager reads branch outside assigned region | Denied or empty result. |
| Branch manager reads own branch work orders | Allowed. |
| Branch manager reads another branch work orders | Denied or empty result. |
| Reception-style branch user reads finance-sensitive fields | Denied by policy or omitted by RPC/view contract. |
| Technician reads assigned task | Allowed. |
| Technician reads unassigned task in another branch | Denied or empty result. |
| Technician claims available task | Allowed only when workflow permits. |
| Technician updates manager approval/report delivery | Denied. |
| Finance user mutates finance transaction | Allowed. |
| Finance user mutates technician task | Denied. |
| Quality user reads evidence and gate issues | Allowed. |
| Public report viewer opens verified final report | Allowed only for publishable final report payload. |
| Public report viewer reads raw work order/evidence tables | Denied. |
| Client attempts service-role-only operation with anon/auth key | Denied. |
| Storage object insert for evidence | Requires INSERT plus SELECT/UPDATE when upsert is used. |
| View exposed to authenticated users | Must not bypass RLS; use `security_invoker` or revoke/privatize. |

Supporting files:

- `packages/database/rls-verification-checklist.sql`
- `packages/database/rls-role-fixtures.template.sql`
- `docs/auth-rls-helper-order-review.md`

## Config And Secret Rules

- `apps/mobile-branch/lib/core/config/supabase_config.dart` must stay environment-driven; do not add hardcoded Supabase URL/key fallbacks.
- `apps/mobile-technician/src/live/api.ts` must fail closed when `EXPO_PUBLIC_OTOTR_SUPABASE_URL` or `EXPO_PUBLIC_OTOTR_SUPABASE_KEY` is missing.
- `EXPO_PUBLIC_*` values are public client config only; never put service-role, database password or private API keys there.
- `.env.example` may list variable names, but real `.env` values must remain local and ignored.
- Admin/server-only tools may use private credentials only outside browser/mobile bundles and only with explicit operational purpose.

## Flutter Branch Session Design

Design source:

- `docs/mobile-branch-auth-session-design.md`

Current target:

- Keep `SupabaseConfig` environment-only.
- Keep demo login separated from live Supabase login.
- Resolve live authorization through active `app_users` rows after Supabase Auth sign-in.
- Do not enter live branch workflows when config, auth session or active `app_users` lookup is missing.

## Manual Review Required

- `packages/database/raw-migrations/rls-security`
- `packages/database/raw-migrations/rpc-functions`
- `apps/mobile-branch/lib/core/config/supabase_config.dart`
- `apps/mobile-technician/src/live/api.ts`

## Security Rules

- Do not place `service_role` in mobile or browser code.
- Real env files are not committed.
- Any hardcoded public URL/key fallback must be reviewed before live use.
- Production auth changes need staging tests and rollback plan.

## Immediate Work Queue

Done:

- Role source references documented.
- Product role to current DB role compatibility documented.
- Initial role matrix drafted.
- Session, branch, region, technician and public report scope rules drafted.
- RLS test matrix drafted.
- Mobile config/secret rules drafted.
- Expo technician live REST and Realtime config paths fail closed when public Supabase env values are missing.
- Shared auth role matrix and compile-time contract checks added.
- Flutter branch live session design documented.
- Local/staging RLS role fixture template added.
- RLS metadata checklist expanded for auth linkage, region scope, operational foreign keys and public report surfaces.
- Raw migration helper order reviewed statically in `docs/auth-rls-helper-order-review.md`.

Next:

- Run local/staging RLS fixture and behavior tests after Docker/Supabase local runtime is healthy.
- Implement Flutter live login UI/service from `docs/mobile-branch-auth-session-design.md`.
