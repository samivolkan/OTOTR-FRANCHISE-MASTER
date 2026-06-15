export const mobileBusinessRules = Object.freeze({
  auth: {
    selfRegistration: false,
    socialLogin: false,
    technicianTypePicker: false,
    sourceOfUser: "bayi_portali"
  },
  workOrder: {
    startsWithEvidence: true,
    technicianApprovesFinalReport: false,
    finalTechnicianAction: "complete_work_order"
  },
  moduleOwnership: {
    singleEditorPerModule: true,
    managerCanTakeOver: false,
    technicianCanTransfer: true
  },
  reportGate: {
    blocksTechnicalApprovalWhenRequiredDataMissing: true
  },
  sync: {
    offlineQueuePlanned: true,
    explicitSyncErrors: true
  }
});
