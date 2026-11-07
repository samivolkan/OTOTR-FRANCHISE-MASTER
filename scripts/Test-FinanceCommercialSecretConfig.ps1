$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
& node --test (Join-Path $root 'packages\shared\src\finance-commercial-secret-config.test.mjs')
if ($LASTEXITCODE -ne 0) { throw "Finance commercial secret configuration tests failed with exit code $LASTEXITCODE." }
Write-Host 'FINANCE COMMERCIAL SECRET CONFIGURATION: PASSED' -ForegroundColor Green
Write-Host 'Default royalty, TRAMER/KM/TRAMER 360 catalog and transparent pass-through parameters are materialized server-side; public values exposed: false.'
