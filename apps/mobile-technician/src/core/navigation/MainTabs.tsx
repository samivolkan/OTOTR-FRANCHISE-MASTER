import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { HomeScreen } from '../../screens/home/HomeScreen';
import { NotificationsScreen } from '../../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { colors } from '../../theme/colors';
import { JobsStack } from './JobsStack';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Jobs: 'briefcase',
  Notifications: 'notifications',
  Profile: 'person-circle',
};

const labels: Record<keyof MainTabParamList, string> = {
  Home: 'Ana Sayfa',
  Jobs: 'İşlerim',
  Notifications: 'Bildirimler',
  Profile: 'Profil',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          const routeName = route.name as keyof MainTabParamList;
          return (
            <View style={styles.item}>
              <Ionicons name={tabIcons[routeName]} size={23} color={focused ? colors.blue : 'rgba(255,255,255,0.72)'} />
              {routeName === 'Notifications' ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              ) : null}
              <Text style={[styles.label, focused && styles.activeLabel]}>{labels[routeName]}</Text>
              <View style={[styles.line, focused && styles.activeLine]} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Jobs" component={JobsStack} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 72,
    borderRadius: 28,
    backgroundColor: colors.navy,
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: 8,
    elevation: 12,
  },
  item: {
    width: 78,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '800',
  },
  activeLabel: {
    color: '#fff',
  },
  line: {
    width: 20,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'transparent',
    marginTop: 2,
  },
  activeLine: {
    backgroundColor: colors.blue,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 19,
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
    fontWeight: '900',
  },
});
