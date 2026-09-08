import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PARTS } from '../src/domain.js';
import { createPhotoBodyGeometry, flattenPhotoPath } from '../src/photo-body-geometry.js';

function dispose(car) {
  car.root.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
}

test('photo shell has exactly the 23 three-door body groups, with explicit authored provenance', () => {
  const car = createPhotoBodyGeometry();
  try {
    assert.deepEqual(Object.keys(car.groups).sort(), PARTS.filter(part => !part.id.endsWith('rear_door')).map(part => part.id).sort());
    assert.equal(car.root.userData.geometrySource, 'authored-photo-aligned-shell');
    assert.equal(car.root.userData.reconstructedFromPhotos, false);
    assert.equal(car.profile, 'hatchback3');
    const size = new THREE.Box3().setFromObject(car.root).getSize(new THREE.Vector3());
    assert.ok(size.x > 3.9 && size.x < 4.3, 'compact hatchback length');
    assert.ok(size.y > 1.6 && size.y < 1.9, 'coherent roof height');
    assert.ok(size.z > 1.75 && size.z < 2.3, 'width includes mirrors');
    for (const [id, group] of Object.entries(car.groups)) {
      assert.ok(group.children.some(child => child.isMesh), `${id} has a selectable surface`);
      for (const mesh of group.children.filter(child => child.isMesh)) {
        assert.equal(mesh.userData.partId, id); assert.equal(mesh.userData.pickable, true);
        assert.equal(mesh.userData.presentationPaint, false, 'finding tint must not repaint original photo pixels');
      }
    }
  } finally { dispose(car); }
});

test('every photographed UV is a direct original pixel mapping and all declared frames are used', () => {
  const car = createPhotoBodyGeometry(), frames = new Set();
  try {
    car.root.traverse(mesh => {
      if (!mesh.isMesh) return;
      const positions = mesh.geometry.getAttribute('position'), normals = mesh.geometry.getAttribute('normal');
      assert.ok([...positions.array].every(Number.isFinite), `${mesh.userData.partId} finite vertices`);
      assert.ok([...normals.array].every(Number.isFinite), `${mesh.userData.partId} finite normals`);
      if (!mesh.userData.photoSurface) return;
      frames.add(mesh.userData.photoFrame);
      assert.equal(mesh.material.type, 'MeshBasicMaterial');
      assert.equal(mesh.material.color.getHexString(), 'ffffff');
      assert.equal(mesh.material.toneMapped, false, 'original exposure is preserved');
      const uv = mesh.geometry.getAttribute('uv'), source = mesh.geometry.getAttribute('sourcePixel');
      assert.equal(uv.count, positions.count); assert.equal(source.count, positions.count);
      for (let i = 0; i < uv.count; i++) {
        assert.ok(uv.getX(i) >= 0 && uv.getX(i) <= 1 && uv.getY(i) >= 0 && uv.getY(i) <= 1);
        assert.ok(Math.abs(uv.getX(i) * 1072 - source.getX(i)) < .00015);
        assert.ok(Math.abs((1 - uv.getY(i)) * 586 - source.getY(i)) < .0001);
      }
      assert.ok(mesh.geometry.userData.outlinePositions.length >= 9, 'clean original contour is available for selection');
    });
    assert.deepEqual([...frames].sort((a, b) => a - b), car.sourceFrames);
    assert.deepEqual(car.sourceFrames, [1, 7, 13, 19]);
  } finally { dispose(car); }
});

test('photo side panels have real curvature, roof top and panel insides carry no invented photograph', () => {
  const car = createPhotoBodyGeometry();
  try {
    for (const side of ['left', 'right']) {
      const fender = car.groups[`${side}_front_fender`].children.find(mesh => mesh.userData.photoSurface && mesh.userData.photoFrame !== 1);
      const bounds = new THREE.Box3().setFromObject(fender);
      assert.ok(bounds.max.z - bounds.min.z > .15, 'fender curves into bonnet shoulder');
      assert.ok(fender.geometry.getAttribute('position').count > 200, 'subdivided photo surface avoids flat corner-only deformation');
    }
    const roof = car.groups.roof.children.find(mesh => mesh.userData.uncapturedSurface);
    assert.ok(roof); assert.equal(roof.userData.photoSurface, false); assert.equal(roof.material.map, null);
    const backs = car.meshes.filter(mesh => mesh.userData.neutralBack || mesh.userData.neutralEdge);
    assert.ok(backs.length > 30);
    for (const mesh of backs) { assert.equal(mesh.userData.photoSurface, false); assert.equal(mesh.material.map, null); }
    const wheelPhotos = car.root.children.filter(mesh => mesh.isMesh && mesh.userData.photographicDetail);
    assert.equal(wheelPhotos.length, 4);
    for (const wheel of wheelPhotos) assert.equal(wheel.userData.pickable, false, 'context wheels are not unsupported bodywork findings');
  } finally { dispose(car); }
});

test('ray picks hit visible original door and quarter surfaces on both sides without rear-door holes', () => {
  const car = createPhotoBodyGeometry();
  try {
    car.root.updateMatrixWorld(true);
    for (const side of ['left', 'right']) {
      const sign = side === 'left' ? 1 : -1;
      for (const [x, y, suffix] of [[-.45, .70, 'front_door'], [.45, .70, 'front_door'], [1.01, 1.02, 'rear_fender']]) {
        const ray = new THREE.Raycaster(new THREE.Vector3(x, y, 3 * sign), new THREE.Vector3(0, 0, -sign));
        const hit = ray.intersectObjects(car.meshes, false)[0];
        assert.equal(hit?.object.userData.partId, `${side}_${suffix}`);
        assert.equal(hit?.object.userData.photoSurface, true, 'the visible photographic skin is picked before its neutral reverse');
      }
    }
  } finally { dispose(car); }
});

test('source contour parser handles absolute curves without requiring browser DOM', () => {
  const points = flattenPhotoPath('M10 10 L20 10 Q30 10 30 20 C30 30 20 30 10 20 Z', 5);
  assert.equal(points.length, 12);
  assert.deepEqual(points[0].toArray(), [10, 10]);
  assert.deepEqual(points.at(-1).toArray(), [10, 20]);
});
