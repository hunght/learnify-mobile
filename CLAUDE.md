# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS Simulator
npm run android        # Run on Android Emulator

# Code quality
npm run type-check     # TypeScript type checking
npm run lint           # ESLint

# Building
npx expo prebuild      # Generate native projects
```

## Architecture

This is a React Native + Expo mobile app that syncs and plays downloaded YouTube videos from a LearnifyTube desktop companion app over local WiFi.

### Core Data Flow

1. **Connection**: User enters desktop server IP → `useConnectionStore` persists connection
2. **Sync**: App fetches video list via `api.ts` → downloads via `downloader.ts` → stores metadata in `useLibraryStore`
3. **Playback**: Videos play from local storage with synchronized transcript auto-scrolling

### Key Modules

- **`services/api.ts`**: REST client for desktop server (`/api/info`, `/api/videos`, `/api/video/:id/*`)
- **`services/downloader.ts`**: Uses expo-file-system SDK 54+ `Paths`/`Directory`/`File` API for video downloads with progress tracking
- **`stores/`**: Zustand stores with AsyncStorage persistence
  - `library.ts`: Video collection state
  - `connection.ts`: Server connection state

### Routing (Expo Router)

- `app/index.tsx` - Library screen (home)
- `app/connect.tsx` - Desktop connection modal
- `app/player/[id].tsx` - Video player with interactive transcript

### Video Player

Uses `expo-video` with:
- `useVideoPlayer` hook for playback control
- Real-time `timeUpdate` events for transcript synchronization
- Tap-to-seek on transcript segments

## Tech Stack

- Expo SDK 54 with New Architecture enabled
- React 19 / React Native 0.81
- expo-router for file-based routing (typed routes enabled)
- Zustand for state management
- expo-video for playback
- expo-file-system (SDK 54 Paths API)
