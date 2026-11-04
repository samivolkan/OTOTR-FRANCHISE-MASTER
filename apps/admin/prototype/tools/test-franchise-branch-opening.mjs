import assert from 'node:assert/strict';

const application = {
  applicationNo: 'FR-DEMO-20261104-OSMANGAZI',
  applicant: { name: 'Sentetik Bursa Franchise Adayı', type: 'SYNTHETIC' },
  city: 'Bursa',
  district: 'Osmangazi',
  locationStatus: 'SEARCHING',
  currentStep: 'PRE_SCREENING',
  decisionStatus: 'IN_REVIEW',
  gates: {
    preScreening: false,
    financeReview: false,
    locationReview: false,
    legalReview: false,
    contractSigned: false,
    onboardingComplete: false,
    pilotUatPassed: false,
  },
};

const centralOrganization = [
  { code: 'LEGAL', name: 'Hukuk ve Uyum Merkezi', responsibilityCode: 'LEGAL_RESPONSIBLE', positionCode: 'CENTRAL_LEGAL_LEAD', title: 'Sorumlu Avukat', dbRoleMapping: 'ROLE_CATALOG_REVIEW_REQUIRED' },
  { code: 'ACCOUNTING', name: 'Muhasebe Merkezi', responsibilityCode: 'ACCOUNTING_RESPONSIBLE', positionCode: 'CENTRAL_ACCOUNTING_LEAD', title: 'Yeminli Müşavir', dbRoleMapping: 'PAYROLL_OPERATOR_PLUS_FINANCE_REVIEW' },
  { code: 'HR_OPERATIONS', name: 'İK Operasyon Merkezi', responsibilityCode: 'HR_OPERATIONS_RESPONSIBLE', positionCode: 'CENTRAL_HR_OPERATIONS_LEAD', title: 'İK Operasyon Sorumlusu', dbRoleMapping: 'HR_ADMIN' },
  { code: 'IT', name: 'Bilgi Teknolojileri Merkezi', responsibilityCode: 'IT_RESPONSIBLE', positionCode: 'CENTRAL_IT_LEAD', title: 'Bilgi Teknolojileri Sorumlusu', dbRoleMapping: 'ROLE_CATALOG_REVIEW_REQUIRED' },
];

const branch = {
  id: 'BR-BURSA-OSMANGAZI-DEMO',
  code: 'BURSA-OSM',
  name: 'OTOTR Bursa Osmangazi',
  city: 'Bursa',
  district: 'Osmangazi',
  status: 'PRE_OPENING',
  openingDate: '2026-12-01',
};

const staff = [
  { id: 'USR-OWNER-001', name: 'Sentetik Şube Sahibi', productRole: 'BRANCH_OWNER', dbRole: 'BRANCH_MANAGER', status: 'INVITED' },
  { id: 'USR-MANAGER-001', name: 'Sentetik Şube Müdürü', productRole: 'BRANCH_MANAGER', dbRole: 'BRANCH_MANAGER', status: 'INVITED' },
  { id: 'USR-BODY-001', name: 'Sentetik Kaporta Uzmanı 1', productRole: 'BODY_TECHNICIAN', dbRole: 'INSPECTION_TECHNICIAN', status: 'INVITED' },
  { id: 'USR-BODY-002', name: 'Sentetik Kaporta Uzmanı 2', productRole: 'BODY_TECHNICIAN', dbRole: 'INSPECTION_TECHNICIAN', status: 'INVITED' },
  // Product role is intentionally distinct; current DB role maps reception to branch scope.
  { id: 'USR-SECRETARY-001', name: 'Sentetik Sekreter', productRole: 'RECEPTION_STAFF', dbRole: 'BRANCH_MANAGER', status: 'INVITED' },
];

const onboardingItems = [
  ['FRANCHISE_CONTRACT', 'Franchise sözleşmesi imzalı'],
  ['TAX_CERTIFICATE', 'Vergi levhası doğrulandı'],
  ['TRADE_REGISTRY', 'Ticaret sicil belgesi doğrulandı'],
  ['SIGNBOARD_PERMIT', 'Tabela/işyeri ruhsatı doğrulandı'],
  ['INSURANCE', 'İşyeri ve sorumluluk sigortası doğrulandı'],
  ['CALIBRATION', 'Kaporta ölçüm ekipmanı kalibrasyon planı doğrulandı'],
  ['EQUIPMENT', 'İki kaporta çalışma istasyonu teslim edildi'],
  ['STAFF', 'Beş personel davet ve rol ataması tamamlandı'],
  ['ACADEMY', 'Şube sahibi, müdür, teknisyen ve sekreter eğitimleri tamamlandı'],
  ['TEST_WORK_ORDER', 'Sentetik test iş emri uçtan uca tamamlandı'],
];

