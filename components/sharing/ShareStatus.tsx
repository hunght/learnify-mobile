import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";

interface ShareStatusProps {
  isSharing: boolean;
  videoCount: number;
  port: number | null;
  onStop: () => void;
}

export function ShareStatus({
  isSharing,
  videoCount,
  port,
  onStop,
}: ShareStatusProps) {
  if (!isSharing) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <ActivityIndicator color="#4ade80" size="small" />
        <Text style={styles.statusText}>Sharing Active</Text>
      </View>

      <Text style={styles.infoText}>
        Sharing {videoCount} video{videoCount !== 1 ? "s" : ""} on port {port}
      </Text>

      <Text style={styles.helpText}>
        Other devices on this WiFi network can now discover and download your
        shared videos.
      </Text>

      <Pressable style={styles.stopButton} onPress={onStop}>
        <Text style={styles.stopButtonText}>Stop Sharing</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a2e1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2d4a2d",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  helpText: {
    color: "#a0a0a0",
    fontSize: 13,
    marginBottom: 16,
  },
  stopButton: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
