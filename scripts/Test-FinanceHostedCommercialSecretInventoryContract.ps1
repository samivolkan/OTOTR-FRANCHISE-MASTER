[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$complete=Join-Path ([IO.Path]::GetTempPath()) "ototr-finance-secret-inventory-$([guid]::NewGuid().ToString('N')).json"
$missing=Join-Path ([IO.Path]::GetTempPath()) "ototr-finance-secret-inventory-missing-$([guid]::NewGuid().ToString('N')).json"
$script=Join-Path $PSScriptRoot 'Test-FinanceHostedCommercialSecretInventory.ps1'
$names=@('FINANCE_ROYALTY_DEFAULT_RATE_PERCENT','FINANCE_QUERY_TRAMER_TRY_AMOUNT','FINANCE_QUERY_KM_TRY_AMOUNT','FINANCE_QUERY_TRAMER_360_TRY_AMOUNT','FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT')
try{
  $inventory=@($names|ForEach-Object{[ordered]@{name=$_;digest=('a'*64)}})
  [IO.File]::WriteAllText($complete,($inventory|ConvertTo-Json -Depth 4),[Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($missing,(@($inventory|Select-Object -Skip 1)|ConvertTo-Json -Depth 4),[Text.UTF8Encoding]::new($false))
  $raw=&$script -ProjectRef 'bsjkohwbtrfwrqcyhsfz' -InventoryFile $complete
  $result=$raw|ConvertFrom-Json
  if($result.status-ne'COMPLETE'-or$result.requiredNameCount-ne 5-or$result.verifiedNameCount-ne 5-or$result.valuesRead-or$result.valuesExposed){throw'Hosted Secret inventory projection is invalid.'}
  $rejected=$false;try{&$script -ProjectRef 'bsjkohwbtrfwrqcyhsfz' -InventoryFile $missing|Out-Null}catch{$rejected=$_.Exception.Message-match'incomplete'}
  if(-not$rejected){throw'Missing hosted commercial Secret was not rejected.'}
  Write-Host 'FINANCE HOSTED COMMERCIAL SECRET INVENTORY CONTRACT: PASSED' -ForegroundColor Green
  Write-Host 'Five required names accepted; missing name rejected; values read/exposed: false.'
}finally{foreach($path in @($complete,$missing)){if(Test-Path -LiteralPath $path){Remove-Item -LiteralPath $path -Force}}}
