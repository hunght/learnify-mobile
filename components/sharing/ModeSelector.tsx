import { View, Text, StyleSheet, Pressable } from "react-native";

type Mode = "share" | "receive";

interface ModeSelectorProps {
  selected: Mode;
  onSelect: (mode: Mode) => void;
}

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.option, selected === "share" && styles.optionSelected]}
        onPress={() => onSelect("share")}
      >
        <Text style={styles.optionIcon}>📤</Text>
        <Text
          style={[
            styles.optionText,
            selected === "share" && styles.optionTextSelected,
          ]}
        >
          Share My Videos
        </Text>
        <Text style={styles.optionDescription}>
          Let nearby devices download your videos
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.option,
          selected === "receive" && styles.optionSelected,
        ]}
        onPress={() => onSelect("receive")}
      >
        <Text style={styles.optionIcon}>📥</Text>
        <Text
          style={[
            styles.optionText,
            selected === "receive" && styles.optionTextSelected,
          ]}
        >
          Receive Videos
        </Text>
        <Text style={styles.optionDescription}>
          Download videos from nearby devices
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    borderColor: "#e94560",
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionTextSelected: {
    color: "#e94560",
  },
  optionDescription: {
    color: "#a0a0a0",
    fontSize: 14,
  },
});
