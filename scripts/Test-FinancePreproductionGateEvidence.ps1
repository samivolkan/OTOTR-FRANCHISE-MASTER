$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$tempDir = Join-Path $root 'docs\finance\evidence\.gate-test'
$tempGate = Join-Path $tempDir 'gates.json'
$tempEvidence = Join-Path $tempDir 'evidence.json'
try {
  [void](New-Item -ItemType Directory -Path $tempDir -Force)
  Copy-Item (Join-Path $root 'docs\finance\uat-preproduction-gates.json') $tempGate
  [IO.File]::WriteAllText($tempEvidence, '{"synthetic":true}', [Text.UTF8Encoding]::new($false))
  $relativeEvidence = [IO.Path]::GetRelativePath($root, $tempEvidence)
  $signers = @(
    @{ by='Test Finans'; role='Finans Direktörü' },
    @{ by='Test Franchise'; role='Franchise Yönetimi' },
    @{ by='Test Hukuk'; role='Hukuk' }
  )
  foreach ($signer in $signers) {
    & (Join-Path $PSScriptRoot 'Set-FinancePreproductionGateEvidence.ps1') -GateId FIN-G01 -EvidencePath $relativeEvidence -SignedBy $signer.by -SignedRole $signer.role -SignedAtUtc '2026-11-03T00:00:00Z' -GateFile $tempGate | Out-Null
  }
  $result = & (Join-Path $PSScriptRoot 'Test-FinancePreproductionReadiness.ps1') -GateFile $tempGate 6>&1 | Out-String
  $saved = Get-Content -Raw $tempGate | ConvertFrom-Json -Depth 30
  $gate = $saved.gates | Where-Object id -eq 'FIN-G01'
  if ($gate.status -ne 'PASSED' -or @($gate.evidence).Count -ne 3 -or $result -notmatch '1/12 passed') { throw 'Complete role coverage did not pass FIN-G01.' }

  $rejected = $false
  try {
    & (Join-Path $PSScriptRoot 'Set-FinancePreproductionGateEvidence.ps1') -GateId FIN-G02 -EvidencePath $relativeEvidence -SignedBy 'Unauthorized' -SignedRole 'Hukuk' -SignedAtUtc '2026-11-03T00:00:00Z' -GateFile $tempGate | Out-Null
  } catch { $rejected = $_.Exception.Message -match 'not authorized' }
  if (-not $rejected) { throw 'Unauthorized role signoff was not rejected.' }
  Write-Host 'FINANCE PRE-PRODUCTION GATE EVIDENCE: PASSED' -ForegroundColor Green
  Write-Host 'Evidence hash, signer identity, required role coverage, status transition and unauthorized-role rejection verified.'
} finally {
  if (Test-Path $tempDir) { Remove-Item -LiteralPath $tempDir -Recurse -Force }
}
