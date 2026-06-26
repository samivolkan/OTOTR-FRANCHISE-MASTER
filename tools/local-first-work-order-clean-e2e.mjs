import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectionModuleMappings } from "../ototr-mobile-app/src/services/inspectionModuleTaskMapping.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const reportPath = join(repoRoot, "docs", "codex", "e2e-live-flow", "first-work-order-clean-e2e-last-run.json");
const moduleIdByTaskKey = new Map(
  Object.values(inspectionModuleMappings).map((mapping) => [mapping.backendTaskKey, mapping.mobileModuleId])
);

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
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  });
}

function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
    .replace(/sbp_[A-Za-z0-9_-]+/g, "[redacted-token]")
    .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[redacted-secret]")
    .replace(/sb_publishable_[A-Za-z0-9_-]+/g, "[redacted-publishable]");
}

function runSupabaseStatus() {
  const raw = run("cmd.exe", ["/d", "/s", "/c", "npx.cmd supabase status --output json"]);
  const jsonStart = raw.indexOf("{");
  if (jsonStart < 0) throw new Error("Supabase status did not return JSON.");
  const status = JSON.parse(raw.slice(jsonStart));
  if (!String(status.API_URL || "").startsWith("http://127.0.0.1:")) {
    throw new Error("This script only runs against local Supabase.");
  }
  return status;
}

function psql(sql) {
  return run("docker", [
    "exec",
    "-i",
    "supabase_db_ototr-local",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1"
  ], {
    input: sql,
    stdio: ["pipe", "pipe", "pipe"]
  });
}

function cleanLocalCases() {
  return psql(`
begin;

truncate table public.expertise_cases cascade;

commit;

select 'expertise_cases' as table_name, count(*)::int as count from public.expertise_cases
union all select 'final_reports', count(*)::int from public.final_reports
union all select 'work_order_report_answers', count(*)::int from public.work_order_report_answers
union all select 'inspection_item_values', count(*)::int from public.inspection_item_values
union all select 'inspection_tasks', count(*)::int from public.inspection_tasks;
`);
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
    throw new Error(`Sign-in failed for ${account.email}: HTTP ${response.status}`);
  }
  return body.access_token;
}

