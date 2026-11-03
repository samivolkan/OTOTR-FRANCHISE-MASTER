import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {dirname,extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..','bayi-portal');
const ids={legalEntityId:'11111111-1111-4111-8111-111111111111',dealerAccountId:'22222222-2222-4222-8222-222222222222',branchId:'33333333-3333-4333-8333-333333333333'};
const money=gross=>({netAmount:gross,taxAmount:'0.00000000',grossAmount:gross,currency:'TRY'});
const summary={...ids,asOf:'2026-11-03',currencyCode:'TRY',accrued:money('248000.00000000'),invoiced:money('221000.00000000'),collected:money('184500.00000000'),open:money('63500.00000000'),overdue:money('12500.00000000'),feeFamilies:[{feeFamily:'ROYALTY',netAmount:'110000.00000000',taxAmount:'22000.00000000',grossAmount:'132000.00000000',currency:'TRY'},{feeFamily:'QUERY',netAmount:'25000.00000000',taxAmount:'5000.00000000',grossAmount:'30000.00000000',currency:'TRY'}],branchBreakdown:[{branchId:ids.branchId,branchCode:'DEMO-NILUFER',accruedGrossAmount:'248000.00000000',collectedGrossAmount:'184500.00000000',openGrossAmount:'63500.00000000',overdueGrossAmount:'12500.00000000',currency:'TRY'}],operationalContribution:{status:'CALCULATED',amount:'202000.00000000',currency:'TRY',customerNetRevenueAmount:'450000.00000000',gmAccruedGrossAmount:'248000.00000000',method:'CUSTOMER_NET_REVENUE_MINUS_GM_ACCRUALS',isAccountingProfit:false,sourceSystem:'SYNTHETIC_ERP',adapterContractVersion:'1',rawCustomerRecordsExposed:false},calculatedAtUtc:'2026-11-03T06:00:00Z'};
const headquarters={legalEntityId:ids.legalEntityId,asOf:'2026-11-03',currency:'TRY',dealerCount:8,branchCount:12,accrued:money('248000.00000000'),invoiced:money('221000.00000000'),collected:money('184500.00000000'),open:money('63500.00000000'),overdue:money('12500.00000000'),refunded:money('5900.00000000'),disputed:money('3400.00000000'),unallocated:{amount:'2400.00000000',currency:'TRY'},feeFamilies:[{feeFamily:'ROYALTY',netAmount:'110000.00000000',taxAmount:'22000.00000000',grossAmount:'132000.00000000',currency:'TRY'},{feeFamily:'QUERY',netAmount:'25000.00000000',taxAmount:'5000.00000000',grossAmount:'30000.00000000',currency:'TRY'},{feeFamily:'ENTRY_FRANCHISE',netAmount:'71666.66666667',taxAmount:'14333.33333333',grossAmount:'86000.00000000',currency:'TRY'}],dealerRanking:[{dealerLegalEntityId:'44444444-4444-4444-8444-444444444444',dealerCode:'DEMO-001',dealerName:'Sentetik Nilüfer Bayii',dealerAccountId:ids.dealerAccountId,branchId:ids.branchId,branchCode:'DEMO-NILUFER',accruedGrossAmount:'48000.00000000',collectedGrossAmount:'36000.00000000',openGrossAmount:'12000.00000000',overdueGrossAmount:'2500.00000000',currency:'TRY'}]};
const operationalHealth={status:'DEGRADED',generatedAtUtc:'2026-11-03T06:00:00Z',outbox:{pending:2,failed:0,deadLetter:1,oldestPendingAgeSeconds:180},integrationErrors:{open:1,retryScheduled:0},auditIntegrity:{valid:true,checkedEventCount:18,invalidEventCount:0,version:'AUDIT_SHA256_V2'},rawPayloadExposed:false};
const period={periodId:'55555555-5555-4555-8555-555555555555',parentPeriodId:null,dealerAccountId:ids.dealerAccountId,branchId:ids.branchId,periodStart:'2026-11-01',periodEnd:'2026-11-30',currencyCode:'TRY',status:'OPEN',sourceSnapshotHash:null,checkSnapshotHash:null,lockedAtUtc:null,version:1};
const integrationList={items:[{errorId:'66666666-6666-4666-8666-666666666666',sourceSystem:'ERP',errorClass:'OUTBOX',safeErrorCode:'ERP_TIMEOUT',status:'RETRYABLE',ownerUserId:null,retryCount:2,occurredAtUtc:'2026-11-03T05:55:00Z',correlationId:'77777777-7777-4777-8777-777777777777',version:1}],nextCursor:null,hasMore:false};
const integrationDetail={...integrationList.items[0],retryable:true,safeDetail:{sourceSystem:'ERP',retryable:true,safeMessage:'Sentetik ERP yanıt süresi aşıldı'},trace:[{direction:'INBOX',messageId:'88888888-8888-4888-8888-888888888888',system:'ERP',eventType:'MESSAGE',status:'REJECTED',schemaVersion:2,occurredAtUtc:'2026-11-03T05:54:00Z'},{direction:'OUTBOX',messageId:'99999999-9999-4999-8999-999999999999',system:'finance.erp',eventType:'ERP_SYNC_FAILED',status:'DEAD_LETTER',attemptCount:3,safeErrorCode:'ERP_TIMEOUT',occurredAtUtc:'2026-11-03T05:55:00Z'}]};
const approvalRequestId='12121212-1212-4212-8212-121212121212',approvalSubjectId='13131313-1313-4313-8313-131313131313',governanceCorrelationId='14141414-1414-4414-8414-141414141414';
const approvalList={items:[{requestId:approvalRequestId,subjectType:'PASS_THROUGH_EXPENSE',subjectId:approvalSubjectId,policyVersion:'EXPENSE_APPROVAL_V1',status:'PENDING',preparedBy:'15151515-1515-4515-8515-151515151515',createdAtUtc:'2026-11-03T06:10:00Z',correlationId:governanceCorrelationId,version:1,riskLevel:'MEDIUM',amount:'42000.00000000',currency:'TRY',evidenceCount:2,action:{screenId:'SCR-10',operationId:'approveExpense',available:true},rawSnapshotExposed:false,rawEvidenceReferenceExposed:false}],nextCursor:null,hasMore:false,ordering:'PENDING_RISK_THEN_AGE',rawSnapshotExposed:false,rawEvidenceReferenceExposed:false};
const approvalDetail={...approvalList.items[0],snapshotHash:'a'.repeat(64),steps:[{stepNo:1,requiredRole:'finance-expense-approver',decision:null,decidedBy:null,decidedAtUtc:null}]};
const auditEvent={eventId:'16161616-1616-4616-8616-161616161616',actorId:'15151515-1515-4515-8515-151515151515',actorType:'USER',actionCode:'PASS_THROUGH_EXPENSE_SUBMITTED',subjectType:'PASS_THROUGH_EXPENSE',subjectId:approvalSubjectId,decision:'ALLOW',reasonCode:'SUBMIT',createdAtUtc:'2026-11-03T06:10:00Z',correlationId:governanceCorrelationId,integrityHash:'c'.repeat(64),previousIntegrityHash:'b'.repeat(64)};
const auditList={items:[auditEvent],nextCursor:null,hasMore:false};
const auditTrace={correlationId:governanceCorrelationId,items:[auditEvent],eventCount:1,chainProjection:'SHA256_V2_VERIFIED',chainVerification:{version:'AUDIT_SHA256_V2',checkedEventCount:1,invalidEventCount:0,legacyEventCount:0,valid:true},rawContextExposed:false};
const health=Object.freeze({status:'READY',environment:'SYNTHETIC_DEMO',module:'OTOTR_FRANCHISE_FINANCE',schemaVersion:1,productionDataUsed:false,writesPersisted:false,bindAddress:'127.0.0.1'});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};

