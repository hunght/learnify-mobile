import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router, type Href } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLibraryStore } from "../../../stores/library";
import { useConnectionStore } from "../../../stores/connection";
import { usePlaybackStore } from "../../../stores/playback";
import { useTVHistoryStore } from "../../../stores/tvHistory";
import { api } from "../../../services/api";
import { getVideoLocalPath } from "../../../services/downloader";
import { TVFocusPressable } from "../../../components/tv/TVFocusPressable";
import type { ServerDownloadStatus } from "../../../types";

type PrefetchState = "idle" | "loading" | "ready" | "failed";
type SourcePrepareState = "idle" | "preparing" | "ready" | "failed";

const SERVER_DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000;
const SERVER_DOWNLOAD_POLL_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    throw abortError;
  }
}

async function probeVideoFileAvailability(
  serverUrl: string,
  videoId: string,
  signal?: AbortSignal
): Promise<boolean> {
  const fileUrl = api.getVideoFileUrl(serverUrl, videoId);

  try {
    const head = await fetch(fileUrl, {
      method: "HEAD",
      signal,
    });
    if (head.ok) {
      return true;
    }
  } catch {
    // Continue to range probe
  }

  try {
    const probe = await fetch(fileUrl, {
      signal,
      headers: {
        Range: "bytes=0-2048",
      },
    });

    if (!probe.ok) {
      return false;
    }

    await probe.arrayBuffer();
    return true;
  } catch {
    return false;
  }
}

async function ensureServerVideoReady(
  serverUrl: string,
  videoId: string,
  options?: {
    signal?: AbortSignal;
    timeoutMs?: number;
    onStatus?: (status: ServerDownloadStatus) => void;
  }
): Promise<void> {
  const signal = options?.signal;
  const timeoutMs = options?.timeoutMs ?? SERVER_DOWNLOAD_TIMEOUT_MS;
  const onStatus = options?.onStatus;

  throwIfAborted(signal);

  const alreadyReady = await probeVideoFileAvailability(serverUrl, videoId, signal);
  if (alreadyReady) {
    onStatus?.({
      videoId,
      status: "completed",
      progress: 100,
      error: null,
    });
    return;
  }

  const response = await api.requestServerDownload(serverUrl, { videoId });
  if (!response.success && !response.status) {
    throw new Error(response.message || "Server refused download request");
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    throwIfAborted(signal);

    const status = await api.getServerDownloadStatus(serverUrl, videoId);
    onStatus?.(status);

    if (status.status === "failed") {
      throw new Error(status.error || "Server download failed");
    }

    if (status.status === "completed") {
      const ready = await probeVideoFileAvailability(serverUrl, videoId, signal);
      if (ready) {
        return;
      }
    }

    await sleep(SERVER_DOWNLOAD_POLL_MS);
  }

  throw new Error("Server download timed out");
}

