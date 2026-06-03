export const user = {
  name: 'Ahmet Usta',
  role: 'Ekspertiz Teknisyeni',
  branch: 'Bursa Küçük Sanayi',
  shift: '08:00 - 17:00',
  avatarInitials: 'AU',
};

export type WorkOrder = {
  id: string;
  no: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  km: string;
  status: string;
  priority?: string;
  progress: number;
  taskTotal: number;
  taskDone: number;
  missing: number;
  completed: boolean;
};

export const workOrders: WorkOrder[] = [
  {
    id: 'wo-1',
    no: '16C010935',
    plate: '16C010935',
    brand: 'Volkswagen',
    model: 'Passat',
    year: 2022,
    color: 'Beyaz',
    km: '45.210 km',
    status: 'Teknik Giriş Açık',
    priority: 'Orta',
    progress: 70,
    taskTotal: 10,
    taskDone: 7,
    missing: 1,
    completed: false,
  },
  {
    id: 'wo-2',
    no: '16 E 274',
    plate: '16 E 274',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2021,
    color: 'Beyaz',
    km: '34.521 km',
    status: 'Tamamlandı',
    progress: 100,
    taskTotal: 10,
    taskDone: 10,
    missing: 0,
    completed: true,
  },
  {
    id: 'wo-3',
    no: '16R0273',
    plate: '16R0273',
    brand: 'Volkswagen',
    model: 'Passat',
    year: 2022,
    color: 'Gri',
    km: '62.810 km',
    status: 'Tamamlandı',
    progress: 100,
    taskTotal: 10,
    taskDone: 10,
    missing: 0,
    completed: true,
  },
  {
    id: 'wo-4',
    no: '16 CAN 526',
    plate: '16 CAN 526',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2022,
    color: 'Mavi',
    km: '28.145 km',
    status: 'Tamamlandı',
    progress: 100,
    taskTotal: 10,
    taskDone: 10,
    missing: 0,
    completed: true,
  },
];

export type ModuleItem = {
  id: string;
  title: string;
  tasks: number;
  evidence: number;
  status: string;
  owner: string | null;
  progress: number;
};

export const modules: ModuleItem[] = [
  { id: 'body', title: 'Kaporta Kontrolü', tasks: 10, evidence: 6, status: 'Devam Ediyor', owner: 'Ahmet Usta', progress: 40 },
  { id: 'engine', title: 'Motor Kontrolü', tasks: 8, evidence: 5, status: 'Tamamlandı', owner: 'Ahmet Usta', progress: 100 },
  { id: 'mechanic', title: 'Mekanik Test', tasks: 12, evidence: 8, status: 'Boşta', owner: null, progress: 0 },
  { id: 'obd', title: 'Elektronik / OBD', tasks: 9, evidence: 6, status: 'Eksik Var', owner: null, progress: 20 },
  { id: 'airbag', title: 'Airbag Testi', tasks: 6, evidence: 4, status: 'Boşta', owner: null, progress: 0 },
  { id: 'interior', title: 'İç Mekan Kontrolü', tasks: 7, evidence: 4, status: 'Tamamlandı', owner: 'Mehmet Usta', progress: 100 },
];

export const bodyParts = [
  { part: 'Ön Kaput', state: 'Orijinal', micron: 110 },
  { part: 'Sol Ön Çamurluk', state: 'Boyalı', micron: 210 },
  { part: 'Sağ Ön Çamurluk', state: 'Değişen', micron: 118 },
  { part: 'Sol Ön Kapı', state: 'Orijinal', micron: 105 },
  { part: 'Sağ Ön Kapı', state: 'Boyalı', micron: 195 },
  { part: 'Tavan', state: 'Orijinal', micron: 112 },
  { part: 'Bagaj Kapağı', state: 'Değişen', micron: 98 },
];
