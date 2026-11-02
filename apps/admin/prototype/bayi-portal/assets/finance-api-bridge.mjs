const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const READ_OPERATION = 'getDealerFinanceSummary';

export class FinanceBridgeError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = 'FinanceBridgeError';
    this.code = code;
    this.status = status;
  }
}

function requiredUuid(value, field) {
  if (typeof value !== 'string' || !UUID.test(value)) throw new FinanceBridgeError('FINANCE_SCOPE_INVALID', `${field} geçerli UUID olmalıdır.`);
  return value.toLowerCase();
}

export function validateFinanceScope(scope) {
  if (!scope || typeof scope !== 'object' || Array.isArray(scope)) throw new FinanceBridgeError('FINANCE_SCOPE_INVALID', 'Finans kapsamı zorunludur.');
  return Object.freeze({
    legalEntityId: requiredUuid(scope.legalEntityId, 'legalEntityId'),
    dealerAccountId: requiredUuid(scope.dealerAccountId, 'dealerAccountId'),
    branchId: requiredUuid(scope.branchId, 'branchId'),
  });
}

function validatedConfig(config) {
  let url;
  try { url = new URL(config?.url); } catch { throw new FinanceBridgeError('CONFIGURATION_ERROR', 'Finans Supabase URL geçersiz.'); }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) throw new FinanceBridgeError('CONFIGURATION_ERROR', 'Finans Supabase URL HTTPS olmalıdır.');
  const publishableKey = config?.publishableKey;
  if (typeof publishableKey !== 'string' || !publishableKey.startsWith('sb_publishable_') || publishableKey.length < 24) throw new FinanceBridgeError('CONFIGURATION_ERROR', 'Finans tarayıcı istemcisi yalnız publishable key kabul eder.');
  return Object.freeze({url: url.origin, publishableKey});
}

function validatedToken(token) {
  if (typeof token !== 'string' || token.length < 20) throw new FinanceBridgeError('AUTH_REQUIRED', 'Geçerli finans kullanıcı oturumu bulunamadı.', 401);
  return token;
}

async function jsonOrNull(response) {
  if (!(response.headers?.get?.('content-type') || '').toLowerCase().includes('application/json')) return null;
  try { return await response.json(); } catch { return null; }
}

export function createFinanceSummaryClient({getConfig, getAccessToken, fetchImpl = globalThis.fetch, correlationFactory = () => crypto.randomUUID(), timeoutMs = 10000} = {}) {
  if (typeof getConfig !== 'function' || typeof getAccessToken !== 'function' || typeof fetchImpl !== 'function') throw new FinanceBridgeError('CONFIGURATION_ERROR', 'Finans istemci bağımlılıkları eksik.');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 30000) throw new FinanceBridgeError('CONFIGURATION_ERROR', 'Finans timeout değeri geçersiz.');
  return Object.freeze({
    async getDealerFinanceSummary(rawScope, {asOf} = {}) {
      const scope = validateFinanceScope(rawScope);
      const config = validatedConfig(await getConfig());
      const accessToken = validatedToken(await getAccessToken());
      if (asOf !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new FinanceBridgeError('VALIDATION_ERROR', 'asOf YYYY-MM-DD biçiminde olmalıdır.');
      const correlationId = correlationFactory();
      if (!UUID.test(correlationId)) throw new FinanceBridgeError('CORRELATION_UNAVAILABLE', 'Geçerli correlation UUID üretilemedi.');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`${config.url}/functions/v1/finance-read`, {
          method: 'POST', signal: controller.signal,
          headers: {apikey: config.publishableKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=utf-8', 'X-Client-Info': 'ototr-finance-web/0.1', 'Correlation-Id': correlationId},
          body: JSON.stringify({operationId: READ_OPERATION, scope, pathParams: {dealerAccountId: scope.dealerAccountId}, query: {asOf}}),
        });
        const payload = await jsonOrNull(response);
        if (!response.ok) throw new FinanceBridgeError(payload?.error?.code || (response.status === 403 ? 'SCOPE_DENIED' : 'FINANCE_READ_FAILED'), payload?.error?.message || 'Finans özeti alınamadı.', response.status);
        const data = payload?.data ?? payload;
        if (!data || typeof data !== 'object') throw new FinanceBridgeError('INVALID_RESPONSE', 'Finans servisi geçersiz yanıt verdi.', 502);
        return Object.freeze({data, scope, correlationId: response.headers?.get?.('correlation-id') || correlationId});
      } catch (error) {
        if (error?.name === 'AbortError') throw new FinanceBridgeError('TIMEOUT', 'Finans servisi zaman aşımına uğradı.');
        if (error instanceof FinanceBridgeError) throw error;
        throw new FinanceBridgeError('TRANSPORT_ERROR', 'Finans servisine ulaşılamadı.');
      } finally { clearTimeout(timer); }
    }
  });
}

const auth = globalThis.OTOTRDealerFinanceAuth;
const ui = globalThis.OTOTRFinanceUI;
if (auth && ui) {
  const client = createFinanceSummaryClient({getConfig: () => auth.getConfig(), getAccessToken: () => auth.getAccessToken()});
  globalThis.OTOTRFinance = Object.freeze({
    async connect(scope, options = {}) {
      ui.setConnectionState('LOADING', 'Yetkili finans projectionı yükleniyor.');
      try {
        const result = await client.getDealerFinanceSummary(scope, options);
        ui.renderSummary(result.data, result.scope);
        return result;
      } catch (error) {
        ui.setConnectionState('ERROR', error instanceof FinanceBridgeError ? error.message : 'Finans servisine ulaşılamadı.');
        throw error;
      }
    }
  });
}
