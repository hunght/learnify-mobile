import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDownloadProcessor } from "../hooks/useDownloadProcessor";
import { useDatabase } from "../hooks/useDatabase";
import { useLibraryStore } from "../stores/library";

function DownloadProcessor() {
  useDownloadProcessor();
  return null;
}

function DatabaseInitializer({ children }: { children: React.ReactNode }) {
  const { isReady, error } = useDatabase();
  const loadVideos = useLibraryStore((state) => state.loadVideos);
  const isLoaded = useLibraryStore((state) => state.isLoaded);

  useEffect(() => {
    if (isReady && !isLoaded) {
      loadVideos();
    }
  }, [isReady, isLoaded, loadVideos]);

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#16213e",
  },
  loadingText: {
    marginTop: 16,
    color: "#a0a0a0",
    fontSize: 16,
  },
  errorText: {
    color: "#e94560",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorDetail: {
    color: "#a0a0a0",
    fontSize: 14,
    marginTop: 8,
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseInitializer>
        <DownloadProcessor />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#16213e",
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="player/[id]"
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="share"
            options={{
              title: "Share",
              headerShown: true,
              presentation: "modal",
              headerStyle: {
                backgroundColor: "#1a1a2e",
              },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="connect"
            options={{
              title: "Sync Videos",
              headerShown: true,
              presentation: "modal",
              headerStyle: {
                backgroundColor: "#1a1a2e",
              },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="sync"
            options={{
              title: "Browse Server",
              headerShown: true,
              presentation: "modal",
              headerStyle: {
                backgroundColor: "#1a1a2e",
              },
              headerTintColor: "#fff",
            }}
          />
        </Stack>
      </DatabaseInitializer>
    </SafeAreaProvider>
  );
}
