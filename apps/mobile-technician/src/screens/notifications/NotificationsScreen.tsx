import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { ActionButton } from '../../components/ActionButton';
import { BottomSpacer } from '../../components/BottomSpacer';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

const notifications = [
  ['Yeni İş Emri Atandı', 'Yeni', '16:45', '16 CAN 526 plakalı 2022 Volkswagen Golf aracına yeni iş emri atandı.', true],
  ['Eksik Adım Tespit Edildi', 'Uyarı', '15:10', '16 R 0273 numaralı iş emrinde 1 eksik adım tespit edildi.', true],
  ['Devralma Talebi Geldi', 'Bilgi', '14:40', '16 BZ 198 numaralı iş emri için devralma talebi aldınız.', true],
  ['Teknik Onaydan Döndü', 'Kritik', '14:05', '16 R 0273 numaralı iş emri teknik onaydan döndü. İnceleme yapmanız gerekiyor.', false],
  ['Rapor Onaylandı', 'Başarılı', '12:30', '16 E 274 plakalı 2021 Volkswagen Golf aracının raporu onaylandı.', false],
  ['Sistem Bakım Çalışması', 'Sistem', '09:15', '19 Mayıs 2025 Pazar 02:00 - 04:00 saatleri arasında sistem bakım çalışması yapılacaktır.', false],
] as const;

export function NotificationsScreen() {
  return (
    <Screen>
      <AppHeader title="Bildirimler" />
      <View style={styles.content}>
        <View style={styles.summary}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>3 okunmamış bildiriminiz var</Text>
            <Text style={styles.summaryText}>Son güncellenme: 16 Mayıs 2025, 21:56</Text>
          </View>
          <ActionButton title="Tümünü Okundu İşaretle" variant="ghost" style={styles.summaryButton} />
        </View>
        <View style={styles.tabs}>
          {['Tümü 12', 'İş Emirleri 5', 'Eksikler 2', 'Onay 2', 'Sistem 3'].map((tab, index) => (
            <Text key={tab} style={[styles.tab, index === 0 && styles.activeTab]}>{tab}</Text>
          ))}
        </View>
        {notifications.map(([title, kind, time, text, unread]) => (
          <View style={styles.row} key={title}>
            <View style={[styles.dot, { backgroundColor: unread ? colors.blue : colors.border }]} />
            <View style={{ flex: 1, gap: 5 }}>
              <View style={styles.rowHead}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.time}>{time}</Text>
              </View>
              <StatusBadge label={kind} variant={kind === 'Kritik' ? 'red' : kind === 'Başarılı' ? 'green' : kind === 'Uyarı' ? 'orange' : 'blue'} />
              <Text style={styles.message}>{text}</Text>
            </View>
          </View>
        ))}
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
  summary: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    ...shadows.card,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryButton: {
    alignSelf: 'flex-start',
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    color: colors.textMuted,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '900',
  },
  activeTab: {
    color: colors.blue,
    backgroundColor: colors.blueSoft,
  },
  row: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    ...shadows.soft,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
