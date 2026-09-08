/** Advisory image statistics; never an assessment of damage, identity or capture angle. */
export function qualityStatistics(data,width,height){
  if(!data||width<8||height<8||data.length!==width*height*4)throw Error('Görüntü analizi verisi geçersiz.');
  const gray=new Float32Array(width*height);let total=0,dark=0,bright=0,count=0;
  for(let i=0;i<gray.length;i++)gray[i]=data[i*4]*.2126+data[i*4+1]*.7152+data[i*4+2]*.0722;
  let sum=0,squared=0;
  // Central crop reduces influence from white studio backgrounds, but remains a heuristic.
  for(let y=Math.max(1,Math.floor(height*.2));y<Math.min(height-1,height*.8);y++)for(let x=Math.max(1,Math.floor(width*.1));x<Math.min(width-1,width*.9);x++){
    const i=y*width+x,v=gray[i],lap=gray[i-1]+gray[i+1]+gray[i-width]+gray[i+width]-4*v;
    count++;total+=v;if(v<20)dark++;if(v>245)bright++;sum+=lap;squared+=lap*lap;
  }
  return {mean:total/count,sharpness:Math.max(0,squared/count-(sum/count)**2),darkRatio:dark/count,brightRatio:bright/count};
}
export function qualityAdvice(stats,width,height){
  const flags=[];
  if(Math.min(width,height)<720)flags.push({code:'resolution',label:'Kısa kenar 720 pikselin altında. Gerçek çekimde daha yüksek çözünürlük kullanın.'});
  if(stats.sharpness<45)flags.push({code:'blur',label:'Netlik düşük olabilir. Yazı ve panel kenarlarını yakınlaştırarak kontrol edin.'});
  if(stats.mean<55||stats.darkRatio>.42)flags.push({code:'dark',label:'Karanlık alanlar fazla. Gövde ayrıntılarını kontrol edin.'});
  if(stats.brightRatio>.2)flags.push({code:'highlight',label:'Parlak alanlar ayrıntıları gizleyebilir. Yansıma ve pozlamayı kontrol edin.'});
  return flags;
}
export async function analyzePhoto(blob){
  const bitmap=await createImageBitmap(blob),width=bitmap.width,height=bitmap.height;
  try {const scale=Math.min(1,480/Math.max(width,height)),canvas=document.createElement('canvas');canvas.width=Math.max(8,Math.round(width*scale));canvas.height=Math.max(8,Math.round(height*scale));const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(bitmap,0,0,canvas.width,canvas.height);const stats=qualityStatistics(c.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);return {...stats,width,height,flags:qualityAdvice(stats,width,height)};} finally {bitmap.close();}
}
