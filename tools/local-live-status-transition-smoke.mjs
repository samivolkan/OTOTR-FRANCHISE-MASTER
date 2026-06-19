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

async function transition(status, token, caseId, nextStatus) {
  const result = await authedPost(status, token, "/rpc/transition_mobile_work_order_status", {
    target_case_id: caseId,
    next_status: nextStatus,
    transition_reason: `Local smoke ${nextStatus}`
  });
  const updated = Array.isArray(result) ? result[0] : result;
  if (!updated?.status) {
    throw new Error(`Transition ${nextStatus} did not return an updated case.`);
  }
  return updated.status;
}

async function main() {
  const status = runSupabaseStatus();
  const managerToken = await signIn(status, accounts.manager);
  console.log("PASS manager login for status transition setup");

  const technicianToken = await signIn(status, accounts.technician);
  console.log("PASS technician login for status transition RPC");

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const plate = `16 STAT ${suffix.slice(-2)}`;
  const caseId = await authedPost(status, managerToken, "/rpc/create_branch_work_order", {
    customer_full_name: "Status Smoke Musteri",
    customer_phone: "+905550003344",
    customer_email: "status-smoke@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: plate,
    vehicle_vin: `STATUSSMOKE${suffix}`.slice(0, 17),
    vehicle_brand: "BMW",
    vehicle_model: "3 Serisi",
    vehicle_year: 2022,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 45200,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "Local status smoke",
    package_type: "STANDARD",
    work_order_notes: "Mobil durum gecisi smoke"
  });
  console.log(`PASS created work order for status transition: ${caseId}`);

  const startedStatus = await transition(status, technicianToken, caseId, "IN_PROGRESS");
  if (startedStatus !== "TECHNICAL_ENTRY_OPEN") {
    throw new Error(`Expected TECHNICAL_ENTRY_OPEN, got ${startedStatus}`);
  }
  console.log("PASS transitioned to TECHNICAL_ENTRY_OPEN");

  const submittedStatus = await transition(status, technicianToken, caseId, "TECHNICAL_REVIEW");
  if (submittedStatus !== "SUBMITTED") {
    throw new Error(`Expected SUBMITTED, got ${submittedStatus}`);
  }
  console.log("PASS transitioned to SUBMITTED");

  const rows = await authedGet(status, technicianToken, `/expertise_cases?select=id,work_order_no,status,inspection_started_at,inspection_completed_at&id=eq.${caseId}`);
  if (!Array.isArray(rows) || rows[0]?.status !== "SUBMITTED") {
    throw new Error("Final REST verification did not see SUBMITTED status.");
  }
  console.log(`PASS final REST status verified: ${rows[0].work_order_no} / ${rows[0].status}`);
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
