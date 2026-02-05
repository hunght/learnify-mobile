import { create } from "zustand";
import type {
  RemoteChannel,
  RemotePlaylist,
  RemoteFavorite,
  RemoteVideoWithStatus,
  ServerDownloadStatus,
  RemoteMyList,
  BrowseTab,
} from "../types";
import { api } from "../services/api";

type FavoriteEntityType = "video" | "custom_playlist" | "channel_playlist";

type SyncTab = BrowseTab;

interface SyncStore {
  // Tab state
  activeTab: SyncTab;
  setActiveTab: (tab: SyncTab) => void;

  // Loading states
  isLoadingChannels: boolean;
  isLoadingPlaylists: boolean;
  isLoadingFavorites: boolean;
  isLoadingVideos: boolean;
  isLoadingSubscriptions: boolean;
  isLoadingMyLists: boolean;

  // Error states
  channelsError: string | null;
  playlistsError: string | null;
  favoritesError: string | null;
  videosError: string | null;
  subscriptionsError: string | null;
  myListsError: string | null;

  // Data
  channels: RemoteChannel[];
  playlists: RemotePlaylist[];
  favorites: RemoteFavorite[];
  myLists: RemoteMyList[];

  // Selected item + its videos
  selectedChannel: RemoteChannel | null;
  channelVideos: RemoteVideoWithStatus[];
  selectedPlaylist: RemotePlaylist | null;
  playlistVideos: RemoteVideoWithStatus[];
  subscriptionVideos: RemoteVideoWithStatus[];
  selectedMyList: RemoteMyList | null;
  myListVideos: RemoteVideoWithStatus[];

  // Server download tracking
  serverDownloadRequests: Map<string, ServerDownloadStatus>;

  // Selection for batch operations
  selectedVideoIds: Set<string>;

  // Track favorited playlist IDs for quick lookup
  favoritePlaylistIds: Set<string>;

  // Actions
  fetchChannels: (serverUrl: string) => Promise<void>;
  fetchPlaylists: (serverUrl: string) => Promise<void>;
  fetchFavorites: (serverUrl: string) => Promise<void>;
  fetchChannelVideos: (serverUrl: string, channel: RemoteChannel) => Promise<void>;
  fetchPlaylistVideos: (serverUrl: string, playlist: RemotePlaylist) => Promise<void>;
  fetchSubscriptions: (serverUrl: string) => Promise<void>;
  fetchMyLists: (serverUrl: string) => Promise<void>;
  fetchMyListVideos: (serverUrl: string, myList: RemoteMyList) => Promise<void>;

  selectChannel: (channel: RemoteChannel | null) => void;
  selectPlaylist: (playlist: RemotePlaylist | null) => void;
  selectMyList: (myList: RemoteMyList | null) => void;

  toggleVideoSelection: (videoId: string) => void;
  selectAllVideos: () => void;
  clearVideoSelection: () => void;

  updateServerDownloadStatus: (videoId: string, status: ServerDownloadStatus) => void;
  clearServerDownloadStatus: (videoId: string) => void;

  // Favorites management
  addToFavorites: (
    serverUrl: string,
    entityType: FavoriteEntityType,
    entityId: string
  ) => Promise<void>;
  removeFromFavorites: (
    serverUrl: string,
    entityType: FavoriteEntityType,
    entityId: string
  ) => Promise<void>;

  reset: () => void;
}

const initialState = {
  activeTab: "mylists" as SyncTab,
  isLoadingChannels: false,
  isLoadingPlaylists: false,
  isLoadingFavorites: false,
  isLoadingVideos: false,
  isLoadingSubscriptions: false,
  isLoadingMyLists: false,
  channelsError: null,
  playlistsError: null,
  favoritesError: null,
  videosError: null,
  subscriptionsError: null,
  myListsError: null,
  channels: [],
  playlists: [],
  favorites: [],
  myLists: [],
  selectedChannel: null,
  channelVideos: [],
  selectedPlaylist: null,
  playlistVideos: [],
  subscriptionVideos: [],
  selectedMyList: null,
  myListVideos: [],
  serverDownloadRequests: new Map<string, ServerDownloadStatus>(),
  selectedVideoIds: new Set<string>(),
  favoritePlaylistIds: new Set<string>(),
};

