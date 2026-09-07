import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createCar } from './car.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const SILVER = new THREE.Color('#9aa6b0');
const AMBER = new THREE.Color('#cc934c');
const MODES = new Set(['assembled', 'exploded', 'isolate']);
const PROFILES = new Set(['hatchback3', 'hatchback5', 'sedan4', 'suv5']);

function disposeObject(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
    object.shadow?.map?.dispose();
  });
  textures.forEach(texture => texture.dispose());
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
}

function compactMeshes(root, groups) {
  root.updateMatrixWorld(true);
  const batches = new Map();
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    const material = mesh.material, id = mesh.userData.partId || '';
    const key = [id, material.type, material.color?.getHexString(), material.emissive?.getHexString(),
      material.emissiveIntensity, material.metalness, material.roughness, material.side, mesh.userData.presentationPaint].join(':');
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(mesh);
  });
  for (const meshes of batches.values()) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map(mesh => {
      const clone = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      clone.applyMatrix4(mesh.matrixWorld);
      if (!clone.hasAttribute('uv')) clone.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(clone.getAttribute('position').count * 2), 2));
      return clone;
    });
    const merged = mergeGeometries(geometries);
    geometries.forEach(geometry => geometry.dispose());
    if (!merged) continue;
    const first = meshes[0], replacement = new THREE.Mesh(merged, first.material.clone());
    replacement.userData = { ...first.userData };
    replacement.castShadow = true; replacement.receiveShadow = true;
    for (const mesh of meshes) { mesh.parent.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); }
    (groups[first.userData.partId] || root).add(replacement);
  }
}

