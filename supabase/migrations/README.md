# Reviewed Migrations

Only audited, local-validated SQL migrations belong here.

## Naming

Use Supabase CLI naming when available:

```powershell
supabase migration new descriptive_name
```

Do not invent production migration filenames manually once the CLI is available.

## Current Rule

Reviewed local migration drafts may live here, but they are not approved for staging or production until local validation passes.

The raw source queue is documented in:

`../../packages/database/reviewed-migration-order.md`

## Current Drafts

- `202606030001_reviewed_expertise_report_backbone.sql`
- `202606030002_reviewed_report_template_system.sql`
- `202606030003_reviewed_task_ownership_rules.sql`
- `202606030004_reviewed_branch_work_order_rpc.sql`
- `202606030005_reviewed_list_branch_technicians.sql`

These drafts have not been applied locally yet because Supabase CLI and Docker are unavailable.
