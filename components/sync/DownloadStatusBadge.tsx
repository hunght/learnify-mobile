import { View, Text, StyleSheet } from "react-native";

type DownloadStatus = "completed" | "downloading" | "queued" | "pending" | null;

interface DownloadStatusBadgeProps {
  status: DownloadStatus;
  progress?: number | null;
  showLabel?: boolean;
}

export function DownloadStatusBadge({
  status,
  progress,
  showLabel = true,
}: DownloadStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "#22c55e",
          textColor: "#fff",
          label: "On Server",
          icon: "✓",
        };
      case "downloading":
        return {
          backgroundColor: "#eab308",
          textColor: "#000",
          label: progress != null ? `${progress}%` : "Downloading",
          icon: "↓",
        };
      case "queued":
        return {
          backgroundColor: "#3b82f6",
          textColor: "#fff",
          label: "Queued",
          icon: "⏳",
        };
      case "pending":
        return {
          backgroundColor: "#6b7280",
          textColor: "#fff",
          label: "Pending",
          icon: "○",
        };
      default:
        return {
          backgroundColor: "#374151",
          textColor: "#9ca3af",
          label: "Not Downloaded",
          icon: "○",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.icon, { color: config.textColor }]}>{config.icon}</Text>
      {showLabel && (
        <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  icon: {
    fontSize: 10,
    fontWeight: "bold",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
});