/** Authored presentation geometry. It never derives dimensions or damage from photographs. */
export function createPresentationGeometry(profile = 'hatchback3') {
  if (!PROFILES.has(profile)) throw new Error('Desteklenmeyen araç gövdesi.');
  const car = createCar();
  const retiredMaterials = new Set();
  car.root.traverse(object => {
    if (!object.isMesh) return;
    retiredMaterials.add(object.material);
    // Separate materials prevent one selected door from tinting every window or trim.
    object.material = object.userData.paintable
      ? new THREE.MeshPhysicalMaterial({ color: SILVER, metalness: .74, roughness: .25,
        clearcoat: 1, clearcoatRoughness: .17, envMapIntensity: 1.12, side: THREE.DoubleSide })
      : object.material.clone();
    object.userData.presentationPaint = Boolean(object.userData.paintable);
    object.userData.originalOpacity = object.material.opacity;
    object.userData.pickable = Boolean(object.userData.partId);
  });
  retiredMaterials.forEach(material => material.dispose());

  function clear(group) {
    for (const child of [...group.children]) { group.remove(child); disposeObject(child); }
  }
  function paint() {
    return new THREE.MeshPhysicalMaterial({ color: SILVER, metalness: .74, roughness: .25,
      clearcoat: 1, clearcoatRoughness: .17, side: THREE.DoubleSide });
  }
  function attach(geometry, material, group, painted = false) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { partId: group.name, pickable: true, presentationPaint: painted, originalOpacity: 1 };
    group.add(mesh); return mesh;
  }
  function panel(points, side, group) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .022, bevelEnabled: true,
      bevelSegments: 3, steps: 1, bevelSize: .009, bevelThickness: .009 });
    const mesh = attach(geometry, paint(), group, true);
    mesh.position.z = side > 0 ? .875 : -.897;
    return mesh;
  }
  function glazing(points, side, group) {
    const vertices = points.flatMap(([x, y]) => [x, y, side * (.873 - (y - 1.06) * .325)]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const indices = [];
    for (let i = 1; i < points.length - 1; i++) indices.push(0, i, i + 1);
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return attach(geometry, new THREE.MeshPhysicalMaterial({ color: '#23313a', metalness: .35,
      roughness: .12, clearcoat: 1, side: THREE.DoubleSide }), group);
  }
  function tube(points, group, radius = .022, material = paint(), painted = true) {
    return attach(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point => V(...point))), 28, radius, 8, false), material, group, painted);
  }
  if (profile === 'hatchback3') {
    // One long door and one continuous rear quarter per side. Rear-door geometry is
    // replaced, not hidden: the assembled body therefore has no missing door holes.
    for (const side of ['left', 'right']) {
      const sign = side === 'left' ? 1 : -1;
      const door = car.groups[`${side}_front_door`];
      const quarter = car.groups[`${side}_rear_fender`];
      const rearDoor = car.groups[`${side}_rear_door`];
      clear(door); clear(quarter); clear(rearDoor);
      car.root.remove(rearDoor); delete car.groups[rearDoor.name];
      panel([[-.864, 1.04], [.525, 1.065], [.525, .485], [-.864, .48]], sign, door);
      glazing([[-.797, 1.098], [-.302, 1.487], [.48, 1.473], [.48, 1.098]], sign, door);
      tube([[.26, .97, sign * .914], [.42, .97, sign * .914]], door, .018,
        new THREE.MeshStandardMaterial({ color: '#cbd0d3', metalness: .96, roughness: .2 }), false);
      const rearPoints = [[.565, 1.065], [1.37, 1.083], [2.20, .945], [2.27, .52], [1.99, .48]];
      for (let i = 0; i <= 36; i++) {
        const a = i / 36 * Math.PI;
        rearPoints.push([1.49 + Math.cos(a) * .49, .47 + Math.sin(a) * .49]);
      }
      rearPoints.push([.565, .485]);
      panel(rearPoints, sign, quarter);
      glazing([[.603, 1.098], [.603, 1.472], [.76, 1.458], [1.125, 1.098]], sign, quarter);
      // Shoulder closes the top edge of the continuous rear quarter.
      const shoulder = new THREE.BufferGeometry();
      shoulder.setAttribute('position', new THREE.Float32BufferAttribute([
        1.31, 1.06, sign * .84, 1.31, 1.045, sign * .881,
        1.50, 1.05, sign * .825, 1.50, 1.035, sign * .881,
        2.20, .958, sign * .77, 2.20, .943, sign * .881,
      ], 3));
      shoulder.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4]); shoulder.computeVertexNormals();
      attach(shoulder, paint(), quarter, true);
      clear(car.groups[`${side}_b_pillar`]);
      tube([[.55, 1.08, sign * .870], [.55, 1.49, sign * .736]], car.groups[`${side}_b_pillar`], .028);
    }
  }
  // Painted surfaces carry inspection semantics; wheels and the plain dark base
  // are context only. No internal mechanical components are inferred or exposed.
  compactMeshes(car.root, car.groups);
  car.meshes = [];
  for (const [id, group] of Object.entries(car.groups)) {
    group.userData.partId = id;
    group.traverse(object => {
      if (!object.isMesh) return;
      object.userData.partId = id; object.userData.pickable = true;
      car.meshes.push(object);
    });
  }
  car.root.userData = { geometrySource: 'authored-semantic-template', reconstructedFromPhotos: false, profile };
  return car;
}

export function presentationOffset(id, amount = 1) {
  const a = THREE.MathUtils.clamp(Number.isFinite(amount) ? amount : 0, 0, 1);
  if (id.startsWith('left') || id.startsWith('right')) {
    const side = id.startsWith('left') ? 1 : -1;
    if (id.includes('mirror')) return V(-.12, .15, side * 1.05).multiplyScalar(a);
    if (id.includes('pillar')) return V(0, .47, side * .68).multiplyScalar(a);
    if (id.includes('sill')) return V(0, -.16, side * .77).multiplyScalar(a);
    if (id.includes('front_fender')) return V(-.36, .16, side * .72).multiplyScalar(a);
    if (id.includes('rear_fender')) return V(.38, .22, side * .80).multiplyScalar(a);
    return V(id.includes('rear_door') ? .20 : -.07, .12, side * .99).multiplyScalar(a);
  }
  return ({ hood: V(-.43, .83, 0), roof: V(.02, 1.16, 0), trunk: V(.54, .71, 0),
    front_bumper: V(-.96, -.02, 0), rear_bumper: V(1.04, -.02, 0),
    windshield: V(-.44, .59, 0), rear_glass: V(.51, .62, 0) }[id] || V()).multiplyScalar(a);
}

