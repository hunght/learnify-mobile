import { eq } from "drizzle-orm";
import { db, savedPlaylists, savedPlaylistItems, videos } from "../index";
import type {
  SavedPlaylist,
  NewSavedPlaylist,
  SavedPlaylistItem,
  NewSavedPlaylistItem,
} from "../schema";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export interface PlaylistVideoInfo {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: number;
  thumbnailUrl?: string;
}

export interface SavedPlaylistWithItems extends SavedPlaylist {
  items: Array<
    SavedPlaylistItem & {
      isDownloaded: boolean;
      localPath?: string;
    }
  >;
}

// Get all saved playlists
export function getAllSavedPlaylists(): SavedPlaylist[] {
  return db.select().from(savedPlaylists).all();
}

// Get saved playlist by ID
export function getSavedPlaylistById(id: string): SavedPlaylist | undefined {
  return db.select().from(savedPlaylists).where(eq(savedPlaylists.id, id)).get();
}

// Get saved playlist with all items and download status
export function getSavedPlaylistWithItems(
  id: string
): SavedPlaylistWithItems | undefined {
  const playlist = getSavedPlaylistById(id);
  if (!playlist) return undefined;

  const items = db
    .select()
    .from(savedPlaylistItems)
    .where(eq(savedPlaylistItems.playlistId, id))
    .orderBy(savedPlaylistItems.position)
    .all();

  // Check which videos are downloaded locally
  const itemsWithStatus = items.map((item) => {
    const video = db
      .select()
      .from(videos)
      .where(eq(videos.id, item.videoId))
      .get();

    return {
      ...item,
      isDownloaded: !!video?.localPath,
      localPath: video?.localPath ?? undefined,
    };
  });

  return {
    ...playlist,
    items: itemsWithStatus,
  };
}

// Get all saved playlists with item counts and download progress
export function getAllSavedPlaylistsWithProgress(): Array<
  SavedPlaylist & {
    downloadedCount: number;
    totalCount: number;
  }
> {
  const playlists = getAllSavedPlaylists();

  return playlists.map((playlist) => {
    const items = db
      .select()
      .from(savedPlaylistItems)
      .where(eq(savedPlaylistItems.playlistId, playlist.id))
      .all();

    let downloadedCount = 0;
    for (const item of items) {
      const video = db
        .select()
        .from(videos)
        .where(eq(videos.id, item.videoId))
        .get();
      if (video?.localPath) {
        downloadedCount++;
      }
    }

    return {
      ...playlist,
      downloadedCount,
      totalCount: items.length,
    };
  });
}

// Save a playlist with its videos
export function savePlaylist(
  playlistId: string,
  title: string,
  type: string,
  sourceId: string | null,
  thumbnailUrl: string | null,
  videoInfos: PlaylistVideoInfo[]
): SavedPlaylist {
  const now = Date.now();

  // Check if playlist already exists
  const existing = getSavedPlaylistById(playlistId);

  if (existing) {
    // Update existing playlist
    db.update(savedPlaylists)
      .set({
        title,
        thumbnailUrl,
        itemCount: videoInfos.length,
        updatedAt: now,
      })
      .where(eq(savedPlaylists.id, playlistId))
      .run();

    // Delete old items and insert new ones
    db.delete(savedPlaylistItems)
      .where(eq(savedPlaylistItems.playlistId, playlistId))
      .run();
  } else {
    // Insert new playlist
    db.insert(savedPlaylists)
      .values({
        id: playlistId,
        title,
        type,
        sourceId,
        thumbnailUrl,
        itemCount: videoInfos.length,
        savedAt: now,
        updatedAt: now,
      })
      .run();
  }

  // Insert playlist items
  videoInfos.forEach((video, index) => {
    db.insert(savedPlaylistItems)
      .values({
        id: generateId(),
        playlistId,
        videoId: video.videoId,
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl ?? null,
        position: index,
        createdAt: now,
      })
      .run();
  });

  return getSavedPlaylistById(playlistId)!;
}

// Delete a saved playlist
export function deleteSavedPlaylist(id: string) {
  db.delete(savedPlaylists).where(eq(savedPlaylists.id, id)).run();
}

// Check if a playlist is saved
export function isPlaylistSaved(id: string): boolean {
  const playlist = getSavedPlaylistById(id);
  return !!playlist;
}

// Get playlist items for a saved playlist
export function getPlaylistItems(playlistId: string): SavedPlaylistItem[] {
  return db
    .select()
    .from(savedPlaylistItems)
    .where(eq(savedPlaylistItems.playlistId, playlistId))
    .orderBy(savedPlaylistItems.position)
    .all();
}
