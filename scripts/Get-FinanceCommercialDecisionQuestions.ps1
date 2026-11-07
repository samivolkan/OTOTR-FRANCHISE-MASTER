[CmdletBinding()]param([string]$QuestionnaireFile=(Join-Path $PSScriptRoot '..\docs\finance\commercial-decision-questionnaire.json'))
$d=Get-Content -Raw -LiteralPath (Resolve-Path $QuestionnaireFile)|ConvertFrom-Json -Depth 30
$d.questions|Where-Object{$null-eq$_.response}|ForEach-Object{"$($_.id) [$($_.family)] $($_.question)`n  EVET: $($_.yesEffect)`n  HAYIR: $($_.noEffect)`n  YORUM: Kendi kuralınızı yazın.`n"}
