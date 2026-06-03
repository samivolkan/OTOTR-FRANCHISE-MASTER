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
import { completeTask, fetchLiveWorkOrders, saveBodyInspectionAnswer, signInLive, subscribeLiveChanges, submitFinalReview } from './api';
import { mockLiveOrders } from './mock';
import { liveColors } from './theme';
import { DashboardMetrics, LiveBodyInspectionAnswer, LiveEvidence, LiveTask, LiveWorkOrder, Session } from './types';

type IconName = keyof typeof VectorIonicons.glyphMap;
type TabKey = 'home' | 'jobs' | 'notifications' | 'profile';
type ViewKey = TabKey | 'detail' | 'modules' | 'body' | 'evidence' | 'final';
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

const technician = {
  name: 'Ahmet Usta',
  role: 'Ekspertiz Teknisyeni',
  branch: 'Bursa Küçük Sanayi',
  shift: '08:00 - 17:00',
  avatarInitials: 'AU',
};

const bodyParts = [
  { part: 'Ön Kaput', icon: 'car-sport-outline' as IconName, state: 'Orijinal', micron: 110 },
  { part: 'Sol Ön Çamurluk', icon: 'trail-sign-outline' as IconName, state: 'Boyalı', micron: 210 },
  { part: 'Sağ Ön Çamurluk', icon: 'trail-sign-outline' as IconName, state: 'Değişen', micron: 118 },
  { part: 'Sol Ön Kapı', icon: 'tablet-landscape-outline' as IconName, state: 'Orijinal', micron: 105 },
  { part: 'Sağ Ön Kapı', icon: 'tablet-landscape-outline' as IconName, state: 'Boyalı', micron: 195 },
  { part: 'Tavan', icon: 'remove-outline' as IconName, state: 'Orijinal', micron: 112 },
  { part: 'Bagaj Kapağı', icon: 'car-outline' as IconName, state: 'Değişen', micron: 98 },
];

type BodyInspectionPart = (typeof bodyParts)[number];
type BodyPartState = BodyInspectionPart['state'];

const evidenceTemplates = [
  { title: 'Araç Ön Görünüm', icon: 'car-sport-outline' as IconName, tone: 'blue' as Tone },
  { title: 'Araç Arka Görünüm', icon: 'car-outline' as IconName, tone: 'green' as Tone },
  { title: 'Şasi Etiketi', icon: 'barcode-outline' as IconName, tone: 'gray' as Tone },
  { title: 'Boya Ölçüm Ekranı', icon: 'speedometer-outline' as IconName, tone: 'purple' as Tone },
  { title: 'Hasarlı Bölge Fotoğrafı', icon: 'warning-outline' as IconName, tone: 'orange' as Tone },
];

const notifications = [
  {
    title: 'Yeni İş Emri Atandı',
    tag: 'Yeni',
    tone: 'blue' as Tone,
    time: '16:45',
    unread: true,
    body: '16 CAN 526 plakalı 2022 Volkswagen Golf aracına yeni iş emri atandı.',
    icon: 'document-text-outline' as IconName,
  },
  {
    title: 'Eksik Adım Tespit Edildi',
    tag: 'Uyarı',
    tone: 'orange' as Tone,
    time: '15:10',
    unread: true,
    body: '16 R 0273 numaralı iş emrinde 1 eksik adım tespit edildi.',
    icon: 'alert-circle-outline' as IconName,
  },
  {
    title: 'Devralma Talebi Geldi',
    tag: 'Bilgi',
    tone: 'purple' as Tone,
    time: '14:40',
    unread: true,
    body: '16 BZ 198 numaralı iş emri için devralma talebi aldınız.',
    icon: 'people-outline' as IconName,
  },
  {
    title: 'Teknik Onaydan Döndü',
    tag: 'Kritik',
    tone: 'red' as Tone,
    time: '14:05',
    unread: false,
    body: '16 R 0273 numaralı iş emri teknik onaydan döndü. İnceleme yapmanız gerekiyor.',
    icon: 'shield-outline' as IconName,
  },
  {
    title: 'Rapor Onaylandı',
    tag: 'Başarılı',
    tone: 'green' as Tone,
    time: '12:30',
    unread: false,
    body: '16 E 274 plakalı 2021 Volkswagen Golf aracının raporu onaylandı.',
    icon: 'shield-checkmark-outline' as IconName,
  },
  {
    title: 'Sistem Bakım Çalışması',
    tag: 'Sistem',
    tone: 'blue' as Tone,
    time: '09:15',
    unread: false,
    body: '19 Mayıs 2025 Pazar 02:00 - 04:00 saatleri arasında sistem bakım çalışması yapılacaktır.',
    icon: 'settings-outline' as IconName,
  },
];

