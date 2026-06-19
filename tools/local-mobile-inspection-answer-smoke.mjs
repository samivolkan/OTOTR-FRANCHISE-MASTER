import { execFileSync } from "node:child_process";
import { getInspectionTaskKeyForModule } from "../ototr-mobile-app/src/services/inspectionModuleTaskMapping.js";

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
    throw new Error(`Sign-in failed: HTTP ${response.status}`);
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

async function main() {
  const status = runSupabaseStatus();
  const managerToken = await signIn(status, accounts.manager);
  console.log("PASS manager login for mobile inspection answer RPC");

  const technicianToken = await signIn(status, accounts.technician);
  console.log("PASS technician login for mobile inspection answer RPC");

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const plate = `16 ANS ${suffix.slice(-3)}`;
  const caseId = await authedPost(status, managerToken, "/rpc/create_branch_work_order", {
    customer_full_name: "Answer Smoke Musteri",
    customer_phone: "+905550004455",
    customer_email: "answer-smoke@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: plate,
    vehicle_vin: `ANSWERSMOKE${suffix}`.slice(0, 17),
    vehicle_brand: "BMW",
    vehicle_model: "3 Serisi",
    vehicle_year: 2022,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 45200,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "Local answer smoke",
    package_type: "STANDARD",
    work_order_notes: "Mobil test cevap kaydi smoke"
  });
  console.log(`PASS created work order for answer smoke: ${caseId}`);

  await authedPost(status, technicianToken, "/rpc/transition_mobile_work_order_status", {
    target_case_id: caseId,
    next_status: "IN_PROGRESS",
    transition_reason: "Local mobile answer smoke technician start"
  });
  console.log("PASS technician started work order for answer smoke");

  const expectedTaskKey = getInspectionTaskKeyForModule("motor");
  const motorTasks = await authedGet(
    status,
    technicianToken,
    `/inspection_tasks?select=id,task_key,status&expertise_case_id=eq.${caseId}&task_key=eq.${expectedTaskKey}&limit=1`
  );
  const motorTask = Array.isArray(motorTasks) ? motorTasks[0] : null;
  if (!motorTask?.id) {
    throw new Error(`Expected generated motor task ${expectedTaskKey} before answer smoke.`);
  }
  const claimedTask = await authedPost(status, technicianToken, "/rpc/claim_inspection_task", {
    target_task_id: motorTask.id
  });
  const claimed = Array.isArray(claimedTask) ? claimedTask[0] : claimedTask;
  if (!["OPEN", "ASSIGNED"].includes(claimed?.status) || !claimed?.owner_user_id) {
    throw new Error(`Expected motor task claim before answer smoke, got ${JSON.stringify(claimed).slice(0, 240)}`);
  }
  console.log(`PASS technician claimed motor task: ${expectedTaskKey}`);

  const answer = await authedPost(status, technicianToken, "/rpc/save_mobile_inspection_item_value", {
    target_case_id: caseId,
    target_module_key: "motor",
    target_item_key: "motor_yag_kontrolu",
    target_item_title: "Motor Yağ Kontrolü",
    target_selected_option_label: "Sorunsuz",
    target_input_values: { yag_seviyesi: "Normal" },
    target_description_text: "Local smoke test cevabı",
    target_ready_photo_count: 1,
    target_required_photo_count: 1
  });
  const saved = Array.isArray(answer) ? answer[0] : answer;
  if (!saved?.id || saved.result !== "NORMAL") {
    throw new Error(`Expected NORMAL inspection item value, got ${JSON.stringify(saved).slice(0, 240)}`);
  }
  console.log(`PASS mobile answer saved: ${saved.id} / ${saved.result}`);

  const rows = await authedGet(status, technicianToken, `/inspection_item_values?select=id,item_key,title,result,note,inspection_tasks(task_key)&expertise_case_id=eq.${caseId}`);
  if (!Array.isArray(rows) || rows.length !== 1 || rows[0].item_key !== "motor_yag_kontrolu") {
    throw new Error("Saved inspection item value was not visible through authenticated REST query.");
  }
  if (rows[0].inspection_tasks?.task_key !== expectedTaskKey) {
    throw new Error(`Mobile motor answer landed on wrong task key: ${rows[0].inspection_tasks?.task_key || "-"}`);
  }
  console.log(`PASS REST sees technician mobile answer on ERP task: ${rows[0].item_key} / ${rows[0].inspection_tasks?.task_key || "task"}`);
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
