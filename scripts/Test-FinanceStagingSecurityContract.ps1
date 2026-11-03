$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$tempEvidence = Join-Path $root 'docs\finance\evidence\.security-test.json'
$tempArtifact = Join-Path $root 'docs\finance\evidence\.security-artifact-test.json'
try {
  [IO.File]::WriteAllText($tempArtifact, '{"synthetic":true,"personalDataFound":false}', [Text.UTF8Encoding]::new($false))
  $artifactHash = (Get-FileHash $tempArtifact -Algorithm SHA256).Hash.ToLowerInvariant()
  $relativeArtifact = [IO.Path]::GetRelativePath($root, $tempArtifact).Replace('\','/')
  $d = Get-Content -Raw (Join-Path $root 'docs\finance\staging-security-evidence.json') | ConvertFrom-Json -Depth 30
  $d.status = 'PASSED'; $d.run.environmentId = 'preprod-synthetic'; $d.run.deployedCommit = 'a' * 40
  $d.run.startedAtUtc = '2026-11-03T01:00:00Z'; $d.run.completedAtUtc = '2026-11-03T01:30:00Z'
  $d.run.executedByCorporateId = 'security-tester'; $d.run.approvedByCorporateId = 'security-reviewer'
  $d.run.toolVersions = @([pscustomobject]@{name='synthetic-security-harness';version='1.0.0'})
  foreach ($control in $d.controls) { $control.status = 'PASSED'; $control.evidence = @([pscustomobject]@{path=$relativeArtifact;sha256=$artifactHash}) }
  foreach ($name in @('critical','high','medium','low','unresolved','acceptedRisk')) { $d.findings.$name = 0 }
  [IO.File]::WriteAllText($tempEvidence, ($d | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
  & (Join-Path $PSScriptRoot 'Test-FinanceStagingSecurity.ps1') -RequirePassed -EvidenceFile $tempEvidence
  $d.findings.high = 1; $d.findings.unresolved = 1
  [IO.File]::WriteAllText($tempEvidence, ($d | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
  $rejected = $false
  try { & (Join-Path $PSScriptRoot 'Test-FinanceStagingSecurity.ps1') -RequirePassed -EvidenceFile $tempEvidence } catch { $rejected = $_.Exception.Message -match 'cannot pass' }
  if (-not $rejected) { throw 'High unresolved security finding was not rejected.' }
  Write-Host 'FINANCE STAGING SECURITY CONTRACT: PASSED' -ForegroundColor Green
  Write-Host 'Eight controls accepted with zero blocking findings; high unresolved finding rejected.'
} finally {
  foreach ($path in @($tempEvidence,$tempArtifact)) { if (Test-Path $path) { Remove-Item -LiteralPath $path -Force } }
}
