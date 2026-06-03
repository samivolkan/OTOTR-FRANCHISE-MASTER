# Report MVP Contracts 25-40

Status date: 2026-06-03

This document closes the report MVP planning contracts for roadmap items 25-40. It is local/design work only. No production Supabase, storage, PDF service or public endpoint change is applied here.

## 25. Report Gate Details

Gate input:

- `workOrderId`
- active report template id/version
- all report answers
- report media records
- final report draft status

Gate output:

- `status`: `ready`, `missingRequiredPoint`, `missingRequiredInput`, `missingRequiredEvidence`, `riskNeedsManagerApproval`, `lockedAfterPrint`, `revisionRequired`
- `issues[]`: `groupCode`, `groupTitle`, `itemId`, `noktaId`, `itemTitle`, `issueCode`, `message`, `requiredAction`
- `summary`: total points, completed points, missing points, draft points, risk findings, missing evidence

Required UI:

- Show issues grouped by report group.
- Each issue must deep-link to the report point entry sheet.
- Risk issues must show whether technician note and photo evidence are present.
- Final report button is disabled until blocking issues are resolved.

## 26. Manager Technical Approval

Approval states:

- `draftByTechnician`
- `submittedForTechnicalApproval`
- `managerApproved`
- `managerRejected`
- `revisionRequested`
- `finalized`

Approval actor rules:

- Technician can submit completed group.
- Branch manager or quality auditor can approve/reject.
- Technician cannot approve own final report.
- Rejection must include a manager note and affected `itemId` list.

Audit fields:

- `approvedByUserId`
- `approvedAt`
- `approvalNote`
- `revisionReason`
- `previousStatus`
- `nextStatus`

## 27. Customer Report Language

Customer report text rules:

- Use factual wording: finding, location, evidence, recommendation.
- Do not use purchase advice like "alınır/alınmaz".
- Internal-only questions must be excluded from customer report.
- Risk findings must be phrased as "kontrol/servis önerilir" unless legally reviewed otherwise.
- Technician private notes must stay internal unless explicitly marked customer-visible.

## 28. PDF Output Contract

PDF payload sections:

- report identity: report id, work order id, branch, generated timestamp
- vehicle identity: plate, VIN/chassis if available, make/model/year/km
- package and visible group list
- group summaries
- point rows with selected labels, measurements, customer note, evidence count
- body paint section table
- motor/mechanical/test section tables
- risk findings summary
- media appendix
- manager approval metadata
- QR verification block

PDF renderer rules:

- Server-side renderer only if private templates, signed URLs or storage credentials are needed.
- Client must not hold service-role keys.
- PDF source payload must be stored before render for audit/re-render.

## 29. QR / Public Verification

Public verification payload:

- `publicReportId`
- `verificationTokenHash`
- `reportVersion`
- `finalizedAt`
- `branchDisplayName`
- `vehiclePublicSummary`
- `publicSections[]`
- `pdfUrl` if published

Public route:

- `GET /report/:publicReportId`
- Token or signed route must reveal only customer-safe report fields.
- No raw customer phone, internal notes, technician private notes, audit rows or storage paths.

## 30. Evidence Photo Album Mapping

Album mapping:

- `workOrderId`
- `groupCode`
- `itemId`
- `noktaId`
- `mediaType`: `photo`, `pdf`, `scan`, `dynoOutput`, `obdOutput`
- `visibility`: `internal`, `customer`, `publicReport`
- `uploadStatus`
- `storageReference`
- `caption`

Rules:

- Risk findings require at least one customer-visible or manager-visible evidence record before final approval.
- Required output images for OBD/Dyno must be linked to their exact item id.
- Public report can show thumbnails only from approved media.

## 31. Report Revision Flow

Revision states:

- `finalized`
- `revisionRequested`
- `revisionOpen`
- `revisionSubmitted`
- `revisionApproved`
- `superseded`

Rules:

- Printed/finalized report cannot be edited directly.
- Manager or quality user opens revision with reason.
- Technician edits only selected affected points.
- New final report version supersedes previous version.
- Old version remains auditable and printable as historical copy.

## 32. Supabase RPC Contract Verification

Required RPCs:

- `get_active_report_template`
- `save_report_answer`
- `submit_report_group`
- `calculate_report_gate`
- `submit_report_for_manager_approval`
- `approve_final_report`
- `request_report_revision`
- `publish_public_report`

Verification:

- Run only in local/staging after explicit approval.
- Verify anon client cannot bypass RLS.
- Verify technician can mutate only assigned/claimed task answers.
- Verify manager can approve only own-branch reports unless HQ/quality role.

## 33. RLS Role Matrix Tests

Minimum scenarios:

- Technician reads assigned work order report.
- Technician cannot read other branch work order report.
- Technician cannot approve final report.
- Branch manager reads and approves own branch report.
- Branch manager cannot approve another branch report.
- Quality auditor reads gate issues and evidence.
- Public report user reads only published public fields.

## 34. Package-Based Point Visibility

Visibility input:

- package code
- group code
- item package availability map
- customer report visibility flag
- technician-only flag

Rules:

- Technician may see operationally required hidden/internal points.
- Customer report only shows points included in package and allowed for customer visibility.
- Package visibility must be calculated before report gate and final report preview.

## 35. Branch / Customer Delivery

Delivery states:

- `notReady`
- `readyForApproval`
- `approvedForDelivery`
- `sentToCustomer`
- `customerViewed`
- `deliveryFailed`

Channels:

- in-branch print
- WhatsApp/SMS link
- email PDF/link
- customer portal

Rules:

- Delivery requires manager approval.
- Delivery log records channel, recipient mask, sender user id and timestamp.
- Failed delivery can be retried without regenerating report version.

## 36. Audit Log Display

Audit event fields:

- `eventId`
- `workOrderId`
- `reportId`
- `actorUserId`
- `actorRole`
- `eventType`
- `entityType`
- `entityId`
- `before`
- `after`
- `createdAt`

UI rules:

- Manager/quality can see report audit timeline.
- Technician sees only own operational entries unless manager grants revision context.
- Public/customer report never exposes audit log.

## 37. Technician Quality Metrics

Metrics:

- completed group count
- average completion time
- missing evidence rate
- manager revision rate
- risk finding note completeness
- photo upload success rate
- report gate first-pass success rate

Rules:

- Metrics are branch/quality tools, not public report content.
- Individual metrics require manager/quality role.

## 38. Offline Sync Conflict Handling

Conflict rules:

- Last writer is not enough for report answers.
- If same item changed offline and server has newer completed answer, create conflict.
- Risk finding downgrade requires manager review.
- Photo upload references remain pending until confirmed uploaded.

Conflict output:

- `itemId`
- local answer snapshot
- server answer snapshot
- conflict type
- recommended resolution

## 39. Staging Smoke Test Workflow

Smoke test checklist:

- load active template
- create or use staging work order
- complete body paint, motor, mechanical and focused test group
- upload sample evidence
- calculate gate
- submit for manager approval
- approve final report
- generate preview payload
- publish public verification in staging only

No production smoke test may run without explicit approval.

## 40. Final Release Checklist

Release gates:

- all report template import tests pass
- report entry widget tests pass
- risk gate tests pass
- final report builder tests pass
- local/staging RLS verification complete
- PDF payload reviewed
- public report payload reviewed
- manager approval path reviewed
- revision path reviewed
- delivery log path reviewed
- no secrets in client or logs

The report MVP is release-candidate only after these checks pass in staging.
