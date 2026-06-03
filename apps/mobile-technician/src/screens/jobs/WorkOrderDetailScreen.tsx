import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { ActionButton } from '../../components/ActionButton';
import { BottomSpacer } from '../../components/BottomSpacer';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

type Props = {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
};

const modules = [
  ['Kaporta Ekspertizi', '18 / 24 görev', 75],
  ['Motor Ekspertizi', '12 / 15 görev', 80],
  ['Mekanik Kontrol', '10 / 14 görev', 59],
  ['OBD / Beyin Kontrolü', '6 / 8 görev', 100],
  ['Airbag Kontrolü', '4 / 6 görev', 67],
  ['İç & Dış Donanım', '8 / 12 görev', 67],
] as const;

export function WorkOrderDetailScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppHeader showBack title="İş Emri Detayı" onBack={navigation.goBack} />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>İş Emri No</Text>
          <Text style={styles.big}>16C010935</Text>
          <View style={styles.badges}>
            <StatusBadge label="Teknik Giriş Açık" variant="blue" icon="dot" />
            <StatusBadge label="Öncelik: Orta" variant="orange" />
          </View>
          <Text style={styles.vehicle}>2021 Volkswagen Passat</Text>
        </View>
        <View style={styles.vehicleCard}>
          <View style={styles.carBox}>
            <Ionicons name="car-sport" size={58} color={colors.blue} />
          </View>
          <View style={{ flex: 1, gap: 7 }}>
            {[
              ['Paket / Yıl', 'Business / 2021'],
              ['Kilometre', '68.450 km'],
              ['Yakıt', 'Dizel'],
              ['Vites', 'Otomatik'],
              ['Müşteri Randevusu', '17 May 2024 14:30'],
            ].map(([k, v]) => (
              <View style={styles.infoRow} key={k}>
                <Text style={styles.infoKey}>{k}</Text>
                <Text style={styles.infoValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.stats}>
          {[
            ['%62', 'Toplam Tamamlanma'],
            ['01:45', 'Geçen Süre'],
            ['5', 'Açık Eksik Madde'],
          ].map(([v, l]) => (
            <View style={styles.stat} key={l}>
              <Text style={styles.statValue}>{v}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
        <SectionHeader title="Modül Durumu" />
        {modules.map(([title, detail, progress]) => (
          <View style={styles.module} key={title}>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>{title}</Text>
              <Text style={styles.infoKey}>{detail}</Text>
            </View>
            <Text style={styles.modulePercent}>%{progress}</Text>
            <View style={styles.moduleBar}>
              <ProgressBar value={progress} color={progress === 100 ? colors.green : colors.blue} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.sticky}>
        <ActionButton title="Eksikleri Gör" variant="outline" style={styles.stickyButton} />
        <ActionButton title="Göreve Başla" icon="arrow-forward" onPress={() => navigation.navigate('TaskModules')} style={styles.stickyButton} />
      </View>
      <BottomSpacer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    gap: 8,
    ...shadows.card,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  big: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  vehicleCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    ...shadows.soft,
  },
  carBox: {
    width: 112,
    borderRadius: 20,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoKey: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    flexShrink: 1,
    textAlign: 'right',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.navy,
    borderRadius: 18,
    padding: 13,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  module: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    ...shadows.soft,
  },
  moduleTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  modulePercent: {
    position: 'absolute',
    right: 14,
    top: 15,
    color: colors.text,
    fontWeight: '900',
  },
  moduleBar: {
    marginRight: 0,
  },
  sticky: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 94,
    flexDirection: 'row',
    gap: 10,
  },
  stickyButton: {
    flex: 1,
  },
});
