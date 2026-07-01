export const mobileBusinessRules = Object.freeze({
  auth: {
    selfRegistration: false,
    socialLogin: false,
    technicianTypePicker: false,
    sourceOfUser: "bayi_portali"
  },
  workOrder: {
    startsWithEvidence: true,
    technicianApprovesFinalReport: true,
    finalTechnicianAction: "send_to_secretary"
  },
  moduleOwnership: {
    singleEditorPerModule: true,
    managerCanTakeOver: false,
    technicianCanTransfer: true
  },
  reportGate: {
    blocksTechnicalApprovalWhenRequiredDataMissing: false
  },
  sync: {
    offlineQueuePlanned: true,
    explicitSyncErrors: true
  }
});
