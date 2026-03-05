import { useState } from "react";
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type TVFocusState = PressableStateCallbackType & { focused: boolean };

type FocusableStyle =
  | StyleProp<ViewStyle>
  | ((state: TVFocusState) => StyleProp<ViewStyle>);

interface TVFocusPressableProps extends Omit<PressableProps, "style"> {
  style?: FocusableStyle;
  focusedStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
}

function resolveStyle(style: FocusableStyle | undefined, state: TVFocusState): StyleProp<ViewStyle> {
  if (typeof style === "function") return style(state);
  return style;
}

export function TVFocusPressable({
  style,
  focusedStyle,
  pressedStyle,
  onFocus,
  onBlur,
  ...props
}: TVFocusPressableProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => {
        const stateWithFocus: TVFocusState = { ...state, focused };
        return [
          resolveStyle(style, stateWithFocus),
          state.pressed && (pressedStyle ?? styles.defaultPressed),
          focused && (focusedStyle ?? styles.defaultFocused),
        ];
      }}
    />
  );
}

const styles = StyleSheet.create({
  defaultPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },
  defaultFocused: {
    borderWidth: 4,
    borderColor: "#ffd93d",
    shadowColor: "#ff8a00",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
    transform: [{ scale: 1.05 }],
  },
});
