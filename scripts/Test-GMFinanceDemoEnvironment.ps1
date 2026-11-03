[CmdletBinding()]
param()

$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$server=Join-Path $root 'apps\admin\prototype\tools\finance-demo-server.mjs'
$browserTest=Join-Path $root 'apps\admin\prototype\tools\test-finance-demo-browser.mjs'

foreach($path in @($server,$browserTest)){
  if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw "Demo bileşeni bulunamadı: $path"}
}

node --check $server
if($LASTEXITCODE-ne 0){throw 'Demo sunucusu sözdizimi kontrolü başarısız.'}
node $browserTest
if($LASTEXITCODE-ne 0){throw 'Demo tarayıcı kabul testi başarısız.'}

$source=Get-Content -LiteralPath $server -Raw
foreach($required in @("environment:'SYNTHETIC_DEMO'",'productionDataUsed:false','writesPersisted:false',"server.listen(port,'127.0.0.1'")){
  if(-not$source.Contains($required)){throw "Demo güvenlik sözleşmesi eksik: $required"}
}

Write-Host 'GM FINANCE DEMO ENVIRONMENT: PASSED' -ForegroundColor Green
Write-Host 'Browser flow: PASSED; bind: 127.0.0.1; productionDataUsed: false; writesPersisted: false.'
