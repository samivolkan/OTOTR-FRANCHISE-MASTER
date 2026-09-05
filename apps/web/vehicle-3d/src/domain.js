export const STATUS = {
  original: { label: 'Orijinal', color: '#bbc6c9', dot: '#218865', description: 'Uzmanın örnek değerlendirmesi: boya ve bağlantılarda işlem bulgusu yok.' },
  painted: { label: 'Boyalı', color: '#e5a340', dot: '#ae700c', description: 'Bu parçada yeniden boyama bulgusu kaydedildi.' },
  local: { label: 'Lokal boyalı', color: '#73aadb', dot: '#3279ae', description: 'Parçanın bir bölümünde boya işlemi kaydedildi.' },
  replaced: { label: 'Değişen', color: '#d76b69', dot: '#c6423d', description: 'Uzman, bağlantı ve parça incelemesine göre değişim bulgusu kaydetti.' },
  repair: { label: 'Onarım izli', color: '#ae8cc5', dot: '#8159a1', description: 'Parçada onarım bulgusu kaydedildi; açıklama ve fotoğrafı birlikte inceleyin.' },
  unchecked: { label: 'İncelenmedi', color: '#8c969e', dot: '#717d87', description: 'Bu parça için uzman değerlendirmesi henüz yok.' }
};

const baseParts = [
  ['hood', 'Motor kaputu', 'Dış kaporta', 'metal'],
  ['roof', 'Tavan', 'Dış kaporta', 'metal'],
  ['trunk', 'Bagaj kapağı', 'Dış kaporta', 'metal'],
  ...['left','right'].flatMap(side => {
    const s = side === 'left' ? 'Sol' : 'Sağ';
    return [
      [`${side}_front_fender`, `${s} ön çamurluk`, 'Dış kaporta', 'metal'],
      [`${side}_front_door`, `${s} ön kapı`, 'Dış kaporta', 'metal'],
      [`${side}_rear_door`, `${s} arka kapı`, 'Dış kaporta', 'metal'],
      [`${side}_rear_fender`, `${s} arka çamurluk`, 'Dış kaporta', 'metal'],
      [`${side}_sill`, `${s} marşpiyel`, 'Yapısal dış yüzey', 'metal'],
      ...['a','b','c'].map(p => [`${side}_${p}_pillar`, `${s} ${p.toUpperCase()} sütunu`, 'Yapısal dış yüzey', 'metal']),
      [`${side}_mirror`, `${s} ayna`, 'Diğer dış parçalar', 'plastic']
    ];
  }),
  ['front_bumper', 'Ön tampon', 'Diğer dış parçalar', 'plastic'],
  ['rear_bumper', 'Arka tampon', 'Diğer dış parçalar', 'plastic'],
  ['windshield', 'Ön cam', 'Diğer dış parçalar', 'glass'],
  ['rear_glass', 'Arka cam', 'Diğer dış parçalar', 'glass']
];
export const PARTS = baseParts.map(([id,name,group,material]) => ({id,name,group,material}));
export function createFindings(demo = true) {
  return Object.fromEntries(PARTS.map(p => [p.id, {
    status: demo ? 'original' : 'unchecked',
    measurements: demo && p.material === 'metal' ? '112, 118, 115' : '',
    note: demo ? 'Temsili uzman kaydı. Gerçek ekspertiz sonucu değildir.' : ''
  }]).map(([id,v]) => [id, demo ? ({
    left_front_door: { status:'painted', measurements:'248, 272, 261', note:'Kapı dış yüzeyinde yeniden boyama bulgusu. Bağlantı noktaları ayrıca kontrol edilmelidir. Bu kayıt örnektir.' },
    left_front_fender: { status:'replaced', measurements:'126, 132, 129', note:'Örnek senaryo: bağlantı cıvataları ve parça etiketi incelemesiyle değişim değerlendirmesi. Boya kalınlığı tek başına değişimi göstermez.' },
    right_rear_door: { status:'local', measurements:'118, 184, 122', note:'Örnek senaryo: kapının alt bölümünde lokal boya bulgusu.' },
    rear_bumper: { status:'repair', measurements:'', note:'Örnek senaryo: sol köşede onarım izi. Plastik tamponda standart Fe/NFe boya ölçümü kullanılmaz.' }
  }[id] || v) : v]));
}
const azimuthNames = ['Ön','Sol ön · 30°','Sol ön · 60°','Sol yan','Sol arka · 120°','Sol arka · 150°','Arka','Sağ arka · 210°','Sağ arka · 240°','Sağ yan','Sağ ön · 300°','Sağ ön · 330°'];
const partAtAngle = [['hood','front_bumper'],['left_front_fender','hood'],['left_front_door','left_front_fender'],['left_front_door','left_rear_door','left_sill','left_b_pillar'],['left_rear_door','left_rear_fender'],['left_rear_fender','trunk'],['trunk','rear_bumper'],['right_rear_fender','trunk'],['right_rear_door','right_rear_fender'],['right_front_door','right_rear_door','right_sill','right_b_pillar'],['right_front_door','right_front_fender'],['right_front_fender','hood']];
export const SHOTS = [
  ...azimuthNames.map((name,i) => ({id:`ring-${i}`,name,angle:i*30,elevation:12,group:'Çevre turu',parts:partAtAngle[i],height:'1,1–1,3 m',hint:'Aracın tamamı kadrajda. 1× lens kullanın; komşu çekimle ortak alan bırakın.'})),
  ...[45,135,225,315].map((angle,i) => ({id:`high-${i}`,name:['Üst · sol ön','Üst · sol arka','Üst · sağ arka','Üst · sağ ön'][i],angle,elevation:33,group:'Üst açılar',parts:['roof',i<2?'left_a_pillar':'right_a_pillar',i%2?'rear_glass':'windshield',i<2?'left_c_pillar':'right_c_pillar'],height:'1,7–1,9 m',hint:'Tavan ve cam birleşimlerini gösterin. Güvenli zeminden çekin; aracın üstüne çıkmayın.'})),
  ...[
    ['hood','Kaput detayı',0],['trunk','Bagaj detayı',180],['left_front_door','Sol ön kapı detayı',65],['left_rear_door','Sol arka kapı detayı',110],
    ['right_front_door','Sağ ön kapı detayı',295],['right_rear_door','Sağ arka kapı detayı',250],['front_bumper','Ön tampon detayı',5],['rear_bumper','Arka tampon detayı',175]
  ].map(([part,name,angle],i) => ({id:`detail-${i}`,name,angle,elevation:16,group:'Parça detayları',parts:[part],height:'Parça hizası',hint:'Parçayı dolduran genel plan çekin. Bulgu varsa ayrıca yakın plan ve ölçüm cihazı fotoğrafı ekleyin.'}))
];
SHOTS.find(s=>s.id==='ring-2').parts.push('left_mirror');
SHOTS.find(s=>s.id==='ring-10').parts.push('right_mirror');

