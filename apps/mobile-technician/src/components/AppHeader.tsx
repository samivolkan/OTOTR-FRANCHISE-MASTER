import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showBack?: boolean;
  rightNotification?: boolean;
  chip?: ReactNode;
  onBack?: () => void;
};

export function AppHeader({ title, subtitle, showLogo = true, showBack, rightNotification = true, chip, onBack }: Props) {
  return (
    <SafeAreaView style={styles.header} edges={['top']}>
      <View style={styles.curveOne} />
      <View style={styles.curveTwo} />
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleWrap}>
          {showLogo ? <Text style={styles.logo}>OTOTR</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightNotification ? (
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
      {chip ? <View style={styles.chipWrap}>{chip}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    ...shadows.soft,
  },
  curveOne: {
    position: 'absolute',
    width: 220,
    height: 140,
    borderRadius: 120,
    right: -70,
    top: -30,
    backgroundColor: 'rgba(20,99,255,0.18)',
  },
  curveTwo: {
    position: 'absolute',
    width: 160,
    height: 110,
    borderRadius: 90,
    left: -40,
    bottom: -45,
    backgroundColor: 'rgba(6,174,212,0.12)',
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  logo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0,
  },
  title: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    marginTop: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  chipWrap: {
    marginTop: 4,
  },
});
