(function () {
  function toMap(rows) {
    return new Map((Array.isArray(rows) ? rows : []).map((row) => [row.expertise_case_id, row]));
  }

  async function fetchStatuses(dealerSupabaseRequest, limitCount = 200) {
    if (typeof dealerSupabaseRequest !== "function") return new Map();
    try {
      const rows = await dealerSupabaseRequest("/rest/v1/rpc/list_branch_work_orders_with_report_status", {
        method: "POST",
        body: JSON.stringify({ limit_count: limitCount })
      });
      return toMap(rows);
    } catch (error) {
      const message = String(error && error.message || "");
      if (!/list_branch_work_orders_with_report_status/i.test(message)) {
        throw error;
      }
      const rows = await dealerSupabaseRequest(
        `/rest/v1/final_reports?select=expertise_case_id,status,locked_at,revision_no,payload&order=locked_at.desc.nullslast&limit=${encodeURIComponent(limitCount)}`
      );
      return toMap((Array.isArray(rows) ? rows : []).map((row) => ({
        expertise_case_id: row.expertise_case_id,
        final_report_status: row.status || "",
        final_report_locked_at: row.locked_at || "",
        revision_no: row.revision_no || 1,
        can_submit: row.payload && row.payload.summary ? row.payload.summary.canSubmit === true : false,
        final_report_summary: row.payload && row.payload.summary ? row.payload.summary : null
      })));
    }
  }

  function mergeCase(row, statusMap) {
    const status = statusMap instanceof Map ? statusMap.get(row && row.id) : null;
    return status ? { ...row, ...status } : row;
  }

  function statusCell(workOrder, helpers = {}) {
    const badge = typeof helpers.badge === "function" ? helpers.badge : (text) => String(text || "");
    const esc = typeof helpers.esc === "function" ? helpers.esc : (text) => String(text || "");
    const status = String(workOrder && workOrder.finalReportStatus || "").toUpperCase();
    const liveStatus = String(workOrder && (workOrder.liveStatus || workOrder.status) || "").toUpperCase();
    const isLiveSupabaseWorkOrder = !!(workOrder && workOrder.supabaseId) || /Supabase/i.test(String(workOrder && workOrder.source || ""));
    const inferredLocked = isLiveSupabaseWorkOrder && /SUBMITTED|REPORT_GATE_READY|MANAGER_REVIEW|APPROVED|DELIVERED|CLOSED/i.test(liveStatus);
    if (status === "LOCKED" || inferredLocked) {
      const lockedAt = workOrder && workOrder.finalReportLockedAt
        ? new Date(workOrder.finalReportLockedAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })
        : "Rapor kilitlendi";
      return `${badge("Final kilitli")}<br><span class="card-sub">${esc(lockedAt)}</span>`;
    }
    if (status === "DRAFT") {
      return `${badge("Taslak rapor")}<br><span class="card-sub">Mobil final rapor taslagi var</span>`;
    }
    if (/SUBMITTED|REPORT_GATE_READY|MANAGER_REVIEW/i.test(String(workOrder && (workOrder.liveStatus || workOrder.status) || ""))) {
      return `${badge("Mobil bekleniyor")}<br><span class="card-sub">Final rapor kaydi bekleniyor</span>`;
    }
    return `${badge("Rapor yok")}<br><span class="card-sub">Usta finali bekleniyor</span>`;
  }

  window.OTOTRDealerFinalReportStatus = {
    fetchStatuses,
    mergeCase,
    statusCell
  };
})();
