import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import type { RemoteVideoWithStatus } from "../../types";
import { DownloadStatusBadge } from "./DownloadStatusBadge";

interface VideoListItemProps {
  video: RemoteVideoWithStatus;
  isSelected: boolean;
  isSyncedToMobile: boolean;
  onPress: () => void;
  onSyncPress?: () => void;
  onPlayPress?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoListItem({
  video,
  isSelected,
  isSyncedToMobile,
  onPress,
  onSyncPress,
  onPlayPress,
}: VideoListItemProps) {
  const canSync = video.downloadStatus === "completed" && !isSyncedToMobile;
  // Can play if downloaded on server OR synced to mobile
  const canPlay = video.downloadStatus === "completed" || isSyncedToMobile;

  return (
    <Pressable
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
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
            <Text style={styles.placeholderIcon}>🎬</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
        {isSyncedToMobile && (
          <View style={styles.syncedBadge}>
            <Text style={styles.syncedIcon}>✓</Text>
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
        <View style={styles.statusRow}>
          <DownloadStatusBadge
            status={video.downloadStatus}
            progress={video.downloadProgress}
          />
          {canPlay && onPlayPress && (
            <Pressable style={styles.playButton} onPress={onPlayPress}>
              <Text style={styles.playButtonText}>
                {isSyncedToMobile ? "Play" : "Stream"}
              </Text>
            </Pressable>
          )}
          {canSync && onSyncPress && (
            <Pressable style={styles.syncButton} onPress={onSyncPress}>
              <Text style={styles.syncButtonText}>Sync</Text>
            </Pressable>
          )}
        </View>
      </View>

      {isSelected && (
        <View style={styles.checkbox}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#1f1f3a",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#2a2a5a",
    borderWidth: 1,
    borderColor: "#e94560",
  },
  thumbnailContainer: {
    width: 100,
    height: 56,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#2a2a4e",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 24,
  },
  durationBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  syncedBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
  },
  syncedIcon: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  channel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  syncButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e94560",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  checkIcon: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
