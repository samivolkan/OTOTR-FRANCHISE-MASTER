import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomSpacer } from '../../components/BottomSpacer';
import { ModuleRow } from '../../components/ModuleRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { modules } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

type Props = {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
};

export function TaskModulesScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppHeader showBack title="Görev Modülleri" subtitle="Aracınıza ait modül görevlerini yönetin." onBack={navigation.goBack} />
      <View style={styles.content}>
        <View style={styles.orderChip}>
          <Text style={styles.orderText}>16C010935 • 2021 Volkswagen Passat</Text>
          <StatusBadge label="Teknik Giriş Açık" variant="blue" />
        </View>
        <View style={styles.summary}>
          {[
            ['6', 'Toplam Modül'],
            ['2', 'Tamamlanan'],
            ['1', 'Eksik / Uyarı'],
            ['16 Mayıs', 'Son Güncelleme'],
          ].map(([v, l]) => (
            <View style={styles.summaryItem} key={l}>
              <Text style={styles.summaryValue}>{v}</Text>
              <Text style={styles.summaryLabel}>{l}</Text>
            </View>
          ))}
        </View>
        <SectionHeader title="Modüller" />
        {modules.map((item, index) => (
          <ModuleRow key={item.id} item={item} expanded={index === 0} onContinue={() => navigation.navigate('BodyInspection')} />
        ))}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>Modüller yukarıdan aşağıya sırayla tamamlanmalıdır.</Text>
        </View>
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
  orderChip: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    gap: 9,
    ...shadows.soft,
  },
  orderText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    flexGrow: 1,
    minWidth: 145,
    backgroundColor: colors.navy,
    borderRadius: 18,
    padding: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  footerNote: {
    backgroundColor: colors.orangeSoft,
    borderRadius: 16,
    padding: 13,
  },
  footerText: {
    color: colors.orange,
    fontSize: 13,
    fontWeight: '800',
  },
});
