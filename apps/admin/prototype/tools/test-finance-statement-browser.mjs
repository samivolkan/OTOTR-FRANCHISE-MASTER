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
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(({origin, scope}) => {
    window.OTOTR_SUPABASE_CONFIG = {url:origin,publishableKey:`sb_publishable_${'a'.repeat(32)}`};
    window.OTOTR_FINANCE_AUTH = {getAccessToken:() => `test-user-token-${'x'.repeat(32)}`};
    window.OTOTR_FINANCE_CONTEXT = scope;
  }, {origin, scope});
  await page.route('**/functions/v1/finance-read', async route => {
    const body = route.request().postDataJSON();
    requests.push(body);
    await new Promise(resolve => setTimeout(resolve, 75));
    if(body.operationId==='getDealerFinanceSummary'){
      const money={netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'};
      const data={...scope,asOf:'2026-11-03',accrued:money,invoiced:money,collected:money,open:money,overdue:{netAmount:'0',taxAmount:'0',grossAmount:'0',currency:'TRY'},calculatedAtUtc:'2026-11-03T10:00:00Z'};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getHeadquartersFinanceSummary'){
      const money=(gross)=>({netAmount:gross,taxAmount:'0',grossAmount:gross,currency:'TRY'});
      const data={legalEntityId:scope.legalEntityId,asOf:'2026-11-03',currency:'TRY',dealerCount:2,branchCount:2,accrued:money('480.00000000'),invoiced:money('300.00000000'),collected:money('40.00000000'),open:money('440.00000000'),overdue:money('60.00000000'),refunded:money('59.00000000'),disputed:money('70.00000000'),unallocated:{amount:'60.00000000',currency:'TRY'},feeFamilies:[{feeFamily:'ROYALTY',netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'},{feeFamily:'ENTRY_FRANCHISE',netAmount:'300.00000000',taxAmount:'60.00000000',grossAmount:'360.00000000',currency:'TRY'}],dealerRanking:[{dealerLegalEntityId:'20202020-2020-4020-8020-202020202020',dealerCode:'BAYI-A',dealerName:'Bayi A',dealerAccountId:scope.dealerAccountId,branchId:scope.branchId,branchCode:'NILUFER',accruedGrossAmount:'300.00000000',collectedGrossAmount:'40.00000000',openGrossAmount:'260.00000000',overdueGrossAmount:'0.00000000',currency:'TRY'}]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getFinancePeriod'){
      const data={periodId:'18181818-1818-4818-8818-181818181818',parentPeriodId:'19191919-1919-4919-8919-191919191919',dealerAccountId:scope.dealerAccountId,branchId:scope.branchId,periodStart:'2026-11-01',periodEnd:'2026-11-30',currencyCode:'TRY',status:'LOCKED',sourceSnapshotHash:'a'.repeat(64),checkSnapshotHash:'b'.repeat(64),lockedAtUtc:'2026-11-30T20:00:00Z',version:3};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getCurrentFranchiseContract'){
      const data={contractId:'20202020-2020-4020-8020-202020202020',contractCode:'OTOTR-FR-2026-001',status:'ACTIVE',version:2,activeVersion:{versionId:'21212121-2121-4121-8121-212121212121',versionNo:3,status:'ACTIVE',validFrom:'2026-11-01',validTo:null,currencyCode:'TRY',contentHash:'c'.repeat(64),version:1},pendingVersion:{versionId:'22222222-2222-4222-8222-222222222223',versionNo:4,status:'PENDING_APPROVAL',validFrom:'2027-01-01',validTo:null,currencyCode:'TRY',contentHash:'d'.repeat(64),version:1}};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listContractFeeRules'){
      const rule=(id,feeCode,category,method,parameter,includesTax)=>({feeRuleId:id,feeDefinitionId:id.replace(/^./,'3'),feeCode,name:`${feeCode} Bedeli`,category,ruleCode:`RULE-${feeCode}`,priority:100,status:'ACTIVE',configurationStatus:'CONFIGURED',triggerEventType:'payment.settled',basis:{kind:'COLLECTED_GROSS'},calculation:{method,currency:'TRY',priceIncludesTax:includesTax,rate:parameter,decimalScale:2,roundingMode:'HALF_UP'},version:1});
      const data=body.query.cursor
        ? {items:[rule('25252525-2525-4525-8525-252525252525','QUERY','QUERY','FIXED','25.00',false)],nextCursor:null,hasMore:false}
        : {items:[rule('23232323-2323-4323-8323-232323232323','ROYALTY','ROYALTY','PERCENTAGE','0.10',true),rule('24242424-2424-4424-8424-242424242424','ENTRY_FRANCHISE','ENTRY_FRANCHISE','FIXED','1000.00',false)],nextCursor:'24242424-2424-4424-8424-242424242424',hasMore:true};
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
      const data={errorId:body.pathParams.errorId,sourceSystem:'ERP',errorClass:'OUTBOX',safeErrorCode:'ERP_TIMEOUT',status:'RETRYABLE',retryable:true,retryCount:2,safeDetail:{sourceSystem:'ERP',retryable:true,safeMessage:'ERP yanıt vermedi'},occurredAtUtc:'2026-11-06T09:00:00Z',correlationId:'59595959-5959-4959-8959-595959595959',trace:[{direction:'INBOX',messageId:'60606060-6060-4060-8060-606060606060',system:'ERP',eventType:'MESSAGE',status:'REJECTED',schemaVersion:2,occurredAtUtc:'2026-11-06T08:59:00Z'},{direction:'OUTBOX',messageId:'61616161-6161-4161-8161-616161616161',system:'finance.erp',eventType:'ERP_SYNC_FAILED',status:'DEAD_LETTER',attemptCount:3,safeErrorCode:'ERP_TIMEOUT',occurredAtUtc:'2026-11-06T09:00:00Z'}],version:1};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listApprovalWorkItems'){
      const data={items:[{requestId:'62626262-6262-4262-8262-626262626262',subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',policyVersion:'EXPENSE_APPROVAL_V1',status:'PENDING',preparedBy:'64646464-6464-4464-8464-646464646464',createdAtUtc:'2026-11-06T10:00:00Z',correlationId:'65656565-6565-4565-8565-656565656565',version:1}],nextCursor:null,hasMore:false};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getApprovalWorkItem'){
      const data={requestId:body.pathParams.requestId,subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',policyVersion:'EXPENSE_APPROVAL_V1',status:'PENDING',preparedBy:'64646464-6464-4464-8464-646464646464',createdAtUtc:'2026-11-06T10:00:00Z',correlationId:'65656565-6565-4565-8565-656565656565',version:1,snapshotHash:'a'.repeat(64),steps:[{stepNo:1,requiredRole:'finance-expense-approver',decision:null,decidedBy:null,decidedAtUtc:null}]};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='listAuditEvents'){
      const data={items:[{eventId:'66666666-6666-4666-8666-666666666667',actorId:'64646464-6464-4464-8464-646464646464',actorType:'USER',actionCode:'PASS_THROUGH_EXPENSE_SUBMITTED',subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',decision:'ALLOW',reasonCode:'SUBMIT',createdAtUtc:'2026-11-06T10:01:00Z',correlationId:'65656565-6565-4565-8565-656565656565',integrityHash:'b'.repeat(64),previousIntegrityHash:'a'.repeat(64)}],nextCursor:null,hasMore:false};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if(body.operationId==='getAuditCorrelationTrace'){
      const data={correlationId:body.pathParams.correlationId,eventCount:1,chainProjection:'SHA256_V2_VERIFIED',chainVerification:{version:'AUDIT_SHA256_V2',checkedEventCount:1,invalidEventCount:0,legacyEventCount:0,valid:true},rawContextExposed:false,items:[{eventId:'66666666-6666-4666-8666-666666666667',actorId:'64646464-6464-4464-8464-646464646464',actorType:'USER',actionCode:'PASS_THROUGH_EXPENSE_SUBMITTED',subjectType:'PASS_THROUGH_EXPENSE',subjectId:'63636363-6363-4363-8363-636363636363',decision:'ALLOW',reasonCode:'SUBMIT',createdAtUtc:'2026-11-06T10:01:00Z',integrityHash:'b'.repeat(64),previousIntegrityHash:'a'.repeat(64)}]};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});return;
    }
    if (body.operationId === 'getPayment') {
      const paymentId = body.pathParams.paymentId;
      const data = {
        payment:{paymentId,status:'PARTIALLY_ALLOCATED',paymentDate:'2026-11-03',amount:{amount:'200.00000000',currency:'TRY'},paymentMethodCode:'BANK_TRANSFER',externalReference:'BANK-2026-001'},
        allocations:[{allocationId:'66666666-6666-4666-8666-666666666666',openItemId:'77777777-7777-4777-8777-777777777777',amount:{amount:'80.00000000',currency:'TRY'},status:'ACTIVE'}],
        unallocatedAmount:{amount:'120.00000000',currency:'TRY'},version:1,
      };
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})});
      return;
    }
    if (body.operationId === 'getAccrualDetail') {
      const accrualId = body.pathParams.accrualId;
      const data = {
        accrualId,sourceEventId:'88888888-8888-4888-8888-888888888888',feeRuleId:'99999999-9999-4999-8999-999999999999',status:'POSTED',
        calculation:{status:'CALCULATED',amounts:{netAmount:'100.00000000',taxAmount:'20.00000000',grossAmount:'120.00000000',currency:'TRY'}},
        journalEntry:{journalEntryId:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',entryNumber:'JE-TEST-001',postingDate:'2026-11-03',currency:'TRY',source:{sourceType:'customer-payment.settled'},lines:[
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

  await page.goto(`${origin}/index.html`, {waitUntil:'networkidle'});
  await page.click('#navFinance');
  await page.click('[data-finance-connect]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-state]')?.textContent.includes('READY'));
  await page.waitForFunction(()=>document.querySelector('[data-finance-headquarters]')?.dataset.state==='READY');
  assert.match(await page.locator('[data-finance-headquarters-counts]').innerText(),/2/);
  assert.match(await page.locator('[data-finance-headquarters-families]').innerText(),/ROYALTY/);
  assert.match(await page.locator('[data-finance-headquarters-ranking]').innerText(),/BAYI-A/);
  assert.match(await page.locator('[data-finance-kpi="accrued"]').innerText(),/480,00000000 TRY/);
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
  await page.click('[data-finance-screen="SCR-03"]');
  assert.equal(await page.locator('[data-finance-contract-workspace]').isVisible(),true);
  await page.click('[data-finance-contract-refresh]');
  await page.waitForFunction(()=>document.querySelector('[data-finance-contract-workspace]')?.dataset.state==='READY');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-contract-rules-body] tr').length===2);
  assert.match(await page.locator('[data-finance-contract-content]').innerText(),/OTOTR-FR-2026-001/);
  assert.match(await page.locator('[data-finance-contract-content]').innerText(),/v3/);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/ROYALTY/);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/PERCENTAGE/);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/Evet/);
  assert.equal(requests.at(-1).operationId,'listContractFeeRules');
  await page.click('[data-finance-contract-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-contract-rules-body] tr').length===3);
  assert.match(await page.locator('[data-finance-contract-rules-body]').innerText(),/QUERY/);
  await page.click('[data-finance-screen="SCR-04"]');
  assert.equal(await page.locator('[data-finance-contract-workspace]').isVisible(),true);
  assert.match(await page.locator('[data-finance-contract-title]').innerText(),/Bedel Kataloğu/);
  await page.click('[data-finance-screen="SCR-05"]');
  assert.equal(await page.locator('[data-finance-statement]').isVisible(),true);
  assert.equal(await page.locator('[data-finance-statement-title]').innerText(),'Tahakkuklar');
  await page.click('[data-finance-statement-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-statement-body] tr').length===1);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(),/ENTRY_FRANCHISE/);
  await page.click('[data-finance-screen="SCR-07"]');
  assert.equal(await page.locator('[data-finance-statement-title]').innerText(),'Bayi Ekstresi');
  await assert.doesNotReject(() => page.waitForSelector('[data-finance-statement]:not([hidden])'));
  assert.equal(await page.locator('[data-finance-statement-refresh]').isEnabled(), true);
  assert.equal(await page.locator('[data-finance-statement-body] tr').count(), 1);

  await page.click('[data-finance-statement-refresh]');
  assert.equal(await page.locator('[data-finance-statement]').getAttribute('data-state'), 'LOADING');
  await page.waitForFunction(() => document.querySelectorAll('[data-finance-statement-body] tr').length === 1);
  assert.match(await page.locator('[data-finance-statement-body]').innerText(), /ENTRY_FRANCHISE/);
  assert.equal(await page.locator('[data-finance-statement-more]').isVisible(), true);
  await page.click('[data-finance-payment-id]');
  assert.equal(await page.locator('[data-finance-screen-code]').first().innerText(),'SCR-08');
  assert.equal(await page.locator('[data-finance-payments]').isVisible(),true);
  await page.waitForFunction(() => document.querySelector('[data-finance-payment-detail]')?.dataset.state === 'READY');
  assert.match(await page.locator('[data-finance-payment-detail]').innerText(), /200,00000000 TRY/);
  assert.match(await page.locator('[data-finance-payment-detail]').innerText(), /120,00000000 TRY/);
  assert.match(await page.locator('[data-finance-payment-allocations]').innerText(), /80,00000000 TRY/);
  assert.equal(requests.at(-1).operationId, 'getPayment');
  await page.click('[data-finance-payment-close]');
  assert.equal(await page.locator('[data-finance-payment-detail]').isVisible(),true);
  assert.equal(await page.locator('[data-finance-payment-detail]').getAttribute('data-state'),'EMPTY');
  await page.click('[data-finance-payments-refresh]');
  assert.equal(await page.locator('[data-finance-payments]').getAttribute('data-state'),'LOADING');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-payments-body] tr').length===1);
  assert.match(await page.locator('[data-finance-payments-body]').innerText(),/BANK-5555/);
  assert.match(await page.locator('[data-finance-payments-body]').innerText(),/120,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listPayments');
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
  await page.click('[data-finance-service-usages-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-service-usages-body] tr').length===1);
  assert.match(await page.locator('[data-finance-service-usages-body]').innerText(),/QUERY-001/);
  assert.match(await page.locator('[data-finance-service-usages-body]').innerText(),/70,00000000 TRY/);
  await page.click('[data-finance-service-usages-more]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-service-usages-body] tr').length===2);
  assert.match(await page.locator('[data-finance-service-usages-body]').innerText(),/Ücretsiz hak/);
  assert.equal(requests.at(-1).operationId,'listServiceUsages');
  await page.click('[data-finance-screen="SCR-10"]');
  await page.click('[data-finance-expenses-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-expenses-body] tr').length===1);
  assert.match(await page.locator('[data-finance-expenses-body]').innerText(),/SUPPLIER-001/);
  assert.match(await page.locator('[data-finance-expenses-body]').innerText(),/1\.200,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listPassThroughExpenses');
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
  assert.match(await page.locator('[data-finance-dispute-provenance]').innerText(),/47474747-4747-4747-8747-474747474747/);
  assert.match(await page.locator('[data-finance-dispute-sla]').innerText(),/tahmini süre üretilmez/);
  await page.click('[data-finance-dispute-close]');
  await page.click('[data-finance-screen="SCR-13"]');
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
  await page.click('[data-finance-export-package-close]');
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
  await page.click('[data-finance-integration-error-close]');
  await page.click('[data-finance-screen="SCR-15"]');await page.click('[data-finance-approvals-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-approvals-body] tr').length===1);assert.equal(requests.at(-1).operationId,'listApprovalWorkItems');assert.match(await page.locator('[data-finance-approvals-body]').innerText(),/EXPENSE_APPROVAL_V1/);await page.click('[data-finance-approvals-body] [data-finance-approval-id]');await page.waitForFunction(()=>document.querySelector('[data-finance-approval-detail]')?.querySelector('[data-finance-approval-content]')?.hidden===false);assert.equal(requests.at(-1).operationId,'getApprovalWorkItem');const approvalText=await page.locator('[data-finance-approval-detail]').innerText();assert.match(approvalText,/finance-expense-approver/);assert.doesNotMatch(approvalText,/subject_snapshot|evidenceRef|secret/i);
  await page.click('[data-finance-screen="SCR-16"]');await page.click('[data-finance-audit-refresh]');await page.waitForFunction(()=>document.querySelectorAll('[data-finance-audit-body] tr').length===1);assert.equal(requests.at(-1).operationId,'listAuditEvents');assert.match(await page.locator('[data-finance-audit-body]').innerText(),/PASS_THROUGH_EXPENSE_SUBMITTED/);await page.click('[data-finance-audit-body] [data-finance-audit-correlation]');await page.waitForFunction(()=>document.querySelector('[data-finance-audit-trace-content]')?.hidden===false);assert.equal(requests.at(-1).operationId,'getAuditCorrelationTrace');const auditText=await page.locator('[data-finance-audit-trace]').innerText();assert.match(auditText,/SHA-256 V2 doğrulandı/);assert.doesNotMatch(auditText,/safe_context|payload|secret/i);
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
  await page.click('[data-finance-refund-close]');
  assert.equal(await page.locator('[data-finance-refund-detail]').isVisible(),true);
  assert.equal(await page.locator('[data-finance-refund-detail]').getAttribute('data-state'),'EMPTY');
  await page.click('[data-finance-refunds-refresh]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-finance-refunds-body] tr').length===1);
  assert.match(await page.locator('[data-finance-refunds-body]').innerText(),/590,00000000 TRY/);
  assert.equal(requests.at(-1).operationId,'listRoyaltyRefunds');
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
  assert.equal(requests.at(-1).query.status, 'OPEN');
  assert.equal(requests.at(-1).scope.branchId, scope.branchId);
  assert.equal(requests.at(-1).operationId, 'getDealerStatement');

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
