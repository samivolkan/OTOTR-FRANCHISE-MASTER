import {partsFor, SHOTS} from './pilot-domain.js';
import {validPolygon} from './studio-domain.js';

export const COVERAGE_LABELS = {
  ready:'Kesit hazır', draft:'Kesit kontrolü', stale:'Kaynağı yenile',
  missing:'Sınır çizilecek', evidence:'Kanıt bağlanacak'
};

// This is preparation coverage, never an inspection outcome or an approval gate.
export function studioReadiness(plan, session, photos) {
  const byId = new Map(photos.map(p => [p.id, p]));
  const active = p => p && (p.kind === 'detail' || session.photo_slots?.[p.slot] === p.id);
  const rows = partsFor(session.profile).map(part => {
    const evidenceIds = session.findings?.[part.id]?.evidenceIds || [];
    const bindings = (plan.bindings || []).filter(b => b.partId === part.id);
    const usable = bindings.filter(b => {
      const p = byId.get(b.photoId);
      return active(p) && p.sha256 === b.sha256 && validPolygon(b.points)
        && (p.kind !== 'detail' || evidenceIds.includes(p.id));
    });
    const ready = usable.find(b => b.reviewed === true);
    const draft = usable.find(b => b.reviewed === false);
    const evidence = evidenceIds.map(id => byId.get(id)).filter(active);
    const state = ready ? 'ready' : draft ? 'draft' : bindings.length ? 'stale' : evidence.length ? 'missing' : 'evidence';
    // Only an existing contour or a same-part evidence link recommends a source.
    const sourceId = ready?.photoId || draft?.photoId || evidence[0]?.id || '';
    return {...part, state, sourceId, evidenceCount:evidence.length, cutoutCount:usable.filter(b=>b.reviewed===true).length};
  });
  const priority = ['stale','draft','missing','evidence'];
  const next = priority.flatMap(state => rows.filter(r => r.state === state))[0] || null;
  const capture = SHOTS.map(shot => {
    const photo = byId.get(session.photo_slots?.[shot.id]);
    const check = plan.checks?.[photo?.id];
    const checked = !!photo && check?.sha256 === photo.sha256 && check.identity === true && check.angle === true && check.quality === true;
    return {...shot, state:!photo?'missing':checked?'checked':'review'};
  });
  return {rows, next, ready:rows.filter(r=>r.state==='ready').length,
    counts:Object.fromEntries(Object.keys(COVERAGE_LABELS).map(state=>[state,rows.filter(r=>r.state===state).length])),
    capture, captured:capture.filter(s=>s.state!=='missing').length,
    checked:capture.filter(s=>s.state==='checked').length,
    nextShot:capture.find(s=>s.state==='missing') || capture.find(s=>s.state==='review') || null};
}
