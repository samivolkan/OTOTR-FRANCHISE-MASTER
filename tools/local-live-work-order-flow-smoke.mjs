import { execFileSync } from "node:child_process";

const managerEmail = "local.branch.manager.a@ototr.test";
const managerPassword = "LocalOnly-Branch-A-2026!";

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

async function signIn(status) {
  const { response, body } = await requestJson(`${status.API_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: status.ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: managerEmail, password: managerPassword })
  });
  if (!response.ok || !body?.access_token) {
    throw new Error(`Manager sign-in failed: HTTP ${response.status}`);
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
  run("node", ["tools/local-role-session-smoke.mjs"]);
  console.log("PASS prerequisite role-session smoke");

  const status = runSupabaseStatus();
  const token = await signIn(status);
  console.log("PASS manager login for live work-order RPC");

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const plate = `16 LIVE ${suffix.slice(-3)}`;
  const caseId = await authedPost(status, token, "/rpc/create_branch_work_order", {
    customer_full_name: "Live Smoke Musteri",
    customer_phone: "+905550001122",
    customer_email: "live-smoke@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: plate,
    vehicle_vin: `LIVESMOKE${suffix}`.slice(0, 17),
    vehicle_brand: "BMW",
    vehicle_model: "3 Serisi",
    vehicle_year: 2022,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 45200,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "Local live smoke",
    package_type: "STANDARD",
    work_order_notes: "Sekreterya -> mobil canlı akış smoke"
  });
  console.log(`PASS secretary RPC created work order: ${caseId}`);

  const rows = await authedGet(
    status,
    token,
    `/expertise_cases?select=id,work_order_no,status,vehicles(plate,brand,model,mileage_km),package_plans(code,name,duration_minutes)&id=eq.${caseId}`
  );
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error("Created work order was not visible through authenticated mobile REST query.");
  }

  const taskRows = await authedGet(status, token, `/inspection_tasks?select=id,title,status,expertise_case_id&expertise_case_id=eq.${caseId}`);
  if (!Array.isArray(taskRows) || taskRows.length === 0) {
    throw new Error("Created work order did not generate inspection tasks.");
  }

  console.log(`PASS mobile REST sees created work order: ${rows[0].work_order_no} / ${rows[0].vehicles?.plate}`);
  console.log(`PASS generated inspection tasks visible: ${taskRows.length}`);
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