export const useSyncStore = create<SyncStore>()((set, get) => ({
  ...initialState,

  setActiveTab: (tab) => {
    set({
      activeTab: tab,
      selectedChannel: null,
      channelVideos: [],
      selectedPlaylist: null,
      playlistVideos: [],
      subscriptionVideos: [],
      selectedMyList: null,
      myListVideos: [],
      selectedVideoIds: new Set(),
    });
  },

  fetchChannels: async (serverUrl) => {
    set({ isLoadingChannels: true, channelsError: null });
    try {
      const { channels } = await api.getChannels(serverUrl);
      set({ channels, isLoadingChannels: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch channels";
      set({ channelsError: message, isLoadingChannels: false });
    }
  },

  fetchPlaylists: async (serverUrl) => {
    set({ isLoadingPlaylists: true, playlistsError: null });
    try {
      const { playlists } = await api.getPlaylists(serverUrl);
      set({ playlists, isLoadingPlaylists: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch playlists";
      set({ playlistsError: message, isLoadingPlaylists: false });
    }
  },

  fetchFavorites: async (serverUrl) => {
    set({ isLoadingFavorites: true, favoritesError: null });
    try {
      const { favorites } = await api.getFavorites(serverUrl);
      // Build set of favorited playlist IDs for quick lookup
      const favoritePlaylistIds = new Set<string>();
      for (const fav of favorites) {
        if (fav.entityType === "channel_playlist" || fav.entityType === "custom_playlist") {
          favoritePlaylistIds.add(fav.entityId);
        }
      }
      set({ favorites, favoritePlaylistIds, isLoadingFavorites: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch favorites";
      set({ favoritesError: message, isLoadingFavorites: false });
    }
  },

  fetchChannelVideos: async (serverUrl, channel) => {
    set({
      isLoadingVideos: true,
      videosError: null,
      selectedChannel: channel,
      channelVideos: [],
      selectedVideoIds: new Set(),
    });
    try {
      const { videos } = await api.getChannelVideos(serverUrl, channel.channelId);
      set({ channelVideos: videos, isLoadingVideos: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch videos";
      set({ videosError: message, isLoadingVideos: false });
    }
  },

  fetchPlaylistVideos: async (serverUrl, playlist) => {
    set({
      isLoadingVideos: true,
      videosError: null,
      selectedPlaylist: playlist,
      playlistVideos: [],
      selectedVideoIds: new Set(),
    });
    try {
      const { videos } = await api.getPlaylistVideos(serverUrl, playlist.playlistId);
      set({ playlistVideos: videos, isLoadingVideos: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch videos";
      set({ videosError: message, isLoadingVideos: false });
    }
  },

  fetchSubscriptions: async (serverUrl) => {
    set({ isLoadingSubscriptions: true, subscriptionsError: null });
    try {
      const { videos } = await api.getSubscriptions(serverUrl);
      set({ subscriptionVideos: videos, isLoadingSubscriptions: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch subscriptions";
      set({ subscriptionsError: message, isLoadingSubscriptions: false });
    }
  },

  fetchMyLists: async (serverUrl) => {
    set({ isLoadingMyLists: true, myListsError: null });
    try {
      const { mylists } = await api.getMyLists(serverUrl);
      set({ myLists: mylists, isLoadingMyLists: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch my lists";
      set({ myListsError: message, isLoadingMyLists: false });
    }
  },

  fetchMyListVideos: async (serverUrl, myList) => {
    set({
      isLoadingVideos: true,
      videosError: null,
      selectedMyList: myList,
      myListVideos: [],
      selectedVideoIds: new Set(),
    });
    try {
      const { videos } = await api.getMyListVideos(serverUrl, myList.id);
      set({ myListVideos: videos, isLoadingVideos: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch videos";
      set({ videosError: message, isLoadingVideos: false });
    }
  },

  selectChannel: (channel) => {
    set({
      selectedChannel: channel,
      channelVideos: [],
      selectedVideoIds: new Set(),
    });
  },

  selectPlaylist: (playlist) => {
    set({
      selectedPlaylist: playlist,
      playlistVideos: [],
      selectedVideoIds: new Set(),
    });
  },

  selectMyList: (myList) => {
    set({
      selectedMyList: myList,
      myListVideos: [],
      selectedVideoIds: new Set(),
    });
  },

  toggleVideoSelection: (videoId) => {
    const { selectedVideoIds } = get();
    const newSelection = new Set(selectedVideoIds);
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId);
    } else {
      newSelection.add(videoId);
    }
    set({ selectedVideoIds: newSelection });
  },

  selectAllVideos: () => {
    const {
      activeTab,
      channelVideos,
      playlistVideos,
      subscriptionVideos,
      myListVideos,
    } = get();
    let videos: RemoteVideoWithStatus[] = [];
    if (activeTab === "channels") videos = channelVideos;
    else if (activeTab === "playlists") videos = playlistVideos;
    else if (activeTab === "subscriptions") videos = subscriptionVideos;
    else if (activeTab === "mylists") videos = myListVideos;
    const downloadableVideos = videos.filter((v) => v.downloadStatus === "completed");
    set({ selectedVideoIds: new Set(downloadableVideos.map((v) => v.id)) });
  },

  clearVideoSelection: () => {
    set({ selectedVideoIds: new Set() });
  },

  updateServerDownloadStatus: (videoId, status) => {
    const { serverDownloadRequests } = get();
    const newMap = new Map(serverDownloadRequests);
    newMap.set(videoId, status);
    set({ serverDownloadRequests: newMap });
  },

  clearServerDownloadStatus: (videoId) => {
    const { serverDownloadRequests } = get();
    const newMap = new Map(serverDownloadRequests);
    newMap.delete(videoId);
    set({ serverDownloadRequests: newMap });
  },

  addToFavorites: async (serverUrl, entityType, entityId) => {
    try {
      await api.addFavorite(serverUrl, entityType, entityId);
      // Update local state
      const { favoritePlaylistIds } = get();
      if (entityType === "channel_playlist" || entityType === "custom_playlist") {
        const newSet = new Set(favoritePlaylistIds);
        newSet.add(entityId);
        set({ favoritePlaylistIds: newSet });
      }
      // Refresh favorites list
      const { favorites: currentFavorites } = await api.getFavorites(serverUrl);
      const newFavoritePlaylistIds = new Set<string>();
      for (const fav of currentFavorites) {
        if (fav.entityType === "channel_playlist" || fav.entityType === "custom_playlist") {
          newFavoritePlaylistIds.add(fav.entityId);
        }
      }
      set({ favorites: currentFavorites, favoritePlaylistIds: newFavoritePlaylistIds });
    } catch (error) {
      console.error("[SyncStore] Failed to add favorite:", error);
      throw error;
    }
  },

  removeFromFavorites: async (serverUrl, entityType, entityId) => {
    try {
      await api.removeFavorite(serverUrl, entityType, entityId);
      // Update local state immediately
      const { favoritePlaylistIds, favorites } = get();
      if (entityType === "channel_playlist" || entityType === "custom_playlist") {
        const newSet = new Set(favoritePlaylistIds);
        newSet.delete(entityId);
        set({ favoritePlaylistIds: newSet });
      }
      // Remove from favorites list
      const newFavorites = favorites.filter(
        (f) => !(f.entityType === entityType && f.entityId === entityId)
      );
      set({ favorites: newFavorites });
    } catch (error) {
      console.error("[SyncStore] Failed to remove favorite:", error);
      throw error;
    }
  },

  reset: () => {
    set({
      ...initialState,
      serverDownloadRequests: new Map(),
      selectedVideoIds: new Set(),
      favoritePlaylistIds: new Set(),
    });
  },
}));