const api=body=>({getDealerFinanceSummary:summary,getHeadquartersFinanceSummary:headquarters,getFinanceOperationalHealth:operationalHealth,getFinancePeriod:period,listIntegrationErrors:integrationList,getIntegrationError:integrationDetail,listApprovalWorkItems:approvalList,getApprovalWorkItem:approvalDetail,listAuditEvents:auditList,getAuditCorrelationTrace:auditTrace}[body.operationId]??{items:[],nextCursor:null,hasMore:false});
export function createFinanceDemoServer({port=4173}={}){
const server=createServer(async(req,res)=>{
  try{
    if(req.method==='GET'&&req.url==='/health'){
      res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(health));return;
    }
    if(req.method==='POST'&&req.url==='/functions/v1/finance-command'){
      let raw='';for await(const chunk of req)raw+=chunk;if(raw.length>16384)throw new Error('PAYLOAD_TOO_LARGE');const body=JSON.parse(raw);if(body.operationId!=='retryIntegrationError')throw new Error('INVALID_COMMAND');const data={outcome:'QUEUED',errorId:body.command.errorId,jobId:'20202020-2020-4020-8020-202020202020',status:'QUEUED',version:2,correlationId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','correlation-id':data.correlationId});res.end(JSON.stringify({data}));return;
    }
    if(req.method==='POST'&&req.url==='/functions/v1/finance-read'){
      let raw='';for await(const chunk of req)raw+=chunk;if(raw.length>32768)throw new Error('PAYLOAD_TOO_LARGE');
      const body=JSON.parse(raw);const data=api(body);res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','correlation-id':'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'});res.end(JSON.stringify({data}));return;
    }
    const url=new URL(req.url,'http://local');const relative=normalize(url.pathname==='/'?'index.html':url.pathname.slice(1));const target=join(root,relative);
    if(!target.startsWith(root)||!(await stat(target)).isFile())throw new Error('NOT_FOUND');
    res.writeHead(200,{'content-type':mime[extname(target)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(target));
  }catch(error){res.writeHead(error.message==='NOT_FOUND'?404:400,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:{code:'DEMO_REQUEST_FAILED',message:'Sentetik demo isteği tamamlanamadı.'}}));}
});
return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolve(server));});
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const port=Number(process.env.OTOTR_FINANCE_DEMO_PORT||4173);
  await createFinanceDemoServer({port});
  console.log(`OTOTR GM Finans sentetik demo: http://127.0.0.1:${port}/index.html?financeDemo=1#finance`);
  console.log(`Sağlık kontrolü: http://127.0.0.1:${port}/health · productionDataUsed=false · writesPersisted=false`);
}
