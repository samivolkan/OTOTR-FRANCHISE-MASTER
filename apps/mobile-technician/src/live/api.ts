import { LiveBodyInspectionAnswer, LiveEvidence, LiveTask, LiveWorkOrder, Session } from './types';

const env = ((globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

export const supabaseConfig = {
  url: env.EXPO_PUBLIC_OTOTR_SUPABASE_URL || '',
  key: env.EXPO_PUBLIC_OTOTR_SUPABASE_KEY || '',
};

const DEFAULT_REPORT_TEMPLATE_ID = 'otorapor_2614045_2026_05_24t16_42_06_823z';
const BODY_GROUP_SUFFIX = 'grp_kaporta_boya_ekspertiz_ve_check_up';
const realtimeTables = [
  'expertise_cases',
  'inspection_tasks',
  'inspection_evidence_assets',
  'work_order_report_answers',
  'work_order_group_status',
  'final_reports',
];

const bodyItemNoktaIds: Record<string, number> = {
  onkaput: 15,
  soloncamurluk: 6,
  sagoncamurluk: 27,
  solonkapi: 7,
  sagonkapi: 28,
  tavan: 18,
  bagajkapagi: 20,
};

function readError(body: unknown, fallback: string) {
  const data = body as { error_description?: string; message?: string; msg?: string; error_code?: string; code?: string; error?: string } | null;
  const message = data?.error_description || data?.message || data?.msg;
  const code = data?.error_code || data?.code || data?.error;
  return [message, code && message && !message.includes(String(code)) ? `(${code})` : ''].filter(Boolean).join(' ') || fallback;
}

function requireSupabaseConfig() {
  if (!supabaseConfig.url || !supabaseConfig.key) {
    throw new Error('Canli Supabase ayarlari eksik. EXPO_PUBLIC_OTOTR_SUPABASE_URL ve EXPO_PUBLIC_OTOTR_SUPABASE_KEY girilmeli.');
  }
}

async function parseResponse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(readError(body, res.statusText || 'Supabase isteği başarısız.'));
  }
  return body;
}

export async function signInLive(email: string, password: string): Promise<Session> {
  requireSupabaseConfig();
  const res = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: supabaseConfig.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const body = await parseResponse(res);
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    email: email.trim(),
    expiresAt: Date.now() + Math.max(60, Number(body.expires_in) || 3600) * 1000,
  };
}