function completeApplicationGate(key) {
  assert.equal(application.gates[key], false, `${key} gate must be completed once`);
  application.gates[key] = true;
}

function assertCanOpenProduction() {
  return Object.values(application.gates).every(Boolean) && application.privacyPolicyApproved === true;
}

// 1) Franchise başvurusu ve karar hattı.
completeApplicationGate('preScreening');
application.currentStep = 'FINANCE_REVIEW';
completeApplicationGate('financeReview');
application.currentStep = 'LOCATION_REVIEW';
completeApplicationGate('locationReview');
application.locationStatus = 'APPROVED';
application.currentStep = 'LEGAL_REVIEW';
completeApplicationGate('legalReview');
application.currentStep = 'CONTRACT';
completeApplicationGate('contractSigned');
application.decisionStatus = 'APPROVED';
application.currentStep = 'ONBOARDING';

// 2) Bursa Osmangazi şube kartı ve açılış checklist'i.
assert.equal(application.city, branch.city);
assert.equal(application.district, branch.district);
assert.equal(branch.status, 'PRE_OPENING');
const checklist = onboardingItems.map(([key, title]) => ({ key, title, status: 'PENDING', evidence: null }));
for (const item of checklist) {
  item.status = 'DONE';
  item.evidence = `SYNTHETIC-EVIDENCE-${item.key}`;
}
completeApplicationGate('onboardingComplete');

// 3) Şube kadrosu ve rol/şube kapsamı.
for (const person of staff) {
  person.branchId = branch.id;
  person.status = 'ACTIVE_PENDING_FIRST_LOGIN';
  assert.ok(person.dbRole, `${person.productRole} must map to an existing DB role`);
}
assert.equal(staff.length, 5);
assert.equal(staff.filter((person) => person.productRole === 'BODY_TECHNICIAN').length, 2);
assert.equal(staff.filter((person) => person.productRole === 'RECEPTION_STAFF').length, 1);
completeApplicationGate('pilotUatPassed');

// 4) Açılış güvenlik kapısı. KVKK/2. madde kapsam dışı olduğu için gerçek üretim açılışı bilinçli olarak bloke kalır.
application.privacyPolicyApproved = false;
branch.status = 'PILOT_READY_PRODUCTION_BLOCKED';
assert.equal(assertCanOpenProduction(), false);
assert.equal(branch.status, 'PILOT_READY_PRODUCTION_BLOCKED');
assert.equal(application.decisionStatus, 'APPROVED');
assert.equal(application.currentStep, 'ONBOARDING');

// 5) Merkez organizasyon: sorumlular sabit, alt kadrolar headcount ile genişletilebilir.
assert.equal(centralOrganization.length, 4);
assert.deepEqual(centralOrganization.map((unit) => unit.code), ['LEGAL', 'ACCOUNTING', 'HR_OPERATIONS', 'IT']);
for (const unit of centralOrganization) {
  unit.headcountLimit = 1;
  unit.childPositions = [];
  assert.ok(unit.responsibilityCode.endsWith('_RESPONSIBLE'));
}
centralOrganization.find((unit) => unit.code === 'LEGAL').childPositions.push({ code: 'LEGAL_SPECIALIST', title: 'Hukuk Uzmanı', headcountLimit: 5 });
centralOrganization.find((unit) => unit.code === 'ACCOUNTING').childPositions.push({ code: 'ACCOUNTING_SPECIALIST', title: 'Muhasebe Uzmanı', headcountLimit: 10 });
centralOrganization.find((unit) => unit.code === 'HR_OPERATIONS').childPositions.push({ code: 'HR_SPECIALIST', title: 'İK Uzmanı', headcountLimit: 10 });
centralOrganization.find((unit) => unit.code === 'IT').childPositions.push({ code: 'IT_SUPPORT', title: 'BT Destek Uzmanı', headcountLimit: 10 });

console.log(JSON.stringify({
  result: 'PASS',
  application: {
    applicationNo: application.applicationNo,
    status: application.decisionStatus,
    location: `${application.city}/${application.district}`,
    gatesCompleted: Object.values(application.gates).filter(Boolean).length,
    gatesTotal: Object.values(application.gates).length,
  },
  branch: {
    code: branch.code,
    name: branch.name,
    status: branch.status,
    openingDate: branch.openingDate,
  },
  staff: staff.map(({ name, productRole, dbRole, branchId, status }) => ({ name, productRole, dbRole, branchId, status })),
  centralOrganization: centralOrganization.map(({ code, name, responsibilityCode, positionCode, title, dbRoleMapping, childPositions }) => ({ code, name, responsibilityCode, positionCode, title, dbRoleMapping, childPositions })),
  productionGate: 'BLOCKED_UNTIL_PRIVACY_POLICY_APPROVED',
}, null, 2));
