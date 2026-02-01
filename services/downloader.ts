import * as FileSystemLegacy from "expo-file-system/legacy";
import { Paths, Directory, File } from "expo-file-system";
import { api } from "./api";
import type { VideoMeta } from "../types";

const log = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
  if (data) {
    console.log(`[${timestamp}] [Downloader] ${message}`, data);
  } else {
    console.log(`[${timestamp}] [Downloader] ${message}`);
  }
};

const getVideosDir = () => new Directory(Paths.document, "videos");

export async function ensureVideosDir(): Promise<Directory> {
  const videosDir = getVideosDir();
  if (!videosDir.exists) {
    videosDir.create();
  }
  return videosDir;
}

export interface DownloadProgress {
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
}

export async function downloadVideo(
  serverUrl: string,
  videoId: string,
  onProgress: (progress: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<{ videoPath: string; meta: VideoMeta }> {
  const videosDir = await ensureVideosDir();
  const videoFile = new File(videosDir, `${videoId}.mp4`);
  const videoUrl = api.getVideoFileUrl(serverUrl, videoId);

  log(`Starting download: ${videoUrl}`);
  log(`Destination: ${videoFile.uri}`);

  // Signal that download is starting
  onProgress({ progress: 0, bytesDownloaded: 0, totalBytes: 0 });

  // Check if already aborted
  if (signal?.aborted) {
    throw new DOMException("Download cancelled", "AbortError");
  }

  try {
    // Use legacy FileSystem API for downloading with progress
    const downloadResumable = FileSystemLegacy.createDownloadResumable(
      videoUrl,
      videoFile.uri,
      {},
      (downloadProgress) => {
        const progress = Math.round(
          (downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite) *
            100
        );
        onProgress({
          progress,
          bytesDownloaded: downloadProgress.totalBytesWritten,
          totalBytes: downloadProgress.totalBytesExpectedToWrite,
        });
      }
    );

    // Set up abort handler
    let abortHandler: (() => void) | undefined;
    if (signal) {
      abortHandler = () => {
        log(`Download aborted: ${videoId}`);
        downloadResumable.pauseAsync().catch(() => {
          // Ignore pause errors during abort
        });
      };
      signal.addEventListener("abort", abortHandler);
    }

    try {
      const result = await downloadResumable.downloadAsync();

      // Check if aborted during download
      if (signal?.aborted) {
        await cleanupPartialDownload(videoId);
        throw new DOMException("Download cancelled", "AbortError");
      }

      if (!result || result.status !== 200) {
        throw new Error(
          `Download failed: ${result?.status || "unknown error"}`
        );
      }

      log(`Download complete: ${result.uri}`);
      onProgress({ progress: 100, bytesDownloaded: result.headers?.["content-length"] ? parseInt(result.headers["content-length"]) : 0, totalBytes: result.headers?.["content-length"] ? parseInt(result.headers["content-length"]) : 0 });

      // Fetch video metadata including transcript
      const meta = await api.getVideoMeta(serverUrl, videoId);
      log(`Metadata fetched for: ${videoId}`);

      return {
        videoPath: result.uri,
        meta,
      };
    } finally {
      if (signal && abortHandler) {
        signal.removeEventListener("abort", abortHandler);
      }
    }
  } catch (error) {
    // Clean up partial download on error (unless it's an abort)
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      await cleanupPartialDownload(videoId).catch(() => {
        // Ignore cleanup errors
      });
    }
    log(`Download error:`, error);
    throw error;
  }
}

export async function cleanupPartialDownload(videoId: string): Promise<void> {
  const videosDir = getVideosDir();
  const videoFile = new File(videosDir, `${videoId}.mp4`);
  const tempFile = new File(videosDir, `${videoId}.mp4.download`);

  try {
    if (videoFile.exists) {
      videoFile.delete();
      log(`Cleaned up partial download: ${videoFile.uri}`);
    }
    if (tempFile.exists) {
      tempFile.delete();
      log(`Cleaned up temp file: ${tempFile.uri}`);
    }
  } catch (error) {
    log(`Cleanup error:`, error);
  }
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
