import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { TVFocusPressable } from "./TVFocusPressable";

export const TV_GRID_CARD_WIDTH = 372;
export const TV_GRID_CARD_HEIGHT = 184;

interface TVCardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  hasTVPreferredFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TVCard({ title, subtitle, onPress, hasTVPreferredFocus, style }: TVCardProps) {
  return (
    <TVFocusPressable
      style={({ focused }) => [styles.card, focused && styles.cardFocused, style]}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
    >
      <View style={styles.cardInner}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TVFocusPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: TV_GRID_CARD_WIDTH,
    height: TV_GRID_CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: "#2d7ff9",
    borderWidth: 2,
    borderColor: "#8ec5ff",
  },
  cardFocused: {
    backgroundColor: "#3992ff",
    borderColor: "#ffd93d",
  },
  cardInner: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    gap: 8,
  },
  title: {
    color: "#fffef2",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#e8f4ff",
    fontSize: 19,
    fontWeight: "600",
  },
});
