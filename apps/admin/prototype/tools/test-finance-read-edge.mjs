import assert from 'node:assert/strict';
import { createFinanceReadHandler } from '../../../../supabase/functions/finance-read/core.mjs';
import { createFinanceSupabaseAdapter } from '../../../../supabase/functions/finance-read/supabase-adapter.mjs';

const origin = 'https://erp.ototr.test';
const ids = Object.freeze({
  legalEntityId: '11111111-1111-4111-8111-111111111111',
  dealerAccountId: '22222222-2222-4222-8222-222222222222',
  branchId: '33333333-3333-4333-8333-333333333333',
});
const correlationId = '44444444-4444-4444-8444-444444444444';
const token = `user-token-${'x'.repeat(32)}`;
const requestBody = { operationId: 'getDealerFinanceSummary', scope: ids, pathParams: { dealerAccountId: ids.dealerAccountId }, query: { asOf: '2026-11-03' } };
const calls = [];
const handler = createFinanceReadHandler({
  allowedOrigins: [origin], correlationFactory: () => correlationId,
  authenticate: async value => { calls.push(['authenticate', value]); return { id: 'user-1', token: value }; },
  authorizeScope: async value => { calls.push(['authorize', value]); return true; },
  authorizeHeadquartersScope:async value=>{calls.push(['authorize-hq',value]);return true;},
  readHeadquartersSummary:async value=>{calls.push(['headquarters',value]);return {...ids,dealerCount:2,branchCount:2};},
  readExpenses:async value=>{calls.push(['expenses',value]);return {items:[],nextCursor:null,hasMore:false};},
  readExpense:async value=>{calls.push(['expense',value]);return {expense:{expenseId:value.expenseId},shares:[]};},
  readExportPackages:async value=>{calls.push(['export-packages',value]);return {items:[],nextCursor:null,hasMore:false};},
  readExportPackage:async value=>{calls.push(['export-package',value]);return {packageId:value.packageId,packageType:value.packageType};},
  readIntegrationErrors:async value=>{calls.push(['integration-errors',value]);return {items:[],nextCursor:null,hasMore:false};},
  readIntegrationError:async value=>{calls.push(['integration-error',value]);return {errorId:value.errorId,safeDetail:{safeMessage:'Güvenli hata'},trace:[]};},
  readApprovalWorkItems:async value=>{calls.push(['approval-items',value]);return {items:[],nextCursor:null,hasMore:false};},
  readApprovalWorkItem:async value=>{calls.push(['approval-item',value]);return {requestId:value.requestId,steps:[]};},
  readAuditEvents:async value=>{calls.push(['audit-events',value]);return {items:[],nextCursor:null,hasMore:false};},
  readAuditCorrelationTrace:async value=>{calls.push(['audit-trace',value]);return {correlationId:value.correlationId,items:[],rawContextExposed:false};},
  readDisputes:async value=>{calls.push(['disputes',value]);return {items:[],nextCursor:null,hasMore:false};},
  readDispute:async value=>{calls.push(['dispute',value]);return {disputeId:value.disputeId};},
  readSummary: async value => { calls.push(['read', value]); return { ...ids, calculatedAtUtc: '2026-11-03T10:00:00Z' }; },
  readStatement: async value => { calls.push(['statement', value]); return { items: [], nextCursor: null, hasMore: false }; },
  readPayments: async value => { calls.push(['payments',value]); return {items:[],nextCursor:null,hasMore:false}; },
  readPayment: async value => { calls.push(['payment', value]); return { payment: { paymentId: value.paymentId }, allocations: [] }; },
  readAccrualDetail: async value => { calls.push(['accrual', value]); return { accrualId:value.accrualId, journalEntry:{lines:[]} }; },
  readRoyaltyRefunds:async value=>{calls.push(['refunds',value]);return {items:[],nextCursor:null,hasMore:false};},
  readServiceUsages:async value=>{calls.push(['usages',value]);return {items:[],nextCursor:null,hasMore:false};},
  readRefundTrace: async value => { calls.push(['refund',value]); return { reversalAccrual:{accrualId:value.reversalAccrualId} }; },
  readCurrentPeriod:async value=>{calls.push(['period',value]);return {periodId:'88888888-8888-4888-8888-888888888888',status:'OPEN'};},
  readCurrentContract:async value=>{calls.push(['contract',value]);return {contractId:'99999999-9999-4999-8999-999999999999'};},
  readContractFeeRules:async value=>{calls.push(['rules',value]);return {items:[],nextCursor:null,hasMore:false};},
});
const makeRequest = (body = requestBody, extras = {}) => new Request('https://project.supabase.co/functions/v1/finance-read', {
  method: extras.method || 'POST',
  headers: { Origin: extras.origin || origin, Authorization: extras.authorization || `Bearer ${token}`, 'Content-Type': extras.contentType || 'application/json', 'Correlation-Id': correlationId },
  body: (extras.method || 'POST') === 'POST' ? JSON.stringify(body) : undefined,
});

