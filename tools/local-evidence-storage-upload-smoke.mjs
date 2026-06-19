import { execFileSync } from "node:child_process";
import { getInspectionTaskKeyForModule } from "../ototr-mobile-app/src/services/inspectionModuleTaskMapping.js";

const managerEmail = "local.branch.manager.a@ototr.test";
const managerPassword = "LocalOnly-Branch-A-2026!";
const technicianEmail = "local.technician.a@ototr.test";
const technicianPassword = "LocalOnly-Tech-A-2026!";
const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

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
  return { response, body, text };
}

async function signIn(status, email, password) {
  const { response, body } = await requestJson(`${status.API_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: status.ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok || !body?.access_token) {
    throw new Error(`Sign-in failed for ${email}: HTTP ${response.status}`);
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
    throw new Error(`POST ${path} failed: HTTP ${response.status} ${JSON.stringify(body).slice(0, 260)}`);
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
    throw new Error(`GET ${path} failed: HTTP ${response.status} ${JSON.stringify(body).slice(0, 260)}`);
  }
  return body;
}

async function uploadStorageObject(status, token, objectPath, bytes) {
  const endpoint = `${status.API_URL}/storage/v1/object/ototr-evidence/${objectPath}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: status.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "image/png",
      "x-upsert": "false"
    },
    body: bytes
  });
  const text = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(`Storage upload failed: HTTP ${response.status} ${text.slice(0, 260)}`);
  }
  return text;
}

async function readStorageObject(status, token, objectPath) {
  const endpoint = `${status.API_URL}/storage/v1/object/ototr-evidence/${objectPath}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: status.ANON_KEY,
      Authorization: `Bearer ${token}`
    }
  });
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!response.ok) {
    throw new Error(`Storage read failed: HTTP ${response.status}`);
  }
  return bytes;
}

async function main() {
  const status = runSupabaseStatus();
  const managerToken = await signIn(status, managerEmail, managerPassword);
  console.log("PASS manager login for real evidence storage upload");
  const technicianToken = await signIn(status, technicianEmail, technicianPassword);
  console.log("PASS technician login for real evidence storage upload");

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const caseId = await authedPost(status, managerToken, "/rpc/create_branch_work_order", {
    customer_full_name: "Storage Upload Smoke Musteri",
    customer_phone: "+905550009900",
    customer_email: "storage-upload-smoke@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: `16 UP ${suffix.slice(-3)}`,
    vehicle_vin: `UPLSMOKE${suffix}`.slice(0, 17),
    vehicle_brand: "BMW",
    vehicle_model: "3 Serisi",
    vehicle_year: 2022,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 45200,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "Local evidence storage upload smoke",
    package_type: "STANDARD",
    work_order_notes: "Gercek Storage blob upload smoke"
  });
  console.log(`PASS branch work order created: ${caseId}`);

  await authedPost(status, technicianToken, "/rpc/transition_mobile_work_order_status", {
    target_case_id: caseId,
    next_status: "IN_PROGRESS",
    transition_reason: "Local evidence storage smoke technician start"
  });
  console.log("PASS technician started work order");

  const expectedTaskKey = getInspectionTaskKeyForModule("motor");
  const motorTasks = await authedGet(
    status,
    technicianToken,
    `/inspection_tasks?select=id,task_key,status&expertise_case_id=eq.${caseId}&task_key=eq.${expectedTaskKey}&limit=1`
  );
  const motorTask = Array.isArray(motorTasks) ? motorTasks[0] : null;
  if (!motorTask?.id) {
    throw new Error(`Expected generated motor task ${expectedTaskKey} before evidence upload smoke.`);
  }
  await authedPost(status, technicianToken, "/rpc/claim_inspection_task", {
    target_task_id: motorTask.id
  });
  console.log(`PASS technician claimed motor task: ${expectedTaskKey}`);

  const answer = await authedPost(status, technicianToken, "/rpc/save_mobile_inspection_item_value", {
    target_case_id: caseId,
    target_module_key: "motor",
    target_item_key: "motor_yag_kacagi",
    target_item_title: "Motor Yag Kacagi",
    target_selected_option_label: "Hasarli",
    target_input_values: { bolge: "Motor ust bolge" },
    target_description_text: "Riskli bulgu, gercek blob kaniti eklendi",
    target_ready_photo_count: 1,
    target_required_photo_count: 1
  });
  const saved = Array.isArray(answer) ? answer[0] : answer;
  if (saved?.result !== "RISKY") {
    throw new Error("Expected risky answer before evidence upload.");
  }
  console.log(`PASS mobile answer persisted: ${saved.id}`);

  const bytes = Buffer.from(tinyPngBase64, "base64");
  const objectPath = `work-orders/${caseId}/motor/yag-kacagi/${saved.id}-real-storage.png`;
  await uploadStorageObject(status, technicianToken, objectPath, bytes);
  console.log(`PASS real Storage blob uploaded: ototr-evidence/${objectPath}`);

  const metadata = await authedPost(status, technicianToken, "/rpc/register_inspection_evidence_upload", {
    target_case_id: caseId,
    target_task_id: null,
    target_item_value_id: saved.id,
    evidence_field_key: "motor_yag_kacagi",
    evidence_report_field_key: "report.section.engine.motor_yag_kacagi",
    evidence_title: "Motor Yag Kacagi Gercek Kanit",
    evidence_type: "IMAGE",
    storage_bucket_name: "ototr-evidence",
    storage_object_path: objectPath,
    content_type: "image/png",
    size_bytes: bytes.length,
    device_id: "local-storage-smoke",
    metadata: { source: "local-evidence-storage-upload-smoke", binaryUpload: true }
  });
  const evidenceAsset = Array.isArray(metadata) ? metadata[0] : metadata;
  if (!evidenceAsset?.id || evidenceAsset.sync_status !== "UPLOADED") {
    throw new Error(`Expected uploaded evidence metadata, got ${JSON.stringify(evidenceAsset).slice(0, 260)}`);
  }
  console.log(`PASS evidence metadata registered: ${evidenceAsset.id}`);

  const downloaded = await readStorageObject(status, technicianToken, objectPath);
  if (downloaded.length !== bytes.length) {
    throw new Error(`Downloaded evidence size mismatch: expected ${bytes.length}, got ${downloaded.length}`);
  }
  console.log(`PASS authenticated Storage read verified: ${downloaded.length} bytes`);
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
