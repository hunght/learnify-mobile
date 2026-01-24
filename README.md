# LearnifyTube Mobile

Mobile companion app for LearnifyTube - sync and watch your downloaded YouTube videos offline on iOS and Android.

## Features

- Sync videos from LearnifyTube desktop app over local WiFi
- Offline video playback
- Interactive transcript with tap-to-seek
- Auto-scrolling transcript during playback
- Dark theme optimized for viewing

## Getting Started

### Prerequisites

- Node.js 18+
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

### Connecting to Desktop

1. Open LearnifyTube on your computer
2. Go to Settings > Sync
3. Enable "Allow mobile sync"
4. Note the IP address displayed
5. Open the mobile app and enter the IP address

## Build

### Automated Builds (GitHub Actions)

This project uses **free GitHub Actions** for building - no paid services required.

**Trigger a build:**
1. Go to Actions tab in GitHub
2. Select "Build" workflow
3. Click "Run workflow"
4. Choose platform (android/ios/all)

**Automatic releases:**
- Push a tag like `v1.0.0` to automatically build and create a GitHub Release with APK/iOS artifacts

### Local Build

```bash
# Generate native projects
npx expo prebuild

# Build Android APK
cd android && ./gradlew assembleRelease
# APK will be at: android/app/build/outputs/apk/release/

# Build iOS (macOS only)
cd ios && pod install
xcodebuild -workspace LearnifyTube.xcworkspace \
  -scheme LearnifyTube \
  -configuration Release \
  -sdk iphoneos
```

### Signing for Distribution

**Android:**
1. Generate a keystore: `keytool -genkeypair -v -keystore release.keystore -alias learnify -keyalg RSA -keysize 2048 -validity 10000`
2. Add to `android/app/build.gradle` signing config
3. Build with `./gradlew assembleRelease`

**iOS:**
- Requires Apple Developer account ($99/year)
- Or distribute via TestFlight/Ad-hoc

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

- **Framework**: React Native + Expo (managed workflow)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Video Player**: expo-video
- **File System**: expo-file-system

## CI/CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | Push/PR to main | Type check, Expo Doctor |
| Build | Tags (`v*`) or manual | Build APK/iOS, upload to Release |

All builds are **free** using GitHub Actions runners (unlimited for public repos).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
