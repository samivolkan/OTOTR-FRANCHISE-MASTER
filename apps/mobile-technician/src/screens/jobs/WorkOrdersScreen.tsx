import { StyleSheet, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomSpacer } from '../../components/BottomSpacer';
import { MetricCard } from '../../components/MetricCard';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { WorkOrderCard } from '../../components/WorkOrderCard';
import { user, workOrders } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { todayLabel } from '../../utils/format';

type Props = {
  navigation: { navigate: (screen: string) => void };
};

export function WorkOrdersScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppHeader title="İşlerim" subtitle={`${user.name} / ${user.role}`} />
      <View style={styles.content}>
        <SectionHeader title="İşlerim" subtitle={todayLabel} />
        <View style={styles.metrics}>
          <MetricCard icon="briefcase" title="Aktif İş Emri" value="5" />
          <MetricCard icon="checkmark-done" title="Bugün Tamamlanan" value="8" color={colors.green} softColor={colors.greenSoft} />
          <MetricCard icon="warning" title="Eksik Adım" value="2" color={colors.orange} softColor={colors.orangeSoft} />
        </View>
        {workOrders.map((item) => (
          <WorkOrderCard key={item.id} item={item} onPress={() => navigation.navigate('WorkOrderDetail')} />
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
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
