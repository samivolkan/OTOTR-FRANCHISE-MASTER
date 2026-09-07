const NS='http://www.w3.org/2000/svg';
let instance=0;
const svg=(name,attrs={})=>{const e=document.createElementNS(NS,name);for(const [key,value]of Object.entries(attrs))e.setAttribute(key,String(value));return e;};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const MODES=new Set(['assembled','exploded','isolate']);

/** Display original photograph pixels through authored SVG contours, never generated surfaces. */
export class PhotographicCar{
  constructor(host,{onSelect=()=>{},names={}}={}){
    this.host=host;this.onSelect=onSelect;this.names=names;this.mode='exploded';this.amount=.72;this.selected=null;this.ghost=false;this.disposed=false;this.layers=[];this.prefix='photo-car-'+(++instance);this.currentSource=null;
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
    this.onMotion=()=>this.render();this.reduced.addEventListener('change',this.onMotion);
    this.onClick=e=>{const group=e.target.closest('[data-photo-part]');if(group){this.onSelect(group.dataset.photoPart);}};
    this.onKey=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.photoPart){e.preventDefault();this.onSelect(e.target.dataset.photoPart);}};
    host.addEventListener('click',this.onClick);host.addEventListener('keydown',this.onKey);
    this.resize=new ResizeObserver(()=>this.updateAnchor());this.resize.observe(host);
  }
  setSource({photo,mask}){
    if(this.disposed||!photo||!mask)return false;
    if(this.currentSource===photo.url&&this.mask===mask)return true;
    this.currentSource=photo.url;this.mask=mask;this.layers=[];this.host.replaceChildren();
    const stage=svg('svg',{viewBox:'-135 -112 1342 810',preserveAspectRatio:'xMidYMid meet',class:'photographic-svg','aria-label':'Gerçek fotoğrafın görünür parçaları'});
    const defs=svg('defs'),baseMask=svg('mask',{id:this.prefix+'-base',maskUnits:'userSpaceOnUse',x:0,y:0,width:1072,height:586});
    baseMask.append(svg('rect',{width:1072,height:586,fill:'white'}));
    const shadow=svg('filter',{id:this.prefix+'-shadow',x:'-60%',y:'-60%',width:'220%',height:'220%'});
    shadow.append(svg('feDropShadow',{dx:0,dy:7,stdDeviation:6,'flood-color':'#172e29','flood-opacity':'.24'}));defs.append(shadow);
    for(const p of mask.parts){const clip=svg('clipPath',{id:this.prefix+'-'+p.id,clipPathUnits:'userSpaceOnUse'});clip.append(svg('path',{d:p.path}));defs.append(clip);baseMask.append(svg('path',{d:p.path,fill:'black'}));}
    defs.append(baseMask);stage.append(defs);
    // Neutral guide silhouettes show the original location; they contain no inferred internal anatomy.
    this.guide=svg('g',{class:'photo-original-locations'});
    for(const p of mask.parts)this.guide.append(svg('path',{d:p.path,fill:'#dee5e2',stroke:'#b7c4bd','stroke-width':'.8','stroke-dasharray':'3 5'}));
    stage.append(this.guide);
    this.context=svg('image',{href:photo.url,width:1072,height:586,mask:'url(#'+this.prefix+'-base)','pointer-events':'none'});
    this.context.addEventListener('error',()=>{if(this.disposed||this.currentSource!==photo.url||!stage.isConnected)return;const message=document.createElement('p');message.className='photo-empty';message.textContent='Fotoğraf yüklenemedi. Başka bir açı seçin veya sayfayı yenileyin.';this.host.replaceChildren(message);this.stage=null;this.anchor=null;this.currentSource=null;});
    stage.append(this.context);
    this.connectors=svg('g',{'pointer-events':'none',class:'photo-connectors'});stage.append(this.connectors);
    for(const p of mask.parts){
      const group=svg('g',{'data-photo-part':p.id,role:'button',tabindex:0,'aria-label':this.names[p.id]||p.id,'aria-pressed':'false',class:'photo-panel'});
      const image=svg('image',{href:photo.url,width:1072,height:586,'clip-path':'url(#'+this.prefix+'-'+p.id+')','pointer-events':'none'});
      const edge=svg('path',{d:p.path,fill:'transparent',stroke:'transparent','stroke-width':1.6,'vector-effect':'non-scaling-stroke'});
      const title=svg('title');title.textContent=this.names[p.id]||p.id;group.append(title,image,edge);
      const line=svg('line',{x1:p.anchor[0],y1:p.anchor[1],x2:p.anchor[0],y2:p.anchor[1],stroke:'#b59159','stroke-width':1.2,'stroke-dasharray':'3 5'});this.connectors.append(line);
      stage.append(group);this.layers.push({part:p,group,image,edge,line,x:0,y:0,scale:1});
    }
    this.stage=stage;this.host.append(stage);this.host.dataset.photoFrame=mask.frame;this.host.dataset.photoParts=mask.parts.length;this.render();return true;
  }
  selectPart(id){if(this.disposed)return;this.selected=id;this.render();}
  setMode(mode){if(!MODES.has(mode)||this.disposed)return false;this.mode=mode;this.render();return true;}
  setExplode(value){if(this.disposed)return;this.amount=clamp(Number(value)||0,0,1);this.render();}
  setGhost(value){this.ghost=!!value;this.render();}
  home(){this.mode='assembled';this.ghost=false;this.render();}
  render(){
    if(!this.stage||this.disposed)return;
    this.stage.classList.toggle('reduce-motion',this.reduced.matches);this.host.dataset.photoMode=this.mode;
    const isolating=this.mode==='isolate'&&this.layers.some(l=>l.part.id===this.selected);
    const joined=this.mode==='assembled'||this.mode==='exploded'&&this.amount===0;
    if(joined)this.context.removeAttribute('mask');else this.context.setAttribute('mask','url(#'+this.prefix+'-base)');
    this.context.style.opacity=isolating?'.13':this.ghost?'.3':'1';this.guide.style.opacity=joined?'0':isolating?'.08':'.7';
    for(const layer of this.layers){const{part:p,group,edge,line}=layer,isSelected=p.id===this.selected;
      let dx=this.mode==='exploded'?p.offset[0]*this.amount:0,dy=this.mode==='exploded'?p.offset[1]*this.amount:0,scale=1;
      if(isSelected&&!joined){const length=Math.hypot(...p.offset)||1,lift=this.mode==='exploded'?18*this.amount:18;dx+=p.offset[0]/length*lift;dy+=p.offset[1]/length*lift;scale=1+.035*(this.mode==='exploded'?this.amount:1);}
      if(isolating&&isSelected){const box=edge.getBBox();scale=clamp(Math.min(620/Math.max(box.width,1),365/Math.max(box.height,1)),1.25,3.4);dx=536-p.anchor[0];dy=297-p.anchor[1];}
      layer.x=dx;layer.y=dy;layer.scale=scale;
      group.style.transition=this.reduced.matches?'none':'transform 720ms cubic-bezier(.2,.7,.2,1), opacity 450ms ease';
      layer.image.style.transition=this.reduced.matches?'none':'opacity 620ms ease';layer.image.style.opacity=joined?this.ghost&&isSelected?'1':'0':'1';
      group.style.transform=`translate(${dx}px,${dy}px) translate(${p.anchor[0]}px,${p.anchor[1]}px) scale(${scale}) translate(${-p.anchor[0]}px,${-p.anchor[1]}px)`;
      group.style.opacity=isolating&&!isSelected?'.08':'1';group.style.filter=this.mode==='assembled'?'none':`url(#${this.prefix}-shadow)`;
      group.setAttribute('aria-pressed',isSelected);group.setAttribute('tabindex',isolating&&!isSelected?'-1':'0');group.style.pointerEvents=isolating&&!isSelected?'none':'auto';
      edge.setAttribute('stroke',isSelected?'#bc9155':'transparent');line.setAttribute('x2',p.anchor[0]+dx);line.setAttribute('y2',p.anchor[1]+dy);line.style.opacity=this.mode==='exploded'&&isSelected?'.7':'0';
    }
    const active=this.layers.find(l=>l.part.id===this.selected);if(active)this.stage.append(active.group);
    this.updateAnchor();
  }
  updateAnchor(){if(this.disposed)return;const layer=this.layers.find(l=>l.part.id===this.selected);this.anchor=layer?{x:layer.part.anchor[0]+layer.x,y:layer.part.anchor[1]+layer.y}:null;}
  getPartScreenPosition(id){if(!this.stage||id!==this.selected||!this.anchor)return null;const matrix=this.stage.getScreenCTM();if(!matrix)return null;const point=new DOMPoint(this.anchor.x,this.anchor.y).matrixTransform(matrix),box=this.host.getBoundingClientRect();return{x:(point.x-box.left)/box.width,y:(point.y-box.top)/box.height,visible:box.width>0&&box.height>0};}
  dispose(){if(this.disposed)return;this.disposed=true;this.resize.disconnect();this.reduced.removeEventListener('change',this.onMotion);this.host.removeEventListener('click',this.onClick);this.host.removeEventListener('keydown',this.onKey);this.host.replaceChildren();this.layers=[];this.currentSource=null;this.mask=null;this.stage=null;this.anchor=null;}
}
