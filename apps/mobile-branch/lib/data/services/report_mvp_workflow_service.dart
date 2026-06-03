import '../models/package_plan_model.dart';
import '../models/report_mvp_workflow_model.dart';
import '../models/report_template_model.dart';
import '../models/user_profile_model.dart';

class ReportMvpWorkflowService {
  const ReportMvpWorkflowService();

  ReportMvpGateDetails calculateGateDetails({
    required ReportTemplate template,
    required List<WorkOrderReportAnswer> answers,
    bool lockedAfterPrint = false,
    bool revisionRequired = false,
  }) {
    final answersByItem = {for (final answer in answers) answer.itemId: answer};
    final issues = <ReportMvpGateIssue>[];
    var completed = 0;
    var missing = 0;
    var draft = 0;
    var riskFindings = 0;
    var missingEvidence = 0;

    for (final group in template.groups) {
      for (final item in group.items) {
        final answer = answersByItem[item.id];
        if (answer == null) {
          missing += 1;
          issues.add(_issue(
            group: group,
            item: item,
            issueCode: ReportMvpIssueCode.missingPoint,
            message: '${item.title} noktasinda rapor girisi yok.',
            requiredAction: 'Usta bu noktayi tamamlamali.',
          ));
          continue;
        }

        if (answer.isCompleted) {
          completed += 1;
        } else {
          draft += 1;
          issues.add(_issue(
            group: group,
            item: item,
            issueCode: ReportMvpIssueCode.draftPoint,
            message: '${item.title} taslak durumda.',
            requiredAction: 'Taslak cevap tamamlanmali.',
          ));
        }

        for (final input in item.inputFields) {
          final value = answer.inputValues[input.id]?.trim() ?? '';
          if ((input.required || item.inputFields.length == 1) &&
              value.isEmpty) {
            issues.add(_issue(
              group: group,
              item: item,
              issueCode: ReportMvpIssueCode.missingInput,
              message: '${item.title} icin olcum/veri eksik.',
              requiredAction: 'Zorunlu olcum/veri alani doldurulmali.',
            ));
          }
        }

        if (item.requiredImageCount > 0 &&
            answer.imageUrls.length < item.requiredImageCount) {
          missingEvidence += 1;
          issues.add(_issue(
            group: group,
            item: item,
            issueCode: ReportMvpIssueCode.missingEvidence,
            message: '${item.title} icin zorunlu kanit eksik.',
            requiredAction: 'Gerekli fotograf veya cikti eklenmeli.',
          ));
        }

        final hasRisk = _answerHasRiskSelection(item, answer);
        if (hasRisk) {
          riskFindings += 1;
          if (answer.description.trim().isEmpty) {
            issues.add(_issue(
              group: group,
              item: item,
              issueCode: ReportMvpIssueCode.riskNeedsNote,
              message: '${item.title} riskli bulgu notu eksik.',
              requiredAction: 'Musteri dostu risk notu girilmeli.',
            ));
          }
          if (item.hasImages && answer.imageUrls.isEmpty) {
            missingEvidence += 1;
            issues.add(_issue(
              group: group,
              item: item,
              issueCode: ReportMvpIssueCode.riskNeedsEvidence,
              message: '${item.title} riskli bulgu kaniti eksik.',
              requiredAction: 'Riskli bulgu fotografla kanitlanmali.',
            ));
          }
        }
      }
    }

    if (lockedAfterPrint) {
      final firstGroup = template.groups.first;
      final firstItem = firstGroup.items.first;
      issues.add(_issue(
        group: firstGroup,
        item: firstItem,
        issueCode: ReportMvpIssueCode.lockedAfterPrint,
        message: 'Rapor basildiktan sonra dogrudan duzenlenemez.',
        requiredAction: 'Yonetici revizyon talebi acilmali.',
      ));
    }

    if (revisionRequired) {
      final firstGroup = template.groups.first;
      final firstItem = firstGroup.items.first;
      issues.add(_issue(
        group: firstGroup,
        item: firstItem,
        issueCode: ReportMvpIssueCode.revisionRequired,
        message: 'Rapor revizyon bekliyor.',
        requiredAction: 'Revizyon maddeleri tamamlanip tekrar onaya sunulmali.',
      ));
    }

    return ReportMvpGateDetails(
      status: _statusFor(
        issues: issues,
        lockedAfterPrint: lockedAfterPrint,
        revisionRequired: revisionRequired,
      ),
      issues: issues,
      summary: ReportMvpGateSummary(
        totalPoints: template.totalItems,
        completedPoints: completed,
        missingPoints: missing,
        draftPoints: draft,
        riskFindings: riskFindings,
        missingEvidence: missingEvidence,
      ),
    );
  }

