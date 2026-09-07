import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PHOTO_MASKS, PHOTO_MASK_FRAMES, referenceMask, frameForPhotoPart} from '../src/photo-mask-domain.js';
import {makeDemoPresentation, fromApprovedReport} from '../src/presentation-domain.js';
import {partsFor} from '../src/pilot-domain.js';

const demo = () => structuredClone(makeDemoPresentation());
const expectedFrames = [1, 4, 7, 10, 13, 16, 19, 22];

test('only the eight traced reference frames enable photo separation', () => {
  const presentation = demo();
  assert.deepEqual(PHOTO_MASK_FRAMES, expectedFrames);
  for (let frame = 1; frame <= 24; frame++) {
    assert.equal(referenceMask(presentation, frame), expectedFrames.includes(frame) ? PHOTO_MASKS[frame] : null);
  }
  for (const frame of [0, 25, -1, 4.5, '4', undefined, null]) {
    assert.equal(referenceMask(presentation, frame), null, `Unsupported frame ${String(frame)}`);
  }
});

test('a matching profile, frame or filename cannot authorize customer photo masks', () => {
  const presentation = demo();
  for (const kind of ['approved', 'customer', 'draft', undefined]) {
    // Deliberately retain the exact demo report ID, photo IDs, URLs and profile.
    assert.equal(referenceMask({...presentation, kind}, 22), null);
  }
  for (const reportId of ['customer-report', '', undefined]) {
    assert.equal(referenceMask({...presentation, reportId}, 22), null);
  }
  for (const value of [null, undefined, {}, {profile: 'hatchback3'}]) {
    assert.equal(referenceMask(value, 22), null);
  }
});

test('approved service snapshots stay ineligible even with reference-like IDs and model', () => {
  const approved = fromApprovedReport({
    customerView: true, reportId: 'OTOTR-SUNUM-DEMO', approvedAt: '2026-09-08T12:00:00Z',
    session: {status: 'approved', profile: 'hatchback3', findings: {}, photo_slots: {'ring-22': 'demo-22'}},
    job: {plate: 'TEST 360', brand: 'Opel', model: 'ADAM'},
    photos: [{id: 'demo-22', slot: 'ring-22', kind: 'ring',
      url: 'https://example.test/real-car/frame-22.jpg'}],
  });
  assert.equal(approved.kind, 'approved');
  assert.equal(approved.photos[0].frame, 22);
  assert.equal(referenceMask(approved, 22), null);
  assert.equal(referenceMask({...approved, photos: demo().photos}, 22), null);
});

test('demo masks require the exact frame, photo ID, URL and illustrative marker together', () => {
  const mutations = [
    p => { p.photos.find(f => f.frame === 22).frame = 21; },
    p => { p.photos.find(f => f.frame === 22).id = 'customer-22'; },
    p => { p.photos.find(f => f.frame === 22).url = './real-car/frame-21.jpg'; },
    p => { p.photos.find(f => f.frame === 22).url = './real-car/frame-22.jpg?replacement=1'; },
    p => { p.photos.find(f => f.frame === 22).url = 'https://example.test/real-car/frame-22.jpg'; },
    p => { p.photos.find(f => f.frame === 22).illustrative = false; },
    p => { p.photos.find(f => f.frame === 22).illustrative = 'true'; },
    p => { delete p.photos.find(f => f.frame === 22).illustrative; },
    p => { p.photos = p.photos.filter(f => f.frame !== 22); },
    p => { delete p.photos; },
  ];
  for (const mutate of mutations) {
    const presentation = demo();
    mutate(presentation);
    assert.equal(referenceMask(presentation, 22), null);
  }
});

function assertSourcePixelPath(path, frame, label) {
  assert.equal(typeof path, 'string', label);
  assert.match(path.trim(), /^M[\s\d]/, label);
  assert.match(path.trim(), /Z$/, label);
  // This asset format uses only absolute source-pixel contours. Commands and
  // coordinates are checked independently, so markup/URLs cannot enter a path.
  assert.match(path, /^[MLCQZ\s\d.,+\-]+$/, label);
  const segments = [...path.matchAll(/([MLCQZ])([^MLCQZ]*)/g)];
  const arity = {M: 2, L: 2, C: 6, Q: 4, Z: 0};
  assert.ok(segments.length >= 4, label);
  for (const [, command, args] of segments) {
    const coordinates = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (command === 'Z') assert.equal(coordinates.length, 0, label);
    else {
      assert.ok(coordinates.length >= arity[command], label);
      assert.equal(coordinates.length % arity[command], 0, label);
    }
    coordinates.forEach((value, index) => {
      assert.ok(Number.isFinite(value) && value >= 0 && value <= (index % 2 ? frame.height : frame.width), label);
    });
  }
}

