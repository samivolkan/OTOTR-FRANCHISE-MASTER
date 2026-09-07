import {LEFT_PHOTO_MASKS} from './photo-masks-left.js';
import {RIGHT_PHOTO_MASKS} from './photo-masks-right.js';
import {END_PHOTO_MASKS} from './photo-masks-ends.js';

// These hand-traced outlines belong ONLY to these eight reference photographs.
// They must never be mapped onto a customer's car by angle or body profile alone.
export const PHOTO_MASKS=Object.freeze({...LEFT_PHOTO_MASKS,...RIGHT_PHOTO_MASKS,...END_PHOTO_MASKS});
export const PHOTO_MASK_FRAMES=Object.freeze(Object.keys(PHOTO_MASKS).map(Number).sort((a,b)=>a-b));
export function referenceMask(presentation,frame){
  if(presentation?.kind!=='demo'||presentation?.reportId!=='OTOTR-SUNUM-DEMO')return null;
  const n=String(frame).padStart(2,'0'),photo=presentation.photos?.find(p=>p.frame===frame);
  if(!photo||photo.id!=='demo-'+n||photo.url!=='./real-car/frame-'+n+'.jpg'||photo.illustrative!==true)return null;
  return PHOTO_MASKS[frame]||null;
}
export function frameForPhotoPart(id,current=22){
  if(PHOTO_MASKS[current]?.parts.some(p=>p.id===id))return current;
  const preferred=id.startsWith('right')?7:id.startsWith('left')?19:['trunk','rear_glass','rear_bumper'].includes(id)?13:22;
  if(PHOTO_MASKS[preferred]?.parts.some(p=>p.id===id))return preferred;
  return PHOTO_MASK_FRAMES.find(f=>PHOTO_MASKS[f].parts.some(p=>p.id===id))??null;
}
