import { execFileSync } from "node:child_process";

const accounts = {
  manager: {
    email: "local.branch.manager.a@ototr.test",
    password: "LocalOnly-Branch-A-2026!"
  },
  technician: {
    email: "local.technician.a@ototr.test",
    password: "LocalOnly-Tech-A-2026!"
  }
};

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  });
}

function runSupabaseStatus() {
  const raw = run("cmd.exe", ["/d", "/s", "/c", "npx.cmd supabase status --output json"]);
  const jsonStart = raw.indexOf("{");
  if (jsonStart < 0) throw new Error("Supabase status did not return JSON.");
  return JSON.parse(raw.slice(jsonStart));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { response, body };
}

async function signIn(status, account) {
  const { response, body } = await requestJson(`${status.API_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: status.ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: account.email, password: account.password })
  });
  if (!response.ok || !body?.access_token) {
    throw new Error(`${account.email} sign-in failed: HTTP ${response.status}`);
  }
  return body.access_token;
}

async function authedPost(status, token, path, payload) {
  const { response, body } = await requestJson(`${status.REST_URL}${path}`, {
    method: "POST",
    headers: {
      apikey: status.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed: HTTP ${response.status} ${JSON.stringify(body).slice(0, 240)}`);
  }
  return body;
}

async function authedGet(status, token, path) {
  const { response, body } = await requestJson(`${status.REST_URL}${path}`, {
    headers: {
      apikey: status.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed: HTTP ${response.status} ${JSON.stringify(body).slice(0, 240)}`);
  }
  return body;
}

async function createWorkOrder(status, token) {
  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  return authedPost(status, token, "/rpc/create_branch_work_order", {
    customer_full_name: "Gate Smoke Musteri",
    customer_phone: "+905550005566",
    customer_email: "gate-smoke@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: `16 GATE ${suffix.slice(-2)}`,
    vehicle_vin: `GATESMOKE${suffix}`.slice(0, 17),
    vehicle_brand: "BMW",
    vehicle_model: "3 Serisi",
    vehicle_year: 2022,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 45200,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "Local gate smoke",
    package_type: "STANDARD",
    work_order_notes: "Teknik onay gate smoke"
  });
}

async function getGate(status, token, caseId) {
  return authedPost(status, token, "/rpc/get_mobile_technical_approval_gate", {
    target_case_id: caseId
  });
}

async function main() {
  const status = runSupabaseStatus();
  const managerToken = await signIn(status, accounts.manager);
  const technicianToken = await signIn(status, accounts.technician);
  console.log("PASS manager login for technical approval gate setup");
  console.log("PASS technician login for technical approval gate RPC");

  const caseId = await createWorkOrder(status, managerToken);
  console.log(`PASS created work order for gate smoke: ${caseId}`);

  const answer = await authedPost(status, technicianToken, "/rpc/transition_mobile_work_order_status", {
    target_case_id: caseId,
    next_status: "IN_PROGRESS",
    transition_reason: "Technical approval gate smoke start proof"
  });
  const transitioned = Array.isArray(answer) ? answer[0] : answer;
  if (transitioned?.status !== "TECHNICAL_ENTRY_OPEN") {
    throw new Error(`Expected TECHNICAL_ENTRY_OPEN before risky answer, got ${JSON.stringify(transitioned).slice(0, 240)}`);
  }

  const motorTaskRows = await authedGet(
    status,
    technicianToken,
    "/inspection_tasks?select=id,task_key,status,owner_user_id&expertise_case_id=eq." + caseId + "&task_key=eq.MOTOR_CHECKUP&limit=1"
  );
  const motorTask = Array.isArray(motorTaskRows) ? motorTaskRows[0] : motorTaskRows;
  if (!motorTask?.id) {
    throw new Error(`Expected available motor task before gate smoke answer, got ${JSON.stringify(motorTaskRows).slice(0, 240)}`);
  }

  const claimed = await authedPost(status, technicianToken, "/rpc/claim_inspection_task", {
    target_task_id: motorTask.id
  });
  const claimedTask = Array.isArray(claimed) ? claimed[0] : claimed;
  if (!claimedTask?.id || claimedTask?.owner_user_id == null || claimedTask?.status === "LOCKED") {
    throw new Error(`Expected technician claim before gate smoke answer, got ${JSON.stringify(claimedTask).slice(0, 240)}`);
  }

  const savedAnswer = await authedPost(status, technicianToken, "/rpc/save_mobile_inspection_item_value", {
    target_case_id: caseId,
    target_module_key: "motor",
    target_item_key: "motor_yag_kacagi",
    target_item_title: "Motor Yağ Kaçağı",
    target_selected_option_label: "Yağ Kaçağı Var",
    target_input_values: { bolge: "Motor üst bölge" },
    target_description_text: "Riskli bulgu, kanıt gerekli",
    target_ready_photo_count: 0,
    target_required_photo_count: 1
  });
  const saved = Array.isArray(savedAnswer) ? savedAnswer[0] : savedAnswer;
  if (saved?.result !== "RISKY") {
    throw new Error(`Expected risky answer before gate check, got ${JSON.stringify(saved).slice(0, 240)}`);
  }
  console.log(`PASS risky answer saved: ${saved.id}`);

  const blockedGate = await getGate(status, technicianToken, caseId);
  if (blockedGate?.canSubmit !== false || blockedGate?.missingEvidenceItemCount !== 1) {
    throw new Error(`Expected blocked gate with one missing required evidence, got ${JSON.stringify(blockedGate).slice(0, 240)}`);
  }
  console.log("PASS gate blocks technical approval without evidence");

  await authedPost(status, technicianToken, "/rpc/register_inspection_evidence_upload", {
    target_case_id: caseId,
    target_task_id: null,
    target_item_value_id: savedAnswer.id,
    evidence_field_key: "motor_yag_kacagi",
    evidence_report_field_key: "report.section.engine.motor_yag_kacagi",
    evidence_title: "Motor Yağ Kaçağı Kanıtı",
    evidence_type: "IMAGE",
    storage_bucket_name: "ototr-evidence",
    storage_object_path: `work-orders/${caseId}/motor/yag-kacagi/${saved.id}-evidence.png`,
    content_type: "image/png",
    size_bytes: 92,
    device_id: "local-smoke",
    metadata: { source: "local-gate-smoke" }
  });
  console.log("PASS evidence metadata registered");

  const readyGate = await getGate(status, technicianToken, caseId);
  const evidenceRows = await authedGet(
    status,
    technicianToken,
    `/inspection_evidence_assets?select=id,sync_status,storage_path&item_value_id=eq.${saved.id}`
  );
  if (!Array.isArray(evidenceRows) || !evidenceRows.length || evidenceRows[0]?.id == null) {
    throw new Error(`Expected inspection_evidence_assets metadata row after local evidence register, got ${JSON.stringify(evidenceRows).slice(0, 240)}`);
  }
  if (readyGate?.canSubmit !== false || !Array.isArray(readyGate?.blockers)) {
    throw new Error(`Expected gate to remain blocked in metadata-only mode, got ${JSON.stringify(readyGate).slice(0, 240)}`);
  }
  console.log(`PASS gate remains blocked in metadata-only mode (proof sync status: ${evidenceRows[0].sync_status || "PENDING"})`);
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
