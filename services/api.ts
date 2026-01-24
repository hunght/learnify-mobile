import type { ServerInfo, RemoteVideo, VideoMeta } from "../types";

const TIMEOUT = 10000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  async getInfo(serverUrl: string): Promise<ServerInfo> {
    const response = await fetchWithTimeout(`${serverUrl}/api/info`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },

  async getVideos(serverUrl: string): Promise<{ videos: RemoteVideo[] }> {
    const response = await fetchWithTimeout(`${serverUrl}/api/videos`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },

  async getVideoMeta(serverUrl: string, videoId: string): Promise<VideoMeta> {
    const response = await fetchWithTimeout(
      `${serverUrl}/api/video/${videoId}/meta`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },

  getVideoFileUrl(serverUrl: string, videoId: string): string {
    return `${serverUrl}/api/video/${videoId}/file`;
  },

  getTranscriptUrl(serverUrl: string, videoId: string): string {
    return `${serverUrl}/api/video/${videoId}/transcript`;
  },

  getThumbnailUrl(serverUrl: string, videoId: string): string {
    return `${serverUrl}/api/video/${videoId}/thumbnail`;
  },
};
