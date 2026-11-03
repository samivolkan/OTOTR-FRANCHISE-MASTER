[CmdletBinding()]
param(
  [ValidateRange(1024,65535)][int]$Port=4173,
  [switch]$SkipPreflight
)
$ErrorActionPreference='Stop'
if(-not$SkipPreflight){
  Write-Host 'GM Finans sentetik demo ön kontrolü çalışıyor...' -ForegroundColor Cyan
  node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-demo-browser.mjs')
  if($LASTEXITCODE-ne 0){throw 'GM Finans demo ön kontrolü başarısız.'}
}
$env:OTOTR_FINANCE_DEMO_PORT=[string]$Port
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\finance-demo-server.mjs')
