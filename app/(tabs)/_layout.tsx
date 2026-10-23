import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { useCopy } from "../../context/LanguageContext";
import { usePalette } from "../../components/Wellness";
// import { HapticTab } from "../../components/haptic-tab";
export default function TabLayout() {
  const { user, authReady } = useApp(),
    c = usePalette(),
    x = useCopy();
  if (!authReady) return <ActivityIndicator />;
  if (!user) return <Redirect href="/login" />;
  const tabs = [
    ["home", x("Home", "首页"), "home-outline"],
    ["calories", x("Diary", "饮食"), "restaurant-outline"],
    ["progress", x("Progress", "进度"), "stats-chart-outline"],
    ["assistant", x("Assistant", "助手"), "sparkles-outline"],
    ["account", x("Profile", "我的"), "person-outline"],
  ] as const;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // tabBarButton: HapticTab,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      {tabs.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Ionicons name={icon} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
