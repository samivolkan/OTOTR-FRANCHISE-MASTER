import {PROFILES, OUTCOMES, PROCESSES, DEFECTS, partsFor} from './pilot-domain.js';
import {BEST_FRAME, directionForFrame} from './spin-domain.js';

const own = (object, key) => object != null && Object.hasOwn(object, key);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
// All copy is plain text. Renderers must use textContent or their normal HTML escaping.
const text = (value, max = 2000) => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max) : '';
const ringSlot = value => /^ring-(0[1-9]|1[0-9]|2[0-4])$/.test(value);
const upperSlot = value => /^upper-[1-4]$/.test(value);
const frameNumber = slot => ringSlot(slot) ? Number(slot.slice(-2)) : null;

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function safePhotoURL(value) {
  if (typeof value !== 'string' || value.length > 8192 || /[\u0000-\u0020\u007f<>"'\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    // Customer images come from the approved report service; never run URI schemes or inherit a local demo path.
    return url.protocol === 'https:' && !url.username && !url.password && !url.hash ? url.href : null;
  } catch { return null; }
}

export function processCopy(process) {
  const copy = {
    original: 'Uzman bu parçada işlem bulgusu kaydetmedi. Sonuç, inceleme kapsamı ve kanıtlarıyla birlikte değerlendirilir.',
    painted: 'Parçada yeniden boyama kaydı var. Boya işlemi tek başına kazanın türünü veya boyutunu göstermez.',
    local: 'Parçanın bir bölümünde boya işlemi kaydedilmiş. İşlem alanını bağlı fotoğraf ve uzman notuyla inceleyin.',
    replaced: 'Uzman bu parçada değişim bulgusu kaydetmiş. Değişim kararı yalnız boya kalınlığından çıkarılmaz.',
    removed: 'Parçada sökme ve yeniden takma bulgusu kaydedilmiş. Bu kayıt, parça değişimiyle aynı anlamı taşımaz.',
    repaired: 'Parçada onarım izi kaydedilmiş. Onarımın konumu ve kapsamı uzman notunda açıklanır.',
    none: 'Bu parça için işlem sonucu kaydedilmemiş.'
  };
  return own(copy, process) ? copy[process] : copy.none;
}

function normalizeFinding(part, input, byPhoto) {
  const f = record(input) ? input : {};
  const outcome = own(OUTCOMES, f.outcome) ? f.outcome : 'unchecked';
  const inspected = outcome === 'inspected';
  const process = inspected && own(PROCESSES, f.process) ? f.process : 'none';
  const defects = inspected && Array.isArray(f.defects) ? [...new Set(f.defects.filter(d => own(DEFECTS, d)))] : [];
  const measurements = inspected && part.material === 'metal' && Array.isArray(f.measurements)
    ? f.measurements.filter(n => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 5000).slice(0, 12) : [];
  const ids = Array.isArray(f.evidenceIds) ? [...new Set(f.evidenceIds.filter(id => typeof id === 'string' && byPhoto.has(id)))].slice(0, 20) : [];
  const annotations = Array.isArray(f.annotations) ? f.annotations.filter(a => record(a) && ids.includes(a.photoId)
    && [a.x, a.y, a.w, a.h].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1)
    && a.x + a.w <= 1.001 && a.y + a.h <= 1.001).slice(0, 30).map(a => ({photoId: a.photoId, x: a.x, y: a.y, w: a.w, h: a.h})) : [];
  const explanation = inspected ? processCopy(process) : {
    unchecked: 'Bu parçanın inceleme sonucu kaydedilmemiş.',
    inaccessible: 'Bu alan inceleme sırasında görülememiş. Kapsam açıklamasını okuyun.',
    not_applicable: 'Uzman bu parçayı araç düzeninde bulunmuyor olarak işaretlemiş. Açıklamayı okuyun.'
  }[outcome];
  return {...part, outcome, process, defects, measurements, explanation, note: text(f.note), evidence: ids.map(id => ({
    ...byPhoto.get(id), annotations: annotations.filter(a => a.photoId === id)
  }))};
}

