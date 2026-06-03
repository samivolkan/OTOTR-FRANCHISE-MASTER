import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { ActionButton } from '../../components/ActionButton';
import { BottomSpacer } from '../../components/BottomSpacer';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { user } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

export function ProfileScreen() {
  return (
    <Screen>
      <AppHeader title="Profil" />
      <View style={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.avatarInitials}</Text>
          </View>
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={styles.name}>{user.name}</Text>
            <StatusBadge label={user.role} variant="blue" />
            <Text style={styles.branch}>{user.branch}</Text>
          </View>
          <ActionButton title="Profili Düzenle" variant="ghost" style={styles.editButton} />
        </View>
        <View style={styles.stats}>
          {[
            ['16', 'Bu Ay Tamamlanan', 'iş emri'],
            ['5', 'Aktif İşler', 'iş emri'],
            ['32 dk', 'Ortalama Süre', 'iş emri başına'],
          ].map(([v, title, sub]) => (
            <View style={styles.stat} key={title}>
              <Text style={styles.statValue}>{v}</Text>
              <Text style={styles.statTitle}>{title}</Text>
              <Text style={styles.statSub}>{sub}</Text>
            </View>
          ))}
        </View>
        <View style={styles.list}>
          {[
            ['Hesap Bilgileri', 'person-outline', ''],
            ['Şifre Değiştir', 'key-outline', ''],
            ['Bildirim Tercihleri', 'notifications-outline', ''],
            ['Vardiya Bilgisi', 'time-outline', 'Gündüz Vardiyası 08:00 - 17:00'],
            ['Uygulama Sürümü', 'phone-portrait-outline', 'v2.4.1'],
            ['Yardım & Destek', 'help-circle-outline', ''],
          ].map(([title, icon, value]) => (
            <View style={styles.item} key={title}>
              <View style={styles.itemIcon}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={21} color={colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{title}</Text>
                {value ? <Text style={styles.itemValue}>{value}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          ))}
        </View>
        <View style={styles.logout}>
          <Ionicons name="log-out-outline" size={22} color={colors.red} />
          <View>
            <Text style={styles.logoutTitle}>Çıkış Yap</Text>
            <Text style={styles.itemValue}>Oturumunuzu sonlandırın</Text>
          </View>
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
  profile: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  name: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  branch: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  editButton: {
    minHeight: 42,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stat: {
    flexGrow: 1,
    minWidth: 145,
    backgroundColor: colors.card,
    borderRadius: 19,
    padding: 15,
    ...shadows.soft,
  },
  statValue: {
    color: colors.blue,
    fontSize: 23,
    fontWeight: '900',
  },
  statTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  statSub: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 8,
    ...shadows.soft,
  },
  item: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  itemValue: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.redSoft,
    borderRadius: 20,
    padding: 15,
  },
  logoutTitle: {
    color: colors.red,
    fontSize: 15,
    fontWeight: '900',
  },
});
