import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const portalRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'bayi-portal');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    const relative = normalize(pathname === '/' ? 'index.html' : pathname.slice(1));
    const target = join(portalRoot, relative);
    if (!target.startsWith(portalRoot) || !(await stat(target)).isFile()) throw new Error('NOT_FOUND');
    response.writeHead(200, {'content-type': mime[extname(target)] || 'application/octet-stream'});
    response.end(await readFile(target));
  } catch {
    response.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
    response.end('Not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const scope = Object.freeze({
  legalEntityId:'11111111-1111-4111-8111-111111111111',
  dealerAccountId:'22222222-2222-4222-8222-222222222222',
  branchId:'33333333-3333-4333-8333-333333333333',
});
const item = (id, feeCode, gross, allocated, open, status = 'OPEN', recordType = 'ACCRUAL') => ({
  recordId:id, recordType, businessDate:'2026-11-03', feeCode,
  sourceReference:`SRC-${id.slice(0, 4)}`,
  totals:{netAmount:gross,taxAmount:'0',grossAmount:gross,currency:'TRY'},
  allocatedAmount:allocated, openAmount:open, currencyCode:'TRY', status,
  paymentIds:['55555555-5555-4555-8555-555555555555'],
});
const paymentItem=(id,status='PARTIALLY_ALLOCATED',received='200.00000000',verified='200.00000000',allocated='80.00000000',unallocated='120.00000000')=>({paymentId:id,paymentDate:'2026-11-03',valueDate:'2026-11-03',status,paymentMethodCode:'BANK_TRANSFER',externalReference:`BANK-${id.slice(0,4)}`,amount:{amount:received,currency:'TRY'},verifiedAmount:{amount:verified,currency:'TRY'},allocatedAmount:{amount:allocated,currency:'TRY'},unallocatedAmount:{amount:unallocated,currency:'TRY'},allocationCount:allocated==='0'?0:1,version:1,createdAtUtc:'2026-11-03T09:00:00Z'});

