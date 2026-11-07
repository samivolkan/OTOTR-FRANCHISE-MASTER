$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$tempRoot = Join-Path $root 'docs\finance\evidence\.reconciliation-generator-test'
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
$sourcePath = Join-Path $tempRoot 'source.json'; $targetPath = Join-Path $tempRoot 'target.json'; $outputPath = Join-Path $tempRoot 'evidence.json'
try {
  $base = [ordered]@{
    schemaVersion=1;dataClassification='SYNTHETIC_OR_ANONYMIZED';productionDataUsed=$false;environmentId='ototr-staging-synthetic'
    deployedCommit=('a'*40);cutoffAtUtc='2026-11-07T00:00:00Z';identityReferences=@('BRANCH:SCOPE-B1','BRANCH:SCOPE-B2')
    controlTotals=[ordered]@{SOURCE_EVENT_COUNT='3';COLLECTED_GROSS='1000';REFUNDED_GROSS='200';ACCRUAL_GROSS='96';JOURNAL_DEBIT='96';JOURNAL_CREDIT='96';OPEN_ITEM_DEBIT='120';OPEN_ITEM_CREDIT='24';PAYMENT_TOTAL='0';ALLOCATION_TOTAL='0';BILLING_GROSS='96';ACCOUNTING_EXPORT_BALANCE='0'}
  }
  [IO.File]::WriteAllText($sourcePath,($base|ConvertTo-Json -Depth 20),[Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($targetPath,($base|ConvertTo-Json -Depth 20),[Text.UTF8Encoding]::new($false))
  & (Join-Path $PSScriptRoot 'New-FinanceStagingReconciliationEvidence.ps1') -SourceSnapshotFile $sourcePath -TargetSnapshotFile $targetPath -OutputFile $outputPath -ExecutedBy 'synthetic-test-actor' -StartedAtUtc '2026-11-07T00:01:00Z' -CompletedAtUtc '2026-11-07T00:02:00Z'
  & (Join-Path $PSScriptRoot 'Test-FinanceStagingReconciliation.ps1') -RequireMatched -EvidenceFile $outputPath

  $target = Get-Content -Raw $targetPath | ConvertFrom-Json -Depth 20; $target.controlTotals.ACCRUAL_GROSS='97'
  [IO.File]::WriteAllText($targetPath,($target|ConvertTo-Json -Depth 20),[Text.UTF8Encoding]::new($false))
  & (Join-Path $PSScriptRoot 'New-FinanceStagingReconciliationEvidence.ps1') -SourceSnapshotFile $sourcePath -TargetSnapshotFile $targetPath -OutputFile $outputPath -ExecutedBy 'synthetic-test-actor' -StartedAtUtc '2026-11-07T00:01:00Z' -CompletedAtUtc '2026-11-07T00:02:00Z'
  $mismatch = Get-Content -Raw $outputPath | ConvertFrom-Json -Depth 20
  if ($mismatch.status -ne 'MISMATCH' -or @($mismatch.exceptions).Count -ne 1) { throw 'Generator did not record the control-total mismatch.' }
  $rejected=$false; try { & (Join-Path $PSScriptRoot 'Test-FinanceStagingReconciliation.ps1') -RequireMatched -EvidenceFile $outputPath } catch { $rejected=$_.Exception.Message -match 'has not matched' }
  if (-not $rejected) { throw 'MISMATCH evidence was not rejected by the release gate.' }

  $target = Get-Content -Raw $sourcePath | ConvertFrom-Json -Depth 20; $target | Add-Member -NotePropertyName customerName -NotePropertyValue 'forbidden'
  [IO.File]::WriteAllText($targetPath,($target|ConvertTo-Json -Depth 20),[Text.UTF8Encoding]::new($false))
  $piiRejected=$false; try { & (Join-Path $PSScriptRoot 'New-FinanceStagingReconciliationEvidence.ps1') -SourceSnapshotFile $sourcePath -TargetSnapshotFile $targetPath -OutputFile $outputPath -ExecutedBy 'synthetic-test-actor' -StartedAtUtc '2026-11-07T00:01:00Z' -CompletedAtUtc '2026-11-07T00:02:00Z' } catch { $piiRejected=$_.Exception.Message -match 'forbidden personal-data' }
  if (-not $piiRejected) { throw 'Forbidden personal-data field was not rejected.' }
  Write-Host 'FINANCE STAGING RECONCILIATION GENERATOR: PASSED' -ForegroundColor Green
  Write-Host 'Matched pilot accepted; amount mismatch and personal-data field rejected.'
} finally {
  if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}

