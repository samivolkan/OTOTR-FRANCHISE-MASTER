[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidatePattern('^[a-z]{20}$')][string]$ProjectRef,
  [string]$InventoryFile,
  [string]$CliVersion='3.0.0'
)
$ErrorActionPreference='Stop'
$required=@(
  'FINANCE_ROYALTY_DEFAULT_RATE_PERCENT',
  'FINANCE_QUERY_TRAMER_TRY_AMOUNT',
  'FINANCE_QUERY_KM_TRY_AMOUNT',
  'FINANCE_QUERY_TRAMER_360_TRY_AMOUNT',
  'FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT'
)
if($InventoryFile){
  $raw=Get-Content -Raw -LiteralPath (Resolve-Path $InventoryFile)
}else{
  if([string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)){throw'SUPABASE_ACCESS_TOKEN is required for hosted Secret inventory.'}
  $output=@(& npx --yes "supabase@$CliVersion" secrets list "--remote=$ProjectRef" --output-format json 2>$null)
  if($LASTEXITCODE-ne 0){throw'Supabase commercial Secret inventory read failed.'}
  $raw=$output-join"`n"
}
if($raw-match'(?i)"(?:value|secret|plaintext|content)"\s*:'){throw'Hosted Secret inventory contains a forbidden value-bearing field.'}
$parsed=$raw|ConvertFrom-Json -Depth 10
$items=if($parsed-is[Array]){@($parsed)}elseif($parsed.PSObject.Properties.Name-contains'secrets'){@($parsed.secrets)}else{@($parsed)}
$names=@($items|ForEach-Object{$_.name}|Where-Object{$_-is[string]}|Sort-Object -Unique)
$missing=@($required|Where-Object{$_-notin$names})
if($missing.Count){throw"Hosted commercial Secret inventory is incomplete: $($missing-join', ')"}
[ordered]@{projectRef=$ProjectRef;requiredNameCount=$required.Count;verifiedNameCount=$required.Count;valuesRead=$false;valuesExposed=$false;status='COMPLETE'}|ConvertTo-Json -Compress
