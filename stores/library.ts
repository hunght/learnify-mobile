import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Video } from "../types";

interface LibraryStore {
  videos: Video[];
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  removeVideo: (id: string) => void;
  getVideo: (id: string) => Video | undefined;
  clearLibrary: () => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      videos: [],

      addVideo: (video) =>
        set((state) => {
          // Don't add duplicates
          if (state.videos.some((v) => v.id === video.id)) {
            return state;
          }
          return { videos: [...state.videos, video] };
        }),

      updateVideo: (id, updates) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),

      removeVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((v) => v.id !== id),
        })),

      getVideo: (id) => get().videos.find((v) => v.id === id),

      clearLibrary: () => set({ videos: [] }),
    }),
    {
      name: "learnify-library",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
