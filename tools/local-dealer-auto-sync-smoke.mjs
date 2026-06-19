import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { getInspectionTaskKeyForModule } from "../ototr-mobile-app/src/services/inspectionModuleTaskMapping.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const screenshotPath = path.join(repoRoot, "docs", "codex", "e2e-live-flow", "dealer-auto-sync-smoke.png");
const dealerUrl = process.env.DEALER_PORTAL_URL || "http://127.0.0.1:8791/bayi-portal/index.html?portal=dealer#dealer";

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

function runSupabaseStatus() {
  const raw = run("cmd.exe", ["/d", "/s", "/c", "npx.cmd supabase status --output json"]);
  const jsonStart = raw.indexOf("{");
  if (jsonStart < 0) throw new Error("Supabase status did not return JSON.");
  const status = JSON.parse(raw.slice(jsonStart));
  if (!String(status.API_URL || "").startsWith("http://127.0.0.1:")) {
    throw new Error("This smoke test only runs against local Supabase.");
  }
  return status;
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

async function authedPost(status, token, pathName, payload) {
  const { response, body } = await requestJson(`${status.REST_URL}${pathName}`, {
    method: "POST",
    headers: {
      apikey: status.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`POST ${pathName} failed: HTTP ${response.status} ${JSON.stringify(body).slice(0, 240)}`);
  }
  return body;
}

async function authedGet(status, token, pathName) {
  const { response, body } = await requestJson(`${status.REST_URL}${pathName}`, {
    headers: {
      apikey: status.ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`GET ${pathName} failed: HTTP ${response.status} ${JSON.stringify(body).slice(0, 240)}`);
  }
  return body;
}

async function main() {
  const status = runSupabaseStatus();
  const managerToken = await signIn(status, accounts.manager);
  const technicianToken = await signIn(status, accounts.technician);

  const require = createRequire(import.meta.url);
  const playwrightPath = require.resolve("playwright", {
    paths: [path.join(repoRoot, "apps", "admin", "prototype"), repoRoot]
  });
  const { chromium } = require(playwrightPath);
  const browserCandidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
  if (!executablePath) throw new Error("Chrome veya Edge bulunamadi.");

  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(dealerUrl, { waitUntil: "load" });
  await page.waitForFunction(() => (
    typeof window.dealerSupabaseSignIn === "function"
    && typeof window.dealerSyncSupabaseWorkOrders === "function"
  ), null, { timeout: 10000 });
  await page.evaluate(async ({ email, password }) => {
    await window.dealerSupabaseSignIn(email, password);
    await window.dealerSyncSupabaseWorkOrders({ silent: true, noRender: true });
  }, accounts.manager);
  await page.waitForFunction(() => {
    try {
      return Boolean(JSON.parse(localStorage.getItem("ototr-dealer-supabase-session-v1") || "{}").access_token);
    } catch {
      return false;
    }
  }, null, { timeout: 15000 });

  const suffix = new Date().toISOString().replace(/\D/g, "").slice(4, 14);
  const plate = `16 ASY ${suffix.slice(-3)}`;
  const itemTitle = `Auto Sync Motor ${suffix}`;
  const caseId = await authedPost(status, managerToken, "/rpc/create_branch_work_order", {
    customer_full_name: "Auto Sync Smoke Musteri",
    customer_phone: "+905550004488",
    customer_email: "auto-sync-smoke@example.test",
    customer_identity_number: "",
    customer_role: "OWNER",
    vehicle_plate: plate,
    vehicle_vin: `AUTOSYNC${suffix}`.slice(0, 17),
    vehicle_brand: "Toyota",
    vehicle_model: "Corolla",
    vehicle_year: 2021,
    vehicle_fuel_type: "Benzin",
    vehicle_transmission: "Otomatik",
    vehicle_kilometers: 61800,
    vehicle_seller_type: "Bireysel",
    vehicle_arrival_note: "Dealer auto sync smoke",
    package_type: "STANDARD",
    work_order_notes: "Manual refresh kullanmadan portal sync smoke"
  });

  await authedPost(status, technicianToken, "/rpc/transition_mobile_work_order_status", {
    target_case_id: caseId,
    next_status: "IN_PROGRESS",
    transition_reason: "Dealer auto sync smoke technician start"
  });

  const expectedTaskKey = getInspectionTaskKeyForModule("motor");
  const motorTasks = await authedGet(
    status,
    technicianToken,
    `/inspection_tasks?select=id,task_key,status&expertise_case_id=eq.${caseId}&task_key=eq.${expectedTaskKey}&limit=1`
  );
  const motorTask = Array.isArray(motorTasks) ? motorTasks[0] : null;
  if (!motorTask?.id) {
    throw new Error(`Expected generated motor task ${expectedTaskKey} before dealer auto sync smoke.`);
  }
  const claimedTask = await authedPost(status, technicianToken, "/rpc/claim_inspection_task", {
    target_task_id: motorTask.id
  });
  const claimed = Array.isArray(claimedTask) ? claimedTask[0] : claimedTask;
  if (!["OPEN", "ASSIGNED"].includes(claimed?.status) || !claimed?.owner_user_id) {
    throw new Error(`Expected motor task claim before dealer auto sync smoke, got ${JSON.stringify(claimed).slice(0, 240)}`);
  }

  const answer = await authedPost(status, technicianToken, "/rpc/save_mobile_inspection_item_value", {
    target_case_id: caseId,
    target_module_key: "motor",
    target_item_key: `auto_sync_motor_${suffix}`,
    target_item_title: itemTitle,
    target_selected_option_label: "Sorunsuz",
    target_input_values: { source: "dealer-auto-sync-smoke" },
    target_description_text: "Manual refresh olmadan portal senkron testi.",
    target_ready_photo_count: 1,
    target_required_photo_count: 1
  });
  const saved = Array.isArray(answer) ? answer[0] : answer;
  if (!saved?.id || saved.result !== "NORMAL") {
    throw new Error(`Expected NORMAL technician answer, got ${JSON.stringify(saved).slice(0, 240)}`);
  }

  try {
    await page.waitForFunction(({ title, expectedPlate }) => {
      const raw = localStorage.getItem("ototr-dealer-live-workorders-v1") || "";
      const store = JSON.parse(raw || "{}");
      const order = (store.workOrders || []).find((workOrder) => JSON.stringify(workOrder).includes(title));
      const task = (order?.tasks || []).find((candidate) => JSON.stringify(candidate).includes(title));
      if (order?.plate === expectedPlate && task?.result?.customerText?.includes(title)) {
        window.__dealerAutoSyncHit = {
          workOrderNo: order.id || "",
          plate: order.plate || "",
          task: task.station || "",
          resultText: task.result.customerText || ""
        };
        return true;
      }
      return false;
    }, { title: itemTitle, expectedPlate: plate }, { timeout: 25000 });
  } catch (error) {
    const debugState = await page.evaluate(() => {
      const sync = JSON.parse(localStorage.getItem("ototr-dealer-supabase-sync-v1") || "{}");
      const store = JSON.parse(localStorage.getItem("ototr-dealer-live-workorders-v1") || "{}");
      return {
        lastSyncAt: sync.lastSyncAt || "",
        lastCount: sync.lastCount ?? null,
        lastError: sync.lastError || "",
        realtime: sync.realtime || "",
        workOrderCount: Array.isArray(store.workOrders) ? store.workOrders.length : 0,
        firstWorkOrders: (store.workOrders || []).slice(0, 5).map((workOrder) => ({
          id: workOrder.id,
          plate: workOrder.plate
        }))
      };
    });
    throw new Error(`Portal did not auto-sync technician answer before timeout: ${JSON.stringify(debugState)}`);
  }

  const storeHit = await page.evaluate(() => window.__dealerAutoSyncHit || null);

  if (!storeHit?.workOrderNo || storeHit.plate !== plate || !storeHit.resultText.includes(itemTitle)) {
    throw new Error(`Portal live store did not include technician answer: ${JSON.stringify(storeHit)}`);
  }

  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  const blockingErrors = errors.filter((entry) => !/WebSocket connection .*\/realtime\/v1\/websocket.*Unexpected response code: 502/.test(entry));
  if (blockingErrors.length) {
    throw new Error(`Console/page errors:\n${blockingErrors.join("\n")}`);
  }

  console.log(JSON.stringify({
    status: "ok",
    checked: [
      "Portal live session opened",
      "Technician answer saved after portal load",
      "Portal synced technician answer without clicking Canli Yenile"
    ],
    workOrderNo: storeHit.workOrderNo,
    plate: storeHit.plate,
    task: storeHit.task,
    screenshotPath
  }, null, 2));
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
