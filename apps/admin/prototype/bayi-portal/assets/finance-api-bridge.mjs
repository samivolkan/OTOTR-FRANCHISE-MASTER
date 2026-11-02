const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const READ_OPERATION = 'getDealerFinanceSummary';
const STATEMENT_OPERATION = 'getDealerStatement';
const PAYMENT_OPERATION = 'getPayment';
const ACCRUAL_OPERATION = 'getAccrualDetail';
const REFUND_TRACE_OPERATION = 'getRoyaltyRefundTrace';
const PERIOD_OPERATION = 'getFinancePeriod';

export class FinanceBridgeError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = 'FinanceBridgeError';
    this.code = code;
    this.status = status;
  }
}

function requiredUuid(value, field, code = 'FINANCE_SCOPE_INVALID') {
  if (typeof value !== 'string' || !UUID.test(value)) throw new FinanceBridgeError(code, `${field} geçerli UUID olmalıdır.`);
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
  async function execute(rawScope, operationId, query, extraPathParams = {}, allowNull = false) {
      const scope = validateFinanceScope(rawScope);
      const config = validatedConfig(await getConfig());
      const accessToken = validatedToken(await getAccessToken());
      const correlationId = correlationFactory();
      if (!UUID.test(correlationId)) throw new FinanceBridgeError('CORRELATION_UNAVAILABLE', 'Geçerli correlation UUID üretilemedi.');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`${config.url}/functions/v1/finance-read`, {
          method: 'POST', signal: controller.signal,
          headers: {apikey: config.publishableKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=utf-8', 'X-Client-Info': 'ototr-finance-web/0.1', 'Correlation-Id': correlationId},
          body: JSON.stringify({operationId, scope, pathParams: {dealerAccountId: scope.dealerAccountId, ...extraPathParams}, query}),
        });
        const payload = await jsonOrNull(response);
        if (!response.ok) throw new FinanceBridgeError(payload?.error?.code || (response.status === 403 ? 'SCOPE_DENIED' : 'FINANCE_READ_FAILED'), payload?.error?.message || 'Finans özeti alınamadı.', response.status);
        const data = payload && Object.prototype.hasOwnProperty.call(payload,'data') ? payload.data : payload;
        if (!(allowNull && data === null) && (!data || typeof data !== 'object')) throw new FinanceBridgeError('INVALID_RESPONSE', 'Finans servisi geçersiz yanıt verdi.', 502);
        return Object.freeze({data, scope, correlationId: response.headers?.get?.('correlation-id') || correlationId});
      } catch (error) {
        if (error?.name === 'AbortError') throw new FinanceBridgeError('TIMEOUT', 'Finans servisi zaman aşımına uğradı.');
        if (error instanceof FinanceBridgeError) throw error;
        throw new FinanceBridgeError('TRANSPORT_ERROR', 'Finans servisine ulaşılamadı.');
      } finally { clearTimeout(timer); }
  }
  return Object.freeze({
    async getDealerFinanceSummary(rawScope, {asOf} = {}) {
      if (asOf !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new FinanceBridgeError('VALIDATION_ERROR', 'asOf YYYY-MM-DD biçiminde olmalıdır.');
      return execute(rawScope, READ_OPERATION, {asOf});
    },
    async getDealerStatement(rawScope, {from,to,status,cursor,limit} = {}) {
      for (const [field,value] of [['from',from],['to',to]]) if (value !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new FinanceBridgeError('VALIDATION_ERROR', `${field} YYYY-MM-DD biçiminde olmalıdır.`);
      if (from && to && from > to) throw new FinanceBridgeError('VALIDATION_ERROR', 'Ekstre tarih aralığı geçersiz.');
      if (status !== undefined && !['OPEN','PARTIALLY_ALLOCATED','CLOSED','DISPUTED','REVERSED'].includes(status)) throw new FinanceBridgeError('VALIDATION_ERROR', 'Ekstre durum filtresi geçersiz.');
      if (cursor !== undefined && (typeof cursor !== 'string' || !cursor.length || cursor.length > 512)) throw new FinanceBridgeError('VALIDATION_ERROR', 'Ekstre cursor değeri geçersiz.');
      if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 200)) throw new FinanceBridgeError('VALIDATION_ERROR', 'Ekstre limit değeri 1–200 arasında olmalıdır.');
      return execute(rawScope, STATEMENT_OPERATION, {from,to,status,cursor,limit});
    },
    async getPayment(rawScope, paymentId) {
      const normalizedPaymentId = requiredUuid(paymentId, 'paymentId', 'VALIDATION_ERROR');
      return execute(rawScope, PAYMENT_OPERATION, {}, {paymentId:normalizedPaymentId});
    },
    async getAccrualDetail(rawScope, accrualId) {
      const normalizedAccrualId = requiredUuid(accrualId, 'accrualId', 'VALIDATION_ERROR');
      return execute(rawScope, ACCRUAL_OPERATION, {}, {accrualId:normalizedAccrualId});
    },
    async getRoyaltyRefundTrace(rawScope, reversalAccrualId) {
      const normalizedId = requiredUuid(reversalAccrualId, 'reversalAccrualId', 'VALIDATION_ERROR');
      return execute(rawScope, REFUND_TRACE_OPERATION, {}, {reversalAccrualId:normalizedId});
    },
    async getCurrentFinancePeriod(rawScope,{asOf}={}) {
      if (typeof asOf!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new FinanceBridgeError('VALIDATION_ERROR','asOf YYYY-MM-DD biçiminde zorunludur.');
      return execute(rawScope,PERIOD_OPERATION,{asOf},{},true);
    }
  });
}

