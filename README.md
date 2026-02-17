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

All CI/CD runs on **free GitHub Actions** - no paid services required.

### Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push/PR to main | Type check |
| **Build Android (Dev)** | Manual | Build Android APK for testing |
| **Android APK (Downloadable)** | Push to main (mobile changes) or manual | Build installable APK artifact |
| **Release Android** | Tags (`v*`) or manual | Build release APK/AAB + publish GitHub Release assets |

### Direct APK Delivery (No Play Store)

Use the `Android APK (Downloadable)` workflow for installable APK files that can be downloaded from Actions artifacts.

No extra secrets are required for this workflow.

### Trigger + Download with GitHub CLI

```bash
# 1) Trigger a release APK build
gh workflow run "Android APK (Downloadable)" -f build_type=release

# 2) Watch the latest run for this workflow
RUN_ID=$(gh run list --workflow "Android APK (Downloadable)" --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID"

# 3) Download APK artifact from that run
gh run download "$RUN_ID" -n learnify-mobile-release-apk -D ./dist-apk

# 4) Install on a connected Android device
adb install -r ./dist-apk/*.apk
```

### One-Command Automation Script

Prerequisites: authenticated GitHub CLI (`gh auth login`). For `--install`, Android Platform Tools (`adb`) must be in `PATH`.

```bash
# Trigger + wait + download artifact
bash ./scripts/gh-android-apk.sh

# Debug build on main and install to connected device
bash ./scripts/gh-android-apk.sh --build-type debug --ref main --install
```

### Auto Release New Version (Android)

```bash
# Patch release: bump version + android.versionCode + commit + tag + push
npm run release:android

# Minor/major bump
bash ./scripts/release-android.sh --bump minor

# Explicit version
bash ./scripts/release-android.sh --version 1.2.0
```

This will:
1. Build Android AAB + APK
2. Optionally upload to Google Play internal track (if `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` is set)
3. Create/Update GitHub Release and attach downloadable `.apk` and `.aab` files

### Store Submission Costs

| Item | Cost | Notes |
|------|------|-------|
| GitHub Actions | **FREE** | Unlimited for public repos |
| Google Play Developer | **$25** | One-time fee |

### GitHub Secrets Required

To enable automatic store submission, add these secrets to your repo:

#### Android (Google Play)

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64 encoded release keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Play API service account JSON |

**Setup:**
```bash
# Generate keystore
keytool -genkeypair -v -keystore release.keystore -alias learnify -keyalg RSA -keysize 2048 -validity 10000

# Encode to base64
base64 -i release.keystore | pbcopy  # macOS
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
