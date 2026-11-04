const istanbulDate = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Istanbul'});
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timestampPattern = /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

function validDate(value) {
  if (typeof value !== 'string' || !datePattern.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Call from the trusted ERP event handler after mapping the branch scope.
export function createFinanceBranchOpeningAdapter({cutoverDate, ingest}) {
  if (typeof ingest !== 'function') throw new TypeError('Opening event ingestion is required');
  return async function deliverOpening(event, scope) {
    if (!validDate(cutoverDate)) return {outcome: 'CUTOVER_NOT_CONFIGURED'};
    const timestamp = typeof event?.occurredAtUtc === 'string' && event.occurredAtUtc.match(timestampPattern);
    const {eventId, branchOpeningReference} = event ?? {};
    if (event?.eventType !== 'branch.opened' || !timestamp || !validDate(timestamp[1]) ||
        !Number.isFinite(Date.parse(event.occurredAtUtc)) ||
        typeof eventId !== 'string' || !eventId.trim() ||
        typeof branchOpeningReference !== 'string' || !branchOpeningReference.trim() ||
        typeof event.branchId !== 'string' || !event.branchId || event.branchId !== scope?.branchId) {
      return {outcome: 'INVALID_OPENING_EVENT'};
    }
    const businessDate = istanbulDate.format(new Date(event.occurredAtUtc));
    if (businessDate < cutoverDate) return {outcome: 'BEFORE_CUTOVER'};

    return ingest(scope, {
      eventId,
      eventType: 'branch.opened',
      occurredAtUtc: new Date(event.occurredAtUtc).toISOString(),
      businessDate,
      payload: {branchOpeningReference}
    });
  };
}
