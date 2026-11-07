$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sql=Join-Path $PSScriptRoot 'sql\finance-staging-target-snapshot.sql'
$commit='a'*40
$seed=@'
begin;
insert into public.branches(id,code,name,city)values('91000000-0000-4000-8000-000000000001','RECON-ERP-1','Sentetik Mutabakat 1','Bursa'),('91000000-0000-4000-8000-000000000002','RECON-ERP-2','Sentetik Mutabakat 2','Bursa');
insert into public.app_users(id,auth_user_id,branch_id,full_name,role,is_active)values('92000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001',null,'Sentetik Mutabakat Aktörü','CEO',true);
insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)values('94000000-0000-4000-8000-000000000001','RECON-HQ','Sentetik Mutabakat Merkezi','ACTIVE','92000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001');
insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)values('96000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','RECON-D1','Sentetik Bayi 1','ACTIVE','92000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001'),('96000000-0000-4000-8000-000000000002','94000000-0000-4000-8000-000000000001','RECON-D2','Sentetik Bayi 2','ACTIVE','92000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001');
insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)values('97000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000001','SCOPE-B1','ACTIVE','92000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001'),('97000000-0000-4000-8000-000000000002','94000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000002','SCOPE-B2','ACTIVE','92000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001');
'@
function Invoke-Snapshot([string]$BranchCodes){
  $statement=$seed+(Get-Content -Raw -LiteralPath $sql)+"`nrollback;"
  $result=$statement | & docker exec -i supabase_db_ototr-local psql -U postgres -d postgres -X -q -t -A -v environment_id='ototr-staging-synthetic' -v deployed_commit=$commit -v cutoff_at_utc='2099-01-01T00:00:00Z' -v branch_codes_csv=$BranchCodes -f -
  if($LASTEXITCODE-ne 0){throw 'Target snapshot SQL failed.'}
  return $result
}
$output=Invoke-Snapshot 'SCOPE-B1,SCOPE-B2'
$snapshot=($output -join "`n")|ConvertFrom-Json -Depth 20
if($snapshot.schemaVersion-ne 1-or $snapshot.productionDataUsed-ne $false-or $snapshot.dataClassification-ne 'SYNTHETIC_OR_ANONYMIZED'){throw 'Target snapshot classification is invalid.'}
if($snapshot.environmentId-ne 'ototr-staging-synthetic'-or $snapshot.deployedCommit-ne $commit){throw 'Target snapshot metadata is invalid.'}
$ids=@($snapshot.identityReferences)
if($ids.Count-ne 2-or 'BRANCH:SCOPE-B1'-notin $ids-or 'BRANCH:SCOPE-B2'-notin $ids){throw 'Target snapshot branch scope is incomplete.'}
$expected=@('SOURCE_EVENT_COUNT','COLLECTED_GROSS','REFUNDED_GROSS','ACCRUAL_GROSS','JOURNAL_DEBIT','JOURNAL_CREDIT','OPEN_ITEM_DEBIT','OPEN_ITEM_CREDIT','PAYMENT_TOTAL','ALLOCATION_TOTAL','BILLING_GROSS','ACCOUNTING_EXPORT_BALANCE')
$names=@($snapshot.controlTotals.PSObject.Properties.Name)
if($names.Count-ne 12-or @($expected|Where-Object{$_-notin $names}).Count){throw 'Target snapshot metric inventory is incomplete.'}
$serialized=$snapshot|ConvertTo-Json -Depth 20
if($serialized-match'(?i)customerName|fullName|phone|email|plate|tckn|vkn|iban|bankAccount|address|payload'){throw 'Target snapshot exposed a forbidden raw or personal-data field.'}
$missingRejected=$false
try{
  $missing=Invoke-Snapshot 'DOES-NOT-EXIST'
  $missingSnapshot=($missing-join"`n")|ConvertFrom-Json -Depth 20
  $missingRejected=@($missingSnapshot.identityReferences).Count-eq 0
}catch{$missingRejected=$true}
if(-not $missingRejected){throw 'Unknown branch scope was not visible as an empty identity set.'}
Write-Host 'FINANCE STAGING TARGET SNAPSHOT: PASSED' -ForegroundColor Green
Write-Host 'Two masked branch identities and 12 aggregate-only control totals exported; raw payload and personal-data fields absent.'

