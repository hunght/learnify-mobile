import { View, Text, FlatList, ActivityIndicator, Pressable, Image, StyleSheet } from "react-native";
import type { RemoteFavorite } from "../../types";
import { DownloadStatusBadge } from "./DownloadStatusBadge";

interface FavoritesListProps {
  favorites: RemoteFavorite[];
  isLoading: boolean;
  error: string | null;
  onVideoPress: (favorite: RemoteFavorite) => void;
  onPlaylistPress: (favorite: RemoteFavorite) => void;
  onRefresh: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function FavoriteItem({
  favorite,
  onPress,
}: {
  favorite: RemoteFavorite;
  onPress: () => void;
}) {
  if (favorite.entityType === "video" && favorite.video) {
    const video = favorite.video;
    return (
      <Pressable style={styles.itemContainer} onPress={onPress}>
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
        </View>
        <View style={styles.info}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>Video</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {video.channelTitle}
          </Text>
          <DownloadStatusBadge
            status={video.downloadStatus}
            progress={video.downloadProgress}
          />
        </View>
      </Pressable>
    );
  }

  if (
    (favorite.entityType === "channel_playlist" ||
      favorite.entityType === "custom_playlist") &&
    favorite.playlist
  ) {
    const playlist = favorite.playlist;
    return (
      <Pressable style={styles.itemContainer} onPress={onPress}>
        <View style={styles.thumbnailContainer}>
          {playlist.thumbnailUrl ? (
            <Image
              source={{ uri: playlist.thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Text style={styles.placeholderIcon}>
                {playlist.type === "custom" ? "📋" : "📁"}
              </Text>
            </View>
          )}
          {(playlist.itemCount ?? 0) > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{playlist.itemCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <View style={[styles.typeTag, styles.playlistTag]}>
            <Text style={styles.typeText}>Playlist</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {playlist.title}
          </Text>
          <Text style={styles.subtitle}>
            {playlist.downloadedCount}/{playlist.itemCount ?? 0} downloaded
          </Text>
        </View>
      </Pressable>
    );
  }

  // Unknown type or missing data
  return null;
}

export function FavoritesList({
  favorites,
  isLoading,
  error,
  onVideoPress,
  onPlaylistPress,
  onRefresh,
}: FavoritesListProps) {
  if (isLoading && favorites.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load favorites</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No favorites found</Text>
        <Text style={styles.emptySubtext}>
          Mark videos or playlists as favorites in the desktop app
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FavoriteItem
          favorite={item}
          onPress={() =>
            item.entityType === "video"
              ? onVideoPress(item)
              : onPlaylistPress(item)
          }
        />
      )}
      contentContainerStyle={styles.list}
      refreshing={isLoading}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: "#e94560",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorDetail: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#1f1f3a",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    alignItems: "center",
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
  typeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#e94560",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  playlistTag: {
    backgroundColor: "#3b82f6",
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  subtitle: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
});
