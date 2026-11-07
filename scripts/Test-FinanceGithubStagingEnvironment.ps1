[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-github-staging-environment.json'))
$ErrorActionPreference='Stop'
$e=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 20
if($e.schemaVersion-ne 1-or$e.module-ne'OTOTR_FRANCHISE_FINANCE'-or$e.target-ne'GITHUB_STAGING_ENVIRONMENT'-or$e.repository-ne'samivolkan/OTOTR-FRANCHISE-MASTER'-or$e.environment-ne'ototr-staging'){throw'Invalid GitHub staging environment evidence.'}
if($e.productionDataUsed-or$e.hostedExecutionPerformed-or$e.preProductionDecision-ne'NO_GO'){throw'GitHub staging evidence must remain fail-closed.'}
if(-not$e.customBranchPolicies-or$e.protectedBranchesOnly-or(@($e.allowedDeploymentBranches)-join',')-ne'codex/gm-finans-release'){throw'GitHub staging deployment branch policy is unsafe.'}
$required=@('OTOTR_FINANCE_UAT_FINANCE_EMAIL','OTOTR_FINANCE_UAT_FINANCE_PASSWORD','OTOTR_FINANCE_UAT_BRANCH_MANAGER_EMAIL','OTOTR_FINANCE_UAT_BRANCH_MANAGER_PASSWORD','OTOTR_FINANCE_UAT_PUBLISHABLE_KEY')
if((@($e.requiredSecretNames)-join',')-ne($required-join',')-or$e.configuredSecretCount-ne 0){throw'GitHub staging UAT credential inventory changed; refresh evidence.'}
Write-Host 'FINANCE GITHUB STAGING ENVIRONMENT: ACTION_REQUIRED' -ForegroundColor Yellow
Write-Host 'Environment exists and is branch-restricted; five required values remain unconfigured; hosted execution not performed.'