const success = await handler(makeRequest());
assert.equal(success.status, 200);
assert.equal(success.headers.get('access-control-allow-origin'), origin);
assert.equal(success.headers.get('correlation-id'), correlationId);
assert.deepEqual((await success.json()).data, { ...ids, calculatedAtUtc: '2026-11-03T10:00:00Z' });
assert.equal(calls[0][0], 'authenticate');
assert.equal(calls[1][0], 'authorize');
assert.deepEqual(calls[1][1].scope, ids);
assert.equal(calls[2][0], 'read');

const headquartersRequest={operationId:'getHeadquartersFinanceSummary',scope:ids,pathParams:{},query:{asOf:'2026-11-03',currency:'TRY'}};
const headquartersResponse=await handler(makeRequest(headquartersRequest));
assert.equal(headquartersResponse.status,200);assert.equal((await headquartersResponse.json()).data.dealerCount,2);assert.equal(calls.at(-1)[0],'headquarters');assert.equal(calls.at(-2)[0],'authorize-hq');

const expenseId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const expensesRequest={operationId:'listPassThroughExpenses',scope:ids,pathParams:{},query:{from:'2026-11-01',to:'2026-11-30',status:'POSTED',limit:25}};
const expensesResponse=await handler(makeRequest(expensesRequest));
assert.equal(expensesResponse.status,200);assert.deepEqual((await expensesResponse.json()).data,{items:[],nextCursor:null,hasMore:false});assert.equal(calls.at(-1)[0],'expenses');assert.equal(calls.at(-2)[0],'authorize-hq');
const expenseRequest={operationId:'getPassThroughExpense',scope:ids,pathParams:{expenseId},query:{}};
const expenseResponse=await handler(makeRequest(expenseRequest));
assert.equal(expenseResponse.status,200);assert.equal((await expenseResponse.json()).data.expense.expenseId,expenseId);assert.equal(calls.at(-1)[0],'expense');assert.equal(calls.at(-2)[0],'authorize-hq');
const packageId='acacacac-acac-4cac-8cac-acacacacacac';
const exportPackagesRequest={operationId:'listFinanceExportPackages',scope:ids,pathParams:{},query:{packageType:'BILLING',status:'INVOICED',limit:25}};
const exportPackagesResponse=await handler(makeRequest(exportPackagesRequest));assert.equal(exportPackagesResponse.status,200);assert.equal(calls.at(-1)[0],'export-packages');assert.equal(calls.at(-2)[0],'authorize-hq');
const exportPackageRequest={operationId:'getFinanceExportPackage',scope:ids,pathParams:{packageId},query:{packageType:'BILLING'}};
const exportPackageResponse=await handler(makeRequest(exportPackageRequest));assert.equal(exportPackageResponse.status,200);assert.equal((await exportPackageResponse.json()).data.packageId,packageId);assert.equal(calls.at(-1)[0],'export-package');
const errorId='adadadad-adad-4dad-8dad-adadadadadad';
const integrationErrorsRequest={operationId:'listIntegrationErrors',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{status:'RETRYABLE',sourceSystem:'ERP',limit:25}};
const integrationErrorsResponse=await handler(makeRequest(integrationErrorsRequest));assert.equal(integrationErrorsResponse.status,200);assert.equal(calls.at(-1)[0],'integration-errors');assert.equal(calls.at(-2)[0],'authorize');
const integrationErrorRequest={operationId:'getIntegrationError',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId,errorId},query:{}};
const integrationErrorResponse=await handler(makeRequest(integrationErrorRequest));assert.equal(integrationErrorResponse.status,200);assert.equal((await integrationErrorResponse.json()).data.errorId,errorId);assert.equal(calls.at(-1)[0],'integration-error');
const approvalRequestId='62626262-6262-4262-8262-626262626262',auditCorrelationId='65656565-6565-4565-8565-656565656565';
let governanceResponse=await handler(makeRequest({operationId:'listApprovalWorkItems',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{status:'PENDING',limit:25}}));assert.equal(governanceResponse.status,200);assert.equal(calls.at(-1)[0],'approval-items');
governanceResponse=await handler(makeRequest({operationId:'getApprovalWorkItem',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId,requestId:approvalRequestId},query:{}}));assert.equal(governanceResponse.status,200);assert.equal(calls.at(-1)[0],'approval-item');
governanceResponse=await handler(makeRequest({operationId:'listAuditEvents',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{limit:25}}));assert.equal(governanceResponse.status,200);assert.equal(calls.at(-1)[0],'audit-events');
governanceResponse=await handler(makeRequest({operationId:'getAuditCorrelationTrace',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId,correlationId:auditCorrelationId},query:{}}));assert.equal(governanceResponse.status,200);assert.equal(calls.at(-1)[0],'audit-trace');
const disputeId='abababab-abab-4bab-8bab-abababababab';
const disputesRequest={operationId:'listDisputes',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{status:'UNDER_REVIEW',limit:25}};
const disputesResponse=await handler(makeRequest(disputesRequest));assert.equal(disputesResponse.status,200);assert.equal(calls.at(-1)[0],'disputes');assert.equal(calls.at(-2)[0],'authorize');
const disputeRequest={operationId:'getDispute',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId,disputeId},query:{}};
const disputeResponse=await handler(makeRequest(disputeRequest));assert.equal(disputeResponse.status,200);assert.equal((await disputeResponse.json()).data.disputeId,disputeId);assert.equal(calls.at(-1)[0],'dispute');

