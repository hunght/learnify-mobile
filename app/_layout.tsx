import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDownloadProcessor } from "../hooks/useDownloadProcessor";

function DownloadProcessor() {
  useDownloadProcessor();
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DownloadProcessor />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1a1a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#16213e",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "LearnifyTube",
          }}
        />
        <Stack.Screen
          name="connect"
          options={{
            title: "Connect to Desktop",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="player/[id]"
          options={{
            title: "Now Playing",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="share"
          options={{
            title: "Share",
            presentation: "modal",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
