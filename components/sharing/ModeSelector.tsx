import { View, Text, StyleSheet } from "react-native";
import { TVPressable } from "@/components/tv/TVPressable";
import { colors, radius, spacing, fontSize, fontWeight } from "../../theme";
import { Upload, Download } from "../../theme/icons";

type Mode = "share" | "receive";

interface ModeSelectorProps {
  selected: Mode;
  onSelect: (mode: Mode) => void;
}

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <View style={styles.container}>
      <TVPressable
        style={[styles.option, selected === "share" && styles.optionSelected]}
        onPress={() => onSelect("share")}
      >
        <Upload
          size={32}
          color={selected === "share" ? colors.primary : colors.mutedForeground}
        />
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
      </TVPressable>

      <TVPressable
        style={[
          styles.option,
          selected === "receive" && styles.optionSelected,
        ]}
        onPress={() => onSelect("receive")}
      >
        <Download
          size={32}
          color={
            selected === "receive" ? colors.primary : colors.mutedForeground
          }
        />
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
      </TVPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm + 4,
  },
  option: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  optionDescription: {
    color: colors.mutedForeground,
    fontSize: fontSize.base,
  },
});
