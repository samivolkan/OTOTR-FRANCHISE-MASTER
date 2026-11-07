[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidatePattern('^FIN-C(0[1-9]|1[0-2])$')][string]$QuestionId,
  [Parameter(Mandatory)][ValidateSet('EVET','HAYIR','YORUM')][string]$Response,
  [string]$Comment,
  [string]$QuestionnaireFile=(Join-Path $PSScriptRoot '..\docs\finance\commercial-decision-questionnaire.json')
)
$ErrorActionPreference='Stop'
$path=(Resolve-Path -LiteralPath $QuestionnaireFile).Path
$d=Get-Content -Raw -LiteralPath $path|ConvertFrom-Json -Depth 30
if($d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'FIN_G01_BUSINESS_DECISIONS'){throw'Unexpected questionnaire target.'}
$q=@($d.questions|Where-Object id -eq $QuestionId)
if($q.Count-ne 1){throw"Question not found or duplicated: $QuestionId"}
if($Response-eq'YORUM'-and[string]::IsNullOrWhiteSpace($Comment)){throw'YORUM requires a non-empty comment.'}
if($Response-ne'YORUM'-and-not[string]::IsNullOrWhiteSpace($Comment)){throw'Comment is accepted only when response is YORUM.'}
$q[0].response=$Response
$q[0].comment=if($Response-eq'YORUM'){$Comment.Trim()}else{$null}
$answered=@($d.questions|Where-Object{$null-ne$_.response}).Count
$d.status=if($answered-eq @($d.questions).Count){'RESPONSES_COMPLETE'}else{'PENDING_RESPONSES'}
$json=$d|ConvertTo-Json -Depth 30
$temp=Join-Path (Split-Path -Parent $path) ('.'+[System.IO.Path]::GetFileName($path)+'.'+[guid]::NewGuid().ToString('N')+'.tmp')
$backup=$temp+'.bak'
try{
  [System.IO.File]::WriteAllText($temp,$json+"`n",[System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::Replace($temp,$path,$backup)
}finally{
  if(Test-Path -LiteralPath $temp){Remove-Item -LiteralPath $temp -Force}
  if(Test-Path -LiteralPath $backup){Remove-Item -LiteralPath $backup -Force}
}
Write-Host "FINANCE COMMERCIAL DECISION RECORDED: $QuestionId=$Response; answers=$answered/$(@($d.questions).Count); status=$($d.status)"
