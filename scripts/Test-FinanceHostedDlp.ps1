[CmdletBinding()]
param([string]$Url = 'https://samivolkan.github.io/Ototr/muhasebe-v2/')
$ErrorActionPreference = 'Stop'
function Test-Luhn([string]$Digits) {
  if ($Digits.Length -lt 13 -or $Digits.Length -gt 19 -or $Digits -match '^0+$') { return $false }
  $sum = 0; $parity = $Digits.Length % 2
  for ($i = 0; $i -lt $Digits.Length; $i++) {
    $digit = [int]::Parse($Digits[$i].ToString())
    if (($i % 2) -eq $parity) { $digit *= 2; if ($digit -gt 9) { $digit -= 9 } }
    $sum += $digit
  }
  return ($sum % 10) -eq 0
}
$base = [uri]$Url
$htmlResponse = Invoke-WebRequest -Uri ($base.AbsoluteUri + "?v=dlp-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())") -TimeoutSec 30
if ([int]$htmlResponse.StatusCode -ne 200) { throw 'Hosted finance page did not return HTTP 200.' }
$html = $htmlResponse.Content
$assets = @([regex]::Matches($html, '<(?:script|link)[^>]+(?:src|href)=["'']([^"'']+)["'']', 'IgnoreCase') |
  ForEach-Object { ([uri]::new($base, $_.Groups[1].Value)).AbsoluteUri } | Select-Object -Unique)
$documents = @([pscustomobject]@{Url=$base.AbsoluteUri;Content=$html})
foreach ($asset in $assets) { $documents += [pscustomobject]@{Url=$asset;Content=(Invoke-WebRequest -Uri $asset -TimeoutSec 30).Content} }
$secret = $jwt = $credential = $email = $validCard = 0; $bytes = 0
foreach ($document in $documents) {
  $content = [string]$document.Content; $bytes += [Text.Encoding]::UTF8.GetByteCount($content)
  $secret += [regex]::Matches($content, 'sb_secret_[A-Za-z0-9_-]{16,}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----').Count
  $jwt += [regex]::Matches($content, 'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}').Count
  $credential += [regex]::Matches($content, '(?i)(password|serviceRoleKey|accessToken|refreshToken)\s*[:=]\s*["''][^"'']{8,}["'']').Count
  $email += [regex]::Matches($content, '(?i)[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}').Count
  foreach ($candidate in [regex]::Matches($content, '(?<!\d)(?:\d[ -]?){13,19}(?!\d)')) {
    $digits = $candidate.Value -replace '\D',''; if (Test-Luhn $digits) { $validCard++ }
  }
}
if ($secret -or $jwt -or $credential -or $email -or $validCard) { throw "Hosted finance DLP violation: secret=$secret jwt=$jwt credential=$credential email=$email validCard=$validCard" }
Write-Host 'FINANCE HOSTED DLP: PASSED' -ForegroundColor Green
Write-Host "Documents: $($documents.Count); assets: $($assets.Count); bytes: $bytes; secret/JWT/credential/email/Luhn-card matches: 0"
