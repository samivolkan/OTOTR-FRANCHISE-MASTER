import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fullView,boundedView,zoomView,panView,fitPoints,nudgePoint} from '../src/editor-viewport.js';
test('Zoom preserves the anchor in the viewport without changing source points',()=>{
 const points=[[.4,.3],[.5,.4]],before=structuredClone(points),a=[.4,.3];
 const view=zoomView(fullView(),2,a);
 assert.ok(Math.abs((a[0]-view.x)*view.zoom-a[0])<1e-10);
 assert.ok(Math.abs((a[1]-view.y)*view.zoom-a[1])<1e-10);
 assert.deepEqual(points,before);assert.deepEqual(zoomView(view,.5,a),fullView());
});
test('Pan and zoom cannot leave the original image, including extreme inputs',()=>{
 assert.deepEqual(panView({x:.2,y:.2,zoom:4},-9,9),{x:0,y:.75,zoom:4});
 assert.equal(zoomView(fullView(),999).zoom,8);assert.deepEqual(zoomView(fullView(),0),fullView());
 assert.deepEqual(boundedView({x:NaN,y:Infinity,zoom:NaN}),fullView());
});
test('Fit includes every contour point with bounded padding on all photo edges',()=>{
 for(const points of [[[0,0],[.05,.05]],[[.9,.9],[1,1]],[[.4,.4],[.5,.6]],[[0,0],[1,1]]]){
  const v=fitPoints(points);for(const p of points){assert.ok(p[0]>=v.x-1e-10&&p[0]<=v.x+1/v.zoom+1e-10);assert.ok(p[1]>=v.y-1e-10&&p[1]<=v.y+1/v.zoom+1e-10);}
 }assert.deepEqual(fitPoints([]),fullView());
});
test('Keyboard nudges use original image pixels independently of zoom and clamp to photo',()=>{
 assert.deepEqual(nudgePoint([.5,.5],'ArrowRight',2000,1000),[.5005,.5]);
 assert.deepEqual(nudgePoint([.5,.5],'ArrowUp',2000,1000,true),[.5,.49]);
 assert.deepEqual(nudgePoint([0,1],'ArrowLeft',2000,1000),[0,1]);
 assert.deepEqual(nudgePoint([0,1],'ArrowDown',2000,1000),[0,1]);
});
