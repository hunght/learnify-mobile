import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSyncStore } from "../stores/sync";
import { useConnectionStore } from "../stores/connection";
import { useLibraryStore } from "../stores/library";
import { useDownloadStore } from "../stores/downloads";
import { usePlaybackStore } from "../stores/playback";
import {
  SyncTabBar,
  ChannelList,
  PlaylistList,
  VideoListItem,
  SubscriptionList,
  MyListsList,
} from "../components/sync";
import type {
  RemoteChannel,
  RemotePlaylist,
  RemoteVideoWithStatus,
  RemoteSubscription,
  RemoteMyList,
} from "../types";
import type { StreamingVideo } from "../stores/playback";

export default function SyncScreen() {
  const router = useRouter();
  const serverUrl = useConnectionStore((s) => s.serverUrl);
  const libraryVideos = useLibraryStore((s) => s.videos);
  const queueDownload = useDownloadStore((s) => s.queueDownload);
  const startPlaylist = usePlaybackStore((s) => s.startPlaylist);

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
  } = useSyncStore();

  // Set of video IDs already synced to mobile
  const syncedVideoIds = new Set(libraryVideos.map((v) => v.id));

  // Fetch data when tab changes or on mount
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

  const handlePlayVideo = useCallback(
    (video: RemoteVideoWithStatus) => {
      if (!serverUrl) return;

      const localVideo = libraryVideos.find((v) => v.id === video.id);
      const streamingVideo: StreamingVideo = {
        id: video.id,
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl ?? undefined,
        localPath: localVideo?.localPath,
      };

      let contextTitle = "Now Playing";
      let contextId = `single-${video.id}`;
      let currentVideos: RemoteVideoWithStatus[] = [];

      if (selectedChannel) {
        contextTitle = selectedChannel.channelTitle;
        contextId = `channel-${selectedChannel.channelId}`;
        currentVideos = channelVideos;
      } else if (selectedPlaylist) {
        contextTitle = selectedPlaylist.title;
        contextId = `playlist-${selectedPlaylist.playlistId}`;
        currentVideos = playlistVideos;
      } else if (selectedSubscription) {
        contextTitle = selectedSubscription.channelTitle;
        contextId = `subscription-${selectedSubscription.channelId}`;
        currentVideos = subscriptionVideos;
      } else if (selectedMyList) {
        contextTitle = selectedMyList.name;
        contextId = `mylist-${selectedMyList.id}`;
        currentVideos = myListVideos;
      }

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

      const startIndex = playlistStreamingVideos.findIndex(
        (v) => v.id === video.id
      );

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
      router,
    ]
  );

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

  if (!serverUrl) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Not connected to server</Text>
        <Pressable
          style={styles.connectButton}
          onPress={() => router.push("/connect")}
        >
          <Text style={styles.connectButtonText}>Connect</Text>
        </Pressable>
      </View>
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
    const syncableCount = currentVideos.filter(
      (v) => v.downloadStatus === "completed" && !syncedVideoIds.has(v.id)
    ).length;

    return (
      <View style={styles.container}>
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
              {currentVideos.length} video{currentVideos.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Selection toolbar */}
        {syncableCount > 0 && (
          <View style={styles.toolbar}>
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
            {selectedVideoIds.size > 0 && (
              <Pressable style={styles.syncAllButton} onPress={handleSyncSelected}>
                <Text style={styles.syncAllButtonText}>
                  Sync {selectedVideoIds.size} video
                  {selectedVideoIds.size !== 1 ? "s" : ""}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Video list */}
        {isLoadingVideos ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading videos...</Text>
          </View>
        ) : videosError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Failed to load videos</Text>
            <Text style={styles.errorDetail}>{videosError}</Text>
          </View>
        ) : currentVideos.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No videos found</Text>
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
                  item.downloadStatus === "completed" &&
                  !syncedVideoIds.has(item.id)
                    ? () => handleSyncVideo(item)
                    : undefined
                }
              />
            )}
            contentContainerStyle={styles.videoList}
          />
        )}
      </View>
    );
  }

  // Tab-based list view
  return (
    <View style={styles.container}>
      <SyncTabBar activeTab={activeTab} onTabChange={setActiveTab} />

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
          onPlaylistPress={handlePlaylistPress}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    color: "#71717a",
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorDetail: {
    color: "#71717a",
    fontSize: 13,
    textAlign: "center",
  },
  emptyText: {
    color: "#fafafa",
    fontSize: 18,
    fontWeight: "600",
  },
  connectButton: {
    marginTop: 16,
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#09090b",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backIcon: {
    color: "#fafafa",
    fontSize: 18,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#fafafa",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#71717a",
    fontSize: 13,
    marginTop: 2,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#09090b",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#27272a",
  },
  toolbarButtonText: {
    color: "#fafafa",
    fontSize: 13,
    fontWeight: "500",
  },
  syncAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#6366f1",
  },
  syncAllButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  videoList: {
    paddingVertical: 8,
  },
});
