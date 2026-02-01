import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLibraryStore } from "../stores/library";
import { useDownloadStore } from "../stores/downloads";
import { VideoCard } from "../components/VideoCard";

export default function LibraryScreen() {
  const videos = useLibraryStore((state) => state.videos);
  const downloadQueue = useDownloadStore((state) => state.queue);

  const downloadedVideos = videos.filter((v) => !!v.localPath);
  const activeDownloads = downloadQueue.filter(
    (d) => d.status === "downloading"
  );
  const queuedDownloads = downloadQueue.filter((d) => d.status === "queued");

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>No Videos Yet</Text>
          <Text style={styles.emptyText}>
            Connect to your LearnifyTube desktop app to sync videos
          </Text>
          <Link href="/connect" asChild>
            <Pressable style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect to Desktop</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerText}>
                {downloadedVideos.length} video
                {downloadedVideos.length !== 1 ? "s" : ""} downloaded
              </Text>
              {(activeDownloads.length > 0 || queuedDownloads.length > 0) && (
                <View style={styles.downloadStatus}>
                  {activeDownloads.length > 0 && (
                    <Text style={styles.downloadStatusText}>
                      {activeDownloads.length} downloading
                      {activeDownloads[0] &&
                        ` (${activeDownloads[0].progress}%)`}
                    </Text>
                  )}
                  {queuedDownloads.length > 0 && (
                    <Text style={styles.queuedStatusText}>
                      {queuedDownloads.length} queued
                    </Text>
                  )}
                </View>
              )}
            </View>
            <View style={styles.headerButtons}>
              <Link href="/share" asChild>
                <Pressable style={styles.shareButton}>
                  <Text style={styles.shareButtonText}>Share</Text>
                </Pressable>
              </Link>
              <Link href="/connect" asChild>
                <Pressable style={styles.syncButton}>
                  <Text style={styles.syncButtonText}>Sync</Text>
                </Pressable>
              </Link>
            </View>
          </View>
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <VideoCard video={item} />}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
  },
  headerInfo: {
    flex: 1,
  },
  headerText: {
    color: "#a0a0a0",
    fontSize: 14,
  },
  downloadStatus: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  downloadStatusText: {
    color: "#e94560",
    fontSize: 12,
    fontWeight: "500",
  },
  queuedStatusText: {
    color: "#a0a0a0",
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  shareButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  syncButton: {
    backgroundColor: "#e94560",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    color: "#a0a0a0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: "#e94560",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
