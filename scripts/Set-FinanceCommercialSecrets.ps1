[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidatePattern('^[a-z]{20}$')][string]$ProjectRef,
  [switch]$ValidateOnly,
  [string]$CliVersion = '3.0.0'
)
$ErrorActionPreference = 'Stop'

$secretNames = @(
  'FINANCE_QUERY_TRAMER_TRY_AMOUNT',
  'FINANCE_QUERY_KM_TRY_AMOUNT',
  'FINANCE_QUERY_TRAMER_360_TRY_AMOUNT',
  'FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT'
)

function Get-RequiredDecimalSecret([string]$Name, [switch]$Percent) {
  $value = [Environment]::GetEnvironmentVariable($Name, 'Process')
  if ([string]::IsNullOrWhiteSpace($value) -or $value -notmatch '^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,8})?$') {
    throw "$Name must be provided as a positive decimal process environment variable."
  }
  $number = [decimal]::Parse($value, [Globalization.CultureInfo]::InvariantCulture)
  if ($number -le 0 -or ($Percent -and $number -ge 100)) { throw "$Name is outside its allowed range." }
  $value
}

$values = [ordered]@{}
foreach ($name in $secretNames) { $values[$name] = Get-RequiredDecimalSecret $name -Percent:($name -eq 'FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT') }
$result = [ordered]@{ projectRef = $ProjectRef; secretNames = $secretNames; valuesExposed = $false; validated = $true; applied = $false }
if ($ValidateOnly) { $result | ConvertTo-Json -Depth 4; return }

if ([string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)) { throw 'SUPABASE_ACCESS_TOKEN is required for hosted Secret changes.' }
$temporaryFile = [IO.Path]::Combine([IO.Path]::GetTempPath(), "ototr-finance-secrets-$([guid]::NewGuid().ToString('N')).env")
try {
  $lines = foreach ($name in $secretNames) { "$name=$($values[$name])" }
  [IO.File]::WriteAllLines($temporaryFile, $lines, [Text.UTF8Encoding]::new($false))
  $setOutput = & npx --yes "supabase@$CliVersion" secrets set --env-file $temporaryFile "--remote=$ProjectRef" --yes --output-format json 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Supabase rejected the commercial Secret update.' }
  $inventoryOutput = & npx --yes "supabase@$CliVersion" secrets list "--remote=$ProjectRef" --output-format json 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Supabase commercial Secret inventory verification failed.' }
  $inventory = $inventoryOutput | ConvertFrom-Json
  $availableNames = @($inventory | ForEach-Object { $_.name })
  $missing = @($secretNames | Where-Object { $_ -notin $availableNames })
  if ($missing.Count) { throw "Commercial Secret inventory is incomplete: $($missing -join ', ')" }
  $result.applied = $true
  $result['verifiedNameCount'] = $secretNames.Count
  $result | ConvertTo-Json -Depth 4
} finally {
  $values.Clear()
  if (Test-Path -LiteralPath $temporaryFile) { Remove-Item -LiteralPath $temporaryFile -Force }
}
