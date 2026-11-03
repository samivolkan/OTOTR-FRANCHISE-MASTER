[CmdletBinding()]
param([ValidateRange(1024,65535)][int]$Port=4173)
$ErrorActionPreference='Stop'
$env:OTOTR_FINANCE_DEMO_PORT=[string]$Port
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\finance-demo-server.mjs')
