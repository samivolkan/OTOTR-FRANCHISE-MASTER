[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$source=Join-Path $PSScriptRoot '..\docs\finance\commercial-decision-questionnaire.json'
$setter=Join-Path $PSScriptRoot 'Set-FinanceCommercialDecisionResponse.ps1'
$validator=Join-Path $PSScriptRoot 'Test-FinanceCommercialDecisionQuestionnaire.ps1'
$temp=Join-Path ([System.IO.Path]::GetTempPath()) ('ototr-finance-decision-'+[guid]::NewGuid().ToString('N')+'.json')
Copy-Item -LiteralPath $source -Destination $temp
try{
  & $setter -QuestionId FIN-C01 -Response EVET -QuestionnaireFile $temp|Out-Null
  $d=Get-Content -Raw -LiteralPath $temp|ConvertFrom-Json -Depth 30
  if(($d.questions|Where-Object id -eq FIN-C01).response-ne'EVET'-or$d.status-ne'PENDING_RESPONSES'){throw'EVET response was not recorded safely.'}
  $rejected=$false;try{& $setter -QuestionId FIN-C02 -Response YORUM -QuestionnaireFile $temp|Out-Null}catch{$rejected=$true};if(-not$rejected){throw'Empty YORUM was accepted.'}
  & $setter -QuestionId FIN-C02 -Response YORUM -Comment 'Sözleşme bazında belirlenecek.' -QuestionnaireFile $temp|Out-Null
  foreach($id in 3..12|ForEach-Object{'FIN-C{0:d2}'-f$_}){& $setter -QuestionId $id -Response HAYIR -QuestionnaireFile $temp|Out-Null}
  & $validator -QuestionnaireFile $temp|Out-Null
  $d=Get-Content -Raw -LiteralPath $temp|ConvertFrom-Json -Depth 30
  if($d.status-ne'RESPONSES_COMPLETE'-or@($d.questions|Where-Object{$null-eq$_.response}).Count-ne 0){throw'Questionnaire did not close at 12/12.'}
  Write-Host 'FINANCE COMMERCIAL DECISION RESPONSE: PASSED' -ForegroundColor Green
  Write-Host 'EVET, HAYIR, required YORUM comment, atomic target update and 12/12 completion verified.'
}finally{Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue}
