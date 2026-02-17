import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Link } from "expo-router";
import type { Video } from "../types";
import { useDownloadStore } from "../stores/downloads";
import { downloadManager } from "../services/downloadManager";
import { videoExistsLocally } from "../services/downloader";
import { colors, radius, spacing, fontSize, fontWeight } from "../theme";
import { Check, AlertCircle, Film } from "../theme/icons";

interface VideoCardProps {
  video: Video;
  style?: StyleProp<ViewStyle>;
}

export function VideoCard({ video, style }: VideoCardProps) {
  const download = useDownloadStore((state) =>
    state.queue.find((d) => d.videoId === video.id)
  );

  const isDownloaded = videoExistsLocally(video.id);
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
      style={StyleSheet.flatten([
        styles.container,
        !isDownloaded && styles.containerDisabled,
        style,
      ])}
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
            <Film size={32} color={colors.mutedForeground} />
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
            <AlertCircle size={12} color={colors.foreground} />
          </View>
        )}
        {isDownloaded && !download && (
          <View style={styles.downloadedBadge}>
            <Check size={12} color={colors.foreground} strokeWidth={3} />
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
    margin: spacing.sm,
    maxWidth: "50%",
  },
  containerDisabled: {
    opacity: 0.6,
  },
  thumbnailContainer: {
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: colors.overlay,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  durationText: {
    color: colors.foreground,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  progressText: {
    color: colors.foreground,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    zIndex: 1,
  },
  pendingOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingText: {
    color: colors.mutedForeground,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  failedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.destructive,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    paddingTop: spacing.sm,
  },
  title: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  channel: {
    color: colors.mutedForeground,
    fontSize: 11,
  },
  cancelButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: `${colors.destructive}33`,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  cancelButtonText: {
    color: colors.destructive,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  failedActions: {
    marginTop: 4,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 9,
    marginBottom: 4,
  },
  retryButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: `${colors.primary}33`,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
