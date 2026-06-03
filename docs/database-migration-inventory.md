# Database Migration Inventory

Inventory date: 2026-06-03
Source folder: `C:\Users\Samivolkannnn\Documents\ototr_25052026\docs\migrations`

No migration was executed during this inventory.

## Classification Summary

| File | Class | Risk | Notes |
| --- | --- | --- | --- |
| `2026-05-23-smart-vin-work-orders.md` | design note | low | Markdown note, not executable SQL. Keep with docs, not migration runner. |
| `2026-05-24-expertise-report-backbone.sql` | base schema + RLS | medium | Creates the core expertise/report operational backbone. Contains many policies, functions and triggers. |
| `2026-05-24-demo-seed-expertise-case.sql` | demo seed | high | Contains `delete from` statements. Do not run on production. Split into seed/staging-only area. |
| `2026-05-24-fix-app-users-self-rls-recursion.sql` | RLS fix | medium | Focused app user policy recursion fix. Depends on `app_users`. |
| `2026-05-24-public-report-verification-security.sql` | security check/fix | low-medium | Security hardening/check logic. Must be reviewed with Supabase permissions. |
| `2026-05-24-rls-read-policies-for-flutter.sql` | RLS policy | medium | Read policies for Flutter app. Depends on prior schema. |
| `2026-05-24-technical-task-ownership-rules.sql` | function/trigger rules | medium-high | Ownership enforcement functions/triggers. Requires role/RLS test coverage. |
| `2026-05-25-branch-work-order-rpc.sql` | RPC/API function | medium | Work order RPC layer. Depends on base expertise/customer/vehicle/package tables. |
| `2026-05-25-crm-dealer-portal-backbone.sql` | franchise CRM schema + RLS | medium-high | Large core franchise/dealer/CRM schema. Strong candidate for canonical franchise backbone. |
| `2026-05-25-harden-security-advisor-warnings.sql` | security hardening | medium | Permission and policy tightening. Review after base policies. |
| `2026-05-25-list-branch-technicians.sql` | RPC/API function | low-medium | Helper function for branch technician lists. Depends on `app_users`. |
| `2026-05-25-live-rls-safety-fixes.sql` | RLS fix | medium | Live safety fix. Requires careful order with other app user RLS files. |
| `2026-05-25-manager-readonly-task-data.sql` | RPC/API function | medium | Read-only manager task data functions. Depends on task model. |
| `2026-05-25-move-report-delivery-policy-to-private-helper.sql` | RLS/security refactor | medium | Moves policy logic into private helper. Review with helper permissions. |
| `2026-05-25-private-rls-helper-execute-hardening.sql` | security hardening | medium | Execute hardening for private helpers. Apply after helper creation. |
| `2026-05-25-private-rls-helpers.sql` | RLS helper functions + policies | medium-high | Central RLS helper layer. Must be reviewed before production. |
| `2026-05-25-public-rls-helper-execute-revoke.sql` | security hardening | medium | Revokes execute on public helper. Apply only after dependency review. |
| `2026-05-25-report-template-system.sql` | report schema + RLS | medium | Report template and final report tables. Important production candidate. |
| `2026-05-25-restore-rls-helper-execute.sql` | rollback/restore | high | Looks like a restoration/rollback style file. Do not include in forward canonical chain without reason. |
| `2026-05-25-supabase-security-hardening.sql` | security hardening | medium | General Supabase permission tightening. Validate with app flows. |
| `2026-05-26-final-report-media-live-gate.sql` | function/trigger gate | medium-high | Final report media completeness enforcement. Requires report workflow tests. |
| `2026-05-26-live-mobile-work-order-flow.sql` | RPC/API function | medium | Live mobile work order flow functions. Depends on report templates and work orders. |
| `2026-05-26-remove-demo-work-orders.sql` | cleanup/destructive | high | Contains `delete from` and cleanup intent. Staging/manual only. |
| `2026-05-26-report-audit-log-trigger-security-definer.sql` | security fix | medium | Security definer trigger adjustment. Review with audit log permissions. |

## Recommended Canonical Migration Groups

### 1. Schema Foundations

- `2026-05-24-expertise-report-backbone.sql`
- `2026-05-25-crm-dealer-portal-backbone.sql`
- `2026-05-25-report-template-system.sql`

These appear to define the main production schema backbone. They should be reviewed first and moved into a clean migration chain only after local/staging validation.

### 2. RLS and Security Layer

