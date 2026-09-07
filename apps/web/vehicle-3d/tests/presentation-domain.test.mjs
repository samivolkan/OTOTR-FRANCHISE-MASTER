import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemoPresentation, fromApprovedReport, getSummary, buildTour, processCopy} from '../src/presentation-domain.js';

function fixture() {
  return {customerView: true, approvedAt: '2026-09-08T12:00:00Z', approvedBy: 'Teknik sorumlu', reportId: 'report-a',
    session: {status: 'approved', profile: 'hatchback3', photo_slots: {'ring-19': 'left-photo'}, findings: {
      left_front_door: {outcome: 'inspected', process: 'painted', defects: ['scratch'], measurements: [240, 262, 259],
        note: 'Kapı boya işlemi; bağlı yakın planı inceleyin.', evidenceIds: ['door-detail'],
        annotations: [{photoId: 'door-detail', x: .2, y: .3, w: .15, h: .18}]}
    }}, job: {plate: 'TEST 360', brand: 'Opel', model: 'ADAM', work_order_no: 'TEST-001'}, photos: [
      {id: 'left-photo', slot: 'ring-19', kind: 'ring', url: 'https://example.supabase.co/storage/v1/object/sign/kaporta-360/session/left.jpg?token=test'},
      {id: 'door-detail', slot: 'detail-door', kind: 'detail', url: 'https://example.supabase.co/storage/v1/object/sign/kaporta-360/session/door.jpg?token=test'}
    ]};
}

test('demo preserves the 24 actual reference frames and 23-part three-door profile', () => {
  const p = makeDemoPresentation();
  assert.equal(p.kind, 'demo');
  assert.equal(p.parts.length, 23);
  assert.ok(p.parts.every(p => !['left_rear_door', 'right_rear_door'].includes(p.id)));
  assert.deepEqual(p.photos.map(p => p.url), Array.from({length: 24}, (_, i) => `./real-car/frame-${String(i + 1).padStart(2, '0')}.jpg`));
  assert.equal(new Set(p.photos.map(p => p.id)).size, 24);
  assert.ok(p.photos.every(p => p.kind === 'ring' && p.illustrative && p.caption.includes('Hasar kanıtı değildir')));
  assert.ok(p.parts.flatMap(p => p.evidence).every(p => p.kind === 'ring' && p.annotations.length === 0));
  assert.match(p.disclaimer, /temsili/);
  assert.equal(p.source.photographyCredit, 'SpinFrame');
  assert.equal(p.source.commercialReusePermissionVerified, false);
  assert.equal(p.approvedAt, null);
  assert.equal(getSummary(p).affected, 3);
  assert.equal(getSummary(p).unchecked, 20);
});

test('approved snapshots retain their own content and never receive demo defaults', () => {
  const p = fromApprovedReport(fixture());
  assert.equal(p.kind, 'approved');
  assert.equal(p.vehicle.plate, 'TEST 360');
  assert.equal(p.photos.length, 2);
  assert.equal(p.parts.find(p => p.id === 'hood').outcome, 'unchecked');
  assert.equal(p.parts.find(p => p.id === 'hood').process, 'none');
  assert.deepEqual(p.parts.find(p => p.id === 'hood').measurements, []);
  assert.deepEqual(p.parts.find(p => p.id === 'hood').evidence, []);
  const door = p.parts.find(p => p.id === 'left_front_door');
  assert.equal(door.evidence[0].id, 'door-detail');
  assert.deepEqual(door.evidence[0].annotations, fixture().session.findings.left_front_door.annotations);
  assert.equal(p.source, undefined);
  assert.doesNotMatch(JSON.stringify(p), /real-car|demo-19|248/);
  assert.equal(getSummary(p).byProcess.painted, 1);
});

test('report adapter rejects unapproved and unknown-profile payloads', () => {
  for (const mutate of [r => delete r.customerView, r => r.customerView = 'true', r => r.session.status = 'review',
    r => r.session.status = 'draft', r => delete r.approvedAt, r => r.approvedAt = 'nonsense',
    r => r.session.profile = 'convertible', r => r.session.profile = '__proto__']) {
    const report = fixture(); mutate(report);
    assert.throws(() => fromApprovedReport(report), /onaylı/);
  }
  for (const value of [null, [], {}, 'report']) assert.throws(() => fromApprovedReport(value));
});

test('absent report content remains unchecked and has no substitute photographs', () => {
  const report = fixture(); report.photos = []; report.session.findings = {}; report.job = {};
  const p = fromApprovedReport(report);
  assert.equal(p.photos.length, 0);
  assert.equal(p.vehicle.label, 'Rapor aracı');
  assert.equal(getSummary(p).unchecked, 23);
  assert.equal(getSummary(p).byProcess.original, 0);
  assert.equal(buildTour(p).length, 0);
});

