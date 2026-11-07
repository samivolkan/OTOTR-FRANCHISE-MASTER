[CmdletBinding()]
param([string]$ApprovalFile=(Join-Path $PSScriptRoot '..\docs\finance\outbox-route-approval.json'))
$ErrorActionPreference='Stop'
$d=Get-Content -Raw -LiteralPath (Resolve-Path $ApprovalFile)|ConvertFrom-Json -Depth 30
if($d.schemaVersion-ne 1-or$d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'STAGING_OUTBOX_ROUTE_APPROVAL'-or$d.status-notin@('PENDING_APPROVAL','APPROVED')-or$d.productionDataAllowed-or$d.allowedProtocol-ne'HTTPS_ONLY'-or$d.preProductionDecision-ne'NO_GO'){throw'Invalid outbox route approval identity.'}
if($d.deliverySecret.name-ne'FINANCE_OUTBOX_DELIVERY_TOKEN'-or$d.routeConfigurationSecret.name-ne'FINANCE_OUTBOX_ROUTES'-or$d.deliverySecret.valueStoredInRepository-or$d.routeConfigurationSecret.valueStoredInRepository){throw'Outbox secret policy is unsafe.'}
$fields=@('topic','consumerSystem','endpointOrigin','payloadContractVersion','dataClassification','owner','retryOwner','approvedAtUtc')
if((@($d.requiredRouteFields)-join',')-ne($fields-join',')){throw'Outbox route field contract is incomplete.'}
$roles=@($d.requiredApprovals.role);if((@($roles)-join',')-ne'ERP Entegrasyon Lideri,Bilgi Güvenliği,Finans Operasyon'){throw'Outbox approval roles are incomplete.'}
$inventoryPath=Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')) $d.stagingTopicInventoryEvidence
$inventory=Get-Content -Raw -LiteralPath (Resolve-Path $inventoryPath)|ConvertFrom-Json -Depth 20
if($inventory.schemaVersion-ne 1-or$inventory.module-ne'OTOTR_FRANCHISE_FINANCE'-or$inventory.target-ne'ototr-staging'-or$inventory.projectRef-ne'bsjkohwbtrfwrqcyhsfz'-or$inventory.payloadsRead-or$inventory.productionDataUsed-or$inventory.status-ne'PENDING_ROUTE_APPROVAL'){throw'Invalid staging outbox topic inventory evidence.'}
$topicRows=@($inventory.topics);$eventCount=@($topicRows|ForEach-Object{$_.eventTypes}|Select-Object -Unique).Count;$messageCount=($topicRows|Measure-Object pendingMessages -Sum).Sum
if($topicRows.Count-ne 6-or$eventCount-ne 10-or$messageCount-ne 11-or$inventory.totals.pendingMessages-ne 11-or$inventory.totals.topics-ne 6-or$inventory.totals.eventTypes-ne 10){throw'Staging outbox topic inventory totals are inconsistent.'}
$options=@('SINGLE_ERP_ENDPOINT','DOMAIN_ENDPOINTS','NO_ENDPOINT_YET')
if($d.routeDecision.status-ne'PENDING'-or(@($d.routeDecision.allowedOptions)-join',')-ne($options-join',')-or$null-ne$d.routeDecision.selectedOption){throw'Outbox route decision must remain pending until the user selects an option.'}
foreach($route in @($d.routes)){foreach($field in $fields){if([string]::IsNullOrWhiteSpace([string]$route.$field)){throw"Incomplete outbox route field: $field"}};if(-not([uri]$route.endpointOrigin).Scheme.Equals('https',[StringComparison]::OrdinalIgnoreCase)){throw'Outbox route must use HTTPS.'};if(([uri]$route.endpointOrigin).PathAndQuery-ne'/'){throw'Only endpoint origin may be recorded in repository evidence.'}}
if($d.status-eq'APPROVED'){
  if(@($d.routes).Count-lt 1-or$d.deliverySecret.provisioningStatus-ne'CONFIGURED'-or$d.routeConfigurationSecret.provisioningStatus-ne'CONFIGURED'-or@($d.requiredApprovals|Where-Object status -ne 'APPROVED').Count){throw'Outbox route cannot be approved before route, secret provisioning and distinct approvals are complete.'}
}elseif(@($d.routes).Count-ne 0-or@($d.requiredApprovals|Where-Object status -ne 'PENDING').Count-ne 0){throw'Pending outbox approval must not imply a configured route or signature.'}
if(-not$d.deploymentPolicy.deployOnlyWhenApproved-or-not$d.deploymentPolicy.requireAtLeastOneRoute-or-not$d.deploymentPolicy.requireTokenFreeEvidence-or-not$d.deploymentPolicy.requireControlledAckRetryDeadLetterDrill){throw'Outbox deployment policy is incomplete.'}
$h=$d.predeploymentHardening
if($h.packageSha256-notmatch'^[a-f0-9]{64}$'-or$h.missingWorkerIdentityStatus-ne 401-or$h.invalidConfigurationStatus-ne 503-or-not$h.allRoutesValidatedBeforeMessageClaim-or$h.invalidRouteNetworkCalls-ne 0-or$h.personalDataOrSecretPayloadNetworkCalls-ne 0-or$h.malformedClaimOrMessageDeliveryCalls-ne 0-or-not$h.acknowledgementFailureRetryable-or$h.failurePersistenceUnavailableStatus-ne 503-or$h.unsafePayloadRetryable-or$h.unconfiguredTopicRetryable){throw'Outbox predeployment hardening evidence is incomplete.'}
Write-Host "FINANCE OUTBOX ROUTE APPROVAL: $($d.status)" -ForegroundColor $(if($d.status-eq'APPROVED'){'Green'}else{'Yellow'})
Write-Host "Routes: $(@($d.routes).Count); secrets in repository: false; preProductionDecision: NO_GO"