const auth = globalThis.OTOTRDealerFinanceAuth;
const ui = globalThis.OTOTRFinanceUI;
if (auth && ui) {
  const client = createFinanceSummaryClient({getConfig: () => auth.getConfig(), getAccessToken: () => auth.getAccessToken()});
  let configuredScope = null;
  const refreshContext = () => {
    try {
      configuredScope = validateFinanceScope(globalThis.OTOTR_FINANCE_CONTEXT);
      ui.setScopeContext(configuredScope);
      return configuredScope;
    } catch {
      configuredScope = null;
      ui.setScopeContext(null);
      return null;
    }
  };
  const api = {
    refreshContext,
    async connect(scope, options = {}) {
      ui.setConnectionState('LOADING', 'Yetkili finans projectionı yükleniyor.');
      try {
        const result = await client.getDealerFinanceSummary(scope, options);
        ui.renderSummary(result.data, result.scope);
        const periodResult=await client.getCurrentFinancePeriod(scope,{asOf:result.data.asOf});
        ui.renderCurrentPeriod?.(periodResult.data);
        return result;
      } catch (error) {
        ui.setConnectionState('ERROR', error instanceof FinanceBridgeError ? error.message : 'Finans servisine ulaşılamadı.');
        throw error;
      }
    },
    async connectConfiguredScope(options = {}) {
      const scope = configuredScope || refreshContext();
      if (!scope) throw new FinanceBridgeError('FINANCE_SCOPE_UNAVAILABLE', 'ERP finans kapsamı henüz sağlanmadı.');
      return api.connect(scope, options);
    },
    async getDealerStatement(options = {}) {
      const scope = configuredScope || refreshContext();
      if (!scope) throw new FinanceBridgeError('FINANCE_SCOPE_UNAVAILABLE', 'ERP finans kapsamı henüz sağlanmadı.');
      return client.getDealerStatement(scope, options);
    },
    async getPayment(paymentId) {
      const scope = configuredScope || refreshContext();
      if (!scope) throw new FinanceBridgeError('FINANCE_SCOPE_UNAVAILABLE', 'ERP finans kapsamı henüz sağlanmadı.');
      return client.getPayment(scope, paymentId);
    },
    async getAccrualDetail(accrualId) {
      const scope = configuredScope || refreshContext();
      if (!scope) throw new FinanceBridgeError('FINANCE_SCOPE_UNAVAILABLE', 'ERP finans kapsamı henüz sağlanmadı.');
      return client.getAccrualDetail(scope, accrualId);
    },
    async getRoyaltyRefundTrace(reversalAccrualId) {
      const scope = configuredScope || refreshContext();
      if (!scope) throw new FinanceBridgeError('FINANCE_SCOPE_UNAVAILABLE', 'ERP finans kapsamı henüz sağlanmadı.');
      return client.getRoyaltyRefundTrace(scope, reversalAccrualId);
    },
    async getCurrentFinancePeriod(options={}) {
      const scope=configuredScope||refreshContext();
      if(!scope) throw new FinanceBridgeError('FINANCE_SCOPE_UNAVAILABLE','ERP finans kapsamı henüz sağlanmadı.');
      return client.getCurrentFinancePeriod(scope,options);
    },
    async loadRoyaltyRefundTrace(reversalAccrualId) {
      ui.setRefundState?.('LOADING','Orijinal tahsilat, royalty ve dönem provenance yükleniyor…');
      try { const result=await api.getRoyaltyRefundTrace(reversalAccrualId); ui.renderRefundTrace?.(result.data); return result; }
      catch(error){ ui.setRefundState?.('ERROR',error instanceof FinanceBridgeError?error.message:'Royalty iade izi alınamadı.'); throw error; }
    },
    async loadAccrualDetail(accrualId) {
      ui.setAccrualState?.('LOADING', 'Kaynak olay, hesaplama ve çift taraflı fiş yükleniyor…');
      try {
        const result = await api.getAccrualDetail(accrualId);
        ui.renderAccrualDetail?.(result.data);
        return result;
      } catch (error) {
        ui.setAccrualState?.('ERROR', error instanceof FinanceBridgeError ? error.message : 'Tahakkuk servisine ulaşılamadı.');
        throw error;
      }
    },
    async loadPayment(paymentId) {
      ui.setPaymentState?.('LOADING', 'Yetkili ödeme ve tahsis detayı yükleniyor…');
      try {
        const result = await api.getPayment(paymentId);
        ui.renderPaymentDetail?.(result.data);
        return result;
      } catch (error) {
        ui.setPaymentState?.('ERROR', error instanceof FinanceBridgeError ? error.message : 'Ödeme servisine ulaşılamadı.');
        throw error;
      }
    },
    async loadDealerStatement({append = false} = {}) {
      const cursor = append ? ui.statementMoreButton?.dataset?.cursor : undefined;
      const filters = ui.getStatementFilters?.() || {};
      ui.setStatementState?.('LOADING', append ? 'Ekstre devam sayfası yükleniyor…' : 'Yetkili ekstre yükleniyor…');
      try {
        const result = await api.getDealerStatement({...filters, cursor});
        ui.renderStatementPage?.(result.data, {append});
        return result;
      } catch (error) {
        ui.setStatementState?.('ERROR', error instanceof FinanceBridgeError ? error.message : 'Ekstre servisine ulaşılamadı.');
        throw error;
      }
    },
  };
  globalThis.OTOTRFinance = Object.freeze(api);
  refreshContext();
  ui.connectButton?.addEventListener('click', () => { void api.connectConfiguredScope().catch(() => {}); });
  ui.statementRefreshButton?.addEventListener('click', () => { void api.loadDealerStatement().catch(() => {}); });
  ui.statementMoreButton?.addEventListener('click', () => { void api.loadDealerStatement({append:true}).catch(() => {}); });
  ui.statementStatus?.addEventListener('change', () => { ui.resetStatement?.('Filtre değişti. Güncel ekstreyi getirin.'); });
  globalThis.addEventListener?.('ototr:finance-payment-requested', event => { void api.loadPayment(event.detail?.paymentId).catch(() => {}); });
  globalThis.addEventListener?.('ototr:finance-accrual-requested', event => { void api.loadAccrualDetail(event.detail?.accrualId).catch(() => {}); });
  globalThis.addEventListener?.('ototr:finance-refund-requested',event=>{void api.loadRoyaltyRefundTrace(event.detail?.reversalAccrualId).catch(()=>{});});
}
