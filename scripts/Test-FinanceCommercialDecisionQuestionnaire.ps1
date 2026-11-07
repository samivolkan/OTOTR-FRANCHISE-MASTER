[CmdletBinding()]
param([string]$QuestionnaireFile=(Join-Path $PSScriptRoot '..\docs\finance\commercial-decision-questionnaire.json'))
$ErrorActionPreference='Stop'
$d=Get-Content -Raw -LiteralPath (Resolve-Path $QuestionnaireFile)|ConvertFrom-Json -Depth 30
if($d.schemaVersion-ne 1-or$d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'FIN_G01_BUSINESS_DECISIONS'-or$d.status-notin@('PENDING_RESPONSES','RESPONSES_COMPLETE')-or$d.preProductionDecision-ne'NO_GO'){throw'Invalid FIN-G01 questionnaire identity.'}
if((@($d.allowedResponses)-join',')-ne'EVET,HAYIR,YORUM'-or-not$d.policy.noInferredCommercialValues-or-not$d.policy.commentRequiredForYorum-or-not$d.policy.taxAndAccountingApprovalSeparate){throw'FIN-G01 questionnaire policy is invalid.'}
$expected=1..11|ForEach-Object{'FIN-C{0:d2}'-f$_};if(@($d.questions).Count-ne 11-or(@($d.questions.id)-join',')-ne($expected-join',')){throw'FIN-G01 question inventory is incomplete.'}
foreach($q in $d.questions){if([string]::IsNullOrWhiteSpace($q.owner)-or[string]::IsNullOrWhiteSpace($q.family)-or[string]::IsNullOrWhiteSpace($q.question)-or[string]::IsNullOrWhiteSpace($q.yesEffect)-or[string]::IsNullOrWhiteSpace($q.noEffect)){throw"Incomplete question: $($q.id)"};if($null-ne$q.response-and$q.response-notin@($d.allowedResponses)){throw"Invalid response: $($q.id)"};if($q.response-eq'YORUM'-and[string]::IsNullOrWhiteSpace($q.comment)){throw"Comment required: $($q.id)"};if($q.response-ne'YORUM'-and-not[string]::IsNullOrWhiteSpace($q.comment)){throw"Comment only allowed with YORUM: $($q.id)"}}
$answered=@($d.questions|Where-Object{$null-ne$_.response}).Count;if($d.status-eq'RESPONSES_COMPLETE'-and$answered-ne 11){throw'Questionnaire cannot be complete with unanswered decisions.'};if($d.status-eq'PENDING_RESPONSES'-and$answered-eq 11){throw'Questionnaire status is stale.'};if(@($d.remainingAfterResponses).Count-lt 4){throw'Post-response approval work is incomplete.'}
Write-Host "FINANCE COMMERCIAL DECISION QUESTIONNAIRE: $($d.status)" -ForegroundColor $(if($answered-eq 11){'Green'}else{'Yellow'})
Write-Host "Answers: $answered/11; allowed: EVET/HAYIR/YORUM; inferred values: false; preProductionDecision: NO_GO"
