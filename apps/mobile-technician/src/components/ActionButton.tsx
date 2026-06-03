import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
};

export function ActionButton({ title, onPress, variant = 'primary', icon, style }: Props) {
  const isSolid = variant === 'primary' || variant === 'danger';
  const color = variant === 'danger' ? colors.red : colors.blue;
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'ghost' && styles.ghost,
        variant === 'outline' && { backgroundColor: '#fff', borderColor: color, borderWidth: 1 },
        isSolid && { backgroundColor: color },
        style,
      ]}
    >
      <Text style={[styles.text, { color: isSolid ? '#fff' : color }]}>{title}</Text>
      {icon ? <Ionicons name={icon} size={18} color={isSolid ? '#fff' : color} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ghost: {
    backgroundColor: colors.blueSoft,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
});
