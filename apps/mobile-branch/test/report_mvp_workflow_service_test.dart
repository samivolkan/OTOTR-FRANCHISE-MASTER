import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/data/models/package_plan_model.dart';
import 'package:ototr_branch_app/data/models/report_mvp_workflow_model.dart';
import 'package:ototr_branch_app/data/models/report_template_model.dart';
import 'package:ototr_branch_app/data/models/user_profile_model.dart';
import 'package:ototr_branch_app/data/repositories/final_report_repository.dart';
import 'package:ototr_branch_app/data/repositories/report_template_repository.dart';
import 'package:ototr_branch_app/data/repositories/work_order_report_repository.dart';
import 'package:ototr_branch_app/data/services/final_report_builder.dart';
import 'package:ototr_branch_app/data/services/report_mvp_workflow_service.dart';
import 'package:ototr_branch_app/data/services/work_order_report_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    LocalWorkOrderReportRepository.instance.reset();
    LocalFinalReportRepository.instance.reset();
  });

  test('Rapor kapisi eksik nokta ve risk detaylarini item seviyesinde uretir',
      () async {
    final templateRepository = AssetReportTemplateRepository();
    final reportRepository = LocalWorkOrderReportRepository.instance;
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(isMechanicalReportGroup);
    final item = group.items.firstWhere(
      (item) => item.options.any(
        (option) => option.scoreType == ReportOptionScoreType.negative,
      ),
    );
    final riskOption = item.options.firstWhere(
      (option) => option.scoreType == ReportOptionScoreType.negative,
    );
    await _service(templateRepository, reportRepository).saveItemAnswer(
      workOrderId: _workOrderId,
      template: template,
      group: group,
      item: item,
      user: _technician,
      selectedOptionIds: [riskOption.id],
      inputValues: const {},
      description: '',
      imageUrls: const [],
      complete: false,
    );

    final details = const ReportMvpWorkflowService().calculateGateDetails(
      template: template,
      answers: await reportRepository.getAnswers(_workOrderId),
    );

    expect(details.status, ReportMvpGateStatus.riskNeedsManagerApproval);
    expect(details.summary.totalPoints, template.totalItems);
    expect(details.summary.riskFindings, 1);
    expect(
      details.issues.any(
        (issue) =>
            issue.itemId == item.id &&
            issue.issueCode == ReportMvpIssueCode.riskNeedsNote,
      ),
      isTrue,
    );
    expect(
      details.issues.any(
        (issue) => issue.issueCode == ReportMvpIssueCode.missingPoint,
      ),
      isTrue,
    );
  });

  test('Sube muduru hazir raporu onaylar, teknisyen kendi raporunu onaylayamaz',
      () {
    const workflow = ReportMvpWorkflowService();

    final managerDecision = workflow.approvalDecision(
      actor: _manager,
      reportBranchId: _manager.branchId,
      technicianUserId: _technician.id,
      gateReady: true,
      submitted: true,
    );
    final technicianDecision = workflow.approvalDecision(
      actor: _technician,
      reportBranchId: _technician.branchId,
      technicianUserId: _technician.id,
      gateReady: true,
      submitted: true,
    );

    expect(managerDecision.canApprove, isTrue);
    expect(managerDecision.nextState, ReportApprovalState.managerApproved);
    expect(technicianDecision.canApprove, isFalse);
  });

  test('PDF ve public payload musteriye acik alanlari uretir', () async {
    final templateRepository = AssetReportTemplateRepository();
    final reportRepository = LocalWorkOrderReportRepository.instance;
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(isMotorReportGroup);
    final item = group.items.firstWhere((item) => item.options.isNotEmpty);
    final option = item.options.firstWhere(
      (option) => option.scoreType == ReportOptionScoreType.positive,
    );
    await _service(templateRepository, reportRepository).saveItemAnswer(
      workOrderId: _workOrderId,
      template: template,
      group: group,
      item: item,
      user: _technician,
      selectedOptionIds: [option.id],
      inputValues: const {},
      description: 'Normal kontrol edildi.',
      imageUrls: const ['storage://report-media/wo/photo-1.jpg'],
      complete: true,
    );

    final draft = await FinalReportBuilder(
      templateRepository: templateRepository,
      reportRepository: reportRepository,
    ).build(_workOrderId);
    const workflow = ReportMvpWorkflowService();
    final pdf = workflow.pdfPayload(
      draft: draft,
      approvalState: ReportApprovalState.managerApproved,
      publicReportId: 'pub-1',
    );
    final publicPayload = workflow.publicVerificationPayload(
      draft: draft,
      publicReportId: 'pub-1',
      verificationTokenHash: 'hash-1',
    );
    final album = workflow.evidenceAlbum(draft);

    expect(pdf['qr'], isA<Map<String, Object?>>());
    expect(publicPayload['publicReportId'], 'pub-1');
    expect(album, hasLength(1));
    expect(album.first.mediaType, 'photo');
  });

  test('Paket gorunurlugu ve teslim durumlari sozlesmeye gore hesaplanir', () {
    const workflow = ReportMvpWorkflowService();
    final visibility = workflow.packageVisibility(PackageType.kaportaBoya);

    expect(visibility.visibleGroupCodes, contains('BODY_PAINT_CHECKUP'));
    expect(visibility.visibleGroupCodes, contains('EXTERIOR_CONDITION'));
    expect(visibility.visibleGroupCodes, isNot(contains('OBD_ECU_TEST')));
    expect(
      workflow.deliveryState(
        gateReady: true,
        approved: true,
        sent: false,
        viewed: false,
        failed: false,
      ),
      ReportDeliveryState.approvedForDelivery,
    );
  });

  test('Revizyon, audit, offline conflict ve release checklist uretilir',
      () async {
    final templateRepository = AssetReportTemplateRepository();
    final reportRepository = LocalWorkOrderReportRepository.instance;
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(
      (group) => group.items.any((item) => item.options.isNotEmpty),
    );
    final item = group.items.firstWhere((item) => item.options.isNotEmpty);
    final option = item.options.firstWhere(
      (option) => option.scoreType == ReportOptionScoreType.positive,
    );
    final now = DateTime(2026, 6, 3, 12);
    final local = _answer(
      template: template,
      group: group,
      item: item,
      option: option,
      updatedAt: now,
      status: ReportAnswerStatus.draft,
    );
    final server = _answer(
      template: template,
      group: group,
      item: item,
      option: option,
      updatedAt: now.add(const Duration(minutes: 1)),
      status: ReportAnswerStatus.completed,
    );
    await reportRepository.saveAnswer(server);
    final draft = await FinalReportBuilder(
      templateRepository: templateRepository,
      reportRepository: reportRepository,
    ).build(_workOrderId);
    final record = FinalReportRecord(
      id: 'fr-1',
      workOrderId: _workOrderId,
      templateId: template.id,
      revisionNo: 1,
      status: FinalReportStatus.locked,
      payload: draft.toPayload(),
      createdAt: now,
      lockedAt: now,
    );

    const workflow = ReportMvpWorkflowService();
    final conflict = workflow.offlineConflict(local: local, server: server);
    final audit = workflow.auditEvent(
      eventId: 'audit-1',
      workOrderId: _workOrderId,
      reportId: record.id,
      actor: _manager,
      eventType: 'managerApproved',
      entityType: 'finalReport',
      entityId: record.id,
      before: const {'state': 'submitted'},
      after: const {'state': 'approved'},
      createdAt: now,
    );
    final checklist = workflow.releaseChecklist(
      templateImportTests: true,
      reportEntryWidgetTests: true,
      riskGateTests: true,
      finalReportBuilderTests: true,
      rlsVerification: false,
      pdfPayloadReviewed: true,
      publicReportReviewed: true,
      managerApprovalReviewed: true,
      revisionPathReviewed: true,
      deliveryLogReviewed: true,
      noSecretsInClientOrLogs: true,
    );

    expect(
      workflow.revisionState(
        record: record,
        managerRequestedRevision: true,
        revisionSubmitted: false,
        revisionApproved: false,
      ),
      ReportRevisionState.revisionRequested,
    );
    expect(conflict?.conflictType, 'serverCompletedLocalDraft');
    expect(audit['actorUserId'], _manager.id);
    expect(checklist.isReleaseCandidate, isFalse);
    expect(
      checklist.missingGates,
      contains(ReportMvpReleaseGate.rlsVerification),
    );
    expect(
        workflow.stagingSmokeChecklist(), hasLength(greaterThanOrEqualTo(10)));
  });
}

