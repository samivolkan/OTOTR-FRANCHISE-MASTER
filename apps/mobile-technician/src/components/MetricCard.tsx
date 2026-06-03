import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  softColor?: string;
};

export function MetricCard({ icon, title, value, subtitle, color = colors.blue, softColor = colors.blueSoft }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: softColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.card,
    ...shadows.card,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
});
