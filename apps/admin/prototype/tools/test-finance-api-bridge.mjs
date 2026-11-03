import assert from 'node:assert/strict';
import { createFinanceSummaryClient, FinanceBridgeError, validateFinanceScope } from '../bayi-portal/assets/finance-api-bridge.mjs';

const scope = Object.freeze({
  legalEntityId: '11111111-1111-4111-8111-111111111111',
  dealerAccountId: '22222222-2222-4222-8222-222222222222',
  branchId: '33333333-3333-4333-8333-333333333333',
});
const correlationId = '44444444-4444-4444-8444-444444444444';
const publishableKey = `sb_publishable_${'a'.repeat(32)}`;
const token = `user-token-${'x'.repeat(32)}`;
let captured;
const client = createFinanceSummaryClient({
  getConfig: () => ({ url: 'https://example.supabase.co/path', publishableKey }),
  getAccessToken: () => token,
  correlationFactory: () => correlationId,
  fetchImpl: async (url, options) => {
    captured = { url, options };
    return { ok: true, status: 200, headers: { get: name => name.toLowerCase() === 'content-type' ? 'application/json' : null }, json: async () => ({ data: { ...scope } }) };
  },
});
const result = await client.getDealerFinanceSummary(scope, { asOf: '2026-11-03' });
assert.deepEqual(result.scope, scope);
assert.equal(captured.url, 'https://example.supabase.co/functions/v1/finance-read');
assert.equal(captured.options.method, 'POST');
assert.equal(captured.options.headers.apikey, publishableKey);
assert.equal(captured.options.headers.Authorization, `Bearer ${token}`);
assert.equal(captured.options.headers['Correlation-Id'], correlationId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId: 'getDealerFinanceSummary', scope, pathParams: { dealerAccountId: scope.dealerAccountId }, query: { asOf: '2026-11-03' } });
await client.exportDealerFinanceSummary(scope,{asOf:'2026-11-03'});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'exportDealerFinanceSummary',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{asOf:'2026-11-03'}});
await client.getHeadquartersFinanceSummary(scope,{asOf:'2026-11-03',currency:'TRY'});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getHeadquartersFinanceSummary',scope,pathParams:{},query:{asOf:'2026-11-03',currency:'TRY'}});
await client.getFinanceOperationalHealth(scope);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getFinanceOperationalHealth',scope,pathParams:{},query:{}});
await client.listPassThroughExpenses(scope,{from:'2026-11-01',to:'2026-11-30',status:'POSTED',cursor:'expense-cursor',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listPassThroughExpenses',scope,pathParams:{},query:{from:'2026-11-01',to:'2026-11-30',status:'POSTED',cursor:'expense-cursor',limit:25}});
const expenseId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
await client.getPassThroughExpense(scope,expenseId);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getPassThroughExpense',scope,pathParams:{expenseId},query:{}});
await client.listFinanceExportPackages(scope,{packageType:'BILLING',status:'INVOICED',cursor:'package-cursor',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listFinanceExportPackages',scope,pathParams:{},query:{packageType:'BILLING',status:'INVOICED',cursor:'package-cursor',limit:25}});
const packageId='acacacac-acac-4cac-8cac-acacacacacac';
await client.getFinanceExportPackage(scope,'BILLING',packageId);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getFinanceExportPackage',scope,pathParams:{packageId},query:{packageType:'BILLING'}});
const errorId='adadadad-adad-4dad-8dad-adadadadadad';
await client.listIntegrationErrors(scope,{status:'RETRYABLE',sourceSystem:'ERP',cursor:'error-cursor',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listIntegrationErrors',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{status:'RETRYABLE',sourceSystem:'ERP',cursor:'error-cursor',limit:25}});
await client.getIntegrationError(scope,errorId);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getIntegrationError',scope,pathParams:{dealerAccountId:scope.dealerAccountId,errorId},query:{}});
const requestId='62626262-6262-4262-8262-626262626262',auditCorrelationId='65656565-6565-4565-8565-656565656565';
await client.listApprovalWorkItems(scope,{status:'PENDING',subjectType:'PASS_THROUGH_EXPENSE',limit:25});assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listApprovalWorkItems',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{status:'PENDING',subjectType:'PASS_THROUGH_EXPENSE',limit:25}});
await client.getApprovalWorkItem(scope,requestId);assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getApprovalWorkItem',scope,pathParams:{dealerAccountId:scope.dealerAccountId,requestId},query:{}});
await client.listAuditEvents(scope,{actionCode:'EXPENSE_SUBMITTED',limit:25});assert.equal(JSON.parse(captured.options.body).operationId,'listAuditEvents');
await client.getAuditCorrelationTrace(scope,auditCorrelationId);assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getAuditCorrelationTrace',scope,pathParams:{dealerAccountId:scope.dealerAccountId,correlationId:auditCorrelationId},query:{}});
await client.listDisputes(scope,{status:'UNDER_REVIEW',cursor:'dispute-cursor',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listDisputes',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{status:'UNDER_REVIEW',cursor:'dispute-cursor',limit:25}});
const disputeId='abababab-abab-4bab-8bab-abababababab';
await client.getDispute(scope,disputeId);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getDispute',scope,pathParams:{dealerAccountId:scope.dealerAccountId,disputeId},query:{}});
await client.getDealerStatement(scope, { from: '2026-11-01', to: '2026-11-30', status: 'OPEN', cursor: 'cursor', limit: 25 });
assert.deepEqual(JSON.parse(captured.options.body), { operationId: 'getDealerStatement', scope, pathParams: { dealerAccountId: scope.dealerAccountId }, query: { from: '2026-11-01', to: '2026-11-30', status: 'OPEN', cursor: 'cursor', limit: 25 } });
await client.listPayments(scope,{from:'2026-11-01',to:'2026-11-30',status:'VERIFIED',cursor:'payment-cursor',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listPayments',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{from:'2026-11-01',to:'2026-11-30',status:'VERIFIED',cursor:'payment-cursor',limit:25}});
const paymentId = '55555555-5555-4555-8555-555555555555';
await client.getPayment(scope, paymentId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId:'getPayment', scope, pathParams:{dealerAccountId:scope.dealerAccountId,paymentId}, query:{} });
const accrualId = '66666666-6666-4666-8666-666666666666';
await client.getAccrualDetail(scope, accrualId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId:'getAccrualDetail', scope, pathParams:{dealerAccountId:scope.dealerAccountId,accrualId}, query:{} });
const reversalAccrualId = '77777777-7777-4777-8777-777777777777';
await client.getRoyaltyRefundTrace(scope,reversalAccrualId);
assert.deepEqual(JSON.parse(captured.options.body), { operationId:'getRoyaltyRefundTrace',scope,pathParams:{dealerAccountId:scope.dealerAccountId,reversalAccrualId},query:{} });
await client.listRoyaltyRefunds(scope,{from:'2026-11-01',to:'2026-11-30',cursor:'refund-cursor',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listRoyaltyRefunds',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{from:'2026-11-01',to:'2026-11-30',cursor:'refund-cursor',limit:25}});
await client.listServiceUsages(scope,{family:'QUERY',chargeStatus:'CHARGED',cursor:'usage-cursor',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listServiceUsages',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{family:'QUERY',chargeStatus:'CHARGED',cursor:'usage-cursor',limit:25}});
await client.getCurrentFinancePeriod(scope,{asOf:'2026-11-03'});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getFinancePeriod',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{asOf:'2026-11-03'}});
const periodId='87878787-8787-4787-8787-878787878787';await client.getFinancePeriodReconciliations(scope,periodId);assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getFinancePeriodReconciliations',scope,pathParams:{dealerAccountId:scope.dealerAccountId,periodId},query:{}});
await client.getCurrentFranchiseContract(scope,{asOf:'2026-11-03'});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getCurrentFranchiseContract',scope,pathParams:{dealerAccountId:scope.dealerAccountId},query:{asOf:'2026-11-03'}});
const contractId='adadadad-adad-4dad-8dad-adadadadadad';await client.listContractVersions(scope,contractId,{limit:25});assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listContractVersions',scope,pathParams:{dealerAccountId:scope.dealerAccountId,contractId},query:{limit:25}});
const contractVersionId='88888888-8888-4888-8888-888888888888';
await client.listContractFeeRules(scope,contractVersionId,{status:'ACTIVE',cursor:'99999999-9999-4999-8999-999999999999',limit:25});
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'listContractFeeRules',scope,pathParams:{dealerAccountId:scope.dealerAccountId,contractVersionId},query:{status:'ACTIVE',cursor:'99999999-9999-4999-8999-999999999999',limit:25}});
const feeRuleId='89898989-8989-4989-8989-898989898989';
await client.getContractFeeRule(scope,contractVersionId,feeRuleId);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getContractFeeRule',scope,pathParams:{dealerAccountId:scope.dealerAccountId,contractVersionId,feeRuleId},query:{}});
const candidateVersionId='abababab-abab-4bab-8bab-abababababab';
await client.getContractVersionComparison(scope,contractVersionId,candidateVersionId);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'getContractVersionComparison',scope,pathParams:{dealerAccountId:scope.dealerAccountId,activeVersionId:contractVersionId,candidateVersionId},query:{}});
const impactFeeDefinitionId='acacacac-acac-4cac-8cac-acacacacacac';const impactScenario={items:[{feeDefinitionId:impactFeeDefinitionId,basisAmount:'1180.00',quantity:'1'}]};
await client.simulateContractVersionImpact(scope,contractVersionId,candidateVersionId,impactScenario);
assert.deepEqual(JSON.parse(captured.options.body),{operationId:'simulateContractVersionImpact',scope,pathParams:{dealerAccountId:scope.dealerAccountId,activeVersionId:contractVersionId,candidateVersionId},query:{scenario:impactScenario}});

const rejectsWithCode = async (factory, code) => assert.rejects(factory, error => error instanceof FinanceBridgeError && error.code === code);
assert.throws(() => validateFinanceScope({ ...scope, branchId: 'not-a-uuid' }), error => error.code === 'FINANCE_SCOPE_INVALID');
for (const invalidConfig of [
  { url: 'http://example.com', publishableKey },
  { url: 'https://example.com', publishableKey: `ey${'a'.repeat(40)}` },
  { url: 'https://example.com', publishableKey: `sb_secret_${'a'.repeat(32)}` },
]) {
  const invalidClient = createFinanceSummaryClient({ getConfig: () => invalidConfig, getAccessToken: () => token, fetchImpl: async () => { throw new Error('must not run'); } });
  await rejectsWithCode(() => invalidClient.getDealerFinanceSummary(scope), 'CONFIGURATION_ERROR');
}
const unauthenticated = createFinanceSummaryClient({ getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => '', fetchImpl: async () => { throw new Error('must not run'); } });
await rejectsWithCode(() => unauthenticated.getDealerFinanceSummary(scope), 'AUTH_REQUIRED');
await rejectsWithCode(() => client.getDealerStatement(scope, { from: '2026-11-30', to: '2026-11-01' }), 'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getHeadquartersFinanceSummary(scope,{currency:'TRY'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listPassThroughExpenses(scope,{status:'INVALID'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listPassThroughExpenses(scope,{from:'2026-11-30',to:'2026-11-01'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getPassThroughExpense(scope,'invalid'),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listFinanceExportPackages(scope,{packageType:'INVALID'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getFinanceExportPackage(scope,'INVALID',packageId),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listIntegrationErrors(scope,{status:'INVALID'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listIntegrationErrors(scope,{sourceSystem:'bad source'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getIntegrationError(scope,'invalid'),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listApprovalWorkItems(scope,{status:'INVALID'}),'VALIDATION_ERROR');await rejectsWithCode(()=>client.getApprovalWorkItem(scope,'invalid'),'VALIDATION_ERROR');await rejectsWithCode(()=>client.listAuditEvents(scope,{actionCode:'bad action'}),'VALIDATION_ERROR');await rejectsWithCode(()=>client.getAuditCorrelationTrace(scope,'invalid'),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listDisputes(scope,{status:'INVALID'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getDispute(scope,'invalid'),'VALIDATION_ERROR');
await rejectsWithCode(() => client.getDealerStatement(scope, { status: 'INVALID' }), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getDealerStatement(scope, { limit: 201 }), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.listPayments(scope,{status:'OPEN'}),'VALIDATION_ERROR');
await rejectsWithCode(() => client.listPayments(scope,{from:'2026-11-30',to:'2026-11-01'}),'VALIDATION_ERROR');
await rejectsWithCode(() => client.getPayment(scope, 'invalid'), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getAccrualDetail(scope, 'invalid'), 'VALIDATION_ERROR');
await rejectsWithCode(() => client.getRoyaltyRefundTrace(scope,'invalid'),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listRoyaltyRefunds(scope,{from:'2026-11-30',to:'2026-11-01'}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getCurrentFinancePeriod(scope,{}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getCurrentFranchiseContract(scope,{}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listContractVersions(scope,'bad',{}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.listContractFeeRules(scope,'bad',{}),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getContractFeeRule(scope,contractVersionId,'bad'),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.getContractVersionComparison(scope,'bad',candidateVersionId),'VALIDATION_ERROR');
await rejectsWithCode(()=>client.simulateContractVersionImpact(scope,contractVersionId,candidateVersionId,{items:[]}),'VALIDATION_ERROR');
const emptyPeriodClient=createFinanceSummaryClient({getConfig:()=>({url:'https://example.com',publishableKey}),getAccessToken:()=>token,correlationFactory:()=>correlationId,fetchImpl:async()=>({ok:true,status:200,headers:{get:name=>name==='content-type'?'application/json':null},json:async()=>({data:null})})});
assert.equal((await emptyPeriodClient.getCurrentFinancePeriod(scope,{asOf:'2026-11-03'})).data,null);

const denied = createFinanceSummaryClient({
  getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => token,
  fetchImpl: async () => ({ ok: false, status: 403, headers: { get: () => 'application/json' }, json: async () => ({}) }),
});
await rejectsWithCode(() => denied.getDealerFinanceSummary(scope), 'SCOPE_DENIED');

const transport = createFinanceSummaryClient({
  getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => token,
  fetchImpl: async () => { throw new Error('raw secret backend detail'); },
});
await assert.rejects(() => transport.getDealerFinanceSummary(scope), error => error.code === 'TRANSPORT_ERROR' && !error.message.includes('secret'));

let contextRendered = null;
let clickListener = null;
globalThis.OTOTRDealerFinanceAuth = { getConfig: () => ({ url: 'https://example.com', publishableKey }), getAccessToken: () => token };
globalThis.OTOTRFinanceUI = {
  setScopeContext: value => { contextRendered = value; }, setConnectionState() {}, renderSummary() {},
  connectButton: { addEventListener: (name, listener) => { assert.equal(name, 'click'); clickListener = listener; } },
};
globalThis.OTOTR_FINANCE_CONTEXT = scope;
await import(`../bayi-portal/assets/finance-api-bridge.mjs?configured-context=${Date.now()}`);
assert.deepEqual(contextRendered, scope);
assert.equal(typeof globalThis.OTOTRFinance.connectConfiguredScope, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getDealerStatement, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getHeadquartersFinanceSummary,'function');
assert.equal(typeof globalThis.OTOTRFinance.listPassThroughExpenses,'function');
assert.equal(typeof globalThis.OTOTRFinance.getPassThroughExpense,'function');
assert.equal(typeof globalThis.OTOTRFinance.listFinanceExportPackages,'function');
assert.equal(typeof globalThis.OTOTRFinance.getFinanceExportPackage,'function');
assert.equal(typeof globalThis.OTOTRFinance.listIntegrationErrors,'function');
assert.equal(typeof globalThis.OTOTRFinance.getIntegrationError,'function');
assert.equal(typeof globalThis.OTOTRFinance.listApprovalWorkItems,'function');assert.equal(typeof globalThis.OTOTRFinance.getApprovalWorkItem,'function');assert.equal(typeof globalThis.OTOTRFinance.listAuditEvents,'function');assert.equal(typeof globalThis.OTOTRFinance.getAuditCorrelationTrace,'function');
assert.equal(typeof globalThis.OTOTRFinance.listDisputes,'function');
assert.equal(typeof globalThis.OTOTRFinance.getDispute,'function');
assert.equal(typeof globalThis.OTOTRFinance.listPayments, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getPayment, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getAccrualDetail, 'function');
assert.equal(typeof globalThis.OTOTRFinance.getRoyaltyRefundTrace,'function');
assert.equal(typeof globalThis.OTOTRFinance.listRoyaltyRefunds,'function');
assert.equal(typeof globalThis.OTOTRFinance.listServiceUsages,'function');
assert.equal(typeof globalThis.OTOTRFinance.getCurrentFinancePeriod,'function');
assert.equal(typeof globalThis.OTOTRFinance.getCurrentFranchiseContract,'function');
assert.equal(typeof globalThis.OTOTRFinance.listContractVersions,'function');
assert.equal(typeof globalThis.OTOTRFinance.listContractFeeRules,'function');
assert.equal(typeof globalThis.OTOTRFinance.getContractFeeRule,'function');
assert.equal(typeof globalThis.OTOTRFinance.getContractVersionComparison,'function');
assert.equal(typeof globalThis.OTOTRFinance.simulateContractVersionImpact,'function');
assert.equal(typeof clickListener, 'function');
globalThis.OTOTR_FINANCE_CONTEXT = { ...scope, branchId: 'invalid' };
assert.equal(globalThis.OTOTRFinance.refreshContext(), null);
assert.equal(contextRendered, null);
delete globalThis.OTOTRDealerFinanceAuth;
delete globalThis.OTOTRFinanceUI;
delete globalThis.OTOTR_FINANCE_CONTEXT;
delete globalThis.OTOTRFinance;

console.log('PASS finance-api-bridge: governance, integrations, HQ expenses, summary, contracts, statements and payment POSTs; safe failures');
