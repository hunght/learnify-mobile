import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <Text style={styles.icon}>🕐</Text>
        <Text style={styles.title}>Watch History</Text>
        <Text style={styles.description}>
          View your recently watched videos and continue where you left off
        </Text>
        <Text style={styles.comingSoon}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    color: "#a0a0a0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  comingSoon: {
    color: "#e94560",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(233, 69, 96, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
