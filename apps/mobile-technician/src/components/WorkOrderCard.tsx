import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WorkOrder } from '../data/mockData';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { Plate } from './Plate';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

type Props = {
  item: WorkOrder;
  onPress?: () => void;
};

export function WorkOrderCard({ item, onPress }: Props) {
  const done = item.completed;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.brand}>
          <Ionicons name="car-sport" size={23} color={done ? colors.green : colors.blue} />
        </View>
        <View style={styles.main}>
          <Plate value={item.plate} small />
          <Text style={styles.vehicle}>{item.year} {item.brand} {item.model}</Text>
          <Text style={styles.meta}>{item.color} • {item.km}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
      </View>
      <View style={styles.statusRow}>
        <StatusBadge label={item.status} variant={done ? 'green' : 'blue'} icon={done ? 'check' : 'dot'} />
        <Text style={styles.percent}>%{item.progress}</Text>
      </View>
      <ProgressBar value={item.progress} color={done ? colors.green : colors.blue} />
      <View style={styles.chips}>
        <Text style={styles.chip}>{item.taskTotal} Görev</Text>
        <Text style={styles.chip}>{item.taskDone} Tamamlandı</Text>
        <Text style={[styles.chip, item.missing > 0 && styles.warnChip]}>{item.missing} Eksik</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    gap: 13,
    ...shadows.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    gap: 5,
  },
  vehicle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percent: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: colors.muted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  warnChip: {
    color: colors.orange,
    backgroundColor: colors.orangeSoft,
  },
});