export function summarize(findings) {
  return Object.keys(STATUS).map(status => ({status,...STATUS[status],count:PARTS.filter(p=>findings[p.id]?.status===status).length}));
}
export function validateFinding(partId, input) {
  const part = PARTS.find(p=>p.id === partId);
  if (!part || !Object.hasOwn(STATUS,input.status)) throw new Error('Geçersiz parça veya durum.');
  if (typeof input.note !== 'string' || input.note.length > 2000) throw new Error('Not en fazla 2.000 karakter olabilir.');
  const raw = String(input.measurements || '').trim();
  const values = raw ? raw.split(/[,;\s]+/).map(Number) : [];
  if (values.some(v=>!Number.isFinite(v) || v<=0 || v>5000)) throw new Error('Ölçümleri 1–5000 µm aralığında, virgülle ayırarak girin.');
  if(part.material !== 'metal' && values.length) throw new Error('Bu parçada Fe/NFe boya ölçümü uygulanmaz.');
  return { status:input.status, measurements:values.join(', '),note:input.note.trim() };
}
export function captureProgress(photos) {
  const real = SHOTS.filter(s=>photos[s.id]?.kind==='photo').length;
  const examples = SHOTS.filter(s=>photos[s.id]?.kind==='render').length;
  return {real,examples,total:SHOTS.length,percent:Math.round(real/SHOTS.length*100)};
}
export function makeReport(findings, photos, mode) {
  return {
    schemaVersion:'ototr.body-report.v1', reportId:'DEMO-3D-001', demo:true,
    vehicle:{label:'OTOTR Sedan · temsili araç',modelAsset:'procedural-sedan-v1'},
    visualization:{type:'semantic-template', reconstructedFromPhotos:false},
    sourceMode:mode, generatedAt:new Date().toISOString(),
    disclaimer:'Örnek kayıt; teknik onay veya gerçek ekspertiz raporu değildir. Fotoğraflar 3D geometri üretmez.',
    capture:captureProgress(photos),
    parts:PARTS.map(p=>({...p,...findings[p.id],evidence:SHOTS.filter(s=>s.parts.includes(p.id)&&photos[s.id]).map(s=>({shotId:s.id,kind:photos[s.id].kind,name:photos[s.id].name,sha256:photos[s.id].sha256||null}))}))
  };
}
