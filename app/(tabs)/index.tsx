import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLibraryStore } from "../../stores/library";
import { useDownloadStore } from "../../stores/downloads";
import { useConnectionStore } from "../../stores/connection";
import { useSyncStore } from "../../stores/sync";
import { usePlaybackStore } from "../../stores/playback";
import { savePlaylist } from "../../db/repositories/playlists";
import {
  SyncTabBar,
  ChannelList,
  PlaylistList,
  VideoListItem,
  SubscriptionList,
  MyListsList,
} from "../../components/sync";
import type {
  RemoteChannel,
  RemotePlaylist,
  RemoteVideoWithStatus,
  RemoteSubscription,
  RemoteMyList,
} from "../../types";
import type { StreamingVideo } from "../../stores/playback";

export default function HomeScreen() {
  const serverUrl = useConnectionStore((s) => s.serverUrl);
  const serverName = useConnectionStore((s) => s.serverName);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const isConnected = !!serverUrl;

  const libraryVideos = useLibraryStore((s) => s.videos);
  const queueDownload = useDownloadStore((s) => s.queueDownload);
  const downloadQueue = useDownloadStore((s) => s.queue);

  const {
    activeTab,
    setActiveTab,
    channels,
    playlists,
    subscriptions,
    myLists,
    isLoadingChannels,
    isLoadingPlaylists,
    isLoadingVideos,
    isLoadingSubscriptions,
    isLoadingMyLists,
    channelsError,
    playlistsError,
    subscriptionsError,
    myListsError,
    videosError,
    selectedChannel,
    channelVideos,
    selectedPlaylist,
    playlistVideos,
    selectedSubscription,
    subscriptionVideos,
    selectedMyList,
    myListVideos,
    selectedVideoIds,
    favoritePlaylistIds,
    fetchChannels,
    fetchPlaylists,
    fetchSubscriptions,
    fetchMyLists,
    fetchChannelVideos,
    fetchPlaylistVideos,
    fetchSubscriptionVideos,
    fetchMyListVideos,
    selectChannel,
    selectPlaylist,
    selectSubscription,
    selectMyList,
    toggleVideoSelection,
    selectAllVideos,
    clearVideoSelection,
    addToFavorites,
    removeFromFavorites,
    reset: resetSyncStore,
  } = useSyncStore();

  const startPlaylist = usePlaybackStore((s) => s.startPlaylist);

  // Set of video IDs already synced to mobile
  const syncedVideoIds = new Set(libraryVideos.map((v) => v.id));

  // Download status
  const activeDownloads = downloadQueue.filter((d) => d.status === "downloading");
  const queuedDownloads = downloadQueue.filter((d) => d.status === "queued");

  // Fetch data when tab changes or on connect
  useEffect(() => {
    if (!serverUrl) return;

    if (activeTab === "channels" && channels.length === 0) {
      fetchChannels(serverUrl);
    } else if (activeTab === "playlists" && playlists.length === 0) {
      fetchPlaylists(serverUrl);
    } else if (activeTab === "subscriptions" && subscriptions.length === 0) {
      fetchSubscriptions(serverUrl);
    } else if (activeTab === "mylists" && myLists.length === 0) {
      fetchMyLists(serverUrl);
    }
  }, [
    activeTab,
    serverUrl,
    channels.length,
    playlists.length,
    subscriptions.length,
    myLists.length,
    fetchChannels,
    fetchPlaylists,
    fetchSubscriptions,
    fetchMyLists,
  ]);

  // Reset sync store when disconnecting
  useEffect(() => {
    if (!serverUrl) {
      resetSyncStore();
    }
  }, [serverUrl, resetSyncStore]);

  const handleRefreshChannels = useCallback(() => {
    if (serverUrl) fetchChannels(serverUrl);
  }, [serverUrl, fetchChannels]);

  const handleRefreshPlaylists = useCallback(() => {
    if (serverUrl) fetchPlaylists(serverUrl);
  }, [serverUrl, fetchPlaylists]);

  const handleRefreshSubscriptions = useCallback(() => {
    if (serverUrl) fetchSubscriptions(serverUrl);
  }, [serverUrl, fetchSubscriptions]);

  const handleRefreshMyLists = useCallback(() => {
    if (serverUrl) fetchMyLists(serverUrl);
  }, [serverUrl, fetchMyLists]);

  const handleChannelPress = useCallback(
    (channel: RemoteChannel) => {
      if (serverUrl) fetchChannelVideos(serverUrl, channel);
    },
    [serverUrl, fetchChannelVideos]
  );

  const handlePlaylistPress = useCallback(
    (playlist: RemotePlaylist) => {
      if (serverUrl) fetchPlaylistVideos(serverUrl, playlist);
    },
    [serverUrl, fetchPlaylistVideos]
  );

  const handleSubscriptionPress = useCallback(
    (subscription: RemoteSubscription) => {
      if (serverUrl) fetchSubscriptionVideos(serverUrl, subscription);
    },
    [serverUrl, fetchSubscriptionVideos]
  );

  const handleMyListPress = useCallback(
    (myList: RemoteMyList) => {
      if (serverUrl) fetchMyListVideos(serverUrl, myList);
    },
    [serverUrl, fetchMyListVideos]
  );

  const handleBackPress = useCallback(() => {
    if (selectedChannel) {
      selectChannel(null);
    } else if (selectedPlaylist) {
      selectPlaylist(null);
    } else if (selectedSubscription) {
      selectSubscription(null);
    } else if (selectedMyList) {
      selectMyList(null);
    }
  }, [
    selectedChannel,
    selectedPlaylist,
    selectedSubscription,
    selectedMyList,
    selectChannel,
    selectPlaylist,
    selectSubscription,
    selectMyList,
  ]);

  // Play a single video (streaming or local)
  const handlePlayVideo = useCallback(
    (video: RemoteVideoWithStatus) => {
      if (!serverUrl) return;

      // Check if video is synced locally
      const localVideo = libraryVideos.find((v) => v.id === video.id);

      // Create streaming video object
      const streamingVideo: StreamingVideo = {
        id: video.id,
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl ?? undefined,
        localPath: localVideo?.localPath,
      };

      // Determine the context title
      let contextTitle = "Now Playing";
      let contextId = `single-${video.id}`;
      if (selectedChannel) {
        contextTitle = selectedChannel.channelTitle;
        contextId = `channel-${selectedChannel.channelId}`;
      } else if (selectedPlaylist) {
        contextTitle = selectedPlaylist.title;
        contextId = `playlist-${selectedPlaylist.playlistId}`;
      } else if (selectedSubscription) {
        contextTitle = selectedSubscription.channelTitle;
        contextId = `subscription-${selectedSubscription.channelId}`;
      } else if (selectedMyList) {
        contextTitle = selectedMyList.name;
        contextId = `mylist-${selectedMyList.id}`;
      }

      // Get the current video list for playlist context
      let currentVideos: RemoteVideoWithStatus[] = [];
      if (selectedChannel) currentVideos = channelVideos;
      else if (selectedPlaylist) currentVideos = playlistVideos;
      else if (selectedSubscription) currentVideos = subscriptionVideos;
      else if (selectedMyList) currentVideos = myListVideos;

      // Convert to StreamingVideo array
      const playlistStreamingVideos: StreamingVideo[] = currentVideos.map(
        (v) => {
          const local = libraryVideos.find((lv) => lv.id === v.id);
          return {
            id: v.id,
            title: v.title,
            channelTitle: v.channelTitle,
            duration: v.duration,
            thumbnailUrl: v.thumbnailUrl ?? undefined,
            localPath: local?.localPath,
          };
        }
      );

      // Find index of current video
      const startIndex = playlistStreamingVideos.findIndex(
        (v) => v.id === video.id
      );

      // Start playlist with server URL for streaming
      startPlaylist(
        contextId,
        contextTitle,
        playlistStreamingVideos.length > 0
          ? playlistStreamingVideos
          : [streamingVideo],
        startIndex >= 0 ? startIndex : 0,
        serverUrl
      );

      router.push(`/player/${video.id}`);
    },
    [
      serverUrl,
      libraryVideos,
      selectedChannel,
      selectedPlaylist,
      selectedSubscription,
      selectedMyList,
      channelVideos,
      playlistVideos,
      subscriptionVideos,
      myListVideos,
      startPlaylist,
    ]
  );

  const handlePlaylistSavePress = useCallback(
    async (playlist: RemotePlaylist) => {
      if (!serverUrl) return;
      const entityType =
        playlist.type === "custom" ? "custom_playlist" : "channel_playlist";
      const isFavorited = favoritePlaylistIds.has(playlist.playlistId);

      try {
        if (isFavorited) {
          await removeFromFavorites(serverUrl, entityType, playlist.playlistId);
        } else {
          await addToFavorites(serverUrl, entityType, playlist.playlistId);
        }
      } catch (error) {
        console.error("[HomeScreen] Failed to toggle favorite:", error);
      }
    },
    [serverUrl, favoritePlaylistIds, addToFavorites, removeFromFavorites]
  );

  const handlePlayAll = useCallback(() => {
    if (!serverUrl) return;

    // Determine current context and videos
    let contextTitle = "";
    let contextId = "";
    let currentVideos: RemoteVideoWithStatus[] = [];

    if (selectedPlaylist) {
      contextTitle = selectedPlaylist.title;
      contextId = `playlist-${selectedPlaylist.playlistId}`;
      currentVideos = playlistVideos;
    } else if (selectedChannel) {
      contextTitle = selectedChannel.channelTitle;
      contextId = `channel-${selectedChannel.channelId}`;
      currentVideos = channelVideos;
    } else if (selectedSubscription) {
      contextTitle = selectedSubscription.channelTitle;
      contextId = `subscription-${selectedSubscription.channelId}`;
      currentVideos = subscriptionVideos;
    } else if (selectedMyList) {
      contextTitle = selectedMyList.name;
      contextId = `mylist-${selectedMyList.id}`;
      currentVideos = myListVideos;
    }

    // Get playable videos (downloaded on server)
    const playableVideos = currentVideos.filter(
      (v) => v.downloadStatus === "completed"
    );

    if (playableVideos.length === 0) return;

    // Convert to StreamingVideo array
    const streamingVideos: StreamingVideo[] = playableVideos.map((v) => {
      const localVideo = libraryVideos.find((lv) => lv.id === v.id);
      return {
        id: v.id,
        title: v.title,
        channelTitle: v.channelTitle,
        duration: v.duration,
        thumbnailUrl: v.thumbnailUrl ?? undefined,
        localPath: localVideo?.localPath,
      };
    });

    startPlaylist(contextId, contextTitle, streamingVideos, 0, serverUrl);
    router.push(`/player/${streamingVideos[0].id}`);
  }, [
    serverUrl,
    selectedPlaylist,
    selectedChannel,
    selectedSubscription,
    selectedMyList,
    playlistVideos,
    channelVideos,
    subscriptionVideos,
    myListVideos,
    libraryVideos,
    startPlaylist,
  ]);

  const handleSyncVideo = useCallback(
    (video: RemoteVideoWithStatus) => {
      if (!serverUrl || video.downloadStatus !== "completed") return;

      queueDownload(video.id, {
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl ?? undefined,
      });
    },
    [serverUrl, queueDownload]
  );

  const handleSyncSelected = useCallback(() => {
    let videos: RemoteVideoWithStatus[] = [];
    if (activeTab === "channels") videos = channelVideos;
    else if (activeTab === "playlists") videos = playlistVideos;
    else if (activeTab === "subscriptions") videos = subscriptionVideos;
    else if (activeTab === "mylists") videos = myListVideos;

    for (const video of videos) {
      if (
        selectedVideoIds.has(video.id) &&
        video.downloadStatus === "completed" &&
        !syncedVideoIds.has(video.id)
      ) {
        queueDownload(video.id, {
          title: video.title,
          channelTitle: video.channelTitle,
          duration: video.duration,
          thumbnailUrl: video.thumbnailUrl ?? undefined,
        });
      }
    }
    clearVideoSelection();
  }, [
    activeTab,
    channelVideos,
    playlistVideos,
    subscriptionVideos,
    myListVideos,
    selectedVideoIds,
    syncedVideoIds,
    queueDownload,
    clearVideoSelection,
  ]);

  // Not connected - show connect prompt
  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>LearnifyTube</Text>
          <Text style={styles.emptyText}>
            Connect to your LearnifyTube desktop app to browse and sync videos
          </Text>
          <Link href="/connect" asChild>
            <Pressable style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect to Desktop</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  // Video list view for selected channel/playlist/subscription/mylist
  const isShowingVideos =
    selectedChannel || selectedPlaylist || selectedSubscription || selectedMyList;

  const getCurrentVideos = () => {
    if (selectedChannel) return channelVideos;
    if (selectedPlaylist) return playlistVideos;
    if (selectedSubscription) return subscriptionVideos;
    if (selectedMyList) return myListVideos;
    return [];
  };
  const currentVideos = getCurrentVideos();

  const getCurrentTitle = () => {
    if (selectedChannel) return selectedChannel.channelTitle;
    if (selectedPlaylist) return selectedPlaylist.title;
    if (selectedSubscription) return selectedSubscription.channelTitle;
    if (selectedMyList) return selectedMyList.name;
    return "";
  };
  const currentTitle = getCurrentTitle();

  if (isShowingVideos) {
    // Videos available on server (downloaded on desktop)
    const availableVideos = currentVideos.filter(
      (v) => v.downloadStatus === "completed"
    );
    const syncableCount = availableVideos.filter(
      (v) => !syncedVideoIds.has(v.id)
    ).length;
    const savedCount = availableVideos.filter((v) =>
      syncedVideoIds.has(v.id)
    ).length;
    const totalAvailable = availableVideos.length;
    const isFullySaved = savedCount === totalAvailable && totalAvailable > 0;

    // Count videos that are downloaded on server (playable via streaming or local)
    const playableCount = totalAvailable;

    const handleSavePlaylistOffline = () => {
      // Determine playlist info based on what's selected
      let playlistId = "";
      let playlistTitle = "";
      let playlistType = "";
      let sourceId: string | null = null;
      let thumbnailUrl: string | null = null;

      if (selectedChannel) {
        playlistId = `channel_${selectedChannel.channelId}`;
        playlistTitle = selectedChannel.channelTitle;
        playlistType = "channel";
        sourceId = selectedChannel.channelId;
        thumbnailUrl = selectedChannel.thumbnailUrl;
      } else if (selectedPlaylist) {
        playlistId = `playlist_${selectedPlaylist.playlistId}`;
        playlistTitle = selectedPlaylist.title;
        playlistType = "playlist";
        sourceId = selectedPlaylist.channelId;
        thumbnailUrl = selectedPlaylist.thumbnailUrl;
      } else if (selectedSubscription) {
        playlistId = `subscription_${selectedSubscription.channelId}`;
        playlistTitle = selectedSubscription.channelTitle;
        playlistType = "subscription";
        sourceId = selectedSubscription.channelId;
        thumbnailUrl = selectedSubscription.thumbnailUrl;
      } else if (selectedMyList) {
        playlistId = `mylist_${selectedMyList.id}`;
        playlistTitle = selectedMyList.name;
        playlistType = "mylist";
        sourceId = selectedMyList.id;
        thumbnailUrl = selectedMyList.thumbnailUrl;
      }

      // Save playlist metadata with all videos
      if (playlistId) {
        const videoInfos = currentVideos.map((v) => ({
          videoId: v.id,
          title: v.title,
          channelTitle: v.channelTitle,
          duration: v.duration,
          thumbnailUrl: v.thumbnailUrl ?? undefined,
        }));

        savePlaylist(playlistId, playlistTitle, playlistType, sourceId, thumbnailUrl, videoInfos);
      }

      // Queue downloads for videos not yet synced
      for (const video of availableVideos) {
        if (!syncedVideoIds.has(video.id)) {
          queueDownload(video.id, {
            title: video.title,
            channelTitle: video.channelTitle,
            duration: video.duration,
            thumbnailUrl: video.thumbnailUrl ?? undefined,
          });
        }
      }
    };

    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Header with back button */}
        <View style={styles.videoHeader}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentTitle}
            </Text>
            <Text style={styles.headerSubtitle}>
              {totalAvailable > 0
                ? `${savedCount}/${totalAvailable} saved offline`
                : `${currentVideos.length} videos`}
            </Text>
          </View>
          {/* Save Offline Button */}
          {currentVideos.length > 0 && (
            <Pressable
              style={[
                styles.saveOfflineButton,
                isFullySaved && styles.saveOfflineButtonDisabled,
              ]}
              onPress={handleSavePlaylistOffline}
              disabled={isFullySaved}
            >
              <Text style={styles.saveOfflineButtonText}>
                {isFullySaved ? "✓ Saved" : "Save All"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Progress bar */}
        {totalAvailable > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(savedCount / totalAvailable) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Action toolbar */}
        {(syncableCount > 0 || playableCount > 0) && (
          <View style={styles.toolbar}>
            {syncableCount > 0 && (
              <Pressable
                style={styles.toolbarButton}
                onPress={
                  selectedVideoIds.size > 0 ? clearVideoSelection : selectAllVideos
                }
              >
                <Text style={styles.toolbarButtonText}>
                  {selectedVideoIds.size > 0
                    ? `Deselect (${selectedVideoIds.size})`
                    : `Select All (${syncableCount})`}
                </Text>
              </Pressable>
            )}
            {selectedVideoIds.size > 0 && (
              <Pressable style={styles.syncAllButton} onPress={handleSyncSelected}>
                <Text style={styles.syncAllButtonText}>
                  Sync {selectedVideoIds.size} video
                  {selectedVideoIds.size !== 1 ? "s" : ""}
                </Text>
              </Pressable>
            )}
            {playableCount > 0 && selectedVideoIds.size === 0 && (
              <Pressable style={styles.playAllButton} onPress={handlePlayAll}>
                <Text style={styles.playAllButtonText}>
                  Play All ({playableCount})
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Video list */}
        {isLoadingVideos ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#e94560" />
            <Text style={styles.loadingText}>Loading videos...</Text>
          </View>
        ) : videosError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Failed to load videos</Text>
            <Text style={styles.errorDetail}>{videosError}</Text>
          </View>
        ) : currentVideos.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyListText}>No videos found</Text>
          </View>
        ) : (
          <FlatList
            data={currentVideos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VideoListItem
                video={item}
                isSelected={selectedVideoIds.has(item.id)}
                isSyncedToMobile={syncedVideoIds.has(item.id)}
                onPress={() => {
                  if (
                    item.downloadStatus === "completed" &&
                    !syncedVideoIds.has(item.id)
                  ) {
                    toggleVideoSelection(item.id);
                  }
                }}
                onPlayPress={
                  item.downloadStatus === "completed"
                    ? () => handlePlayVideo(item)
                    : undefined
                }
                onSyncPress={
                  item.downloadStatus === "completed" && !syncedVideoIds.has(item.id)
                    ? () => handleSyncVideo(item)
                    : undefined
                }
              />
            )}
            contentContainerStyle={styles.videoList}
          />
        )}
      </SafeAreaView>
    );
  }

  // Main browsing view with tabs
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Connection header */}
      <View style={styles.connectionHeader}>
        <View style={styles.connectionInfo}>
          <View style={styles.connectionDot} />
          <Text style={styles.connectionText}>
            Connected to {serverName || "Desktop"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {(activeDownloads.length > 0 || queuedDownloads.length > 0) && (
            <View style={styles.downloadStatus}>
              {activeDownloads.length > 0 && (
                <Text style={styles.downloadStatusText}>
                  ↓ {activeDownloads.length}
                  {activeDownloads[0] && ` (${activeDownloads[0].progress}%)`}
                </Text>
              )}
              {queuedDownloads.length > 0 && (
                <Text style={styles.queuedStatusText}>
                  {queuedDownloads.length} queued
                </Text>
              )}
            </View>
          )}
          <Pressable style={styles.disconnectButton} onPress={disconnect}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </Pressable>
        </View>
      </View>

      {/* Tab bar */}
      <SyncTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === "channels" && (
        <ChannelList
          channels={channels}
          isLoading={isLoadingChannels}
          error={channelsError}
          onChannelPress={handleChannelPress}
          onRefresh={handleRefreshChannels}
        />
      )}

      {activeTab === "playlists" && (
        <PlaylistList
          playlists={playlists}
          isLoading={isLoadingPlaylists}
          error={playlistsError}
          serverUrl={serverUrl ?? undefined}
          favoritePlaylistIds={favoritePlaylistIds}
          onPlaylistPress={handlePlaylistPress}
          onSavePress={handlePlaylistSavePress}
          onRefresh={handleRefreshPlaylists}
        />
      )}

      {activeTab === "subscriptions" && (
        <SubscriptionList
          subscriptions={subscriptions}
          isLoading={isLoadingSubscriptions}
          error={subscriptionsError}
          onSubscriptionPress={handleSubscriptionPress}
          onRefresh={handleRefreshSubscriptions}
        />
      )}

      {activeTab === "mylists" && (
        <MyListsList
          myLists={myLists}
          isLoading={isLoadingMyLists}
          error={myListsError}
          onMyListPress={handleMyListPress}
          onRefresh={handleRefreshMyLists}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16213e",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: "#e94560",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorDetail: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
  },
  emptyListText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    color: "#a0a0a0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: "#e94560",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  connectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4e",
  },
  connectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  connectionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  downloadStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  downloadStatusText: {
    color: "#e94560",
    fontSize: 12,
    fontWeight: "600",
  },
  queuedStatusText: {
    color: "#888",
    fontSize: 12,
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  disconnectButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4e",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a4e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backIcon: {
    color: "#fff",
    fontSize: 18,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4e",
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#2a2a4e",
  },
  toolbarButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  syncAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e94560",
  },
  syncAllButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  playAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    marginLeft: "auto",
  },
  playAllButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  videoList: {
    paddingVertical: 8,
  },
  saveOfflineButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveOfflineButtonDisabled: {
    backgroundColor: "#22c55e",
  },
  saveOfflineButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1a1a2e",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#2a2a4e",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 2,
  },
});
