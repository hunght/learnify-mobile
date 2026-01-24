import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import type { Video } from "../types";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const isDownloaded = video.status === "downloaded";
  const isDownloading = video.status === "downloading";

  return (
    <Link href={isDownloaded ? `/player/${video.id}` : "#"} asChild>
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
          {isDownloading && (
            <View style={styles.progressOverlay}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${video.downloadProgress || 0}%` },
                ]}
              />
              <Text style={styles.progressText}>
                {video.downloadProgress || 0}%
              </Text>
            </View>
          )}
          {isDownloaded && (
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
        </View>
      </Pressable>
    </Link>
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
});
