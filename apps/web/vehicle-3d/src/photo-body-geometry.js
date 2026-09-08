import * as THREE from 'three';
import { PARTS } from './domain.js';
import { LEFT_PHOTO_MASKS } from './photo-masks-left.js';
import { RIGHT_PHOTO_MASKS } from './photo-masks-right.js';
import { END_PHOTO_MASKS } from './photo-masks-ends.js';

/**
 * Authored compact hatchback shell aligned to the original Opel ADAM reference.
 * UV coordinates always address the unmodified photograph. This is an exterior
 * presentation model, not a scan, measured CAD model, or a reconstruction of
 * hidden surfaces. These mappings must never be applied to a customer upload.
 */
const WIDTH = 1072, HEIGHT = 586;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;

/** Small DOM-free parser for the absolute M/L/Q/C/Z paths of this reference. */
export function flattenPhotoPath(path, steps = 10) {
  const tokens = path.match(/[MLQCZ]|[-+]?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi) || [];
  const points = []; let cursor = [0, 0], start, command, i = 0;
  const number = () => {
    const value = Number(tokens[i++]);
    if (!Number.isFinite(value)) throw new Error('Geçersiz fotoğraf konturu.');
    return value;
  };
  const push = point => { points.push(new THREE.Vector2(...point)); cursor = point; };
  while (i < tokens.length) {
    if (/^[A-Z]$/i.test(tokens[i])) command = tokens[i++];
    if (command === 'M' || command === 'L') {
      push([number(), number()]);
      if (command === 'M') { start = cursor; command = 'L'; }
    } else if (command === 'Q') {
      const p = cursor, c = [number(), number()], end = [number(), number()];
      for (let s = 1; s <= steps; s++) {
        const t = s / steps, q = 1 - t;
        push([q * q * p[0] + 2 * q * t * c[0] + t * t * end[0], q * q * p[1] + 2 * q * t * c[1] + t * t * end[1]]);
      }
    } else if (command === 'C') {
      const p = cursor, a = [number(), number()], b = [number(), number()], end = [number(), number()];
      for (let s = 1; s <= steps; s++) {
        const t = s / steps, q = 1 - t;
        push([q ** 3 * p[0] + 3 * q * q * t * a[0] + 3 * q * t * t * b[0] + t ** 3 * end[0], q ** 3 * p[1] + 3 * q * q * t * a[1] + 3 * q * t * t * b[1] + t ** 3 * end[1]]);
      }
    } else if (command === 'Z') { cursor = start; command = null; }
    else throw new Error('Desteklenmeyen fotoğraf konturu komutu.');
  }
  return points.filter((point, index) => !index || point.distanceToSquared(points[index - 1]) > .001);
}