  ReportApprovalDecision approvalDecision({
    required UserProfile actor,
    required String reportBranchId,
    required String technicianUserId,
    required bool gateReady,
    required bool submitted,
  }) {
    if (!submitted) {
      return const ReportApprovalDecision(
        canApprove: false,
        nextState: ReportApprovalState.draftByTechnician,
        reason: 'Rapor teknik onaya gonderilmedi.',
      );
    }
    if (!gateReady) {
      return const ReportApprovalDecision(
        canApprove: false,
        nextState: ReportApprovalState.submittedForTechnicalApproval,
        reason: 'Rapor kapisi hazir degil.',
      );
    }
    if (actor.id == technicianUserId) {
      return const ReportApprovalDecision(
        canApprove: false,
        nextState: ReportApprovalState.submittedForTechnicalApproval,
        reason: 'Teknisyen kendi final raporunu onaylayamaz.',
      );
    }
    final canApprove = actor.role == UserRole.headquartersAuditor ||
        (actor.role == UserRole.branchManager &&
            actor.branchId == reportBranchId);
    return ReportApprovalDecision(
      canApprove: canApprove,
      nextState: canApprove
          ? ReportApprovalState.managerApproved
          : ReportApprovalState.submittedForTechnicalApproval,
      reason: canApprove
          ? 'Teknik onay verilebilir.'
          : 'Bu kullanici raporu onaylayamaz.',
    );
  }

  Map<String, Object?> pdfPayload({
    required FinalReportDraft draft,
    required ReportApprovalState approvalState,
    required String publicReportId,
  }) {
    final payload = draft.toPayload();
    return {
      'reportIdentity': {
        'workOrderId': draft.workOrderId,
        'templateId': draft.templateId,
        'generatedAt': draft.createdAt.toIso8601String(),
      },
      'approvalState': approvalState.name,
      'qr': {
        'publicReportId': publicReportId,
        'verificationPath': '/report/$publicReportId',
      },
      'payload': payload,
    };
  }

  Map<String, Object?> publicVerificationPayload({
    required FinalReportDraft draft,
    required String publicReportId,
    required String verificationTokenHash,
  }) {
    return {
      'publicReportId': publicReportId,
      'verificationTokenHash': verificationTokenHash,
      'reportVersion': 1,
      'finalizedAt': draft.createdAt.toIso8601String(),
      'publicSections': [
        for (final section in draft.sections)
          {
            'groupCode': section.group.code,
            'groupTitle': section.group.title,
            'rows': [
              for (final row in section.rows)
                if (!_isInternalOnly(row.item))
                  {
                    'noktaId': row.item.noktaId,
                    'title': row.item.title,
                    'selectedOptionLabels': row.answer.selectedOptionLabels,
                    'inputValues': row.answer.inputValues,
                    'description': row.answer.description,
                    'evidenceCount': row.answer.imageUrls.length,
                  },
            ],
          },
      ],
    };
  }

  List<ReportMediaAlbumEntry> evidenceAlbum(FinalReportDraft draft) {
    return [
      for (final section in draft.sections)
        for (final row in section.rows)
          for (final imageUrl in row.answer.imageUrls)
            ReportMediaAlbumEntry(
              workOrderId: draft.workOrderId,
              groupCode: section.group.code,
              itemId: row.item.id,
              noktaId: row.item.noktaId,
              mediaType: _mediaTypeFor(section.group.code),
              visibility: _answerHasRiskSelection(row.item, row.answer)
                  ? ReportMediaVisibility.customer
                  : ReportMediaVisibility.internal,
              storageReference: imageUrl,
              caption: row.item.title,
            ),
    ];
  }

  ReportRevisionState revisionState({
    required FinalReportRecord record,
    required bool managerRequestedRevision,
    required bool revisionSubmitted,
    required bool revisionApproved,
  }) {
    if (!record.isLocked) {
      return ReportRevisionState.revisionOpen;
    }
    if (revisionApproved) {
      return ReportRevisionState.revisionApproved;
    }
    if (revisionSubmitted) {
      return ReportRevisionState.revisionSubmitted;
    }
    if (managerRequestedRevision) {
      return ReportRevisionState.revisionRequested;
    }
    return ReportRevisionState.finalized;
  }

  ReportPackageVisibility packageVisibility(PackageType packageType) {
    return ReportPackageVisibility(
      packageType: packageType,
      visibleGroupCodes: _groupCodesForPackage(packageType),
    );
  }

  ReportDeliveryState deliveryState({
    required bool gateReady,
    required bool approved,
    required bool sent,
    required bool viewed,
    required bool failed,
  }) {
    if (failed) {
      return ReportDeliveryState.deliveryFailed;
    }
    if (viewed) {
      return ReportDeliveryState.customerViewed;
    }
    if (sent) {
      return ReportDeliveryState.sentToCustomer;
    }
    if (approved) {
      return ReportDeliveryState.approvedForDelivery;
    }
    if (gateReady) {
      return ReportDeliveryState.readyForApproval;
    }
    return ReportDeliveryState.notReady;
  }

