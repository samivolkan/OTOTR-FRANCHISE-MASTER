import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyStudio,validPolygon,validateStudio,studioIssues,preparedMask,publicStudio} from '../src/studio-domain.js';
import {qualityStatistics,qualityAdvice} from '../src/capture-quality.js';
import {SHOTS,emptyFinding} from '../src/pilot-domain.js';
const photos=SHOTS.map((s,i)=>({id:'p'+i,slot:s.id,kind:s.kind,sha256:String(i).padStart(64,'0'),width:2400,height:1800}));
const session={profile:'sedan4',photo_slots:Object.fromEntries(photos.map(p=>[p.slot,p.id])),findings:{hood:{...emptyFinding(),outcome:'inspected',process:'original',measurements:[100,110,120],evidenceIds:['p0']}}};
const binding={partId:'hood',photoId:'p0',sha256:photos[0].sha256,points:[[.1,.1],[.7,.1],[.7,.6],[.1,.6]],reviewed:true};
const plan=()=>({...emptyStudio('sedan4'),summary:'Test inspection scope.',checks:Object.fromEntries(photos.map(p=>[p.id,{sha256:p.sha256,identity:true,angle:true,quality:true}])),bindings:[structuredClone(binding)],pins:[{partId:'hood',photoId:'p0',measurementIndex:0,value:100,x:.3,y:.3}],tour:[{partId:'hood',photoId:'p0',view:'cutout',seconds:8,caption:'Test inspection evidence.'}]});
test('Contours reject crossing, duplicate, degenerate and out-of-frame vertices',()=>{
 assert.equal(validPolygon(binding.points),true);
 for(const points of [[[0,0],[1,1],[0,1],[1,0]],[[0,0],[0,0],[1,1]],[[0,0],[.1,.1],[.2,.2]],[[0,0],[2,0],[1,1]],[[0,0],[1,0],[.5,0],[.5,1]]])assert.equal(validPolygon(points),false);
});
test('Prepared plans enforce source hash, active capture, real part and measurement identity',()=>{
 assert.equal(validateStudio(plan(),session,photos,{complete:true}).tour.length,1);
 for(const mutate of [p=>p.bindings[0].sha256='wrong',p=>p.bindings[0].partId='invented',p=>p.pins[0].value=99,p=>p.pins[0].measurementIndex=12,p=>p.tour[0].seconds=21,p=>p.modelKey='reference:adam']){const p=plan();mutate(p);assert.throws(()=>validateStudio(p,session,photos));}
 assert.throws(()=>validateStudio(plan(),{...session,photo_slots:{}},photos),/yenilendi/);
 assert.throws(()=>validateStudio(plan(),{...session,findings:{hood:{...session.findings.hood,evidenceIds:[]}}},photos.map(p=>({...p,kind:'detail'}))),/kanıtına/);
});
test('Draft quality checks never silently satisfy technical readiness',()=>{
 const p=plan();p.checks={};assert.equal(studioIssues(p,session,photos).length,28);
 assert.throws(()=>validateStudio(p,session,photos,{complete:true}),/kontrol/);
 p.enabled=false;assert.equal(studioIssues(p,session,photos).length,0);
});
test('Customer masks preserve original dimensions and omit private preparation fields',()=>{
 const p=publicStudio(plan(),session,photos);assert.ok(p);assert.equal(p.equipment,undefined);assert.equal(p.checks,undefined);
 const mask=preparedMask({kind:'approved',studio:p,photos},'p0');assert.equal(mask.width,2400);assert.equal(mask.height,1800);assert.match(mask.parts[0].path,/240 180/);
 assert.equal(preparedMask({kind:'demo',studio:p,photos},'p0'),null);
 assert.equal(publicStudio({...plan(),pins:[{...plan().pins[0],value:901}]},session,photos),null);
});
test('Image advice separates flat, clipped and high-edge synthetic images without damage decisions',()=>{
 const data=new Uint8ClampedArray(32*32*4);for(let i=0;i<data.length;i+=4)data.set([255,255,255,255],i);
 const flat=qualityStatistics(data,32,32);assert.equal(flat.sharpness,0);assert.ok(qualityAdvice(flat,1200,900).some(x=>x.code==='highlight'));
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){const v=(x+y)%2?20:220;data.set([v,v,v,255],(y*32+x)*4);}
 assert.ok(qualityStatistics(data,32,32).sharpness>flat.sharpness);
});
