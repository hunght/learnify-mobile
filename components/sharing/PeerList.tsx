import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import type { DiscoveredPeer } from "../../types";

interface PeerListProps {
  peers: DiscoveredPeer[];
  isScanning: boolean;
  selectedPeer: DiscoveredPeer | null;
  onSelectPeer: (peer: DiscoveredPeer) => void;
}

export function PeerList({
  peers,
  isScanning,
  selectedPeer,
  onSelectPeer,
}: PeerListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Devices</Text>
        {isScanning && (
          <View style={styles.scanningRow}>
            <ActivityIndicator color="#e94560" size="small" />
            <Text style={styles.scanningText}>Scanning...</Text>
          </View>
        )}
      </View>

      {peers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyText}>
            {isScanning
              ? "Looking for nearby devices sharing videos..."
              : "No devices found. Make sure another device is sharing videos on the same WiFi network."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={peers}
          keyExtractor={(item) => item.name}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.peerItem,
                selectedPeer?.name === item.name && styles.peerItemSelected,
              ]}
              onPress={() => onSelectPeer(item)}
            >
              <View style={styles.peerIcon}>
                <Text style={styles.peerIconText}>📱</Text>
              </View>
              <View style={styles.peerInfo}>
                <Text style={styles.peerName}>{item.name}</Text>
                <Text style={styles.peerMeta}>
                  {item.videoCount} video{item.videoCount !== 1 ? "s" : ""} •{" "}
                  {item.host}:{item.port}
                </Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scanningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scanningText: {
    color: "#e94560",
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#a0a0a0",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  peerItem: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  peerItemSelected: {
    borderWidth: 2,
    borderColor: "#e94560",
  },
  peerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2d2d44",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  peerIconText: {
    fontSize: 24,
  },
  peerInfo: {
    flex: 1,
  },
  peerName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  peerMeta: {
    color: "#a0a0a0",
    fontSize: 12,
  },
  arrow: {
    paddingLeft: 8,
  },
  arrowText: {
    color: "#666",
    fontSize: 24,
    fontWeight: "300",
  },
});