const statementRequest = { operationId: 'getDealerStatement', scope: ids, pathParams: { dealerAccountId: ids.dealerAccountId }, query: { from: '2026-11-01', to: '2026-11-30', status: 'OPEN', limit: 25 } };
const statementResponse = await handler(makeRequest(statementRequest));
assert.equal(statementResponse.status, 200);
assert.deepEqual((await statementResponse.json()).data, { items: [], nextCursor: null, hasMore: false });
assert.equal(calls.at(-1)[0], 'statement');
assert.equal(calls.at(-2)[1].operationId, 'getDealerStatement');

const paymentsRequest={operationId:'listPayments',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{status:'VERIFIED',limit:25}};
const paymentsResponse=await handler(makeRequest(paymentsRequest));
assert.equal(paymentsResponse.status,200);assert.deepEqual((await paymentsResponse.json()).data,{items:[],nextCursor:null,hasMore:false});assert.equal(calls.at(-1)[0],'payments');

const paymentId = '55555555-5555-4555-8555-555555555555';
const paymentRequest = { operationId:'getPayment', scope:ids, pathParams:{dealerAccountId:ids.dealerAccountId,paymentId}, query:{} };
const paymentResponse = await handler(makeRequest(paymentRequest));
assert.equal(paymentResponse.status, 200);
assert.equal((await paymentResponse.json()).data.payment.paymentId, paymentId);
assert.equal(calls.at(-1)[0], 'payment');

