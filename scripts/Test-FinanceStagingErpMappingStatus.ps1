[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-erp-finance-mapping-status.json'))
$ErrorActionPreference='Stop'
$e=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 30
if($e.schemaVersion-ne 1-or$e.module-ne'OTOTR_FRANCHISE_FINANCE'-or$e.target-ne'STAGING'-or$e.environment-ne'ototr-staging'-or$e.projectRef-ne'bsjkohwbtrfwrqcyhsfz'){throw'Invalid staging ERP mapping evidence identity.'}
if($e.productionDataUsed-or$e.containsPersonalData-or$e.status-ne'PARTIAL'-or$e.decision-ne'NO_GO'){throw'ERP mapping evidence must remain privacy-safe and fail-closed.'}
$expected=@('MAP-FIN-01','MAP-FIN-02','MAP-FIN-03','MAP-FIN-04','MAP-FIN-05','MAP-FIN-06','MAP-FIN-07','MAP-FIN-08')
if(@($e.mappings).Count-ne 8-or(@($e.mappings|ForEach-Object id)-join',')-ne($expected-join',')){throw'ERP mapping inventory is incomplete.'}
$userScope=$e.mappings|Where-Object id -eq 'MAP-FIN-04';if($userScope.status-ne'TECHNICALLY_PRESENT_PENDING_SESSION'-or$userScope.observedFinanceRoleCount-ne 1-or$userScope.observedBranchManagerCount-ne 2-or$userScope.observedActiveErpBranchMappingCount-ne 3-or$userScope.observedDuplicateMappingCount-ne 0){throw'ERP identity-scope mapping inventory is inconsistent.'}
$accounting=$e.mappings|Where-Object id -eq 'MAP-FIN-08';if($accounting.status-ne'NOT_EVIDENCED'){throw'Accounting mapping must not be inferred.'}
$tax=$e.mappings|Where-Object id -eq 'MAP-FIN-07';if($tax.status-ne'TECHNICALLY_PRESENT_NOT_APPROVED'){throw'Technical tax inventory must not imply accounting approval.'}
$r=$e.reconciliation;if($r.identitySourceCount-ne 2-or$r.identityTargetCount-ne 2-or$r.unmappedCount-ne 0-or$r.duplicateCount-ne 0-or$r.controlTotalCount-ne 12-or$r.nonZeroDifferenceCount-ne 0-or$r.exceptionCount-ne 0){throw'Staging reconciliation summary is inconsistent.'}
foreach($path in $e.evidenceSources){$resolved=[IO.Path]::GetFullPath((Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path $path));if(-not(Test-Path -LiteralPath $resolved -PathType Leaf)){throw"Mapping evidence source missing: $path"}}
$raw=$e|ConvertTo-Json -Depth 30;if($raw-match'(?i)password|token|authorization|bearer\s+|sb_secret_|eyJ[A-Za-z0-9_-]{20,}|customerName|phone|email|tckn|vkn|iban'){throw'Mapping evidence contains a secret or personal-data field.'}
$intake=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot '..\docs\finance\erp-staging-mapping-intake.md')
$plan=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot '..\docs\finance\uat-preproduction-plan.md')
if($intake-match'Finans şemaları, finans migration kayıtları ve finans Edge Function paketleri henüz yoktu|staging geçmişindeki 125 sürüm|finans manifestindeki 138 sürüm için ayrı dağıtım önizlemesi alınır' -or $plan-match'Staging adaptörleri, gerçek kullanıcı UAT'){throw'Staging mapping documentation contains superseded pre-deployment claims.'}
foreach($required in @('52 finans tablosunun tamamında RLS ve FORCE RLS','20261107015427_finance_source_event_processed_terminal_state','20261107021500_finance_outbox_worker_identity_bridge','üç aktif ERP kapsam eşlemesi')){if($intake-notmatch[regex]::Escape($required)){throw"Current staging mapping statement missing: $required"}}
Write-Host 'FINANCE STAGING ERP MAPPING STATUS: PARTIAL' -ForegroundColor Yellow
Write-Host 'Eight mapping families recorded; ERP role/scope mappings are present, authenticated session acceptance and accounting mapping remain unverified; decision: NO_GO.'
