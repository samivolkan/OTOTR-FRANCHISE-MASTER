export type Session = {
  accessToken: string;
  refreshToken: string;
  email: string;
  expiresAt: number;
};

export type LiveVehicle = {
  plate: string;
  vin: string;
  brand: string;
  model: string;
  year: string;
  fuel: string;
  transmission: string;
  mileage: string;
};

export type LiveCustomer = {
  name: string;
  phone: string;
  role: string;
};

export type LiveTask = {
  id: string;
  caseId: string;
  key: string;
  title: string;
  role: string;
  status: string;
  reportFieldKey: string;
  estimatedMinutes: number;
  customerNote: string;
  riskyFindings: string;
  evidenceCount: number;
};

export type LiveEvidence = {
  id: string;
  caseId: string;
  taskId: string;
  title: string;
  url: string;
  required: boolean;
  qualityStatus: string;
};

export type LiveBodyInspectionAnswer = {
  part: string;
  state: string;
  micron: number;
};

export type LiveVehicleHistoryAlert = {
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | string;
  title: string;
  body: string;
  source?: string;
};

export type LiveWorkOrder = {
  id: string;
  caseId: string;
  workOrderNo: string;
  templateId?: string;
  status: string;
  openedAt: string;
  packageName: string;
  durationMinutes: number;
  customer: LiveCustomer;
  vehicle: LiveVehicle;
  tasks: LiveTask[];
  evidence: LiveEvidence[];
  acceptance?: {
    historyStatus: 'UNCHECKED' | 'CLEAR' | 'INFO' | 'WARNING' | 'CRITICAL' | string;
    historyText: string;
    alerts: LiveVehicleHistoryAlert[];
    crmMatch?: string;
    consentStatus?: string;
  };
  gates: {
    managerApproved: boolean;
    secretaryReady: boolean;
    paymentReady: boolean;
    kvkkReady: boolean;
  };
};

export type DashboardMetrics = {
  openOrders: number;
  completedTasks: number;
  waitingApproval: number;
  missingEvidence: number;
};