const accrualId = '66666666-6666-4666-8666-666666666666';
const accrualRequest = { operationId:'getAccrualDetail', scope:ids, pathParams:{dealerAccountId:ids.dealerAccountId,accrualId}, query:{} };
const accrualResponse = await handler(makeRequest(accrualRequest));
assert.equal(accrualResponse.status, 200);
assert.equal((await accrualResponse.json()).data.accrualId, accrualId);
assert.equal(calls.at(-1)[0], 'accrual');

const reversalAccrualId = '77777777-7777-4777-8777-777777777777';
const refundsRequest={operationId:'listRoyaltyRefunds',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{from:'2026-11-01',to:'2026-11-30',limit:25}};
const refundsResponse=await handler(makeRequest(refundsRequest));
assert.equal(refundsResponse.status,200);assert.deepEqual((await refundsResponse.json()).data,{items:[],nextCursor:null,hasMore:false});assert.equal(calls.at(-1)[0],'refunds');
const usagesRequest={operationId:'listServiceUsages',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{family:'QUERY',chargeStatus:'CHARGED',limit:25}};
const usagesResponse=await handler(makeRequest(usagesRequest));assert.equal(usagesResponse.status,200);assert.deepEqual((await usagesResponse.json()).data,{items:[],nextCursor:null,hasMore:false});assert.equal(calls.at(-1)[0],'usages');
const refundRequest = {operationId:'getRoyaltyRefundTrace',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId,reversalAccrualId},query:{}};
const refundResponse = await handler(makeRequest(refundRequest));
assert.equal(refundResponse.status,200);
assert.equal((await refundResponse.json()).data.reversalAccrual.accrualId,reversalAccrualId);
assert.equal(calls.at(-1)[0],'refund');

const periodRequest={operationId:'getFinancePeriod',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{asOf:'2026-11-03'}};
const periodResponse=await handler(makeRequest(periodRequest));
assert.equal(periodResponse.status,200);assert.equal((await periodResponse.json()).data.status,'OPEN');assert.equal(calls.at(-1)[0],'period');

const contractRequest={operationId:'getCurrentFranchiseContract',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId},query:{asOf:'2026-11-03'}};
const contractResponse=await handler(makeRequest(contractRequest));assert.equal(contractResponse.status,200);assert.equal((await contractResponse.json()).data.contractId,'99999999-9999-4999-8999-999999999999');assert.equal(calls.at(-1)[0],'contract');
const contractVersionId='88888888-8888-4888-8888-888888888888';
const rulesRequest={operationId:'listContractFeeRules',scope:ids,pathParams:{dealerAccountId:ids.dealerAccountId,contractVersionId},query:{status:'ACTIVE',limit:25}};
const rulesResponse=await handler(makeRequest(rulesRequest));assert.equal(rulesResponse.status,200);assert.equal(calls.at(-1)[0],'rules');

