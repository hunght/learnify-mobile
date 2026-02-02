import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import type { RemoteChannel } from "../../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

interface ChannelCardProps {
  channel: RemoteChannel;
  onPress: () => void;
}

function formatLastUpdated(dateStr?: string | null) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function getPlaceholderColor(title: string) {
  const colors = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#ec4899", // pink
    "#f43f5e", // rose
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#3b82f6", // blue
  ];
  const index =
    title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

export function ChannelCard({ channel, onPress }: ChannelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const lastUpdated = formatLastUpdated(channel.lastUpdatedAt);
  const placeholderColor = getPlaceholderColor(channel.channelTitle);

  const hasValidUrl = channel.thumbnailUrl && channel.thumbnailUrl.length > 0;
  const showImage = hasValidUrl && !imageError;
  const showPlaceholder = !hasValidUrl || imageError || !imageLoaded;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.thumbnailContainer}>
        {/* Always render placeholder behind image */}
        {showPlaceholder && (
          <View
            style={[
              styles.thumbnail,
              styles.thumbnailPlaceholder,
              { backgroundColor: placeholderColor },
            ]}
          >
            {hasValidUrl && !imageError && !imageLoaded ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.placeholderText}>
                {channel.channelTitle.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        )}

        {/* Overlay image on top when it loads */}
        {showImage && (
          <Image
            source={{ uri: channel.thumbnailUrl! }}
            style={[styles.thumbnail, styles.absoluteFill]}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {channel.channelTitle}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.videoCount}>
            {channel.videoCount} video{channel.videoCount !== 1 ? "s" : ""}
          </Text>
          {lastUpdated && (
            <>
              <View style={styles.dot} />
              <Text style={styles.lastUpdated}>{lastUpdated}</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  pressed: {
    backgroundColor: "#27272a",
    transform: [{ scale: 0.98 }],
  },
  thumbnailContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#27272a",
    overflow: "hidden",
    marginBottom: 12,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  info: {
    alignItems: "center",
  },
  title: {
    color: "#fafafa",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 4,
    textAlign: "center",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoCount: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#52525b",
    marginHorizontal: 6,
  },
  lastUpdated: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "500",
  },
});
