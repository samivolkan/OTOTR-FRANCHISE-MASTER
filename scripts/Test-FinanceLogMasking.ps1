[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runtimeFiles = @(
  Get-ChildItem (Join-Path $root 'supabase\functions') -Directory -Filter 'finance-*' |
    ForEach-Object { Get-ChildItem $_.FullName -Recurse -File -Include '*.mjs','*.ts' }
  Get-ChildItem (Join-Path $root 'packages\shared\src') -File -Include 'finance-*.mjs' |
    Where-Object Name -NotLike '*.test.mjs'
)
$unsafeLogging = $runtimeFiles | Select-String -Pattern 'console\.(log|info|warn|error|debug)\s*\('
if ($unsafeLogging) { throw "Finance runtime source contains direct console logging: $($unsafeLogging[0].Path)" }

$tests = @(
  'test-finance-read-edge.mjs',
  'test-finance-command-edge.mjs',
  'test-finance-accounting-export-worker.mjs',
  'test-finance-branch-access-worker.mjs',
  'test-finance-invoice-callback-worker.mjs',
  'test-finance-payment-callback-worker.mjs',
  'test-finance-payment-ingestion-worker.mjs',
  'test-finance-refund-worker.mjs',
  'test-finance-service-usage-worker.mjs'
)
foreach ($test in $tests) {
  & node (Join-Path $root "apps\admin\prototype\tools\$test")
  if ($LASTEXITCODE -ne 0) { throw "Finance safe-error test failed: $test" }
}
Write-Host 'FINANCE LOG MASKING: PASSED' -ForegroundColor Green
Write-Host "Runtime files scanned: $($runtimeFiles.Count); direct console logging: 0; safe-error tests: $($tests.Count)/$($tests.Count)"
