import {test} from 'node:test';
import assert from 'node:assert/strict';
import {studioReadiness} from '../src/studio-readiness.js';
import {emptyStudio} from '../src/studio-domain.js';

const photo={id:'front',kind:'ring',slot:'ring-01',sha256:'a'.repeat(64)};
const boundary={partId:'hood',photoId:'front',sha256:photo.sha256,reviewed:true,points:[[.1,.1],[.8,.1],[.8,.8],[.1,.8]]};
const session=()=>({profile:'sedan4',photo_slots:{'ring-01':'front'},findings:{hood:{evidenceIds:['front'],outcome:'unchecked'}}});
const plan=()=>({...emptyStudio('sedan4'),bindings:[structuredClone(boundary)]});
const hood=r=>r.rows.find(p=>p.id==='hood');

test('Coverage does not invent inspection results or recommend unrelated photos',()=>{
 const s=session(),before=structuredClone(s),r=studioReadiness(plan(),s,[photo]);
 assert.equal(r.ready,1);assert.equal(hood(r).state,'ready');assert.equal(hood(r).sourceId,'front');
 const roof=r.rows.find(p=>p.id==='roof');assert.equal(roof.sourceId,'');assert.equal(roof.state,'evidence');
 assert.deepEqual(s,before);assert.equal(s.findings.hood.outcome,'unchecked');
});
test('Retakes and source hash changes invalidate preparation; historical evidence is not recommended',()=>{
 const s=session();s.photo_slots['ring-01']='new';
 let r=studioReadiness(plan(),s,[photo,{...photo,id:'new'}]);
 assert.equal(hood(r).state,'stale');assert.equal(hood(r).sourceId,'');assert.equal(r.ready,0);
 r=studioReadiness(plan(),session(),[{...photo,sha256:'b'.repeat(64)}]);assert.equal(hood(r).state,'stale');
});
test('An unlinked detail and invalid contour cannot count as ready',()=>{
 for(const mutate of [p=>p.bindings[0].points=[[0,0],[1,1],[0,1],[1,0]],p=>p.bindings[0].sha256='wrong']){
  const p=plan();mutate(p);assert.equal(hood(studioReadiness(p,session(),[photo])).state,'stale');
 }
 const s=session();s.findings.hood.evidenceIds=[];
 assert.equal(hood(studioReadiness(plan(),s,[{...photo,kind:'detail'}])).state,'stale');
});
test('Next task prioritizes stale sources, drafts and linked evidence before unlinked parts',()=>{
 const p=plan();p.bindings[0].reviewed=false;
 let r=studioReadiness(p,session(),[photo]);assert.equal(r.next.id,'hood');assert.equal(r.next.state,'draft');
 p.bindings=[];r=studioReadiness(p,session(),[photo]);assert.equal(r.next.state,'missing');assert.equal(r.next.sourceId,'front');
 p.bindings=[boundary,{...boundary,partId:'roof',sha256:'wrong'}];r=studioReadiness(p,session(),[photo]);assert.equal(r.next.id,'roof');assert.equal(r.next.state,'stale');
});
test('Counts are per part, checks require current photo hash and missing shots come first',()=>{
 const p=plan();p.bindings.push({...boundary,photoId:'other'});p.checks={front:{sha256:'wrong',identity:true,angle:true,quality:true}};
 const r=studioReadiness(p,session(),[photo,{...photo,id:'other',kind:'detail'}]);assert.equal(r.ready,1);assert.equal(r.checked,0);assert.equal(r.captured,1);assert.equal(r.nextShot.state,'missing');
 p.checks.front.sha256=photo.sha256;assert.equal(studioReadiness(p,session(),[photo]).checked,1);
});
