-- Cover finance foreign keys used by joins and referential actions.
-- These indexes do not change business behavior or expose browser access.

create index if not exists branch_customer_revenue_snapshots_branch_idx
  on finance.branch_customer_revenue_snapshots(branch_id);
create index if not exists branch_customer_revenue_snapshots_dealer_account_idx
  on finance.branch_customer_revenue_snapshots(dealer_account_id);
create index if not exists branch_customer_revenue_snapshots_inbox_message_idx
  on finance.branch_customer_revenue_snapshots(inbox_message_id);

create index if not exists branch_operation_access_states_blocking_open_item_idx
  on finance.branch_operation_access_states(blocking_open_item_id);
create index if not exists branch_operation_access_states_branch_idx
  on finance.branch_operation_access_states(branch_id);
create index if not exists branch_operation_access_states_dealer_account_idx
  on finance.branch_operation_access_states(dealer_account_id);

create index if not exists dispute_work_items_policy_idx
  on finance.dispute_work_items(policy_id);

create index if not exists royalty_credit_applications_branch_idx
  on finance.royalty_credit_applications(branch_id);
create index if not exists royalty_credit_applications_credit_accrual_idx
  on finance.royalty_credit_applications(credit_accrual_id);
create index if not exists royalty_credit_applications_dealer_account_idx
  on finance.royalty_credit_applications(dealer_account_id);
create index if not exists royalty_credit_applications_debit_accrual_idx
  on finance.royalty_credit_applications(debit_accrual_id);
create index if not exists royalty_credit_applications_legal_entity_idx
  on finance.royalty_credit_applications(legal_entity_id);

create index if not exists royalty_credit_settlement_runs_branch_idx
  on finance.royalty_credit_settlement_runs(branch_id);
create index if not exists royalty_credit_settlement_runs_dealer_account_idx
  on finance.royalty_credit_settlement_runs(dealer_account_id);
create index if not exists royalty_credit_settlement_runs_finance_period_idx
  on finance.royalty_credit_settlement_runs(finance_period_id);
