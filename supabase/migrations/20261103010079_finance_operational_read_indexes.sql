-- Operational read paths used by the GM Finance audit and integration queues.
-- Partial/expression indexes keep branch-scoped cursor pagination predictable
-- without exposing raw tables to browser roles.

create index if not exists audit_events_scope_page_idx
  on finance.audit_events(
    legal_entity_id,
    ((safe_context->>'branchId')),
    ((safe_context->>'dealerAccountId')),
    created_at_utc desc,
    id desc
  );

create index if not exists integration_errors_queue_page_idx
  on finance.integration_errors(
    legal_entity_id,
    status,
    created_at_utc desc,
    id desc
  );

create index if not exists outbox_messages_delivery_queue_idx
  on finance.outbox_messages(status, created_at_utc, id)
  where status in ('PENDING','FAILED','DEAD_LETTER');
