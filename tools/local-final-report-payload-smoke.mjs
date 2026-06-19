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

async function main() {
  const status = runSupabaseStatus();
  const managerToken = await signIn(status, accounts.manager);
  const technicianToken = await signIn(status, accounts.technician);
  console.log("PASS manager login for final report payload fixture setup");
  console.log("PASS technician login for final report payload RPC");

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const caseId = await authedPost(status, managerToken, "/rpc/create_branch_work_order", {
    customer_full_name: "Final Report Smoke Musteri",
    customer_phone: "+905550006677",
    customer_email: "final-report-smoke@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: `16 RPR ${suffix.slice(-3)}`,
    vehicle_vin: `RPRSMOKE${suffix}`.slice(0, 17),
    vehicle_brand: "BMW",
    vehicle_model: "3 Serisi",
    vehicle_year: 2022,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 45200,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "Local final report smoke",
    package_type: "STANDARD",
    work_order_notes: "Final rapor payload smoke"
  });
  console.log(`PASS created work order for final report smoke: ${caseId}`);

  await authedPost(status, technicianToken, "/rpc/transition_mobile_work_order_status", {
    target_case_id: caseId,
    next_status: "IN_PROGRESS",
    transition_reason: "Final report smoke start proof"
  });

  const motorTaskRows = await authedGet(
    status,
    technicianToken,
    "/inspection_tasks?select=id,task_key,status,owner_user_id&expertise_case_id=eq." + caseId + "&task_key=eq.MOTOR_CHECKUP&limit=1"
  );
  const motorTask = Array.isArray(motorTaskRows) ? motorTaskRows[0] : null;
  if (!motorTask?.id) {
    throw new Error(`Expected motor task for final report smoke, got ${JSON.stringify(motorTaskRows).slice(0, 240)}`);
  }

  const claimed = await authedPost(status, technicianToken, "/rpc/claim_inspection_task", {
    target_task_id: motorTask.id
  });
  const claimedTask = Array.isArray(claimed) ? claimed[0] : claimed;
  if (!claimedTask?.id || claimedTask.owner_user_id == null) {
    throw new Error(`Expected technician claim for final report smoke, got ${JSON.stringify(claimedTask).slice(0, 240)}`);
  }

  const answer = await authedPost(status, technicianToken, "/rpc/save_mobile_inspection_item_value", {
    target_case_id: caseId,
    target_module_key: "motor",
    target_item_key: "motor_yag_kacagi",
    target_item_title: "Motor Yağ Kaçağı",
    target_selected_option_label: "Hasarlı",
    target_input_values: { bolge: "Motor üst bölge" },
    target_description_text: "Riskli bulgu, kanıt eklendi",
    target_ready_photo_count: 1,
    target_required_photo_count: 1
  });
  const saved = Array.isArray(answer) ? answer[0] : answer;
  if (saved?.result !== "RISKY") {
    throw new Error("Expected risky answer for final report smoke.");
  }
  console.log(`PASS risky answer saved: ${saved.id}`);

  await authedPost(status, technicianToken, "/rpc/register_inspection_evidence_upload", {
    target_case_id: caseId,
    target_task_id: null,
    target_item_value_id: saved.id,
    evidence_field_key: "motor_yag_kacagi",
    evidence_report_field_key: "report.section.engine.motor_yag_kacagi",
    evidence_title: "Motor Yağ Kaçağı Kanıtı",
    evidence_type: "IMAGE",
    storage_bucket_name: "ototr-evidence",
    storage_object_path: `work-orders/${caseId}/motor/yag-kacagi/${saved.id}-final.png`,
    content_type: "image/png",
    size_bytes: 92,
    device_id: "local-smoke",
    metadata: { source: "local-final-report-smoke" }
  });
  console.log("PASS evidence metadata registered");

  const draftReport = await authedPost(status, technicianToken, "/rpc/generate_mobile_final_report", {
    target_case_id: caseId,
    lock_report: false
  });
  const draft = Array.isArray(draftReport) ? draftReport[0] : draftReport;
  if (draft?.status !== "DRAFT" || draft?.payload?.summary?.answerCount < 1 || draft?.payload?.summary?.evidenceCount < 1) {
    throw new Error(`Expected DRAFT final report payload, got ${JSON.stringify(draft).slice(0, 260)}`);
  }
  if (draft?.payload?.summary?.canSubmit !== false) {
    throw new Error(`Expected draft canSubmit false in metadata-only smoke, got ${JSON.stringify(draft).slice(0, 260)}`);
  }
  console.log(`PASS final report draft generated but not lockable yet: ${draft.id}`);
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