export function makeDemoPresentation() {
  const photos = Array.from({length: 24}, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {id: `demo-${n}`, slot: `ring-${n}`, frame: i + 1, url: `./real-car/frame-${n}.jpg`, kind: 'ring',
      caption: `Referans fotoğraf · ${directionForFrame(i + 1)} · Hasar kanıtı değildir.`, illustrative: true};
  });
  const byPhoto = new Map(photos.map(p => [p.id, p]));
  const findings = {
    left_front_door: {outcome: 'inspected', process: 'painted', defects: ['scratch'], measurements: [248, 272, 261],
      note: 'Temsili senaryo: sol kapıda boya işlemi ve çizik kaydı. Ölçümler ve bulgular örnektir; fotoğraftaki araca ait tespit değildir.', evidenceIds: ['demo-19', 'demo-22']},
    left_front_fender: {outcome: 'inspected', process: 'replaced', measurements: [126, 132, 129],
      note: 'Temsili senaryo: bağlantı noktaları ve parça kimliği incelenerek değişim değerlendirmesi yapılmış. Bu fotoğraf bir değişim kanıtı değildir.', evidenceIds: ['demo-22']},
    rear_bumper: {outcome: 'inspected', process: 'repaired',
      note: 'Temsili senaryo: arka tamponda onarım izi kaydı. Plastik yüzeye standart metal boya ölçümü uygulanmaz. Fotoğraf genel görünüm içindir.', evidenceIds: ['demo-13', 'demo-16']}
  };
  return freeze({
    kind: 'demo', profile: 'hatchback3', reportId: 'OTOTR-SUNUM-DEMO', approvedAt: null, approvedBy: '',
    vehicle: {plate: 'ÖRNEK ARAÇ', label: 'Opel ADAM', brand: 'Opel', model: 'ADAM', bodyType: PROFILES.hatchback3},
    parts: partsFor('hatchback3').map(p => normalizeFinding(p, findings[p.id], byPhoto)), photos,
    source: {photographyCredit: 'SpinFrame', showcaseCredit: 'WebRotate 360',
      url: 'https://www.webrotate360.com/examples/browse-all-examples/360-car-photography.aspx',
      commercialReusePermissionVerified: false},
    disclaimer: 'Örnek sunum. 24 fotoğraf gerçek bir referans araca aittir; bulgular ve ölçümler temsili olup bu araç hakkında ekspertiz sonucu değildir.'
  });
}

