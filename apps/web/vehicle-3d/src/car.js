import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PARTS, STATUS } from './domain.js';

const V = (x,y,z) => new THREE.Vector3(x,y,z);
const mat = (color,metalness=.55,roughness=.3) => new THREE.MeshStandardMaterial({color,metalness,roughness,side:THREE.DoubleSide});

export function createCar() {
  const root = new THREE.Group();
  const groups = Object.fromEntries(PARTS.map(p=>{const g=new THREE.Group();g.name=p.id;g.userData.partId=p.id;root.add(g);return [p.id,g];}));
  const paint = mat('#bcc5c9',.66,.24);
  const dark = mat('#171d24',.23,.4);
  const glass = mat('#253847',.75,.18);
  const chrome = mat('#d8dce0',.93,.2);
  const rubber = mat('#171a1e',.05,.82);
  const light = new THREE.MeshStandardMaterial({color:'#e8f3ff',emissive:'#bfdfff',emissiveIntensity:1.2,roughness:.2});
  const tail = new THREE.MeshStandardMaterial({color:'#c61d2a',emissive:'#df1926',emissiveIntensity:.45,roughness:.24});
  function add(geo,material,parent=root) {
    const mesh = new THREE.Mesh(geo,material);
    mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function box(w,h,d,x,y,z,material,parent=root,r=.035) {
    const m=add(new RoundedBoxGeometry(w,h,d,3,r),material,parent);m.position.set(x,y,z);return m;
  }
  function line(points,material=chrome,parent=root,r=.012) {
    return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),24,r,6,false),material,parent);
  }
  function poly(points,z,material,parent=root,depth=.024) {
    const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.009,bevelThickness:.009});
    const m=add(geo,material,parent);m.position.z=z;return m;
  }
  function surface(x0,x1,width0,width1,y0,y1,crown,material,parent) {
    const pos=[],uv=[],idx=[];const nx=12,nz=16;
    for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
      const t=i/nx,s=j/nz*2-1, width=THREE.MathUtils.lerp(width0,width1,t);
      pos.push(THREE.MathUtils.lerp(x0,x1,t),THREE.MathUtils.lerp(y0,y1,t)+crown*(1-s*s)+.012*Math.sin(t*Math.PI),s*width);uv.push(t,j/nz);
    }
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){let a=i*(nz+1)+j,b=a+nz+1;idx.push(a,b,a+1,b,b+1,a+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return add(g,material,parent);
  }
  // This semantic sedan is authored geometry, never a reconstruction of the photos.
  box(4.35,.18,1.65,0,.42,0,dark);
  surface(-2.22,-.88,.78,.87,.91,1.02,.073,paint.clone(),groups.hood);
  surface(-.30,.77,.72,.69,1.52,1.49,.039,paint.clone(),groups.roof);
  surface(1.30,2.19,.84,.77,1.03,.96,.04,paint.clone(),groups.trunk);
  surface(-.86,-.32,.82,.70,1.055,1.52,.014,glass,groups.windshield);
  surface(.80,1.30,.68,.82,1.49,1.045,.01,glass,groups.rear_glass);

  for(const side of ['left','right']){
    const s=side==='left'?1:-1;
    const z=s*.874-(s<0?.025:0);
    line([[-.30,1.52,s*.72],[.77,1.49,s*.69]],paint.clone(),groups.roof,.021);
    // Shoulder strips close the joint between the hood / deck and vertical fenders.
    function shoulder(xs,innerWidths,heights,parent){
      const pos=[],idx=[];
      xs.forEach((x,i)=>{pos.push(x,heights[i],s*innerWidths[i],x,heights[i]-.015,s*.881);if(i){const a=(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();add(g,paint.clone(),parent);
    }
    shoulder([-2.23,-1.9,-.89],[.78,.804,.87],[.925,1.005,1.04],groups[`${side}_front_fender`]);
    shoulder([1.31,1.5,2.20],[.84,.825,.77],[1.06,1.05,.958],groups[`${side}_rear_fender`]);
    const frontPoints=[[-2.24,.89],[-1.9,1.005],[-.895,1.04],[-.895,.46],[-1.01,.46]];
    for(let i=0;i<=28;i++){const a=i/28*Math.PI;frontPoints.push([-1.50+Math.cos(a)*.49,.47+Math.sin(a)*.49]);}
    frontPoints.push([-2.25,.48]);
    poly(frontPoints,z,paint.clone(),groups[`${side}_front_fender`]);
    poly([[-.864,1.04],[.13,1.07],[.13,.48],[-.864,.48]],z,paint.clone(),groups[`${side}_front_door`]);
    poly([[.165,1.07],[1.075,1.055],[1.16,.98],[.935,.49],[.165,.48]],z,paint.clone(),groups[`${side}_rear_door`]);
    const rearPoints=[[1.105,1.035],[1.38,1.085],[2.20,.945],[2.27,.52],[1.98,.48]];
    for(let i=0;i<=28;i++){const a=i/28*Math.PI;rearPoints.push([1.49+Math.cos(a)*.49,.47+Math.sin(a)*.49]);}
    rearPoints.push([1.12,1.005]);poly(rearPoints,z,paint.clone(),groups[`${side}_rear_fender`]);
    box(1.90,.12,.10,.05,.405,s*.858,paint.clone(),groups[`${side}_sill`],.024);
    // Door glazing follows a tapered cabin rather than a flat box.
    function sideGlass(points,parent){
      const positions=points.flatMap(([x,y])=>[x,y,s*(.873-(y-1.06)*.325)]);
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();add(g,glass,parent);
    }
    sideGlass([[-.797,1.098],[-.302,1.487],[.09,1.49],[.09,1.098]],groups[`${side}_front_door`]);
    sideGlass([[.205,1.098],[.205,1.49],[.747,1.46],[1.127,1.098]],groups[`${side}_rear_door`]);
    line([[-.86,1.08,s*.868],[-.32,1.51,s*.717]],paint.clone(),groups[`${side}_a_pillar`],.031);
    line([[.15,1.08,s*.870],[.15,1.516,s*.727]],paint.clone(),groups[`${side}_b_pillar`],.036);
    line([[.80,1.50,s*.695],[1.30,1.07,s*.845]],paint.clone(),groups[`${side}_c_pillar`],.062);
    line([[-.83,1.078,s*.895],[.2,1.10,s*.895],[1.13,1.08,s*.895]],chrome);
    for(const x of [-.06,.80])box(.17,.026,.043,x,.98,s*.915,chrome,groups[`${side}_${x<0?'front':'rear'}_door`],.009);
    box(.18,.037,.05,-.68,1.09,s*.94,dark,groups[`${side}_mirror`]);
    box(.26,.13,.20,-.72,1.145,s*1.028,paint.clone(),groups[`${side}_mirror`],.05);
    box(.21,.078,.009,-.70,1.152,s*1.128,glass,groups[`${side}_mirror`],.018);
    // Brakes, five twin spokes, tyre shoulders and tread grooves.
    for(const x of [-1.50,1.49]){
      const wheel=new THREE.Group();wheel.position.set(x,.46,s*.872);root.add(wheel);
      const tire=add(new THREE.CylinderGeometry(.421,.421,.245,64,1),rubber,wheel);tire.rotation.x=Math.PI/2;
      const rim=add(new THREE.CylinderGeometry(.302,.302,.259,64),dark,wheel);rim.rotation.x=Math.PI/2;
      const brake=add(new THREE.CylinderGeometry(.252,.252,.012,48),mat('#747c82',.7,.47),wheel);brake.rotation.x=Math.PI/2;brake.position.z=s*.13;
      for(const rad of [.405,.386,.315]){
        const t=add(new THREE.TorusGeometry(rad,.008,8,64),rad<.35?chrome:rubber,wheel);t.position.z=s*.126;
      }
      for(let i=0;i<10;i++){
        const a=i/10*Math.PI*2;
        const spoke=box(.035,.24,.026,Math.sin(a)*.16,Math.cos(a)*.16,s*.148,chrome,wheel,.008);spoke.rotation.z=-a+.16;
      }
      const hub=add(new THREE.CylinderGeometry(.07,.07,.031,24),chrome,wheel);hub.rotation.x=Math.PI/2;hub.position.z=s*.166;
      box(.045,.14,.022,.17,.08,s*.143,mat('#bb3031',.2,.6),wheel);
    }
  }
  box(.25,.40,1.68,-2.225,.68,0,paint.clone(),groups.front_bumper,.095);
  box(.24,.39,1.66,2.225,.69,0,paint.clone(),groups.rear_bumper,.085);
  box(.025,.18,.88,-2.361,.62,0,dark,groups.front_bumper,.018);
  for(let i=0;i<9;i++)box(.032,.11,.012,-2.38,.63,(i-4)*.086,chrome,groups.front_bumper,.005);
  for(const s of [-1,1]){
    const h=box(.10,.10,.48,-2.269,.9,s*.574,dark,groups.front_bumper,.026);h.rotation.y=s*.15;
    const l=box(.12,.024,.42,-2.298,.924,s*.574,light,groups.front_bumper,.011);l.rotation.y=s*.15;
    box(.035,.09,.23,-2.362,.535,s*.61,dark,groups.front_bumper,.012);
    box(.049,.075,.49,2.345,.93,s*.53,tail,groups.rear_bumper,.018);
    box(.053,.020,.72,2.35,.96,s*.37,tail,groups.rear_bumper,.008);
    const exhaust=add(new THREE.CylinderGeometry(.051,.051,.10,20),chrome,groups.rear_bumper);exhaust.rotation.z=Math.PI/2;exhaust.position.set(2.31,.45,s*.62);
  }
  box(.032,.10,.38,-2.383,.78,0,mat('#ebeeee',.1,.55),groups.front_bumper,.008);
  box(.032,.10,.38,2.365,.73,0,mat('#ebeeee',.1,.55),groups.rear_bumper,.008);
  line([[-.85,1.084,-.69],[-.79,1.134,-.2],[-.78,1.14,.01]],dark,groups.windshield,.008);
  line([[-.84,1.095,.08],[-.79,1.15,.57]],dark,groups.windshield,.008);
  // Named semantic surfaces let keyboard and pointer interactions share the same report ids.
  const meshes=[];
  for(const [id,g] of Object.entries(groups))g.traverse(o=>{if(o.isMesh){o.userData.partId=id;o.userData.paintable=o.material!==glass&&o.material!==chrome&&o.material!==dark&&o.material!==light&&o.material!==tail;o.userData.baseColor=o.material.color.clone();meshes.push(o);}});
  return {root,groups,meshes};
}

export class CarViewer {
  constructor(host,onSelect) {
    this.host=host;this.onSelect=onSelect;this.selected='left_front_door';this.colorMode=true;this.exploded=false;this.lastTime=0;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;
    this.renderer.domElement.setAttribute('aria-label','Üç boyutlu temsili araç. Döndürmek için sürükleyin; parça seçmek için dokunun. Parça listesi klavyeyle de kullanılabilir.');
    this.renderer.domElement.setAttribute('role','img');host.append(this.renderer.domElement);
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#f0f2f3');
    const pmrem=new THREE.PMREMGenerator(this.renderer);const room=new RoomEnvironment();this.env=pmrem.fromScene(room,.04);this.scene.environment=this.env.texture;room.dispose();pmrem.dispose();
    this.camera=new THREE.PerspectiveCamera(36,1,.1,100);this.camera.position.set(-5.0,2.6,4.3);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,.67,0);this.controls.enableDamping=true;this.controls.minDistance=4;this.controls.maxDistance=13;this.controls.maxPolarAngle=Math.PI/2-.045;this.controls.enablePan=false;this.controls.autoRotateSpeed=.8;
    const amb=new THREE.HemisphereLight('#ecf4ff','#969b9f',2.25);this.scene.add(amb);
    const sun=new THREE.DirectionalLight('#ffffff',3.4);sun.position.set(-3,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=4;sun.shadow.camera.bottom=-4;sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;sun.shadow.blurSamples=8;this.scene.add(sun);
    const fill=new THREE.DirectionalLight('#d6e5fb',1.5);fill.position.set(4,3,-4);this.scene.add(fill);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=.027;floor.receiveShadow=true;this.scene.add(floor);
    const grid=new THREE.GridHelper(20,40,'#dce1e4','#e4e7e9');grid.position.y=.012;grid.material.transparent=true;grid.material.opacity=.48;this.scene.add(grid);this.grid=grid;
    this.car=createCar();this.scene.add(this.car.root);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.down=null;
    const canvas=this.renderer.domElement;
    canvas.addEventListener('pointerdown',e=>{this.down={x:e.clientX,y:e.clientY};});
    canvas.addEventListener('pointerup',e=>{
      if(!this.down||Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)>6)return;
      const hit=this.hit(e);if(hit)this.onSelect(hit.object.userData.partId);
    });
    canvas.addEventListener('pointermove',e=>{canvas.style.cursor=this.hit(e)?'pointer':'grab';});
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
    this.renderer.setAnimationLoop(()=>{
      if(document.hidden||!host.offsetParent)return;
      this.controls.update();
      for(const [id,g] of Object.entries(this.car.groups)){
        const b=this.exploded?this.explodeOffset(id):V(0,0,0);g.position.lerp(b,.10);
      }
      this.renderer.render(this.scene,this.camera);
    });
  }
  hit(e) {
    const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);return this.raycaster.intersectObjects(this.car.meshes,false)[0];
  }
  explodeOffset(id){
    if(id.startsWith('left'))return V(0,id.includes('pillar')?.20:0,.42);
    if(id.startsWith('right'))return V(0,id.includes('pillar')?.20:0,-.42);
    if(id==='hood')return V(-.3,.42,0);if(id==='roof')return V(0,.65,0);
    if(id==='trunk')return V(.3,.4,0);if(id==='front_bumper')return V(-.50,0,0);if(id==='rear_bumper')return V(.5,0,0);return V(0,.25,0);
  }
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  update(findings,selected=this.selected,colorMode=this.colorMode){
    this.findings=findings;this.selected=selected;this.colorMode=colorMode;
    for(const m of this.car.meshes){
      if(!m.userData.paintable)continue;
      const id=m.userData.partId;const status=STATUS[findings[id]?.status||'unchecked'];
      m.material.color.set(colorMode?status.color:'#bcc5c9');
      m.material.emissive.set(id===selected?'#c18c3f':'#000000');m.material.emissiveIntensity=id===selected?.10:0;
    }
  }
  view(angle=42,elevation=20,distance=7.0){
    const a=THREE.MathUtils.degToRad(angle),e=THREE.MathUtils.degToRad(elevation);this.camera.position.set(-Math.cos(a)*Math.cos(e)*distance,.67+Math.sin(e)*distance,Math.sin(a)*Math.cos(e)*distance);this.controls.target.set(0,.67,0);this.controls.update();
  }
  framePart(id){
    const angle=id.startsWith('left')?75:id.startsWith('right')?285:['trunk','rear_bumper','rear_glass'].includes(id)?175:15;
    this.view(angle,id==='roof'?64:20,7.7);
  }
  async thumbnails(shots){
    const camera=this.camera.clone();const wasColor=this.colorMode,selected=this.selected,auto=this.controls.autoRotate;
    const offsets=Object.values(this.car.groups).map(g=>g.position.clone());Object.values(this.car.groups).forEach(g=>g.position.set(0,0,0));
    const renderer=this.renderer,oldSize=renderer.getSize(new THREE.Vector2()),oldPixelRatio=renderer.getPixelRatio();renderer.setPixelRatio(1);renderer.setSize(720,430,false);
    const urls={};this.update(this.findings,'',false);this.controls.autoRotate=false;
    try{
      for(const shot of shots){
        const a=THREE.MathUtils.degToRad(shot.angle),e=THREE.MathUtils.degToRad(shot.elevation||18),d=7.8;
        camera.aspect=720/430;camera.position.set(-Math.cos(a)*Math.cos(e)*d,.67+Math.sin(e)*d,Math.sin(a)*Math.cos(e)*d);camera.lookAt(0,.65,0);camera.updateProjectionMatrix();renderer.render(this.scene,camera);
        const canvas=document.createElement('canvas');canvas.width=720;canvas.height=430;const ctx=canvas.getContext('2d');ctx.drawImage(renderer.domElement,0,0);ctx.fillStyle='rgba(17,24,32,.77)';ctx.fillRect(12,392,282,26);ctx.fillStyle='#fff';ctx.font='14px Arial';ctx.fillText('OTOTR · TEMSİLİ 3D RENDER',22,410);urls[shot.id]=canvas.toDataURL('image/jpeg',.84);
      }
    }finally{renderer.setPixelRatio(oldPixelRatio);renderer.setSize(oldSize.x,oldSize.y,false);Object.values(this.car.groups).forEach((g,i)=>g.position.copy(offsets[i]));this.update(this.findings,selected,wasColor);this.controls.autoRotate=auto;}
    return urls;
  }
  snapshot(){this.renderer.render(this.scene,this.camera);return this.renderer.domElement.toDataURL('image/png');}
  async exportGLB(){
    const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
    const car=createCar();
    try{return await new GLTFExporter().parseAsync(car.root,{binary:true,onlyVisible:true});}
    finally{const materials=new Set();car.root.traverse(o=>{if(o.isMesh){o.geometry.dispose();materials.add(o.material);}});for(const material of materials)material.dispose();}
  }
}
