import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { ActionButton } from '../../components/ActionButton';
import { BottomSpacer } from '../../components/BottomSpacer';
import { Screen } from '../../components/Screen';
import { bodyParts } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

type Props = {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
};

const stateColors = {
  Orijinal: colors.blue,
  Boyalı: colors.orange,
  Değişen: colors.red,
} as const;

export function BodyInspectionScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppHeader showBack title="Kaporta Kontrolü" subtitle="16C010935 • Volkswagen Passat" onBack={navigation.goBack} chip={<Text style={styles.userBadge}>Ahmet Usta</Text>} />
      <View style={styles.content}>
        <View style={styles.stepper}>
          {['Kaporta', 'Mekanik', 'Elektrik', 'İç / Dış', 'Test Sürüşü'].map((step, index) => (
            <View style={styles.step} key={step}>
              <View style={[styles.stepCircle, index === 0 && styles.stepActive]}>
                <Text style={[styles.stepNumber, index === 0 && styles.stepNumberActive]}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, index === 0 && styles.stepTextActive]}>{step}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <View style={styles.tableHead}>
            <Text style={[styles.headText, { flex: 1.2 }]}>Parça</Text>
            <Text style={[styles.headText, { flex: 1 }]}>Durum</Text>
            <Text style={[styles.headText, { width: 34 }]}>Not</Text>
          </View>
          {bodyParts.map((item) => (
            <View style={styles.partRow} key={item.part}>
              <Text style={styles.partName}>{item.part}</Text>
              <View style={[styles.statePill, { backgroundColor: `${stateColors[item.state as keyof typeof stateColors]}18` }]}>
                <Text style={[styles.stateText, { color: stateColors[item.state as keyof typeof stateColors] }]}>{item.state}</Text>
              </View>
              <Ionicons name="document-text-outline" size={21} color={colors.textMuted} />
            </View>
          ))}
        </View>
        <View style={styles.measureCard}>
          <View style={styles.measureHead}>
            <Text style={styles.cardTitle}>Ölçüm Girişi</Text>
            <ActionButton title="Mikron Rehberi" variant="ghost" style={styles.guide} />
          </View>
          {bodyParts.map((item) => (
            <View style={styles.measureRow} key={item.part}>
              <Text style={styles.partName}>{item.part}</Text>
              <View style={styles.inputBox}>
                <Text style={styles.micron}>{item.micron} µm</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.sticky}>
        <ActionButton title="Taslak Kaydet" variant="outline" style={styles.stickyButton} />
        <ActionButton title="Devam Et" icon="arrow-forward" onPress={() => navigation.navigate('Evidence')} style={styles.stickyButton} />
      </View>
      <BottomSpacer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  userBadge: {
    alignSelf: 'flex-start',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontWeight: '800',
  },
  content: {
    padding: 18,
    gap: 14,
  },
  stepper: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    ...shadows.soft,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: colors.blue,
  },
  stepNumber: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  stepTextActive: {
    color: colors.blue,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 14,
    ...shadows.card,
  },
  tableHead: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  partRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  partName: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  statePill: {
    minWidth: 86,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  stateText: {
    fontSize: 12,
    fontWeight: '900',
  },
  measureCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 15,
    gap: 10,
    ...shadows.card,
  },
  measureHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  guide: {
    minHeight: 40,
  },
  measureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputBox: {
    width: 94,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micron: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
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