export class PresentationCar {
  constructor(host, { profile = 'hatchback3', onSelect = () => {} } = {}) {
    if (!PROFILES.has(profile)) throw new Error('Desteklenmeyen araç gövdesi.');
    if (!host?.append) throw new Error('3D görünüm alanı bulunamadı.');
    this.host = host; this.profile = profile; this.onSelect = onSelect;
    this.mode = 'assembled'; this.explodeAmount = 1; this.ghost = false; this.selected = null;
    this.findings = {}; this.disposed = false; this.contextLost = false; this.events = [];
    this.activePointers = new Set(); this.tap = null; this.cameraFlight = null;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.04;
    const canvas = this.renderer.domElement;
    canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block';
    canvas.style.touchAction = 'none'; canvas.style.cursor = 'grab';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Temsili üç boyutlu kaporta. Döndürmek için sürükleyin, parçayı ayırmak için dokunun. Parça listesiyle klavye seçimi de yapılabilir.');
    host.append(canvas); host.dataset.rendererState = 'ready';
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#171b1e');
    this.scene.fog = new THREE.Fog('#171b1e', 13, 31);
    const pmrem = new THREE.PMREMGenerator(this.renderer), room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, .045);
    this.scene.environment = this.environment.texture; this.scene.environmentIntensity = .78;
    room.dispose(); pmrem.dispose();
    this.camera = new THREE.PerspectiveCamera(34, 1, .05, 70);
    this.camera.position.set(-5.9, 3.2, 5.7);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, .85, 0); this.controls.enableDamping = !this.reducedMotion; this.controls.dampingFactor = .09;
    this.controls.minDistance = 3.2; this.controls.maxDistance = 14; this.controls.maxPolarAngle = Math.PI / 2 - .035;
    this.controls.enablePan = false; this.controls.autoRotateSpeed = .48;
    this.listenControls = () => { this.cameraFlight = null; };
    this.controls.addEventListener('start', this.listenControls);
    this.scene.add(new THREE.HemisphereLight('#e7eff6', '#26231f', .72));
    const key = new THREE.DirectionalLight('#fff4e6', 2.6); key.position.set(-3, 7, 5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6; key.shadow.camera.near = .1; key.shadow.camera.far = 25;
    key.shadow.normalBias = .025; key.shadow.bias = -.00015; this.scene.add(key);
    const rim = new THREE.DirectionalLight('#c1d6ee', 1.8); rim.position.set(4, 5, -4); this.scene.add(rim);
    const front = new THREE.DirectionalLight('#f0eee8', .72); front.position.set(-6, 2, -2); this.scene.add(front);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ color: '#171b1e' }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = .026; this.scene.add(floor);
    const shadows = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.ShadowMaterial({ opacity: .36, depthWrite: false }));
    shadows.rotation.x = -Math.PI / 2; shadows.position.y = .027; shadows.receiveShadow = true; this.scene.add(shadows);
    // A layered radial decal adds contact grounding without fabricating vehicle internals.
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
    const context = shadowCanvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0,0,0,.65)'); gradient.addColorStop(.65, 'rgba(0,0,0,.28)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 3.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
    contact.rotation.x = -Math.PI / 2; contact.position.y = .028; this.scene.add(contact);
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.40, 3.41, 144), new THREE.MeshBasicMaterial({ color: '#8a969f', transparent: true, opacity: .10, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .031; this.scene.add(ring);
    this.car = createPresentationGeometry(profile); this.scene.add(this.car.root);
    this.centers = new Map(); this.partBounds = new Map(); this.tethers = new Map(); this.markers = new Map();
    this.car.root.updateMatrixWorld(true);
    this.bodyBounds = new THREE.Box3().setFromObject(this.car.root);
    for (const [id, group] of Object.entries(this.car.groups)) {
      const bounds = new THREE.Box3().setFromObject(group);
      this.partBounds.set(id, bounds);
      const anchor = bounds.getCenter(V());
      // A bounding-box center can fall inside a wheel opening. Keep finding markers
      // and labels anchored to the actual fender sheet, above the wheel arch.
      if (id.includes('front_fender')) anchor.set(-1.10, .95, id.startsWith('left') ? .91 : -.91);
      if (id.includes('rear_fender')) anchor.set(1.25, 1.045, id.startsWith('left') ? .91 : -.91);
      this.centers.set(id, anchor);
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
      const tether = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#b4c0c7', transparent: true, opacity: .2, depthWrite: false }));
      tether.frustumCulled = false; tether.visible = false; this.scene.add(tether); this.tethers.set(id, tether);
      const marker = new THREE.Mesh(new THREE.TorusGeometry(.035, .009, 6, 20), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: .95, depthTest: true }));
      marker.visible = false; this.scene.add(marker); this.markers.set(id, marker);
    }
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    const listen = (target, type, callback, options) => {
      target.addEventListener(type, callback, options); this.events.push(() => target.removeEventListener(type, callback, options));
    };
    listen(canvas, 'pointerdown', event => {
      this.activePointers.add(event.pointerId);
      this.tap = this.activePointers.size === 1 && event.button === 0
        ? { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false } : null;
      if (this.activePointers.size > 1) this.tap = null;
    });
    listen(canvas, 'pointermove', event => {
      if (this.tap && Math.hypot(event.clientX - this.tap.x, event.clientY - this.tap.y) > 7) this.tap.moved = true;
      if (!this.activePointers.size && event.pointerType !== 'touch') canvas.style.cursor = this.hit(event) ? 'pointer' : 'grab';
    });
    listen(window, 'pointerup', event => {
      const tap = this.tap; this.activePointers.delete(event.pointerId); this.tap = null;
      if (!tap || tap.id !== event.pointerId || tap.moved || this.activePointers.size || Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 7) return;
      const hit = this.hit(event);
      if (hit) { const id = hit.object.userData.partId; this.selectPart(id); this.onSelect(id); }
    });
    for (const name of ['pointercancel', 'lostpointercapture']) listen(canvas, name, event => {
      this.activePointers.delete(event.pointerId); this.tap = null;
    });
    listen(window, 'blur', () => { this.activePointers.clear(); this.tap = null; });
    listen(canvas, 'webglcontextlost', event => {
      event.preventDefault(); this.contextLost = true; host.dataset.rendererState = 'lost';
      host.dispatchEvent(new CustomEvent('presentation-error', { detail: { code: 'context-lost', message: '3D görünüm kesildi. Fotoğrafları ve parça listesini kullanabilir veya görünümü yeniden açabilirsiniz.' } }));
    });
    listen(canvas, 'webglcontextrestored', () => { this.contextLost = false; host.dataset.rendererState = 'ready'; this.resize(); });
    listen(this.motionQuery, 'change', event => {
      this.reducedMotion = event.matches; this.controls.autoRotate = this.requestedAutoRotate && !event.matches;
      this.controls.enableDamping = !event.matches;
      if (this.cameraFlight && this.reducedMotion) this.finishFlight();
    });
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
    this.lastFrame = performance.now(); this.animate = time => {
      if (this.disposed) return;
      this.frameId = requestAnimationFrame(this.animate);
      // The first RAF timestamp can predate a costly environment-map setup.
      const dt = Math.max(0, Math.min((time - this.lastFrame) / 1000, .1)); this.lastFrame = time;
      if (document.hidden || this.contextLost || !host.clientWidth || !host.clientHeight) return;
      this.updateFrame(dt);
      this.renderer.render(this.scene, this.camera);
    };
    this.frameId = requestAnimationFrame(this.animate);
  }

  setFindings(findings = {}) {
    if (this.disposed) return;
    if (!findings || typeof findings !== 'object') findings = {};
    this.findings = Object.fromEntries(Object.keys(this.car.groups).map(id => {
      const record = findings[id];
      return [id, { outcome: record?.outcome || 'unchecked', process: record?.process || 'none',
        hasDefect: Array.isArray(record?.defects) && record.defects.length > 0 }];
    }));
  }

  selectPart(id, { focus = true } = {}) {
    if (this.disposed || !Object.hasOwn(this.car.groups, id)) return false;
    this.selected = id; this.controls.autoRotate = false; this.requestedAutoRotate = false;
    if (focus) this.focusPart(id);
    else if (this.compactViewport) this.refitCompact();
    return true;
  }

  setMode(mode) {
    if (this.disposed || !MODES.has(mode)) return false;
    this.mode = mode;
    if (mode === 'isolate' && !this.selected) this.selected = 'hood';
    if (mode === 'isolate') this.focusPart(this.selected);
    else this.flyTo(this.homePosition(mode), V(0, mode === 'exploded' ? 1.02 : .85, 0));
    return true;
  }

  setExplode(amount) {
    if (this.disposed) return;
    this.explodeAmount = THREE.MathUtils.clamp(Number.isFinite(amount) ? amount : 0, 0, 1);
    if (this.mode !== 'exploded') this.mode = 'exploded';
    if (this.compactViewport) this.refitCompact();
  }

  setGhost(value) { if (!this.disposed) this.ghost = Boolean(value); }
  setAutoRotate(value) {
    if (this.disposed) return;
    this.cameraFlight = null; this.requestedAutoRotate = Boolean(value);
    this.controls.autoRotate = Boolean(value) && !this.reducedMotion;
  }

  homePosition(mode = this.mode) {
    const factor = (mode === 'exploded' ? 1.17 : 1) * (this.camera.aspect < .85 ? 1.35 : 1);
    return V(-5.9, 3.2, 5.7).multiplyScalar(factor);
  }

  home() {
    if (this.disposed) return;
    this.selected = null; this.mode = 'assembled'; this.ghost = false; this.setAutoRotate(false);
    this.flyTo(this.homePosition('assembled'), V(0, .85, 0));
  }

  targetOffset(id) {
    const selected = id === this.selected;
    const amount = this.mode === 'exploded' ? this.explodeAmount : 0;
    const offset = presentationOffset(id, amount);
    if (selected) {
      const lift = this.mode === 'isolate' ? .84 : this.mode === 'exploded' ? .42 : .34;
      offset.add(presentationOffset(id, 1).normalize().multiplyScalar(lift));
    }
    return offset;
  }

  focusPart(id) {
    const center = this.centers.get(id).clone().add(this.targetOffset(id));
    const direction = id.startsWith('left') ? V(-.36, .35, 1)
      : id.startsWith('right') ? V(-.36, .35, -1)
      : id === 'roof' ? V(-.4, 1.25, .55)
      : ['trunk', 'rear_bumper', 'rear_glass'].includes(id) ? V(1, .48, .5) : V(-1, .5, .55);
    const mobile = this.camera.aspect < .85;
    const distance = (this.mode === 'isolate' ? 4.2 : 6.0) * (mobile ? 1.25 : 1);
    // Keep enough of the car in view to explain where the selected panel belongs.
    const target = this.mode === 'isolate' ? center : center.clone().lerp(V(0, .85, 0), .44);
    this.flyTo(target.clone().add(direction.normalize().multiplyScalar(distance)), target);
  }

  flyTo(position, target) {
    this.controls.autoRotate = false; this.requestedAutoRotate = false;
    if (this.compactViewport && this.bodyBounds) {
      const fitted = this.fitCompactView(position.clone().sub(target));
      position = fitted.position; target = fitted.target;
      this.controls.maxDistance = Math.max(24, position.distanceTo(target) * 1.15);
    }
    this.cameraFlight = { from: this.camera.position.clone(), fromTarget: this.controls.target.clone(),
      position, target, elapsed: 0, duration: .85 };
    if (this.reducedMotion) this.finishFlight();
  }

  finishFlight() {
    if (!this.cameraFlight) return;
    this.camera.position.copy(this.cameraFlight.position); this.controls.target.copy(this.cameraFlight.target);
    this.cameraFlight = null; this.controls.update();
  }

  refitCompact() {
    const position = this.cameraFlight?.position || this.camera.position;
    const target = this.cameraFlight?.target || this.controls.target;
    this.flyTo(position.clone(), target.clone());
  }

  fitCompactView(direction) {
    direction.normalize();
    let bounds;
    if (this.mode === 'isolate' && this.selected) {
      bounds = this.partBounds.get(this.selected).clone().translate(this.targetOffset(this.selected));
      bounds.expandByScalar(.18);
    } else {
      bounds = this.bodyBounds.clone();
      for (const [id, part] of this.partBounds) bounds.union(part.clone().translate(this.targetOffset(id)));
    }
    const target = bounds.getCenter(V());
    const right = V(0, 1, 0).cross(direction).normalize();
    const up = direction.clone().cross(right).normalize();
    const width = this.host.clientWidth, height = this.host.clientHeight;
    const horizontal = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect * (width - 28) / width;
    const vertical = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * (height - this.safeTop - this.safeBottom) / height;
    let distance = this.controls.minDistance;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const relative = V(x, y, z).sub(target), depth = relative.dot(direction);
      distance = Math.max(distance, depth + Math.abs(relative.dot(right)) / horizontal,
        depth + Math.abs(relative.dot(up)) / vertical);
    }
    return { target, position: target.clone().add(direction.multiplyScalar(distance * 1.025)) };
  }

  hit(event) {
    if (this.disposed || this.contextLost) return null;
    const rectangle = this.renderer.domElement.getBoundingClientRect();
    if (!rectangle.width || !rectangle.height || event.clientX < rectangle.left || event.clientX > rectangle.right || event.clientY < rectangle.top || event.clientY > rectangle.bottom) return null;
    this.pointer.set((event.clientX - rectangle.left) / rectangle.width * 2 - 1,
      -((event.clientY - rectangle.top) / rectangle.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const pickable = this.car.meshes.filter(mesh => {
      if (!mesh.userData.pickable || !mesh.visible || mesh.material.opacity < .3) return false;
      for (let parent = mesh.parent; parent; parent = parent.parent) if (!parent.visible) return false;
      return true;
    });
    return this.raycaster.intersectObjects(pickable, false)[0] || null;
  }

  updateFrame(dt) {
    const alpha = this.reducedMotion ? 1 : 1 - Math.exp(-dt * 6.5);
    if (this.cameraFlight) {
      const flight = this.cameraFlight; flight.elapsed += dt;
      const t = Math.min(1, flight.elapsed / flight.duration), smooth = t * t * (3 - 2 * t);
      this.camera.position.lerpVectors(flight.from, flight.position, smooth);
      this.controls.target.lerpVectors(flight.fromTarget, flight.target, smooth);
      if (t === 1) this.cameraFlight = null;
    }
    this.controls.update(dt);
    for (const [id, group] of Object.entries(this.car.groups)) {
      const selected = id === this.selected;
      // Different panel classes have different travel, which avoids a uniform box explosion.
      group.position.lerp(this.targetOffset(id), alpha);
      const center = this.centers.get(id), end = center.clone().add(group.position), line = this.tethers.get(id);
      line.visible = group.position.length() > .08 && (this.mode === 'exploded' || selected);
      if (line.visible) {
        const positions = line.geometry.getAttribute('position'); positions.setXYZ(0, center.x, center.y, center.z); positions.setXYZ(1, end.x, end.y, end.z); positions.needsUpdate = true;
        line.material.color.copy(selected ? AMBER : new THREE.Color('#9facb5'));
        line.material.opacity = selected ? .70 : .20;
      }
      const finding = this.findings[id];
      const notable = finding?.outcome === 'inspected' && (finding.process !== 'original' && finding.process !== 'none' || finding.hasDefect);
      const marker = this.markers.get(id);
      marker.visible = Boolean(notable && !selected && this.mode !== 'isolate' && !this.ghost);
      marker.position.copy(end);
      if (id.startsWith('left')) marker.position.z += .075;
      else if (id.startsWith('right')) marker.position.z -= .075;
      else marker.position.y += .06;
      marker.quaternion.copy(this.camera.quaternion);
    }
    this.car.root.traverse(mesh => {
      if (!mesh.isMesh) return;
      const id = mesh.userData.partId, selected = Boolean(id && id === this.selected);
      const faded = Boolean(this.selected && !selected && (this.mode === 'isolate' || this.ghost));
      const targetOpacity = faded ? (id ? .13 : .07) : mesh.userData.originalOpacity ?? 1;
      const material = mesh.material;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, alpha);
      const transparent = material.opacity < .995;
      if (material.transparent !== transparent) { material.transparent = transparent; material.needsUpdate = true; }
      material.depthWrite = !transparent;
      mesh.castShadow = material.opacity > .5;
      if (mesh.userData.presentationPaint) {
        material.color.lerp(selected ? AMBER : SILVER, alpha);
        material.emissive.set(selected ? '#6e3c09' : '#000000');
        material.emissiveIntensity = selected ? .16 : 0;
      }
    });
    this.car.root.updateMatrixWorld(true);
  }

  getPartScreenPosition(id) {
    if (this.disposed || !this.centers.has(id)) return null;
    const world = this.centers.get(id).clone().add(this.car.groups[id].position);
    const point = world.project(this.camera);
    if (point.z < -1 || point.z > 1) return null;
    return { x: (point.x + 1) / 2, y: (1 - point.y) / 2, visible: Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1 };
  }

  getDebugState() {
    return { profile: this.profile, mode: this.mode, selected: this.selected, explodeAmount: this.explodeAmount,
      ghost: this.ghost, reducedMotion: this.reducedMotion, autoRotate: Boolean(this.controls?.autoRotate),
      disposed: this.disposed, contextLost: this.contextLost, partCount: Object.keys(this.car?.groups || {}).length,
      partIds: Object.keys(this.car?.groups || {}), geometrySource: 'authored-semantic-template', reconstructedFromPhotos: false,
      canvasCount: this.host.querySelectorAll('canvas').length };
  }

  resize() {
    if (this.disposed) return;
    const width = this.host.clientWidth, height = this.host.clientHeight;
    if (!width || !height) return;
    const changed = width !== this.previousWidth || height !== this.previousHeight;
    this.previousWidth = width; this.previousHeight = height;
    this.renderer.setSize(width, height, false); this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
    // Actual mobile stages are often square; aspect ratio alone misses that case.
    this.compactViewport = width < 620 || this.camera.aspect < 1.05;
    this.controls.maxDistance = this.compactViewport ? 24 : 14;
    if (this.compactViewport) {
      this.safeTop = Math.min(112, height * .32); this.safeBottom = 38;
      // Optical shift reserves the upper HUD without tilting away from the panel.
      this.camera.setViewOffset(width, height, 0, -(this.safeTop - this.safeBottom) / 2, width, height);
    } else { this.safeTop = 0; this.safeBottom = 0; this.camera.clearViewOffset(); }
    if (changed) {
      if (this.selected) this.focusPart(this.selected);
      else this.flyTo(this.homePosition(), V(0, this.mode === 'exploded' ? 1.02 : .85, 0));
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true; cancelAnimationFrame(this.frameId); this.observer.disconnect();
    this.events.splice(0).forEach(remove => remove());
    this.controls.removeEventListener('start', this.listenControls); this.controls.dispose();
    this.activePointers.clear(); this.tap = null; this.cameraFlight = null; this.findings = {};
    disposeObject(this.scene); this.environment.dispose();
    this.renderer.renderLists.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss();
    this.scene.clear(); this.scene.environment = null;
    this.car.root.clear(); this.car.meshes = []; this.car.groups = {};
    this.centers.clear(); this.partBounds.clear(); this.tethers.clear(); this.markers.clear(); this.onSelect = () => {};
    this.renderer.domElement.remove(); this.host.dataset.rendererState = 'disposed';
  }
}
