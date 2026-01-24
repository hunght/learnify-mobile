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

## CI/CD (100% Free)

All CI/CD runs on **free GitHub Actions** - no paid services required.

### Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push/PR to main | Type check |
| **Build** | Manual | Build APK/iOS for testing |
| **Release** | Tags (`v*`) or manual | Build + submit to stores |

### Quick Release

```bash
# Create and push a tag to trigger auto-release
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build Android AAB + APK
2. Build iOS IPA
3. Upload to Google Play (internal track)
4. Upload to TestFlight
5. Create GitHub Release with artifacts

### Store Submission Costs

| Item | Cost | Notes |
|------|------|-------|
| GitHub Actions | **FREE** | Unlimited for public repos |
| Google Play Developer | **$25** | One-time fee |
| Apple Developer Program | **$99/year** | Required for App Store |

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

#### iOS (App Store)

| Secret | Description |
|--------|-------------|
| `APPLE_CERTIFICATE_BASE64` | Base64 encoded .p12 certificate |
| `APPLE_CERTIFICATE_PASSWORD` | Certificate password |
| `APPLE_PROVISIONING_PROFILE_BASE64` | Base64 encoded .mobileprovision |
| `APPLE_CODE_SIGN_IDENTITY` | e.g., "Apple Distribution: Your Name" |
| `APPLE_PROVISIONING_PROFILE_NAME` | Profile name |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from appleid.apple.com |

## Local Build

```bash
# Generate native projects
npx expo prebuild

# Build Android APK
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/

# Build iOS (macOS only)
cd ios && pod install
xcodebuild -workspace LearnifyTube.xcworkspace \
  -scheme LearnifyTube \
  -configuration Release \
  -sdk iphoneos
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