- `2026-05-24-fix-app-users-self-rls-recursion.sql`
- `2026-05-24-public-report-verification-security.sql`
- `2026-05-24-rls-read-policies-for-flutter.sql`
- `2026-05-25-harden-security-advisor-warnings.sql`
- `2026-05-25-live-rls-safety-fixes.sql`
- `2026-05-25-move-report-delivery-policy-to-private-helper.sql`
- `2026-05-25-private-rls-helper-execute-hardening.sql`
- `2026-05-25-private-rls-helpers.sql`
- `2026-05-25-public-rls-helper-execute-revoke.sql`
- `2026-05-25-supabase-security-hardening.sql`
- `2026-05-26-report-audit-log-trigger-security-definer.sql`

These should not be applied blindly. The final order must respect helper creation, policy replacement and execute revokes.

### 3. RPC / Function Application Layer

- `2026-05-24-technical-task-ownership-rules.sql`
- `2026-05-25-branch-work-order-rpc.sql`
- `2026-05-25-list-branch-technicians.sql`
- `2026-05-25-manager-readonly-task-data.sql`
- `2026-05-26-final-report-media-live-gate.sql`
- `2026-05-26-live-mobile-work-order-flow.sql`

These should be validated with role-based app tests after schema and RLS are stable.

### 4. Demo / Cleanup / Manual Only

- `2026-05-24-demo-seed-expertise-case.sql`
- `2026-05-26-remove-demo-work-orders.sql`
- `2026-05-25-restore-rls-helper-execute.sql`

Do not put these in the automatic production chain. Keep them in a separate manual/staging folder with clear warnings.

## Canonical Order Draft

This is a draft, not an execution instruction:

1. `2026-05-24-expertise-report-backbone.sql`
2. `2026-05-25-crm-dealer-portal-backbone.sql`
3. `2026-05-25-report-template-system.sql`
4. `2026-05-25-private-rls-helpers.sql`
5. `2026-05-24-fix-app-users-self-rls-recursion.sql`
6. `2026-05-24-rls-read-policies-for-flutter.sql`
7. `2026-05-25-live-rls-safety-fixes.sql`
8. `2026-05-24-technical-task-ownership-rules.sql`
9. `2026-05-25-branch-work-order-rpc.sql`
10. `2026-05-25-list-branch-technicians.sql`
11. `2026-05-25-manager-readonly-task-data.sql`
12. `2026-05-26-live-mobile-work-order-flow.sql`
13. `2026-05-26-final-report-media-live-gate.sql`
14. `2026-05-25-harden-security-advisor-warnings.sql`
15. `2026-05-25-supabase-security-hardening.sql`
16. `2026-05-25-move-report-delivery-policy-to-private-helper.sql`
17. `2026-05-25-private-rls-helper-execute-hardening.sql`
18. `2026-05-25-public-rls-helper-execute-revoke.sql`
19. `2026-05-26-report-audit-log-trigger-security-definer.sql`
20. `2026-05-24-public-report-verification-security.sql`

Manual only:

- `2026-05-24-demo-seed-expertise-case.sql`
- `2026-05-26-remove-demo-work-orders.sql`
- `2026-05-25-restore-rls-helper-execute.sql`

## Main Entities Covered

- `app_users`
- `user_region_assignments`
- `branches`
- `customers`
- `vehicles`
- `appointments`
- `expertise_cases`
- `package_plans`
- `inspection_tasks`
- `inspection_item_values`
- `inspection_evidence_assets`
- `technician_start_evidence`
- `external_query_results`
- `report_gate_issues`
- `report_revisions`
- `report_audit_logs`
- `report_delivery_events`
- `report_templates`
- `report_template_groups`
- `report_template_items`
- `report_template_item_options`
- `report_template_item_inputs`
- `report_template_item_media_fields`
- `work_order_report_answers`
- `work_order_report_files`
- `work_order_group_status`
- `final_reports`
- `crm_leads`
- `crm_opportunities`
- `crm_activities`
- `crm_tasks`
- `franchise_applications`
- `franchise_application_steps`
- `branch_onboarding_checklists`
- `branch_onboarding_items`
- `branch_documents`
- `dealer_contracts`
- `branch_equipment_assets`
- `finance_transactions`
- `quality_audits`
- `quality_findings`
- `support_tickets`
- `support_ticket_messages`
- `academy_courses`
- `academy_enrollments`
- `academy_certificates`
- `dealer_announcements`
- `dealer_announcement_reads`
- `customer_consent_events`
- `web_form_submissions`
- `audit_events`

## Required Checks Before Any Execution

- Confirm target database is local or staging, not production.
- Take schema backup before applying any migration batch.
- Separate seed/demo SQL from schema SQL.
- Run migrations in a disposable local database first.
- Run role matrix tests for CEO, HQ/admin, region manager, branch user and technician.
- Verify RLS does not block required Flutter/portal reads.
- Verify service-role-only operations are not exposed to frontend clients.
- Review any file with cleanup intent manually.