  Map<String, Object?> auditEvent({
    required String eventId,
    required String workOrderId,
    required String reportId,
    required UserProfile actor,
    required String eventType,
    required String entityType,
    required String entityId,
    required Map<String, Object?> before,
    required Map<String, Object?> after,
    required DateTime createdAt,
  }) {
    return {
      'eventId': eventId,
      'workOrderId': workOrderId,
      'reportId': reportId,
      'actorUserId': actor.id,
      'actorRole': actor.role.name,
      'eventType': eventType,
      'entityType': entityType,
      'entityId': entityId,
      'before': before,
      'after': after,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  ReportTechnicianMetrics technicianMetrics(
    List<WorkOrderReportAnswer> answers,
    ReportTemplate template,
  ) {
    final itemsById = {for (final item in template.allItems) item.id: item};
    var riskFindings = 0;
    var riskNotes = 0;
    var photoEvidence = 0;

    for (final answer in answers) {
      final item = itemsById[answer.itemId];
      if (item == null) {
        continue;
      }
      if (_answerHasRiskSelection(item, answer)) {
        riskFindings += 1;
        if (answer.description.trim().isNotEmpty) {
          riskNotes += 1;
        }
      }
      photoEvidence += answer.imageUrls.length;
    }

    return ReportTechnicianMetrics(
      completedAnswerCount:
          answers.where((answer) => answer.isCompleted).length,
      riskFindingCount: riskFindings,
      riskNoteCompletenessPercent:
          riskFindings == 0 ? 100 : ((riskNotes / riskFindings) * 100).round(),
      photoEvidenceCount: photoEvidence,
    );
  }

  ReportOfflineConflict? offlineConflict({
    required WorkOrderReportAnswer local,
    required WorkOrderReportAnswer server,
  }) {
    if (!server.updatedAt.isAfter(local.updatedAt)) {
      return null;
    }
    if (server.isCompleted && !local.isCompleted) {
      return ReportOfflineConflict(
        itemId: local.itemId,
        conflictType: 'serverCompletedLocalDraft',
        recommendedResolution:
            'Sunucudaki tamamlanmis cevap korunmali; lokal taslak yonetici incelemesine alinmali.',
      );
    }
    if (!_stringListsEqual(local.selectedOptionIds, server.selectedOptionIds) ||
        local.description != server.description ||
        local.imageUrls.length != server.imageUrls.length) {
      return ReportOfflineConflict(
        itemId: local.itemId,
        conflictType: 'answerChangedOnBothSides',
        recommendedResolution:
            'Usta ve sunucu cevaplari karsilastirilip tek cevap secilmeli.',
      );
    }
    return null;
  }

  ReportReleaseChecklistResult releaseChecklist({
    required bool templateImportTests,
    required bool reportEntryWidgetTests,
    required bool riskGateTests,
    required bool finalReportBuilderTests,
    required bool rlsVerification,
    required bool pdfPayloadReviewed,
    required bool publicReportReviewed,
    required bool managerApprovalReviewed,
    required bool revisionPathReviewed,
    required bool deliveryLogReviewed,
    required bool noSecretsInClientOrLogs,
  }) {
    return ReportReleaseChecklistResult(
      gates: {
        ReportMvpReleaseGate.templateImportTests: templateImportTests,
        ReportMvpReleaseGate.reportEntryWidgetTests: reportEntryWidgetTests,
        ReportMvpReleaseGate.riskGateTests: riskGateTests,
        ReportMvpReleaseGate.finalReportBuilderTests: finalReportBuilderTests,
        ReportMvpReleaseGate.rlsVerification: rlsVerification,
        ReportMvpReleaseGate.pdfPayloadReviewed: pdfPayloadReviewed,
        ReportMvpReleaseGate.publicReportReviewed: publicReportReviewed,
        ReportMvpReleaseGate.managerApprovalReviewed: managerApprovalReviewed,
        ReportMvpReleaseGate.revisionPathReviewed: revisionPathReviewed,
        ReportMvpReleaseGate.deliveryLogReviewed: deliveryLogReviewed,
        ReportMvpReleaseGate.noSecretsInClientOrLogs: noSecretsInClientOrLogs,
      },
    );
  }

  List<String> stagingSmokeChecklist() {
    return const [
      'load active template',
      'create or select staging work order',
      'complete body paint group',
      'complete motor group',
      'complete mechanical group',
      'complete OBD/Airbag/test groups',
      'upload sample evidence',
      'calculate report gate',
      'submit for manager approval',
      'approve final report',
      'generate PDF/public payload',
      'publish staging public verification',
    ];
  }

  ReportMvpGateIssue _issue({
    required ReportTemplateGroup group,
    required ReportTemplateItem item,
    required ReportMvpIssueCode issueCode,
    required String message,
    required String requiredAction,
  }) {
    return ReportMvpGateIssue(
      groupCode: group.code,
      groupTitle: group.title,
      itemId: item.id,
      noktaId: item.noktaId,
      itemTitle: item.title,
      issueCode: issueCode,
      message: message,
      requiredAction: requiredAction,
    );
  }

  ReportMvpGateStatus _statusFor({
    required List<ReportMvpGateIssue> issues,
    required bool lockedAfterPrint,
    required bool revisionRequired,
  }) {
    if (lockedAfterPrint) {
      return ReportMvpGateStatus.lockedAfterPrint;
    }
    if (revisionRequired) {
      return ReportMvpGateStatus.revisionRequired;
    }
    if (issues.any(
      (issue) => issue.issueCode == ReportMvpIssueCode.riskNeedsNote,
    )) {
      return ReportMvpGateStatus.riskNeedsManagerApproval;
    }
    if (issues.any(
      (issue) => issue.issueCode == ReportMvpIssueCode.missingEvidence,
    )) {
      return ReportMvpGateStatus.missingRequiredEvidence;
    }
    if (issues.any(
      (issue) => issue.issueCode == ReportMvpIssueCode.missingInput,
    )) {
      return ReportMvpGateStatus.missingRequiredInput;
    }
    if (issues.isNotEmpty) {
      return ReportMvpGateStatus.missingRequiredPoint;
    }
    return ReportMvpGateStatus.ready;
  }

  bool _answerHasRiskSelection(
    ReportTemplateItem item,
    WorkOrderReportAnswer answer,
  ) {
    final selectedIds = answer.selectedOptionIds.toSet();
    return item.options.any(
      (option) =>
          selectedIds.contains(option.id) &&
          option.scoreType == ReportOptionScoreType.negative,
    );
  }

  bool _isInternalOnly(ReportTemplateItem item) {
    final text = '${item.id} ${item.title}'.toLowerCase();
    return text.contains('kendinize') ||
        text.contains('testte_gorunmeyecekti') ||
        text.contains('internal');
  }

  bool _stringListsEqual(List<String> first, List<String> second) {
    if (first.length != second.length) {
      return false;
    }
    for (var index = 0; index < first.length; index += 1) {
      if (first[index] != second[index]) {
        return false;
      }
    }
    return true;
  }

  String _mediaTypeFor(String groupCode) {
    switch (groupCode) {
      case 'OBD_ECU_TEST':
        return 'obdOutput';
      case 'DYNO_ROAD_TEST':
        return 'dynoOutput';
      default:
        return 'photo';
    }
  }

  Set<String> _groupCodesForPackage(PackageType packageType) {
    switch (packageType) {
      case PackageType.mini:
      case PackageType.hizliKontrol:
        return {
          'MOTOR_CHECKUP',
          'MECHANICAL_CHECKUP',
          'BODY_PAINT_CHECKUP',
        };
      case PackageType.esnaf:
        return {
          'MOTOR_CHECKUP',
          'MECHANICAL_CHECKUP',
          'BODY_PAINT_CHECKUP',
          'OBD_ECU_TEST',
        };
      case PackageType.standard:
        return {
          'MOTOR_CHECKUP',
          'MECHANICAL_CHECKUP',
          'BODY_PAINT_CHECKUP',
          'BRAKE_SUSPENSION_TEST',
        };
      case PackageType.full:
        return {
          'MOTOR_CHECKUP',
          'MECHANICAL_CHECKUP',
          'BODY_PAINT_CHECKUP',
          'OBD_ECU_TEST',
          'BRAKE_SUSPENSION_TEST',
          'DYNO_ROAD_TEST',
          'AIRBAG_CHECK',
          'HEAD_GASKET_LEAK_TEST',
        };
      case PackageType.premium:
      case PackageType.corporate:
        return {
          'WORK_ORDER_ACCEPTANCE',
          'VEHICLE_FILE_CHECK',
          'MOTOR_CHECKUP',
          'MECHANICAL_CHECKUP',
          'BODY_PAINT_CHECKUP',
          'OBD_ECU_TEST',
          'BRAKE_SUSPENSION_TEST',
          'DYNO_ROAD_TEST',
          'EXTERIOR_CONDITION',
          'INTERIOR_CHECKUP',
          'AIRBAG_CHECK',
          'HEAD_GASKET_LEAK_TEST',
        };
      case PackageType.kaportaBoya:
        return {
          'BODY_PAINT_CHECKUP',
          'EXTERIOR_CONDITION',
        };
      case PackageType.mekanik:
        return {
          'MOTOR_CHECKUP',
          'MECHANICAL_CHECKUP',
          'OBD_ECU_TEST',
          'BRAKE_SUSPENSION_TEST',
        };
    }
  }
}
