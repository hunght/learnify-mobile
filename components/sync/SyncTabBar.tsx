import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import type { BrowseTab } from "../../types";

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
    backgroundColor: "#09090b",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#27272a",
  },
  tabText: {
    color: "#71717a",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fafafa",
  },
});
