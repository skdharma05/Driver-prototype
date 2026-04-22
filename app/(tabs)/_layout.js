import { Tabs } from 'expo-router';
import { Home, ClipboardList, Truck, Banknote, User } from 'lucide-react-native';
import { theme } from '../../src/styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Platform } from 'react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 5);
  
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        height: 60 + bottomPadding,
        paddingBottom: bottomPadding,
        paddingTop: 5,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
      },
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loads"
        options={{
          title: 'Loads',
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'My Trips',
          tabBarIcon: ({ color }) => <Truck size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <Banknote size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loads/[id]"
        options={{
          href: null, // Hide this detail page from tab bar
          headerShown: false, // Hide the default Tabs system header
        }}
      />
    </Tabs>
  );
}
