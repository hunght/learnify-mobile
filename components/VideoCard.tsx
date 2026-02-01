import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import type { Video } from "../types";
import { useDownloadStore } from "../stores/downloads";
import { downloadManager } from "../services/downloadManager";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const download = useDownloadStore((state) =>
    state.queue.find((d) => d.videoId === video.id)
  );

  const isDownloaded = !!video.localPath;
  const isDownloading = download?.status === "downloading";
  const isQueued = download?.status === "queued";
  const isFailed = download?.status === "failed";

  const handleCancel = () => {
    downloadManager.cancel(video.id);
  };

  const handleRetry = () => {
    downloadManager.retry(video.id);
  };

  const content = (
    <Pressable
      style={[styles.container, !isDownloaded && styles.containerDisabled]}
      disabled={!isDownloaded}
    >
      <View style={styles.thumbnailContainer}>
        {video.thumbnailUrl ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailIcon}>🎬</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(video.duration)}
          </Text>
        </View>
        {isQueued && (
          <View style={styles.pendingOverlay}>
            <Text style={styles.pendingText}>Queued</Text>
          </View>
        )}
        {isDownloading && (
          <View style={styles.progressOverlay}>
            <View
              style={[
                styles.progressBar,
                { width: `${download?.progress || 0}%` },
              ]}
            />
            <Text style={styles.progressText}>{download?.progress || 0}%</Text>
          </View>
        )}
        {isFailed && (
          <View style={styles.failedBadge}>
            <Text style={styles.failedIcon}>!</Text>
          </View>
        )}
        {isDownloaded && !download && (
          <View style={styles.downloadedBadge}>
            <Text style={styles.downloadedIcon}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channel} numberOfLines={1}>
          {video.channelTitle}
        </Text>
        {(isDownloading || isQueued) && (
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        )}
        {isFailed && (
          <View style={styles.failedActions}>
            <Text style={styles.errorText} numberOfLines={1}>
              {download?.error || "Failed"}
            </Text>
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );

  if (isDownloaded) {
    return (
      <Link href={`/player/${video.id}`} asChild>
        {content}
      </Link>
    );
  }

  return content;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    maxWidth: "50%",
  },
  containerDisabled: {
    opacity: 0.6,
  },
  thumbnailContainer: {
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1a1a2e",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#e94560",
  },
  progressText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    zIndex: 1,
  },
  pendingOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingText: {
    color: "#a0a0a0",
    fontSize: 10,
    fontWeight: "500",
  },
  failedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  failedIcon: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  downloadedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadedIcon: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  info: {
    paddingTop: 8,
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  channel: {
    color: "#a0a0a0",
    fontSize: 11,
  },
  cancelButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "500",
  },
  failedActions: {
    marginTop: 4,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 9,
    marginBottom: 4,
  },
  retryButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#3b82f6",
    fontSize: 10,
    fontWeight: "500",
  },
});
