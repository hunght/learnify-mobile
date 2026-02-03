import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getSavedPlaylistWithItems } from "../../db/repositories/playlists";
import type { SavedPlaylistWithItems } from "../../db/repositories/playlists";

export default function SavedPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<SavedPlaylistWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getSavedPlaylistWithItems(id);
      setPlaylist(data ?? null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Playlist not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const downloadedCount = playlist.items.filter((i) => i.isDownloaded).length;
  const totalCount = playlist.items.length;

  const handleVideoPress = (item: SavedPlaylistWithItems["items"][0]) => {
    if (item.isDownloaded) {
      router.push(`/player/${item.videoId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
          <Text style={styles.headerBackIcon}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {playlist.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {downloadedCount}/{totalCount} available offline
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(downloadedCount / totalCount) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Video list */}
      <FlatList
        data={playlist.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.videoItem, !item.isDownloaded && styles.videoItemDisabled]}
            onPress={() => handleVideoPress(item)}
            disabled={!item.isDownloaded}
          >
            <Text style={styles.videoIndex}>{index + 1}</Text>
            <View style={styles.videoThumbnailContainer}>
              {item.thumbnailUrl ? (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.videoThumbnail, styles.thumbnailPlaceholder]}>
                  <Text style={styles.thumbnailPlaceholderText}>
                    {item.title.charAt(0)}
                  </Text>
                </View>
              )}
              {!item.isDownloaded && (
                <View style={styles.unavailableOverlay}>
                  <Text style={styles.unavailableText}>Not downloaded</Text>
                </View>
              )}
            </View>
            <View style={styles.videoInfo}>
              <Text
                style={[styles.videoTitle, !item.isDownloaded && styles.videoTitleDisabled]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text style={styles.videoChannel}>{item.channelTitle}</Text>
              <Text style={styles.videoDuration}>
                {formatDuration(item.duration)}
              </Text>
            </View>
            {item.isDownloaded && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>✓</Text>
              </View>
            )}
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    color: "#fafafa",
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#27272a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fafafa",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerBackIcon: {
    color: "#fafafa",
    fontSize: 18,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: "#fafafa",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#71717a",
    fontSize: 13,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#27272a",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 2,
  },
  list: {
    padding: 16,
  },
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  videoItemDisabled: {
    opacity: 0.6,
  },
  videoIndex: {
    color: "#71717a",
    fontSize: 14,
    fontWeight: "600",
    width: 24,
    textAlign: "center",
  },
  videoThumbnailContainer: {
    width: 80,
    height: 45,
    borderRadius: 6,
    overflow: "hidden",
    marginLeft: 8,
    backgroundColor: "#27272a",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6366f1",
  },
  thumbnailPlaceholderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  videoTitle: {
    color: "#fafafa",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  videoTitleDisabled: {
    color: "#71717a",
  },
  videoChannel: {
    color: "#71717a",
    fontSize: 12,
    marginBottom: 2,
  },
  videoDuration: {
    color: "#52525b",
    fontSize: 11,
  },
  availableBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  availableBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
