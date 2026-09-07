import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createPresentationGeometry, presentationOffset, PresentationCar } from '../src/presentation-car.js';
import { PARTS } from '../src/domain.js';

function dispose(car) {
  car.root.traverse(object => {
    object.geometry?.dispose();
    if (object.material) object.material.dispose();
  });
}

test('three-door template has 23 selectable parts and continuous metal where rear doors were', () => {
  const car = createPresentationGeometry('hatchback3');
  try {
    assert.equal(Object.keys(car.groups).length, 23);
    assert.equal(car.groups.left_rear_door, undefined);
    assert.equal(car.groups.right_rear_door, undefined);
    car.root.updateMatrixWorld(true);
    for (const side of ['left', 'right']) {
      const sign = side === 'left' ? 1 : -1;
      for (const [x, expected] of [[-.50, 'front_door'], [.30, 'front_door'], [.70, 'rear_fender'], [.90, 'rear_fender']]) {
        const ray = new THREE.Raycaster(new THREE.Vector3(x, .72, 2 * sign), new THREE.Vector3(0, 0, -sign));
        const hit = ray.intersectObjects(car.meshes, false)[0];
        assert.equal(hit?.object.userData.partId, `${side}_${expected}`, `solid ${side} panel at x=${x}`);
      }
    }
    for (const [id, group] of Object.entries(car.groups)) {
      assert.ok(group.children.length > 0, `${id} has geometry`);
      for (const mesh of car.meshes.filter(mesh => mesh.userData.partId === id)) {
        assert.ok(mesh.userData.pickable);
        const positions = mesh.geometry.getAttribute('position');
        assert.ok([...positions.array].every(Number.isFinite), `${id} has finite vertices`);
      }
    }
    assert.equal(car.root.userData.reconstructedFromPhotos, false);
  } finally { dispose(car); }
});

test('five-door and sedan layouts retain all 25 ids with independent panel materials', () => {
  for (const profile of ['sedan4', 'hatchback5', 'suv5']) {
    const car = createPresentationGeometry(profile);
    try {
      assert.deepEqual(Object.keys(car.groups).sort(), PARTS.map(part => part.id).sort());
      const materialOwners = new Map();
      for (const mesh of car.meshes) {
        const previous = materialOwners.get(mesh.material);
        assert.ok(!previous || previous === mesh.userData.partId, 'selection and fading cannot leak across panels');
        materialOwners.set(mesh.material, mesh.userData.partId);
      }
    } finally { dispose(car); }
  }
  assert.throws(() => createPresentationGeometry('unknown'), /gövdesi/);
});

test('explosion keeps assemblies bounded, clamp-safe, and on their original side', () => {
  for (const part of PARTS) {
    assert.equal(presentationOffset(part.id, 0).length(), 0);
    assert.equal(presentationOffset(part.id, -2).length(), 0);
    assert.equal(presentationOffset(part.id, NaN).length(), 0);
    const full = presentationOffset(part.id, 1);
    assert.ok(full.length() > .5 && full.length() < 1.5);
    assert.deepEqual(presentationOffset(part.id, 2).toArray(), full.toArray());
    if (part.id.startsWith('left')) assert.ok(full.z > 0);
    if (part.id.startsWith('right')) assert.ok(full.z < 0);
  }
  assert.ok(presentationOffset('hood').y > 0);
  assert.ok(presentationOffset('front_bumper').x < 0);
  assert.ok(presentationOffset('rear_bumper').x > 0);
});

test('mobile focus frames all exploded bounds below the HUD after a desktop-to-mobile resize', () => {
  const car = createPresentationGeometry('hatchback3');
  try {
    car.root.updateMatrixWorld(true);
    for (const [width, height] of [[364, 366], [390, 390], [520, 350]]) {
      const camera = new THREE.PerspectiveCamera(34, width / height, .05, 70);
      const safeTop = Math.min(112, height * .32), safeBottom = 38;
      camera.setViewOffset(width, height, 0, -(safeTop - safeBottom) / 2, width, height);
      const viewer = {
        camera, safeTop, safeBottom, host: { clientWidth: width, clientHeight: height }, controls: { minDistance: 3.2 },
        bodyBounds: new THREE.Box3().setFromObject(car.root),
        partBounds: new Map(Object.entries(car.groups).map(([id, group]) => [id, new THREE.Box3().setFromObject(group)])),
        mode: 'exploded', selected: 'left_front_door', explodeAmount: .72,
        targetOffset: PresentationCar.prototype.targetOffset,
      };
      const fitted = PresentationCar.prototype.fitCompactView.call(viewer, new THREE.Vector3(-.36, .35, 1));
      camera.position.copy(fitted.position); camera.lookAt(fitted.target); camera.updateMatrixWorld(true);
      for (const [id, base] of viewer.partBounds) {
        const bounds = base.clone().translate(viewer.targetOffset(id));
        for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
          const projected = new THREE.Vector3(x, y, z).project(camera);
          const u = (projected.x + 1) / 2, v = (1 - projected.y) / 2;
          assert.ok(u >= 0 && u <= 1, `${width}px ${id} stays inside horizontal frame`);
          assert.ok(v >= safeTop / height && v <= 1 - safeBottom / height, `${width}px ${id} avoids HUD and caption`);
        }
      }
    }
  } finally { dispose(car); }
});