async function authedRequest(status, token, method, path, payload) {
  const { response, body } = await requestJson(`${status.REST_URL}${path}`, {
    method,
    headers: {
      apikey: status.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed: HTTP ${response.status} ${JSON.stringify(body).slice(0, 320)}`);
  }
  return body;
}

async function authedGet(status, token, path) {
  return authedRequest(status, token, "GET", path);
}

async function authedPost(status, token, path, payload) {
  return authedRequest(status, token, "POST", path, payload);
}

function findCase(rows, caseId) {
  return (Array.isArray(rows) ? rows : []).find((row) => row.expertise_case_id === caseId);
}

function firstRow(value) {
  return Array.isArray(value) ? value[0] : value;
}

async function main() {
  console.log("OTOTR local first work-order clean E2E");
  console.log("Scope: local-only clean start -> dealer work order -> technician input -> final report -> secretary print-ready");

  run("node", ["tools/local-role-session-smoke.mjs"]);
  console.log("PASS local auth and role fixtures ensured");

  const cleanOutput = cleanLocalCases();
  console.log("PASS local work-order/report history cleaned");
  console.log(redact(cleanOutput).trim());

  const status = runSupabaseStatus();
  const managerToken = await signIn(status, accounts.manager);
  console.log("PASS manager local login");

  const technicianToken = await signIn(status, accounts.technician);
  console.log("PASS technician local login");

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const plate = `16 ILK ${suffix.slice(-3)}`;
  const caseId = await authedPost(status, managerToken, "/rpc/create_branch_work_order", {
    customer_full_name: "İlk Lokal Test Müşteri",
    customer_phone: "+905550000001",
    customer_email: "ilk-lokal-test@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: plate,
    vehicle_vin: `ILKLOCAL${suffix}`.slice(0, 17),
    vehicle_brand: "BMW",
    vehicle_model: "3 Serisi",
    vehicle_year: 2022,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 45200,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "İlk lokal uçtan uca test",
    package_type: "STANDARD",
    work_order_notes: "Bayi portal -> usta -> rapor basım lokal ilk iş emri"
  });
  console.log(`PASS dealer/secretary created first work order: ${caseId}`);

  const createdRows = await authedGet(
    status,
    managerToken,
    `/expertise_cases?select=id,work_order_no,status,vehicles(plate,brand,model,mileage_km),package_plans(code,name,duration_minutes)&id=eq.${caseId}`
  );
  const created = firstRow(createdRows);
  if (!created?.id) throw new Error("Created work order is not visible to branch manager.");
  console.log(`PASS portal sees first work order: ${created.work_order_no} / ${created.vehicles?.plate}`);

  const mobileRows = await authedGet(
    status,
    technicianToken,
    `/expertise_cases?select=id,work_order_no,status,vehicles(plate,brand,model,mileage_km),package_plans(code,name,duration_minutes)&id=eq.${caseId}`
  );
  const mobile = firstRow(mobileRows);
  if (!mobile?.id) throw new Error("Technician cannot see the first work order.");
  console.log("PASS technician/mobile sees first work order");

  const startedCase = await authedPost(status, technicianToken, "/rpc/transition_mobile_work_order_status", {
    target_case_id: caseId,
    next_status: "IN_PROGRESS",
    transition_reason: "Local first work order start proof completed"
  });
  const started = firstRow(startedCase);
  if (started?.status !== "TECHNICAL_ENTRY_OPEN") {
    throw new Error(`Expected TECHNICAL_ENTRY_OPEN after technician start, got ${started?.status || "-"}`);
  }
  console.log("PASS technician started technical entry");

  const taskRows = await authedGet(
    status,
    technicianToken,
    `/inspection_tasks?select=id,task_key,title,status,report_field_key,expertise_case_id&expertise_case_id=eq.${caseId}&order=created_at.asc`
  );
  if (!Array.isArray(taskRows) || !taskRows.length) {
    throw new Error("First work order did not generate technician tasks.");
  }
  console.log(`PASS technician task list generated: ${taskRows.length}`);
  const lockedTasks = taskRows.filter((task) => task.status !== "AVAILABLE");
  if (lockedTasks.length) {
    throw new Error(`Expected all generated tasks to be AVAILABLE after start, locked: ${lockedTasks.map((task) => task.task_key).join(", ")}`);
  }

  const savedAnswers = [];
  for (const task of taskRows) {
    const moduleId = moduleIdByTaskKey.get(task.task_key);
    if (!moduleId) {
      throw new Error(`No mobile module mapping found for generated task: ${task.task_key}`);
    }
    const claimedTask = await authedPost(status, technicianToken, "/rpc/claim_inspection_task", {
      target_task_id: task.id
    });
    const claimed = firstRow(claimedTask);
    if (!claimed?.owner_user_id || claimed.status !== "OPEN") {
      throw new Error(`Expected technician to claim ${task.task_key}, got ${JSON.stringify(claimed).slice(0, 260)}`);
    }
    const itemKey = `${moduleId.replace(/-/g, "_")}_smoke_control`;
    const taskAnswer = await authedPost(status, technicianToken, "/rpc/save_mobile_inspection_item_value", {
      target_case_id: caseId,
      target_module_key: moduleId,
      target_item_key: itemKey,
      target_item_title: `${task.title} Kontrol Maddesi`,
      target_selected_option_label: "Sorunsuz",
      target_input_values: { durum: "Sorunsuz" },
      target_description_text: `${task.title} lokal E2E testinde tamamlandi.`,
      target_ready_photo_count: 1,
      target_required_photo_count: 1
    });
    const taskSaved = firstRow(taskAnswer);
    if (!taskSaved?.id || taskSaved.result !== "NORMAL") {
      throw new Error(`Expected NORMAL technician answer for ${task.task_key}, got ${JSON.stringify(taskSaved).slice(0, 260)}`);
    }
    savedAnswers.push({ ...taskSaved, taskKey: task.task_key, moduleId, itemKey, taskId: task.id });
    await authedPost(status, technicianToken, "/rpc/register_inspection_evidence_upload", {
      target_case_id: caseId,
      target_task_id: null,
      target_item_value_id: taskSaved.id,
      evidence_field_key: itemKey,
      evidence_report_field_key: `${task.report_field_key || "report.section.mobile"}.${itemKey}`,
      evidence_title: `${task.title} Kanıtı`,
      evidence_type: "IMAGE",
      storage_bucket_name: "report-media",
      storage_object_path: `work-orders/${caseId}/${moduleId}/smoke/${taskSaved.id}-first-local.png`,
      content_type: "image/png",
      size_bytes: 128,
      device_id: "local-first-work-order",
      metadata: { source: "local-first-work-order-clean-e2e", taskKey: task.task_key }
    });
  }
  console.log(`PASS technician entered all inspection values and evidence metadata: ${savedAnswers.length}/${taskRows.length}`);

  const answer = await authedPost(status, technicianToken, "/rpc/save_mobile_inspection_item_value", {
    target_case_id: caseId,
    target_module_key: "motor",
    target_item_key: "motor_yag_kacagi",
    target_item_title: "Motor Yağ Kaçağı",
    target_selected_option_label: "Hasarlı",
    target_input_values: { bolge: "Motor üst bölge" },
    target_description_text: "İlk lokal testte usta riskli bulgu girdi.",
    target_ready_photo_count: 1,
    target_required_photo_count: 1
  });
  const saved = firstRow(answer);
  if (saved?.result !== "RISKY") {
    throw new Error(`Expected technician risky answer, got ${JSON.stringify(saved).slice(0, 260)}`);
  }
  console.log(`PASS technician entered inspection value: ${saved.id}`);

  await authedPost(status, technicianToken, "/rpc/register_inspection_evidence_upload", {
    target_case_id: caseId,
    target_task_id: null,
    target_item_value_id: saved.id,
    evidence_field_key: "motor_yag_kacagi",
    evidence_report_field_key: "report.section.engine.motor_yag_kacagi",
    evidence_title: "Motor Yağ Kaçağı Kanıtı",
    evidence_type: "IMAGE",
    storage_bucket_name: "report-media",
    storage_object_path: `work-orders/${caseId}/motor/yag-kacagi/${saved.id}-first-local.png`,
    content_type: "image/png",
    size_bytes: 128,
    device_id: "local-first-work-order",
    metadata: { source: "local-first-work-order-clean-e2e" }
  });
  console.log("PASS technician evidence metadata registered");

  const lockedReport = await authedPost(status, technicianToken, "/rpc/generate_mobile_final_report", {
    target_case_id: caseId,
    lock_report: true
  });
  const locked = firstRow(lockedReport);
  if (locked?.status !== "LOCKED" || locked?.payload?.summary?.canSubmit !== true) {
    throw new Error(`Expected LOCKED final report, got ${JSON.stringify(locked).slice(0, 320)}`);
  }
  console.log(`PASS technician generated and locked final report: ${locked.id}`);

  const secretaryRows = await authedPost(status, managerToken, "/rpc/list_branch_work_orders_with_report_status", {
    limit_count: 25
  });
  const secretary = findCase(secretaryRows, caseId);
  if (!secretary || secretary.final_report_id !== locked.id || secretary.final_report_status !== "LOCKED") {
    throw new Error(`Secretary list does not show locked final report: ${JSON.stringify(secretary).slice(0, 320)}`);
  }
  if (secretary.case_status !== "COMPLETED" || secretary.can_submit !== true) {
    throw new Error(`Expected COMPLETED/can_submit true, got ${JSON.stringify(secretary).slice(0, 320)}`);
  }
  console.log("PASS secretary/portal sees print-ready locked final report");

  const finalCounts = psql(`
select 'expertise_cases' as table_name, count(*)::int as count from public.expertise_cases
union all select 'final_reports', count(*)::int from public.final_reports
union all select 'work_order_report_answers', count(*)::int from public.work_order_report_answers
union all select 'inspection_item_values', count(*)::int from public.inspection_item_values
union all select 'inspection_tasks', count(*)::int from public.inspection_tasks;
`);

  const summary = {
    status: "PASS",
    completedAt: new Date().toISOString(),
    localOnly: true,
    caseId,
    workOrderNo: created.work_order_no,
    plate,
    taskCount: taskRows.length,
    answerIds: [...savedAnswers.map((answerRow) => answerRow.id), saved.id],
    evidenceMetadataCount: savedAnswers.length + 1,
    finalReportId: locked.id,
    finalReportStatus: locked.status,
    secretaryCaseStatus: secretary.case_status,
    canSubmit: secretary.can_submit
  };

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(redact(finalCounts).trim());
  console.log(`PASS first work-order clean E2E completed. Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(`FAIL ${redact(error.message)}`);
  process.exit(1);
});
