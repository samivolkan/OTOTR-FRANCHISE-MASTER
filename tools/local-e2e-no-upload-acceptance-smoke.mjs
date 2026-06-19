import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const reportPath = join(
  repoRoot,
  "docs",
  "codex",
  "e2e-live-flow",
  "e2e-no-upload-acceptance-last-run.json"
);

const suite = [
  {
    label: "Role/auth local prerequisite",
    script: "tools/local-role-session-smoke.mjs"
  },
  {
    label: "Secretary creates work order and mobile sees it",
    script: "tools/local-live-work-order-flow-smoke.mjs"
  },
  {
    label: "Mobile inspection answer persists",
    script: "tools/local-mobile-inspection-answer-smoke.mjs"
  },
  {
    label: "Mobile status transition reaches technical review",
    script: "tools/local-live-status-transition-smoke.mjs"
  },
  {
    label: "Technical approval gate works with evidence metadata",
    script: "tools/local-technical-approval-gate-smoke.mjs"
  },
  {
    label: "Final report payload can be generated and locked",
    script: "tools/local-final-report-payload-smoke.mjs"
  },
  {
    label: "Secretary sees locked final report / print-ready status",
    script: "tools/local-secretary-report-status-smoke.mjs"
  }
];

function redact(text) {
  return String(text || "")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
    .replace(/sbp_[A-Za-z0-9_-]+/g, "[redacted-token]");
}

function runStep(step) {
  const started = performance.now();
  try {
    const stdout = execFileSync(process.execPath, [step.script], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    const durationMs = Math.round(performance.now() - started);
    const cleanOutput = redact(stdout).trim();
    const passCount = (cleanOutput.match(/^PASS\b/gm) || []).length;
    console.log(`\n=== PASS ${step.label} (${durationMs} ms) ===`);
    if (cleanOutput) console.log(cleanOutput);
    return {
      label: step.label,
      script: step.script,
      status: "PASS",
      durationMs,
      passCount
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    const stdout = redact(error.stdout || "");
    const stderr = redact(error.stderr || "");
    console.error(`\n=== FAIL ${step.label} (${durationMs} ms) ===`);
    if (stdout.trim()) console.error(stdout.trim());
    if (stderr.trim()) console.error(stderr.trim());
    return {
      label: step.label,
      script: step.script,
      status: "FAIL",
      durationMs,
      stdoutTail: stdout.trim().slice(-1200),
      stderrTail: stderr.trim().slice(-1200)
    };
  }
}

const startedAt = new Date().toISOString();
console.log("OTOTR local E2E acceptance smoke");
console.log("Scope: secretary -> mobile -> report -> secretary print-ready status");
console.log("Evidence upload mode: metadata accepted, binary Storage upload deferred to next phase.");

const results = [];
for (const step of suite) {
  const result = runStep(step);
  results.push(result);
  if (result.status !== "PASS") break;
}

const failed = results.find((result) => result.status !== "PASS");
const completedAt = new Date().toISOString();
const summary = {
  status: failed ? "FAIL" : "PASS",
  startedAt,
  completedAt,
  uploadMode: "evidence metadata accepted; binary Storage upload deferred",
  steps: results
};

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

if (failed) {
  console.error(`\nFAIL local E2E acceptance stopped at: ${failed.label}`);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

console.log("\nPASS local E2E acceptance suite completed.");
console.log(`Report: ${reportPath}`);