export default function TVPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const libraryVideo = useLibraryStore((state) => state.videos.find((item) => item.id === id));
  const serverUrl = useConnectionStore((state) => state.serverUrl);

  const playlistId = usePlaybackStore((state) => state.playlistId);
  const playlistVideos = usePlaybackStore((state) => state.playlistVideos);
  const currentIndex = usePlaybackStore((state) => state.currentIndex);
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const streamServerUrl = usePlaybackStore((state) => state.streamServerUrl);
  const updateRecentPlaylistProgress = useTVHistoryStore(
    (state) => state.updateRecentPlaylistProgress
  );

  const [prefetchState, setPrefetchState] = useState<PrefetchState>("idle");
  const [prepareState, setPrepareState] = useState<SourcePrepareState>("idle");
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [prepareProgress, setPrepareProgress] = useState<number | null>(null);
  const [prepareRetryVersion, setPrepareRetryVersion] = useState(0);
  const navigationLockVideoIdRef = useRef<string | null>(null);
  const prefetchedNextVideoIdRef = useRef<string | null>(null);

  const playlistIndex = useMemo(() => {
    if (!id) return -1;
    return playlistVideos.findIndex((item) => item.id === id);
  }, [id, playlistVideos]);

  const playlistVideo = playlistIndex >= 0 ? playlistVideos[playlistIndex] : undefined;
  const video = playlistVideo ?? libraryVideo;

  const effectiveServerUrl = streamServerUrl ?? serverUrl;

  const localPath = useMemo(() => {
    if (!id) return null;
    return playlistVideo?.localPath ?? getVideoLocalPath(id) ?? libraryVideo?.localPath ?? null;
  }, [id, playlistVideo?.localPath, libraryVideo?.localPath]);

  useEffect(() => {
    if (!id) {
      setPrepareState("failed");
      setPrepareError("Video ID is missing");
      setPrepareProgress(null);
      return;
    }

    if (localPath) {
      setPrepareState("ready");
      setPrepareError(null);
      setPrepareProgress(100);
      return;
    }

    if (!effectiveServerUrl) {
      setPrepareState("failed");
      setPrepareError("Video is not available offline");
      setPrepareProgress(null);
      return;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setPrepareState("preparing");
    setPrepareError(null);
    setPrepareProgress(null);

    const prepare = async () => {
      try {
        await ensureServerVideoReady(effectiveServerUrl, id, {
          signal: abortController.signal,
          onStatus: (status) => {
            if (cancelled) return;
            setPrepareProgress(status.progress ?? null);
          },
        });

        if (!cancelled) {
          setPrepareState("ready");
          setPrepareError(null);
          setPrepareProgress(100);
        }
      } catch (error) {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        setPrepareState("failed");
        setPrepareError(getErrorMessage(error));
        setPrepareProgress(null);
      }
    };

    void prepare();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [id, localPath, effectiveServerUrl, prepareRetryVersion]);

  const source = useMemo(() => {
    if (!id) return "";
    if (localPath) return localPath;
    if (!effectiveServerUrl) return "";
    if (prepareState !== "ready") return "";
    return api.getVideoFileUrl(effectiveServerUrl, id);
  }, [effectiveServerUrl, id, localPath, prepareState]);

  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
    instance.play();
  });

  useEffect(() => {
    if (playlistIndex >= 0 && playlistIndex !== currentIndex) {
      setCurrentIndex(playlistIndex);
    }
  }, [playlistIndex, currentIndex, setCurrentIndex]);

  useEffect(() => {
    if (!playlistId || playlistIndex < 0) return;
    updateRecentPlaylistProgress({
      playlistId,
      currentIndex: playlistIndex,
      currentVideoId: playlistVideos[playlistIndex]?.id ?? null,
    });
  }, [
    playlistId,
    playlistIndex,
    playlistVideos,
    updateRecentPlaylistProgress,
  ]);

  const hasPlaylistContext = playlistIndex >= 0;
  const hasPrevious = hasPlaylistContext && playlistIndex > 0;
  const hasNext = hasPlaylistContext && playlistIndex < playlistVideos.length - 1;
  const nextVideo = hasNext ? playlistVideos[playlistIndex + 1] : null;

  const goToIndex = useCallback(
    (targetIndex: number) => {
      const target = playlistVideos[targetIndex];
      if (!target) return;
      navigationLockVideoIdRef.current = id ?? null;
      setCurrentIndex(targetIndex);
      router.replace(`/(tv)/player/${target.id}` as Href);
    },
    [id, playlistVideos, setCurrentIndex]
  );

  useEffect(() => {
    if (!player) return;

    const endSubscription = player.addListener("playToEnd", () => {
      if (id && navigationLockVideoIdRef.current === id) {
        return;
      }
      if (hasNext) {
        goToIndex(playlistIndex + 1);
      }
    });

    return () => {
      endSubscription.remove();
    };
  }, [player, hasNext, goToIndex, playlistIndex]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    const warmNextVideo = async () => {
      if (!nextVideo) {
        prefetchedNextVideoIdRef.current = null;
        setPrefetchState("idle");
        return;
      }

      const nextLocalPath = nextVideo.localPath ?? getVideoLocalPath(nextVideo.id);
      if (nextLocalPath) {
        prefetchedNextVideoIdRef.current = nextVideo.id;
        setPrefetchState("ready");
        return;
      }

      if (!effectiveServerUrl) {
        setPrefetchState("idle");
        return;
      }

      if (prefetchedNextVideoIdRef.current === nextVideo.id) {
        setPrefetchState("ready");
        return;
      }

      setPrefetchState("loading");

      try {
        await ensureServerVideoReady(effectiveServerUrl, nextVideo.id, {
          signal: abortController.signal,
        });

        if (!cancelled) {
          prefetchedNextVideoIdRef.current = nextVideo.id;
          setPrefetchState("ready");
        }
      } catch (error) {
        if (!cancelled && !abortController.signal.aborted) {
          console.log("[TV Player] Next video prefetch failed:", error);
          prefetchedNextVideoIdRef.current = null;
          setPrefetchState("failed");
        }
      }
    };

    void warmNextVideo();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [effectiveServerUrl, nextVideo?.id, nextVideo?.localPath]);

  if (!id || !source) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <TVFocusPressable onPress={() => router.back()} style={styles.backButton} hasTVPreferredFocus>
          <Text style={styles.backButtonText}>Back</Text>
        </TVFocusPressable>
        <View style={styles.centered}>
          {prepareState === "preparing" ? (
            <>
              <Text style={styles.errorText}>Preparing video on desktop...</Text>
              <Text style={styles.channel}>
                {prepareProgress !== null
                  ? `Download progress ${Math.max(0, Math.round(prepareProgress))}%`
                  : "Please wait"}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.errorText}>
                {prepareError ?? "Video source is not available"}
              </Text>
              {id && effectiveServerUrl ? (
                <TVFocusPressable
                  style={styles.retryPrepareButton}
                  onPress={() => setPrepareRetryVersion((prev) => prev + 1)}
                >
                  <Text style={styles.retryPrepareButtonText}>Retry Download</Text>
                </TVFocusPressable>
              ) : null}
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TVFocusPressable style={styles.backButton} onPress={() => router.back()} hasTVPreferredFocus>
          <Text style={styles.backButtonText}>Back</Text>
        </TVFocusPressable>
        <View style={styles.navRow}>
          <TVFocusPressable
            style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
            onPress={() => goToIndex(playlistIndex - 1)}
            disabled={!hasPrevious}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TVFocusPressable>
          <TVFocusPressable
            style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
            onPress={() => goToIndex(playlistIndex + 1)}
            disabled={!hasNext}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TVFocusPressable>
        </View>
      </View>

      <VideoView player={player} style={styles.video} />

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={2}>
          {video?.title ?? "Now Playing"}
        </Text>
        <Text style={styles.channel}>{video?.channelTitle ?? "LearnifyTube"}</Text>
        <Text style={styles.badge}>{localPath ? "Offline" : "Streaming"}</Text>
        {nextVideo ? (
          <Text style={styles.nextLabel} numberOfLines={1}>
            {prefetchState === "loading"
              ? `Loading up next: ${nextVideo.title}`
              : prefetchState === "ready"
                ? `Up next ready: ${nextVideo.title}`
                : `Up next: ${nextVideo.title}`}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#132447",
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ffd93d",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#fffef2",
    fontSize: 20,
    fontWeight: "900",
  },
  navButton: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ffd93d",
    backgroundColor: "#ff8a00",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: "#fffef2",
    fontSize: 19,
    fontWeight: "900",
  },
  video: {
    width: "100%",
    height: 560,
    borderRadius: 20,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  meta: {
    marginTop: 16,
    gap: 8,
  },
  title: {
    color: "#fffef2",
    fontSize: 34,
    fontWeight: "900",
  },
  channel: {
    color: "#e5f2ff",
    fontSize: 22,
    fontWeight: "700",
  },
  badge: {
    color: "#ffe48f",
    fontSize: 18,
    fontWeight: "900",
  },
  nextLabel: {
    color: "#b3f8d7",
    fontSize: 18,
    fontWeight: "800",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#fecaca",
    fontSize: 22,
    fontWeight: "700",
  },
  retryPrepareButton: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ffd93d",
    backgroundColor: "#2d7ff9",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryPrepareButtonText: {
    color: "#fffef2",
    fontSize: 20,
    fontWeight: "900",
  },
});
