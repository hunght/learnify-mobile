import { Tabs } from "expo-router";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TVPressable } from "@/components/tv/TVPressable";
import { colors } from "../../theme";
import { Home, Layers, Clock, Library, Settings } from "../../theme/icons";

function TVTabBarButton({
  children,
  accessibilityState,
  style,
  ...props
}: BottomTabBarButtonProps) {
  const isSelected = Boolean(accessibilityState?.selected);

  return (
    <TVPressable
      {...props}
      style={({ focused, pressed }) => [
        style,
        styles.tvTabButton,
        isSelected && styles.tvTabButtonSelected,
        focused && styles.tvTabButtonFocused,
        pressed && styles.tvTabButtonPressed,
      ]}
      hasTVPreferredFocus={isSelected}
      disableTVFocusStyle
    >
      {children}
    </TVPressable>
  );
}

export default function TabsLayout() {
  const isTv = Platform.isTV;
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + 8 + tabBarBottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: tabBarBottomPadding,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: isTv ? 13 : 11,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarButton: isTv ? (props) => <TVTabBarButton {...props} /> : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "LearnifyTube",
          tabBarIcon: ({ focused, color }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: "Flashcards",
          tabBarIcon: ({ focused, color }) => (
            <Layers size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused, color }) => (
            <Clock size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "My Lists",
          tabBarIcon: ({ focused, color }) => (
            <Library size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <Settings size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tvTabButton: {
    marginHorizontal: 4,
    borderRadius: 12,
  },
  tvTabButtonSelected: {
    backgroundColor: colors.card,
  },
  tvTabButtonFocused: {
    borderWidth: 2,
    borderColor: colors.ring,
    backgroundColor: colors.cardHover,
    shadowColor: colors.ring,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  tvTabButtonPressed: {
    opacity: 0.92,
  },
});
