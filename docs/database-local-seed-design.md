# Database Local Seed Design

Date: 2026-06-03

This is a design for local-only seed data. No executable seed data is approved yet.

## Purpose

Create enough deterministic local data to test:

- login-to-app-user mapping,
- branch-scoped RLS,
- work order listing,
- task claim/release/submit,
- report template reads,
- report answer save/lock/unlock,
- final report draft creation,
- storage policy paths.

## Hard Rules

- No real customer data.
- No production credentials.
- No service-role key in app/mobile/browser code.
- No cleanup/delete statements in `supabase/seed.sql`.
- No staging or production seed without explicit approval.

## Required Auth Setup

Local seed needs test auth users. The final seed script must either:

- create users through Supabase local auth admin tooling, or
- use manually created local auth user UUIDs supplied before seed execution.

Do not hardcode production auth user IDs.

## Local Seed Entities

Branch:

- code: `LOCAL-IST-001`
- name: `OTOTR Local Istanbul`
- city: `Istanbul`
- region: `Marmara`

Users:

- CEO/HQ user,
- branch manager,
- inspection technician.

Minimum tables:

- `branches`
- `app_users`
- `customers`
- `vehicles`
- `package_plans`
- `expertise_cases`
- `inspection_tasks`
- `report_templates`
- `report_template_groups`
- `report_template_items`
- `report_template_item_options`
- `report_template_item_inputs`
- `work_order_group_status`

Optional tables after first local reset:

- `technician_start_evidence`
- `inspection_evidence_assets`
- `work_order_report_answers`
- `final_reports`

## Report Media Storage Path Rule

Storage policies expect report media paths like:

```text
work-orders/<expertise_case_id>/<file_name>
```

Local upload tests should use that shape.

## Recommended Seed Sequence

1. Create local auth users.
2. Insert branch.
3. Insert app users linked to local auth user UUIDs.
4. Upsert package plans if migration 004 has not already inserted them.
5. Insert customer and vehicle.
6. Insert expertise case.
7. Insert inspection tasks or create them through `create_branch_work_order`.
8. Insert a compact report template.
9. Insert report template group/items/options.
10. Run app smoke tests.

## Open Decision

After Supabase CLI and Docker are available, decide whether to:

- keep seed setup as a manual local SQL script, or
- wire it into `supabase/seed.sql`.

