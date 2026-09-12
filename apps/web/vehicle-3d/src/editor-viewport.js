const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const fullView=()=>({x:0,y:0,zoom:1});
export function boundedView(view){
  const zoom=clamp(Number.isFinite(view.zoom)?view.zoom:1,1,8),size=1/zoom;
  return {x:clamp(Number.isFinite(view.x)?view.x:0,0,1-size),y:clamp(Number.isFinite(view.y)?view.y:0,0,1-size),zoom};
}
export function zoomView(view,factor,anchor=[view.x+.5/view.zoom,view.y+.5/view.zoom]){
  const zoom=clamp(view.zoom*factor,1,8),ratio=view.zoom/zoom;
  return boundedView({x:anchor[0]-(anchor[0]-view.x)*ratio,y:anchor[1]-(anchor[1]-view.y)*ratio,zoom});
}
export function panView(view,dx,dy){return boundedView({...view,x:view.x+dx,y:view.y+dy});}
export function fitPoints(points){
  if(!points.length)return fullView();
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const zoom=clamp(.76/Math.max(maxX-minX,maxY-minY,.001),1,8);
  return boundedView({x:(minX+maxX)/2-.5/zoom,y:(minY+maxY)/2-.5/zoom,zoom});
}
export function nudgePoint(point,key,width,height,coarse=false){
  const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},d=directions[key];
  if(!d||!point||width<=0||height<=0)return point;
  const pixels=coarse?10:1;
  return [clamp(point[0]+d[0]*pixels/width,0,1),clamp(point[1]+d[1]*pixels/height,0,1)];
}
