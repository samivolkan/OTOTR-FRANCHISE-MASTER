[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$gatePath = Join-Path $root 'docs/finance/uat-preproduction-gates.json'
$coveragePath = Join-Path $root 'docs/finance/erp-ui-coverage.json'
$acceptancePath = Join-Path $PSScriptRoot 'Test-FinanceLocalAcceptance.ps1'
$testResultsPath = Join-Path $root 'TEST_RESULTS.md'

$gates = Get-Content -LiteralPath $gatePath -Raw | ConvertFrom-Json
$coverage = Get-Content -LiteralPath $coveragePath -Raw | ConvertFrom-Json

if ($gates.policy.defaultDecision -ne 'NO_GO') { throw 'Pre-production default decision must remain NO_GO.' }
if (@($gates.gates).Count -ne 12) { throw 'Finance gate registry must contain exactly 12 gates.' }
if (@($gates.gates | Where-Object status -ne 'PENDING').Count -ne 0) { throw 'A finance gate was advanced without the required signoff package.' }

$gateText = Get-Content -LiteralPath $gatePath -Raw
if ($gateText -match '\b(?:5[0-9]|6[0-9]|7[0-2])/\d+ kabul') {
  throw 'Canonical gate registry contains a stale hard-coded local acceptance count.'
}

$screens = @($coverage.screens)
if ($screens.Count -ne 17) { throw 'Finance UI coverage must contain exactly 17 screens.' }
$expected = @{
  SHELL_ONLY = 0
  PARTIAL_LIVE_READ = 2
  PARTIAL_LIVE_WRITE = 9
  LIVE_READ_VERIFIED = 4
  LIVE_WRITE = 2
}
foreach ($status in $expected.Keys) {
  $actual = @($screens | Where-Object status -eq $status).Count
  if ($actual -ne $expected[$status]) { throw "Finance UI status $status expected $($expected[$status]), got $actual." }
}

$acceptanceRaw = Get-Content -LiteralPath $acceptancePath -Raw
$declaredChecks = [regex]::Matches($acceptanceRaw, "(?m)^\s+'Test-[^']+\.ps1',?\s*$").Count
$resultMatches = [regex]::Matches((Get-Content -LiteralPath $testResultsPath -Raw), 'Test-FinanceLocalAcceptance\.ps1`?: PASS, (\d+)/(\d+) checks')
if ($resultMatches.Count -eq 0) { throw 'Current finance acceptance count is missing from TEST_RESULTS.md.' }
$latestResult = $resultMatches[$resultMatches.Count - 1]
if ([int]$latestResult.Groups[1].Value -ne $declaredChecks -or [int]$latestResult.Groups[2].Value -ne $declaredChecks) { throw "Latest finance acceptance result is stale; expected $declaredChecks/$declaredChecks." }

Write-Host 'FINANCE DELIVERY CONSISTENCY: PASSED' -ForegroundColor Green
Write-Host "12 gates PENDING/NO_GO; 17-screen coverage 0/2/9/4/2; latest acceptance $declaredChecks/$declaredChecks; stale counters excluded from canonical gates."
