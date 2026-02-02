import { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import type { RemotePlaylist } from "../../types";
import { api } from "../../services/api";

interface PlaylistCardProps {
  playlist: RemotePlaylist;
  serverUrl?: string;
  isFavorited?: boolean;
  onPress: () => void;
  onSavePress?: () => void;
}

export function PlaylistCard({
  playlist,
  serverUrl,
  isFavorited = false,
  onPress,
  onSavePress,
}: PlaylistCardProps) {
  const itemCount = playlist.itemCount ?? 0;
  const [imageError, setImageError] = useState(false);

  // Determine the thumbnail URL to use
  const getThumbnailUrl = () => {
    if (playlist.thumbnailUrl) {
      return playlist.thumbnailUrl;
    }
    // Fall back to constructing URL from server if available
    if (serverUrl && playlist.type === "channel") {
      return api.getPlaylistThumbnailUrl(serverUrl, playlist.playlistId);
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();
  const showImage = thumbnailUrl && !imageError;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        {showImage ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.placeholderIcon}>
              {playlist.type === "custom" ? "📋" : "📁"}
            </Text>
          </View>
        )}
        {itemCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{itemCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {playlist.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.type}>
            {playlist.type === "custom" ? "Custom" : "Channel"}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.downloaded}>
            {playlist.downloadedCount}/{itemCount} downloaded
          </Text>
        </View>
      </View>
      {onSavePress && (
        <Pressable style={styles.saveButton} onPress={onSavePress}>
          <Text style={styles.saveIcon}>{isFavorited ? "❤️" : "🤍"}</Text>
        </Pressable>
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
    marginVertical: 6,
    alignItems: "center",
  },
  thumbnailContainer: {
    width: 80,
    height: 45,
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
    fontSize: 20,
  },
  countBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  type: {
    color: "#e94560",
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    color: "#666",
    marginHorizontal: 6,
  },
  downloaded: {
    color: "#888",
    fontSize: 12,
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  saveIcon: {
    fontSize: 20,
  },
});
