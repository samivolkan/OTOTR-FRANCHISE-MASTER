import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PARTS, SHOTS, createFindings, validateFinding, captureProgress, makeReport } from '../src/domain.js';
import { createCar } from '../src/car.js';

test('all 25 semantic parts have their own selectable 3D meshes',()=>{
  const car=createCar();
  assert.equal(PARTS.length,25);assert.equal(new Set(PARTS.map(p=>p.id)).size,25);
  for(const part of PARTS){const meshes=car.meshes.filter(m=>m.userData.partId===part.id);assert.ok(meshes.length>0,part.id);for(const mesh of meshes){mesh.geometry.computeBoundingBox();assert.ok(!mesh.geometry.boundingBox.isEmpty(),part.id);assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));}}
  const bounds=new THREE.Box3().setFromObject(car.root).getSize(new THREE.Vector3());
  assert.ok(bounds.x>4&&bounds.x<5);assert.ok(bounds.y>1.4&&bounds.y<1.7);assert.ok(bounds.z>1.8&&bounds.z<2.4);
});
test('capture plan has 12 ring positions, 4 high angles and 8 details with valid part ids',()=>{
  assert.equal(SHOTS.length,24);assert.equal(new Set(SHOTS.map(s=>s.id)).size,24);
  assert.deepEqual(SHOTS.slice(0,12).map(s=>s.angle),Array.from({length:12},(_,i)=>i*30));
  for(const shot of SHOTS)for(const id of shot.parts)assert.ok(PARTS.some(p=>p.id===id),id);
});
test('synthetic renders never satisfy real photo completeness',()=>{
  const renders=Object.fromEntries(SHOTS.map(s=>[s.id,{kind:'render'}]));
  assert.deepEqual(captureProgress(renders),{real:0,examples:24,total:24,percent:0});
  renders[SHOTS[0].id]={kind:'photo'};
  assert.equal(captureProgress(renders).real,1);assert.equal(captureProgress(renders).examples,23);
});
test('fresh capture never inherits assessed or original findings',()=>{
  const fresh=createFindings(false);
  assert.ok(Object.values(fresh).every(v=>v.status==='unchecked'&&v.measurements===''&&v.note===''));
});
test('validation rejects invalid statuses, readings, unsupported materials and excessive notes',()=>{
  for(const input of [{status:'bad',note:'',measurements:''},{status:'painted',note:'',measurements:'NaN'}, {status:'painted',note:'',measurements:'-1'},{status:'painted',note:'',measurements:'6000'},{status:'painted',note:'x'.repeat(2001),measurements:''}])assert.throws(()=>validateFinding('hood',input));
  assert.throws(()=>validateFinding('front_bumper',{status:'original',note:'',measurements:'123'}));
  assert.throws(()=>validateFinding('fake',{status:'original',note:'',measurements:''}));
  assert.deepEqual(validateFinding('hood',{status:'painted',note:' test ',measurements:'101, 150;160'}),{status:'painted',note:'test',measurements:'101, 150, 160'});
});
test('export makes demo and non-reconstructed origin explicit and includes linked evidence only',()=>{
  const report=makeReport(createFindings(),{'detail-2':{kind:'render',name:'demo.jpg',url:'not-exported'},'ring-3':{kind:'photo',name:'capture.jpg',sha256:'abc'}},'demo');
  assert.equal(report.demo,true);assert.equal(report.visualization.reconstructedFromPhotos,false);
  assert.equal(report.parts.length,25);
  assert.equal(report.parts.find(p=>p.id==='left_front_door').evidence.length,2);
  assert.ok(!JSON.stringify(report).includes('not-exported'));
});
