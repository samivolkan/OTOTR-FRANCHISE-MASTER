[CmdletBinding()]param()
$ErrorActionPreference='Stop'
$generator=Join-Path $PSScriptRoot 'Update-FinanceGithubStagingEnvironmentEvidence.ps1'
$root=Join-Path ([System.IO.Path]::GetTempPath()) ('ototr-finance-github-evidence-'+[guid]::NewGuid().ToString('N'));New-Item -ItemType Directory -Path $root|Out-Null
try{
  $secrets=Join-Path $root 'secrets.json';$environment=Join-Path $root 'environment.json';$policies=Join-Path $root 'policies.json';$evidence=Join-Path $root 'evidence.json'
  '{"secrets":[{"name":"OTOTR_FINANCE_UAT_PUBLISHABLE_KEY","value":"MUST_NOT_SURVIVE"},{"name":"UNRELATED_SECRET","value":"MUST_NOT_SURVIVE"}]}'|Set-Content -LiteralPath $secrets -Encoding utf8NoBOM
  '{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}'|Set-Content -LiteralPath $environment -Encoding utf8NoBOM
  '{"branch_policies":[{"type":"branch","name":"codex/gm-finans-release"}]}'|Set-Content -LiteralPath $policies -Encoding utf8NoBOM
  Copy-Item (Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-github-staging-environment.json') $evidence
  & $generator -EvidenceFile $evidence -SecretsJsonFile $secrets -EnvironmentJsonFile $environment -BranchPoliciesJsonFile $policies|Out-Null
  $raw=Get-Content -Raw -LiteralPath $evidence;if($raw-match'MUST_NOT_SURVIVE|UNRELATED_SECRET'){throw'Secret metadata refresh leaked an unapproved field.'}
  & (Join-Path $PSScriptRoot 'Test-FinanceGithubStagingEnvironment.ps1') -EvidenceFile $evidence|Out-Null
  Write-Host 'FINANCE GITHUB STAGING EVIDENCE REFRESH: PASSED' -ForegroundColor Green
  Write-Host 'Secret names only, branch restriction, missing-role inventory and atomic evidence replacement verified.'
}finally{Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue}