let browser;
const requests = [];
const commands = [];
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(({origin, scope}) => {
    window.OTOTR_SUPABASE_CONFIG = {url:origin,publishableKey:`sb_publishable_${'a'.repeat(32)}`};
    window.OTOTR_FINANCE_AUTH = {getAccessToken:() => `test-user-token-${'x'.repeat(32)}`};
    window.OTOTR_FINANCE_CONTEXT = scope;
    window.__openedFinanceDocuments=[];window.open=url=>{window.__openedFinanceDocuments.push(url);return null;};
  }, {origin, scope});
  await page.route('**/functions/v1/finance-read', async route => {
    const body = route.request().postDataJSON();
    requests.push(body);
    await new Promise(resolve => setTimeout(resolve, 75));
    if(body.operationId==='getDealerFinanceSummary'){
      const money={netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'};
      const data={...scope,asOf:'2026-11-03',currencyCode:'TRY',accrued:money,invoiced:money,collected:money,open:money,overdue:{netAmount:'0',taxAmount:'0',grossAmount:'0',currency:'TRY'},feeFamilies:[{feeFamily:'ROYALTY',netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'}],branchBreakdown:[{branchId:scope.branchId,branchCode:'NILUFER',accruedGrossAmount:'120.00000000',collectedGrossAmount:'120.00000000',openGrossAmount:'120.00000000',overdueGrossAmount:'0.00000000',currency:'TRY'}],operationalContribution:{status:'SOURCE_NOT_CONNECTED',reasonCode:'CUSTOMER_REVENUE_ADAPTER_REQUIRED',amount:null,currency:'TRY'},calculatedAtUtc:'2026-11-03T10:00:00Z'};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getHeadquartersFinanceSummary'){
      const money=(gross)=>({netAmount:gross,taxAmount:'0',grossAmount:gross,currency:'TRY'});
      const data={legalEntityId:scope.legalEntityId,asOf:'2026-11-03',currency:'TRY',dealerCount:2,branchCount:2,accrued:money('480.00000000'),invoiced:money('300.00000000'),collected:money('40.00000000'),open:money('440.00000000'),overdue:money('60.00000000'),refunded:money('59.00000000'),disputed:money('70.00000000'),unallocated:{amount:'60.00000000',currency:'TRY'},feeFamilies:[{feeFamily:'ROYALTY',netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'},{feeFamily:'ENTRY_FRANCHISE',netAmount:'300.00000000',taxAmount:'60.00000000',grossAmount:'360.00000000',currency:'TRY'}],dealerRanking:[{dealerLegalEntityId:'20202020-2020-4020-8020-202020202020',dealerCode:'BAYI-A',dealerName:'Bayi A',dealerAccountId:scope.dealerAccountId,branchId:scope.branchId,branchCode:'NILUFER',accruedGrossAmount:'300.00000000',collectedGrossAmount:'40.00000000',openGrossAmount:'260.00000000',overdueGrossAmount:'0.00000000',currency:'TRY'}]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='exportHeadquartersFinanceSummary'){
      const money=(gross)=>({netAmount:gross,taxAmount:'0',grossAmount:gross,currency:body.query.currency});const summary={legalEntityId:scope.legalEntityId,asOf:body.query.asOf,currency:body.query.currency,dealerCount:1,branchCount:1,accrued:money('120.00000000'),invoiced:money('120.00000000'),collected:money('20.00000000'),open:money('100.00000000'),overdue:money('0.00000000'),refunded:money('0.00000000'),disputed:money('0.00000000'),unallocated:{amount:'0.00000000',currency:body.query.currency},feeFamilies:[{feeFamily:'ROYALTY',netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:body.query.currency}],dealerRanking:[{dealerCode:'BAYI-A',dealerName:'Bayi A',branchCode:'=FORMULA',accruedGrossAmount:'120.00000000',collectedGrossAmount:'20.00000000',openGrossAmount:'100.00000000',overdueGrossAmount:'0.00000000',currency:body.query.currency}]};const data={schemaVersion:1,documentType:'OTOTR_FINANCE_HEADQUARTERS_SUMMARY_EXPORT',generatedAtUtc:'2026-11-03T10:00:00Z',legalEntityId:scope.legalEntityId,asOf:body.query.asOf,currency:body.query.currency,hasData:true,summary,rawRecordsExposed:false};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getFinanceOperationalHealth'){
      const data={status:'DEGRADED',generatedAtUtc:'2026-11-03T10:00:00Z',outbox:{pending:2,failed:0,deadLetter:1,oldestPendingAgeSeconds:180},integrationErrors:{open:1,retryScheduled:0},auditIntegrity:{valid:true,checkedEventCount:12,invalidEventCount:0,version:'AUDIT_SHA256_V2'},rawPayloadExposed:false};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getFinancePeriod'){
      const data={periodId:'18181818-1818-4818-8818-181818181818',parentPeriodId:'19191919-1919-4919-8919-191919191919',dealerAccountId:scope.dealerAccountId,branchId:scope.branchId,periodStart:'2026-11-01',periodEnd:'2026-11-30',currencyCode:'TRY',status:'LOCKED',sourceSnapshotHash:'a'.repeat(64),checkSnapshotHash:'b'.repeat(64),lockedAtUtc:'2026-11-30T20:00:00Z',version:3};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getFinancePeriodReconciliations'){
      const data={periodId:body.pathParams.periodId,periodStatus:'LOCKED',version:3,totalCount:1,blockingCount:0,closeReady:true,checkSnapshotHash:'b'.repeat(64),rawRecordsExposed:false,items:[{reconciliationId:'20202020-2020-4020-8020-202020202029',type:'ACCRUAL_TO_LEDGER',runNo:1,currency:'TRY',sourceTotal:'140.00000000',ledgerTotal:'140.00000000',differenceAmount:'0.00000000',status:'LOCKED',snapshotHash:'c'.repeat(64),createdAtUtc:'2026-11-30T19:00:00Z',correlationId:'21212121-2121-4121-8121-212121212129'}]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getCurrentFranchiseContract'){
      const data={contractId:'20202020-2020-4020-8020-202020202020',contractCode:'OTOTR-FR-2026-001',status:'ACTIVE',version:2,activeVersion:{versionId:'21212121-2121-4121-8121-212121212121',versionNo:3,status:'ACTIVE',validFrom:'2026-11-01',validTo:null,currencyCode:'TRY',contentHash:'c'.repeat(64),version:1},pendingVersion:{versionId:'22222222-2222-4222-8222-222222222223',versionNo:4,status:'PENDING_APPROVAL',validFrom:'2027-01-01',validTo:null,currencyCode:'TRY',contentHash:'d'.repeat(64),version:1}};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listContractVersions'){
      const version=(versionId,versionNo,status,preparedBy,approvedBy,ruleCount)=>({versionId,contractId:body.pathParams.contractId,versionNo,status,validFrom:versionNo===4?'2027-01-01':'2026-11-01',validTo:null,currencyCode:'TRY',contentHash:(versionNo===4?'d':'c').repeat(64),preparedBy,approvedBy,approvedAtUtc:approvedBy?'2026-11-02T10:00:00Z':null,createdAtUtc:'2026-11-01T09:00:00Z',version:1,ruleCount,configuredRuleCount:ruleCount,exceptionCount:versionNo===4?1:0,documents:versionNo===4?[{documentId:'74747474-7474-4474-8474-747474747474',documentType:'FRANCHISE_AGREEMENT',contentHash:'e'.repeat(64),purposeCode:'CONTRACT_VERSION_EVIDENCE_V1'}]:[],rawEvidenceExposed:false});const data={contractId:body.pathParams.contractId,items:[version('22222222-2222-4222-8222-222222222223',4,'PENDING_APPROVAL','70707070-7070-4070-8070-707070707070',null,2),version('21212121-2121-4121-8121-212121212121',3,'ACTIVE','71717171-7171-4171-8171-717171717171','72727272-7272-4272-8272-727272727272',2)],nextCursor:null,hasMore:false,rawDefinitionsExposed:false,rawStorageKeysExposed:false};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getContractVersionComparison'){
      const data={contractId:'20202020-2020-4020-8020-202020202020',activeVersionId:body.pathParams.activeVersionId,activeVersionNo:3,candidateVersionId:body.pathParams.candidateVersionId,candidateVersionNo:4,summary:{added:1,removed:0,changed:1,unchanged:1,requiresReview:true},items:[{feeDefinitionId:'32323232-3232-4323-8323-323232323232',feeCode:'ROYALTY',feeName:'Royalty Bedeli',feeFamily:'ROYALTY',ruleCode:'RULE-ROYALTY',changeType:'CHANGED',activeRuleId:'23232323-2323-4323-8323-232323232323',candidateRuleId:'33333333-3333-4333-8333-333333333333',activeMethod:'PERCENTAGE',candidateMethod:'PERCENTAGE',activePriceIncludesTax:true,candidatePriceIncludesTax:true,activeCurrency:'TRY',candidateCurrency:'TRY',activeStatus:'ACTIVE',candidateStatus:'DRAFT',activeExceptionCount:0,candidateExceptionCount:1}],rawDefinitionsExposed:false};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='simulateContractVersionImpact'){
      const scenarioItem=body.query.scenario.items[0];const data={contractId:'20202020-2020-4020-8020-202020202020',activeVersionId:body.pathParams.activeVersionId,activeVersionNo:3,candidateVersionId:body.pathParams.candidateVersionId,candidateVersionNo:4,currency:'TRY',scenarioItemCount:1,complete:true,totals:{activeGrossAmount:'100.00',candidateGrossAmount:'120.00',deltaGrossAmount:'20.00'},items:[{feeDefinitionId:scenarioItem.feeDefinitionId,feeCode:'ROYALTY',feeName:'Royalty Bedeli',basisAmount:scenarioItem.basisAmount,quantity:scenarioItem.quantity,currency:'TRY',active:{supported:true,grossAmount:'100.00'},candidate:{supported:true,grossAmount:'120.00'},deltaGrossAmount:'20.00'}],scenarioHash:'a'.repeat(64),writesPerformed:false,rawDefinitionsExposed:false};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listContractFeeRules'){
      const rule=(id,feeCode,category,method,parameter,includesTax)=>({feeRuleId:id,feeDefinitionId:id.replace(/^./,'3'),feeCode,name:`${feeCode} Bedeli`,category,ruleCode:`RULE-${feeCode}`,priority:100,status:'ACTIVE',configurationStatus:'CONFIGURED',triggerEventType:'payment.settled',basis:{kind:'COLLECTED_GROSS'},calculation:{method,currency:'TRY',priceIncludesTax:includesTax,rate:parameter,decimalScale:2,roundingMode:'HALF_UP'},exceptions:feeCode==='ROYALTY'?[{exceptionId:'26262626-2626-4626-8626-262626262627',exceptionCode:'FIRST_MONTH_EXEMPTION',scopeType:'BRANCH',conditionType:'CONTRACT_AGE',overrideType:'RATE_OVERRIDE',priority:200,effectiveFrom:'2026-11-01',effectiveTo:null,status:'ACTIVE',version:1}]:[],exceptionCount:feeCode==='ROYALTY'?1:0,version:1});
      const data=body.query.cursor
        ? {items:[rule('25252525-2525-4525-8525-252525252525','QUERY','QUERY','FIXED','25.00',false)],nextCursor:null,hasMore:false}
        : {items:[rule('23232323-2323-4323-8323-232323232323','ROYALTY','ROYALTY','PERCENTAGE','0.10',true),rule('24242424-2424-4424-8424-242424242424','ENTRY_FRANCHISE','ENTRY_FRANCHISE','FIXED','1000.00',false)],nextCursor:'24242424-2424-4424-8424-242424242424',hasMore:true};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getContractFeeRule'){
      const data={feeRuleId:body.pathParams.feeRuleId,feeDefinitionId:'32323232-2323-4323-8323-232323232323',feeDefinitionCode:'ROYALTY',feeDefinitionVersion:1,contractVersionId:body.pathParams.contractVersionId,version:1,code:'RULE-ROYALTY',name:'ROYALTY Bedeli',category:'ROYALTY',status:'DRAFT',configurationStatus:'CONFIGURED',priority:100,validity:{validFrom:'2026-11-01',validTo:null},trigger:{eventType:'payment.settled',conditions:[]},basis:{kind:'COLLECTED_GROSS'},calculation:{method:'PERCENTAGE',rate:'0.10',currency:'TRY',decimalScale:2,roundingMode:'HALF_UP'},tax:{taxCodeVersionId:'27272727-2727-4727-8727-272727272727',priceIncludesTax:true},due:{type:'IMMEDIATE'},cancellationPolicy:{type:'PROPORTIONAL_REVERSAL'},exceptions:[{exceptionId:'26262626-2626-4626-8626-262626262627',exceptionCode:'FIRST_MONTH_EXEMPTION',scopeType:'BRANCH',conditionType:'CONTRACT_AGE',overrideType:'RATE_OVERRIDE',priority:200,effectiveFrom:'2026-11-01',effectiveTo:null,status:'ACTIVE',version:1}],exceptionCount:1,createdAtUtc:'2026-11-01T09:00:00Z'};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listPayments'){
      const data=body.query.cursor==='payment-page-2'
        ? {items:[paymentItem('56565656-5656-4656-8656-565656565656','VERIFIED','50.00000000','50.00000000','0','50.00000000')],nextCursor:null,hasMore:false}
        : body.query.status==='REJECTED'
          ? {items:[],nextCursor:null,hasMore:false}
          : {items:[paymentItem('55555555-5555-4555-8555-555555555555')],nextCursor:'payment-page-2',hasMore:true};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getDealerStatementControl'){
      const data={from:body.query.from,to:body.query.to,currency:body.query.currency,openingBalance:'100.00000000',periodDebits:'120.00000000',periodCredits:'0.00000000',periodAllocations:'20.00000000',allocationReversals:'0.00000000',closingBalance:'200.00000000',aging:{current:'50.00000000',days1To30:'150.00000000',days31To60:'0.00000000',days61To90:'0.00000000',days91Plus:'0.00000000'},historicalReconstruction:true,rawRecordsExposed:false};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='exportDealerStatement'){
      const data={schemaVersion:1,documentType:'OTOTR_FINANCE_DEALER_STATEMENT_EXPORT',generatedAtUtc:'2026-11-03T10:00:00Z',scope,filters:{from:body.query.from,to:body.query.to,currency:body.query.currency,status:body.query.status||null},rowCount:1,totalMatchingCount:1,truncated:false,rawRecordsExposed:false,items:[{recordId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',recordType:'ACCRUAL',businessDate:'2026-11-03',dueDate:'2026-11-10',feeCode:'ROYALTY',sourceReference:'=FORMULA',netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',allocatedAmount:'20.00000000',openAmount:'100.00000000',currency:'TRY',status:'OPEN'}]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='exportAccruals'){
      const data={schemaVersion:1,documentType:'OTOTR_FINANCE_DEALER_STATEMENT_EXPORT',exportKind:'ACCRUALS',generatedAtUtc:'2026-11-03T10:00:00Z',scope,filters:{from:body.query.from,to:body.query.to,currency:body.query.currency,status:null,feeFamily:body.query.feeFamily||null,periodStatus:body.query.periodStatus||null},rowCount:1,totalMatchingCount:1,truncated:false,rawRecordsExposed:false,items:[{recordId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',recordType:'ACCRUAL',businessDate:'2026-11-03',dueDate:'2026-11-10',feeCode:'ROYALTY',feeFamily:'ROYALTY',sourceReference:'SRC-ACCRUAL',netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',allocatedAmount:'20.00000000',openAmount:'100.00000000',currency:'TRY',status:'OPEN',periodStatus:'LOCKED'}]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listRoyaltyRefunds'){
      const refund=(id,refundId,amount)=>({reversalAccrualId:id,refundId,refundBusinessDate:'2026-11-03',originalCollectionId:'13131313-1313-4313-8313-131313131313',refundedGrossAmount:amount,originalRoyaltyAccrualId:'14141414-1414-4414-8414-141414141414',originalRoyaltyAmount:'118.00000000',royaltyReversalAmount:'59.00000000',currency:'TRY',status:'POSTED',originalPeriodId:'16161616-1616-4616-8616-161616161616',postingPeriodId:'17171717-1717-4717-8717-171717171717'});
      const data=body.query.cursor?{items:[refund('26262626-2626-4626-8626-262626262626','27272727-2727-4727-8727-272727272727','100.00000000')],nextCursor:null,hasMore:false}:{items:[refund('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','12121212-1212-4212-8212-121212121212','590.00000000')],nextCursor:'refund-page-2',hasMore:true};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listServiceUsages'){
      const usage=(id,reference,charged)=>({sourceEventId:id,usageId:id,businessDate:'2026-11-03',occurredAtUtc:'2026-11-03T09:00:00Z',sourceSystem:'ERP',eventType:'query.completed',feeFamily:'QUERY',serviceCode:'TRAMER_QUERY',providerCode:'PROVIDER-A',externalReference:reference,chargeStatus:charged?'CHARGED':'NOT_CHARGED',freeEntitlementApplied:!charged,technicalRepeat:false,providerCostAmount:'50.00000000',dealerPriceAmount:charged?'120.00000000':null,marginAmount:charged?'70.00000000':null,currency:'TRY',accrualId:charged?'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa':null,calculationStatus:charged?'POSTED':null});
      const data=body.query.cursor?{items:[usage('29292929-2929-4929-8929-292929292929','QUERY-FREE-001',false)],nextCursor:null,hasMore:false}:{items:[usage('28282828-2828-4828-8828-282828282828','QUERY-001',true)],nextCursor:'usage-page-2',hasMore:true};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getServiceUsageDetail'){
      const free=body.pathParams.sourceEventId==='29292929-2929-4929-8929-292929292929';const data={sourceEventId:body.pathParams.sourceEventId,usageId:body.pathParams.sourceEventId,businessDate:'2026-11-03',sourceSystem:'ERP',feeFamily:'QUERY',serviceCode:'TRAMER_QUERY',providerCode:'PROVIDER-A',externalReference:free?'QUERY-FREE-001':'QUERY-001',freeEntitlement:{applied:free,policyCode:free?'MONTHLY_FREE_QUERY':null,sequence:free?1:null},technicalRepeatEvidence:{isTechnicalRepeat:true,repeatOfUsageId:'29292929-2929-4929-8929-292929292929',reasonCode:'PROVIDER_TIMEOUT',evidenceHash:'d'.repeat(64)},providerCost:{amount:'50.00000000',currency:'TRY'},charge:{status:free?'NOT_CHARGED':'CHARGED',dealerPriceAmount:free?null:'120.00000000',currency:'TRY',accrualId:free?null:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},calculation:{calculationRunId:free?null:'30303030-3030-4030-8030-303030303030',status:free?'NOT_RUN':'SUCCEEDED',feeRuleId:'99999999-9999-4999-8999-999999999999'},sourcePayloadHash:'e'.repeat(64),correlationId:'31313131-3131-4131-8131-313131313131',rawPayloadExposed:false};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='exportServiceUsages'){
      const data={schemaVersion:1,documentType:'OTOTR_FINANCE_SERVICE_USAGE_EXPORT',rowCount:1,totalMatchingCount:1,truncated:false,rawPayloadExposed:false,items:[{sourceEventId:'28282828-2828-4828-8828-282828282828',usageId:'28282828-2828-4828-8828-282828282828',businessDate:'2026-11-03',occurredAtUtc:'2026-11-03T09:00:00Z',sourceSystem:'ERP',feeFamily:'QUERY',serviceCode:'TRAMER_QUERY',providerCode:'PROVIDER-A',externalReference:'=QUERY-001',chargeStatus:'CHARGED',freeEntitlementApplied:false,technicalRepeat:true,technicalRepeatEvidenceHash:'d'.repeat(64),providerCostAmount:'50.00000000',dealerPriceAmount:'120.00000000',currency:'TRY',accrualId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',sourcePayloadHash:'e'.repeat(64)}]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listPassThroughExpenses'){
      const expense=(id,reference,status='POSTED')=>({expenseId:id,expenseDate:'2026-11-03',supplierReference:reference,contractualBasisReference:'OTOTR-MASRAF-2026',feeCode:'PASS_THROUGH',feeName:'Ortak hizmet masrafı',status,sourceAmount:'1200.00000000',distributableAmount:'1200.00000000',currency:'TRY',allocationMethod:'EQUAL',shareCount:2,documentCount:1,journalEntryId:'34343434-3434-4434-8434-343434343434',reversalJournalEntryId:null,version:1});
      const data=body.query.cursor?{items:[expense('32323232-3232-4232-8232-323232323232','SUPPLIER-002','APPROVED')],nextCursor:null,hasMore:false}:{items:[expense('30303030-3030-4030-8030-303030303030','SUPPLIER-001')],nextCursor:'expense-page-2',hasMore:true};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getPassThroughExpense'){
      const data={expenseId:body.pathParams.expenseId,expenseDate:'2026-11-03',supplierReference:'SUPPLIER-001',contractualBasisReference:'OTOTR-MASRAF-2026',feeCode:'PASS_THROUGH',feeName:'Ortak hizmet masrafı',status:'POSTED',currency:'TRY',source:{netAmount:'1000.00000000',taxAmount:'200.00000000',grossAmount:'1200.00000000'},distributable:{netAmount:'1000.00000000',taxAmount:'200.00000000',grossAmount:'1200.00000000'},allocationPolicy:{method:'EQUAL'},approval:{status:'APPROVED'},documents:[{documentId:'33333333-3333-4333-8333-333333333334'}],shares:[{shareId:'35353535-3535-4535-8535-353535353535',dealerAccountId:scope.dealerAccountId,branchId:scope.branchId,dealerCode:'BAYI-A',dealerName:'Bayi A',branchCode:'NILUFER',allocationMethod:'EQUAL',allocationRate:'0.50000000',netAmount:'500.00000000',taxAmount:'100.00000000',shareAmount:'600.00000000',currency:'TRY',accrualId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},{shareId:'36363636-3636-4636-8636-363636363636',dealerAccountId:'37373737-3737-4737-8737-373737373737',branchId:'38383838-3838-4838-8838-383838383838',dealerCode:'BAYI-B',dealerName:'Bayi B',branchCode:'KADIKOY',allocationMethod:'EQUAL',allocationRate:'0.50000000',netAmount:'500.00000000',taxAmount:'100.00000000',shareAmount:'600.00000000',currency:'TRY',accrualId:null}],journalEntryId:'34343434-3434-4434-8434-343434343434',reversalJournalEntryId:null,evidenceHash:'e'.repeat(64),version:1};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listDisputes'){
      const dispute=(id,caseNo,status='PARTIALLY_ACCEPTED')=>({disputeId:id,caseNo,openItemId:'40404040-4040-4040-8040-404040404040',accrualId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',feeCode:'ROYALTY',feeName:'Royalty',reasonCode:'AMOUNT_MISMATCH',disputedAmount:'100.00000000',acceptedAmount:status==='UNDER_REVIEW'?null:'70.00000000',currency:'TRY',status,documentCount:1,createdAtUtc:'2026-11-03T09:00:00Z',decidedAtUtc:status==='UNDER_REVIEW'?null:'2026-11-06T12:00:00Z',version:3});
      const data=body.query.cursor?{items:[dispute('41414141-4141-4141-8141-414141414141','DSP-002','UNDER_REVIEW')],nextCursor:null,hasMore:false}:{items:[dispute('39393939-3939-4939-8939-393939393939','DSP-001')],nextCursor:'dispute-page-2',hasMore:true};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getDispute'){
      const data={disputeId:body.pathParams.disputeId,caseNo:'DSP-001',status:'PARTIALLY_ACCEPTED',reasonCode:'AMOUNT_MISMATCH',amounts:{disputedAmount:'100.00000000',acceptedAmount:'70.00000000',currency:'TRY'},target:{openItemId:'40404040-4040-4040-8040-404040404040',accrualId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',feeDefinitionId:'42424242-4242-4242-8242-424242424242',originalAmount:'140.00000000',openAmount:'140.00000000'},evidence:{targetRecordType:'OPEN_ITEM'},documents:[{documentId:'43434343-4343-4343-8343-434343434343',externalDocumentId:'44444444-4444-4444-8444-444444444445',documentType:'DISPUTE_EVIDENCE',objectKey:'masked',contentHash:'f'.repeat(64)}],approval:{requestId:'45454545-4545-4545-8545-454545454545',status:'APPROVED',policyVersion:'MAKER-CHECKER-V1',steps:[]},decision:{reasonCode:'PARTIAL_SUPPORT',noteHash:'a'.repeat(64),decidedBy:'46464646-4646-4646-8646-464646464646',decidedAtUtc:'2026-11-06T12:00:00Z'},correctionJournal:{journalEntryId:'47474747-4747-4747-8747-474747474747',entryType:'DISPUTE_ADJUSTMENT',postingDate:'2026-11-06',financePeriodId:'48484848-4848-4848-8848-484848484848',status:'POSTED'},createdAtUtc:'2026-11-03T09:00:00Z',createdBy:'49494949-4949-4949-8949-494949494949',correlationId:'50505050-5050-4050-8050-505050505050',version:3};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listFinanceExportPackages'){
      const billing={packageId:'51515151-5151-4151-8151-515151515151',packageType:'BILLING',batchNo:'BILL-202611-001',status:'INVOICED',financePeriodId:'52525252-5252-4252-8252-525252525252',dealerAccountId:scope.dealerAccountId,branchId:scope.branchId,netTotal:'120.00000000',taxTotal:'20.00000000',grossTotal:'140.00000000',currency:'TRY',contentHash:'a'.repeat(64),mappingVersion:'EINVOICE-V1',targetAdapterCode:'SYNTHETIC_EINVOICE',itemCount:1,externalStatus:'ISSUED',createdAtUtc:'2026-11-05T09:00:00Z'};
      const accounting={packageId:'53535353-5353-4353-8353-535353535353',packageType:'ACCOUNTING',batchNo:'ACC-202611-001',status:'READY',financePeriodId:'52525252-5252-4252-8252-525252525252',dealerAccountId:null,branchId:null,netTotal:'140.00000000',taxTotal:'0.00000000',grossTotal:'140.00000000',currency:'TRY',contentHash:'b'.repeat(64),mappingVersion:'ERP-V1',targetAdapterCode:null,itemCount:1,externalStatus:null,createdAtUtc:'2026-11-04T09:00:00Z'};
      const data=body.query.cursor?{items:[accounting],nextCursor:null,hasMore:false}:{items:[billing],nextCursor:'export-page-2',hasMore:true};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getFinanceExportPackage'){
      const data={packageId:body.pathParams.packageId,packageType:'BILLING',batchNo:'BILL-202611-001',status:'INVOICED',financePeriodId:'52525252-5252-4252-8252-525252525252',dealerAccountId:scope.dealerAccountId,branchId:scope.branchId,groupingProfileCode:'BRANCH-MONTHLY',currency:'TRY',totals:{netAmount:'120.00000000',taxAmount:'20.00000000',grossAmount:'140.00000000'},contentHash:'a'.repeat(64),mappingVersion:'EINVOICE-V1',targetAdapterCode:'SYNTHETIC_EINVOICE',exportJobId:'54545454-5454-4454-8454-545454545454',exportQueuedAtUtc:'2026-11-04T10:00:00Z',items:[{itemId:'55555555-5555-4555-8555-555555555556',accrualId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',netAmount:'120.00000000',taxAmount:'20.00000000',grossAmount:'140.00000000',status:'ACTIVE'}],externalInvoice:{invoiceId:'56565656-5656-4656-8656-565656565656',externalSystem:'SYNTHETIC_EINVOICE',externalInvoiceId:'EXT-001',invoiceNumber:'OTOTR-2026-000001',invoiceDate:'2026-11-05',status:'ISSUED',netAmount:'120.00000000',taxAmount:'20.00000000',grossAmount:'140.00000000',currency:'TRY'},version:2,createdAtUtc:'2026-11-04T09:00:00Z',correlationId:'57575757-5757-4757-8757-575757575757'};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listIntegrationErrors'){
      const data={items:[{errorId:'58585858-5858-4858-8858-585858585858',sourceSystem:'ERP',errorClass:'OUTBOX',safeErrorCode:'ERP_TIMEOUT',status:'RETRYABLE',ownerUserId:null,retryCount:2,occurredAtUtc:'2026-11-06T09:00:00Z',correlationId:'59595959-5959-4959-8959-595959595959',version:1}],nextCursor:null,hasMore:false};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getIntegrationError'){
      const actions=commands.filter(item=>['assignIntegrationError','resolveIntegrationError'].includes(item.operationId)),resolved=actions.some(item=>item.operationId==='resolveIntegrationError');const data={errorId:body.pathParams.errorId,sourceSystem:'ERP',errorClass:'OUTBOX',safeErrorCode:'ERP_TIMEOUT',status:resolved?'RESOLVED':'RETRYABLE',retryable:!resolved,retryCount:2,safeDetail:{sourceSystem:'ERP',retryable:!resolved,safeMessage:'ERP yanıt vermedi',...(actions.length?{ownerRole:'ERP_INTEGRATION',actionPolicyVersion:'INTEGRATION_ERROR_ACTION_V1'}:{})},occurredAtUtc:'2026-11-06T09:00:00Z',correlationId:'59595959-5959-4959-8959-595959595959',trace:[{direction:'INBOX',messageId:'60606060-6060-4060-8060-606060606060',system:'ERP',eventType:'MESSAGE',status:'REJECTED',schemaVersion:2,occurredAtUtc:'2026-11-06T08:59:00Z'},{direction:'OUTBOX',messageId:'61616161-6161-4161-8161-616161616161',system:'finance.erp',eventType:'ERP_SYNC_FAILED',status:'DEAD_LETTER',attemptCount:3,safeErrorCode:'ERP_TIMEOUT',occurredAtUtc:'2026-11-06T09:00:00Z'}],version:1+actions.length};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listApprovalWorkItems'){
      const data={items:[{requestId:'62626262-6262-4262-8262-626262626262',subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',policyVersion:'EXPENSE_APPROVAL_V1',status:'PENDING',preparedBy:'64646464-6464-4464-8464-646464646464',createdAtUtc:'2026-11-06T10:00:00Z',correlationId:'65656565-6565-4565-8565-656565656565',version:1,riskLevel:'HIGH',amount:'120000.00000000',currency:'TRY',evidenceCount:1,action:{screenId:'SCR-10',operationId:'approveExpense',available:true},rawSnapshotExposed:false,rawEvidenceReferenceExposed:false}],nextCursor:null,hasMore:false,ordering:'PENDING_RISK_THEN_AGE',rawSnapshotExposed:false,rawEvidenceReferenceExposed:false};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getApprovalWorkItem'){
      const data={requestId:body.pathParams.requestId,subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',policyVersion:'EXPENSE_APPROVAL_V1',status:'PENDING',preparedBy:'64646464-6464-4464-8464-646464646464',createdAtUtc:'2026-11-06T10:00:00Z',correlationId:'65656565-6565-4565-8565-656565656565',version:1,riskLevel:'HIGH',amount:'120000.00000000',currency:'TRY',evidenceCount:1,action:{screenId:'SCR-10',operationId:'approveExpense',available:true},rawSnapshotExposed:false,rawEvidenceReferenceExposed:false,snapshotHash:'a'.repeat(64),steps:[{stepNo:1,requiredRole:'finance-expense-approver',decision:null,decidedBy:null,decidedAtUtc:null}]};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listAuditEvents'){
      const data={items:[{eventId:'66666666-6666-4666-8666-666666666667',actorId:'64646464-6464-4464-8464-646464646464',actorType:'USER',actionCode:'PASS_THROUGH_EXPENSE_SUBMITTED',subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',decision:'ALLOW',reasonCode:'SUBMIT',createdAtUtc:'2026-11-06T10:01:00Z',correlationId:'65656565-6565-4565-8565-656565656565',integrityHash:'b'.repeat(64),previousIntegrityHash:'a'.repeat(64)}],nextCursor:null,hasMore:false};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='exportAuditEvents'){
      const item={eventId:'66666666-6666-4666-8666-666666666667',createdAtUtc:'2026-11-06T10:01:00Z',actorId:'64646464-6464-4464-8464-646464646464',actorType:'USER',actionCode:'PASS_THROUGH_EXPENSE_SUBMITTED',subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',decision:'=CMD',reasonCode:'SUBMIT',correlationId:'65656565-6565-4565-8565-656565656565',integrityHash:'b'.repeat(64),previousIntegrityHash:'a'.repeat(64)};const data={schemaVersion:1,documentType:'OTOTR_FINANCE_AUDIT_EXPORT',generatedAtUtc:'2026-11-06T10:02:00Z',scope,filters:{fromUtc:null,toExclusiveUtc:null,actionCode:null,subjectType:null},rowCount:1,totalMatchingCount:1,truncated:false,hashAlgorithm:'SHA-256',rawContextExposed:false,items:[item]};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getAuditCorrelationTrace'){
      const data={correlationId:body.pathParams.correlationId,eventCount:1,chainProjection:'SHA256_V2_VERIFIED',chainVerification:{version:'AUDIT_SHA256_V2',checkedEventCount:1,invalidEventCount:0,legacyEventCount:0,valid:true},rawContextExposed:false,items:[{eventId:'66666666-6666-4666-8666-666666666667',actorId:'64646464-6464-4464-8464-646464646464',actorType:'USER',actionCode:'PASS_THROUGH_EXPENSE_SUBMITTED',subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',decision:'ALLOW',reasonCode:'SUBMIT',createdAtUtc:'2026-11-06T10:01:00Z',integrityHash:'b'.repeat(64),previousIntegrityHash:'a'.repeat(64)}]};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if (body.operationId === 'getPayment') {
      const paymentId = body.pathParams.paymentId;
      const data = {
        payment:{paymentId,status:'PARTIALLY_ALLOCATED',paymentDate:'2026-11-03',amount:{amount:'200.00000000',currency:'TRY'},paymentMethodCode:'BANK_TRANSFER',externalReference:'BANK-2026-001',documents:[{documentId:'69696969-6969-4969-8969-696969696969',documentType:'PAYMENT_EVIDENCE',contentHash:'c'.repeat(64),purposeCode:'PAYMENT_EVIDENCE'}]},
        allocations:[{allocationId:'66666666-6666-4666-8666-666666666666',openItemId:'77777777-7777-4777-8777-777777777777',amount:{amount:'80.00000000',currency:'TRY'},status:'ACTIVE',allocationVersion:1,openItemVersion:2}],
        allocatableOpenItems:[{openItemId:'77777777-7777-4777-8777-777777777778',version:3,dueDate:'2026-11-15',status:'OPEN',feeCode:'ROYALTY',feeName:'Royalty',originalAmount:{amount:'140.00000000',currency:'TRY'},openAmount:{amount:'140.00000000',currency:'TRY'}}],
        unallocatedAmount:{amount:'120.00000000',currency:'TRY'},version:3,
      };
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});
      return;
    }
    if (body.operationId === 'getAccrualDetail') {
      const accrualId = body.pathParams.accrualId;
      const data = {
        accrualId,sourceEventId:'88888888-8888-4888-8888-888888888888',contractVersionId:'85858585-8585-4585-8585-858585858585',feeRuleId:'99999999-9999-4999-8999-999999999999',status:'POSTED',
        calculation:{status:'CALCULATED',amounts:{netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'}},
        calculationTrace:{fee:{code:'ROYALTY',name:'Royalty',family:'ROYALTY'},basis:{definition:{type:'COLLECTED_GROSS'},amount:'1200.00000000',currency:'TRY'},calculation:{method:'PERCENTAGE',parameters:{rate:'0.10'}},tax:{rate:'0.20000000',priceIncludesTax:true,versionId:'77777777-7777-4777-8777-777777777777'},rounding:{mode:'HALF_UP',decimalScale:2,currency:'TRY'},amounts:{netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'},period:{periodId:'66666666-6666-4666-8666-666666666666',status:'OPEN',businessDate:'2026-11-03'},provenance:{calculationRunId:'55555555-5555-4555-8555-555555555551',runType:'LIVE',calculationStatus:'POSTED',inputHash:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',resultHash:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',snapshotHash:'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'},dispute:{eligible:true,maximumAmount:'75.00000000',currency:'TRY',openItemStatus:'OPEN'},rawInputExposed:false},
        journalEntry:{journalEntryId:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',entryNumber:'JE-TEST-001',postingDate:'2026-11-03',currency:'TRY',source:{sourceType:'customer-payment.settled'},trace:{correlationId:'30303030-3030-4030-8030-303030303030'},lines:[
          {accountCode:'120.01',direction:'DEBIT',amount:'120.00000000',description:'Bayi alacağı'},
          {accountCode:'600.01',direction:'CREDIT',amount:'100.00000000',description:'Royalty geliri'},
          {accountCode:'391.01',direction:'CREDIT',amount:'20.00000000',description:'Hesaplanan KDV'}
        ]}
      };
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});
      return;
    }
    if (body.operationId === 'getRoyaltyRefundTrace') {
      const reversalAccrualId=body.pathParams.reversalAccrualId;
      const data={
        refundEvent:{refundId:'12121212-1212-4212-8212-121212121212',refundedGrossAmount:'590.00000000',currency:'TRY'},
        originalCollection:{collectionId:'13131313-1313-4313-8313-131313131313',collectedGrossAmount:'1180.00000000',currency:'TRY'},
        originalRoyaltyAccrual:{accrualId:'14141414-1414-4414-8414-141414141414',grossAmount:'118.00000000',currency:'TRY'},
        reversalAccrual:{accrualId:reversalAccrualId,grossAmount:'59.00000000',currency:'TRY',status:'POSTED'},
        creditOpenItem:{openItemId:'15151515-1515-4515-8515-151515151515',itemType:'CREDIT',originalAmount:'59.00000000',openAmount:'59.00000000',currency:'TRY'},
        periodProvenance:{originalPeriodId:'16161616-1616-4616-8616-161616161616',postingPeriodId:'17171717-1717-4717-8717-171717171717',refundBusinessDate:'2026-11-03'}
      };
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})}); return;
    }
    if(body.operationId==='listAccruals'){
      const row={...item('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ROYALTY','120.00000000','20.00000000','100.00000000'),feeFamily:'ROYALTY',accrualStatus:'POSTED',financePeriod:{periodId:'18181818-1818-4818-8818-181818181818',status:'LOCKED',periodStart:'2026-11-01',periodEnd:'2026-11-30'}};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{items:[row],nextCursor:null,hasMore:false,filtersApplied:{feeFamily:body.query.feeFamily||null,periodStatus:body.query.periodStatus||null}}})});return;
    }
    if (body.query.status === 'DISPUTED') {
      await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{code:'READ_MODEL_UNAVAILABLE',message:'Ekstre projectionı geçici olarak kullanılamıyor.'}})});
      return;
    }
    const secondPage = body.query.cursor === 'page-2';
    const filtered = body.query.status === 'OPEN';
    const data = secondPage
      ? {items:[item('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','ROYALTY','59.00000000','0','59.00000000','OPEN','REVERSAL')],nextCursor:null,hasMore:false}
      : body.query.status === 'REVERSED'
        ? {items:[],nextCursor:null,hasMore:false}
      : filtered
        ? {items:[item('cccccccc-cccc-4ccc-8ccc-cccccccccccc','ROYALTY','118.00000000','0','118.00000000')],nextCursor:null,hasMore:false}
        : {items:[item('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ENTRY_FRANCHISE','1200.00000000','200.00000000','1000.00000000')],nextCursor:'page-2',hasMore:true};
    await route.fulfill({status:200,contentType:'application/json',headers:{'correlation-id':'44444444-4444-4444-8444-444444444444'},body:JSON.stringify({data})});
  });
  await page.route('**/functions/v1/finance-command',async route=>{const body=route.request().postDataJSON();commands.push(body);const data=body.operationId==='registerPaymentEvidence'?{outcome:'CREATED',documentId:'68686868-6868-4868-8868-686868686868',externalDocumentId:body.command.externalDocumentId,documentType:body.command.documentType}:body.operationId==='createPayment'?{outcome:'CREATED',paymentId:'67676767-6767-4767-8767-676767676767',status:'PENDING_VERIFICATION',version:1}:body.operationId==='verifyPayment'?{outcome:'CREATED',paymentId:body.command.paymentId,status:'VERIFIED',version:body.command.expectedVersion+1}:body.operationId==='allocatePayment'?{outcome:'CREATED',paymentId:body.command.paymentId,paymentVersion:body.command.expectedPaymentVersion+1,unallocatedAmount:'70.00000000'}:body.operationId==='reversePaymentAllocation'?{outcome:'CREATED',originalAllocationId:body.command.allocationId,status:'REVERSED',paymentVersion:body.command.expectedPaymentVersion+1}:body.operationId==='createDispute'?{outcome:'CREATED',disputeId:'78787878-7878-4878-8878-787878787878',status:'DRAFT',version:1}:body.operationId==='requestDisputeEvidence'?{outcome:'CREATED',requestId:'82828282-8282-4282-8282-828282828282',requestNo:'EVR-20261103-001',status:'OPEN',version:1}:body.operationId==='finalizeDisputeEvidence'?{outcome:'FULFILLED',requestId:body.command.requestId,status:'FULFILLED',version:2,documentId:'83838383-8383-4383-8383-838383838383'}:body.operationId==='decideDispute'?{outcome:'COMMITTED',disputeId:body.command.disputeId,status:body.command.decision,version:body.command.expectedVersion+1,correctionResourceIds:['81818181-8181-4181-8181-818181818181']}:body.operationId==='updateContractFeeRule'?{outcome:'UPDATED',resource:{feeRuleId:body.command.feeRuleId,version:2}}:{outcome:body.operationId==='submitContractVersion'?'SUBMITTED':body.operationId==='approveContractVersion'?'APPROVED':'CREATED',versionId:body.command.contractVersionId,version:body.command.expectedVersion+1,status:body.operationId==='approveContractVersion'?'APPROVED':'ACTIVE'};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{...data,correlationId:'77777777-7777-4777-8777-777777777777'}})});});
  await page.route('**/rest/v1/rpc/list_dispute_evidence_requests',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({items:[{requestId:'82828282-8282-4282-8282-828282828282',requestNo:'EVR-20261103-001',requestType:'INVOICE',status:'OPEN',version:1,createdAtUtc:'2026-11-03T09:00:00Z'}]})}));
  await page.route('**/rest/v1/rpc/get_dispute_sla_state',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({configured:true,policyCode:'DISPUTE_REVIEW',policyVersion:1,clockType:'CALENDAR_MINUTES',ownerRole:'FINANCE',ownerUserId:null,status:'OPEN',responseDueAtUtc:'2026-11-03T10:00:00Z',resolutionDueAtUtc:'2026-11-03T13:00:00Z',firstResponseAtUtc:null,completedAtUtc:null,responseBreached:false,resolutionBreached:false,version:1})}));
  await page.route('**/functions/v1/finance-command',async route=>{const body=route.request().postDataJSON();if(body.operationId!=='registerExpenseEvidence'){await route.fallback();return;}commands.push(body);await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{outcome:'CREATED',documentId:'70707070-7070-4070-8070-707070707070',externalDocumentId:body.command.externalDocumentId,documentType:'SUPPLIER_INVOICE',correlationId:'77777777-7777-4777-8777-777777777777'}})});});
  await page.route('**/functions/v1/finance-command',async route=>{const body=route.request().postDataJSON();if(!['createBillingBatch','queueBillingExport','createAccountingBatch','queueAccountingExport'].includes(body.operationId)){await route.fallback();return;}commands.push(body);const data=body.operationId==='createBillingBatch'?{outcome:'CREATED',batchId:'51515151-5151-4151-8151-515151515151',status:'READY',version:1}:body.operationId==='createAccountingBatch'?{outcome:'CREATED',batchId:'53535353-5353-4353-8353-535353535353',status:'READY',debitTotal:'140.00000000',creditTotal:'140.00000000',version:1}:{outcome:'QUEUED',batchId:body.command.batchId,jobId:'54545454-5454-4454-8454-545454545454',status:'QUEUED',version:2};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{...data,correlationId:'77777777-7777-4777-8777-777777777777'}})});});
  await page.route('**/functions/v1/finance-command',async route=>{const body=route.request().postDataJSON();if(!['requestServiceUsageException','approveServiceUsageException'].includes(body.operationId)){await route.fallback();return;}commands.push(body);const data=body.operationId==='requestServiceUsageException'?{outcome:'SUBMITTED',exceptionId:'89898989-8989-4989-8989-898989898989',approvalRequestId:'90909090-9090-4090-8090-909090909090',status:'PENDING_APPROVAL'}:{outcome:'APPROVED',exceptionId:'89898989-8989-4989-8989-898989898989',approvalRequestId:body.command.requestId,status:'ACTIVE',version:2};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{...data,correlationId:'77777777-7777-4777-8777-777777777777'}})});});
  await page.route('**/functions/v1/finance-command',async route=>{const body=route.request().postDataJSON();if(!['assignIntegrationError','resolveIntegrationError'].includes(body.operationId)){await route.fallback();return;}commands.push(body);const data=body.operationId==='assignIntegrationError'?{outcome:'ASSIGNED',errorId:body.command.errorId,status:'OPEN',version:body.command.expectedVersion+1,ownerRole:body.command.ownerRole,policyVersion:'INTEGRATION_ERROR_ACTION_V1'}:{outcome:'RESOLVED',errorId:body.command.errorId,status:'RESOLVED',version:body.command.expectedVersion+1,resolutionCode:body.command.resolutionCode,policyVersion:'INTEGRATION_ERROR_ACTION_V1'};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{...data,correlationId:'77777777-7777-4777-8777-777777777777'}})});});
  await page.route('**/rest/v1/rpc/get_payment_evidence_locator',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({bucketId:'ototr-evidence',objectKey:`finance-payments/${scope.legalEntityId}/${scope.dealerAccountId}/${scope.branchId}/69696969-6969-4969-8969-696969696969.pdf`,documentType:'PAYMENT_EVIDENCE',contentHash:'c'.repeat(64),expiresIn:120})}));
  await page.route('**/rest/v1/rpc/get_expense_evidence_locator',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({bucketId:'ototr-evidence',objectKey:`finance-expenses/${scope.legalEntityId}/${scope.dealerAccountId}/${scope.branchId}/33333333-3333-4333-8333-333333333334.pdf`,documentType:'SUPPLIER_INVOICE',contentHash:'d'.repeat(64),expiresIn:120})}));
  await page.route('**/rest/v1/rpc/get_contract_version_evidence_locator',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({bucketId:'ototr-evidence',objectKey:`finance-contracts/${scope.legalEntityId}/${scope.dealerAccountId}/${scope.branchId}/74747474-7474-4474-8474-747474747474.pdf`,documentType:'FRANCHISE_AGREEMENT',contentHash:'e'.repeat(64),expiresIn:120,rawStorageKeyExposed:false})}));
  await page.route('**/rest/v1/rpc/preview_expense_share_calculation',async route=>{const body=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({expenseId:body.p_expense_id,method:body.p_distribution_method,ruleReference:body.p_distribution_rule_reference,currency:'TRY',controlGross:'1200.00000000',targetCount:body.p_target_basis.length,items:body.p_target_basis.map(item=>({...item,allocationRate:'1.00000000',netAmount:'1000.00000000',taxAmount:'200.00000000',grossAmount:'1200.00000000'})),writePerformed:false})});});
  await page.route('**/storage/v1/object/sign/ototr-evidence/**',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({signedURL:'/object/sign/ototr-evidence/private-payment.pdf?token=test'})}));
  await page.route('**/storage/v1/object/ototr-evidence/**',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({Key:'private-object'})}));

  await page.goto(`${origin}/index.html`, {waitUntil:'networkidle'});
  await page.click('#navFinance');
  await page.click('[data-finance-connect]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-state]')?.textContent.includes('READY'));
  await page.waitForFunction(()=>document.querySelector('[data-finance-headquarters]')?.dataset.state==='READY');
  assert.match(await page.locator('[data-finance-headquarters-counts]').innerText(),/2/);
  assert.match(await page.locator('[data-finance-headquarters-families]').innerText(),/ROYALTY/);
  assert.match(await page.locator('[data-finance-headquarters-ranking]').innerText(),/BAYI-A/);
  assert.match(await page.locator('[data-finance-kpi="accrued"]').innerText(),/480,00000000 TRY/);
  await page.fill('[data-finance-headquarters-as-of]','2026-11-03');await page.selectOption('[data-finance-headquarters-currency]','TRY');await page.click('[data-finance-headquarters-refresh]');await page.waitForFunction(()=>document.querySelector('[data-finance-headquarters]')?.dataset.state==='READY');assert.equal(requests.at(-1).operationId,'getHeadquartersFinanceSummary');assert.equal(requests.at(-1).query.asOf,'2026-11-03');assert.equal(requests.at(-1).query.currency,'TRY');const headquartersDownloadPromise=page.waitForEvent('download');await page.click('[data-finance-headquarters-export]');const headquartersDownload=await headquartersDownloadPromise;assert.equal(headquartersDownload.suggestedFilename(),'ototr-gm-finans-2026-11-03-TRY.csv');const headquartersStream=await headquartersDownload.createReadStream();let headquartersCsv='';for await(const chunk of headquartersStream)headquartersCsv+=chunk.toString('utf8');assert.match(headquartersCsv,/ROYALTY/);assert.match(headquartersCsv,/"'=FORMULA"/);assert.doesNotMatch(headquartersCsv,/rawRecords|secret|payload/i);assert.equal(requests.at(-1).operationId,'exportHeadquartersFinanceSummary');
  await page.click('[data-finance-screen="SCR-02"]');
  assert.match(await page.locator('[data-finance-kpi="accrued"]').innerText(),/120,00000000 TRY/);
  await page.click('[data-finance-screen="SCR-01"]');
  assert.match(await page.locator('[data-finance-kpi="accrued"]').innerText(),/480,00000000 TRY/);
  await page.waitForFunction(()=>document.querySelector('[data-finance-period-state]')?.textContent.includes('READY'));
  await page.click('[data-finance-screen="SCR-12"]');
  assert.equal(await page.locator('[data-finance-period-detail]').isVisible(),true);
  assert.match(await page.locator('[data-finance-period-detail]').innerText(),/LOCKED/);
  assert.match(await page.locator('[data-finance-period-detail]').innerText(),/v3/);
  assert.match(await page.locator('[data-finance-period-detail]').innerText(),/aaaaaaaaaaaa/);
  assert.equal(await page.locator('[data-finance-period-command]').isVisible(),true);
  assert.deepEqual(await page.locator('[data-finance-period-command] select[name="operation"] option').allTextContents(),['Kapanış onayı iste','Kapanışı bağımsız onayla','Onaylı dönemi kilitle','Yeniden açma onayı iste','Yeniden açmayı bağımsız onayla']);
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-period-reconciliations-body] tr').length===1);
  assert.match(await page.locator('[data-finance-period-reconciliations]').innerText(),/ACCRUAL_TO_LEDGER/);assert.match(await page.locator('[data-finance-period-close-readiness]').innerText(),/HAZIR/);assert.equal(await page.locator('[data-finance-period-command] input[name="checkSnapshotHash"]').inputValue(),'b'.repeat(64));
  await page.click('[data-finance-screen="SCR-03"]');
  assert.equal(await page.locator('[data-finance-contract-workspace]').isVisible(),true);
  await page.click('[data-finance-contract-refresh]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-contract-workspace]')?.dataset.state==='READY');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-contract-rules-body] tr').length===2);
  assert.match(await page.locator('[data-finance-contract-content]').innerText(),/OTOTR-FR-2026-001/);
  assert.match(await page.locator('[data-finance-contract-content]').innerText(),/v3/);
  await page.waitForFunction(()=>document.querySelector('[data-finance-contract-comparison-content]')?.hidden===false);
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-contract-timeline-body] tr').length===2);
  assert.match(await page.locator('[data-finance-contract-timeline-body]').innerText(),/v4 · TRY/);
  assert.match(await page.locator('[data-finance-contract-timeline-body]').innerText(),/PENDING_APPROVAL/);
  assert.match(await page.locator('[data-finance-contract-timeline-body]').innerText(),/2\/2 yapılandırılmış · 1 istisna/);
  assert.doesNotMatch(await page.locator('[data-finance-contract-timeline-body]').innerText(),/evidence_object_key|synthetic\/candidate/i);
  assert.match(await page.locator('[data-finance-contract-timeline-body]').innerText(),/FRANCHISE_AGREEMENT indir/);await page.click('[data-finance-contract-evidence]');await page.waitForFunction(()=>window.__openedFinanceDocuments.length===1);assert.match((await page.evaluate(()=>window.__openedFinanceDocuments[0])),/\/storage\/v1\/object\/sign\/ototr-evidence\/private-payment\.pdf/);
  assert.match(await page.locator('[data-finance-contract-comparison]').innerText(),/v3 → v4/);
  assert.match(await page.locator('[data-finance-contract-comparison]').innerText(),/ROYALTY · Royalty Bedeli/);
  assert.doesNotMatch(await page.locator('[data-finance-contract-comparison]').innerText(),/must-not-leak|calculationParameters|basis_definition/i);
  await page.click('[data-finance-contract-impact-form] button[type="submit"]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-contract-impact-result]')?.hidden===false);
  assert.equal(requests.at(-1).operationId,'simulateContractVersionImpact');
  assert.match(await page.locator('[data-finance-contract-impact-result]').innerText(),/100\.00 TRY/);
  assert.match(await page.locator('[data-finance-contract-impact-result]').innerText(),/120\.00 TRY/);
  assert.match(await page.locator('[data-finance-contract-impact-state]').innerText(),/KAYIT OLUŞTURULMADI/);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/ROYALTY/);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/PERCENTAGE/);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/Evet/);
  assert.equal(requests.some(request=>request.operationId==='listContractFeeRules'),true);
  await page.click('[data-finance-contract-rule-id="23232323-2323-4323-8323-232323232323"]');
  await page.waitForFunction(()=>window.OTOTRFinance&&document.querySelector('[data-finance-contract-rule-detail-content]')?.hidden===false);
  assert.equal(requests.at(-1).operationId,'getContractFeeRule');
  assert.equal(await page.locator('[data-finance-contract-rule-detail]').isVisible(),true);
  assert.match(await page.locator('[data-finance-contract-rule-detail]').innerText(),/ROYALTY · ROYALTY Bedeli/);
  assert.match(await page.locator('[data-finance-contract-rule-detail]').innerText(),/payment\.settled/);
  assert.match(await page.locator('[data-finance-contract-rule-detail]').innerText(),/COLLECTED_GROSS/);
  assert.match(await page.locator('[data-finance-contract-rule-detail]').innerText(),/KDV dahil matrah/);
  assert.match(await page.locator('[data-finance-contract-rule-detail]').innerText(),/PERCENTAGE · 0\.10/);
  assert.match(await page.locator('[data-finance-contract-rule-exceptions]').innerText(),/FIRST_MONTH_EXEMPTION/);
  assert.match(await page.locator('[data-finance-contract-rule-exceptions]').innerText(),/BRANCH \/ CONTRACT_AGE/);
  assert.match(await page.locator('[data-finance-contract-rule-exceptions]').innerText(),/RATE_OVERRIDE/);
  assert.doesNotMatch(await page.locator('[data-finance-contract-rule-detail]').innerText(),/must-not-leak|scope_definition|override_definition/i);
  await page.waitForFunction(()=>document.querySelector('[data-finance-contract-rule-edit]')?.hidden===false);
  await page.fill('[data-finance-contract-rule-edit] [name="code"]','ROYALTY_UPDATED');
  page.once('dialog',dialog=>dialog.accept());
  await page.click('[data-finance-contract-rule-edit-submit]');
  await page.waitForTimeout(100);
  assert.equal(commands.length,1);assert.equal(commands[0].operationId,'updateContractFeeRule');assert.equal(commands[0].command.rule.code,'ROYALTY_UPDATED');assert.deepEqual(commands[0].command.rule.exceptions,[]);assert.equal(commands[0].command.rule.tax.priceIncludesTax,true);assert.equal(commands[0].command.contractVersionId,'22222222-2222-4222-8222-222222222223');
  assert.equal(await page.locator('[data-finance-contract-lifecycle]').isVisible(),true);assert.match(await page.locator('[data-finance-contract-lifecycle-title]').innerText(),/Onayla/);
  await page.fill('[data-finance-contract-lifecycle] [name="note"]','Bağımsız finans kontrolü tamamlandı.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-contract-lifecycle-submit]');await page.waitForTimeout(100);assert.equal(commands.length,2);assert.equal(commands[1].operationId,'approveContractVersion');assert.equal(commands[1].command.contractVersionId,'22222222-2222-4222-8222-222222222223');assert.equal(commands[1].command.expectedVersion,1);assert.match(commands[1].command.note,/Bağımsız finans/);
  await page.click('[data-finance-contract-rule-detail-close]');
  assert.equal(await page.locator('[data-finance-contract-rule-detail]').isVisible(),false);
  await page.click('[data-finance-contract-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-contract-rules-body] tr').length===3);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/QUERY/);
  await page.click('[data-finance-screen="SCR-04"]');
  assert.equal(await page.locator('[data-finance-contract-workspace]').isVisible(),true);
  assert.match(await page.locator('[data-finance-contract-title]').innerText(),/Bedel Kataloğu/);
  await page.click('[data-finance-screen="SCR-05"]');
  assert.equal(await page.locator('[data-finance-statement]').isVisible(),true);
  assert.equal(await page.locator('[data-finance-statement-title]').innerText(),'Tahakkuklar');
  await page.fill('[data-finance-statement-from]','2026-11-01');
  await page.fill('[data-finance-statement-to]','2026-11-30');
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-statement-body] tr').length===1);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(),/ROYALTY/);
  await page.click('[data-finance-screen="SCR-05"]');await page.selectOption('[data-finance-accrual-family]','ROYALTY');await page.selectOption('[data-finance-accrual-period-status]','LOCKED');await page.click('[data-finance-statement-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-statement-body] tr').length===1);assert.equal(requests.at(-1).operationId,'listAccruals');assert.equal(requests.at(-1).query.feeFamily,'ROYALTY');assert.equal(requests.at(-1).query.periodStatus,'LOCKED');assert.match(await page.locator('[data-finance-statement-body]').innerText(),/Dönem: LOCKED/);
  await page.click('[data-finance-reversal-target-id]');assert.equal(await page.locator('[data-finance-dispute-create]').isVisible(),true);assert.equal(await page.locator('[data-finance-dispute-create] [name="reasonCode"]').inputValue(),'ACCRUAL_REVERSAL_REQUEST');assert.match(await page.locator('[data-finance-dispute-create-state]').innerText(),/maker-checker ters kayıt talebi/);page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-dispute-create-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-create]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'createDispute');assert.equal(commands.at(-1).command.reasonCode,'ACCRUAL_REVERSAL_REQUEST');await page.click('[data-finance-dispute-create-cancel]');await page.click('[data-finance-screen="SCR-05"]');await page.click('[data-finance-statement-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-statement-body] tr').length===1);
  const accrualExportPromise=page.waitForEvent('download');await page.click('[data-finance-statement-export]');const accrualExport=await accrualExportPromise;assert.match(accrualExport.suggestedFilename(),/ototr-bayi-ekstresi/);assert.equal(requests.at(-1).operationId,'exportAccruals');assert.equal(requests.at(-1).query.feeFamily,'ROYALTY');assert.equal(requests.at(-1).query.periodStatus,'LOCKED');
  await page.click('[data-finance-screen="SCR-07"]');
  assert.equal(await page.locator('[data-finance-statement-title]').innerText(),'Bayi Ekstresi');
  await assert.doesNotReject(() => page.waitForSelector('[data-finance-statement]:not([hidden])'));
  assert.equal(await page.locator('[data-finance-statement-refresh]').isEnabled(), true);
  assert.equal(await page.locator('[data-finance-statement-body] tr').count(), 0);

  await page.click('[data-finance-statement-refresh]');
  assert.equal(await page.locator('[data-finance-statement]').getAttribute('data-state'), 'LOADING');
  await page.waitForFunction(() => document.querySelectorAll('[data-finance-statement-body] tr').length === 1);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(), /ENTRY_FRANCHISE/);
  await page.click('[data-finance-dispute-target-id]');await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-create]')?.hidden===false);assert.equal(await page.locator('[data-finance-screen="SCR-11"]').getAttribute('aria-current'),'page');await page.fill('[data-finance-dispute-create] [name="disputedAmount"]','250.00');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-dispute-create-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-create]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'createDispute');assert.equal(commands.at(-1).command.targetRecordId,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');assert.equal(commands.at(-1).command.disputedAmount,'250.00');assert.equal(commands.at(-1).command.currencyCode,'TRY');assert.deepEqual(commands.at(-1).command.documentIds,[]);await page.click('[data-finance-screen="SCR-07"]');
  assert.equal(requests.at(-1).query.from,'2026-11-01');
  assert.equal(requests.at(-1).query.to,'2026-11-30');
  assert.equal(await page.locator('[data-finance-statement-more]').isVisible(), true);
  await page.click('[data-finance-payment-id]');
  assert.equal(await page.locator('[data-finance-screen-code]').first().innerText(),'SCR-08');
  assert.equal(await page.locator('[data-finance-payments]').isVisible(),true);
  await page.waitForFunction(() => document.querySelector('[data-finance-payment-detail]')?.dataset.state === 'READY');
  assert.match(await page.locator('[data-finance-payment-detail]').innerText(), /200,00000000 TRY/);
  assert.match(await page.locator('[data-finance-payment-detail]').innerText(), /120,00000000 TRY/);
  assert.match(await page.locator('[data-finance-payment-allocations]').innerText(), /80,00000000 TRY/);
  assert.match(await page.locator('[data-finance-payment-documents]').innerText(),/PAYMENT_EVIDENCE/);await page.click('[data-finance-payment-document]');await page.waitForFunction(()=>window.__openedFinanceDocuments.length===2);assert.match((await page.evaluate(()=>window.__openedFinanceDocuments[1])),/\/storage\/v1\/object\/sign\/ototr-evidence\/private-payment\.pdf/);
  assert.equal(requests.at(-1).operationId, 'getPayment');
  await page.fill('[data-finance-payment-create] [name="amount"]','100.00');await page.fill('[data-finance-payment-create] [name="externalReference"]','BANK-NEW-001');await page.setInputFiles('[data-finance-payment-create] [name="evidenceFile"]',{name:'odeme.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 payment evidence')});page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-payment-create-button]');await page.waitForFunction(()=>document.querySelector('[data-finance-payment-create]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'createPayment');assert.equal(commands.at(-1).command.amount,'100.00');assert.equal(commands.at(-1).command.currencyCode,'TRY');assert.equal(commands.at(-2).operationId,'registerPaymentEvidence');assert.equal(commands.at(-2).command.documentType,'PAYMENT_EVIDENCE');assert.match(commands.at(-2).command.contentHash,/^[a-f0-9]{64}$/);assert.equal(commands.at(-1).command.documentIds[0],commands.at(-2).command.externalDocumentId);
  await page.waitForFunction(()=>document.querySelector('[data-finance-payment-allocate]')?.hidden===false);await page.fill('[data-finance-payment-allocate] [name="amount"]','50.00');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-payment-allocate-button]');await page.waitForFunction(()=>document.querySelector('[data-finance-payment-allocate]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'allocatePayment');assert.equal(commands.at(-1).command.expectedPaymentVersion,3);assert.equal(commands.at(-1).command.items[0].expectedOpenItemVersion,3);
  await page.waitForFunction(()=>document.querySelector('[data-finance-payment-reverse]')?.hidden===false);await page.fill('[data-finance-payment-reverse] [name="note"]','Yanlış açık kalem seçildi.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-payment-reverse-button]');await page.waitForFunction(()=>document.querySelector('[data-finance-payment-reverse]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'reversePaymentAllocation');assert.equal(commands.at(-1).command.expectedAllocationVersion,1);assert.equal(commands.at(-1).command.expectedOpenItemVersion,2);
  await page.waitForFunction(()=>document.querySelector('[data-finance-payment-detail]')?.dataset.state==='READY');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-payment-rendered',{detail:{payment:{paymentId:'67676767-6767-4767-8767-676767676767',status:'PENDING_VERIFICATION',amount:{amount:'100.00000000',currency:'TRY'}},allocations:[],allocatableOpenItems:[],unallocatedAmount:{amount:'0.00000000',currency:'TRY'},version:1}})));await page.waitForFunction(()=>document.querySelector('[data-finance-payment-verify]')?.hidden===false);await page.fill('[data-finance-payment-verify] [name="note"]','Banka ekstresi doğrulandı.');await page.setInputFiles('[data-finance-payment-verify] [name="evidenceFile"]',{name:'ekstre.png',mimeType:'image/png',buffer:Buffer.from('synthetic png evidence')});page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-payment-verify-button]');await page.waitForFunction(()=>document.querySelector('[data-finance-payment-verify]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'verifyPayment');assert.equal(commands.at(-1).command.expectedVersion,1);assert.equal(commands.at(-2).operationId,'registerPaymentEvidence');assert.equal(commands.at(-2).command.documentType,'PAYMENT_VERIFICATION_EVIDENCE');assert.equal(commands.at(-1).command.documentIds[0],commands.at(-2).command.externalDocumentId);
  await page.click('[data-finance-payment-close]');
  assert.equal(await page.locator('[data-finance-payment-detail]').isVisible(),true);
  assert.equal(await page.locator('[data-finance-payment-detail]').getAttribute('data-state'),'EMPTY');
  await page.fill('[data-finance-payments-from]','2026-11-01');
  await page.fill('[data-finance-payments-to]','2026-11-30');
  await page.click('[data-finance-payments-refresh]');
  assert.equal(await page.locator('[data-finance-payments]').getAttribute('data-state'),'LOADING');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-payments-body] tr').length===1);
  assert.match(await page.locator('[data-finance-payments-body]').innerText(),/BANK-5555/);
  assert.match(await page.locator('[data-finance-payments-body]').innerText(),/120,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listPayments');
  assert.equal(requests.at(-1).query.from,'2026-11-01');
  assert.equal(requests.at(-1).query.to,'2026-11-30');
  await page.click('[data-finance-payments-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-payments-body] tr').length===2);
  assert.equal(await page.locator('[data-finance-payments-more]').isVisible(),false);
  await page.click('[data-finance-payments-body] [data-finance-payment-id]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-payment-detail]')?.dataset.state==='READY');
  assert.equal(requests.at(-1).operationId,'getPayment');
  await page.click('[data-finance-payment-close]');
  await page.selectOption('[data-finance-payments-status]','REJECTED');
  assert.equal(await page.locator('[data-finance-payments-body] tr').count(),0);
  await page.click('[data-finance-payments-refresh]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-payments]')?.dataset.state==='EMPTY');
  assert.equal(await page.locator('[data-finance-payments-table]').isVisible(),false);
  await page.click('[data-finance-screen="SCR-09"]');
  await page.fill('[data-finance-service-usages-from]','2026-11-01');
  await page.fill('[data-finance-service-usages-to]','2026-11-30');
  await page.click('[data-finance-service-usages-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-service-usages-body] tr').length===1);
  assert.match(await page.locator('[data-finance-service-usages-body]').innerText(),/QUERY-001/);
  assert.match(await page.locator('[data-finance-service-usages-body]').innerText(),/70,00000000 TRY/);
  await page.click('[data-finance-service-usages-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-service-usages-body] tr').length===2);
  assert.match(await page.locator('[data-finance-service-usages-body]').innerText(),/Ücretsiz hak/);
  assert.equal(requests.at(-1).operationId,'listServiceUsages');
  assert.equal(requests.at(-1).query.from,'2026-11-01');
  assert.equal(requests.at(-1).query.to,'2026-11-30');
  await page.click('[data-finance-service-usages-body] [data-finance-service-usage-id]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-service-usage-detail]')?.hidden===false&&document.querySelector('[data-finance-service-usage-content]')?.hidden===false);
  assert.equal(requests.at(-1).operationId,'getServiceUsageDetail');
  const usageDetailText=await page.locator('[data-finance-service-usage-detail]').innerText();assert.match(usageDetailText,/PROVIDER_TIMEOUT/);assert.match(usageDetailText,/dddddddddddddddd/);assert.doesNotMatch(usageDetailText,/payload|secret/i);
  await page.click('[data-finance-service-usage-close]');
  const usageDownloadPromise=page.waitForEvent('download');await page.click('[data-finance-service-usages-export]');const usageDownload=await usageDownloadPromise;assert.match(usageDownload.suggestedFilename(),/^ototr-hizmet-kullanimlari-.*\.csv$/);const usageStream=await usageDownload.createReadStream();let usageCsv='';for await(const chunk of usageStream)usageCsv+=chunk.toString('utf8');assert.match(usageCsv,/TRAMER_QUERY/);assert.match(usageCsv,/"'=QUERY-001"/);assert.doesNotMatch(usageCsv,/rawPayloadExposed|"payload"|secret/i);assert.equal(requests.at(-1).operationId,'exportServiceUsages');assert.equal(requests.at(-1).query.limit,10000);
  await page.click('[data-finance-service-usages-body] [data-finance-service-usage-id] >> nth=1');await page.waitForFunction(()=>document.querySelector('[data-finance-service-usage-charge]')?.textContent?.includes('NOT_CHARGED'));assert.equal(await page.locator('[data-finance-service-exception] [name="feeRuleId"]').inputValue(),'99999999-9999-4999-8999-999999999999');await page.fill('[data-finance-service-exception] [name="note"]','Teknik tekrar kanıtı kontrol edildi.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-service-exception-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-service-exception]')?.dataset.outcome==='SUBMITTED');assert.equal(commands.at(-1).operationId,'requestServiceUsageException');assert.equal(commands.at(-1).command.sourceEventId,'29292929-2929-4929-8929-292929292929');assert.deepEqual(commands.at(-1).command.override,{type:'EXEMPT'});assert.match(commands.at(-1).command.evidenceHash,/^[a-f0-9]{64}$/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-approval-subject-requested',{detail:{subjectType:'SERVICE_USAGE_EXCEPTION',operationId:'approveServiceUsageException',requestId:'90909090-9090-4090-8090-909090909090',version:1,sourceEventId:'29292929-2929-4929-8929-292929292929',feeRuleId:'99999999-9999-4999-8999-999999999999'}})));await page.fill('[data-finance-service-exception] [name="note"]','Bağımsız checker kanıtı doğruladı.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-service-exception-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-service-exception]')?.dataset.outcome==='APPROVED');assert.equal(commands.at(-1).operationId,'approveServiceUsageException');assert.equal(commands.at(-1).command.requestId,'90909090-9090-4090-8090-909090909090');assert.equal(commands.at(-1).command.expectedVersion,1);
  await page.click('[data-finance-screen="SCR-10"]');
  await page.fill('[data-finance-expenses-from]','2026-11-01');
  await page.fill('[data-finance-expenses-to]','2026-11-30');
  await page.click('[data-finance-expenses-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-expenses-body] tr').length===1);
  assert.match(await page.locator('[data-finance-expenses-body]').innerText(),/SUPPLIER-001/);
  assert.match(await page.locator('[data-finance-expenses-body]').innerText(),/1\.200,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listPassThroughExpenses');
  assert.equal(requests.at(-1).query.from,'2026-11-01');
  assert.equal(requests.at(-1).query.to,'2026-11-30');
  await page.click('[data-finance-expenses-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-expenses-body] tr').length===2);
  assert.equal(await page.locator('[data-finance-expenses-more]').isVisible(),false);
  await page.click('[data-finance-expenses-body] [data-finance-expense-id]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-expense-detail]')?.dataset.state==='READY');
  assert.equal(requests.at(-1).operationId,'getPassThroughExpense');
  assert.match(await page.locator('[data-finance-expense-detail]').innerText(),/1\.200,00000000 TRY/);
  assert.match(await page.locator('[data-finance-expense-shares]').innerText(),/600,00000000 TRY/);
  assert.equal(await page.locator('[data-finance-expense-shares] tr').count(),2);
  assert.match(await page.locator('[data-finance-expense-provenance]').innerText(),/34343434-3434-4434-8434-343434343434/);
  await page.evaluate(scope=>window.dispatchEvent(new CustomEvent('ototr:finance-expense-rendered',{detail:{expenseId:'30303030-3030-4030-8030-303030303030',status:'DRAFT',version:1,allocationPolicy:{targetScopes:[{dealerAccountId:scope.dealerAccountId,branchId:scope.branchId}]},documents:[]}})),scope);await page.selectOption('[data-finance-expense-action] [name="distributionMethod"]','QUANTITY');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-expense-action-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-expense-action]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'calculateExpenseShares');assert.equal(commands.at(-1).command.distributionMethod,'QUANTITY');assert.equal(commands.at(-1).command.targetBasis[0].basisValue,'1');assert.match(await page.locator('[data-finance-expense-preview]').innerText(),/1200\.00000000 TRY/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-expense-rendered',{detail:{expenseId:'30303030-3030-4030-8030-303030303030',status:'POSTED',version:1,documents:[{externalDocumentId:'33333333-3333-4333-8333-333333333334',documentType:'SUPPLIER_INVOICE'}]}})));await page.click('[data-finance-expense-document]');await page.waitForFunction(()=>window.__openedFinanceDocuments.length===3);assert.match((await page.evaluate(()=>window.__openedFinanceDocuments[2])),/\/storage\/v1\/object\/sign\/ototr-evidence\/private-payment\.pdf/);
  await page.waitForFunction(()=>document.querySelector('[data-finance-expense-action]')?.hidden===false);
  assert.equal(await page.inputValue('[data-finance-expense-action] [name="operation"]'),'reverseExpense');
  await page.fill('[data-finance-expense-action] [name="actionDate"]','2026-11-04');await page.fill('[data-finance-expense-action] [name="note"]','Tedarikçi iadesi bağımsız olarak doğrulandı.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-expense-action-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-expense-action]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'reverseExpense');assert.equal(commands.at(-1).command.expenseId,'30303030-3030-4030-8030-303030303030');assert.equal(commands.at(-1).command.reversalDate,'2026-11-04');assert.equal(commands.at(-1).command.expectedVersion,1);
  await page.fill('[data-finance-expense-create] [name="supplierReference"]','TED-NEW-001');await page.fill('[data-finance-expense-create] [name="feeDefinitionId"]','32323232-2323-4323-8323-232323232323');await page.fill('[data-finance-expense-create] [name="expenseDate"]','2026-11-03');await page.fill('[data-finance-expense-create] [name="netAmount"]','100.00');await page.fill('[data-finance-expense-create] [name="taxAmount"]','20.00');await page.fill('[data-finance-expense-create] [name="grossAmount"]','120.00');await page.fill('[data-finance-expense-create] [name="contractualBasisReference"]','OTOTR-MASRAF-2026');await page.setInputFiles('[data-finance-expense-create] [name="evidenceFile"]',{name:'tedarikci-faturasi.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 expense evidence')});await page.waitForFunction(()=>document.querySelector('[data-finance-expense-create]')?.dataset.evidence==='READY');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-expense-create-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-expense-create]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'createPassThroughExpense');assert.equal(commands.at(-2).operationId,'registerExpenseEvidence');assert.match(commands.at(-2).command.contentHash,/^[a-f0-9]{64}$/);assert.equal(commands.at(-1).command.documentIds[0],commands.at(-2).command.externalDocumentId);assert.equal(commands.at(-1).command.grossAmount,'120.00');assert.deepEqual(commands.at(-1).command.targetScopes,[{dealerAccountId:scope.dealerAccountId,branchId:scope.branchId}]);
  await page.click('[data-finance-expense-close]');
  await page.click('[data-finance-screen="SCR-11"]');
  await page.click('[data-finance-disputes-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-disputes-body] tr').length===1);
  assert.match(await page.locator('[data-finance-disputes-body]').innerText(),/DSP-001/);
  assert.match(await page.locator('[data-finance-disputes-body]').innerText(),/100,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listDisputes');
  await page.click('[data-finance-disputes-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-disputes-body] tr').length===2);
  assert.equal(await page.locator('[data-finance-disputes-more]').isVisible(),false);
  await page.click('[data-finance-disputes-body] [data-finance-dispute-id]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-detail]')?.dataset.state==='READY');
  assert.equal(requests.at(-1).operationId,'getDispute');
  assert.match(await page.locator('[data-finance-dispute-detail]').innerText(),/70,00000000 TRY/);
  assert.match(await page.locator('[data-finance-dispute-detail]').innerText(),/APPROVED/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-dispute-rendered',{detail:{disputeId:'41414141-4141-4141-8141-414141414141',caseNo:'DSP-002',status:'SUBMITTED',version:2,amounts:{disputedAmount:'100.00000000',acceptedAmount:null,currency:'TRY'}}})));
  await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-sla]')?.textContent.includes('DISPUTE_REVIEW'));assert.match(await page.locator('[data-finance-dispute-sla]').innerText(),/Sahip: FINANCE/);
  await page.unroute('**/rest/v1/rpc/get_dispute_sla_state');
  await page.route('**/rest/v1/rpc/get_dispute_sla_state',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({configured:false,reason:'NO_PUBLISHED_POLICY'})}));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-dispute-rendered',{detail:{disputeId:'41414141-4141-4141-8141-414141414141',caseNo:'DSP-002',status:'SUBMITTED',version:2,amounts:{disputedAmount:'100.00000000',acceptedAmount:null,currency:'TRY'}}})));
  await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-sla]')?.textContent.includes('tahmini süre'));
  await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-evidence-request]')?.hidden===false);await page.fill('[data-finance-dispute-evidence-request] [name="message"]','Hizmet teslim formunu ekleyin.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-dispute-evidence-request-button]');await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-evidence-request]')?.dataset.outcome==='CREATED');assert.equal(commands.at(-1).operationId,'requestDisputeEvidence');assert.equal(commands.at(-1).command.requestType,'INVOICE');
  await page.waitForSelector('[data-finance-evidence-upload-request]');await page.click('[data-finance-evidence-upload-request]');await page.setInputFiles('[data-finance-dispute-evidence-upload] [name="file"]',{name:'kanit.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 synthetic evidence')});page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-dispute-evidence-upload-button]');await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-evidence-upload]')?.dataset.outcome==='FULFILLED');assert.equal(commands.at(-1).operationId,'finalizeDisputeEvidence');assert.equal(commands.at(-1).command.contentType,'application/pdf');assert.match(commands.at(-1).command.contentHash,/^[a-f0-9]{64}$/);
  await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-decision]')?.hidden===false);await page.selectOption('[data-finance-dispute-decision] [name="decision"]','PARTIALLY_ACCEPTED');await page.fill('[data-finance-dispute-decision] [name="acceptedAmount"]','70.00');await page.fill('[data-finance-dispute-decision] [name="note"]','Kanıt ve muhasebe etkisi bağımsız incelendi.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-dispute-decision-button]');await page.waitForFunction(()=>document.querySelector('[data-finance-dispute-decision]')?.dataset.outcome==='COMMITTED');assert.equal(commands.at(-1).operationId,'decideDispute');assert.equal(commands.at(-1).command.decision,'PARTIALLY_ACCEPTED');assert.equal(commands.at(-1).command.acceptedAmount,'70.00');
  assert.match(await page.locator('[data-finance-dispute-provenance]').innerText(),/47474747-4747-4747-8747-474747474747/);
  assert.match(await page.locator('[data-finance-dispute-sla]').innerText(),/tahmini süre veya gecikme durumu üretilmez/);
  await page.click('[data-finance-dispute-close]');
  await page.click('[data-finance-screen="SCR-13"]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-billing-create]')?.hidden===false);
  await page.fill('[data-finance-billing-create] [name="financePeriodId"]','52525252-5252-4252-8252-525252525252');
  await page.click('[data-finance-billing-create-submit]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-billing-create-state]')?.textContent.includes('Paket hazır'));
  assert.equal(commands.at(-1).operationId,'createBillingBatch');assert.equal(commands.at(-1).command.groupingProfileCode,'BRANCH_MONTHLY_V1');assert.match(commands.at(-1).command.idempotencyKey,/^billing:create:/);
  await page.waitForFunction(()=>document.querySelector('[data-finance-accounting-create]')?.hidden===false);await page.fill('[data-finance-accounting-create] [name="periodStart"]','2026-11-01');await page.fill('[data-finance-accounting-create] [name="periodEnd"]','2026-11-30');await page.fill('[data-finance-accounting-create] [name="mappingVersion"]','ERP-V1');await page.fill('[data-finance-accounting-create] [name="journalEntryIds"]','20202020-2020-4020-8020-202020202020');await page.click('[data-finance-accounting-create-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-accounting-create-state]')?.textContent.includes('Muhasebe paketi hazır'));assert.equal(commands.at(-1).operationId,'createAccountingBatch');assert.deepEqual(commands.at(-1).command.journalEntryIds,['20202020-2020-4020-8020-202020202020']);assert.match(commands.at(-1).command.idempotencyKey,/^accounting:create:/);
  await page.click('[data-finance-export-packages-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-export-packages-body] tr').length===1);
  assert.match(await page.locator('[data-finance-export-packages-body]').innerText(),/BILL-202611-001/);
  assert.match(await page.locator('[data-finance-export-packages-body]').innerText(),/140,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listFinanceExportPackages');
  await page.click('[data-finance-export-packages-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-export-packages-body] tr').length===2);
  assert.match(await page.locator('[data-finance-export-packages-body]').innerText(),/ACC-202611-001/);
  await page.click('[data-finance-export-packages-body] [data-finance-export-package-id]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-export-package-detail]')?.dataset.state==='READY');
  assert.equal(requests.at(-1).operationId,'getFinanceExportPackage');
  assert.match(await page.locator('[data-finance-export-package-detail]').innerText(),/ISSUED/);
  assert.match(await page.locator('[data-finance-export-package-detail]').innerText(),/EINVOICE-V1/);
  assert.match(await page.locator('[data-finance-export-package-provenance]').innerText(),/54545454-5454-4454-8454-545454545454/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-export-package-rendered',{detail:{packageId:'51515151-5151-4151-8151-515151515151',packageType:'BILLING',batchNo:'BILL-202611-001',status:'READY',version:1,contentHash:'a'.repeat(64)}})));
  await page.waitForFunction(()=>document.querySelector('[data-finance-billing-export]')?.hidden===false);page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-billing-export-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-billing-export-state]')?.textContent.includes('Export kuyruğa alındı'));assert.equal(commands.at(-1).operationId,'queueBillingExport');assert.equal(commands.at(-1).command.expectedVersion,1);assert.match(commands.at(-1).command.idempotencyKey,/^billing:export:/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-export-package-rendered',{detail:{packageId:'53535353-5353-4353-8353-535353535353',packageType:'ACCOUNTING',batchNo:'ACC-202611-001',status:'READY',version:1,contentHash:'b'.repeat(64),mappingVersion:'ERP-V1',totals:{debitAmount:'140.00000000',creditAmount:'140.00000000'}}})));
  await page.waitForFunction(()=>document.querySelector('[data-finance-accounting-export]')?.hidden===false);page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-accounting-export-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-accounting-export-state]')?.textContent.includes('Muhasebe export kuyruğa alındı'));assert.equal(commands.at(-1).operationId,'queueAccountingExport');assert.equal(commands.at(-1).command.mappingVersion,'ERP-V1');assert.match(commands.at(-1).command.idempotencyKey,/^accounting:export:/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('ototr:finance-export-package-rendered',{detail:{packageId:'51515151-5151-4151-8151-515151515151',packageType:'BILLING',batchNo:'BILL-REJECTED-001',status:'REJECTED',version:3,contentHash:'c'.repeat(64),mappingVersion:'EINVOICE-V1',correlationId:'59595959-5959-4959-8959-595959595959',externalInvoice:{status:'REJECTED'}}})));
  await page.waitForFunction(()=>document.querySelector('[data-finance-export-error-resolution]')?.hidden===false);assert.match(await page.locator('[data-finance-export-error-resolution-copy]').innerText(),/59595959-5959-4959-8959-595959595959/);await page.click('[data-finance-export-error-resolution-open]');await page.waitForFunction(()=>document.querySelector('[data-finance-screen="SCR-14"]')?.getAttribute('aria-current')==='page');assert.equal(await page.inputValue('[data-finance-integration-errors-source]'),'BILLING');
  await page.click('[data-finance-screen="SCR-14"]');
  await page.selectOption('[data-finance-integration-errors-status]','RETRYABLE');
  await page.selectOption('[data-finance-integration-errors-source]','ERP');
  await page.click('[data-finance-integration-errors-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-integration-errors-body] tr').length===1);
  assert.equal(requests.at(-1).operationId,'listIntegrationErrors');
  assert.match(await page.locator('[data-finance-integration-errors-body]').innerText(),/ERP_TIMEOUT/);
  assert.match(await page.locator('[data-finance-integration-errors-body]').innerText(),/Yeniden denenebilir/);
  await page.click('[data-finance-integration-errors-body] [data-finance-integration-error-id]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-integration-error-detail]')?.dataset.state==='READY');
  assert.equal(requests.at(-1).operationId,'getIntegrationError');
  const integrationText=await page.locator('[data-finance-integration-error-detail]').innerText();
  assert.match(integrationText,/ERP yanıt vermedi/);
  assert.match(integrationText,/DEAD_LETTER/);
  assert.match(integrationText,/Ham payload gösterilmez/);
  assert.doesNotMatch(integrationText,/must-not-leak|dealerAccountId|branchId|secret/i);
  await page.waitForFunction(()=>document.querySelector('[data-finance-integration-assign-form]')?.hidden===false);await page.selectOption('[data-finance-integration-owner-role]','ERP_INTEGRATION');await page.fill('[data-finance-integration-assign-note]','ERP entegrasyon ekibi atandı.');await page.click('[data-finance-integration-assign-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-integration-assign-state]')?.textContent.includes('ASSIGNED'));assert.equal(commands.findLast(item=>item.operationId==='assignIntegrationError').command.expectedVersion,1);assert.match(commands.findLast(item=>item.operationId==='assignIntegrationError').command.idempotencyKey,/^integration:assign:/);await page.waitForFunction(()=>document.querySelector('[data-finance-integration-error-detail]')?.dataset.errorVersion==='2');await page.fill('[data-finance-integration-resolve-note]','Kaynak ERP tarafında düzeltildi.');page.once('dialog',dialog=>dialog.accept());await page.click('[data-finance-integration-resolve-submit]');await page.waitForFunction(()=>document.querySelector('[data-finance-integration-resolve-state]')?.textContent.includes('RESOLVED'));assert.equal(commands.findLast(item=>item.operationId==='resolveIntegrationError').command.expectedVersion,2);assert.equal(commands.findLast(item=>item.operationId==='resolveIntegrationError').command.resolutionCode,'FIXED_EXTERNALLY');assert.match(commands.findLast(item=>item.operationId==='resolveIntegrationError').command.idempotencyKey,/^integration:resolve:/);
  await page.click('[data-finance-integration-error-close]');
  await page.click('[data-finance-screen="SCR-15"]');await page.click('[data-finance-approvals-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-approvals-body] tr').length===1);assert.equal(requests.at(-1).operationId,'listApprovalWorkItems');assert.match(await page.locator('[data-finance-approvals-body]').innerText(),/EXPENSE_APPROVAL_V1/);await page.click('[data-finance-approvals-body] [data-finance-approval-id]');await page.waitForFunction(()=>document.querySelector('[data-finance-approval-detail]')?.querySelector('[data-finance-approval-content]')?.hidden===false);assert.equal(requests.at(-1).operationId,'getApprovalWorkItem');const approvalText=await page.locator('[data-finance-approval-detail]').innerText();assert.match(approvalText,/finance-expense-approver/);assert.doesNotMatch(approvalText,/subject_snapshot|evidenceRef|secret/i);
  await page.click('[data-finance-screen="SCR-16"]');await page.click('[data-finance-audit-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-audit-body] tr').length===1);assert.equal(requests.at(-1).operationId,'listAuditEvents');assert.match(await page.locator('[data-finance-audit-body]').innerText(),/PASS_THROUGH_EXPENSE_SUBMITTED/);await page.click('[data-finance-audit-body] [data-finance-audit-correlation]');await page.waitForFunction(()=>document.querySelector('[data-finance-audit-trace-content]')?.hidden===false);assert.equal(requests.at(-1).operationId,'getAuditCorrelationTrace');const auditText=await page.locator('[data-finance-audit-trace]').innerText();assert.match(auditText,/SHA-256 V2 doğrulandı/);assert.doesNotMatch(auditText,/safe_context|payload|secret/i);const auditDownloadPromise=page.waitForEvent('download');await page.click('[data-finance-audit-export]');const auditDownload=await auditDownloadPromise;assert.equal(auditDownload.suggestedFilename(),'ototr-finans-audit-2026-11-06.csv');const auditStream=await auditDownload.createReadStream();let auditCsv='';for await(const chunk of auditStream)auditCsv+=chunk.toString('utf8');assert.match(auditCsv,/OTOTR|eventId/);assert.match(auditCsv,/"'=CMD"/);assert.doesNotMatch(auditCsv,/safe_context|secret|payload/i);assert.equal(requests.at(-1).operationId,'exportAuditEvents');assert.equal(requests.at(-1).query.limit,10000);
  await page.click('[data-finance-screen="SCR-07"]');
  assert.equal(await page.locator('[data-finance-payment-detail]').isVisible(),false);
  await page.click('[data-finance-accrual-id]');
  assert.equal(await page.locator('[data-finance-screen-code]').first().innerText(), 'SCR-06');
  assert.equal(await page.locator('[data-finance-statement]').isVisible(), false);
  assert.match(await page.locator('[data-finance-accrual-detail]').getAttribute('data-state'), /LOADING|READY/);
  await page.waitForFunction(() => document.querySelector('[data-finance-accrual-detail]')?.dataset.state === 'READY');
  assert.match(await page.locator('[data-finance-accrual-detail]').innerText(), /120,00000000 TRY/);
  assert.match(await page.locator('[data-finance-accrual-lines]').innerText(), /Royalty geliri/);
  assert.equal(requests.at(-1).operationId, 'getAccrualDetail');
  assert.match(await page.locator('[data-finance-accrual-detail]').innerText(),/ROYALTY · ROYALTY/);
  assert.match(await page.locator('[data-finance-accrual-detail]').innerText(),/PERCENTAGE/);
  assert.match(await page.locator('[data-finance-accrual-detail]').innerText(),/%0.20000000/);
  assert.match(await page.locator('[data-finance-accrual-detail]').innerText(),/HALF_UP · 2 hane · TRY/);
  const downloadPromise=page.waitForEvent('download');await page.click('[data-finance-accrual-explanation-download]');const download=await downloadPromise;assert.equal(download.suggestedFilename(),`ototr-finans-hesaplama-${requests.at(-1).pathParams.accrualId}.json`);
  await page.click('[data-finance-accrual-rule-open]');await page.waitForFunction(()=>document.querySelector('[data-finance-contract-rule-detail]')?.hidden===false);assert.equal(requests.at(-1).operationId,'getContractFeeRule');
  await page.click('[data-finance-screen="SCR-06"]');await page.click('[data-finance-accrual-source-open]');await page.waitForFunction(()=>document.querySelector('[data-finance-audit-trace-content]')?.hidden===false);assert.equal(requests.at(-1).operationId,'getAuditCorrelationTrace');
  await page.click('[data-finance-screen="SCR-06"]');await page.click('[data-finance-accrual-dispute]');assert.equal(await page.locator('[data-finance-dispute-create]').isVisible(),true);assert.equal(await page.locator('[data-finance-dispute-create] [name="disputedAmount"]').inputValue(),'75.00000000');await page.click('[data-finance-dispute-create-cancel]');await page.click('[data-finance-screen="SCR-06"]');
  await page.click('[data-finance-accrual-close]');
  assert.equal(await page.locator('[data-finance-accrual-detail]').isVisible(), true);
  assert.equal(await page.locator('[data-finance-accrual-detail]').getAttribute('data-state'), 'EMPTY');
  assert.match(await page.locator('[data-finance-accrual-state]').innerText(), /Tahakkuk listesinden/);
  await page.click('[data-finance-screen="SCR-07"]');
  assert.equal(await page.locator('[data-finance-accrual-detail]').isVisible(), false);

  await page.click('[data-finance-statement-more]');
  await page.waitForFunction(() => document.querySelectorAll('[data-finance-statement-body] tr').length === 2);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(), /Royalty iade izini aç/);
  assert.equal(await page.locator('[data-finance-statement-more]').isVisible(), false);
  await page.click('[data-finance-refund-accrual-id]');
  assert.match(await page.locator('[data-finance-refund-detail]').getAttribute('data-state'),/LOADING|READY/);
  await page.waitForFunction(()=>document.querySelector('[data-finance-refund-detail]')?.dataset.state==='READY');
  assert.match(await page.locator('[data-finance-refund-detail]').innerText(),/590,00000000 TRY/);
  assert.match(await page.locator('[data-finance-refund-detail]').innerText(),/118,00000000 TRY/);
  assert.match(await page.locator('[data-finance-refund-detail]').innerText(),/59,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'getRoyaltyRefundTrace');
  assert.match(await page.locator('[data-finance-refund-provenance]').innerText(),/Tahsilat ve ilk tahakkuku aç/);
  assert.match(await page.locator('[data-finance-refund-provenance]').innerText(),/Ters tahakkuku aç/);
  assert.match(await page.locator('[data-finance-refund-provenance]').innerText(),/Ters kayda itiraz et/);
  await page.click('[data-finance-refund-original-accrual]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-accrual-detail]')?.dataset.state==='READY');
  assert.equal(requests.at(-1).operationId,'getAccrualDetail');
  assert.equal(requests.at(-1).pathParams.accrualId,'14141414-1414-4414-8414-141414141414');
  await page.click('[data-finance-screen="SCR-17"]');
  await page.click('[data-finance-refund-dispute-accrual]');
  assert.equal(await page.locator('[data-finance-dispute-create]').isVisible(),true);
  assert.equal(await page.locator('[data-finance-dispute-create] [name="disputedAmount"]').inputValue(),'59.00000000');
  assert.match(await page.locator('[data-finance-dispute-create-state]').innerText(),/59.00000000 TRY/);
  await page.click('[data-finance-dispute-create-cancel]');
  await page.click('[data-finance-screen="SCR-17"]');
  await page.click('[data-finance-refund-close]');
  assert.equal(await page.locator('[data-finance-refund-detail]').isVisible(),true);
  assert.equal(await page.locator('[data-finance-refund-detail]').getAttribute('data-state'),'EMPTY');
  await page.fill('[data-finance-refunds-from]','2026-11-01');
  await page.fill('[data-finance-refunds-to]','2026-11-30');
  await page.click('[data-finance-refunds-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-refunds-body] tr').length===1);
  assert.match(await page.locator('[data-finance-refunds-body]').innerText(),/590,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listRoyaltyRefunds');
  assert.equal(requests.at(-1).query.from,'2026-11-01');
  assert.equal(requests.at(-1).query.to,'2026-11-30');
  await page.click('[data-finance-refunds-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-refunds-body] tr').length===2);
  assert.equal(await page.locator('[data-finance-refunds-more]').isVisible(),false);

  await page.click('[data-finance-screen="SCR-07"]');
  await page.selectOption('[data-finance-statement-status]', 'OPEN');
  assert.equal(await page.locator('[data-finance-statement-body] tr').count(), 0);
  assert.match(await page.locator('[data-finance-statement-state]').innerText(), /Filtre değişti/);
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(() => document.querySelectorAll('[data-finance-statement-body] tr').length === 1);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(), /ROYALTY/);
  const statementRequest=requests.findLast(request=>request.operationId==='getDealerStatement');
  assert.equal(statementRequest.query.status, 'OPEN');
  assert.equal(statementRequest.scope.branchId, scope.branchId);
  assert.match(await page.locator('[data-finance-statement-control]').innerText(),/100,00000000 TRY/);
  assert.match(await page.locator('[data-finance-statement-aging]').innerText(),/150,00000000 TRY/);
  const statementDownloadPromise=page.waitForEvent('download');await page.click('[data-finance-statement-export]');const statementDownload=await statementDownloadPromise;assert.match(statementDownload.suggestedFilename(),/^ototr-bayi-ekstresi-/);const statementStream=await statementDownload.createReadStream();let statementCsv='';for await(const chunk of statementStream)statementCsv+=chunk.toString('utf8');assert.match(statementCsv,/ROYALTY/);assert.match(statementCsv,/"'=FORMULA"/);assert.equal(requests.at(-1).operationId,'exportDealerStatement');
  const statementPdfPromise=page.waitForEvent('download');await page.click('[data-finance-statement-pdf]');const statementPdf=await statementPdfPromise;assert.match(statementPdf.suggestedFilename(),/^ototr-bayi-ekstresi-.*\.pdf$/);const pdfStream=await statementPdf.createReadStream();let pdfBuffer=Buffer.alloc(0);for await(const chunk of pdfStream)pdfBuffer=Buffer.concat([pdfBuffer,chunk]);assert.equal(pdfBuffer.subarray(0,8).toString('ascii'),'%PDF-1.4');assert.match(pdfBuffer.toString('ascii'),/OTOTR GM FINANS - BAYI EKSTRESI/);assert.match(pdfBuffer.toString('ascii'),/ROYALTY/);assert.match(pdfBuffer.toString('ascii'),/%%EOF$/);assert.equal(requests.at(-1).operationId,'exportDealerStatement');

  await page.selectOption('[data-finance-statement-status]', 'REVERSED');
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(() => document.querySelector('[data-finance-statement]')?.dataset.state === 'EMPTY');
  assert.match(await page.locator('[data-finance-statement-state]').innerText(), /kayıt bulunamadı/i);
  assert.equal(await page.locator('[data-finance-statement-table]').isVisible(), false);

  await page.selectOption('[data-finance-statement-status]', 'DISPUTED');
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(() => document.querySelector('[data-finance-statement]')?.dataset.state === 'ERROR');
  assert.match(await page.locator('[data-finance-statement-state]').innerText(), /geçici olarak kullanılamıyor/i);
  assert.equal(await page.locator('[data-finance-statement-refresh]').isEnabled(), true);

console.log('PASS finance-statement-browser: governance approvals/audit, integration monitoring, export packages, disputes, expenses, statement and payment flows');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
