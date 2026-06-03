import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { ActionButton } from '../../components/ActionButton';
import { BottomSpacer } from '../../components/BottomSpacer';
import { ProgressRing } from '../../components/ProgressRing';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

type Props = {
  navigation: { goBack: () => void };
};

export function FinalReviewScreen({ navigation }: Props) {
  const rows = [
    ['Dış Kontroller', '18 / 18 kontrol', 'Tamamlandı'],
    ['İç Kontroller', '16 / 16 kontrol', 'Tamamlandı'],
    ['Mekanik Kontroller', '22 / 22 kontrol', 'Tamamlandı'],
    ['Elektrik & Elektronik', '20 / 20 kontrol', 'Tamamlandı'],
    ['Alt & Yürüyen Aksam', '17 / 19 kontrol', '1 Uyarı'],
    ['Test Sürüşü', '8 / 8 kontrol', 'Tamamlandı'],
  ];
  return (
    <Screen>
      <AppHeader showBack title="Final Kontrol & Tamamlama" onBack={navigation.goBack} />
      <View style={styles.content}>
        <View style={styles.topCard}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.label}>İş Emri 16C010935</Text>
            <Text style={styles.vehicle}>2021 Volkswagen Passat</Text>
            <StatusBadge label="Teknik Giriş Hazır" variant="green" icon="check" />
          </View>
          <ProgressRing percent={98} size={104} color={colors.green} label="Tamamlandı" />
        </View>
        <View style={styles.stats}>
          {[
            ['6', 'Modül Tamamlandı'],
            ['1', 'Eksik / Uyarı'],
            ['42', 'Kanıt Yüklendi'],
            ['03:45', 'Çalışma Süresi'],
          ].map(([v, l]) => (
            <View style={styles.stat} key={l}>
              <Text style={styles.statValue}>{v}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
        <SectionHeader title="Modül Özeti" />
        {rows.map(([title, count, state]) => (
          <View style={styles.moduleRow} key={title}>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>{title}</Text>
              <Text style={styles.label}>{count}</Text>
            </View>
            <StatusBadge label={state} variant={state === 'Tamamlandı' ? 'green' : 'orange'} icon={state === 'Tamamlandı' ? 'check' : 'dot'} />
          </View>
        ))}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Teknik Not</Text>
          <Text style={styles.noteText}>Sol arka çamurluk üzerinde lokal boya ölçüm değerleri farklılık göstermektedir. Detaylar ilgili modülde belirtilmiştir.</Text>
          <StatusBadge label="Not eklendi" variant="purple" />
        </View>
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Müşteri İçin Özet</Text>
          <Text style={styles.noteText}>Araç genel durumu iyi seviyededir. Belirtilen uyarı maddeleri dışında önemli bir bulguya rastlanmamıştır.</Text>
          <StatusBadge label="Özet hazır" variant="green" />
        </View>
        <View style={styles.ready}>
          <Text style={styles.readyText}>Tüm zorunlu alanlar tamamlandı. Rapor teknik onaya gönderilmeye hazır.</Text>
        </View>
        <ActionButton title="Taslak Olarak Kaydet" variant="outline" />
        <ActionButton title="Raporu Teknik Onaya Gönder" icon="send" onPress={() => Alert.alert('Rapor teknik onaya gönderildi.')} />
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
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    ...shadows.card,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stat: {
    flexGrow: 1,
    minWidth: 145,
    backgroundColor: colors.navy,
    borderRadius: 18,
    padding: 14,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
  },
  moduleRow: {
    backgroundColor: colors.card,
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    gap: 9,
    ...shadows.soft,
  },
  noteTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  noteText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  ready: {
    backgroundColor: colors.greenSoft,
    borderRadius: 18,
    padding: 14,
  },
  readyText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
});