assert.equal((await handler(makeRequest(requestBody, { origin: 'https://evil.test' }))).status, 403);
assert.equal((await handler(makeRequest(requestBody, { authorization: 'Bearer short' }))).status, 401);
assert.equal((await handler(makeRequest({ ...requestBody, operationId: 'deleteEverything' }))).status, 403);
assert.equal((await handler(makeRequest({ ...requestBody, unexpected: true }))).status, 400);
assert.equal((await handler(makeRequest({ ...requestBody, pathParams: { dealerAccountId: ids.branchId } }))).status, 403);
assert.equal((await handler(makeRequest({ ...requestBody, query: { asOf: '2026-02-30' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { from: '2026-11-30', to: '2026-11-01' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { status: 'INVALID' } }))).status, 400);
assert.equal((await handler(makeRequest({ ...statementRequest, query: { limit: 201 } }))).status, 400);
assert.equal((await handler(makeRequest({...paymentsRequest,query:{status:'OPEN'}}))).status,400);
assert.equal((await handler(makeRequest({...paymentRequest,pathParams:{dealerAccountId:ids.dealerAccountId,paymentId:'bad'}}))).status, 400);
assert.equal((await handler(makeRequest({...paymentRequest,query:{unexpected:true}}))).status, 400);
assert.equal((await handler(makeRequest({...accrualRequest,pathParams:{dealerAccountId:ids.dealerAccountId,accrualId:'bad'}}))).status, 400);
assert.equal((await handler(makeRequest({...refundRequest,pathParams:{dealerAccountId:ids.dealerAccountId,reversalAccrualId:'bad'}}))).status,400);
assert.equal((await handler(makeRequest({...periodRequest,query:{}}))).status,400);
assert.equal((await handler(makeRequest({...contractRequest,query:{}}))).status,400);
assert.equal((await handler(makeRequest({...rulesRequest,query:{status:'OPEN'}}))).status,400);
assert.equal((await handler(makeRequest({...expensesRequest,query:{status:'INVALID'}}))).status,400);
assert.equal((await handler(makeRequest({...expenseRequest,pathParams:{expenseId:'bad'}}))).status,400);
assert.equal((await handler(makeRequest({...exportPackagesRequest,query:{packageType:'INVALID'}}))).status,400);
assert.equal((await handler(makeRequest({...exportPackageRequest,query:{}}))).status,400);
assert.equal((await handler(makeRequest({...disputesRequest,query:{status:'INVALID'}}))).status,400);
assert.equal((await handler(makeRequest({...disputeRequest,pathParams:{dealerAccountId:ids.dealerAccountId,disputeId:'bad'}}))).status,400);
const requiredPorts={authenticate(){},authorizeScope(){},authorizeHeadquartersScope(){},readHeadquartersSummary(){},readExpenses(){},readExpense(){},readExportPackages(){},readExportPackage(){},readIntegrationErrors(){},readIntegrationError(){},readApprovalWorkItems(){},readApprovalWorkItem(){},readAuditEvents(){},readAuditCorrelationTrace(){},readDisputes(){},readDispute(){},readSummary(){},readStatement(){},readPayments(){},readPayment(){},readAccrualDetail(){},readRoyaltyRefunds(){},readServiceUsages(){},readRefundTrace(){},readCurrentPeriod(){},readCurrentContract(){},readContractFeeRules(){}};
assert.throws(() => createFinanceReadHandler({ allowedOrigins: ['*'],...requiredPorts }), /allowlist/);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: ['http://erp.ototr.test'],...requiredPorts }), /allowlist/);
assert.throws(() => createFinanceReadHandler({ allowedOrigins: [origin],...requiredPorts,maxBodyBytes:100 }), /maxBodyBytes/);

const safeHandler = createFinanceReadHandler({ allowedOrigins: [origin], correlationFactory: () => correlationId, authenticate: async () => { throw new Error('database password leaked'); }, authorizeScope: async () => true,authorizeHeadquartersScope:async()=>true,readHeadquartersSummary:async()=>({}),readExpenses:async()=>({}),readExpense:async()=>({}),readExportPackages:async()=>({}),readExportPackage:async()=>({}),readIntegrationErrors:async()=>({}),readIntegrationError:async()=>({}),readApprovalWorkItems:async()=>({}),readApprovalWorkItem:async()=>({}),readAuditEvents:async()=>({}),readAuditCorrelationTrace:async()=>({}),readDisputes:async()=>({}),readDispute:async()=>({}), readSummary: async () => ({}), readStatement: async () => ({}), readPayments:async()=>({}), readPayment: async () => ({}), readAccrualDetail: async () => ({}),readRoyaltyRefunds:async()=>({}),readServiceUsages:async()=>({}), readRefundTrace:async()=>({}),readCurrentPeriod:async()=>({}),readCurrentContract:async()=>({}),readContractFeeRules:async()=>({}) });
const safeResponse = await safeHandler(makeRequest());
assert.equal(safeResponse.status, 500);
assert.doesNotMatch(JSON.stringify(await safeResponse.json()), /password|leaked/);

