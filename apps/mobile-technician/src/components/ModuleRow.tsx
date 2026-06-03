import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ModuleItem } from '../data/mockData';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { ActionButton } from './ActionButton';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

type Props = {
  item: ModuleItem;
  expanded?: boolean;
  onContinue?: () => void;
};

function badgeVariant(status: string) {
  if (status === 'Tamamlandı') return 'green' as const;
  if (status === 'Eksik Var') return 'orange' as const;
  if (status === 'Boşta') return 'gray' as const;
  return 'blue' as const;
}

export function ModuleRow({ item, expanded, onContinue }: Props) {
  return (
    <View style={[styles.card, expanded && styles.expanded]}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Ionicons name="construct" size={21} color={colors.blue} />
        </View>
        <View style={styles.main}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.owner ?? 'Sahiplenilmemiş'} • {item.tasks} görev • {item.evidence} kanıt</Text>
        </View>
        <StatusBadge label={item.status} variant={badgeVariant(item.status)} />
      </View>
      {expanded ? (
        <>
          <Text style={styles.info}>Bu modül üzerinde şu anda çalışılmaktadır. Aynı anda yalnızca 1 teknisyen bu modül üzerinde çalışabilir.</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>İlerleme</Text>
            <Text style={styles.progressText}>%{item.progress}</Text>
          </View>
          <ProgressBar value={item.progress} color={colors.blue} />
          <View style={styles.actions}>
            <ActionButton title="Detay" variant="outline" style={styles.action} />
            <ActionButton title="Devralma Talebi" variant="ghost" style={styles.action} />
            <ActionButton title="Devam Et" icon="arrow-forward" onPress={onContinue} style={styles.action} />
          </View>
        </>
      ) : (
        <View style={styles.compact}>
          <ProgressBar value={item.progress} color={item.status === 'Tamamlandı' ? colors.green : colors.blue} />
          <ActionButton title={item.owner ? 'Detay' : 'Sahiplen'} variant={item.owner ? 'outline' : 'ghost'} style={styles.compactButton} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 15,
    gap: 12,
    ...shadows.soft,
  },
  expanded: {
    borderWidth: 1,
    borderColor: colors.blueSoft,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  info: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: colors.blueSoft,
    borderRadius: 14,
    padding: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  action: {
    flexGrow: 1,
    minWidth: 110,
  },
  compact: {
    gap: 12,
  },
  compactButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
  },
});