// Subdivision lets the original pixel contours follow a gently curved shell,
// rather than bending only the corners of a large flat photographic polygon.
function triangulated(path, projection, outward) {
  const contour = flattenPhotoPath(path), triangles = THREE.ShapeUtils.triangulateShape(contour, []);
  const positions = [], uvs = [], samples = [];
  function emit(a, b, c, depth = 0) {
    const edges = [a.distanceToSquared(b), b.distanceToSquared(c), c.distanceToSquared(a)];
    const longest = Math.max(...edges);
    if (longest > 30 ** 2 && depth < 12) {
      const index = edges.indexOf(longest);
      if (index === 0) { const m = a.clone().add(b).multiplyScalar(.5); emit(a, m, c, depth + 1); emit(m, b, c, depth + 1); }
      else if (index === 1) { const m = b.clone().add(c).multiplyScalar(.5); emit(a, b, m, depth + 1); emit(a, m, c, depth + 1); }
      else { const m = c.clone().add(a).multiplyScalar(.5); emit(a, b, m, depth + 1); emit(m, b, c, depth + 1); }
      return;
    }
    const pa = projection(a.x, a.y), pb = projection(b.x, b.y), pc = projection(c.x, c.y);
    const normal = pb.clone().sub(pa).cross(pc.clone().sub(pa));
    const vertices = normal.dot(outward) < 0 ? [[a, pa], [c, pc], [b, pb]] : [[a, pa], [b, pb], [c, pc]];
    for (const [uv, position] of vertices) {
      positions.push(...position.toArray()); uvs.push(uv.x / WIDTH, 1 - uv.y / HEIGHT); samples.push(uv.x, uv.y);
    }
  }
  for (const [a, b, c] of triangles) emit(contour[a], contour[b], contour[c]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('sourcePixel', new THREE.Float32BufferAttribute(samples, 2));
  geometry.userData.outlinePositions = contour.flatMap(point => projection(point.x, point.y).toArray());
  geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return { geometry, contour };
}

function at(value, stops) {
  if (value <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (value <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (value - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  }
  return stops.at(-1)[1];
}

function halfWidth(x, y) {
  const shoulder = at(y, [[0, .81], [.30, .88], [.68, .90], [1.05, .86], [1.18, .81], [1.47, .70], [1.70, .64]]);
  // The nose and tail wrap inward smoothly. Mid-body photographs retain their
  // natural width; the roof/glass lean inward instead of forming a tall box.
  const front = clamp((-x - 1.45) / .64, 0, 1), rear = clamp((x - 1.57) / .53, 0, 1);
  return shoulder - front * front * .23 - rear * rear * .18;
}

export function createPhotoBodyGeometry() {
  const root = new THREE.Group(), groups = {}, meshes = [];
  for (const part of PARTS.filter(part => !part.id.endsWith('rear_door'))) {
    const group = new THREE.Group(); group.name = part.id; group.userData.partId = part.id;
    groups[part.id] = group; root.add(group);
  }
  const neutral = () => new THREE.MeshBasicMaterial({ color: '#202428', toneMapped: false, side: THREE.DoubleSide });
  function attach(geometry, material, id, extra = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { partId: id || null, pickable: Boolean(id), originalOpacity: 1, presentationPaint: false, ...extra };
    mesh.castShadow = true; mesh.receiveShadow = false;
    (id ? groups[id] : root).add(mesh);
    if (id) meshes.push(mesh);
    return mesh;
  }
  function photo(path, projection, frame, id, outward, { cap = true, detail = false } = {}) {
    const { geometry, contour } = triangulated(path, projection, outward);
    const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.FrontSide, toneMapped: false });
    const mesh = attach(geometry, material, id, { photoFrame: frame, photoSurface: true, sourceWidth: WIDTH, sourceHeight: HEIGHT, photographicDetail: detail });
    if (cap && id) {
      const offset = outward.clone().multiplyScalar(-.012);
      const back = geometry.clone(); back.translate(...offset.toArray());
      // The reverse of an exploded skin is explicitly neutral. Repeating the
      // outward photo on its inside would suggest photographed hidden detail.
      const backMaterial = neutral(); backMaterial.side = THREE.BackSide;
      attach(back, backMaterial, id, { photoSurface: false, neutralBack: true });
      const edge = [];
      for (let i = 0; i < contour.length; i++) {
        const a = projection(contour[i].x, contour[i].y), next = contour[(i + 1) % contour.length];
        const b = projection(next.x, next.y), c = a.clone().add(offset), d = b.clone().add(offset);
        edge.push(...a.toArray(), ...c.toArray(), ...b.toArray(), ...b.toArray(), ...c.toArray(), ...d.toArray());
      }
      const edgeGeometry = new THREE.BufferGeometry(); edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edge, 3)); edgeGeometry.computeVertexNormals();
      attach(edgeGeometry, neutral(), id, { photoSurface: false, neutralEdge: true });
    }
    return mesh;
  }
  const left = (u, v) => { const x = (u - 546) / 250, y = (470 - v) / 250; return V(x, y, halfWidth(x, y)); };
  // Right-side image has its own camera framing: calibration aligns wheelbase
  // and roof height while UV coordinates retain the original right-side pixels.
  const right = (u, v) => { const x = (532 - u) / 250, y = (470 - v) / 250; return V(x, y, -halfWidth(x, y)); };
  const sideFrames = [
    { side: 'left', frame: 19, mapping: left, masks: LEFT_PHOTO_MASKS[19], normal: V(0, 0, 1) },
    { side: 'right', frame: 7, mapping: right, masks: RIGHT_PHOTO_MASKS[7], normal: V(0, 0, -1) },
  ];
  for (const { side, frame, mapping, masks, normal } of sideFrames) {
    for (const mask of masks.parts.filter(mask => mask.id.startsWith(side) && !mask.id.endsWith('mirror'))) {
      const project = mask.id.endsWith('front_fender') ? (u, v) => {
        const p = mapping(u, v);
        const upperV = side === 'left' ? mix(231, 207, clamp((u - 145) / 218, 0, 1)) : mix(206, 233, clamp((u - 723) / 218, 0, 1));
        const blend = Math.pow(clamp(1 - (v - upperV) / 42, 0, 1), 1.3);
        const joinY = at(p.x, [[-1.70, 1.013], [-1.55, 1.052], [-1.37, 1.09], [-1.12, 1.14], [-.98, 1.155], [-.72, 1.055]]);
        const joinZ = at(p.x, [[-1.70, .52], [-1.55, .61], [-1.37, .745], [-1.12, .79], [-.98, .80], [-.72, .86]]);
        p.y = mix(p.y, joinY, blend); p.z = normal.z * mix(Math.abs(p.z), joinZ, blend);
        return p;
      } : mapping;
      photo(mask.path, project, frame, mask.id, normal);
    }
    // The side photographs supply the real bumper corners and their return into
    // the wheel arches. Front/back photographs provide the central curved face.
    for (const mask of masks.parts.filter(mask => mask.id === 'rear_bumper')) photo(mask.path, mapping, frame, mask.id, normal);
    const mirror = masks.parts.find(mask => mask.id === `${side}_mirror`);
    photo(mirror.path, (u, v) => { const p = mapping(u, v); p.z += normal.z * .16; return p; }, frame, mirror.id, normal);
  }

  // Original glazing, chrome surrounds, and pillars finish the photo-aligned
  // cabin silhouette. They are surfaces only; no interior is inferred.
  const cabin = {
    left: [
      ['left_front_door', 'M418 154 Q455 111 487 91 Q529 69 576 67 L705 65 L705 179 L422 192 L423 180 Z'],
      ['left_front_door', 'M423 192 L707 180 L731 182 L368 205 L369 195 L398 199 Z'],
      ['left_a_pillar', 'M306 180 Q391 114 448 84 L478 76 Q410 108 335 186 L318 188 Z'],
      ['left_b_pillar', 'M708 65 L730 67 L733 179 L708 181 Z'],
      ['left_c_pillar', 'M778 59 Q812 62 839 76 L894 128 L926 135 L932 145 L893 142 Q849 95 819 80 Q798 68 778 66 Z'],
      ['left_rear_fender', 'M735 69 Q784 72 817 90 L891 145 L935 165 L735 177 Z'],
      ['roof', LEFT_PHOTO_MASKS[19].parts.find(part => part.id === 'roof').path],
      ['left_rear_fender', 'M963 185 L1005 192 L1035 249 L1011 237 L982 211 Z'],
      ['rear_bumper', 'M1010 253 L1043 280 Q1061 320 1059 371 L1054 391 L1014 397 L1015 356 Q1015 313 993 291 Z'],
    ],
    right: [
      ['right_front_door', 'M363 65 Q417 67 452 78 Q559 99 638 153 L651 163 L652 185 L365 175 Z'],
      ['right_front_door', 'M363 175 L652 185 L655 194 L676 200 L719 204 L363 178 Z'],
      ['right_a_pillar', 'M600 69 Q663 89 700 122 L772 180 L763 188 L741 177 Q671 111 645 103 L600 80 Z'],
      ['right_b_pillar', 'M340 65 L361 64 L360 176 L339 176 Z'],
      ['right_c_pillar', 'M216 52 Q276 42 325 52 L308 62 Q264 64 248 83 L195 132 L161 137 L168 129 L190 126 L221 77 Z'],
      ['right_rear_fender', 'M337 68 Q286 72 259 88 L198 142 L148 163 L337 175 Z'],
      ['roof', 'M240 54 Q324 41 400 44 Q502 44 550 56 Q578 61 600 69 L600 79 Q575 71 548 68 Q472 53 400 56 Q308 55 245 65 Z'],
      ['right_rear_fender', 'M128 184 L96 189 L58 240 L79 230 L115 207 Z'],
    ],
  };
  for (const { side, frame, mapping, normal } of sideFrames) {
    for (const [id, path] of cabin[side]) photo(path, mapping, frame, id, normal);
  }

  const frontY = v => at(v, [[55, 1.69], [76, 1.62], [180, 1.16], [189, 1.145], [263, .98], [300, .83], [470, .17], [488, .055]]);
  const frontZ = u => (u - 550) / 306 * .89;
  const frontEnd = (u, v) => {
    const z = frontZ(u), round = (Math.abs(z) / .91) ** 2.5;
    return V(-2.035 + round * .58 + Math.max(0, 295 - v) / 1900, frontY(v), z);
  };
  const frontHood = (u, v) => {
    const t = clamp((v - 181) / 82, 0, 1), z = frontZ(u) * mix(1.25, 1, t);
    const noseX = frontEnd(u, 263).x;
    return V(mix(-1.02 + (Math.abs(z) / .85) ** 2 * .08, noseX, t), mix(1.155, .98, t) + .018 * Math.sin(t * Math.PI), z);
  };
  const windscreen = (u, v) => {
    const t = clamp((v - 73) / 108, 0, 1), z = frontZ(u) * mix(1.40, 1.22, t);
    return V(mix(-.32, -1.00, t) - .025 * (1 - (z / .85) ** 2), frontY(v), z);
  };
  photo(END_PHOTO_MASKS[1].parts.find(part => part.id === 'hood').path, frontHood, 1, 'hood', V(-.25, 1, 0));
  // The narrow cowl is also visible in the same photograph and closes the
  // authentic bonnet/windscreen seam without extending background pixels.
  photo('M342 181 Q548 173 763 179 L767 190 Q559 183 337 190 Z', frontHood, 1, 'hood', V(0, 1, 0));
  photo(END_PHOTO_MASKS[1].parts.find(part => part.id === 'windshield').path, windscreen, 1, 'windshield', V(-1, .7, 0));
  photo(END_PHOTO_MASKS[1].parts.find(part => part.id === 'front_bumper').path, frontEnd, 1, 'front_bumper', V(-1, 0, 0));
  photo('M329 216 Q343 222 360 230 Q390 245 408 265 L410 278 Q401 299 373 298 Q320 295 299 280 L302 257 Q311 232 329 216 Z', frontEnd, 1, 'right_front_fender', V(-1, 0, -.25));
  photo('M768 215 Q785 232 796 253 L801 279 Q774 300 722 299 Q696 296 694 277 L697 264 Q716 246 735 232 Q752 223 768 215 Z', frontEnd, 1, 'left_front_fender', V(-1, 0, .25));
  for (const [id, sourceCenter, sign] of [['left_mirror', 805, 1], ['right_mirror', 306, -1]]) {
    const mask = END_PHOTO_MASKS[1].parts.find(part => part.id === id);
    photo(mask.path, (u, v) => V(-.675 + Math.abs(u - sourceCenter) / 1800, frontY(v) - .023, sign * .96 + (u - sourceCenter) / 260), 1, id, V(-1, 0, 0));
  }

  const rearY = v => at(v, [[20, 1.75], [58, 1.64], [157, 1.21], [164, 1.19], [251, .97], [272, .91], [431, .20], [490, .05]]);
  const rearZ = u => -(u - 531) / 286 * .89;
  const rearEnd = (u, v) => {
    const z = rearZ(u), round = (Math.abs(z) / .92) ** 2.5;
    return V(2.025 - round * .30 - Math.max(0, 252 - v) / 520, rearY(v), z);
  };
  const rearGlass = (u, v) => {
    const t = clamp((v - 57) / 101, 0, 1), z = rearZ(u);
    return V(mix(1.22, 1.71, t) + .027 * (1 - (z / .84) ** 2), rearY(v), z);
  };
  photo(END_PHOTO_MASKS[13].parts.find(part => part.id === 'trunk').path, rearEnd, 13, 'trunk', V(1, 0, 0));
  photo(END_PHOTO_MASKS[13].parts.find(part => part.id === 'rear_glass').path, rearGlass, 13, 'rear_glass', V(1, .5, 0));
  photo(END_PHOTO_MASKS[13].parts.find(part => part.id === 'rear_bumper').path, rearEnd, 13, 'rear_bumper', V(1, 0, 0));
  photo('M295 190 Q345 195 361 217 Q372 233 377 250 L373 262 Q319 266 291 251 Q284 240 283 216 Z', rearEnd, 13, 'left_rear_fender', V(1, 0, .3));
  photo('M764 190 L776 215 Q779 239 768 251 Q740 266 686 262 L682 251 Q689 226 698 215 Q716 197 764 190 Z', rearEnd, 13, 'right_rear_fender', V(1, 0, -.3));
  photo('M295 256 Q329 270 379 266 L684 267 Q743 270 768 256 L794 262 Q770 275 687 274 L376 274 Q300 276 270 263 Z', rearEnd, 13, 'rear_bumper', V(1, 0, 0));
  photo('M291 251 Q330 264 377 253 L509 253 Q533 263 558 253 L684 253 Q739 264 771 251 L794 262 Q738 273 683 271 L378 271 Q318 273 270 263 Z', rearEnd, 13, 'rear_bumper', V(1, 0, 0));
  photo('M323 158 Q530 162 739 157 L744 164 Q528 171 313 163 Z', rearEnd, 13, 'trunk', V(1, .15, 0));

  // The top was not captured from above. A restrained, explicitly untextured
  // cap bridges the actual red roof rails; it has no invented photo detail.
  const roofVertices = [], roofIndices = [], columns = 18, rows = 8;
  for (let ix = 0; ix <= columns; ix++) {
    const t = ix / columns, x = mix(-.35, 1.22, t);
    const topY = at(x, [[-.35, 1.57], [-.14, 1.67], [.4, 1.715], [.98, 1.69], [1.22, 1.625]]);
    const width = at(x, [[-.35, .63], [-.14, .66], [.4, .67], [.98, .66], [1.22, .62]]);
    for (let iz = 0; iz <= rows; iz++) {
      const across = iz / rows * 2 - 1;
      roofVertices.push(x, topY - across * across * .022, across * width);
      if (ix < columns && iz < rows) { const a = ix * (rows + 1) + iz, b = a + rows + 1; roofIndices.push(a, a + 1, b, a + 1, b + 1, b); }
    }
  }
  const roofGeometry = new THREE.BufferGeometry(); roofGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roofVertices, 3)); roofGeometry.setIndex(roofIndices); roofGeometry.computeVertexNormals();
  attach(roofGeometry, new THREE.MeshBasicMaterial({ color: '#9b4042', toneMapped: false, side: THREE.DoubleSide }), 'roof', { photoSurface: false, uncapturedSurface: true });

  // Photo wheel faces are contextual, not additional inspection components.
  // Their unseen tread/backs are plain dark geometry, with no invented brakes.
  for (const { side, frame, normal } of sideFrames) {
    const sign = normal.z;
    const wheels = side === 'left'
      ? [{ u: 233, v: 385, r: 87, x: -1.264 }, { u: 920, v: 381, r: 87, x: 1.492 }]
      : [{ u: 851, v: 377, r: 92, x: -1.264 }, { u: 168, v: 369, r: 96, x: 1.492 }];
    for (const wheel of wheels) {
      const radius = .356, centerY = .376, z = sign * .879;
      const points = Array.from({ length: 64 }, (_, index) => {
        const angle = index / 64 * Math.PI * 2;
        return [wheel.u + Math.cos(angle) * wheel.r, wheel.v + Math.sin(angle) * wheel.r];
      });
      const path = `M${points.map(point => point.join(' ')).join(' L')} Z`;
      const wheelProjection = (u, v) => V(wheel.x + (u - wheel.u) / wheel.r * radius * (side === 'left' ? 1 : -1), centerY - (v - wheel.v) / wheel.r * radius, z);
      photo(path, wheelProjection, frame, null, normal, { cap: false, detail: true });
      const tyre = new THREE.CylinderGeometry(radius, radius, .25, 48, 1, true); tyre.rotateX(Math.PI / 2);
      tyre.translate(wheel.x, centerY, sign * (.879 - .125));
      attach(tyre, new THREE.MeshStandardMaterial({ color: '#17191a', roughness: .94, side: THREE.DoubleSide }), null, { contextOnly: true, photoSurface: false });
      const back = new THREE.CircleGeometry(radius * .985, 48); back.translate(wheel.x, centerY, sign * .624);
      attach(back, neutral(), null, { contextOnly: true, photoSurface: false });
    }
  }
  // A plain, recessed cabin volume closes the shell in exploded views. It is
  // not presented as an engine, chassis, interior, or measured hidden structure.
  const base = new THREE.BoxGeometry(2.80, .36, 1.24, 1, 1, 1); base.translate(.05, .47, 0);
  attach(base, neutral(), null, { contextOnly: true, neutralBacking: true });
  root.userData = { geometrySource: 'authored-photo-aligned-shell', reconstructedFromPhotos: false, profile: 'hatchback3', referenceVehicle: 'Opel ADAM S', sourceFrames: [1, 7, 13, 19], inspectedAlignmentFrames: [1, 7, 13, 19, 22], uncapturedSurfaces: ['roof-top', 'panel-backs', 'tyre-tread'], originalPhotos: true };
  root.updateMatrixWorld(true);
  return { root, groups, meshes, sourceFrames: [1, 7, 13, 19], sourceSize: { width: WIDTH, height: HEIGHT }, profile: 'hatchback3' };
}
