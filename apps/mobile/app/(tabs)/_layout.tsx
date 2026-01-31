import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Home, Users, Calendar, Bell, User } from 'lucide-react-native';

// SVGアイコンコンポーネント
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const color = focused ? '#1e3a8a' : '#9ca3af';
  const size = 24;
  const strokeWidth = focused ? 2.5 : 2;

  const icons: Record<string, React.ReactNode> = {
    home: <Home size={size} color={color} strokeWidth={strokeWidth} />,
    members: <Users size={size} color={color} strokeWidth={strokeWidth} />,
    events: <Calendar size={size} color={color} strokeWidth={strokeWidth} />,
    notifications: <Bell size={size} color={color} strokeWidth={strokeWidth} />,
    mypage: <User size={size} color={color} strokeWidth={strokeWidth} />,
  };

  return (
    <View style={styles.iconContainer}>
      {icons[name]}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e3a8a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: '会員名簿',
          tabBarIcon: ({ focused }) => <TabIcon name="members" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'イベント',
          tabBarIcon: ({ focused }) => <TabIcon name="events" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'お知らせ',
          tabBarIcon: ({ focused }) => <TabIcon name="notifications" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: 'マイページ',
          tabBarIcon: ({ focused }) => <TabIcon name="mypage" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
});
