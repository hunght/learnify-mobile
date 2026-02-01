import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import type { Video } from "../../types";

interface VideoShareListProps {
  videos: Video[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function VideoShareList({
  videos,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: VideoShareListProps) {
  const allSelected = selectedIds.size === videos.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Videos to Share</Text>
        <Pressable
          onPress={allSelected ? onDeselectAll : onSelectAll}
          style={styles.selectAllButton}
        >
          <Text style={styles.selectAllText}>
            {allSelected ? "Deselect All" : "Select All"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.videoItem,
              selectedIds.has(item.id) && styles.videoItemSelected,
            ]}
            onPress={() => onToggle(item.id)}
          >
            <View style={styles.checkbox}>
              {selectedIds.has(item.id) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.videoChannel}>{item.channelTitle}</Text>
              <Text style={styles.videoDuration}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedIds.size} of {videos.length} selected
        </Text>
      </View>
    </View>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectAllText: {
    color: "#e94560",
    fontSize: 14,
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  videoItem: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  videoItemSelected: {
    borderWidth: 2,
    borderColor: "#e94560",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#444",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#e94560",
    fontWeight: "bold",
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  videoChannel: {
    color: "#a0a0a0",
    fontSize: 12,
    marginBottom: 2,
  },
  videoDuration: {
    color: "#666",
    fontSize: 11,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a1a2e",
  },
  selectedCount: {
    color: "#a0a0a0",
    fontSize: 14,
    textAlign: "center",
  },
});