test('all masks contain bounded closed source contours and valid three-door part IDs', () => {
  const validIds = new Set(partsFor('hatchback3').map(p => p.id));
  for (const frame of Object.values(PHOTO_MASKS)) {
    assert.equal(frame.width, 1072);
    assert.equal(frame.height, 586);
    assert.equal(PHOTO_MASKS[frame.frame], frame);
    assert.ok(frame.parts.length >= 3);
    assert.equal(new Set(frame.parts.map(p => p.id)).size, frame.parts.length);
    for (const part of frame.parts) {
      const label = `Frame ${frame.frame}, ${part.id}`;
      assert.ok(validIds.has(part.id), label);
      assert.deepEqual(Object.keys(part).sort(), ['anchor', 'id', 'offset', 'path']);
      assertSourcePixelPath(part.path, frame, label);
      assert.equal(part.anchor.length, 2, label);
      part.anchor.forEach((value, index) => assert.ok(Number.isFinite(value) && value >= 0
        && value <= (index ? frame.height : frame.width), label));
      assert.equal(part.offset.length, 2, label);
      assert.ok(part.offset.every(value => Number.isFinite(value) && Math.abs(value) <= 128), label);
      assert.ok(Math.hypot(...part.offset) > 0, label);
    }
  }
});

test('main visible panels are covered without inventing rear doors or hidden mechanical components', () => {
  const visibleIds = new Set(Object.values(PHOTO_MASKS).flatMap(frame => frame.parts.map(p => p.id)));
  for (const id of ['hood', 'roof', 'trunk', 'front_bumper', 'rear_bumper', 'windshield', 'rear_glass',
    ...['left', 'right'].flatMap(side => ['front_door', 'front_fender', 'rear_fender', 'sill', 'mirror'].map(part => `${side}_${part}`))]) {
    assert.ok(visibleIds.has(id), id);
  }
  for (const id of ['left_rear_door', 'right_rear_door', 'engine', 'chassis', 'airbag']) {
    assert.equal(visibleIds.has(id), false, id);
    assert.equal(frameForPhotoPart(id), null, id);
  }
});

test('part navigation retains a visible current frame or chooses another frame that contains the part', () => {
  const visibleIds = new Set(Object.values(PHOTO_MASKS).flatMap(frame => frame.parts.map(p => p.id)));
  for (const id of visibleIds) {
    for (let current = 1; current <= 24; current++) {
      const selected = frameForPhotoPart(id, current);
      assert.ok(PHOTO_MASK_FRAMES.includes(selected), `${id}: ${selected}`);
      assert.ok(PHOTO_MASKS[selected].parts.some(p => p.id === id), `${id}: ${selected}`);
      if (PHOTO_MASKS[current]?.parts.some(p => p.id === id)) assert.equal(selected, current);
    }
  }
  for (const id of ['unknown-panel', '', 'left_unknown', 'right_unknown', '__proto__']) {
    for (const current of [1, 7, 22, 25]) assert.equal(frameForPhotoPart(id, current), null);
  }
});

test('all 24 original photographs are byte-for-byte unchanged from the source manifest', async () => {
  const base = new URL('../public/real-car/', import.meta.url);
  const source = JSON.parse(await readFile(new URL('source.json', base), 'utf8'));
  assert.equal(source.kind, 'photographic-spin');
  assert.equal(source.count, 24);
  assert.equal(source.frames.length, 24);
  assert.equal(new Set(source.frames.map(frame => frame.sha256)).size, 24);
  assert.deepEqual(source.frames.map(frame => frame.index), Array.from({length: 24}, (_, i) => i + 1));
  const photos = demo().photos;
  for (const frame of source.frames) {
    assert.equal(frame.file, `frame-${String(frame.index).padStart(2, '0')}.jpg`);
    assert.equal(frame.width, 1072);
    assert.equal(frame.height, 586);
    assert.equal(photos.find(photo => photo.frame === frame.index).url, `./real-car/${frame.file}`);
    const bytes = await readFile(new URL(frame.file, base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), frame.sha256, frame.file);
  }
});
