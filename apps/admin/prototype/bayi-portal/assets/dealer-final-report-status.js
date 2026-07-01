(function () {
  const PRINT_READY_STATUSES = new Set(["LOCKED", "APPROVED", "DELIVERED", "CLOSED", "COMPLETED"]);
  const PRINT_READY_CASE_STATUSES = new Set(["SUBMITTED", "REPORT_GATE_READY", "MANAGER_REVIEW", "APPROVED", "DELIVERED", "CLOSED", "COMPLETED"]);
  const STATUS_PRIORITY = {
    LOCKED: 100,
    DELIVERED: 95,
    CLOSED: 95,
    COMPLETED: 95,
    APPROVED: 90,
    SUBMITTED: 80,
    REPORT_GATE_READY: 80,
    MANAGER_REVIEW: 70,
    DRAFT: 20
  };

  function normalizeStatus(value) {
    return String(value || "").trim().toUpperCase();
  }

  function statusPriority(row) {
    const status = normalizeStatus(row && (row.final_report_status || row.status));
    const canSubmit = row && row.can_submit === true;
    const hasLockedAt = !!(row && (row.final_report_locked_at || row.locked_at));
    return (STATUS_PRIORITY[status] || 0) + (canSubmit ? 15 : 0) + (hasLockedAt ? 10 : 0);
  }

  function rowTime(row) {
    const value = row && (row.final_report_locked_at || row.locked_at || row.updated_at || row.created_at);
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
  }

  function betterStatusRow(current, next) {
    if (!current) return next;
    if (!next) return current;
    const currentPriority = statusPriority(current);
    const nextPriority = statusPriority(next);
    if (nextPriority !== currentPriority) return nextPriority > currentPriority ? next : current;
    return rowTime(next) >= rowTime(current) ? next : current;
  }

  function toMap(rows) {
    const map = new Map();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if (!row || !row.expertise_case_id) return;
      map.set(row.expertise_case_id, betterStatusRow(map.get(row.expertise_case_id), row));
    });
    return map;
  }

  function normalizeFallbackReport(row) {
    const summary = row && row.payload && row.payload.summary ? row.payload.summary : null;
    const status = normalizeStatus(row && row.status);
    const canSubmit = !!(summary && summary.canSubmit === true);
    const printReady = PRINT_READY_STATUSES.has(status) || canSubmit;
    return {
      expertise_case_id: row.expertise_case_id,
      final_report_status: printReady && status === "DRAFT" ? "LOCKED" : (row.status || ""),
      final_report_locked_at: row.locked_at || "",
      revision_no: row.revision_no || 1,
      can_submit: canSubmit,
      final_report_summary: summary
    };
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
      const message = String((error && error.message) || "");
      if (!/list_branch_work_orders_with_report_status/i.test(message)) {
        throw error;
      }
      const rows = await dealerSupabaseRequest(
        `/rest/v1/final_reports?select=expertise_case_id,status,locked_at,revision_no,payload&order=locked_at.desc.nullslast&limit=${encodeURIComponent(limitCount)}`
      );
      return toMap((Array.isArray(rows) ? rows : []).map(normalizeFallbackReport));
    }
  }

  function mergeCase(row, statusMap) {
    const status = statusMap instanceof Map ? statusMap.get(row && row.id) : null;
    return status ? { ...row, ...status } : row;
  }

  function statusCell(workOrder, helpers = {}) {
    const badge = typeof helpers.badge === "function" ? helpers.badge : (text) => String(text || "");
    const esc = typeof helpers.esc === "function" ? helpers.esc : (text) => String(text || "");
    const status = normalizeStatus(workOrder && workOrder.finalReportStatus);
    const liveStatus = normalizeStatus(workOrder && (workOrder.liveStatus || workOrder.status));
    const isLiveSupabaseWorkOrder = !!(workOrder && workOrder.supabaseId) || /Supabase/i.test(String((workOrder && workOrder.source) || ""));
    const inferredPrintReady = isLiveSupabaseWorkOrder && PRINT_READY_CASE_STATUSES.has(liveStatus);

    if (PRINT_READY_STATUSES.has(status) || inferredPrintReady || workOrder?.finalReportCanSubmit === true) {
      const readyAt = workOrder && workOrder.finalReportLockedAt
        ? new Date(workOrder.finalReportLockedAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })
        : "Basıma hazır";
      return `${badge("Basıma hazır")}<br><span class="card-sub">${esc(readyAt)}</span>`;
    }

    if (status === "DRAFT") {
      return `${badge("Rapor hazırlanıyor")}<br><span class="card-sub">Mobil final rapor taslağı oluştu</span>`;
    }

    if (PRINT_READY_CASE_STATUSES.has(liveStatus)) {
      return `${badge("Rapor hazırlanıyor")}<br><span class="card-sub">Mobil veriler işleniyor</span>`;
    }

    return `${badge("Usta işlemi sürüyor")}<br><span class="card-sub">Final rapor henüz oluşmadı</span>`;
  }

  window.OTOTRDealerFinalReportStatus = {
    fetchStatuses,
    mergeCase,
    statusCell
  };
})();