const _workOrderId = 'wo-2026-0001';

const _technician = UserProfile(
  id: 'tech-ahmet',
  fullName: 'Ahmet Usta',
  email: 'ahmet.usta@ototr.test',
  phone: '0555 000 16 16',
  role: UserRole.inspectionTechnician,
  branchId: 'bursa-nilufer',
  isActive: true,
);

const _manager = UserProfile(
  id: 'manager-bursa',
  fullName: 'Bursa Mudur',
  email: 'manager@ototr.test',
  phone: '0555 000 00 00',
  role: UserRole.branchManager,
  branchId: 'bursa-nilufer',
  isActive: true,
);

WorkOrderReportService _service(
  AssetReportTemplateRepository templateRepository,
  WorkOrderReportRepository reportRepository,
) {
  return WorkOrderReportService(
    templateRepository: templateRepository,
    reportRepository: reportRepository,
  );
}

WorkOrderReportAnswer _answer({
  required ReportTemplate template,
  required ReportTemplateGroup group,
  required ReportTemplateItem item,
  required ReportTemplateOption option,
  required DateTime updatedAt,
  required ReportAnswerStatus status,
}) {
  return WorkOrderReportAnswer(
    id: '$_workOrderId-${item.id}',
    workOrderId: _workOrderId,
    templateId: template.id,
    groupId: group.id,
    itemId: item.id,
    noktaId: item.noktaId,
    selectedOptionIds: [option.id],
    selectedOptionLabels: [option.label],
    inputValues: const {},
    description: 'Kontrol edildi.',
    imageUrls: const [],
    status: status,
    answeredByUserId: _technician.id,
    answeredByRole: _technician.role.name,
    startedAt: updatedAt,
    completedAt: status == ReportAnswerStatus.completed ? updatedAt : null,
    updatedAt: updatedAt,
    lockedByUserId: _technician.id,
    lockedAt: updatedAt,
  );
}
