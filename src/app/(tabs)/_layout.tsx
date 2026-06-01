import { Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { TabBarIcon } from '@/components/navigation/tab-bar-icon';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function TabsLayout() {
  const { user, initialized } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (initialized && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
          borderTopColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="index" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="komi-send"
        options={{
          title: 'KomiSend',
          tabBarLabel: 'Send',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="komi-send" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="komi-sol"
        options={{
          title: 'KomiSol',
          tabBarLabel: 'Solutions',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="komi-sol" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="komi-marche"
        options={{
          title: 'KomiMarché',
          tabBarLabel: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="komi-marche" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="komi-learn"
        options={{
          title: 'KomiLearn',
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="komi-learn" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="komi-voix"
        options={{
          title: 'KomiVoix',
          tabBarLabel: 'Voice',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="komi-voix" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="profile" focused={focused} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
