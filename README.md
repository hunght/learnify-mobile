# LearnifyTube Mobile

Android companion app for LearnifyTube - sync and watch your downloaded YouTube videos offline.

## Features

- Sync videos from LearnifyTube desktop app over local WiFi
- Offline video playback
- Interactive transcript with tap-to-seek
- Auto-scrolling transcript during playback
- Dark theme optimized for viewing

## Getting Started

### Prerequisites

- Node.js 18+
- Android Emulator or Android device (USB/Wi-Fi debugging)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android Emulator
npm run android
```

### Connecting to Desktop

1. Open LearnifyTube on your computer
2. Go to Settings > Sync
3. Enable "Allow mobile sync"
4. Note the IP address displayed
5. Open the mobile app and enter the IP address

## CI/CD (100% Free)

Only one workflow is kept:
1. `Build Release APK` (`.github/workflows/android-apk.yml`)
2. Triggers: manual (`workflow_dispatch`) and tag push (`v*`)
3. On tag push (`refs/tags/v*`), CI builds APK and publishes a GitHub Release with the APK attached

### Manual Build + Download

```bash
# Trigger release APK build manually
gh workflow run "Build Release APK" --ref main

# Watch the latest run for this workflow
RUN_ID=$(gh run list --workflow "Build Release APK" --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID"

# Download artifact
gh run download "$RUN_ID" -n learnify-mobile-release-apk -D ./dist-apk

# Install on connected device
adb install -r ./dist-apk/*.apk
```

### Tagged Release (Auto Publish)

```bash
# From a clean main branch, bump version + versionCode + commit + tag + push
# CI auto-runs on the pushed tag and publishes:
# https://github.com/hunght/learnify-mobile/releases
npm run release:android
```

### Automation Scripts

```bash
# Trigger + wait + download release APK
bash ./scripts/gh-android-apk.sh

# Same flow on another ref and auto-install
bash ./scripts/gh-android-apk.sh --ref main --install

# Download latest successful release APK and install to running emulator
npm run test:emulator:apk

# If no emulator is running, script can auto-start one (first AVD by default)
bash ./scripts/test-emulator-apk.sh

# Use a specific run + emulator device id
bash ./scripts/test-emulator-apk.sh --run-id 22101650905 --device emulator-5554

# Choose which AVD to auto-start
bash ./scripts/test-emulator-apk.sh --avd Pixel_8_API_35

# Bump version + versionCode + commit + tag + push + wait for tag-triggered release workflow
npm run release:android
```

## Local Build

```bash
# Generate native projects
npx expo prebuild

# Build Android APK
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/
```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Library screen (home)
│   ├── connect.tsx        # Desktop connection screen
│   └── player/[id].tsx    # Video player with transcript
├── components/            # Reusable UI components
├── services/              # API client and file downloader
├── stores/                # Zustand state stores
├── types/                 # TypeScript type definitions
└── assets/                # Images and icons
```

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Video Player**: expo-video
- **File System**: expo-file-system
- **CI/CD**: GitHub Actions + Fastlane

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
