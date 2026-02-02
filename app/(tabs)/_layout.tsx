import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a1a2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: "#0d1b2a",
          borderTopColor: "#1b2838",
          borderTopWidth: 1,
          paddingTop: 8,
          height: 85,
        },
        tabBarActiveTintColor: "#e94560",
        tabBarInactiveTintColor: "#5c6b7a",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "LearnifyTube",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: "Flashcards",
          tabBarIcon: ({ focused }) => <TabIcon icon="🎴" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => <TabIcon icon="🕐" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "My Lists",
          tabBarIcon: ({ focused }) => <TabIcon icon="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
