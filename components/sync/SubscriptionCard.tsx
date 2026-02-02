import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import type { RemoteSubscription } from "../../types";

interface SubscriptionCardProps {
  subscription: RemoteSubscription;
  onPress: () => void;
}

export function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        {subscription.thumbnailUrl ? (
          <Image
            source={{ uri: subscription.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.placeholderText}>
              {subscription.channelTitle.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {subscription.channelTitle}
        </Text>
        <Text style={styles.subtitle}>
          {subscription.videoCount} video{subscription.videoCount !== 1 ? "s" : ""}
        </Text>
      </View>
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    backgroundColor: "#9333ea",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    color: "#888",
    fontSize: 13,
  },
});