const fetchCalls = [];
const jsonResponse = (status, payload) => ({ ok: status >= 200 && status < 300, status, headers: { get: name => name === 'content-type' ? 'application/json' : null }, json: async () => payload });
const adapter = createFinanceSupabaseAdapter({
  supabaseUrl: 'https://project.supabase.co/path', publishableKey: `sb_publishable_${'a'.repeat(32)}`,
  fetchImpl: async (url, options) => { fetchCalls.push({ url, options }); return url.endsWith('/auth/v1/user') ? jsonResponse(200, { id: 'user-1' }) : jsonResponse(200, url.includes('/authorize_') ? true : { ...ids }); },
});
const actor = await adapter.authenticate(token);
assert.equal(actor.id, 'user-1');
assert.equal(await adapter.authorizeScope({ actor, scope: ids, operationId: 'getDealerFinanceSummary' }), true);
await adapter.readSummary({ actor, scope: ids, dealerAccountId: ids.dealerAccountId, asOf: '2026-11-03' });
await adapter.readStatement({ actor, scope: ids, dealerAccountId: ids.dealerAccountId, from: '2026-11-01', to: '2026-11-30', status: 'OPEN', cursor: 'cursor', limit: 25 });
await adapter.readPayments({actor,scope:ids,dealerAccountId:ids.dealerAccountId,from:'2026-11-01',to:'2026-11-30',status:'VERIFIED',cursor:'payment-cursor',limit:25});
await adapter.readPayment({ actor, scope:ids, dealerAccountId:ids.dealerAccountId, paymentId });
await adapter.readAccrualDetail({ actor, scope:ids, dealerAccountId:ids.dealerAccountId, accrualId });
await adapter.readRoyaltyRefunds({actor,scope:ids,dealerAccountId:ids.dealerAccountId,from:'2026-11-01',to:'2026-11-30',cursor:'refund-cursor',limit:25});
await adapter.readServiceUsages({actor,scope:ids,dealerAccountId:ids.dealerAccountId,family:'QUERY',chargeStatus:'CHARGED',cursor:null,limit:25});
await adapter.readRefundTrace({actor,scope:ids,dealerAccountId:ids.dealerAccountId,reversalAccrualId});
await adapter.readCurrentPeriod({actor,scope:ids,dealerAccountId:ids.dealerAccountId,asOf:'2026-11-03'});
await adapter.readCurrentContract({actor,scope:ids,dealerAccountId:ids.dealerAccountId,asOf:'2026-11-03'});
await adapter.readContractFeeRules({actor,scope:ids,dealerAccountId:ids.dealerAccountId,contractVersionId,status:'ACTIVE',cursor:null,limit:25});
assert.equal(await adapter.authorizeHeadquartersScope({actor,legalEntityId:ids.legalEntityId,operationId:'getHeadquartersFinanceSummary'}),true);
await adapter.readHeadquartersSummary({actor,scope:ids,asOf:'2026-11-03',currency:'TRY'});
await adapter.readExpenses({actor,scope:ids,from:'2026-11-01',to:'2026-11-30',status:'POSTED',cursor:'expense-cursor',limit:25});
await adapter.readExpense({actor,scope:ids,expenseId});
await adapter.readDisputes({actor,scope:ids,dealerAccountId:ids.dealerAccountId,status:'UNDER_REVIEW',cursor:'dispute-cursor',limit:25});
await adapter.readDispute({actor,scope:ids,dealerAccountId:ids.dealerAccountId,disputeId});
await adapter.readExportPackages({actor,scope:ids,packageType:'BILLING',status:'INVOICED',cursor:'package-cursor',limit:25});
await adapter.readExportPackage({actor,scope:ids,packageType:'BILLING',packageId});
await adapter.readIntegrationErrors({actor,scope:ids,dealerAccountId:ids.dealerAccountId,status:'RETRYABLE',sourceSystem:'ERP',cursor:'error-cursor',limit:25});
await adapter.readIntegrationError({actor,scope:ids,dealerAccountId:ids.dealerAccountId,errorId});
assert.equal(fetchCalls.length, 23);
assert.equal(fetchCalls[0].options.headers.Authorization, `Bearer ${token}`);
assert.equal(fetchCalls[1].options.headers['Accept-Profile'], 'finance_api');
assert.deepEqual(JSON.parse(fetchCalls[2].options.body), { p_legal_entity_id: ids.legalEntityId, p_dealer_account_id: ids.dealerAccountId, p_branch_id: ids.branchId, p_as_of: '2026-11-03' });
assert.deepEqual(JSON.parse(fetchCalls[3].options.body), { p_legal_entity_id: ids.legalEntityId, p_dealer_account_id: ids.dealerAccountId, p_branch_id: ids.branchId, p_from: '2026-11-01', p_to: '2026-11-30', p_status: 'OPEN', p_cursor: 'cursor', p_limit: 25 });
assert.deepEqual(JSON.parse(fetchCalls[4].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_from:'2026-11-01',p_to:'2026-11-30',p_status:'VERIFIED',p_cursor:'payment-cursor',p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[5].options.body), { p_legal_entity_id:ids.legalEntityId, p_dealer_account_id:ids.dealerAccountId, p_branch_id:ids.branchId, p_payment_id:paymentId });
assert.deepEqual(JSON.parse(fetchCalls[6].options.body), { p_legal_entity_id:ids.legalEntityId, p_dealer_account_id:ids.dealerAccountId, p_branch_id:ids.branchId, p_accrual_id:accrualId });
assert.deepEqual(JSON.parse(fetchCalls[7].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_from:'2026-11-01',p_to:'2026-11-30',p_cursor:'refund-cursor',p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[8].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_from:null,p_to:null,p_family:'QUERY',p_charge_status:'CHARGED',p_cursor:null,p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[9].options.body), { p_legal_entity_id:ids.legalEntityId, p_dealer_account_id:ids.dealerAccountId, p_branch_id:ids.branchId, p_reversal_accrual_id:reversalAccrualId });
assert.deepEqual(JSON.parse(fetchCalls[10].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_as_of:'2026-11-03'});
assert.deepEqual(JSON.parse(fetchCalls[11].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_as_of:'2026-11-03'});
assert.deepEqual(JSON.parse(fetchCalls[12].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_contract_version_id:contractVersionId,p_status:'ACTIVE',p_cursor:null,p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[13].options.body),{p_legal_entity_id:ids.legalEntityId,p_operation_id:'getHeadquartersFinanceSummary'});
assert.deepEqual(JSON.parse(fetchCalls[14].options.body),{p_legal_entity_id:ids.legalEntityId,p_as_of:'2026-11-03',p_currency_code:'TRY'});
assert.deepEqual(JSON.parse(fetchCalls[15].options.body),{p_legal_entity_id:ids.legalEntityId,p_from:'2026-11-01',p_to:'2026-11-30',p_status:'POSTED',p_cursor:'expense-cursor',p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[16].options.body),{p_legal_entity_id:ids.legalEntityId,p_expense_id:expenseId});
assert.deepEqual(JSON.parse(fetchCalls[17].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_status:'UNDER_REVIEW',p_cursor:'dispute-cursor',p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[18].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_dispute_id:disputeId});
assert.deepEqual(JSON.parse(fetchCalls[19].options.body),{p_legal_entity_id:ids.legalEntityId,p_package_type:'BILLING',p_status:'INVOICED',p_cursor:'package-cursor',p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[20].options.body),{p_legal_entity_id:ids.legalEntityId,p_package_type:'BILLING',p_package_id:packageId});
assert.deepEqual(JSON.parse(fetchCalls[21].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_status:'RETRYABLE',p_source_system:'ERP',p_cursor:'error-cursor',p_limit:25});
assert.deepEqual(JSON.parse(fetchCalls[22].options.body),{p_legal_entity_id:ids.legalEntityId,p_dealer_account_id:ids.dealerAccountId,p_branch_id:ids.branchId,p_error_id:errorId});
for (const invalidKey of [`ey${'a'.repeat(40)}`, `sb_secret_${'a'.repeat(32)}`]) assert.throws(() => createFinanceSupabaseAdapter({ supabaseUrl: 'https://project.supabase.co', publishableKey: invalidKey }), /publishable/i);

console.log('PASS finance-read-edge: integration errors, HQ expenses, summary, contract/rules, statement, payment, accrual, refund and period; JWT scope and safe errors');
