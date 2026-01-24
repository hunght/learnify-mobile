import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConnectionStore } from "../stores/connection";
import { api } from "../services/api";
import { useLibraryStore } from "../stores/library";
import type { RemoteVideo } from "../types";

export default function ConnectScreen() {
  const [ipAddress, setIpAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [remoteVideos, setRemoteVideos] = useState<RemoteVideo[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  const { setServerUrl, serverUrl } = useConnectionStore();
  const { addVideo, updateVideo } = useLibraryStore();

  const handleConnect = async () => {
    if (!ipAddress.trim()) {
      Alert.alert("Error", "Please enter an IP address");
      return;
    }

    const url = `http://${ipAddress.trim()}:53318`;
    setIsConnecting(true);

    try {
      const info = await api.getInfo(url);
      console.log("Connected to:", info.name);

      setServerUrl(url);
      const videosResponse = await api.getVideos(url);
      setRemoteVideos(videosResponse.videos);
    } catch (error) {
      Alert.alert(
        "Connection Failed",
        "Could not connect to desktop. Make sure:\n\n1. Desktop app is running\n2. Sync server is enabled\n3. Both devices are on the same WiFi"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const handleDownloadSelected = async () => {
    if (selectedVideos.size === 0) {
      Alert.alert("No Videos Selected", "Please select videos to download");
      return;
    }

    // Add selected videos to library
    for (const videoId of selectedVideos) {
      const video = remoteVideos.find((v) => v.id === videoId);
      if (video) {
        addVideo({
          id: video.id,
          title: video.title,
          channelTitle: video.channelTitle,
          duration: video.duration,
          thumbnailUrl: video.thumbnailUrl,
          status: "pending",
        });
      }
    }

    // Navigate back and start downloads
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        {remoteVideos.length === 0 ? (
          <>
            <Text style={styles.instruction}>
              Enter the IP address shown in your LearnifyTube desktop app:
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="192.168.1.100"
                placeholderTextColor="#666"
                value={ipAddress}
                onChangeText={setIpAddress}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Pressable
              style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
              onPress={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.connectButtonText}>Connect</Text>
              )}
            </Pressable>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>How to find IP address:</Text>
              <Text style={styles.helpText}>
                1. Open LearnifyTube on your computer{"\n"}
                2. Go to Settings &gt; Sync{"\n"}
                3. Enable "Allow mobile sync"{"\n"}
                4. Copy the IP address shown
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Available Videos ({remoteVideos.length})
            </Text>
            <FlatList
              data={remoteVideos}
              keyExtractor={(item) => item.id}
              style={styles.videoList}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.videoItem,
                    selectedVideos.has(item.id) && styles.videoItemSelected,
                  ]}
                  onPress={() => toggleVideoSelection(item.id)}
                >
                  <View style={styles.checkbox}>
                    {selectedVideos.has(item.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.videoChannel}>{item.channelTitle}</Text>
                    <Text style={styles.videoMeta}>
                      {formatDuration(item.duration)} • {formatFileSize(item.fileSize)}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
            <View style={styles.footer}>
              <Text style={styles.selectedCount}>
                {selectedVideos.size} selected
              </Text>
              <Pressable
                style={[
                  styles.downloadButton,
                  selectedVideos.size === 0 && styles.downloadButtonDisabled,
                ]}
                onPress={handleDownloadSelected}
                disabled={selectedVideos.size === 0}
              >
                <Text style={styles.downloadButtonText}>Download Selected</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    color: "#a0a0a0",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#2d2d44",
  },
  connectButton: {
    backgroundColor: "#e94560",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  helpSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
  },
  helpTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  helpText: {
    color: "#a0a0a0",
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  videoList: {
    flex: 1,
  },
  videoItem: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  videoItemSelected: {
    borderWidth: 2,
    borderColor: "#e94560",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#444",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#e94560",
    fontWeight: "bold",
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  videoChannel: {
    color: "#a0a0a0",
    fontSize: 12,
    marginBottom: 2,
  },
  videoMeta: {
    color: "#666",
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1a1a2e",
  },
  selectedCount: {
    color: "#a0a0a0",
    fontSize: 14,
  },
  downloadButton: {
    backgroundColor: "#e94560",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
