import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import type { BrowseTab } from "../../types";
import { colors, radius, spacing, fontSize, fontWeight } from "../../theme";

interface SyncTabBarProps {
  activeTab: BrowseTab;
  onTabChange: (tab: BrowseTab) => void;
}

export function SyncTabBar({ activeTab, onTabChange }: SyncTabBarProps) {
  const tabs: { key: BrowseTab; label: string }[] = [
    { key: "mylists", label: "My Lists" },
    { key: "channels", label: "Channels" },
    { key: "playlists", label: "Playlists" },
    { key: "subscriptions", label: "Subscriptions" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabChange(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm + 4,
    gap: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: colors.muted,
  },
  tabText: {
    color: colors.textTertiary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  activeTabText: {
    color: colors.foreground,
  },
});
