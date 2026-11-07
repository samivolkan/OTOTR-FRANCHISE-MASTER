[CmdletBinding()]
param(
  [string]$Repository='samivolkan/OTOTR-FRANCHISE-MASTER',
  [string]$Environment='ototr-staging',
  [string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-github-staging-environment.json'),
  [string]$SecretsJsonFile,
  [string]$EnvironmentJsonFile,
  [string]$BranchPoliciesJsonFile
)
$ErrorActionPreference='Stop'
$readJson={param($file,$endpoint)if($file){Get-Content -Raw -LiteralPath (Resolve-Path $file)|ConvertFrom-Json -Depth 30}else{(& gh api $endpoint|Out-String)|ConvertFrom-Json -Depth 30}}
$secrets=&$readJson $SecretsJsonFile "repos/$Repository/environments/$Environment/secrets"
$environmentState=&$readJson $EnvironmentJsonFile "repos/$Repository/environments/$Environment"
$branchPolicies=&$readJson $BranchPoliciesJsonFile "repos/$Repository/environments/$Environment/deployment-branch-policies"
$required=@('OTOTR_FINANCE_UAT_FINANCE_EMAIL','OTOTR_FINANCE_UAT_FINANCE_PASSWORD','OTOTR_FINANCE_UAT_BRANCH_MANAGER_EMAIL','OTOTR_FINANCE_UAT_BRANCH_MANAGER_PASSWORD','OTOTR_FINANCE_UAT_PUBLISHABLE_KEY')
$configured=@($secrets.secrets.name|Where-Object{$_ -in $required}|Sort-Object)
$missing=@($required|Where-Object{$_ -notin $configured})
$allowed=@($branchPolicies.branch_policies|Where-Object type -eq 'branch'|Select-Object -ExpandProperty name|Sort-Object)
$d=[ordered]@{
  schemaVersion=1;module='OTOTR_FRANCHISE_FINANCE';target='GITHUB_STAGING_ENVIRONMENT';repository=$Repository;environment=$Environment
  observedAtUtc=[DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ');allowedDeploymentBranches=$allowed
  protectedBranchesOnly=[bool]$environmentState.deployment_branch_policy.protected_branches
  customBranchPolicies=[bool]$environmentState.deployment_branch_policy.custom_branch_policies
  configuredSecretCount=$configured.Count;configuredSecretNames=$configured;requiredSecretNames=$required;missingSecretNames=$missing
  productionDataUsed=$false;hostedExecutionPerformed=$false;preProductionDecision='NO_GO'
}
$path=[System.IO.Path]::GetFullPath($EvidenceFile);$temp=$path+'.'+[guid]::NewGuid().ToString('N')+'.tmp';$backup=$temp+'.bak'
try{[System.IO.File]::WriteAllText($temp,($d|ConvertTo-Json -Depth 20)+"`n",[System.Text.UTF8Encoding]::new($false));[System.IO.File]::Replace($temp,$path,$backup)}finally{Remove-Item -LiteralPath $temp,$backup -Force -ErrorAction SilentlyContinue}
Write-Host "FINANCE GITHUB STAGING EVIDENCE REFRESHED: configured=$($configured.Count)/$($required.Count); missing=$($missing.Count); valuesRead=false"
