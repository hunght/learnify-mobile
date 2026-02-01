import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import type { PeerVideo, TransferProgress, DiscoveredPeer } from "../../types";

interface PeerVideoListProps {
  peer: DiscoveredPeer;
  videos: PeerVideo[];
  isLoading: boolean;
  selectedIds: Set<string>;
  transfers: TransferProgress[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onDownload: () => void;
}

export function PeerVideoList({
  peer,
  videos,
  isLoading,
  selectedIds,
  transfers,
  onToggle,
  onBack,
  onDownload,
}: PeerVideoListProps) {
  const hasActiveTransfers = transfers.some(
    (t) => t.status === "pending" || t.status === "downloading"
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.peerName}>{peer.name}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#e94560" size="large" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No videos available from this device</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => {
              const transfer = transfers.find((t) => t.videoId === item.id);
              const isTransferring =
                transfer?.status === "pending" ||
                transfer?.status === "downloading";
              const isCompleted = transfer?.status === "completed";

              return (
                <Pressable
                  style={[
                    styles.videoItem,
                    selectedIds.has(item.id) && styles.videoItemSelected,
                    isCompleted && styles.videoItemCompleted,
                  ]}
                  onPress={() => !isTransferring && !isCompleted && onToggle(item.id)}
                  disabled={isTransferring || isCompleted}
                >
                  <View style={styles.checkbox}>
                    {isCompleted ? (
                      <Text style={styles.completedMark}>✓</Text>
                    ) : selectedIds.has(item.id) ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null}
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.videoChannel}>{item.channelTitle}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.videoDuration}>
                        {formatDuration(item.duration)}
                      </Text>
                      {item.hasTranscript && (
                        <Text style={styles.transcriptBadge}>Transcript</Text>
                      )}
                    </View>
                    {transfer && transfer.status !== "completed" && (
                      <View style={styles.progressContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${transfer.progress}%` },
                          ]}
                        />
                        <Text style={styles.progressText}>
                          {transfer.status === "pending"
                            ? "Waiting..."
                            : transfer.status === "failed"
                            ? "Failed"
                            : `${transfer.progress}%`}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            }}
          />

          <View style={styles.footer}>
            <Text style={styles.selectedCount}>
              {selectedIds.size} selected
            </Text>
            <Pressable
              style={[
                styles.downloadButton,
                (selectedIds.size === 0 || hasActiveTransfers) &&
                  styles.downloadButtonDisabled,
              ]}
              onPress={onDownload}
              disabled={selectedIds.size === 0 || hasActiveTransfers}
            >
              {hasActiveTransfers ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.downloadButtonText}>Download Selected</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    color: "#e94560",
    fontSize: 16,
    fontWeight: "500",
  },
  peerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#a0a0a0",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#a0a0a0",
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  videoItem: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  videoItemSelected: {
    borderWidth: 2,
    borderColor: "#e94560",
  },
  videoItemCompleted: {
    opacity: 0.6,
    borderWidth: 2,
    borderColor: "#4ade80",
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
  completedMark: {
    color: "#4ade80",
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
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  videoDuration: {
    color: "#666",
    fontSize: 11,
  },
  transcriptBadge: {
    color: "#4ade80",
    fontSize: 10,
    backgroundColor: "#1a2e1a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressContainer: {
    height: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#e94560",
  },
  progressText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    zIndex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
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
    minWidth: 140,
    alignItems: "center",
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