export async function liveRequest<T>(session: Session, path: string, options: RequestInit = {}): Promise<T> {
  requireSupabaseConfig();
  const res = await fetch(`${supabaseConfig.url}${path}`, {
    ...options,
    headers: {
      apikey: supabaseConfig.key,
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return parseResponse(res) as Promise<T>;
}

const caseSelect = [
  'id',
  'customer_id',
  'vehicle_id',
  'work_order_no',
  'template_id',
  'status',
  'opened_at',
  'customer_summary',
  'manager_approved_at',
  'secretary_gate_ready',
  'payment_gate_ready',
  'kvkk_gate_ready',
  'package_plans(code,name,duration_minutes)',
  'customers(full_name,phone,email,identity_number,customer_role,metadata)',
  'vehicles(plate,vin,brand,model,model_year,fuel_type,transmission,mileage_km,seller_type,arrival_note,metadata)',
].join(',');

type CaseRow = Record<string, any>;
type TaskRow = Record<string, any>;
type EvidenceRow = Record<string, any>;

export async function fetchLiveWorkOrders(session: Session): Promise<LiveWorkOrder[]> {
  const cases = await liveRequest<CaseRow[]>(
    session,
    `/rest/v1/expertise_cases?select=${encodeURIComponent(caseSelect)}&order=opened_at.desc`,
  );
  const ids = cases.map((row) => row.id).filter(Boolean);
  const inFilter = ids.join(',');
  const tasks = ids.length
    ? await liveRequest<TaskRow[]>(
        session,
        `/rest/v1/inspection_tasks?select=id,expertise_case_id,task_key,title,assigned_role,status,report_field_key,estimated_minutes,customer_friendly_note,risky_findings,owner_user_id,assigned_user_id&expertise_case_id=in.(${inFilter})&order=created_at.asc`,
      )
    : [];
  const evidence = ids.length
    ? await liveRequest<EvidenceRow[]>(
        session,
        `/rest/v1/inspection_evidence_assets?select=id,expertise_case_id,task_id,field_key,report_field_key,title,remote_url,local_path,sync_status,is_required,quality_status&expertise_case_id=in.(${inFilter})&order=created_at.asc`,
      )
    : [];
  return cases.map((row) => mapCase(row, tasks, evidence));
}

export async function completeTask(session: Session, task: LiveTask, customerNote: string) {
  const normalized = String(task.status || '').trim().toUpperCase();
  if (!['AVAILABLE', 'OPEN', 'IN_PROGRESS', 'STARTED'].includes(normalized)) {
    throw new Error('Bu görev henüz mobil teknik giriş için açık değil.');
  }
  if (normalized === 'AVAILABLE') {
    await liveRequest(session, '/rest/v1/rpc/claim_inspection_task', {
      method: 'POST',
      body: JSON.stringify({ target_task_id: task.id }),
    });
  }
  const note = customerNote.trim() || task.customerNote;
  if (note) {
    await liveRequest(session, `/rest/v1/inspection_tasks?id=eq.${encodeURIComponent(task.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        customer_friendly_note: note,
      }),
    });
  }
  await createTaskEvidence(session, task);
  await liveRequest(session, '/rest/v1/rpc/submit_inspection_task', {
    method: 'POST',
    body: JSON.stringify({ target_task_id: task.id }),
  });
}

export async function saveBodyInspectionAnswer(session: Session, order: LiveWorkOrder, answer: LiveBodyInspectionAnswer) {
  const templateId = order.templateId || DEFAULT_REPORT_TEMPLATE_ID;
  const noktaId = bodyItemNoktaIds[normalizeBodyKey(answer.part)];
  if (!noktaId) {
    throw new Error(`${answer.part} icin rapor sablon noktasi bulunamadi.`);
  }
  const itemId = `${templateId}_item_${noktaId}`;
  const groupId = `${templateId}_${BODY_GROUP_SUFFIX}`;
  const state = answer.state || 'Kontrol edildi';
  const micron = Number(answer.micron) || 0;

  await liveRequest(session, '/rest/v1/rpc/save_work_order_report_answer', {
    method: 'POST',
    body: JSON.stringify({
      target_case_id: order.caseId,
      target_template_id: templateId,
      target_group_id: groupId,
      target_item_id: itemId,
      target_nokta_id: noktaId,
      selected_option_ids: [normalizeBodyKey(state) || 'kontrol'],
      selected_option_labels: [state],
      input_values: {
        state,
        micron,
        unit: 'um',
        source: 'ototr-usta-mobile',
        savedAt: new Date().toISOString(),
      },
      description_text: `${answer.part}: ${state}${micron ? `, ${micron} um` : ''}`,
      image_urls: [],
      answer_status: 'COMPLETED',
    }),
  });
}

export async function submitFinalReview(session: Session, order: LiveWorkOrder) {
  const now = new Date().toISOString();
  await liveRequest(session, `/rest/v1/expertise_cases?id=eq.${encodeURIComponent(order.caseId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      status: 'MANAGER_REVIEW',
      inspection_completed_at: now,
    }),
  });

  await liveRequest(session, '/rest/v1/final_reports?on_conflict=expertise_case_id,revision_no', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      expertise_case_id: order.caseId,
      template_id: order.templateId || DEFAULT_REPORT_TEMPLATE_ID,
      revision_no: 1,
      status: 'DRAFT',
      payload: {
        source: 'ototr-usta-mobile',
        workOrderNo: order.workOrderNo,
        vehicle: order.vehicle,
        submittedAt: now,
      },
    }),
  }).catch(() => undefined);
}

export function subscribeLiveChanges(session: Session, onChange: () => void) {
  requireSupabaseConfig();
  let socket: WebSocket | null = null;
  let closed = false;
  let ref = 1;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let changeTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimers = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (changeTimer) clearTimeout(changeTimer);
    heartbeatTimer = null;
    reconnectTimer = null;
    changeTimer = null;
  };

  const send = (topic: string, event: string, payload: Record<string, unknown>) => {
    if (!socket || socket.readyState !== 1) return;
    const nextRef = String(ref++);
    const message: Record<string, unknown> = { topic, event, payload, ref: nextRef };
    if (event === 'phx_join' || event === 'phx_leave') message.join_ref = nextRef;
    socket.send(JSON.stringify(message));
  };

  const scheduleChange = () => {
    if (changeTimer) clearTimeout(changeTimer);
    changeTimer = setTimeout(onChange, 450);
  };

  const connect = () => {
    if (closed) return;
    requireSupabaseConfig();
    const wsUrl = `${supabaseConfig.url.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${encodeURIComponent(supabaseConfig.key)}&vsn=1.0.0`;
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      send('realtime:ototr-live-work-orders', 'phx_join', {
        config: {
          broadcast: { self: false },
          presence: { key: '' },
          postgres_changes: realtimeTables.map((table) => ({ event: '*', schema: 'public', table })),
        },
        access_token: session.accessToken,
      });
      heartbeatTimer = setInterval(() => send('phoenix', 'heartbeat', {}), 25000);
    };
    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(String(message.data || '{}'));
        if (data?.event === 'postgres_changes' || data?.payload?.data?.schema === 'public' || data?.payload?.table) {
          scheduleChange();
        }
      } catch {
        // Realtime messages are best-effort; polling remains as fallback.
      }
    };
    socket.onerror = () => undefined;
    socket.onclose = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      if (!closed) reconnectTimer = setTimeout(connect, 3500);
    };
  };

  connect();

  return {
    unsubscribe() {
      closed = true;
      clearTimers();
      socket?.close();
      socket = null;
    },
  };
}