const quickActions = [
  { title: 'İşlerim', subtitle: 'Devam eden işler', icon: 'clipboard-outline' as IconName, tone: 'blue' as Tone, view: 'jobs' as ViewKey },
  { title: 'Eksikler', subtitle: 'Eksik adımlar', icon: 'alert-circle-outline' as IconName, tone: 'orange' as Tone, view: 'detail' as ViewKey },
  { title: 'Kanıtlar', subtitle: 'Fotoğraf & video', icon: 'camera-outline' as IconName, tone: 'green' as Tone, view: 'evidence' as ViewKey },
  { title: 'Rapor Önizle', subtitle: 'Basım hazırlığı', icon: 'document-text-outline' as IconName, tone: 'purple' as Tone, view: 'final' as ViewKey },
];

const moduleDefinitions = [
  { id: 'body', title: 'Kaporta Kontrolü', icon: 'car-sport-outline' as IconName, tone: 'blue' as Tone, tasks: 10, evidence: 6, keywords: ['body', 'paint', 'kaporta', 'boya', 'dış', 'dis'] },
  { id: 'engine', title: 'Motor Kontrolü', icon: 'construct-outline' as IconName, tone: 'green' as Tone, tasks: 8, evidence: 5, keywords: ['engine', 'motor'] },
  { id: 'mechanic', title: 'Mekanik Test', icon: 'build-outline' as IconName, tone: 'purple' as Tone, tasks: 12, evidence: 8, keywords: ['mechanic', 'mekanik', 'brake', 'fren', 'suspension', 'süspansiyon'] },
  { id: 'obd', title: 'Elektronik / OBD', icon: 'hardware-chip-outline' as IconName, tone: 'orange' as Tone, tasks: 9, evidence: 6, keywords: ['obd', 'beyin', 'elektronik', 'electric'] },
  { id: 'airbag', title: 'Airbag Testi', icon: 'accessibility-outline' as IconName, tone: 'red' as Tone, tasks: 6, evidence: 4, keywords: ['airbag', 'srs'] },
  { id: 'interior', title: 'İç Mekan Kontrolü', icon: 'person-seat-outline' as IconName, tone: 'cyan' as Tone, tasks: 7, evidence: 4, keywords: ['interior', 'iç', 'ic', 'donanım', 'kabin'] },
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
      setLastError('Canlı senkron için bayi portalı kullanıcısı ile giriş gerekli.');
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
      setLastSync('Canlı hata, son veri korunuyor');
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
      const message = 'Canlı bağlantı için e-posta ve şifre alanları zorunludur.';
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
      Alert.alert('Canlı giriş başarısız', message);
    } finally {
      setLoading(false);
    }
  }

  async function completeActiveTaskAndContinue() {
    if (!session) {
      Alert.alert('Oturum gerekli', 'Canlı görev güncellemek için bayi portalı hesabı ile giriş yapın.');
      return;
    }
    if (!selectedTask || !isActionableTask(selectedTask.status)) {
      Alert.alert('Görev hazır değil', 'Bu görev canlı sistemde teknik giriş için açık değil. Final kontrol ekranı açılıyor.');
      setView('final');
      return;
    }
    setLoading(true);
    try {
      await completeTask(session, selectedTask, evidenceNote);
      await syncLive(session, { silent: true });
      setEvidenceNote('');
      setView('final');
      Alert.alert('Kayıt alındı', 'Mobilde girilen teknik veri canlı bayi portalına gönderildi.');
    } catch (error) {
      Alert.alert('Görev kaydedilemedi', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function persistBodyInspection(parts: LiveBodyInspectionAnswer[], options: { silent?: boolean } = {}) {
    if (!session || !selectedOrder) {
      if (!options.silent) Alert.alert('Oturum gerekli', 'Canlı forma veri yazmak için oturum açık olmalı.');
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
      if (!options.silent) Alert.alert('Canlı form kaydedilemedi', message);
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
    if (saved) Alert.alert('Taslak kaydedildi', 'Kaporta formu canlı sisteme işlendi.');
  }

  async function handleBodyContinue(parts: LiveBodyInspectionAnswer[]) {
    const saved = await persistBodyInspection(parts, { silent: false });
    if (!saved) return;
    await syncLive(session, { silent: true });
    setView('evidence');
  }

  async function handleSubmitFinalReview() {
    if (!session || !selectedOrder) {
      Alert.alert('Oturum gerekli', 'Raporu teknik onaya göndermek için oturum açık olmalı.');
      return;
    }
    setLoading(true);
    try {
      await submitFinalReview(session, selectedOrder);
      await syncLive(session, { silent: true });
      Alert.alert('Rapor teknik onaya gönderildi.');
    } catch (error) {
      Alert.alert('Gönderim başarısız', error instanceof Error ? error.message : String(error));
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
        <BottomTabs active={activeTab} onChange={handleTabChange} />
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
        <Text style={styles.loginSubtitle}>Tarafsız Araç Ekspertizi</Text>
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
          <Text style={styles.loginSubtitle}>Tarafsız Araç Ekspertizi</Text>
        </View>
        <View style={styles.loginCard}>
          <View style={styles.loginCardHead}>
            <IconBubble icon="lock-closed-outline" tone="blue" />
            <View style={styles.flex1}>
              <Text style={styles.loginTitle}>Giriş Yap</Text>
              <Text style={styles.loginBody}>Hesabınıza giriş yaparak devam edin.</Text>
            </View>
          </View>
          <Input icon="person-outline" placeholder="Telefon / E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input icon="lock-closed-outline" placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry rightIcon="eye-outline" />
          <View style={styles.loginOptions}>
            <Pressable style={styles.checkRow} onPress={() => setRemember((value) => !value)}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>{remember ? <Ionicons name="checkmark" color={liveColors.white} size={16} /> : null}</View>
              <Text style={styles.optionText}>Beni hatırla</Text>
            </Pressable>
            <Text style={styles.linkText}>Şifremi unuttum</Text>
          </View>
          {lastError ? <Text style={styles.loginError}>{lastError}</Text> : null}
          <Pressable style={styles.primaryButton} disabled={loading} onPress={() => onLogin(email, password)}>
            <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            <Ionicons name="arrow-forward" color={liveColors.white} size={22} />
          </Pressable>
          <Pressable style={styles.outlineButton}>
            <Ionicons name="headset-outline" color={liveColors.blue} size={20} />
            <Text style={styles.outlineButtonText}>Teknik Destek</Text>
          </Pressable>
          <View style={styles.branchRow}>
            <Ionicons name="location-outline" color={liveColors.blue} size={22} />
            <Text style={styles.branchText}>Şube: <Text style={styles.branchStrong}>Bursa Küçük Sanayi</Text></Text>
            <Ionicons name="chevron-forward" color={liveColors.muted} size={22} />
          </View>
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" color={liveColors.green} size={20} />
            <Text style={styles.securityText}>Güvenli giriş için tüm verileriniz şifrelenmektedir.</Text>
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
        subtitle={`Merhaba ${technician.name}\nBugün harika işler çıkaralım.`}
        showLogo
        rightNotification
      />
      <View style={styles.sheet}>
        <SectionHeader icon="calendar-outline" title="Günlük Özet" action="Canlı Senkron" onPress={onSync} meta="16 Mayıs 2025, Cuma" />
        {lastError ? <InlineAlert text={lastError} /> : null}
        <View style={styles.metricGrid}>
          <MetricCard icon="document-text-outline" title="Aktif İş Emri" value={String(metrics.openOrders || orders.length)} subtitle="devam eden" tone="blue" />
          <MetricCard icon="checkmark-circle-outline" title="Bugün Tamamlanan" value={String(completedOrderCount(orders))} subtitle="iş emri" tone="green" />
          <MetricCard icon="alert-circle-outline" title="Eksik Adım" value={String(metrics.missingEvidence)} subtitle="iş emrinde" tone="orange" />
          <MetricCard icon="shield-checkmark-outline" title="Teknik Onayda" value={String(metrics.waitingApproval)} subtitle="iş emri" tone="purple" />
        </View>

        <SectionHeader icon="flash-outline" title="Öne Çıkan Aktif İş Emri" action="Tümünü Gör" onPress={() => onOpenView('jobs')} />
        {featuredOrder ? (
          <FeaturedOrderCard order={featuredOrder} progress={featuredProgress} onPress={() => onOpenView('detail')} />
        ) : (
          <EmptyState title="Canlı iş emri bulunamadı" body="Bayi portalından yeni iş emri açıldığında burada görünecek." icon="briefcase-outline" />
        )}

        <SectionHeader icon="bag-outline" title="Bugünkü Plan" action="Takvime Git" />
        <View style={styles.planList}>
          <PlanRow time="09:30" plate="16 CAN 526" title="2022 Volkswagen Golf" />
          <PlanRow time="11:00" plate="16 R 0273" title="2022 Volkswagen Passat" />
          <PlanRow time="14:00" plate="16 BZ 198" title="2021 Skoda Octavia" />
        </View>

        <SectionHeader icon="grid-outline" title="Hızlı İşlemler" />
        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <QuickAction key={item.title} item={item} onPress={() => onOpenView(item.view)} />
          ))}
        </View>

        <SectionHeader icon="time-outline" title="Son Aktiviteler" action={lastSync} />
        <View style={styles.activityList}>
          <ActivityRow icon="checkmark-circle-outline" tone="green" title="Canlı veri senkronize edildi." time={lastSync} />
          {featuredOrder ? (
            <>
              <ActivityRow icon="document-text-outline" tone="blue" title={`${featuredOrder.workOrderNo} iş emri mobilde görüntülendi.`} time="16:45" />
              <ActivityRow icon="camera-outline" tone="orange" title={`${featuredOrder.vehicle.plate} için kanıt adımları takipte.`} time="15:10" />
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
        title="İşlerim"
        subtitle={`${technician.name}\n${technician.role}`}
        showLogo
        rightNotification
        chip={lastSync}
      />
      <View style={styles.sheet}>
        <SectionHeader icon="clipboard-outline" title="İşlerim" meta="16 Mayıs 2025, Cuma" action="Yenile" onPress={onSync} />
        <View style={styles.jobsMetricRow}>
          <MetricCard compact icon="clipboard-outline" title="Aktif İş Emri" value={String(metrics.openOrders || orders.length)} subtitle="devam eden" tone="blue" />
          <MetricCard compact icon="checkmark-circle-outline" title="Bugün Tamamlanan" value={String(completedOrderCount(orders))} subtitle="iş emri" tone="green" />
          <MetricCard compact icon="alert-circle-outline" title="Eksik Adım" value={String(metrics.missingEvidence)} subtitle="iş emrinde" tone="orange" />
        </View>
        {orders.length ? (
          orders.map((order) => <WorkOrderCard key={order.id} order={order} onPress={() => onSelect(order)} />)
        ) : (
          <EmptyState title="İş emri yok" body="Web bayi portalından açılan canlı iş emirleri bu ekrana düşecek." icon="clipboard-outline" />
        )}
      </View>
    </>
  );
}

function WorkOrderDetailScreen({ order, modules, onBack, onStart }: { order: LiveWorkOrder; modules: ModuleItem[]; onBack: () => void; onStart: () => void }) {
  const progress = getOrderProgress(order);
  const openItems = Math.max(0, order.tasks.length - completedTasks(order));

  return (
    <>
      <AppHeader title="İş Emri Detayı" showLogo showBack onBack={onBack} rightNotification />
      <View style={styles.sheet}>
        <View style={styles.detailTop}>
          <View style={styles.flex1}>
            <Text style={styles.kicker}>İş Emri No</Text>
            <Text style={styles.orderNo}>{order.workOrderNo}</Text>
            <Text style={styles.vehicleTitle}>{vehicleTitle(order)}</Text>
          </View>
          <View style={styles.statusWrap}>
            <StatusBadge label={statusLabel(order.status)} tone="green" dot />
            <StatusBadge label="Öncelik: Orta" tone="orange" dot />
          </View>
        </View>

        <View style={styles.vehicleInfoCard}>
          <View style={styles.carIllustration}>
            <Ionicons name="car-sport-outline" color={liveColors.blue} size={74} />
            <Plate value={order.vehicle.plate} />
          </View>
          <View style={styles.infoTable}>
            <InfoRow icon="cube-outline" label="Paket / Yıl" value={`${order.packageName || 'Business'} / ${order.vehicle.year || '2021'}`} />
            <InfoRow icon="speedometer-outline" label="Kilometre" value={order.vehicle.mileage || '68.450 km'} />
            <InfoRow icon="flame-outline" label="Yakıt" value={order.vehicle.fuel || 'Dizel'} />
            <InfoRow icon="git-compare-outline" label="Vites" value={order.vehicle.transmission || 'Otomatik'} />
            <InfoRow icon="calendar-outline" label="Müşteri Randevusu" value={formatDateTime(order.openedAt)} />
          </View>
        </View>

        <View style={styles.statsStrip}>
          <StatBlock title="Toplam Tamamlanma" value={`%${progress}`} icon="analytics-outline" tone="green" ring={progress} />
          <StatBlock title="Geçen Süre" value={elapsedLabel(order)} icon="time-outline" tone="blue" />
          <StatBlock title="Açık Eksik Madde" value={String(openItems)} icon="alert-circle-outline" tone="orange" />
        </View>

        <SectionHeader title="Ekspertiz Modülleri" />
        <View style={styles.moduleList}>
          {modules.map((module) => (
            <ModuleListRow key={module.id} module={module} />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <ActionButton title="Eksikleri Gör" variant="outline" icon="alert-circle-outline" tone="orange" />
          <ActionButton title="Göreve Başla" icon="play" onPress={onStart} />
        </View>
      </View>
    </>
  );
}

function TaskModulesScreen({ order, modules, onBack, onContinue }: { order: LiveWorkOrder; modules: ModuleItem[]; onBack: () => void; onContinue: () => void }) {
  const completed = modules.filter((module) => module.status === 'Tamamlandı').length;
  const warned = modules.filter((module) => module.status === 'Eksik Var').length;
  const first = modules[0];

  return (
    <>
      <AppHeader
        title="Görev Modülleri"
        subtitle="Aracınıza ait modül görevlerini yönetin."
        showLogo
        showBack
        onBack={onBack}
        rightNotification
      />
      <View style={styles.sheet}>
        <View style={styles.contextCard}>
          <IconBubble icon="document-text-outline" tone="blue" />
          <View style={styles.flex1}>
            <Text style={styles.contextTitle}>{order.workOrderNo} • {vehicleTitle(order)}</Text>
          </View>
          <StatusBadge label={statusLabel(order.status)} tone="purple" />
        </View>
        <View style={styles.summaryGrid}>
          <SummaryItem icon="cube-outline" label="Toplam Modül" value={String(modules.length)} tone="blue" />
          <SummaryItem icon="checkmark-circle-outline" label="Tamamlanan" value={String(completed)} tone="green" />
          <SummaryItem icon="alert-circle-outline" label="Eksik / Uyarı" value={String(warned || Math.max(0, order.tasks.length - completedTasks(order)))} tone="orange" />
          <SummaryItem icon="time-outline" label="Son Güncelleme" value={formatDateTime(order.openedAt)} tone="blue" />
        </View>
        {first ? <ExpandedModule module={first} onContinue={onContinue} /> : null}
        <View style={styles.moduleStack}>
          {modules.slice(1).map((module) => (
            <CollapsedModule key={module.id} module={module} />
          ))}
        </View>
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" color={liveColors.muted} size={18} />
          <Text style={styles.footerNoteText}>Modüller yukarıdan aşağıya sırayla tamamlanmalıdır.</Text>
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
        title="Kaporta Kontrolü"
        subtitle={`${order.workOrderNo} • ${order.vehicle.brand || 'Volkswagen'} ${order.vehicle.model || 'Passat'}`}
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
            { label: 'İç / Dış', active: false, done: false },
            { label: 'Test Sürüşü', active: false, done: false },
          ]}
        />
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadText, styles.partColumn]}>Parça</Text>
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
              <Text style={styles.measureTitle}>Ölçüm Girişi</Text>
            </View>
            <StatusBadge label="Mikron Rehberi" tone="blue" icon="information-circle-outline" />
          </View>
          <View style={styles.measureGrid}>
            {parts.map((part) => (
              <View key={part.part} style={styles.measureItem}>
                <Text style={styles.measureLabel}>{part.part}</Text>
                <View style={styles.measureInput}>
                  <Text style={styles.measureValue}>{part.micron}</Text>
                  <Text style={styles.measureUnit}>µm</Text>
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
      <AppHeader title="Fotoğraf & Kanıt" subtitle="Kaporta Kontrolü" showBack onBack={onBack} rightNotification chip={order.workOrderNo} />
      <View style={styles.sheetLight}>
        <Stepper
          steps={[
            { label: 'Araç Bilgileri', active: false, done: true },
            { label: 'Kontroller', active: false, done: true },
            { label: 'Fotoğraf & Kanıt', active: true, done: false },
            { label: 'Değerlendirme', active: false, done: false },
          ]}
        />
        <View style={styles.evidencePanel}>
          <View style={styles.panelTitleRow}>
            <View style={styles.rowCenter}>
              <Ionicons name="shield-checkmark-outline" color={liveColors.purple} size={24} />
              <Text style={styles.sectionTitle}>Zorunlu Kanıtlar</Text>
            </View>
            <StatusBadge label="5 / 5 Tamamlandı" tone="green" />
          </View>
          <View style={styles.evidenceGrid}>
            {evidence.map((item) => (
              <EvidenceCard key={item.title} item={item} />
            ))}
          </View>
        </View>
        <SectionHeader icon="attach-outline" title="Ek Kanıtlar" />
        <View style={styles.evidenceActionRow}>
          <EvidenceAction icon="camera-outline" title="Fotoğraf Ekle" tone="blue" />
          <EvidenceAction icon="videocam-outline" title="Video Ekle" tone="purple" />
          <EvidenceAction icon="document-outline" title="Dosya Ekle" tone="green" />
        </View>
        <SectionHeader icon="document-text-outline" title="Notlar" />
        <View style={styles.textAreaWrap}>
          <TextInput
            style={styles.textArea}
            multiline
            maxLength={500}
            placeholder="Notlarınızı buraya yazın..."
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
            <Text style={styles.kicker}>İş Emri</Text>
            <Text style={styles.orderNo}>{order.workOrderNo}</Text>
            <Text style={styles.vehicleTitle}>Araç</Text>
            <Text style={styles.finalVehicle}>{vehicleTitle(order)}</Text>
          </View>
          <ProgressRing percent={progress} size={116} stroke={10} color={liveColors.green} label="Tamamlandı" />
          <StatusBadge label="Teknik Giriş Hazır" tone="green" icon="checkmark-circle-outline" />
        </View>
        <View style={styles.finalStats}>
          <SummaryItem icon="checkmark-circle-outline" label="Modül Tamamlandı" value={String(modules.filter((item) => item.status === 'Tamamlandı').length || modules.length)} tone="green" />
          <SummaryItem icon="alert-circle-outline" label="Eksik / Uyarı" value={String(warned)} tone="orange" />
          <SummaryItem icon="cloud-upload-outline" label="Kanıt Yüklendi" value={String(evidenceCount)} tone="purple" />
          <SummaryItem icon="time-outline" label="Çalışma Süresi" value={elapsedLabel(order)} tone="blue" />
        </View>

        <SectionHeader title="Modüller" action="Tümünü Gör" />
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
            body="Sol arka çamurluk üzerinde lokal boya ölçüm değerleri farklılık göstermektedir. Detaylar ilgili modülde belirtilmiştir."
            badge="Not eklendi"
          />
          <ReviewNote
            icon="reader-outline"
            tone="purple"
            title="Müşteri İçin Özet"
            body="Araç genel durumu iyi seviyededir. Belirtilen uyarı maddeleri dışında önemli bir bulguya rastlanmamıştır."
            badge="Özet hazır"
          />
        </View>
        <View style={styles.readyBanner}>
          <Ionicons name="checkmark" color={liveColors.white} size={24} />
          <View style={styles.flex1}>
            <Text style={styles.readyTitle}>Tüm zorunlu alanlar tamamlandı.</Text>
            <Text style={styles.readyText}>Rapor teknik onaya gönderilmeye hazır.</Text>
          </View>
          <Ionicons name="shield-checkmark-outline" color="rgba(7,148,85,0.28)" size={46} />
        </View>
        <View style={styles.buttonRow}>
          <ActionButton title="Taslak Olarak Kaydet" variant="outline" icon="save-outline" />
          <ActionButton
            title="Raporu Teknik Onaya Gönder"
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
            <Text style={styles.panelTitle}>3 okunmamış bildiriminiz var</Text>
            <Text style={styles.panelSub}>Son güncellenme: 16 Mayıs 2025, 21:56</Text>
          </View>
          <StatusBadge label="Tümünü Okundu İşaretle" tone="blue" icon="checkmark-circle-outline" />
        </View>
        <View style={styles.tabsRow}>
          {[
            ['Tümü', '12'],
            ['İş Emirleri', '5'],
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
            <Text style={styles.profileBranch}>Bursa Küçük Sanayi</Text>
          </View>
          <ActionButton title="Profili Düzenle" variant="outline" icon="create-outline" compact />
        </View>
        <View style={styles.profileStats}>
          <ProfileStat icon="checkmark-circle-outline" title="Bu Ay Tamamlanan" value={String(Math.max(completedOrderCount(mockLiveOrders), metrics.completedTasks || 16))} subtitle="iş emri" tone="green" />
          <ProfileStat icon="briefcase-outline" title="Aktif İşler" value={String(metrics.openOrders || 5)} subtitle="iş emri" tone="blue" />
          <ProfileStat icon="time-outline" title="Ortalama Süre" value="32 dk" subtitle="iş emri başına" tone="orange" />
        </View>
        <View style={styles.settingsCard}>
          <ProfileRow icon="person-outline" title="Hesap Bilgileri" subtitle="Kişisel bilgileriniz ve iletişim" tone="blue" />
          <ProfileRow icon="lock-closed-outline" title="Şifre Değiştir" subtitle="Hesap şifrenizi güncelleyin" tone="purple" />
          <ProfileRow icon="notifications-outline" title="Bildirim Tercihleri" subtitle="Bildirim ayarlarınızı yönetin" tone="orange" />
          <ProfileRow icon="time-outline" title="Vardiya Bilgisi" subtitle={`${technician.shift} • Son senkron: ${lastSync}`} tone="blue" right="Gündüz Vardiyası" />
          <ProfileRow icon="information-circle-outline" title="Uygulama Sürümü" subtitle="Güncel sürüm bilgisi" tone="blue" right="v2.4.1" />
          <ProfileRow icon="help-circle-outline" title="Yardım & Destek" subtitle="Sık sorulan sorular ve destek" tone="blue" />
        </View>
        <Pressable style={styles.logoutRow} onPress={onLogout}>
          <IconBubble icon="log-out-outline" tone="red" />
          <View style={styles.flex1}>
            <Text style={styles.logoutTitle}>Çıkış Yap</Text>
            <Text style={styles.panelSub}>Oturumunuzu sonlandırın</Text>
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
              <Text style={styles.headerLogoSub}>Tarafsız Araç Ekspertizi</Text>
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
      OTOTR<Text style={styles.logoAccent}>✓</Text>
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

function BottomTabs({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs: { key: TabKey; label: string; icon: IconName }[] = [
    { key: 'home', label: 'Ana Sayfa', icon: 'home-outline' },
    { key: 'jobs', label: 'İşlerim', icon: 'clipboard-outline' },
    { key: 'notifications', label: 'Bildirimler', icon: 'notifications-outline' },
    { key: 'profile', label: 'Profil', icon: 'person-outline' },
  ];

  return (
    <View style={styles.bottomTabs}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable key={tab.key} style={styles.tabItem} onPress={() => onChange(tab.key)}>
            <View>
              <Ionicons name={tab.icon} color={isActive ? liveColors.blue : liveColors.white} size={28} />
              {tab.key === 'notifications' ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>3</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            <View style={[styles.tabLine, isActive && styles.tabLineActive]} />
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
        <ProgressRing percent={progress} size={78} stroke={8} color={progress >= 100 ? liveColors.green : liveColors.blue} label={progress >= 100 ? 'Tamamlandı' : 'İlerleme'} />
      </View>
      <View style={styles.featureBottom}>
        <StatusBadge label={progress >= 100 ? 'İş emri tamamlandı' : statusLabel(order.status)} tone={progress >= 100 ? 'green' : 'blue'} icon="checkmark-circle-outline" />
        <View style={styles.rowCenter}>
          <Ionicons name="time-outline" color={liveColors.muted} size={16} />
          <Text style={styles.cardMuted}>Tamamlanma: 16:45</Text>
        </View>
        <View style={styles.smallPrimary}>
          <Text style={styles.smallPrimaryText}>Raporu Görüntüle</Text>
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
      <View style={styles.progressRow}>
        <ProgressBar value={progress} color={color} />
        <Text style={[styles.progressText, { color }]}>{progress}%</Text>
      </View>
      <View style={styles.chipRow}>
        <SmallChip icon="clipboard-outline" text={`${total} Görev`} tone="blue" />
        <SmallChip icon="checkmark-circle-outline" text={`${done} Tamamlandı`} tone="green" />
        <SmallChip icon="alert-circle-outline" text={`${missing} Eksik`} tone={missing ? 'orange' : 'gray'} />
      </View>
      <Ionicons style={styles.cardChevron} name="chevron-forward" color={liveColors.ink} size={24} />
    </Pressable>
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
          <Text style={styles.ownerText}>{module.owner || 'Sahiplenilmemiş'}</Text>
        </View>
        <Ionicons name="chevron-up" color={liveColors.ink} size={22} />
      </View>
      <View style={styles.moduleInfoBox}>
        <Ionicons name="information-circle-outline" color={liveColors.blue} size={20} />
        <Text style={styles.moduleInfoText}>Bu modül üzerinde şu anda çalışılmaktadır. Aynı anda yalnızca 1 teknisyen bu modül üzerinde çalışabilir.</Text>
      </View>
      <View style={styles.progressLabeled}>
        <Text style={styles.ownerText}>İlerleme</Text>
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
        <Text style={styles.cardMuted}>{module.taskTotal} görev • {module.evidenceRequired} kanıt zorunlu</Text>
      </View>
      <StatusBadge label={module.status} tone={statusTone(module.status)} />
      <Text style={styles.ownerSmall}>{module.owner || 'Sahiplenilmemiş'}</Text>
      <ActionButton title={module.status === 'Boşta' || !module.owner ? 'Sahiplen' : 'Detay'} variant="outline" compact />
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
        <Text style={styles.detailModuleTitle}>{module.title.replace('Kontrolü', 'Ekspertizi')}</Text>
        <Text style={styles.cardMuted}>{module.taskDone} / {module.taskTotal} görev</Text>
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
        {(['Orijinal', 'Boyalı', 'Değişen'] as const).map((state) => {
          const active = part.state === state;
          const tone: Tone = state === 'Orijinal' ? 'green' : state === 'Boyalı' ? 'orange' : 'red';
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
        <Text style={styles.uploadText}>Yüklendi</Text>
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
      <Text style={styles.finalModuleTitle}>{module.title.replace('Kontrolü', 'Kontroller')}</Text>
      <Text style={styles.finalModuleMeta}>{module.taskDone || module.taskTotal} / {module.taskTotal} kontrol</Text>
      <StatusBadge label={ok ? 'Tamamlandı' : '1 Uyarı'} tone={ok ? 'green' : 'orange'} />
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
              <Text style={[styles.stepNo, active && styles.stepNoActive]}>{step.done ? '✓' : index + 1}</Text>
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
      <Text style={styles.loadingText}>Canlı sistem işleniyor</Text>
    </View>
  );
}

function getActiveTab(view: ViewKey): TabKey {
  if (view === 'home' || view === 'jobs' || view === 'notifications' || view === 'profile') return view;
  return 'jobs';
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
    const status = progress >= 100 ? 'Tamamlandı' : hasMissing ? 'Eksik Var' : hasAction || index === 0 ? 'Devam Ediyor' : 'Boşta';
    const owner = status === 'Boşta' ? null : index === 5 ? 'Mehmet Usta' : technician.name;

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
  if (normalized === 'COMPLETED' || normalized === 'CLOSED' || normalized === 'APPROVED') return 'Tamamlandı';
  if (normalized === 'MANAGER_REVIEW') return 'Teknik Onayda';
  if (normalized === 'IN_PROGRESS') return 'Teknik Giriş Açık';
  if (normalized === 'OPEN') return 'Açık';
  if (normalized === 'WAITING') return 'Bekliyor';
  return normalized ? normalized.replaceAll('_', ' ') : 'Teknik Giriş Açık';
}

function statusTone(status: string): Tone {
  if (status === 'Tamamlandı') return 'green';
  if (status === 'Eksik Var') return 'orange';
  if (status === 'Devam Ediyor') return 'blue';
  return 'gray';
}

function vehicleTitle(order: LiveWorkOrder) {
  return [order.vehicle.year, order.vehicle.brand || 'Volkswagen', order.vehicle.model || 'Passat'].filter(Boolean).join(' ');
}

function vehicleMeta(order: LiveWorkOrder) {
  return [order.vehicle.fuel || 'Beyaz', order.vehicle.mileage || '34.521 km'].filter(Boolean).join(' • ');
}

function brandInitial(order: LiveWorkOrder) {
  return (order.vehicle.brand || 'OT').slice(0, 2).toUpperCase();
}

function formatPlate(value: string) {
  const plate = value || 'PLAKA YOK';
  return plate.length > 8 && !plate.includes(' ') ? plate.replace(/^(\d{2})([A-Z]+)(.+)$/i, '$1 $2 $3') : plate;
}

function formatDateTime(value: string) {
  if (!value) return '16 Mayıs 2025 16:45';
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
    backgroundColor: liveColors.navy,
  },
  app: {
    flex: 1,
    backgroundColor: liveColors.paper,
  },
  scrollContent: {
    paddingBottom: 128,
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
    left: 14,
    right: 14,
    bottom: 10,
    minHeight: 88,
    borderRadius: 20,
    backgroundColor: liveColors.navy,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 11,
    paddingBottom: 8,
    ...cardShadow,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    color: liveColors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: liveColors.blue,
  },
  tabLine: {
    width: 44,
    height: 3,
    borderRadius: 99,
    backgroundColor: 'transparent',
  },
  tabLineActive: {
    backgroundColor: liveColors.blue,
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
