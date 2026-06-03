# Database

Source references:

- `archive/old-notes/imported-docs-priority-a-2026-06-03/data-model.md`
- `archive/old-notes/imported-docs-priority-a-2026-06-03/ekspertiz-data-backbone-v1.md`
- `database-migration-inventory.md`

Baseline database appears to be Supabase/Postgres.

## Core Decision

`expertise_case` is the central operational record. It connects:

- appointment,
- vehicle intake,
- customer and parties,
- package and payment,
- technician tablet entries,
- photos/evidence,
- measurements and device data,
- report generation,
- quality approval,
- delivery,
- complaint, warranty and legal follow-up,
- branch and franchise performance.

The customer PDF is only an output. The database record is the real source.

## Core Entity Groups

### Identity and Access

- `app_users`
- roles and permissions
- `user_region_assignments`
- branch/region scope

### Franchise and Branch

- `franchise_applications`
- `franchise_application_steps`
- `branches`
- `branch_onboarding_checklists`
- `branch_onboarding_items`
- `branch_documents`
- `dealer_contracts`
- `branch_equipment_assets`

### CRM and Appointment

- `crm_leads`
- `crm_opportunities`
- `crm_activities`
- `crm_tasks`
- `customers`
- `vehicles`
- `appointments`

### Expertise and Inspection

- `expertise_cases`
- `package_plans`
- `inspection_tasks`
- `inspection_item_values`
- `inspection_evidence_assets`
- `technician_start_evidence`
- `external_query_results`

### Reporting

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
- `report_delivery_events`
- `report_gate_issues`
- `report_revisions`
- `report_audit_logs`

### Business Operations

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

## Expertise Data Layers

Each expertise case should contain four layers:

1. operational record: work order, branch, staff, time, package and payment,
2. technical record: checks, measurements, evidence, notes and results,
3. customer narrative: simple summary, risk language, recommendation and delivery note,
4. corporate record: quality score, legal text, warranty condition, complaint link and analytics.

## Required Field Families

- work order and report identity,
- operation timestamps,
- package and finance,
- parties and permissions,
- vehicle intake,
- consent and legal scope,
- external queries,
- body/paint code dictionary,
- body 0-58 point set,
- device tests,
- technician opinions,
- warranty,
- quality gates,
- report delivery and revision history.

## Migration Rules

Review required before running any migration:

- migration order,
- destructive or cleanup statements,
- RLS policy effects,
- seed/demo separation,
- staging validation.

Manual-only files must not be placed in automatic production migration flow.

Current classification output: `database-migration-inventory.md`.
