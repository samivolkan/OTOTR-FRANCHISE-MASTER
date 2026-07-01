import { Ionicons as VectorIonicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { completeTask, fetchLiveWorkOrders, saveBodyInspectionAnswer, signInLive, subscribeLiveChanges, submitFinalReview } from './api';
import { mockLiveOrders } from './mock';
import { liveColors, liveSemanticColors } from './theme';
import { DashboardMetrics, LiveBodyInspectionAnswer, LiveEvidence, LiveTask, LiveWorkOrder, Session } from './types';

type IconName = keyof typeof VectorIonicons.glyphMap;
type TabKey = 'modules' | 'jobs' | 'home' | 'detail' | 'profile';
type ViewKey = TabKey | 'body' | 'evidence' | 'final' | 'notifications';
type DetailStatusKey = 'all' | 'completed' | 'missing' | 'waiting';
type InspectionStatusKey = 'completed' | 'missing' | 'waiting' | 'default';
type Tone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' | 'cyan';

type ModuleItem = {
  id: string;
  title: string;
  icon: IconName;
  tone: Tone;
  taskTotal: number;
  taskDone: number;
  evidenceRequired: number;
  status: string;
  owner: string | null;
  progress: number;
  tasks: LiveTask[];
};

type InspectionStatus = {
  key: InspectionStatusKey;
  tone: Tone;
  icon: IconName;
  label: string;
  description: string;
  statusIcon: IconName;
};
type InspectionStyleKey = 'Completed' | 'Missing' | 'Waiting' | 'Default';
type InspectionStatusConfig = {
  styleKey: InspectionStyleKey;
  label: string;
  badgeTone: Tone;
  statusIcon: IconName;
};

type InspectionRow = {
  id: string;
  index: number;
  module: ModuleItem;
  statusKey: InspectionStatusKey;
  title: string;
  subStatus: string;
};

const technician = {
  name: 'Ahmet Usta',
  role: 'Ekspertiz Teknisyeni',
  branch: 'Bursa KÃ¼Ã§Ã¼k Sanayi',
  shift: '08:00 - 17:00',
  avatarInitials: 'AU',
};

const bodyParts = [
  { part: 'Ã–n Kaput', icon: 'car-sport-outline' as IconName, state: 'Orijinal', micron: 110 },
  { part: 'Sol Ã–n Ã‡amurluk', icon: 'trail-sign-outline' as IconName, state: 'BoyalÄ±', micron: 210 },
  { part: 'SaÄŸ Ã–n Ã‡amurluk', icon: 'trail-sign-outline' as IconName, state: 'DeÄŸiÅŸen', micron: 118 },
  { part: 'Sol Ã–n KapÄ±', icon: 'tablet-landscape-outline' as IconName, state: 'Orijinal', micron: 105 },
  { part: 'SaÄŸ Ã–n KapÄ±', icon: 'tablet-landscape-outline' as IconName, state: 'BoyalÄ±', micron: 195 },
  { part: 'Tavan', icon: 'remove-outline' as IconName, state: 'Orijinal', micron: 112 },
  { part: 'Bagaj KapaÄŸÄ±', icon: 'car-outline' as IconName, state: 'DeÄŸiÅŸen', micron: 98 },
];

type BodyInspectionPart = (typeof bodyParts)[number];
type BodyPartState = BodyInspectionPart['state'];

const evidenceTemplates = [
  { title: 'AraÃ§ Ã–n GÃ¶rÃ¼nÃ¼m', icon: 'car-sport-outline' as IconName, tone: 'blue' as Tone },
  { title: 'AraÃ§ Arka GÃ¶rÃ¼nÃ¼m', icon: 'car-outline' as IconName, tone: 'green' as Tone },
  { title: 'Åasi Etiketi', icon: 'barcode-outline' as IconName, tone: 'gray' as Tone },
  { title: 'Boya Ã–lÃ§Ã¼m EkranÄ±', icon: 'speedometer-outline' as IconName, tone: 'purple' as Tone },
  { title: 'HasarlÄ± BÃ¶lge FotoÄŸrafÄ±', icon: 'warning-outline' as IconName, tone: 'orange' as Tone },
];

const notifications = [
  {
    title: 'Yeni Ä°ÅŸ Emri AtandÄ±',
    tag: 'Yeni',
    tone: 'blue' as Tone,
    time: '16:45',
    unread: true,
    body: '16 CAN 526 plakalÄ± 2022 Volkswagen Golf aracÄ±na yeni iÅŸ emri atandÄ±.',
    icon: 'document-text-outline' as IconName,
  },
  {
    title: 'Eksik AdÄ±m Tespit Edildi',
    tag: 'UyarÄ±',
    tone: 'orange' as Tone,
    time: '15:10',
    unread: true,
    body: '16 R 0273 numaralÄ± iÅŸ emrinde 1 eksik adÄ±m tespit edildi.',
    icon: 'alert-circle-outline' as IconName,
  },
  {
    title: 'Devralma Talebi Geldi',
    tag: 'Bilgi',
    tone: 'purple' as Tone,
    time: '14:40',
    unread: true,
    body: '16 BZ 198 numaralÄ± iÅŸ emri iÃ§in devralma talebi aldÄ±nÄ±z.',
    icon: 'people-outline' as IconName,
  },
  {
    title: 'Teknik Onaydan DÃ¶ndÃ¼',
    tag: 'Kritik',
    tone: 'red' as Tone,
    time: '14:05',
    unread: false,
    body: '16 R 0273 numaralÄ± iÅŸ emri teknik onaydan dÃ¶ndÃ¼. Ä°nceleme yapmanÄ±z gerekiyor.',
    icon: 'shield-outline' as IconName,
  },
  {
    title: 'Rapor OnaylandÄ±',
    tag: 'BaÅŸarÄ±lÄ±',
    tone: 'green' as Tone,
    time: '12:30',
    unread: false,
    body: '16 E 274 plakalÄ± 2021 Volkswagen Golf aracÄ±nÄ±n raporu onaylandÄ±.',
    icon: 'shield-checkmark-outline' as IconName,
  },
  {
    title: 'Sistem BakÄ±m Ã‡alÄ±ÅŸmasÄ±',
    tag: 'Sistem',
    tone: 'blue' as Tone,
    time: '09:15',
    unread: false,
    body: '19 MayÄ±s 2025 Pazar 02:00 - 04:00 saatleri arasÄ±nda sistem bakÄ±m Ã§alÄ±ÅŸmasÄ± yapÄ±lacaktÄ±r.',
    icon: 'settings-outline' as IconName,
  },
];

const quickActions = [
  { title: 'Ä°ÅŸlerim', subtitle: 'Devam eden iÅŸler', icon: 'clipboard-outline' as IconName, tone: 'blue' as Tone, view: 'jobs' as ViewKey },
  { title: 'Eksikler', subtitle: 'Eksik adÄ±mlar', icon: 'alert-circle-outline' as IconName, tone: 'orange' as Tone, view: 'detail' as ViewKey },
  { title: 'KanÄ±tlar', subtitle: 'FotoÄŸraf & video', icon: 'camera-outline' as IconName, tone: 'green' as Tone, view: 'evidence' as ViewKey },
  { title: 'Rapor Ã–nizle', subtitle: 'BasÄ±m hazÄ±rlÄ±ÄŸÄ±', icon: 'document-text-outline' as IconName, tone: 'purple' as Tone, view: 'final' as ViewKey },
];

const moduleDefinitions = [
  { id: 'body', title: 'Kaporta KontrolÃ¼', icon: 'car-sport-outline' as IconName, tone: 'blue' as Tone, tasks: 10, evidence: 6, keywords: ['body', 'paint', 'kaporta', 'boya', 'dÄ±ÅŸ', 'dis'] },
  { id: 'engine', title: 'Motor KontrolÃ¼', icon: 'construct-outline' as IconName, tone: 'green' as Tone, tasks: 8, evidence: 5, keywords: ['engine', 'motor'] },
  { id: 'mechanic', title: 'Mekanik Test', icon: 'build-outline' as IconName, tone: 'purple' as Tone, tasks: 12, evidence: 8, keywords: ['mechanic', 'mekanik', 'brake', 'fren', 'suspension', 'sÃ¼spansiyon'] },
  { id: 'obd', title: 'Elektronik / OBD', icon: 'hardware-chip-outline' as IconName, tone: 'orange' as Tone, tasks: 9, evidence: 6, keywords: ['obd', 'beyin', 'elektronik', 'electric'] },
  { id: 'airbag', title: 'Airbag Testi', icon: 'accessibility-outline' as IconName, tone: 'red' as Tone, tasks: 6, evidence: 4, keywords: ['airbag', 'srs'] },
  { id: 'interior', title: 'Ä°Ã§ Mekan KontrolÃ¼', icon: 'person-seat-outline' as IconName, tone: 'cyan' as Tone, tasks: 7, evidence: 4, keywords: ['interior', 'iÃ§', 'ic', 'donanÄ±m', 'kabin'] },
];

function Ionicons({ name, color = liveColors.ink, size = 24, style }: { name: IconName; color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {renderIcon(String(name), color)}
    </Svg>
  );
}

function renderIcon(name: string, color: string) {
  const stroke = { stroke: color, strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const filled = { fill: color };

  if (name.includes('chevron-forward')) return <Polyline points="9 5 16 12 9 19" {...stroke} />;
  if (name.includes('chevron-down')) return <Polyline points="6 9 12 15 18 9" {...stroke} />;
  if (name.includes('chevron-up')) return <Polyline points="6 15 12 9 18 15" {...stroke} />;
  if (name.includes('arrow-back')) return <><Line x1="20" y1="12" x2="5" y2="12" {...stroke} /><Polyline points="12 5 5 12 12 19" {...stroke} /></>;
  if (name.includes('arrow-forward')) return <><Line x1="4" y1="12" x2="19" y2="12" {...stroke} /><Polyline points="12 5 19 12 12 19" {...stroke} /></>;
  if (name.includes('checkmark')) return <Polyline points="5 12.5 10 17 19 7" {...stroke} />;
  if (name.includes('alert') || name.includes('warning')) return <><Path d="M12 3 22 20H2L12 3Z" {...stroke} /><Line x1="12" y1="9" x2="12" y2="13" {...stroke} /><Circle cx="12" cy="17" r="1" {...filled} /></>;
  if (name.includes('lock')) return <><Rect x="5" y="10" width="14" height="10" rx="2.5" {...stroke} /><Path d="M8 10V7a4 4 0 0 1 8 0v3" {...stroke} /><Line x1="12" y1="14" x2="12" y2="17" {...stroke} /></>;
  if (name.includes('person') || name.includes('accessibility')) return <><Circle cx="12" cy="7.5" r="3.2" {...stroke} /><Path d="M5.5 20c1.1-4.2 11.9-4.2 13 0" {...stroke} /></>;
  if (name.includes('people')) return <><Circle cx="9" cy="8" r="3" {...stroke} /><Circle cx="17" cy="9.5" r="2.2" {...stroke} /><Path d="M3.8 20c1.1-4 9.5-4 10.6 0" {...stroke} /><Path d="M14 19c.9-2.1 4.5-2.4 6-.7" {...stroke} /></>;
  if (name.includes('home')) return <><Path d="M3.5 11.5 12 4l8.5 7.5" {...stroke} /><Path d="M5.5 10.5V20h13v-9.5" {...stroke} /><Path d="M9.5 20v-6h5v6" {...stroke} /></>;
  if (name.includes('notification')) return <><Path d="M18 10a6 6 0 0 0-12 0c0 5-2.2 5.6-2.2 7.2h16.4C20.2 15.6 18 15 18 10Z" {...stroke} /><Path d="M10 20a2.2 2.2 0 0 0 4 0" {...stroke} /></>;
  if (name.includes('document') || name.includes('reader')) return <><Path d="M7 3h7l4 4v14H7V3Z" {...stroke} /><Path d="M14 3v5h5" {...stroke} /><Line x1="9.5" y1="12" x2="16" y2="12" {...stroke} /><Line x1="9.5" y1="16" x2="16" y2="16" {...stroke} /></>;
  if (name.includes('clipboard')) return <><Rect x="6" y="5" width="12" height="16" rx="2" {...stroke} /><Path d="M9 5a3 3 0 0 1 6 0" {...stroke} /><Line x1="9" y1="11" x2="15" y2="11" {...stroke} /><Line x1="9" y1="15" x2="15" y2="15" {...stroke} /></>;
  if (name.includes('camera')) return <><Rect x="4" y="7" width="16" height="12" rx="3" {...stroke} /><Path d="M8 7l1.6-2h4.8L16 7" {...stroke} /><Circle cx="12" cy="13" r="3" {...stroke} /></>;
  if (name.includes('videocam')) return <><Rect x="4" y="7" width="11" height="10" rx="2" {...stroke} /><Path d="M15 10l5-3v10l-5-3" {...stroke} /></>;
  if (name.includes('car')) return <><Path d="M5 13l1.6-5h10.8L19 13" {...stroke} /><Rect x="3.5" y="12" width="17" height="5" rx="2" {...stroke} /><Circle cx="7" cy="18" r="1.7" {...stroke} /><Circle cx="17" cy="18" r="1.7" {...stroke} /></>;
  if (name.includes('calendar')) return <><Rect x="4" y="5" width="16" height="16" rx="2.5" {...stroke} /><Line x1="8" y1="3.5" x2="8" y2="7" {...stroke} /><Line x1="16" y1="3.5" x2="16" y2="7" {...stroke} /><Line x1="4" y1="10" x2="20" y2="10" {...stroke} /></>;
  if (name.includes('time')) return <><Circle cx="12" cy="12" r="8.2" {...stroke} /><Path d="M12 7.5V12l3.4 2.2" {...stroke} /></>;
  if (name.includes('location')) return <><Path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" {...stroke} /><Circle cx="12" cy="10" r="2.4" {...stroke} /></>;
  if (name.includes('shield')) return <><Path d="M12 3 19 6v5.4c0 4.6-2.9 7.9-7 9.6-4.1-1.7-7-5-7-9.6V6l7-3Z" {...stroke} /><Polyline points="8.5 12 11 14.5 16 9.5" {...stroke} /></>;
  if (name.includes('eye')) return <><Path d="M2.8 12s3.4-6 9.2-6 9.2 6 9.2 6-3.4 6-9.2 6-9.2-6-9.2-6Z" {...stroke} /><Circle cx="12" cy="12" r="3" {...stroke} /></>;
  if (name.includes('headset')) return <><Path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" {...stroke} /><Rect x="3" y="12" width="4" height="6" rx="2" {...stroke} /><Rect x="17" y="12" width="4" height="6" rx="2" {...stroke} /><Path d="M17 19c-1 1.5-2.7 2-5 2" {...stroke} /></>;
  if (name.includes('save')) return <><Path d="M5 4h12l2 2v14H5V4Z" {...stroke} /><Path d="M8 4v6h8V4" {...stroke} /><Rect x="8" y="15" width="8" height="5" {...stroke} /></>;
  if (name.includes('play')) return <Path d="M8 5v14l11-7L8 5Z" fill={color} />;
  if (name.includes('settings')) return <><Circle cx="12" cy="12" r="3.2" {...stroke} /><Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" {...stroke} /></>;
  if (name.includes('build') || name.includes('construct')) return <><Path d="M14.5 4.5 19.5 9.5 10 19H5v-5L14.5 4.5Z" {...stroke} /><Line x1="13" y1="6" x2="18" y2="11" {...stroke} /></>;
  if (name.includes('hardware')) return <><Rect x="6" y="6" width="12" height="12" rx="2" {...stroke} /><Rect x="9" y="9" width="6" height="6" rx="1" {...stroke} /><Path d="M3 9h3M3 15h3M18 9h3M18 15h3M9 3v3M15 3v3M9 18v3M15 18v3" {...stroke} /></>;
  if (name.includes('cube')) return <><Path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" {...stroke} /><Path d="M4 7.5 12 12l8-4.5M12 12v9" {...stroke} /></>;
  if (name.includes('speedometer') || name.includes('analytics')) return <><Path d="M5 17a8 8 0 1 1 14 0" {...stroke} /><Line x1="12" y1="14" x2="16" y2="9" {...stroke} /><Circle cx="12" cy="14" r="1.2" {...filled} /></>;
  if (name.includes('pulse')) return <Polyline points="3 13 7 13 9 6 13 18 15 13 21 13" {...stroke} />;
  if (name.includes('chatbox')) return <Path d="M5 5h14v10H9l-4 4V5Z" {...stroke} />;
  if (name.includes('attach')) return <Path d="M8 13 15.5 5.5a3 3 0 0 1 4.2 4.2L10 19.5a5 5 0 0 1-7.1-7.1L12 3.3" {...stroke} />;
  if (name.includes('barcode')) return <><Line x1="5" y1="5" x2="5" y2="19" {...stroke} /><Line x1="9" y1="5" x2="9" y2="19" {...stroke} /><Line x1="13" y1="5" x2="13" y2="19" {...stroke} /><Line x1="18" y1="5" x2="18" y2="19" {...stroke} /></>;
  if (name.includes('cloud')) return <><Path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.8A3.2 3.2 0 0 0 7 18Z" {...stroke} /><Path d="M12 17v-7M9.5 12.5 12 10l2.5 2.5" {...stroke} /></>;
  if (name.includes('grid')) return <><Rect x="4" y="4" width="6" height="6" rx="1.5" {...stroke} /><Rect x="14" y="4" width="6" height="6" rx="1.5" {...stroke} /><Rect x="4" y="14" width="6" height="6" rx="1.5" {...stroke} /><Rect x="14" y="14" width="6" height="6" rx="1.5" {...stroke} /></>;
  if (name.includes('bag') || name.includes('briefcase')) return <><Rect x="4" y="8" width="16" height="11" rx="2.5" {...stroke} /><Path d="M9 8V6a3 3 0 0 1 6 0v2" {...stroke} /></>;
  if (name.includes('flame')) return <Path d="M12 21c-4 0-7-2.7-7-6.5 0-2.6 1.6-4.7 3.8-6.5.4 2.1 1.8 3.2 3.2 3.8-.1-3 1.4-5.3 3.6-7.8.4 3.6 3.4 5.6 3.4 10.2 0 4-3 6.8-7 6.8Z" {...stroke} />;
  if (name.includes('mail')) return <><Rect x="4" y="6" width="16" height="12" rx="2" {...stroke} /><Path d="M4.5 7 12 13l7.5-6" {...stroke} /></>;
  if (name.includes('key')) return <><Circle cx="8" cy="12" r="3" {...stroke} /><Path d="M11 12h9M16 12v3M19 12v2" {...stroke} /></>;
  if (name.includes('information') || name.includes('help')) return <><Circle cx="12" cy="12" r="8.5" {...stroke} /><Line x1="12" y1="11" x2="12" y2="17" {...stroke} /><Circle cx="12" cy="7.5" r="1" {...filled} /></>;
  if (name.includes('ellipsis')) return <><Circle cx="12" cy="5" r="1.5" {...filled} /><Circle cx="12" cy="12" r="1.5" {...filled} /><Circle cx="12" cy="19" r="1.5" {...filled} /></>;
  if (name.includes('remove')) return <Line x1="5" y1="12" x2="19" y2="12" {...stroke} />;
  if (name.includes('log-out')) return <><Path d="M10 5H5v14h5" {...stroke} /><Line x1="11" y1="12" x2="20" y2="12" {...stroke} /><Polyline points="16 8 20 12 16 16" {...stroke} /></>;

  return <><Rect x="5" y="5" width="14" height="14" rx="4" {...stroke} /><Circle cx="12" cy="12" r="2" {...filled} /></>;
}

export function LiveApp() {
  const insets = useSafeAreaInsets();
  const [iconsReady, setIconsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<LiveWorkOrder[]>(mockLiveOrders);
  const [selectedId, setSelectedId] = useState(mockLiveOrders[0]?.id || '');
  const [view, setView] = useState<ViewKey>('home');
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState('Demo veri');
  const [lastError, setLastError] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');

  const selectedOrder = useMemo(
    () => orders.find((item) => item.id === selectedId) || orders[0],
    [orders, selectedId],
  );

  const metrics = useMemo<DashboardMetrics>(() => {
    const allTasks = orders.flatMap((order) => order.tasks);
    return {
      openOrders: orders.filter((order) => !isClosed(order.status)).length,
      completedTasks: allTasks.filter((task) => normalizeStatus(task.status) === 'COMPLETED').length,
      waitingApproval: orders.filter((order) => order.gates.secretaryReady && !order.gates.managerApproved).length,
      missingEvidence: allTasks.filter((task) => task.evidenceCount === 0 && normalizeStatus(task.status) !== 'COMPLETED').length,
    };
  }, [orders]);

  const modules = useMemo(() => buildModules(selectedOrder), [selectedOrder]);
  const selectedTask = useMemo(() => getActiveTask(selectedOrder), [selectedOrder]);
  const activeTab = getActiveTab(view);

  useEffect(() => {
    let mounted = true;
    loadIconFont()
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setIconsReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function syncLive(nextSession = session, options: { silent?: boolean } = {}) {
    if (!nextSession) {
      setLastError('CanlÄ± senkron iÃ§in bayi portalÄ± kullanÄ±cÄ±sÄ± ile giriÅŸ gerekli.');
      return;
    }
    if (!options.silent) setLoading(true);
    setLastError('');
    try {
      const liveOrders = await fetchLiveWorkOrders(nextSession);
      setOrders(liveOrders);
      setSelectedId((current) => (liveOrders.some((item) => item.id === current) ? current : liveOrders[0]?.id || ''));
      setLastSync(new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLastError(message);
      setLastSync('CanlÄ± hata, son veri korunuyor');
    } finally {
      if (!options.silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return undefined;
    const realtime = subscribeLiveChanges(session, () => {
      syncLive(session, { silent: true });
    });
    const timer = setInterval(() => {
      syncLive(session, { silent: true });
    }, 30000);
    return () => {
      realtime.unsubscribe();
      clearInterval(timer);
    };
  }, [session]);

  async function handleLogin(email: string, password: string) {
    const nextEmail = email.trim();
    if (!nextEmail || !password.trim()) {
      const message = 'CanlÄ± baÄŸlantÄ± iÃ§in e-posta ve ÅŸifre alanlarÄ± zorunludur.';
      setLastError(message);
      Alert.alert('Eksik bilgi', message);
      return;
    }
    setLoading(true);
    setLastError('');
    try {
      const nextSession = await signInLive(nextEmail, password);
      setSession(nextSession);
      await syncLive(nextSession);
      setView('home');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLastError(message);
      Alert.alert('CanlÄ± giriÅŸ baÅŸarÄ±sÄ±z', message);
    } finally {
      setLoading(false);
    }
  }

  async function completeActiveTaskAndContinue() {
    if (!session) {
      Alert.alert('Oturum gerekli', 'CanlÄ± gÃ¶rev gÃ¼ncellemek iÃ§in bayi portalÄ± hesabÄ± ile giriÅŸ yapÄ±n.');
      return;
    }
    if (!selectedTask || !isActionableTask(selectedTask.status)) {
      Alert.alert('GÃ¶rev hazÄ±r deÄŸil', 'Bu gÃ¶rev canlÄ± sistemde teknik giriÅŸ iÃ§in aÃ§Ä±k deÄŸil. Final kontrol ekranÄ± aÃ§Ä±lÄ±yor.');
      setView('final');
      return;
    }
    setLoading(true);
    try {
      await completeTask(session, selectedTask, evidenceNote);
      await syncLive(session, { silent: true });
      setEvidenceNote('');
      setView('final');
      Alert.alert('KayÄ±t alÄ±ndÄ±', 'Mobilde girilen teknik veri canlÄ± bayi portalÄ±na gÃ¶nderildi.');
    } catch (error) {
      Alert.alert('GÃ¶rev kaydedilemedi', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function persistBodyInspection(parts: LiveBodyInspectionAnswer[], options: { silent?: boolean } = {}) {
    if (!session || !selectedOrder) {
      if (!options.silent) Alert.alert('Oturum gerekli', 'CanlÄ± forma veri yazmak iÃ§in oturum aÃ§Ä±k olmalÄ±.');
      return false;
    }
    if (!parts.length) return true;
    if (!options.silent) setLoading(true);
    try {
      await Promise.all(parts.map((part) => saveBodyInspectionAnswer(session, selectedOrder, part)));
      setLastSync(new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLastError(message);
      if (!options.silent) Alert.alert('CanlÄ± form kaydedilemedi', message);
      return false;
    } finally {
      if (!options.silent) setLoading(false);
    }
  }

  function handleBodyPartChange(part: LiveBodyInspectionAnswer) {
    persistBodyInspection([part], { silent: true });
  }

  async function handleBodyDraft(parts: LiveBodyInspectionAnswer[]) {
    const saved = await persistBodyInspection(parts, { silent: false });
    if (saved) Alert.alert('Taslak kaydedildi', 'Kaporta formu canlÄ± sisteme iÅŸlendi.');
  }

  async function handleBodyContinue(parts: LiveBodyInspectionAnswer[]) {
    const saved = await persistBodyInspection(parts, { silent: false });
    if (!saved) return;
    await syncLive(session, { silent: true });
    setView('evidence');
  }

  async function handleSubmitFinalReview() {
    if (!session || !selectedOrder) {
      Alert.alert('Oturum gerekli', 'Raporu teknik onaya gÃ¶ndermek iÃ§in oturum aÃ§Ä±k olmalÄ±.');
      return;
    }
    setLoading(true);
    try {
      await submitFinalReview(session, selectedOrder);
      await syncLive(session, { silent: true });
      Alert.alert('Rapor teknik onaya gÃ¶nderildi.');
    } catch (error) {
      Alert.alert('GÃ¶nderim baÅŸarÄ±sÄ±z', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOrder(order: LiveWorkOrder) {
    setSelectedId(order.id);
    setView('detail');
  }

  function handleTabChange(tab: TabKey) {
    setView(tab);
  }

  function handleBack() {
    if (view === 'final') setView('evidence');
    else if (view === 'evidence') setView('body');
    else if (view === 'body') setView('modules');
    else if (view === 'modules') setView('detail');
    else if (view === 'detail') setView('jobs');
    else setView('home');
  }

  if (!iconsReady) {
    return <StartupScreen />;
  }

  if (!session) {
    return <LoginScreen loading={loading} lastError={lastError} onLogin={handleLogin} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(190, 150 + insets.bottom) }]}
          contentInset={{ bottom: 24 + insets.bottom }}
        >
          {view === 'home' && (
            <HomeScreen
              metrics={metrics}
              orders={orders}
              selectedOrder={selectedOrder}
              lastSync={lastSync}
              lastError={lastError}
              onOpenView={setView}
              onSync={() => syncLive()}
            />
          )}
          {view === 'jobs' && (
            <JobsScreen
              metrics={metrics}
              orders={orders}
              lastSync={lastSync}
              onSelect={handleSelectOrder}
              onSync={() => syncLive()}
            />
          )}
          {view === 'detail' && selectedOrder && (
            <WorkOrderDetailScreen order={selectedOrder} modules={modules} onBack={handleBack} onStart={() => setView('modules')} />
          )}
          {view === 'modules' && selectedOrder && (
            <TaskModulesScreen order={selectedOrder} modules={modules} onBack={handleBack} onContinue={() => setView('body')} />
          )}
          {view === 'body' && selectedOrder && (
            <BodyInspectionScreen
              order={selectedOrder}
              onBack={handleBack}
              onChangePart={handleBodyPartChange}
              onSaveDraft={handleBodyDraft}
              onContinue={handleBodyContinue}
            />
          )}
          {view === 'evidence' && selectedOrder && (
            <EvidenceScreen
              order={selectedOrder}
              note={evidenceNote}
              onChangeNote={setEvidenceNote}
              onBack={handleBack}
              onComplete={completeActiveTaskAndContinue}
            />
          )}
          {view === 'final' && selectedOrder && <FinalReviewScreen order={selectedOrder} modules={modules} onBack={handleBack} onSubmit={handleSubmitFinalReview} />}
          {view === 'notifications' && <NotificationsScreen />}
          {view === 'profile' && (
            <ProfileScreen
              metrics={metrics}
              lastSync={lastSync}
              onLogout={() => {
                setSession(null);
                setOrders(mockLiveOrders);
                setSelectedId(mockLiveOrders[0]?.id || '');
                setView('home');
                setLastSync('Demo veri');
                setLastError('');
              }}
            />
          )}
        </ScrollView>
        <BottomTabs active={activeTab} onChange={handleTabChange} safeBottom={insets.bottom} />
        {loading && <LoadingOverlay />}
      </View>
    </SafeAreaView>
  );
}

function StartupScreen() {
  return (
    <SafeAreaView style={styles.loginSafe}>
      <StatusBar style="light" />
      <View style={styles.startupScreen}>
        <LogoText size="large" />
        <Text style={styles.loginSubtitle}>TarafsÄ±z AraÃ§ Ekspertizi</Text>
        <ActivityIndicator color={liveColors.white} size="large" style={styles.startupLoader} />
      </View>
    </SafeAreaView>
  );
}

function LoginScreen({ loading, lastError, onLogin }: { loading: boolean; lastError: string; onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  return (
    <SafeAreaView style={styles.loginSafe}>
      <StatusBar style="light" />
      <View style={styles.loginBg}>
        <View style={styles.headerCurveA} />
        <View style={styles.headerCurveB} />
        <View style={styles.loginLogoWrap}>
          <LogoText size="large" />
          <Text style={styles.loginSubtitle}>TarafsÄ±z AraÃ§ Ekspertizi</Text>
        </View>
        <View style={styles.loginCard}>
          <View style={styles.loginCardHead}>
            <IconBubble icon="lock-closed-outline" tone="blue" />
            <View style={styles.flex1}>
              <Text style={styles.loginTitle}>GiriÅŸ Yap</Text>
              <Text style={styles.loginBody}>HesabÄ±nÄ±za giriÅŸ yaparak devam edin.</Text>
            </View>
          </View>
          <Input icon="person-outline" placeholder="Telefon / E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input icon="lock-closed-outline" placeholder="Åifre" value={password} onChangeText={setPassword} secureTextEntry rightIcon="eye-outline" />
          <View style={styles.loginOptions}>
            <Pressable style={styles.checkRow} onPress={() => setRemember((value) => !value)}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>{remember ? <Ionicons name="checkmark" color={liveColors.white} size={16} /> : null}</View>
              <Text style={styles.optionText}>Beni hatÄ±rla</Text>
            </Pressable>
            <Text style={styles.linkText}>Åifremi unuttum</Text>
          </View>
          {lastError ? <Text style={styles.loginError}>{lastError}</Text> : null}
          <Pressable style={styles.primaryButton} disabled={loading} onPress={() => onLogin(email, password)}>
            <Text style={styles.primaryButtonText}>GiriÅŸ Yap</Text>
            <Ionicons name="arrow-forward" color={liveColors.white} size={22} />
          </Pressable>
          <Pressable style={styles.outlineButton}>
            <Ionicons name="headset-outline" color={liveColors.blue} size={20} />
            <Text style={styles.outlineButtonText}>Teknik Destek</Text>
          </Pressable>
          <View style={styles.branchRow}>
            <Ionicons name="location-outline" color={liveColors.blue} size={22} />
            <Text style={styles.branchText}>Åube: <Text style={styles.branchStrong}>Bursa KÃ¼Ã§Ã¼k Sanayi</Text></Text>
            <Ionicons name="chevron-forward" color={liveColors.muted} size={22} />
          </View>
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" color={liveColors.green} size={20} />
            <Text style={styles.securityText}>GÃ¼venli giriÅŸ iÃ§in tÃ¼m verileriniz ÅŸifrelenmektedir.</Text>
          </View>
        </View>
        {loading && <LoadingOverlay />}
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({
  metrics,
  orders,
  selectedOrder,
  lastSync,
  lastError,
  onOpenView,
  onSync,
}: {
  metrics: DashboardMetrics;
  orders: LiveWorkOrder[];
  selectedOrder?: LiveWorkOrder;
  lastSync: string;
  lastError: string;
  onOpenView: (view: ViewKey) => void;
  onSync: () => void;
}) {
  const featuredOrder = selectedOrder || orders[0];
  const featuredProgress = getOrderProgress(featuredOrder);

  return (
    <>
      <AppHeader
        title="Ana Sayfa"
        subtitle={`Merhaba ${technician.name}\nBugÃ¼n harika iÅŸler Ã§Ä±karalÄ±m.`}
        showLogo
        rightNotification
      />
      <View style={styles.sheet}>
        <SectionHeader icon="calendar-outline" title="GÃ¼nlÃ¼k Ã–zet" action="CanlÄ± Senkron" onPress={onSync} meta="16 MayÄ±s 2025, Cuma" />
        {lastError ? <InlineAlert text={lastError} /> : null}
        <View style={styles.metricGrid}>
          <MetricCard icon="document-text-outline" title="Aktif Ä°ÅŸ Emri" value={String(metrics.openOrders || orders.length)} subtitle="devam eden" tone="blue" />
          <MetricCard icon="checkmark-circle-outline" title="BugÃ¼n Tamamlanan" value={String(completedOrderCount(orders))} subtitle="iÅŸ emri" tone="green" />
          <MetricCard icon="alert-circle-outline" title="Eksik AdÄ±m" value={String(metrics.missingEvidence)} subtitle="iÅŸ emrinde" tone="orange" />
          <MetricCard icon="shield-checkmark-outline" title="Teknik Onayda" value={String(metrics.waitingApproval)} subtitle="iÅŸ emri" tone="purple" />
        </View>

        <SectionHeader icon="flash-outline" title="Ã–ne Ã‡Ä±kan Aktif Ä°ÅŸ Emri" action="TÃ¼mÃ¼nÃ¼ GÃ¶r" onPress={() => onOpenView('jobs')} />
        {featuredOrder ? (
          <FeaturedOrderCard order={featuredOrder} progress={featuredProgress} onPress={() => onOpenView('detail')} />
        ) : (
          <EmptyState title="CanlÄ± iÅŸ emri bulunamadÄ±" body="Bayi portalÄ±ndan yeni iÅŸ emri aÃ§Ä±ldÄ±ÄŸÄ±nda burada gÃ¶rÃ¼necek." icon="briefcase-outline" />
        )}

        <SectionHeader icon="bag-outline" title="BugÃ¼nkÃ¼ Plan" action="Takvime Git" />
        <View style={styles.planList}>
          <PlanRow time="09:30" plate="16 CAN 526" title="2022 Volkswagen Golf" />
          <PlanRow time="11:00" plate="16 R 0273" title="2022 Volkswagen Passat" />
          <PlanRow time="14:00" plate="16 BZ 198" title="2021 Skoda Octavia" />
        </View>

        <SectionHeader icon="grid-outline" title="HÄ±zlÄ± Ä°ÅŸlemler" />
        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <QuickAction key={item.title} item={item} onPress={() => onOpenView(item.view)} />
          ))}
        </View>

        <SectionHeader icon="time-outline" title="Son Aktiviteler" action={lastSync} />
        <View style={styles.activityList}>
          <ActivityRow icon="checkmark-circle-outline" tone="green" title="CanlÄ± veri senkronize edildi." time={lastSync} />
          {featuredOrder ? (
            <>
              <ActivityRow icon="document-text-outline" tone="blue" title={`${featuredOrder.workOrderNo} iÅŸ emri mobilde gÃ¶rÃ¼ntÃ¼lendi.`} time="16:45" />
              <ActivityRow icon="camera-outline" tone="orange" title={`${featuredOrder.vehicle.plate} iÃ§in kanÄ±t adÄ±mlarÄ± takipte.`} time="15:10" />
            </>
          ) : null}
        </View>
      </View>
    </>
  );
}

function JobsScreen({
  metrics,
  orders,
  lastSync,
  onSelect,
  onSync,
}: {
  metrics: DashboardMetrics;
  orders: LiveWorkOrder[];
  lastSync: string;
  onSelect: (order: LiveWorkOrder) => void;
  onSync: () => void;
}) {
  return (
    <>
      <AppHeader
        title="Ä°ÅŸlerim"
        subtitle={`${technician.name}\n${technician.role}`}
        showLogo
        rightNotification
        chip={lastSync}
      />
      <View style={styles.sheet}>
        <SectionHeader icon="clipboard-outline" title="Ä°ÅŸlerim" meta="16 MayÄ±s 2025, Cuma" action="Yenile" onPress={onSync} />
        <View style={styles.jobsMetricRow}>
          <MetricCard compact icon="clipboard-outline" title="Aktif Ä°ÅŸ Emri" value={String(metrics.openOrders || orders.length)} subtitle="devam eden" tone="blue" />
          <MetricCard compact icon="checkmark-circle-outline" title="BugÃ¼n Tamamlanan" value={String(completedOrderCount(orders))} subtitle="iÅŸ emri" tone="green" />
          <MetricCard compact icon="alert-circle-outline" title="Eksik AdÄ±m" value={String(metrics.missingEvidence)} subtitle="iÅŸ emrinde" tone="orange" />
        </View>
        {orders.length ? (
          orders.map((order) => <WorkOrderCard key={order.id} order={order} onPress={() => onSelect(order)} />)
        ) : (
          <EmptyState title="Ä°ÅŸ emri yok" body="Web bayi portalÄ±ndan aÃ§Ä±lan canlÄ± iÅŸ emirleri bu ekrana dÃ¼ÅŸecek." icon="clipboard-outline" />
        )}
      </View>
    </>
  );
}

function WorkOrderDetailScreen({ order, modules, onBack, onStart }: { order: LiveWorkOrder; modules: ModuleItem[]; onBack: () => void; onStart: () => void }) {
  const progress = getOrderProgress(order);
  const maxChecks = Math.max(order.tasks.length || 0, 40);
  const doneChecks = Math.min(maxChecks, completedTasks(order));

  const rows = useMemo<InspectionRow[]>(() =>
    modules.map((module, index) => {
      const status = toInspectionStatus(module);
      return {
        id: module.id,
        index: index + 1,
        module,
        statusKey: status.key,
        title: module.title.replace('KontrolÃ¼', 'Kontrol'),
        subStatus: status.description,
      };
    }),
    [modules],
  );

  const [activeTab, setActiveTab] = useState<DetailStatusKey>('all');
  const visibleRows = useMemo(() => {
    if (activeTab === 'all') return rows;
    return rows.filter((item) => item.statusKey === activeTab);
  }, [rows, activeTab]);

  const counts = useMemo(() => {
    const total = rows.length;
    const completed = rows.filter((item) => item.statusKey === 'completed').length;
    const missing = rows.filter((item) => item.statusKey === 'missing').length;
    const waiting = rows.filter((item) => item.statusKey === 'waiting').length;
    return { all: total, completed, missing, waiting };
  }, [rows]);

  return (
    <>
      <AppHeader title="Ä°ÅŸ Emri DetayÄ±" showLogo showBack onBack={onBack} rightNotification />
      <View style={styles.detailSheet}>
        <VehicleSummaryCard
          order={order}
          progress={progress}
          totalChecks={maxChecks}
          completedChecks={doneChecks}
          onActionPress={onStart}
        />
        <InspectionTabs active={activeTab} counts={counts} onChange={setActiveTab} />
        <InspectionList rows={visibleRows} onPressRow={() => onStart()} />
      </View>
    </>
  );
}

function VehicleSummaryCard({
  order,
  progress,
  totalChecks,
  completedChecks,
  onActionPress,
}: {
  order: LiveWorkOrder;
  progress: number;
  totalChecks: number;
  completedChecks: number;
  onActionPress: () => void;
}) {
  return (
    <View style={styles.vehicleSummaryCard}>
      <View style={styles.vehicleSummaryRow}>
        <View style={styles.vehicleSummaryLeft}>
          <LicensePlate value={order.vehicle.plate} />
          <Text style={styles.vehicleTitle}>{vehicleTitle(order)}</Text>
          <View style={styles.vehicleMetaLine}>
            <View style={styles.vehicleMetaItem}>
              <Ionicons name="calendar-outline" color={liveColors.muted} size={14} />
              <Text style={styles.vehicleMetaLabel}>Yıl</Text>
              <Text style={styles.vehicleMetaValue}>{order.vehicle.year || '2021'}</Text>
            </View>
            <Text style={styles.vehicleMetaSpacer}>â€¢</Text>
            <View style={styles.vehicleMetaItem}>
              <Ionicons name="speedometer-outline" color={liveColors.muted} size={14} />
              <Text style={styles.vehicleMetaLabel}>KM</Text>
              <Text style={styles.vehicleMetaValue}>{order.vehicle.mileage || '34.520 km'}</Text>
            </View>
          </View>
        </View>
        <CircularProgress percent={progress} size={76} stroke={7} color={progress >= 100 ? liveSemanticColors.success : liveSemanticColors.info} />
      </View>
      {orderRiskLabel(order) ? <RiskInlineAlert label={orderRiskLabel(order)} /> : null}
      <View style={styles.vehicleProgressFooter}>
        <Text style={styles.vehicleProgressText}>
          {completedChecks}/{totalChecks} tamamlandÄ±
        </Text>
      </View>
      <View style={styles.vehicleActions}>
        <Pressable
          style={[styles.detailButton, styles.detailButtonOutline]}
          onPress={onActionPress}
          accessibilityLabel="Testi devret"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" color={liveSemanticColors.textSecondary} size={18} />
          <Text style={styles.detailButtonOutlineText}>Testi Devret</Text>
        </Pressable>
        <Pressable style={[styles.detailButton, styles.detailButtonSuccess]} onPress={onActionPress} accessibilityLabel="Tüm iyi" accessibilityRole="button">
          <Ionicons name="checkmark-circle-outline" color={liveColors.white} size={18} />
          <Text style={styles.detailButtonText}>TÃ¼m Ä°yi</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LicensePlate({ value }: { value: string }) {
  return <Plate value={value} />;
}

function InspectionTabs({
  active,
  counts,
  onChange,
}: {
  active: DetailStatusKey;
  counts: { all: number; completed: number; missing: number; waiting: number };
  onChange: (next: DetailStatusKey) => void;
}) {
  const tabs: { key: DetailStatusKey; title: string; count: number }[] = [
    { key: 'all', title: 'TÃ¼mÃ¼', count: counts.all },
    { key: 'completed', title: 'Tamamlanan', count: counts.completed },
    { key: 'missing', title: 'Eksik', count: counts.missing },
    { key: 'waiting', title: 'Bekleyen', count: counts.waiting },
  ];

  return (
    <View style={styles.inspectionTabsWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.inspectionTabsScroll}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.inspectionTab, isActive && styles.inspectionTabActive]}
              onPress={() => onChange(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.inspectionTabText, isActive && styles.inspectionTabTextActive]}>{tab.title}</Text>
              <View style={[styles.inspectionTabBadge, isActive && styles.inspectionTabBadgeActive]}>
                <Text style={[styles.inspectionTabBadgeText, isActive && styles.inspectionTabBadgeTextActive]}>{tab.count}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function InspectionList({ rows, onPressRow }: { rows: InspectionRow[]; onPressRow: () => void }) {
  return (
    <View style={styles.inspectionList}>
      {rows.length
        ? rows.map((row) => <InspectionRow key={row.id} row={row} onPress={onPressRow} onPhotoPress={onPressRow} />)
        : <EmptyState title="Kayıt yok" body="Bu filtrede gÃ¶sterilecek kontrol bulunmuyor." icon="list-outline" />}
    </View>
  );
}

function InspectionRow({
  row,
  onPress,
  onPhotoPress,
}: { row: InspectionRow; onPress: () => void; onPhotoPress?: () => void }) {
  const statusConfig = statusConfigByKey(row.statusKey);
  const hasPhotoNeed = row.statusKey === 'missing';
  const cameraDisabled = row.statusKey === 'completed';
  const rowStatusText = hasPhotoNeed ? 'Fotoğraf eksik' : row.subStatus;

  return (
    <Pressable
      style={[styles.inspectionRow, styles[`inspectionRow${statusConfig.styleKey}`] as ViewStyle]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${row.title} satırı`}
    >
      <View style={[styles.inspectionIndex, styles[`inspectionIndex${statusConfig.styleKey}`] as ViewStyle]}>
        <Text style={styles.inspectionIndexText}>{row.index}</Text>
      </View>
      <View style={styles.flex1}>
        <Text numberOfLines={2} style={styles.inspectionTitle}>{row.title}</Text>
        {!!rowStatusText ? <Text numberOfLines={2} style={styles.inspectionSubStatus}>{rowStatusText}</Text> : null}
      </View>
      <View style={styles.inspectionRowActions}>
        <StatusBadge label={statusConfig.label} tone={statusConfig.badgeTone} icon={statusConfig.statusIcon} />
        <CameraActionButton
          icon={row.statusKey === 'missing' ? 'camera' : 'camera-outline'}
          needsCapture={hasPhotoNeed}
          disabled={cameraDisabled}
          onPress={cameraDisabled ? onPress : onPhotoPress || onPress}
        />
        <Ionicons name="chevron-forward" color={liveColors.ink} size={22} />
      </View>
    </Pressable>
  );
}

function CameraActionButton({
  icon,
  needsCapture,
  disabled,
  onPress,
}: {
  icon: IconName;
  needsCapture: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.cameraActionButton,
        needsCapture ? styles.cameraActionButtonWarning : styles.cameraActionButtonDefault,
        disabled && { opacity: 0.5 },
      ]}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Fotoğraf"
      accessibilityState={{ disabled }}
    >
      <Ionicons
        name={icon}
        color={needsCapture ? liveSemanticColors.error : liveSemanticColors.textSecondary}
        size={20}
      />
      {needsCapture ? <View style={styles.cameraStatusDot} /> : null}
    </Pressable>
  );
}

function CircularProgress({
  percent,
  size,
  stroke,
  color,
}: {
  percent: number;
  size: number;
  stroke: number;
  color: string;
}) {
  const normalizedPercent = clamp(percent);

  return (
    <View style={styles.circularProgressWrap}>
      <ProgressRing percent={percent} size={size} stroke={stroke} color={color} />
      <View style={styles.circularProgressLabel}>
        <Text style={styles.circularProgressPercent}>%{normalizedPercent}</Text>
        {percent >= 100 ? (
          <Ionicons
            name="checkmark-circle-outline"
            color={liveSemanticColors.success}
            size={16}
            style={styles.circularProgressIcon}
          />
        ) : null}
      </View>
    </View>
  );
}

function statusConfigByKey(key: InspectionStatusKey): InspectionStatusConfig {
  if (key === 'completed') {
      return {
      styleKey: 'Completed',
      label: 'Tamamlandı',
      badgeTone: 'green' as const,
      statusIcon: 'checkmark-circle-outline',
    };
  }
  if (key === 'missing') {
    return {
      styleKey: 'Missing',
      label: 'Eksik',
      badgeTone: 'red' as const,
      statusIcon: 'camera-outline',
    };
  }
  if (key === 'waiting') {
    return {
      styleKey: 'Waiting',
      label: 'Bekliyor',
      badgeTone: 'blue' as const,
      statusIcon: 'time-outline',
    };
  }
  return {
    styleKey: 'Default',
    label: 'Normal',
    badgeTone: 'gray' as const,
    statusIcon: 'ellipse-outline',
  };
}

function TaskModulesScreen({ order, modules, onBack, onContinue }: { order: LiveWorkOrder; modules: ModuleItem[]; onBack: () => void; onContinue: () => void }) {
  const completed = modules.filter((module) => module.status === 'TamamlandÄ±').length;
  const warned = modules.filter((module) => module.status === 'Eksik Var').length;
  const first = modules[0];

  return (
    <>
      <AppHeader
        title="GÃ¶rev ModÃ¼lleri"
        subtitle="AracÄ±nÄ±za ait modÃ¼l gÃ¶revlerini yÃ¶netin."
        showLogo
        showBack
        onBack={onBack}
        rightNotification
      />
      <View style={styles.sheet}>
        <View style={styles.contextCard}>
          <IconBubble icon="document-text-outline" tone="blue" />
          <View style={styles.flex1}>
            <Text style={styles.contextTitle}>{order.workOrderNo} â€¢ {vehicleTitle(order)}</Text>
          </View>
          <StatusBadge label={statusLabel(order.status)} tone="purple" />
        </View>
        <View style={styles.summaryGrid}>
          <SummaryItem icon="cube-outline" label="Toplam ModÃ¼l" value={String(modules.length)} tone="blue" />
          <SummaryItem icon="checkmark-circle-outline" label="Tamamlanan" value={String(completed)} tone="green" />
          <SummaryItem icon="alert-circle-outline" label="Eksik / UyarÄ±" value={String(warned || Math.max(0, order.tasks.length - completedTasks(order)))} tone="orange" />
          <SummaryItem icon="time-outline" label="Son GÃ¼ncelleme" value={formatDateTime(order.openedAt)} tone="blue" />
        </View>
        {first ? <ExpandedModule module={first} onContinue={onContinue} /> : null}
        <View style={styles.moduleStack}>
          {modules.slice(1).map((module) => (
            <CollapsedModule key={module.id} module={module} />
          ))}
        </View>
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" color={liveColors.muted} size={18} />
          <Text style={styles.footerNoteText}>ModÃ¼ller yukarÄ±dan aÅŸaÄŸÄ±ya sÄ±rayla tamamlanmalÄ±dÄ±r.</Text>
        </View>
      </View>
    </>
  );
}

function BodyInspectionScreen({
  order,
  onBack,
  onChangePart,
  onSaveDraft,
  onContinue,
}: {
  order: LiveWorkOrder;
  onBack: () => void;
  onChangePart: (part: LiveBodyInspectionAnswer) => void;
  onSaveDraft: (parts: LiveBodyInspectionAnswer[]) => void;
  onContinue: (parts: LiveBodyInspectionAnswer[]) => void;
}) {
  const [parts, setParts] = useState<BodyInspectionPart[]>(bodyParts);

  useEffect(() => {
    setParts(bodyParts);
  }, [order.caseId]);

  function updatePartState(partName: string, state: BodyPartState) {
    const target = parts.find((part) => part.part === partName);
    if (!target) return;
    const changed = { ...target, state };
    setParts((current) => current.map((part) => (part.part === partName ? changed : part)));
    onChangePart(changed);
  }

  return (
    <>
      <AppHeader
        title="Kaporta KontrolÃ¼"
        subtitle={`${order.workOrderNo} â€¢ ${order.vehicle.brand || 'Volkswagen'} ${order.vehicle.model || 'Passat'}`}
        showBack
        onBack={onBack}
        chip={technician.name}
      />
      <View style={styles.sheetLight}>
        <Stepper
          steps={[
            { label: 'Kaporta', active: true, done: false },
            { label: 'Mekanik', active: false, done: false },
            { label: 'Elektrik', active: false, done: false },
            { label: 'Ä°Ã§ / DÄ±ÅŸ', active: false, done: false },
            { label: 'Test SÃ¼rÃ¼ÅŸÃ¼', active: false, done: false },
          ]}
        />
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadText, styles.partColumn]}>ParÃ§a</Text>
            <Text style={[styles.tableHeadText, styles.stateColumn]}>Durum</Text>
            <Text style={styles.tableHeadText}>Not</Text>
          </View>
          {parts.map((part) => (
            <BodyPartRow key={part.part} part={part} onChangeState={updatePartState} />
          ))}
        </View>
        <View style={styles.measureCard}>
          <View style={styles.measureHead}>
            <View style={styles.rowCenter}>
              <Ionicons name="pulse-outline" color={liveColors.blue} size={24} />
              <Text style={styles.measureTitle}>Ã–lÃ§Ã¼m GiriÅŸi</Text>
            </View>
            <StatusBadge label="Mikron Rehberi" tone="blue" icon="information-circle-outline" />
          </View>
          <View style={styles.measureGrid}>
            {parts.map((part) => (
              <View key={part.part} style={styles.measureItem}>
                <Text style={styles.measureLabel}>{part.part}</Text>
                <View style={styles.measureInput}>
                  <Text style={styles.measureValue}>{part.micron}</Text>
                  <Text style={styles.measureUnit}>Âµm</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.noteCard}>
          <Ionicons name="chatbox-outline" color={liveColors.ink} size={18} />
          <Text style={styles.notePlaceholder}>Genel Notlar (Opsiyonel)</Text>
        </View>
        <View style={styles.buttonRow}>
          <ActionButton title="Taslak Kaydet" variant="outline" icon="save-outline" onPress={() => onSaveDraft(parts)} />
          <ActionButton title="Devam Et" icon="arrow-forward" onPress={() => onContinue(parts)} />
        </View>
      </View>
    </>
  );
}

function EvidenceScreen({
  order,
  note,
  onChangeNote,
  onBack,
  onComplete,
}: {
  order: LiveWorkOrder;
  note: string;
  onChangeNote: (value: string) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const evidence = mergeEvidenceCards(order.evidence);

  return (
    <>
      <AppHeader title="FotoÄŸraf & KanÄ±t" subtitle="Kaporta KontrolÃ¼" showBack onBack={onBack} rightNotification chip={order.workOrderNo} />
      <View style={styles.sheetLight}>
        <Stepper
          steps={[
            { label: 'AraÃ§ Bilgileri', active: false, done: true },
            { label: 'Kontroller', active: false, done: true },
            { label: 'FotoÄŸraf & KanÄ±t', active: true, done: false },
            { label: 'DeÄŸerlendirme', active: false, done: false },
          ]}
        />
        <View style={styles.evidencePanel}>
          <View style={styles.panelTitleRow}>
            <View style={styles.rowCenter}>
              <Ionicons name="shield-checkmark-outline" color={liveColors.purple} size={24} />
              <Text style={styles.sectionTitle}>Zorunlu KanÄ±tlar</Text>
            </View>
            <StatusBadge label="5 / 5 TamamlandÄ±" tone="green" />
          </View>
          <View style={styles.evidenceGrid}>
            {evidence.map((item) => (
              <EvidenceCard key={item.title} item={item} />
            ))}
          </View>
        </View>
        <SectionHeader icon="attach-outline" title="Ek KanÄ±tlar" />
        <View style={styles.evidenceActionRow}>
          <EvidenceAction icon="camera-outline" title="FotoÄŸraf Ekle" tone="blue" />
          <EvidenceAction icon="videocam-outline" title="Video Ekle" tone="purple" />
          <EvidenceAction icon="document-outline" title="Dosya Ekle" tone="green" />
        </View>
        <SectionHeader icon="document-text-outline" title="Notlar" />
        <View style={styles.textAreaWrap}>
          <TextInput
            style={styles.textArea}
            multiline
            maxLength={500}
            placeholder="NotlarÄ±nÄ±zÄ± buraya yazÄ±n..."
            placeholderTextColor={liveColors.muted}
            value={note}
            onChangeText={onChangeNote}
          />
          <Text style={styles.counterText}>{note.length} / 500</Text>
        </View>
        <View style={styles.buttonRow}>
          <ActionButton title="Geri" variant="outline" onPress={onBack} />
          <ActionButton title="Tamamla" onPress={onComplete} />
        </View>
      </View>
    </>
  );
}

function FinalReviewScreen({ order, modules, onBack, onSubmit }: { order: LiveWorkOrder; modules: ModuleItem[]; onBack: () => void; onSubmit: () => void }) {
  const progress = Math.max(getOrderProgress(order), order.tasks.length ? getOrderProgress(order) : 98);
  const evidenceCount = Math.max(order.evidence.length, 5);
  const warned = modules.filter((module) => module.status === 'Eksik Var').length;

  return (
    <>
      <AppHeader title="Final Kontrol & Tamamlama" showLogo showBack onBack={onBack} rightNotification />
      <View style={styles.sheet}>
        <View style={styles.finalTopCard}>
          <View style={styles.flex1}>
            <Text style={styles.kicker}>Ä°ÅŸ Emri</Text>
            <Text style={styles.orderNo}>{order.workOrderNo}</Text>
            <Text style={styles.vehicleTitle}>AraÃ§</Text>
            <Text style={styles.finalVehicle}>{vehicleTitle(order)}</Text>
          </View>
          <ProgressRing percent={progress} size={116} stroke={10} color={liveColors.green} label="TamamlandÄ±" />
          <StatusBadge label="Teknik GiriÅŸ HazÄ±r" tone="green" icon="checkmark-circle-outline" />
        </View>
        <View style={styles.finalStats}>
          <SummaryItem icon="checkmark-circle-outline" label="ModÃ¼l TamamlandÄ±" value={String(modules.filter((item) => item.status === 'TamamlandÄ±').length || modules.length)} tone="green" />
          <SummaryItem icon="alert-circle-outline" label="Eksik / UyarÄ±" value={String(warned)} tone="orange" />
          <SummaryItem icon="cloud-upload-outline" label="KanÄ±t YÃ¼klendi" value={String(evidenceCount)} tone="purple" />
          <SummaryItem icon="time-outline" label="Ã‡alÄ±ÅŸma SÃ¼resi" value={elapsedLabel(order)} tone="blue" />
        </View>

        <SectionHeader title="ModÃ¼ller" action="TÃ¼mÃ¼nÃ¼ GÃ¶r" />
        <View style={styles.finalModuleBox}>
          {modules.map((module) => (
            <FinalModuleRow key={module.id} module={module} />
          ))}
        </View>

        <View style={styles.noteGrid}>
          <ReviewNote
            icon="document-text-outline"
            tone="blue"
            title="Teknik Not"
            body="Sol arka Ã§amurluk Ã¼zerinde lokal boya Ã¶lÃ§Ã¼m deÄŸerleri farklÄ±lÄ±k gÃ¶stermektedir. Detaylar ilgili modÃ¼lde belirtilmiÅŸtir."
            badge="Not eklendi"
          />
          <ReviewNote
            icon="reader-outline"
            tone="purple"
            title="MÃ¼ÅŸteri Ä°Ã§in Ã–zet"
            body="AraÃ§ genel durumu iyi seviyededir. Belirtilen uyarÄ± maddeleri dÄ±ÅŸÄ±nda Ã¶nemli bir bulguya rastlanmamÄ±ÅŸtÄ±r."
            badge="Ã–zet hazÄ±r"
          />
        </View>
        <View style={styles.readyBanner}>
          <Ionicons name="checkmark" color={liveColors.white} size={24} />
          <View style={styles.flex1}>
            <Text style={styles.readyTitle}>TÃ¼m zorunlu alanlar tamamlandÄ±.</Text>
            <Text style={styles.readyText}>Rapor teknik onaya gÃ¶nderilmeye hazÄ±r.</Text>
          </View>
          <Ionicons name="shield-checkmark-outline" color="rgba(7,148,85,0.28)" size={46} />
        </View>
        <View style={styles.buttonRow}>
          <ActionButton title="Taslak Olarak Kaydet" variant="outline" icon="save-outline" />
          <ActionButton
            title="Raporu Teknik Onaya GÃ¶nder"
            icon="paper-plane-outline"
            onPress={onSubmit}
          />
        </View>
      </View>
    </>
  );
}

function NotificationsScreen() {
  return (
    <>
      <AppHeader title="Bildirimler" showLogo rightNotification />
      <View style={styles.sheet}>
        <View style={styles.notificationSummary}>
          <IconBubble icon="notifications-outline" tone="blue" />
          <View style={styles.flex1}>
            <Text style={styles.panelTitle}>3 okunmamÄ±ÅŸ bildiriminiz var</Text>
            <Text style={styles.panelSub}>Son gÃ¼ncellenme: 16 MayÄ±s 2025, 21:56</Text>
          </View>
          <StatusBadge label="TÃ¼mÃ¼nÃ¼ Okundu Ä°ÅŸaretle" tone="blue" icon="checkmark-circle-outline" />
        </View>
        <View style={styles.tabsRow}>
          {[
            ['TÃ¼mÃ¼', '12'],
            ['Ä°ÅŸ Emirleri', '5'],
            ['Eksikler', '2'],
            ['Onay', '2'],
            ['Sistem', '3'],
          ].map(([label, value], index) => (
            <View key={label} style={[styles.filterTab, index === 0 && styles.filterTabActive]}>
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{label}</Text>
              <Text style={[styles.filterValue, index === 0 && styles.filterValueActive]}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.notificationList}>
          {notifications.map((item) => (
            <NotificationRow key={item.title} item={item} />
          ))}
        </View>
      </View>
    </>
  );
}

function ProfileScreen({ metrics, lastSync, onLogout }: { metrics: DashboardMetrics; lastSync: string; onLogout: () => void }) {
  return (
    <>
      <AppHeader title="Profil" showLogo rightNotification />
      <View style={styles.sheet}>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarInitials}>{technician.avatarInitials}</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.profileName}>{technician.name}</Text>
            <StatusBadge label={technician.role} tone="purple" icon="shield-checkmark-outline" />
            <Text style={styles.profileBranch}>Bursa KÃ¼Ã§Ã¼k Sanayi</Text>
          </View>
          <ActionButton title="Profili DÃ¼zenle" variant="outline" icon="create-outline" compact />
        </View>
        <View style={styles.profileStats}>
          <ProfileStat icon="checkmark-circle-outline" title="Bu Ay Tamamlanan" value={String(Math.max(completedOrderCount(mockLiveOrders), metrics.completedTasks || 16))} subtitle="iÅŸ emri" tone="green" />
          <ProfileStat icon="briefcase-outline" title="Aktif Ä°ÅŸler" value={String(metrics.openOrders || 5)} subtitle="iÅŸ emri" tone="blue" />
          <ProfileStat icon="time-outline" title="Ortalama SÃ¼re" value="32 dk" subtitle="iÅŸ emri baÅŸÄ±na" tone="orange" />
        </View>
        <View style={styles.settingsCard}>
          <ProfileRow icon="person-outline" title="Hesap Bilgileri" subtitle="KiÅŸisel bilgileriniz ve iletiÅŸim" tone="blue" />
          <ProfileRow icon="lock-closed-outline" title="Åifre DeÄŸiÅŸtir" subtitle="Hesap ÅŸifrenizi gÃ¼ncelleyin" tone="purple" />
          <ProfileRow icon="notifications-outline" title="Bildirim Tercihleri" subtitle="Bildirim ayarlarÄ±nÄ±zÄ± yÃ¶netin" tone="orange" />
          <ProfileRow icon="time-outline" title="Vardiya Bilgisi" subtitle={`${technician.shift} â€¢ Son senkron: ${lastSync}`} tone="blue" right="GÃ¼ndÃ¼z VardiyasÄ±" />
          <ProfileRow icon="information-circle-outline" title="Uygulama SÃ¼rÃ¼mÃ¼" subtitle="GÃ¼ncel sÃ¼rÃ¼m bilgisi" tone="blue" right="v2.4.1" />
          <ProfileRow icon="help-circle-outline" title="YardÄ±m & Destek" subtitle="SÄ±k sorulan sorular ve destek" tone="blue" />
        </View>
        <Pressable style={styles.logoutRow} onPress={onLogout}>
          <IconBubble icon="log-out-outline" tone="red" />
          <View style={styles.flex1}>
            <Text style={styles.logoutTitle}>Ã‡Ä±kÄ±ÅŸ Yap</Text>
            <Text style={styles.panelSub}>Oturumunuzu sonlandÄ±rÄ±n</Text>
          </View>
          <Ionicons name="chevron-forward" color={liveColors.ink} size={22} />
        </Pressable>
      </View>
    </>
  );
}

function AppHeader({
  title,
  subtitle,
  showLogo,
  showBack,
  rightNotification,
  chip,
  onBack,
}: {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showBack?: boolean;
  rightNotification?: boolean;
  chip?: string;
  onBack?: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCurveA} />
      <View style={styles.headerCurveB} />
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          {showBack ? (
            <Pressable style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" color={liveColors.white} size={28} />
            </Pressable>
          ) : null}
          {showLogo ? (
            <View>
              <LogoText />
              <Text style={styles.headerLogoSub}>TarafsÄ±z AraÃ§ Ekspertizi</Text>
            </View>
          ) : null}
        </View>
        {rightNotification ? <NotificationButton /> : chip ? <HeaderChip text={chip} /> : null}
      </View>
      <View style={styles.headerTitleRow}>
        <View style={styles.flex1}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {chip && rightNotification ? <HeaderChip text={chip} /> : null}
      </View>
    </View>
  );
}

function LogoText({ size = 'normal' }: { size?: 'normal' | 'large' }) {
  return (
    <Text style={[styles.logoText, size === 'large' && styles.logoTextLarge]}>
      OTOTR<Text style={styles.logoAccent}>âœ“</Text>
    </Text>
  );
}

function NotificationButton() {
  return (
    <View style={styles.notificationButton}>
      <Ionicons name="notifications-outline" color={liveColors.white} size={24} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>3</Text>
      </View>
    </View>
  );
}

function HeaderChip({ text }: { text: string }) {
  return (
    <View style={styles.headerChip}>
      <Ionicons name="sync-outline" color={liveColors.blue} size={15} />
      <Text numberOfLines={1} style={styles.headerChipText}>{text}</Text>
    </View>
  );
}

function BottomTabs({ active, onChange, safeBottom = 0 }: { active: TabKey; onChange: (tab: TabKey) => void; safeBottom?: number }) {
  const tabs: { key: TabKey; label: string; icon: IconName; center?: boolean }[] = [
    { key: 'modules', label: 'GÃ¶revler', icon: 'grid-outline' },
    { key: 'jobs', label: 'Ä°ÅŸlerim', icon: 'clipboard-outline' },
    { key: 'home', label: 'OtoTR', icon: 'home-outline', center: true },
    { key: 'detail', label: 'Eksikler', icon: 'alert-circle-outline' },
    { key: 'profile', label: 'Profil', icon: 'person-outline' },
  ];

  return (
    <View style={[styles.bottomTabs, { paddingBottom: Math.max(10, safeBottom + 8) }]}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tabItem, tab.center && styles.tabItemCenter]}
            onPress={() => onChange(tab.key)}
            accessibilityRole="button"
          >
            <View style={[styles.tabIconWrap, tab.center && styles.tabHomeButton, isActive && tab.center && styles.tabHomeButtonActive]}>
              {tab.center ? (
                <>
                  <Ionicons
                    name="home-outline"
                    color={liveColors.white}
                    size={20}
                  />
                  <Text style={[styles.tabHomeText, isActive && styles.tabHomeTextActive]}>OtoTR</Text>
                </>
              ) : (
                <Ionicons
                  name={tab.icon}
                  color={isActive ? liveSemanticColors.brandPrimary : liveSemanticColors.textSecondary}
                  size={22}
                />
              )}
            </View>
            {tab.center ? null : <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>}
            {tab.center ? null : <View style={[styles.tabLine, isActive && styles.tabLineActive]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  tone,
  compact,
}: {
  icon: IconName;
  title: string;
  value: string;
  subtitle: string;
  tone: Tone;
  compact?: boolean;
}) {
  const palette = tonePalette(tone);
  return (
    <View style={[styles.metricCard, compact && styles.metricCardCompact, { borderColor: palette.soft }]}>
      <View style={[styles.metricIcon, { backgroundColor: palette.soft }]}>
        <Ionicons name={icon} color={palette.main} size={compact ? 24 : 30} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function FeaturedOrderCard({ order, progress, onPress }: { order: LiveWorkOrder; progress: number; onPress: () => void }) {
  const risk = orderRiskLabel(order);
  return (
    <Pressable style={styles.featureCard} onPress={onPress}>
      <View style={styles.featureTop}>
        <View style={styles.brandAvatar}>
          <Text style={styles.brandAvatarText}>{brandInitial(order)}</Text>
        </View>
        <View style={styles.flex1}>
          <Plate value={order.vehicle.plate} />
          <Text style={styles.featureVehicle}>{vehicleTitle(order)}</Text>
          <Text style={styles.cardMuted}>{vehicleMeta(order)}</Text>
        </View>
        <ProgressRing percent={progress} size={78} stroke={8} color={progress >= 100 ? liveColors.green : liveColors.blue} label={progress >= 100 ? 'TamamlandÄ±' : 'Ä°lerleme'} />
      </View>
      <View style={styles.featureBottom}>
        {risk ? <RiskInlineAlert label={risk} /> : null}
        <StatusBadge label={progress >= 100 ? 'Ä°ÅŸ emri tamamlandÄ±' : statusLabel(order.status)} tone={progress >= 100 ? 'green' : 'blue'} icon="checkmark-circle-outline" />
        <View style={styles.rowCenter}>
          <Ionicons name="time-outline" color={liveColors.muted} size={16} />
          <Text style={styles.cardMuted}>Tamamlanma: 16:45</Text>
        </View>
        <View style={styles.smallPrimary}>
          <Text style={styles.smallPrimaryText}>Raporu GÃ¶rÃ¼ntÃ¼le</Text>
          <Ionicons name="arrow-forward" color={liveColors.white} size={17} />
        </View>
      </View>
    </Pressable>
  );
}

function WorkOrderCard({ order, onPress }: { order: LiveWorkOrder; onPress: () => void }) {
  const progress = getOrderProgress(order);
  const total = Math.max(order.tasks.length, 10);
  const done = completedTasks(order);
  const missing = Math.max(0, total - done);
  const color = progress >= 100 ? liveColors.green : liveColors.blue;
  const risk = orderRiskLabel(order);

  return (
    <Pressable style={styles.workCard} onPress={onPress}>
      <View style={styles.workTop}>
        <View style={styles.brandAvatar}>
          <Text style={styles.brandAvatarText}>{brandInitial(order)}</Text>
        </View>
        <View style={styles.workMain}>
          <Plate value={order.vehicle.plate} />
          <Text style={styles.workVehicle}>{vehicleTitle(order)}</Text>
          <Text style={styles.cardMuted}>{vehicleMeta(order)}</Text>
        </View>
        <StatusBadge label={statusLabel(order.status)} tone={progress >= 100 ? 'green' : 'blue'} icon={progress >= 100 ? 'checkmark-circle-outline' : undefined} />
      </View>
      {risk ? <RiskInlineAlert label={risk} /> : null}
      <View style={styles.progressRow}>
        <ProgressBar value={progress} color={color} />
        <Text style={[styles.progressText, { color }]}>{progress}%</Text>
      </View>
      <View style={styles.chipRow}>
        <SmallChip icon="clipboard-outline" text={`${total} GÃ¶rev`} tone="blue" />
        <SmallChip icon="checkmark-circle-outline" text={`${done} TamamlandÄ±`} tone="green" />
        <SmallChip icon="alert-circle-outline" text={`${missing} Eksik`} tone={missing ? 'orange' : 'gray'} />
      </View>
      <Ionicons style={styles.cardChevron} name="chevron-forward" color={liveColors.ink} size={24} />
    </Pressable>
  );
}

function RiskInlineAlert({ label }: { label: string }) {
  return (
    <View style={styles.riskInlineAlert}>
      <Ionicons name="warning-outline" color={liveColors.amber} size={17} />
      <Text style={styles.riskInlineText} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function ExpandedModule({ module, onContinue }: { module: ModuleItem; onContinue: () => void }) {
  return (
    <View style={styles.expandedModule}>
      <View style={styles.expandedHead}>
        <IconBubble icon={module.icon} tone={module.tone} />
        <View style={styles.moduleIndex}>
          <Text style={styles.moduleIndexText}>1</Text>
        </View>
        <View style={styles.flex1}>
          <Text style={styles.expandedTitle}>{module.title}</Text>
        </View>
        <StatusBadge label={module.status} tone={statusTone(module.status)} />
        <View style={styles.ownerRow}>
          <Ionicons name="person-outline" color={liveColors.muted} size={19} />
          <Text style={styles.ownerText}>{module.owner || 'SahiplenilmemiÅŸ'}</Text>
        </View>
        <Ionicons name="chevron-up" color={liveColors.ink} size={22} />
      </View>
      <View style={styles.moduleInfoBox}>
        <Ionicons name="information-circle-outline" color={liveColors.blue} size={20} />
        <Text style={styles.moduleInfoText}>Bu modÃ¼l Ã¼zerinde ÅŸu anda Ã§alÄ±ÅŸÄ±lmaktadÄ±r. AynÄ± anda yalnÄ±zca 1 teknisyen bu modÃ¼l Ã¼zerinde Ã§alÄ±ÅŸabilir.</Text>
      </View>
      <View style={styles.progressLabeled}>
        <Text style={styles.ownerText}>Ä°lerleme</Text>
        <ProgressBar value={module.progress} color={liveColors.blue} />
        <Text style={styles.progressPercent}>%{module.progress}</Text>
      </View>
      <View style={styles.moduleButtons}>
        <ActionButton title="Detay" variant="outline" icon="list-outline" compact />
        <ActionButton title="Devralma Talebi" variant="outline" icon="person-add-outline" compact />
        <ActionButton title="Devam Et" icon="play-outline" compact onPress={onContinue} />
      </View>
    </View>
  );
}

function CollapsedModule({ module }: { module: ModuleItem }) {
  return (
    <View style={styles.collapsedModule}>
      <IconBubble icon={module.icon} tone={module.tone} small />
      <View style={styles.moduleIndexSmall}>
        <Text style={styles.moduleIndexSmallText}>{moduleDefinitions.findIndex((item) => item.id === module.id) + 1}</Text>
      </View>
      <View style={styles.flex1}>
        <Text style={styles.collapsedTitle}>{module.title}</Text>
        <Text style={styles.cardMuted}>{module.taskTotal} gÃ¶rev â€¢ {module.evidenceRequired} kanÄ±t zorunlu</Text>
      </View>
      <StatusBadge label={module.status} tone={statusTone(module.status)} />
      <Text style={styles.ownerSmall}>{module.owner || 'SahiplenilmemiÅŸ'}</Text>
      <ActionButton title={module.status === 'BoÅŸta' || !module.owner ? 'Sahiplen' : 'Detay'} variant="outline" compact />
      <Ionicons name="chevron-down" color={liveColors.ink} size={20} />
    </View>
  );
}

function ModuleListRow({ module }: { module: ModuleItem }) {
  const color = tonePalette(module.tone).main;
  return (
    <View style={styles.detailModuleRow}>
      <IconBubble icon={module.icon} tone={module.tone} small />
      <View style={styles.flex1}>
        <Text style={styles.detailModuleTitle}>{module.title.replace('KontrolÃ¼', 'Ekspertizi')}</Text>
        <Text style={styles.cardMuted}>{module.taskDone} / {module.taskTotal} gÃ¶rev</Text>
      </View>
      <View style={styles.detailModuleProgress}>
        <StatusBadge label={`${module.progress}%`} tone={module.progress >= 100 ? 'green' : module.progress >= 60 ? 'blue' : 'orange'} />
        <ProgressBar value={module.progress} color={color} />
      </View>
      <Ionicons name="chevron-forward" color={liveColors.ink} size={22} />
    </View>
  );
}

function BodyPartRow({ part, onChangeState }: { part: BodyInspectionPart; onChangeState: (partName: string, state: BodyPartState) => void }) {
  return (
    <View style={styles.bodyRow}>
      <View style={[styles.rowCenter, styles.partColumn]}>
        <Ionicons name={part.icon} color={liveColors.ink} size={28} />
        <Text style={styles.bodyPartText}>{part.part}</Text>
      </View>
      <View style={[styles.segmentGroup, styles.stateColumn]}>
        {(['Orijinal', 'BoyalÄ±', 'DeÄŸiÅŸen'] as const).map((state) => {
          const active = part.state === state;
          const tone: Tone = state === 'Orijinal' ? 'green' : state === 'BoyalÄ±' ? 'orange' : 'red';
          const palette = tonePalette(tone);
          return (
            <Pressable
              key={state}
              onPress={() => onChangeState(part.part, state)}
              style={[styles.segment, active && { borderColor: palette.main, backgroundColor: palette.soft }]}
            >
              <Text style={[styles.segmentText, active && { color: palette.main }]}>{state}</Text>
              {active ? <Ionicons name="checkmark-circle" color={palette.main} size={16} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.noteIconButton}>
        <Ionicons name="chatbox-outline" color={liveColors.ink} size={21} />
      </View>
    </View>
  );
}

function EvidenceCard({ item }: { item: { title: string; icon: IconName; tone: Tone; uploaded: boolean } }) {
  const palette = tonePalette(item.tone);
  return (
    <View style={styles.evidenceCard}>
      <Text style={styles.evidenceTitle}>{item.title}</Text>
      <View style={[styles.evidenceThumb, { backgroundColor: palette.soft }]}>
        <Ionicons name={item.icon} color={palette.main} size={46} />
        <View style={styles.thumbPlate}>
          <Text style={styles.thumbPlateText}>OTOTR</Text>
        </View>
      </View>
      <View style={styles.uploadRow}>
        <Ionicons name="checkmark-circle-outline" color={liveColors.green} size={21} />
        <Text style={styles.uploadText}>YÃ¼klendi</Text>
        <Ionicons style={styles.flexEnd} name="ellipsis-vertical" color={liveColors.muted} size={18} />
      </View>
    </View>
  );
}

function EvidenceAction({ icon, title, tone }: { icon: IconName; title: string; tone: Tone }) {
  const palette = tonePalette(tone);
  return (
    <View style={styles.evidenceAction}>
      <Ionicons name={icon} color={palette.main} size={32} />
      <Text style={styles.evidenceActionText}>{title}</Text>
    </View>
  );
}

function FinalModuleRow({ module }: { module: ModuleItem }) {
  const ok = module.status !== 'Eksik Var';
  return (
    <View style={styles.finalModuleRow}>
      <Ionicons name={ok ? 'checkmark-circle-outline' : 'alert-circle-outline'} color={ok ? liveColors.green : liveColors.amber} size={25} />
      <Text style={styles.finalModuleTitle}>{module.title.replace('KontrolÃ¼', 'Kontroller')}</Text>
      <Text style={styles.finalModuleMeta}>{module.taskDone || module.taskTotal} / {module.taskTotal} kontrol</Text>
      <StatusBadge label={ok ? 'TamamlandÄ±' : '1 UyarÄ±'} tone={ok ? 'green' : 'orange'} />
      <Ionicons name="chevron-forward" color={liveColors.ink} size={20} />
    </View>
  );
}

function ReviewNote({ icon, tone, title, body, badge }: { icon: IconName; tone: Tone; title: string; body: string; badge: string }) {
  const palette = tonePalette(tone);
  return (
    <View style={styles.reviewNote}>
      <Ionicons name={icon} color={palette.main} size={27} />
      <Text style={styles.reviewNoteTitle}>{title}</Text>
      <Text style={styles.reviewNoteBody}>{body}</Text>
      <View style={styles.reviewNoteFooter}>
        <StatusBadge label={badge} tone="blue" icon="checkmark-circle-outline" />
        <Text style={styles.cardMuted}>15:42</Text>
      </View>
    </View>
  );
}

function NotificationRow({ item }: { item: (typeof notifications)[number] }) {
  const palette = tonePalette(item.tone);
  return (
    <View style={styles.notificationRow}>
      <View style={[styles.unreadDot, { backgroundColor: item.unread ? liveColors.blue : '#CBD5E1' }]} />
      <View style={[styles.notificationIcon, { backgroundColor: palette.soft }]}>
        <Ionicons name={item.icon} color={palette.main} size={34} />
      </View>
      <View style={styles.flex1}>
        <View style={styles.notificationTitleRow}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <StatusBadge label={item.tag} tone={item.tone} />
        </View>
        <Text style={styles.notificationBody}>{item.body}</Text>
      </View>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </View>
  );
}

function ProfileRow({ icon, title, subtitle, tone, right }: { icon: IconName; title: string; subtitle: string; tone: Tone; right?: string }) {
  return (
    <View style={styles.profileRow}>
      <IconBubble icon={icon} tone={tone} small />
      <View style={styles.flex1}>
        <Text style={styles.profileRowTitle}>{title}</Text>
        <Text style={styles.panelSub}>{subtitle}</Text>
      </View>
      {right ? <StatusBadge label={right} tone={tone === 'orange' ? 'orange' : 'blue'} /> : null}
      <Ionicons name="chevron-forward" color={liveColors.ink} size={22} />
    </View>
  );
}

function ProfileStat({ icon, title, value, subtitle, tone }: { icon: IconName; title: string; value: string; subtitle: string; tone: Tone }) {
  const palette = tonePalette(tone);
  return (
    <View style={[styles.profileStat, { borderColor: palette.soft }]}>
      <Ionicons name={icon} color={palette.main} size={32} />
      <Text style={styles.profileStatTitle}>{title}</Text>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatSubtitle}>{subtitle}</Text>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  action,
  meta,
  onPress,
}: {
  icon?: IconName;
  title: string;
  action?: string;
  meta?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.rowCenter}>
        {icon ? <Ionicons name={icon} color={liveColors.blue} size={22} /> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionRight}>
        {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
        {action ? (
          <Pressable onPress={onPress} style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>{action}</Text>
            {onPress ? <Ionicons name="chevron-forward" color={liveColors.blue} size={18} /> : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ActionButton({
  title,
  icon,
  variant = 'primary',
  tone = 'blue',
  compact,
  onPress,
}: {
  title: string;
  icon?: IconName;
  variant?: 'primary' | 'outline' | 'ghost';
  tone?: Tone;
  compact?: boolean;
  onPress?: () => void;
}) {
  const palette = tonePalette(tone);
  const primary = variant === 'primary';
  return (
    <Pressable
      style={[
        styles.actionButton,
        compact && styles.actionButtonCompact,
        primary ? { backgroundColor: palette.main, borderColor: palette.main } : { backgroundColor: liveColors.white, borderColor: palette.main },
        variant === 'ghost' && styles.actionGhost,
      ]}
      onPress={onPress}
    >
      {icon ? <Ionicons name={icon} color={primary ? liveColors.white : palette.main} size={compact ? 18 : 22} /> : null}
      <Text style={[styles.actionText, compact && styles.actionTextCompact, { color: primary ? liveColors.white : palette.main }]}>{title}</Text>
    </Pressable>
  );
}

function StatusBadge({ label, tone, icon, dot }: { label: string; tone: Tone; icon?: IconName; dot?: boolean }) {
  const palette = tonePalette(tone);
  return (
    <View style={[styles.statusBadge, { backgroundColor: palette.soft, borderColor: palette.border }]}>
      {dot ? <View style={[styles.statusDot, { backgroundColor: palette.main }]} /> : null}
      {icon ? <Ionicons name={icon} color={palette.main} size={16} /> : null}
      <Text numberOfLines={1} style={[styles.statusText, { color: palette.main }]}>{label}</Text>
    </View>
  );
}

function IconBubble({ icon, tone, small }: { icon: IconName; tone: Tone; small?: boolean }) {
  const palette = tonePalette(tone);
  return (
    <View style={[styles.iconBubble, small && styles.iconBubbleSmall, { backgroundColor: palette.soft }]}>
      <Ionicons name={icon} color={palette.main} size={small ? 25 : 32} />
    </View>
  );
}

function Plate({ value }: { value: string }) {
  return (
    <View style={styles.plate}>
      <View style={styles.plateStrip}>
        <Text style={styles.plateTr}>TR</Text>
      </View>
      <Text numberOfLines={1} style={styles.plateText}>{formatPlate(value)}</Text>
    </View>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamp(value)}%`, backgroundColor: color }]} />
    </View>
  );
}

function ProgressRing({ percent, size = 88, stroke = 8, color = liveColors.blue, label }: { percent: number; size?: number; stroke?: number; color?: string; label?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp(percent) / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#DDEBE4" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPercent}>%{clamp(percent)}</Text>
        {label ? <Text style={styles.ringLabel}>{label}</Text> : null}
      </View>
    </View>
  );
}

function SummaryItem({ icon, label, value, tone }: { icon: IconName; label: string; value: string; tone: Tone }) {
  const palette = tonePalette(tone);
  return (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryIcon, { backgroundColor: palette.soft }]}>
        <Ionicons name={icon} color={palette.main} size={27} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function StatBlock({ title, value, icon, tone, ring }: { title: string; value: string; icon: IconName; tone: Tone; ring?: number }) {
  const palette = tonePalette(tone);
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statContent}>
        {typeof ring === 'number' ? (
          <ProgressRing percent={ring} size={64} stroke={7} color={palette.main} />
        ) : (
          <Ionicons name={icon} color={palette.main} size={36} />
        )}
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

function Stepper({ steps }: { steps: { label: string; active: boolean; done: boolean }[] }) {
  return (
    <View style={styles.stepper}>
      {steps.map((step, index) => {
        const active = step.active || step.done;
        return (
          <View key={step.label} style={styles.stepItem}>
            <View style={[styles.stepCircle, active && styles.stepCircleActive, step.done && styles.stepCircleDone]}>
              <Text style={[styles.stepNo, active && styles.stepNoActive]}>{step.done ? 'âœ“' : index + 1}</Text>
            </View>
            {index < steps.length - 1 ? <View style={[styles.stepLine, active && styles.stepLineActive]} /> : null}
            <Text numberOfLines={1} style={[styles.stepLabel, step.active && styles.stepLabelActive]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Input({
  icon,
  rightIcon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}: {
  icon: IconName;
  rightIcon?: IconName;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
}) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} color={liveColors.blue} size={25} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#7C8CA8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {rightIcon ? <Ionicons name={rightIcon} color={liveColors.muted} size={25} /> : null}
    </View>
  );
}

function PlanRow({ time, plate, title }: { time: string; plate: string; title: string }) {
  return (
    <View style={styles.planRow}>
      <Text style={styles.planTime}>{time}</Text>
      <View style={styles.planPlate}><Text style={styles.planPlateText}>{plate}</Text></View>
      <Text numberOfLines={1} style={styles.planTitle}>{title}</Text>
      <StatusBadge label="Randevu" tone="blue" />
      <Ionicons name="chevron-forward" color={liveColors.muted} size={20} />
    </View>
  );
}

function QuickAction({ item, onPress }: { item: (typeof quickActions)[number]; onPress: () => void }) {
  const palette = tonePalette(item.tone);
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: palette.soft }]}>
        <Ionicons name={item.icon} color={palette.main} size={28} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.quickTitle}>{item.title}</Text>
        <Text style={styles.quickSub}>{item.subtitle}</Text>
      </View>
    </Pressable>
  );
}

function ActivityRow({ icon, tone, title, time }: { icon: IconName; tone: Tone; title: string; time: string }) {
  const palette = tonePalette(tone);
  return (
    <View style={styles.activityRow}>
      <Ionicons name={icon} color={palette.main} size={22} />
      <Text numberOfLines={1} style={styles.activityText}>{title}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

function SmallChip({ icon, text, tone }: { icon: IconName; text: string; tone: Tone }) {
  const palette = tonePalette(tone);
  return (
    <View style={[styles.smallChip, { backgroundColor: palette.soft }]}>
      <Ionicons name={icon} color={palette.main} size={17} />
      <Text style={[styles.smallChipText, { color: palette.main }]}>{text}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} color={liveColors.ink} size={21} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function InlineAlert({ text }: { text: string }) {
  return (
    <View style={styles.inlineAlert}>
      <Ionicons name="alert-circle-outline" color={liveColors.amber} size={20} />
      <Text style={styles.inlineAlertText}>{text}</Text>
    </View>
  );
}

function EmptyState({ title, body, icon }: { title: string; body: string; icon: IconName }) {
  return (
    <View style={styles.emptyState}>
      <IconBubble icon={icon} tone="blue" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function LoadingOverlay() {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator color={liveColors.white} size="large" />
      <Text style={styles.loadingText}>CanlÄ± sistem iÅŸleniyor</Text>
    </View>
  );
}

function getActiveTab(view: ViewKey): TabKey {
  if (view === 'home' || view === 'jobs' || view === 'profile' || view === 'modules' || view === 'detail') return view;
  if (view === 'body' || view === 'evidence' || view === 'final') return 'modules';
  return 'home';
}

function toInspectionStatus(module: ModuleItem): InspectionStatus {
  const isCompleted = module.progress >= 100 || module.status === 'TamamlandÄ±' || module.status === 'TamamlandÄ±';
  const isMissing = module.tasks.some((task) => task.evidenceCount === 0 && normalizeStatus(task.status) !== 'COMPLETED');

  if (isCompleted) {
    return {
      key: 'completed',
      tone: 'green',
      icon: 'checkmark-circle-outline',
      label: 'Tamamlandı',
      description: 'Kontrol tamamlandı',
      statusIcon: 'checkmark-circle-outline',
    };
  }

  if (module.status === 'Eksik Var' || isMissing) {
    return {
      key: 'missing',
      tone: 'red',
      icon: 'camera-outline',
      label: 'Eksik',
      description: 'Fotoğraf ve/veya kontrol gerektiriyor',
      statusIcon: 'camera-outline',
    };
  }

  if (module.tasks.some((task) => ['IN_PROGRESS', 'OPEN', 'WAITING', 'AVAILABLE', 'STARTED'].includes(normalizeStatus(task.status))) || module.status === 'Devam Ediyor') {
    return {
      key: 'waiting',
      tone: 'blue',
      icon: 'time-outline',
      label: 'Bekleniyor',
      description: 'Bekleme / süreçte',
      statusIcon: 'time-outline',
    };
  }

  return {
    key: 'default',
    tone: 'blue',
    icon: 'ellipse-outline',
    label: 'Hazır',
    description: 'İşleme hazır',
    statusIcon: 'ellipse-outline',
  };
}

function loadIconFont() {
  const iconComponent = Ionicons as unknown as { loadFont?: () => Promise<void> };
  return iconComponent.loadFont ? iconComponent.loadFont() : Promise.resolve();
}

function normalizeStatus(status: string) {
  return String(status || '').trim().toUpperCase();
}

function isClosed(status: string) {
  return ['COMPLETED', 'CLOSED', 'APPROVED', 'MANAGER_APPROVED'].includes(normalizeStatus(status));
}

function isActionableTask(status: string) {
  return ['AVAILABLE', 'OPEN', 'IN_PROGRESS', 'STARTED'].includes(normalizeStatus(status));
}

function completedTasks(order?: LiveWorkOrder) {
  return order?.tasks.filter((task) => normalizeStatus(task.status) === 'COMPLETED').length || 0;
}

function completedOrderCount(orders: LiveWorkOrder[]) {
  return orders.filter((order) => getOrderProgress(order) >= 100 || isClosed(order.status)).length;
}

function getOrderProgress(order?: LiveWorkOrder) {
  if (!order) return 0;
  if (!order.tasks.length) return isClosed(order.status) ? 100 : 0;
  return clamp(Math.round((completedTasks(order) / order.tasks.length) * 100));
}

function getActiveTask(order?: LiveWorkOrder) {
  if (!order) return undefined;
  return order.tasks.find((task) => isActionableTask(task.status)) || order.tasks.find((task) => normalizeStatus(task.status) !== 'COMPLETED') || order.tasks[0];
}

function buildModules(order?: LiveWorkOrder): ModuleItem[] {
  const tasks = order?.tasks || [];
  const overall = getOrderProgress(order);

  return moduleDefinitions.map((definition, index) => {
    const matched = tasks.filter((task) => {
      const text = `${task.key} ${task.title} ${task.reportFieldKey}`.toLocaleLowerCase('tr-TR');
      return definition.keywords.some((keyword) => text.includes(keyword));
    });
    const moduleTasks = matched.length ? matched : [];
    const taskTotal = Math.max(moduleTasks.length, definition.tasks);
    const taskDone = moduleTasks.length
      ? moduleTasks.filter((task) => normalizeStatus(task.status) === 'COMPLETED').length
      : overall >= 100
        ? definition.tasks
        : index === 0
          ? Math.round(definition.tasks * Math.min(overall || 40, 100) / 100)
          : 0;
    const progress = clamp(Math.round((taskDone / taskTotal) * 100));
    const hasAction = moduleTasks.some((task) => isActionableTask(task.status));
    const hasMissing = moduleTasks.some((task) => task.evidenceCount === 0 && normalizeStatus(task.status) !== 'COMPLETED');
    const status = progress >= 100 ? 'TamamlandÄ±' : hasMissing ? 'Eksik Var' : hasAction || index === 0 ? 'Devam Ediyor' : 'BoÅŸta';
    const owner = status === 'BoÅŸta' ? null : index === 5 ? 'Mehmet Usta' : technician.name;

    return {
      id: definition.id,
      title: definition.title,
      icon: definition.icon,
      tone: definition.tone,
      taskTotal,
      taskDone,
      evidenceRequired: definition.evidence,
      status,
      owner,
      progress,
      tasks: moduleTasks,
    };
  });
}

function mergeEvidenceCards(evidence: LiveEvidence[]) {
  return evidenceTemplates.map((template, index) => {
    const liveEvidence = evidence[index] || evidence.find((item) => item.title.toLocaleLowerCase('tr-TR').includes(template.title.toLocaleLowerCase('tr-TR').split(' ')[0]));
    return {
      ...template,
      title: liveEvidence?.title && liveEvidence.title.length < 36 ? liveEvidence.title : template.title,
      uploaded: true,
    };
  });
}

function statusLabel(status: string) {
  const normalized = normalizeStatus(status);
  if (normalized === 'COMPLETED' || normalized === 'CLOSED' || normalized === 'APPROVED') return 'TamamlandÄ±';
  if (normalized === 'MANAGER_REVIEW') return 'Teknik Onayda';
  if (normalized === 'IN_PROGRESS') return 'Teknik GiriÅŸ AÃ§Ä±k';
  if (normalized === 'OPEN') return 'AÃ§Ä±k';
  if (normalized === 'WAITING') return 'Bekliyor';
  return normalized ? normalized.replaceAll('_', ' ') : 'Teknik GiriÅŸ AÃ§Ä±k';
}

function statusTone(status: string): Tone {
  if (status === 'TamamlandÄ±') return 'green';
  if (status === 'Eksik Var') return 'orange';
  if (status === 'Devam Ediyor') return 'blue';
  return 'gray';
}

function vehicleTitle(order: LiveWorkOrder) {
  return [order.vehicle.year, order.vehicle.brand || 'Volkswagen', order.vehicle.model || 'Passat'].filter(Boolean).join(' ');
}

function vehicleMeta(order: LiveWorkOrder) {
  return [order.vehicle.fuel || 'Beyaz', order.vehicle.mileage || '34.521 km'].filter(Boolean).join(' â€¢ ');
}

function orderRiskLabel(order: LiveWorkOrder) {
  const acceptance = order.acceptance;
  const status = String(acceptance?.historyStatus || '').toUpperCase();
  if (!['WARNING', 'CRITICAL'].includes(status)) return '';
  const firstAlert = acceptance?.alerts?.[0];
  return [firstAlert?.title, firstAlert?.body || acceptance?.historyText].filter(Boolean).join(': ');
}

function brandInitial(order: LiveWorkOrder) {
  return (order.vehicle.brand || 'OT').slice(0, 2).toUpperCase();
}

function formatPlate(value: string) {
  const plate = value || 'PLAKA YOK';
  return plate.length > 8 && !plate.includes(' ') ? plate.replace(/^(\d{2})([A-Z]+)(.+)$/i, '$1 $2 $3') : plate;
}

function formatDateTime(value: string) {
  if (!value) return '16 MayÄ±s 2025 16:45';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function elapsedLabel(order: LiveWorkOrder) {
  const minutes = Math.max(order.durationMinutes || 98, 58);
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = Math.round(minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function tonePalette(tone: Tone) {
  const map = {
    blue: { main: liveColors.blue, soft: liveColors.blueSoft, border: '#C9DAFF' },
    green: { main: liveColors.green, soft: liveColors.greenSoft, border: '#BFE8D3' },
    orange: { main: liveColors.amber, soft: liveColors.amberSoft, border: '#FED7AA' },
    red: { main: liveColors.red, soft: liveColors.redSoft, border: '#FFC2CB' },
    purple: { main: liveColors.purple, soft: liveColors.purpleSoft, border: '#D9D0FF' },
    gray: { main: liveColors.muted, soft: liveColors.muted, border: liveColors.line },
    cyan: { main: liveColors.cyan, soft: liveColors.cyanSoft, border: '#BDEEF6' },
  } satisfies Record<Tone, { main: string; soft: string; border: string }>;
  return map[tone];
}

const cardShadow = {
  shadowColor: '#0B1F3D',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.09,
  shadowRadius: 22,
  elevation: 5,
};

const softShadow = {
  shadowColor: '#0B1F3D',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 3,
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: liveSemanticColors.background,
  },
  app: {
    flex: 1,
    backgroundColor: liveSemanticColors.background,
  },
  scrollContent: {
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  flex1: {
    flex: 1,
  },
  flexEnd: {
    marginLeft: 'auto',
  },
  startupScreen: {
    flex: 1,
    backgroundColor: liveColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  startupLoader: {
    marginTop: 36,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginSafe: {
    flex: 1,
    backgroundColor: liveColors.navy,
  },
  loginBg: {
    flex: 1,
    backgroundColor: liveColors.navy,
    paddingHorizontal: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  loginLogoWrap: {
    alignItems: 'center',
    marginBottom: 74,
  },
  loginSubtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 24,
    fontWeight: '500',
    marginTop: 8,
  },
  loginCard: {
    backgroundColor: liveColors.white,
    borderRadius: 34,
    padding: 24,
    gap: 17,
    ...cardShadow,
  },
  loginCardHead: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  loginTitle: {
    color: liveColors.ink,
    fontSize: 34,
    fontWeight: '800',
  },
  loginBody: {
    color: liveColors.muted,
    fontSize: 17,
    marginTop: 4,
  },
  loginOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: liveColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: liveColors.blue,
  },
  optionText: {
    color: liveColors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: liveColors.blue,
    fontSize: 16,
    fontWeight: '700',
  },
  loginError: {
    color: liveColors.red,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  inputWrap: {
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D6DEEA',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: liveColors.white,
  },
  input: {
    flex: 1,
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 62,
    borderRadius: 16,
    backgroundColor: liveColors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...softShadow,
  },
  primaryButtonText: {
    color: liveColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  outlineButton: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: liveColors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  outlineButtonText: {
    color: liveColors.blue,
    fontSize: 17,
    fontWeight: '800',
  },
  branchRow: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FBFCFF',
  },
  branchText: {
    flex: 1,
    color: liveColors.muted,
    fontSize: 15,
  },
  branchStrong: {
    color: liveColors.ink,
    fontWeight: '800',
  },
  securityNote: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BCE8D2',
    backgroundColor: liveColors.greenSoft,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  securityText: {
    color: liveColors.green,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  header: {
    minHeight: 244,
    backgroundColor: liveColors.navy,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  headerCurveA: {
    position: 'absolute',
    right: -96,
    top: -118,
    width: 390,
    height: 390,
    borderRadius: 210,
    backgroundColor: 'rgba(20,99,255,0.13)',
  },
  headerCurveB: {
    position: 'absolute',
    right: -42,
    bottom: -190,
    width: 410,
    height: 410,
    borderRadius: 220,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 70,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  logoText: {
    color: liveColors.white,
    fontSize: 38,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  logoTextLarge: {
    fontSize: 62,
  },
  logoAccent: {
    color: liveColors.blue,
  },
  headerLogoSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    marginTop: -6,
    letterSpacing: 0,
  },
  notificationButton: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: liveColors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  headerTitleRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  headerTitle: {
    color: liveColors.white,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 8,
    fontWeight: '500',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerChip: {
    maxWidth: 190,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: liveColors.blueSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerChipText: {
    color: liveColors.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  sheet: {
    marginTop: -34,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: liveColors.white,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 18,
  },
  sheetLight: {
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FBFCFF',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: liveColors.ink,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  sectionMeta: {
    color: liveColors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionAction: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    color: liveColors.blue,
    fontSize: 15,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  jobsMetricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 132,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: liveColors.white,
    padding: 16,
    gap: 10,
  },
  metricCardCompact: {
    flexBasis: 0,
    minHeight: 118,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  metricValue: {
    color: liveColors.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
  },
  metricSubtitle: {
    color: liveColors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  featureCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 16,
    gap: 16,
    ...softShadow,
  },
  featureTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: liveColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
  },
  brandAvatarText: {
    color: liveColors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  featureVehicle: {
    color: liveColors.ink,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  cardMuted: {
    color: liveColors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  featureBottom: {
    borderTopWidth: 1,
    borderTopColor: liveColors.line,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  riskInlineAlert: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: liveColors.amberSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskInlineText: {
    flex: 1,
    color: '#9A3412',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  smallPrimary: {
    marginLeft: 'auto',
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: liveColors.blue,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallPrimaryText: {
    color: liveColors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  planList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    overflow: 'hidden',
  },
  planRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  planTime: {
    color: liveColors.blue,
    fontSize: 16,
    fontWeight: '900',
    width: 52,
  },
  planPlate: {
    borderWidth: 1,
    borderColor: '#C8D2E2',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  planPlateText: {
    color: liveColors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  planTitle: {
    flex: 1,
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 74,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    color: liveColors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  quickSub: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  activityList: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: liveColors.line,
    overflow: 'hidden',
  },
  activityRow: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  activityText: {
    flex: 1,
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  activityTime: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  workCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 16,
    gap: 14,
    ...softShadow,
  },
  workTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 22,
  },
  workMain: {
    flex: 1,
    gap: 5,
  },
  workVehicle: {
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '900',
    minWidth: 45,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  cardChevron: {
    position: 'absolute',
    right: 14,
    top: 74,
  },
  smallChip: {
    minHeight: 36,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  smallChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  detailTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  kicker: {
    color: liveColors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  orderNo: {
    color: '#E31B36',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
  },
  vehicleTitle: {
    color: liveColors.ink,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 8,
  },
  statusWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  vehicleInfoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    ...softShadow,
  },
  detailSheet: {
    marginHorizontal: 0,
    gap: 14,
    paddingBottom: 10,
  },
  vehicleSummaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 16,
    gap: 12,
    ...softShadow,
  },
  vehicleSummaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  vehicleSummaryLeft: {
    flex: 1,
    gap: 8,
  },
  vehicleMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleMetaItem: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleMetaLabel: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleMetaValue: {
    color: liveColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  vehicleMetaSpacer: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleProgressFooter: {
    borderTopWidth: 1,
    borderTopColor: liveColors.line,
    paddingTop: 10,
  },
  vehicleProgressText: {
    color: liveColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  detailButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailButtonOutline: {
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
  },
  detailButtonOutlineText: {
    color: liveColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  detailButtonSuccess: {
    borderWidth: 1,
    borderColor: '#8FDDAA',
    backgroundColor: liveColors.green,
  },
  detailButtonText: {
    color: liveColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  inspectionTabsWrap: {
    backgroundColor: liveColors.white,
    borderWidth: 1,
    borderColor: liveColors.line,
    borderRadius: 16,
    paddingVertical: 6,
  },
  inspectionTabsScroll: {
    paddingHorizontal: 8,
    gap: 10,
    paddingVertical: 2,
  },
  inspectionTab: {
    minHeight: 48,
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4EAF3',
    backgroundColor: liveColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  inspectionTabActive: {
    borderColor: liveSemanticColors.brandPrimary,
    backgroundColor: '#FDF2F3',
  },
  inspectionTabText: {
    color: liveColors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  inspectionTabTextActive: {
    color: liveSemanticColors.brandPrimary,
  },
  inspectionTabBadge: {
    minHeight: 22,
    minWidth: 22,
    borderRadius: 11,
    backgroundColor: liveColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  inspectionTabBadgeActive: {
    backgroundColor: liveSemanticColors.brandPrimary,
  },
  inspectionTabBadgeText: {
    color: liveColors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
  },
  inspectionTabBadgeTextActive: {
    color: liveColors.white,
  },
  inspectionList: {
    gap: 10,
    marginTop: 6,
  },
  inspectionRow: {
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    backgroundColor: liveColors.white,
    borderColor: liveColors.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspectionRowCompleted: {
    backgroundColor: liveColors.white,
    borderColor: '#CFE9D8',
  },
  inspectionRowMissing: {
    backgroundColor: liveSemanticColors.errorSoft,
    borderColor: '#F3C0CA',
  },
  inspectionRowWaiting: {
    backgroundColor: liveSemanticColors.infoSoft,
    borderColor: '#B8D8F9',
  },
  inspectionRowDefault: {
    backgroundColor: liveColors.white,
    borderColor: liveColors.line,
  },
  inspectionIndex: {
    width: 34,
    height: 34,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inspectionIndexCompleted: {
    backgroundColor: '#E7F7EF',
    borderColor: '#12B76A',
  },
  inspectionIndexMissing: {
    backgroundColor: '#FEECEE',
    borderColor: liveSemanticColors.error,
  },
  inspectionIndexWaiting: {
    backgroundColor: '#EAF4FF',
    borderColor: liveSemanticColors.info,
  },
  inspectionIndexDefault: {
    backgroundColor: liveSemanticColors.surface,
    borderColor: liveColors.line,
  },
  inspectionIndexText: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  inspectionTitle: {
    color: liveColors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  inspectionSubStatus: {
    marginTop: 3,
    color: liveColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  inspectionRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cameraActionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cameraActionButtonDefault: {
    backgroundColor: liveColors.surface,
    borderColor: liveColors.line,
  },
  cameraActionButtonWarning: {
    backgroundColor: liveSemanticColors.errorSoft,
    borderColor: liveSemanticColors.error,
  },
  cameraStatusDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: liveSemanticColors.error,
  },
  circularProgressWrap: {
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 68,
    height: 68,
  },
  circularProgressPercent: {
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  circularProgressIcon: {
    marginTop: -2,
  },
  carIllustration: {
    width: '42%',
    borderRadius: 16,
    backgroundColor: '#F7FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 12,
  },
  infoTable: {
    flex: 1,
  },
  infoRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  infoLabel: {
    color: liveColors.muted,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  infoValue: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '800',
    maxWidth: 148,
    textAlign: 'right',
  },
  statsStrip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statBlock: {
    flex: 1,
    minHeight: 122,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: liveColors.line,
  },
  statTitle: {
    color: liveColors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: liveColors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  moduleList: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    overflow: 'hidden',
  },
  detailModuleRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  detailModuleTitle: {
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  detailModuleProgress: {
    width: 110,
    gap: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 12,
  },
  actionButtonCompact: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  actionGhost: {
    borderColor: 'transparent',
  },
  actionText: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  actionTextCompact: {
    fontSize: 14,
  },
  contextCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contextTitle: {
    color: liveColors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryGrid: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: liveColors.line,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  summaryValue: {
    color: liveColors.ink,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  expandedModule: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: liveColors.blue,
    backgroundColor: '#F8FBFF',
    padding: 14,
    gap: 14,
  },
  expandedHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moduleIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: liveColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIndexText: {
    color: liveColors.blue,
    fontSize: 16,
    fontWeight: '900',
  },
  expandedTitle: {
    color: liveColors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ownerText: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  moduleInfoBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9DAFF',
    backgroundColor: liveColors.blueSoft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  moduleInfoText: {
    color: liveColors.blue,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  progressLabeled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressPercent: {
    color: liveColors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  moduleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  moduleStack: {
    gap: 10,
  },
  collapsedModule: {
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...softShadow,
  },
  moduleIndexSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: liveColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIndexSmallText: {
    color: liveColors.blue,
    fontSize: 13,
    fontWeight: '900',
  },
  collapsedTitle: {
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  ownerSmall: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 96,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerNoteText: {
    color: liveColors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  stepper: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#D0D5DD',
    backgroundColor: liveColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: liveColors.blue,
    backgroundColor: liveColors.blue,
  },
  stepCircleDone: {
    backgroundColor: liveColors.blue,
  },
  stepNo: {
    color: liveColors.muted,
    fontSize: 16,
    fontWeight: '900',
  },
  stepNoActive: {
    color: liveColors.white,
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: '72%',
    right: '-28%',
    height: 2,
    backgroundColor: '#D0D5DD',
  },
  stepLineActive: {
    backgroundColor: liveColors.blue,
  },
  stepLabel: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: liveColors.blue,
  },
  tableCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    overflow: 'hidden',
    ...softShadow,
  },
  tableHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  tableHeadText: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  partColumn: {
    flex: 1.05,
  },
  stateColumn: {
    flex: 1.9,
  },
  bodyRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  bodyPartText: {
    color: liveColors.ink,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  segmentGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: liveColors.line,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRightWidth: 1,
    borderRightColor: liveColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  segmentText: {
    color: liveColors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  noteIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: liveColors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measureCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 16,
    gap: 14,
    ...softShadow,
  },
  measureHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  measureTitle: {
    color: liveColors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  measureItem: {
    flexGrow: 1,
    flexBasis: '46%',
    gap: 7,
  },
  measureLabel: {
    color: liveColors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  measureInput: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6DEEA',
    backgroundColor: '#FBFCFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  measureValue: {
    color: liveColors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  measureUnit: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  noteCard: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notePlaceholder: {
    color: liveColors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  evidencePanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 16,
    gap: 16,
    ...softShadow,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  evidenceCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 10,
    gap: 9,
  },
  evidenceTitle: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  evidenceThumb: {
    height: 128,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbPlate: {
    position: 'absolute',
    bottom: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16,24,40,0.2)',
    backgroundColor: liveColors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  thumbPlateText: {
    color: liveColors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  uploadText: {
    color: liveColors.green,
    fontSize: 15,
    fontWeight: '800',
  },
  evidenceActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  evidenceAction: {
    flex: 1,
    minHeight: 76,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  evidenceActionText: {
    color: liveColors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  textAreaWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8D2E2',
    backgroundColor: liveColors.white,
    minHeight: 132,
    padding: 14,
  },
  textArea: {
    flex: 1,
    color: liveColors.ink,
    fontSize: 16,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  counterText: {
    color: liveColors.muted,
    fontSize: 13,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
  finalTopCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...softShadow,
  },
  finalVehicle: {
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  finalStats: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  finalModuleBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    overflow: 'hidden',
  },
  finalModuleRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  finalModuleTitle: {
    flex: 1,
    color: liveColors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  finalModuleMeta: {
    color: liveColors.muted,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 82,
  },
  noteGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewNote: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 14,
    gap: 10,
  },
  reviewNoteTitle: {
    color: liveColors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  reviewNoteBody: {
    color: liveColors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  reviewNoteFooter: {
    borderTopWidth: 1,
    borderTopColor: liveColors.line,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  readyBanner: {
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFE8D3',
    backgroundColor: liveColors.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
  },
  readyTitle: {
    color: liveColors.green,
    fontSize: 17,
    fontWeight: '900',
  },
  readyText: {
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  notificationSummary: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  panelTitle: {
    color: liveColors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  panelSub: {
    color: liveColors.muted,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterTab: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  filterTabActive: {
    borderColor: liveColors.blue,
    backgroundColor: liveColors.blueSoft,
  },
  filterText: {
    color: liveColors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  filterTextActive: {
    color: liveColors.blue,
  },
  filterValue: {
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: liveColors.ink,
    backgroundColor: liveColors.blueSoft,
    fontSize: 13,
    fontWeight: '900',
  },
  filterValueActive: {
    color: liveColors.white,
    backgroundColor: liveColors.blue,
  },
  notificationList: {
    gap: 10,
  },
  notificationRow: {
    minHeight: 112,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...softShadow,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  notificationIcon: {
    width: 74,
    height: 74,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  notificationTitle: {
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  notificationBody: {
    color: liveColors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: 5,
  },
  notificationTime: {
    alignSelf: 'flex-start',
    color: liveColors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...softShadow,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: liveColors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: liveColors.ink,
    fontSize: 32,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    right: 5,
    bottom: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: liveColors.white,
    backgroundColor: '#12B76A',
  },
  profileName: {
    color: liveColors.ink,
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 8,
  },
  profileBranch: {
    color: liveColors.muted,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 12,
  },
  profileStat: {
    flex: 1,
    minHeight: 126,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: liveColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  profileStatTitle: {
    color: liveColors.ink,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 7,
    textAlign: 'center',
  },
  profileStatValue: {
    color: liveColors.ink,
    fontSize: 31,
    fontWeight: '900',
    marginTop: 4,
  },
  profileStatSubtitle: {
    color: liveColors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  settingsCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    overflow: 'hidden',
  },
  profileRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: liveColors.line,
  },
  profileRowTitle: {
    color: liveColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  logoutRow: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...softShadow,
  },
  logoutTitle: {
    color: liveColors.red,
    fontSize: 19,
    fontWeight: '900',
  },
  plate: {
    alignSelf: 'flex-start',
    minHeight: 42,
    borderRadius: 6,
    borderWidth: 1.4,
    borderColor: liveColors.ink,
    backgroundColor: liveColors.white,
    flexDirection: 'row',
    overflow: 'hidden',
    maxWidth: 190,
  },
  plateStrip: {
    width: 28,
    backgroundColor: liveColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateTr: {
    color: liveColors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  plateText: {
    color: liveColors.ink,
    fontSize: 22,
    fontWeight: '900',
    paddingHorizontal: 12,
    alignSelf: 'center',
    letterSpacing: 0,
  },
  progressTrack: {
    flex: 1,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#DDE3EC',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  ringCenter: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    color: liveColors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  ringLabel: {
    color: liveColors.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleSmall: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  statusBadge: {
    minHeight: 31,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '900',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: liveColors.line,
    backgroundColor: liveColors.white,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 0,
    ...softShadow,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    minHeight: 62,
    paddingBottom: 8,
  },
  tabItemCenter: {
    marginTop: -22,
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabHomeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: liveSemanticColors.brandPrimary,
    ...softShadow,
  },
  tabHomeButtonActive: {
    backgroundColor: '#E31B36',
  },
  tabLabel: {
    color: liveSemanticColors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  tabHomeLabel: {
    marginTop: 0,
  },
  tabLabelActive: {
    color: liveSemanticColors.brandPrimary,
  },
  tabLine: {
    width: 28,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: 'transparent',
  },
  tabLineCenter: {
    width: 28,
  },
  tabLineActive: {
    backgroundColor: liveSemanticColors.brandPrimary,
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -12,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#FF3B4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: liveColors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  tabHomeText: {
    color: liveColors.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tabHomeTextActive: {
    color: liveColors.white,
  },
  inlineAlert: {
    borderRadius: 14,
    backgroundColor: liveColors.amberSoft,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineAlertText: {
    flex: 1,
    color: liveColors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: liveColors.line,
    backgroundColor: liveColors.white,
    alignItems: 'center',
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    color: liveColors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyBody: {
    color: liveColors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6,27,51,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 20,
  },
  loadingText: {
    color: liveColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

