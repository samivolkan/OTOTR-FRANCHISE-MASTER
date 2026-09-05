import { PARTS, STATUS, createFindings } from './domain.js';
export { STATUS };
// The photographed ADAM has two side doors and a tailgate, not four side doors.
export const REAL_PARTS=PARTS.filter(p=>!['left_rear_door','right_rear_door'].includes(p.id)).map(p=>({...p,name:p.id==='left_front_door'?'Sol kapı':p.id==='right_front_door'?'Sağ kapı':p.name}));
export const FRAME_COUNT=24;
export const normalizeFrame=n=>((Math.round(n)-1)%24+24)%24+1;
export const imagePath=n=>`${import.meta.env?.BASE_URL||'./'}real-car/frame-${String(normalizeFrame(n)).padStart(2,'0')}.jpg`;
export function angleForFrame(n){return (normalizeFrame(n)-1)*15;}
export function directionForFrame(n){
  n=normalizeFrame(n);
  if(n===1)return 'Ön görünüm';if(n<7)return 'Sağ ön görünüm';if(n===7)return 'Sağ yan';if(n<13)return 'Sağ arka görünüm';if(n===13)return 'Arka görünüm';if(n<19)return 'Sol arka görünüm';if(n===19)return 'Sol yan';return 'Sol ön görünüm';
}
// Hand-positioned guide points on documented source frames, normalized to the full image.
// Between nearby views only points visible at both keyframes are interpolated.
export const ANCHORS={
  1:{hood:[50,38],front_bumper:[50,68],windshield:[50,23],left_mirror:[72,30],right_mirror:[27,30]},
  4:{hood:[69,39],front_bumper:[81,63],right_front_fender:[64,51],right_front_door:[39,49],right_rear_fender:[17,45],right_mirror:[49,30],windshield:[59,25],right_a_pillar:[53,25],right_b_pillar:[30,27],right_c_pillar:[17,30],right_sill:[38,72]},
  7:{right_front_door:[49,51],right_front_fender:[77,52],right_rear_fender:[22,49],right_mirror:[64,30],right_a_pillar:[67,25],right_b_pillar:[37,26],right_c_pillar:[23,27],right_sill:[50,76]},
  10:{trunk:[32,48],rear_bumper:[33,72],right_front_door:[69,47],right_rear_fender:[60,54],right_mirror:[83,30],rear_glass:[29,24],right_c_pillar:[47,27],right_b_pillar:[63,26],right_sill:[68,71]},
  13:{trunk:[50,46],rear_bumper:[50,70],rear_glass:[50,23]},
  16:{trunk:[73,48],rear_bumper:[72,70],left_front_door:[36,48],left_rear_fender:[57,54],left_mirror:[22,30],rear_glass:[74,25],left_c_pillar:[61,27],left_b_pillar:[45,25],left_sill:[35,72]},
  19:{left_front_door:[53,51],left_front_fender:[26,48],left_rear_fender:[81,48],left_mirror:[37,29],left_a_pillar:[30,26],left_b_pillar:[67,25],left_c_pillar:[81,27],left_sill:[52,76]},
  22:{hood:[28,38],front_bumper:[19,65],left_front_fender:[47,46],left_front_door:[67,50],left_rear_fender:[84,44],left_mirror:[59,29],windshield:[42,22],left_a_pillar:[53,24],left_b_pillar:[73,24],left_c_pillar:[82,24],left_sill:[67,70]}
};
export const BEST_FRAME={hood:22,roof:22,trunk:13,front_bumper:1,rear_bumper:13,windshield:1,rear_glass:13};
for(const p of REAL_PARTS)if(!BEST_FRAME[p.id])BEST_FRAME[p.id]=p.id.startsWith('left')?19:7;
BEST_FRAME.left_front_door=22;
export function anchorsAt(frame){
  frame=normalizeFrame(frame);if(ANCHORS[frame])return ANCHORS[frame];
  const before=1+Math.floor((frame-1)/3)*3,after=normalizeFrame(before+3),t=(frame-before)/3,out={};
  for(const [id,a]of Object.entries(ANCHORS[before])){const b=ANCHORS[after][id];if(b)out[id]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
  return out;
}
export function createSpinFindings(){
  const findings=createFindings(false);
  findings.left_front_door={status:'painted',measurements:'248, 272, 261',note:'Örnek anlatım: kapı dış yüzeyinde yeniden boyama bulgusu nasıl sunulur? Bu not ve ölçümler, fotoğraftaki araca ait tespit değildir.'};
  findings.right_front_fender={status:'replaced',measurements:'',note:'Örnek anlatım: bağlantı noktaları ve parça etiketi kontrolüyle değerlendirilen bir değişim kaydı. Bu araçta değişim tespit edildiği anlamına gelmez.'};
  findings.rear_bumper={status:'repair',measurements:'',note:'Örnek anlatım: tamponda yüzey onarımı kaydı ve yakın plan kanıtı gösterimi. Bu araca ait hasar iddiası değildir.'};
  return Object.fromEntries(REAL_PARTS.map(p=>[p.id,findings[p.id]]));
}
