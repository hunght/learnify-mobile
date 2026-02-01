export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface Transcript {
  language: string;
  segments: TranscriptSegment[];
}

export interface Video {
  id: string;
  title: string;
  channelTitle: string;
  duration: number;
  thumbnailUrl?: string;
  localPath?: string;
  transcriptPath?: string;
  transcript?: Transcript;
}

export interface RemoteVideo {
  id: string;
  title: string;
  channelTitle: string;
  duration: number;
  fileSize: number;
  hasTranscript: boolean;
  thumbnailUrl?: string;
}

export interface ServerInfo {
  name: string;
  version: string;
  videoCount: number;
}

export interface VideoMeta {
  id: string;
  title: string;
  channelTitle: string;
  duration: number;
  transcript?: Transcript;
}

// P2P Sharing Types
export interface DiscoveredPeer {
  name: string;
  host: string;
  port: number;
  videoCount: number;
}

export interface PeerVideo {
  id: string;
  title: string;
  channelTitle: string;
  duration: number;
  hasTranscript: boolean;
}

export interface TransferProgress {
  videoId: string;
  title: string;
  progress: number;
  status: "pending" | "downloading" | "completed" | "failed";
}
