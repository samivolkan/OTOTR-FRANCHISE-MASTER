import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const variants = {
  blue: [colors.blueSoft, colors.blue],
  green: [colors.greenSoft, colors.green],
  orange: [colors.orangeSoft, colors.orange],
  red: [colors.redSoft, colors.red],
  purple: [colors.purpleSoft, colors.purple],
  gray: [colors.muted, colors.textMuted],
} as const;

type Props = {
  label: string;
  variant?: keyof typeof variants;
  icon?: 'dot' | 'check';
};

export function StatusBadge({ label, variant = 'blue', icon }: Props) {
  const [bg, fg] = variants[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon === 'dot' ? <View style={[styles.dot, { backgroundColor: fg }]} /> : null}
      {icon === 'check' ? <Ionicons name="checkmark-circle" size={14} color={fg} /> : null}
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
