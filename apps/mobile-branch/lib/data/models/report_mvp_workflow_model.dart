import 'package_plan_model.dart';

enum ReportMvpGateStatus {
  ready,
  missingRequiredPoint,
  missingRequiredInput,
  missingRequiredEvidence,
  riskNeedsManagerApproval,
  lockedAfterPrint,
  revisionRequired,
}

enum ReportMvpIssueCode {
  missingPoint,
  draftPoint,
  missingInput,
  missingEvidence,
  riskNeedsNote,
  riskNeedsEvidence,
  lockedAfterPrint,
  revisionRequired,
}

enum ReportApprovalState {
  draftByTechnician,
  submittedForTechnicalApproval,
  managerApproved,
  managerRejected,
  revisionRequested,
  finalized,
}

enum ReportDeliveryState {
  notReady,
  readyForApproval,
  approvedForDelivery,
  sentToCustomer,
  customerViewed,
  deliveryFailed,
}

enum ReportRevisionState {
  finalized,
  revisionRequested,
  revisionOpen,
  revisionSubmitted,
  revisionApproved,
  superseded,
}

enum ReportMediaVisibility { internal, customer, publicReport }

enum ReportMvpReleaseGate {
  templateImportTests,
  reportEntryWidgetTests,
  riskGateTests,
  finalReportBuilderTests,
  rlsVerification,
  pdfPayloadReviewed,
  publicReportReviewed,
  managerApprovalReviewed,
  revisionPathReviewed,
  deliveryLogReviewed,
  noSecretsInClientOrLogs,
}

class ReportMvpGateIssue {
  const ReportMvpGateIssue({
    required this.groupCode,
    required this.groupTitle,
    required this.itemId,
    required this.noktaId,
    required this.itemTitle,
    required this.issueCode,
    required this.message,
    required this.requiredAction,
  });

  final String groupCode;
  final String groupTitle;
  final String itemId;
  final int noktaId;
  final String itemTitle;
  final ReportMvpIssueCode issueCode;
  final String message;
  final String requiredAction;
}

class ReportMvpGateSummary {
  const ReportMvpGateSummary({
    required this.totalPoints,
    required this.completedPoints,
    required this.missingPoints,
    required this.draftPoints,
    required this.riskFindings,
    required this.missingEvidence,
  });

  final int totalPoints;
  final int completedPoints;
  final int missingPoints;
  final int draftPoints;
  final int riskFindings;
  final int missingEvidence;
}

class ReportMvpGateDetails {
  const ReportMvpGateDetails({
    required this.status,
    required this.issues,
    required this.summary,
  });

  final ReportMvpGateStatus status;
  final List<ReportMvpGateIssue> issues;
  final ReportMvpGateSummary summary;

  bool get isReady => status == ReportMvpGateStatus.ready;
}

class ReportApprovalDecision {
  const ReportApprovalDecision({
    required this.canApprove,
    required this.nextState,
    required this.reason,
  });

  final bool canApprove;
  final ReportApprovalState nextState;
  final String reason;
}

class ReportMediaAlbumEntry {
  const ReportMediaAlbumEntry({
    required this.workOrderId,
    required this.groupCode,
    required this.itemId,
    required this.noktaId,
    required this.mediaType,
    required this.visibility,
    required this.storageReference,
    required this.caption,
  });

  final String workOrderId;
  final String groupCode;
  final String itemId;
  final int noktaId;
  final String mediaType;
  final ReportMediaVisibility visibility;
  final String storageReference;
  final String caption;
}

class ReportOfflineConflict {
  const ReportOfflineConflict({
    required this.itemId,
    required this.conflictType,
    required this.recommendedResolution,
  });

  final String itemId;
  final String conflictType;
  final String recommendedResolution;
}

class ReportTechnicianMetrics {
  const ReportTechnicianMetrics({
    required this.completedAnswerCount,
    required this.riskFindingCount,
    required this.riskNoteCompletenessPercent,
    required this.photoEvidenceCount,
  });

  final int completedAnswerCount;
  final int riskFindingCount;
  final int riskNoteCompletenessPercent;
  final int photoEvidenceCount;
}

class ReportReleaseChecklistResult {
  const ReportReleaseChecklistResult({
    required this.gates,
  });

  final Map<ReportMvpReleaseGate, bool> gates;

  bool get isReleaseCandidate => gates.values.every((value) => value);

  List<ReportMvpReleaseGate> get missingGates => [
        for (final entry in gates.entries)
          if (!entry.value) entry.key,
      ];
}

class ReportPackageVisibility {
  const ReportPackageVisibility({
    required this.packageType,
    required this.visibleGroupCodes,
  });

  final PackageType packageType;
  final Set<String> visibleGroupCodes;
}
