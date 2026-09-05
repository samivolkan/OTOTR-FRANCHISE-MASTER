import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { REAL_PARTS, normalizeFrame, angleForFrame, imagePath, anchorsAt, BEST_FRAME, createSpinFindings } from '../src/spin-domain.js';

test('photographic sequence wraps seamlessly and uses 24 distinct source files',()=>{
  assert.equal(normalizeFrame(0),24);assert.equal(normalizeFrame(25),1);assert.equal(normalizeFrame(-24),24);
  assert.equal(angleForFrame(24),345);assert.equal(angleForFrame(25),0);
  assert.equal(imagePath(25),'./real-car/frame-01.jpg');
  const manifest=JSON.parse(fs.readFileSync(new URL('../public/real-car/source.json',import.meta.url)));
  assert.equal(manifest.count,24);assert.equal(manifest.frames.length,24);
  assert.equal(manifest.commercialReusePermissionVerified,false);
  const hashes=[];
  for(let i=0;i<24;i++){
    const record=manifest.frames[i];assert.equal(record.index,i+1);
    const bytes=fs.readFileSync(new URL('../public/real-car/'+record.file,import.meta.url));
    const hash=crypto.createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash,record.sha256);assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);hashes.push(hash);
  }
  assert.equal(new Set(hashes).size,24);
});

test('part guide matches the two side doors of this photographed hatchback',()=>{
  assert.equal(REAL_PARTS.length,23);
  assert.equal(REAL_PARTS.filter(p=>p.id.endsWith('_door')).length,2);
  const findings=createSpinFindings();assert.equal(Object.keys(findings).length,23);
  assert.equal(Object.values(findings).filter(f=>f.status==='unchecked').length,20);
  assert.equal(Object.values(findings).filter(f=>f.status==='original').length,0);
  for(const p of REAL_PARTS)assert.ok(BEST_FRAME[p.id]>=1&&BEST_FRAME[p.id]<=24);
});

test('image pins stay on known visible parts; hidden side and roof are not invented',()=>{
  const ids=new Set(REAL_PARTS.map(p=>p.id));
  for(let frame=1;frame<=24;frame++)for(const [id,pos]of Object.entries(anchorsAt(frame))){
    assert.ok(ids.has(id));assert.ok(pos.every(n=>Number.isFinite(n)&&n>0&&n<100));assert.notEqual(id,'roof');
  }
  assert.equal(anchorsAt(7).left_front_door,undefined);
  assert.equal(anchorsAt(19).right_front_door,undefined);
  assert.equal(anchorsAt(23).left_front_door,undefined);
  assert.ok(anchorsAt(20).left_front_door);
});
