import * as FileSystem from "expo-file-system";
import { api } from "./api";
import type { VideoMeta } from "../types";

const VIDEOS_DIR = `${FileSystem.documentDirectory}videos/`;

export async function ensureVideosDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(VIDEOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VIDEOS_DIR, { intermediates: true });
  }
}

export async function downloadVideo(
  serverUrl: string,
  videoId: string,
  onProgress: (progress: number) => void
): Promise<{ videoPath: string; meta: VideoMeta }> {
  await ensureVideosDir();

  const videoPath = `${VIDEOS_DIR}${videoId}.mp4`;
  const videoUrl = api.getVideoFileUrl(serverUrl, videoId);

  // Download video file
  const downloadResumable = FileSystem.createDownloadResumable(
    videoUrl,
    videoPath,
    {},
    (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      onProgress(Math.round(progress * 100));
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) {
    throw new Error("Download failed");
  }

  // Fetch video metadata including transcript
  const meta = await api.getVideoMeta(serverUrl, videoId);

  return {
    videoPath: result.uri,
    meta,
  };
}

export async function deleteVideo(videoId: string): Promise<void> {
  const videoPath = `${VIDEOS_DIR}${videoId}.mp4`;
  const fileInfo = await FileSystem.getInfoAsync(videoPath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(videoPath);
  }
}

export async function getStorageInfo(): Promise<{
  used: number;
  videoCount: number;
}> {
  await ensureVideosDir();
  const files = await FileSystem.readDirectoryAsync(VIDEOS_DIR);
  let totalSize = 0;

  for (const file of files) {
    const info = await FileSystem.getInfoAsync(`${VIDEOS_DIR}${file}`);
    if (info.exists && "size" in info) {
      totalSize += info.size || 0;
    }
  }

  return {
    used: totalSize,
    videoCount: files.filter((f) => f.endsWith(".mp4")).length,
  };
}