async function createTaskEvidence(session: Session, task: LiveTask) {
  const now = new Date().toISOString();
  const key = sanitizeEvidenceKey(task.reportFieldKey || task.key || task.id);
  await liveRequest(session, '/rest/v1/inspection_evidence_assets', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      expertise_case_id: task.caseId,
      task_id: task.id,
      field_key: `mobile_${key}`,
      report_field_key: task.reportFieldKey || task.key || 'mobile_task',
      evidence_type: 'IMAGE',
      title: 'Mobil teknik giriş kanıtı',
      remote_url: `mobile-live://${task.caseId}/${task.id}/${Date.now()}`,
      sync_status: 'UPLOADED',
      is_required: false,
      quality_status: 'ACCEPTED',
      captured_at: now,
      uploaded_at: now,
      device_id: 'ototr-usta-live',
    }),
  });
}

function sanitizeEvidenceKey(value: string) {
  const key = value.trim().replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_+/g, '_').slice(0, 80);
  return key || 'task';
}

function mapCase(row: CaseRow, taskRows: TaskRow[], evidenceRows: EvidenceRow[]): LiveWorkOrder {
  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers || {};
  const vehicle = Array.isArray(row.vehicles) ? row.vehicles[0] : row.vehicles || {};
  const pkg = Array.isArray(row.package_plans) ? row.package_plans[0] : row.package_plans || {};
  const evidence = evidenceRows.filter((item) => item.expertise_case_id === row.id).map(mapEvidence);
  const tasks = taskRows
    .filter((item) => item.expertise_case_id === row.id)
    .map((task) => mapTask(task, evidence.filter((item) => item.taskId === task.id).length));
  return {
    id: row.work_order_no || row.id,
    caseId: row.id,
    workOrderNo: row.work_order_no || row.id,
    templateId: row.template_id || undefined,
    status: row.status || 'OPEN',
    openedAt: row.opened_at || '',
    packageName: pkg.name || pkg.code || 'Paket bilgisi yok',
    durationMinutes: Number(pkg.duration_minutes) || 0,
    customer: {
      name: customer.full_name || row.customer_summary || 'Müşteri bilgisi bekliyor',
      phone: customer.phone || '',
      role: customer.customer_role || 'Müşteri',
    },
    vehicle: {
      plate: vehicle.plate || 'PLAKA YOK',
      vin: vehicle.vin || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: String(vehicle.model_year || ''),
      fuel: vehicle.fuel_type || '',
      transmission: vehicle.transmission || '',
      mileage: vehicle.mileage_km ? `${Number(vehicle.mileage_km).toLocaleString('tr-TR')} km` : '',
    },
    tasks,
    evidence,
    gates: {
      managerApproved: Boolean(row.manager_approved_at),
      secretaryReady: Boolean(row.secretary_gate_ready),
      paymentReady: Boolean(row.payment_gate_ready),
      kvkkReady: Boolean(row.kvkk_gate_ready),
    },
  };
}

function normalizeBodyKey(value: string) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

function mapTask(row: TaskRow, evidenceCount: number): LiveTask {
  return {
    id: row.id,
    caseId: row.expertise_case_id,
    key: row.task_key || '',
    title: row.title || row.task_key || 'Görev',
    role: row.assigned_role || 'Teknisyen',
    status: row.status || 'WAITING',
    reportFieldKey: row.report_field_key || '',
    estimatedMinutes: Number(row.estimated_minutes) || 0,
    customerNote: row.customer_friendly_note || '',
    riskyFindings: row.risky_findings || '',
    evidenceCount,
  };
}

function mapEvidence(row: EvidenceRow): LiveEvidence {
  return {
    id: row.id,
    caseId: row.expertise_case_id,
    taskId: row.task_id,
    title: row.title || row.field_key || row.report_field_key || 'Kanıt',
    url: row.remote_url || row.local_path || '',
    required: Boolean(row.is_required),
    qualityStatus: row.quality_status || row.sync_status || 'WAITING',
  };
}
