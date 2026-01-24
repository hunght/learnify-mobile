import { Paths, Directory, File } from "expo-file-system";
import { api } from "./api";
import type { VideoMeta } from "../types";

const getVideosDir = () => new Directory(Paths.document, "videos");

export async function ensureVideosDir(): Promise<Directory> {
  const videosDir = getVideosDir();
  if (!videosDir.exists) {
    videosDir.create();
  }
  return videosDir;
}

export async function downloadVideo(
  serverUrl: string,
  videoId: string,
  onProgress: (progress: number) => void
): Promise<{ videoPath: string; meta: VideoMeta }> {
  const videosDir = await ensureVideosDir();
  const videoFile = new File(videosDir, `${videoId}.mp4`);
  const videoUrl = api.getVideoFileUrl(serverUrl, videoId);

  // Download video file using fetch with progress tracking
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;

    if (total > 0) {
      onProgress(Math.round((loaded / total) * 100));
    }
  }

  // Combine chunks and write to file
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  await videoFile.write(combined);

  // Fetch video metadata including transcript
  const meta = await api.getVideoMeta(serverUrl, videoId);

  return {
    videoPath: videoFile.uri,
    meta,
  };
}

export async function deleteVideo(videoId: string): Promise<void> {
  const videosDir = getVideosDir();
  const videoFile = new File(videosDir, `${videoId}.mp4`);
  if (videoFile.exists) {
    videoFile.delete();
  }
}

export async function getStorageInfo(): Promise<{
  used: number;
  videoCount: number;
}> {
  const videosDir = await ensureVideosDir();
  const files = videosDir.list();
  let totalSize = 0;
  let videoCount = 0;

  for (const item of files) {
    if (item instanceof File && item.name.endsWith(".mp4")) {
      totalSize += item.size || 0;
      videoCount++;
    }
  }

  return {
    used: totalSize,
    videoCount,
  };
}
