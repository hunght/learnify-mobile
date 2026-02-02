import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import type { RemoteMyList } from "../../types";

interface MyListCardProps {
  myList: RemoteMyList;
  onPress: () => void;
}

export function MyListCard({ myList, onPress }: MyListCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        {myList.thumbnailUrl ? (
          <Image
            source={{ uri: myList.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.placeholderIcon}>+</Text>
          </View>
        )}
        {myList.itemCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{myList.itemCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {myList.name}
        </Text>
        <Text style={styles.subtitle}>
          {myList.itemCount} item{myList.itemCount !== 1 ? "s" : ""}
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
    backgroundColor: "#3b82f6",
  },
  placeholderIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
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
  subtitle: {
    color: "#888",
    fontSize: 13,
  },
});
