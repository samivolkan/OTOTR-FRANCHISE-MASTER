const TOPIC = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

const call = async ({ supabaseUrl, serviceRoleKey, fetchImpl }, rpc, body) => {
  const response = await fetchImpl(`${supabaseUrl}/rest/v1/rpc/${rpc}`, {
    method: 'POST',
    headers: { apikey: serviceRoleKey, authorization: `Bearer ${serviceRoleKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'error',
  });
  if (!response.ok) throw Object.assign(new Error('rpc failed'), { code: 'DATABASE_ERROR' });
  return response.json();
};

export function createFinanceOutboxSupabaseAdapter({ supabaseUrl, serviceRoleKey, fetchImpl = fetch }) {
  return {
    claim: value => call({ supabaseUrl, serviceRoleKey, fetchImpl }, 'claim_outbox_messages_v2', {
      p_worker_id: value.workerId,
      p_lease_id: value.leaseId,
      p_batch_size: value.batchSize,
      p_lease_seconds: value.leaseSeconds,
      p_now_utc: value.nowUtc,
      p_allowed_topics: value.allowedTopics,
    }),
    acknowledge: value => call({ supabaseUrl, serviceRoleKey, fetchImpl }, 'acknowledge_outbox_message', {
      p_worker_id: value.workerId,
      p_lease_id: value.leaseId,
      p_message_id: value.messageId,
      p_external_ack_id: value.externalAckId,
      p_published_at_utc: value.publishedAtUtc,
    }),
    fail: value => call({ supabaseUrl, serviceRoleKey, fetchImpl }, 'fail_outbox_message', {
      p_worker_id: value.workerId,
      p_lease_id: value.leaseId,
      p_message_id: value.messageId,
      p_error_code: value.errorCode,
      p_retryable: value.retryable,
      p_max_attempts: value.maxAttempts,
      p_next_attempt_at_utc: value.nextAttemptAtUtc,
      p_now_utc: value.nowUtc,
    }),
  };
}

function validateRoutes(routes) {
  if (!routes || typeof routes !== 'object' || Array.isArray(routes)) throw new Error('outbox routes required');
  const entries = Object.entries(routes);
  if (!entries.length) throw new Error('outbox routes required');
  const validated = {};
  for (const [topic, route] of entries) {
    if (!TOPIC.test(topic) || !route || typeof route !== 'object' || Array.isArray(route)) throw new Error('outbox route invalid');
    let endpoint;
    try { endpoint = new URL(route.endpoint); } catch { throw new Error('outbox route invalid'); }
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.hash || endpoint.href.length > 2048) {
      throw new Error('outbox route invalid');
    }
    validated[topic] = Object.freeze({ endpoint: endpoint.href });
  }
  return Object.freeze(validated);
}

export function createFinanceOutboxPublisher({ routes, deliveryToken, fetchImpl = fetch }) {
  if (typeof deliveryToken !== 'string' || deliveryToken.length < 32) throw new Error('delivery token required');
  const validatedRoutes = validateRoutes(routes);
  return async message => {
    const route = validatedRoutes[message.topic];
    if (!route) throw Object.assign(new Error('route missing'), { code: 'ROUTE_NOT_CONFIGURED', retryable: false });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchImpl(route.endpoint, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${deliveryToken}`,
          'content-type': 'application/json',
          'idempotency-key': message.id,
          'correlation-id': message.correlation_id,
        },
        body: JSON.stringify({
          schemaVersion: 1,
          id: message.id,
          topic: message.topic,
          eventType: message.event_type,
          aggregateType: message.aggregate_type,
          aggregateId: message.aggregate_id,
          aggregateVersion: message.aggregate_version,
          payload: message.payload,
          payloadHash: message.payload_hash,
          correlationId: message.correlation_id,
        }),
      });
      if (!response.ok) {
        throw Object.assign(new Error('delivery rejected'), {
          code: `DELIVERY_HTTP_${response.status}`,
          retryable: response.status === 429 || response.status >= 500,
        });
      }
      return response.headers.get('x-external-ack-id') || message.id;
    } finally {
      clearTimeout(timer);
    }
  };
}
