import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BodyInspectionScreen } from '../../screens/jobs/BodyInspectionScreen';
import { EvidenceScreen } from '../../screens/jobs/EvidenceScreen';
import { FinalReviewScreen } from '../../screens/jobs/FinalReviewScreen';
import { TaskModulesScreen } from '../../screens/jobs/TaskModulesScreen';
import { WorkOrderDetailScreen } from '../../screens/jobs/WorkOrderDetailScreen';
import { WorkOrdersScreen } from '../../screens/jobs/WorkOrdersScreen';
import { JobsStackParamList } from './types';

const Stack = createNativeStackNavigator<JobsStackParamList>();

export function JobsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkOrders" component={WorkOrdersScreen} />
      <Stack.Screen name="WorkOrderDetail" component={WorkOrderDetailScreen} />
      <Stack.Screen name="TaskModules" component={TaskModulesScreen} />
      <Stack.Screen name="BodyInspection" component={BodyInspectionScreen} />
      <Stack.Screen name="Evidence" component={EvidenceScreen} />
      <Stack.Screen name="FinalReview" component={FinalReviewScreen} />
    </Stack.Navigator>
  );
}
