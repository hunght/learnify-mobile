import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLibraryStore } from "../../stores/library";
import type { TranscriptSegment } from "../../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const video = useLibraryStore((state) =>
    state.videos.find((v) => v.id === id)
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const transcriptListRef = useRef<FlatList>(null);

  const player = useVideoPlayer(video?.localPath || "", (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener("playingChange", (event) => {
      setIsPlaying(event.isPlaying);
    });

    const timeSubscription = player.addListener(
      "timeUpdate",
      (event) => {
        setCurrentTime(event.currentTime);
      }
    );

    return () => {
      subscription.remove();
      timeSubscription.remove();
    };
  }, [player]);

  const handleSegmentPress = (segment: TranscriptSegment) => {
    if (player) {
      player.currentTime = segment.start;
    }
  };

  const getCurrentSegmentIndex = () => {
    if (!video?.transcript?.segments) return -1;
    return video.transcript.segments.findIndex(
      (seg, i, arr) =>
        currentTime >= seg.start &&
        (i === arr.length - 1 || currentTime < arr[i + 1].start)
    );
  };

  const currentSegmentIndex = getCurrentSegmentIndex();

  // Auto-scroll transcript
  useEffect(() => {
    if (currentSegmentIndex > 0 && transcriptListRef.current) {
      transcriptListRef.current.scrollToIndex({
        index: currentSegmentIndex,
        animated: true,
        viewPosition: 0.3,
      });
    }
  }, [currentSegmentIndex]);

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Video not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </SafeAreaView>

      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
      />

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channel}>{video.channelTitle}</Text>
      </View>

      {video.transcript?.segments && video.transcript.segments.length > 0 ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptHeader}>Transcript</Text>
          <FlatList
            ref={transcriptListRef}
            data={video.transcript.segments}
            keyExtractor={(_, index) => index.toString()}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.segment,
                  index === currentSegmentIndex && styles.segmentActive,
                ]}
                onPress={() => handleSegmentPress(item)}
              >
                <Text style={styles.segmentTime}>
                  {formatTime(item.start)}
                </Text>
                <Text
                  style={[
                    styles.segmentText,
                    index === currentSegmentIndex && styles.segmentTextActive,
                  ]}
                >
                  {item.text}
                </Text>
              </Pressable>
            )}
          />
        </View>
      ) : (
        <View style={styles.noTranscript}>
          <Text style={styles.noTranscriptText}>
            No transcript available for this video
          </Text>
        </View>
      )}
    </View>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  video: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: "#000",
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  channel: {
    color: "#a0a0a0",
    fontSize: 14,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: "#16213e",
  },
  transcriptHeader: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    padding: 12,
    backgroundColor: "#1a1a2e",
  },
  segment: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
  },
  segmentActive: {
    backgroundColor: "#1a1a2e",
  },
  segmentTime: {
    color: "#e94560",
    fontSize: 12,
    fontWeight: "500",
    width: 45,
    marginRight: 12,
  },
  segmentText: {
    flex: 1,
    color: "#a0a0a0",
    fontSize: 14,
    lineHeight: 20,
  },
  segmentTextActive: {
    color: "#fff",
  },
  noTranscript: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noTranscriptText: {
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#e94560",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
});
