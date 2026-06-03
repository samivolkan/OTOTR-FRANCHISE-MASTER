import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { ActionButton } from '../../components/ActionButton';
import { BottomSpacer } from '../../components/BottomSpacer';
import { MetricCard } from '../../components/MetricCard';
import { Plate } from '../../components/Plate';
import { ProgressRing } from '../../components/ProgressRing';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { todayLabel } from '../../utils/format';

type Props = {
  navigation: { navigate: (screen: string, params?: { screen?: string }) => void };
};

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppHeader title="Ana Sayfa" subtitle="Merhaba Ahmet Usta • Bugün harika işler çıkaralım." />
      <View style={styles.sheet}>
        <SectionHeader title="Günlük Özet" subtitle={todayLabel} />
        <View style={styles.metrics}>
          <MetricCard icon="briefcase" title="Aktif İş Emri" value="5" subtitle="devam eden" />
          <MetricCard icon="checkmark-done" title="Bugün Tamamlanan" value="8" subtitle="iş emri" color={colors.green} softColor={colors.greenSoft} />
          <MetricCard icon="warning" title="Eksik Adım" value="2" subtitle="iş emrinde" color={colors.orange} softColor={colors.orangeSoft} />
          <MetricCard icon="shield-checkmark" title="Teknik Onayda" value="3" subtitle="iş emri" color={colors.purple} softColor={colors.purpleSoft} />
        </View>
        <SectionHeader title="Öne Çıkan Aktif İş Emri" />
        <View style={styles.featured}>
          <View style={styles.featuredTop}>
            <View style={{ flex: 1, gap: 7 }}>
              <Plate value="16 E 274" />
              <Text style={styles.vehicle}>2021 Volkswagen Golf</Text>
              <Text style={styles.meta}>Beyaz • 34.521 km</Text>
              <StatusBadge label="İş emri tamamlandı" variant="green" icon="check" />
              <Text style={styles.time}>Tamamlanma: 16:45</Text>
            </View>
            <ProgressRing percent={100} color={colors.green} label="Tamamlandı" />
          </View>
          <ActionButton title="Raporu Görüntüle" icon="document-text-outline" variant="ghost" />
        </View>
        <SectionHeader title="Bugünkü Plan" />
        {[
          ['09:30', '16 CAN 526', '2022 Volkswagen Golf Randevu'],
          ['11:00', '16 R 0273', '2022 Volkswagen Passat Randevu'],
          ['14:00', '16 BZ 198', '2021 Skoda Octavia Randevu'],
        ].map((item) => (
          <View style={styles.planRow} key={item[0]}>
            <Text style={styles.planTime}>{item[0]}</Text>
            <View style={styles.planDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.planPlate}>{item[1]}</Text>
              <Text style={styles.meta}>{item[2]}</Text>
            </View>
          </View>
        ))}
        <SectionHeader title="Hızlı İşlemler" />
        <View style={styles.quickGrid}>
          {[
            ['İşlerim', 'briefcase-outline'],
            ['Eksikler', 'alert-circle-outline'],
            ['Kanıtlar', 'camera-outline'],
            ['Rapor Önizle', 'reader-outline'],
          ].map(([title, icon]) => (
            <TouchableOpacity
              key={title}
              style={styles.quick}
              activeOpacity={0.85}
              onPress={title === 'İşlerim' ? () => navigation.navigate('Jobs', { screen: 'WorkOrders' }) : undefined}
            >
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={23} color={colors.blue} />
              <Text style={styles.quickText}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <SectionHeader title="Son Aktiviteler" />
        {[
          ['16 E 274 - 2021 Volkswagen Golf tamamlandı.', '16:45'],
          ['16C010935 numaralı iş emrinde 1 eksik adım kaldı.', '15:10'],
          ['16 R 0273 - 2022 Volkswagen Passat raporu oluşturuldu.', '14:05'],
        ].map((item) => (
          <View style={styles.activity} key={item[0]}>
            <View style={styles.activityIcon}><Ionicons name="pulse" size={16} color={colors.blue} /></View>
            <Text style={styles.activityText}>{item[0]}</Text>
            <Text style={styles.activityTime}>{item[1]}</Text>
          </View>
        ))}
      </View>
      <BottomSpacer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginTop: -12,
    padding: 18,
    gap: 16,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featured: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    ...shadows.card,
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  planRow: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadows.soft,
  },
  planTime: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '900',
    width: 48,
  },
  planDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue,
  },
  planPlate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quick: {
    flexGrow: 1,
    minWidth: 145,
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.soft,
  },
  quickText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
  },
  activityText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  activityTime: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
});
