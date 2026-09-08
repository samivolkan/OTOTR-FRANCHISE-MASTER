import test from 'node:test';
import assert from 'node:assert/strict';
import { photoBodyReference } from '../src/photo-body-domain.js';
import { makeDemoPresentation } from '../src/presentation-domain.js';

test('Only the complete prepared reference receives photographic 3D surfaces', () => {
  const reference = photoBodyReference(makeDemoPresentation());
  assert.equal(reference.referenceId, 'ototr-adam-reference-v1');
  assert.deepEqual(reference.frames.map(f => f.frame), [1, 7, 13, 19]);
  assert.ok(Object.isFrozen(reference) && Object.isFrozen(reference.frames));
});
test('Customer reports cannot inherit reference textures even with copied demo metadata', () => {
  assert.equal(photoBodyReference({ ...makeDemoPresentation(), kind: 'approved' }), null);
  assert.equal(photoBodyReference({ ...makeDemoPresentation(), reportId: 'customer-report' }), null);
  assert.equal(photoBodyReference({ ...makeDemoPresentation(), profile: 'sedan4' }), null);
});
test('Changed, missing, duplicate or non-illustrative photographs reject the whole UV reference', () => {
  for (const mutate of [p => p.pop(), p => p[0].url = 'https://example.test/customer.jpg',
    p => p[0].id = 'customer-01', p => p[0].illustrative = false, p => p[23].frame = 1]) {
    const presentation = structuredClone(makeDemoPresentation());
    mutate(presentation.photos);
    assert.equal(photoBodyReference(presentation), null);
  }
  assert.equal(photoBodyReference(null), null);
});