test('only known parts and linked photo ids survive; annotations cannot point at other evidence', () => {
  const report = fixture();
  report.session.findings.hidden_chassis = {outcome: 'inspected', process: 'replaced', evidenceIds: ['unrelated-photo']};
  report.session.findings.left_front_door.annotations.push({photoId: 'left-photo', x: .1, y: .1, w: .1, h: .1},
    {photoId: 'door-detail', x: .8, y: .8, w: .5, h: .5});
  report.photos.push({id: 'unrelated-photo', slot: 'detail-secret', kind: 'detail', url: 'https://example.com/secret.jpg'});
  const p = fromApprovedReport(report);
  assert.ok(p.parts.every(p => p.id !== 'hidden_chassis'));
  assert.ok(p.photos.every(p => p.id !== 'unrelated-photo'));
  assert.equal(p.parts.find(p => p.id === 'left_front_door').evidence[0].annotations.length, 1);
});

test('photo URLs reject executable, relative, credentialed, blob and HTML forms', () => {
  for (const url of ['javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>', '//evil.example/image.jpg',
    './real-car/frame-01.jpg', 'blob:https://example.com/id', 'http://example.com/a.jpg',
    'https://user:password@example.com/a.jpg', 'https://example.com/a.jpg\" onerror=alert(1)',
    'https://example.com/a.jpg#javascript:alert(1)', 'https:\\evil.example\\a.jpg']) {
    const report = fixture(); report.photos[1].url = url;
    const p = fromApprovedReport(report);
    assert.equal(p.parts.find(p => p.id === 'left_front_door').evidence.length, 0, url);
  }
  const report = fixture(); report.session.findings.left_front_door.note = '<img src=x onerror=alert(1)>';
  assert.equal(fromApprovedReport(report).parts.find(p => p.id === 'left_front_door').note, '<img src=x onerror=alert(1)>', 'Notes remain plain text for escaped UI rendering');
});

test('inaccessible and not-applicable do not become original, repaired or inspected', () => {
  const report = fixture();
  report.session.findings.hood = {outcome: 'inaccessible', process: 'original', defects: ['scratch'], measurements: [112], note: 'Kaput yüzeyi görülemedi.'};
  report.session.findings.roof = {outcome: 'not_applicable', process: 'replaced', note: 'Bu parça kapsam dışında.'};
  const p = fromApprovedReport(report), summary = getSummary(p);
  assert.equal(summary.inspected, 1); assert.equal(summary.inaccessible, 1); assert.equal(summary.notApplicable, 1);
  assert.equal(summary.byProcess.original, 0); assert.equal(summary.affected, 1);
  assert.equal(p.parts.find(p => p.id === 'hood').process, 'none');
  assert.deepEqual(p.parts.find(p => p.id === 'hood').measurements, []);
  assert.equal(buildTour(p, {findingsOnly: false}).length, 3);
});

test('measurement values cannot derive a paint, replacement or risk classification', () => {
  const report = fixture();
  report.session.findings.hood = {outcome: 'inspected', measurements: [900, 1200, 1800], note: 'Sonuç alanı eksik.'};
  report.session.findings.front_bumper = {outcome: 'inspected', process: 'original', measurements: [240]};
  const p = fromApprovedReport(report);
  assert.equal(p.parts.find(p => p.id === 'hood').process, 'none');
  assert.deepEqual(p.parts.find(p => p.id === 'front_bumper').measurements, []);
  assert.equal(getSummary(p).affected, 1);
  assert.match(processCopy('painted'), /tek başına/);
  assert.match(processCopy('replaced'), /yalnız boya kalınlığından çıkarılmaz/);
  assert.equal(processCopy('__proto__'), processCopy('none'));
  assert.equal(typeof p.parts.find(p => p.id === 'left_front_door').explanation, 'string');
  assert.equal('riskScore' in p, false);
});

test('tour is deterministic, has real linked evidence, and uses active frames', () => {
  const demo = makeDemoPresentation();
  assert.deepEqual(buildTour(demo).map(p => p.partId), ['left_front_fender', 'rear_bumper', 'left_front_door']);
  assert.deepEqual(buildTour(demo), buildTour(demo));
  const report = fixture();
  report.photos.push({id: 'old-left', slot: 'ring-19', kind: 'ring', url: 'https://example.com/old.jpg'});
  report.session.findings.left_front_door.evidenceIds.push('old-left');
  const p = fromApprovedReport(report);
  assert.equal(p.photos.find(p => p.id === 'old-left').frame, null);
  assert.equal(p.photos.find(p => p.id === 'left-photo').frame, 19);
  assert.equal(buildTour(p)[0].photoId, 'door-detail');
  assert.equal(buildTour(p)[0].frame, 19);
  assert.equal(report.photos.length, 3, 'Input remains intact');
});

test('normalized presentation is read-only without freezing or mutating caller data', () => {
  const report = fixture(), p = fromApprovedReport(report);
  assert.ok(Object.isFrozen(p)); assert.ok(Object.isFrozen(p.parts[0]));
  assert.throws(() => p.parts[0].process = 'original', TypeError);
  assert.equal(Object.isFrozen(report), false);
  report.job.plate = 'CHANGED';
  assert.equal(p.vehicle.plate, 'TEST 360');
});