/** Accept only the customer service's approved snapshot; authentication stays at the service boundary. */
export function fromApprovedReport(report) {
  if (!record(report) || report.customerView !== true || !record(report.session)
    || report.session.status !== 'approved' || !own(PROFILES, report.session.profile)
    || typeof report.approvedAt !== 'string' || !Number.isFinite(Date.parse(report.approvedAt))) {
    throw Error('Müşteri sunumu için onaylı bir rapor gerekli.');
  }
  const session = report.session;
  const profile = session.profile;
  const findings = record(session.findings) ? session.findings : {};
  const slots = record(session.photo_slots) ? session.photo_slots : {};
  const linked = new Set();
  for (const [slot, id] of Object.entries(slots)) if ((ringSlot(slot) || upperSlot(slot)) && typeof id === 'string') linked.add(id);
  for (const part of partsFor(profile)) {
    const f = own(findings, part.id) && record(findings[part.id]) ? findings[part.id] : {};
    if (Array.isArray(f.evidenceIds)) for (const id of f.evidenceIds) if (typeof id === 'string') linked.add(id);
  }
  const photos = [], seen = new Set();
  for (const source of Array.isArray(report.photos) ? report.photos : []) {
    if (!record(source) || typeof source.id !== 'string' || !linked.has(source.id) || seen.has(source.id)) continue;
    const url = safePhotoURL(source.url);
    if (!url || !['ring', 'upper', 'detail'].includes(source.kind)) continue;
    const slot = text(source.slot, 100);
    if (source.kind === 'ring' && !ringSlot(slot) || source.kind === 'upper' && !upperSlot(slot)) continue;
    // Retaken frames may still be linked as evidence. Only the currently approved slot enters the spin.
    const active = slots[slot] === source.id;
    const frame = source.kind === 'ring' && active ? frameNumber(slot) : null;
    photos.push({id: source.id, slot, frame, url, kind: source.kind, active,
      caption: source.kind === 'ring' ? `${directionForFrame(frameNumber(slot))} · Kayıtlı fotoğraf`
        : source.kind === 'upper' ? 'Üst açı · Kayıtlı fotoğraf' : 'Parça detayı · Bağlı fotoğraf', illustrative: false});
    seen.add(source.id);
  }
  photos.sort((a, b) => (a.frame ?? 100) - (b.frame ?? 100) || a.id.localeCompare(b.id, 'en'));
  const byPhoto = new Map(photos.map(p => [p.id, p]));
  const job = record(report.job) ? report.job : {};
  const brand = text(job.brand, 100), model = text(job.model, 100);
  return freeze({kind: 'approved', profile, reportId: text(report.reportId, 100),
    approvedAt: report.approvedAt, approvedBy: text(report.approvedBy, 200),
    vehicle: {plate: text(job.plate, 40), label: [brand, model].filter(Boolean).join(' ') || 'Rapor aracı', brand, model,
      workOrderNo: text(job.work_order_no, 100), bodyType: PROFILES[profile]},
    parts: partsFor(profile).map(p => normalizeFinding(p, own(findings, p.id) ? findings[p.id] : null, byPhoto)), photos,
    disclaimer: 'Onaylı kaporta kayıtları ve bunlara bağlı fotoğraflar. Görülemeyen veya incelenmeyen alanlar ayrıca belirtilir.'
  });
}

export function getSummary(presentation) {
  const parts = Array.isArray(presentation?.parts) ? presentation.parts : [];
  const inspected = parts.filter(p => p.outcome === 'inspected');
  return {total: parts.length, inspected: inspected.length, unchecked: parts.filter(p => p.outcome === 'unchecked').length,
    inaccessible: parts.filter(p => p.outcome === 'inaccessible').length, notApplicable: parts.filter(p => p.outcome === 'not_applicable').length,
    affected: inspected.filter(p => p.process !== 'none' && p.process !== 'original' || p.defects.length).length,
    withEvidence: inspected.filter(p => p.evidence.length).length,
    photos: Array.isArray(presentation?.photos) ? presentation.photos.length : 0,
    byProcess: Object.fromEntries(Object.keys(PROCESSES).map(process => [process, inspected.filter(p => p.process === process).length]))};
}

export function buildTour(presentation, {findingsOnly = true} = {}) {
  const rank = {replaced: 0, repaired: 1, painted: 2, local: 3, removed: 4, original: 5, none: 6};
  const parts = Array.isArray(presentation?.parts) ? presentation.parts : [];
  return parts.filter(p => findingsOnly ? p.outcome === 'inspected' && (p.process !== 'none' && p.process !== 'original' || p.defects.length)
    : p.outcome !== 'unchecked').map((part, order) => ({part, order}))
    .sort((a, b) => (rank[a.part.process] ?? 6) - (rank[b.part.process] ?? 6) || a.order - b.order)
    .map(({part}) => {
      const preferred = part.evidence.find(p => p.kind === 'detail') || part.evidence[0];
      const bestFrame = BEST_FRAME[part.id] || 1;
      const activePhoto = presentation.photos.find(p => p.frame === bestFrame)
        || part.evidence.find(p => p.frame != null) || presentation.photos.find(p => p.frame != null);
      return {id: part.id, partId: part.id, title: part.name, outcome: part.outcome, process: part.process,
        summary: part.note || (part.outcome === 'inspected' ? processCopy(part.process) : OUTCOMES[part.outcome]),
        frame: activePhoto?.frame ?? null, photoId: preferred?.id ?? null};
    });
}
