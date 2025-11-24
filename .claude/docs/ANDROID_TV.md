# Android TV PWA - Documentation

## Overview
The Entrega Newba Multistream app is now optimized for Android TV deployment via Trusted Web Activity (TWA). This allows users to install the app from the Google Play Store directly on their Smart TVs.

## Features Implemented

### 1. Service Worker
- **File**: `public/sw.js`
- **Purpose**: Offline functionality and PWA installability
- **Cache Strategy**: 
  - Static assets: Cache-first
  - API calls: Network-first with cache fallback
- **Auto-update**: Checks for updates every minute

### 2. TV Navigation (D-pad Support)
- **File**: `hooks/use-tv-navigation.ts`
- **Keyboard Controls**:
  - `Arrow Up`/`Down`: Navigate between focusable elements
  - `Enter`: Activate/click focused element
  - `Escape`/`Backspace`: Go back (customizable)
- **Auto-detection**: Detects TV devices via user agent and screen size
- **TV Mode Class**: Automatically adds `tv-mode` class to body for styling

### 3. 10-Foot UI Optimizations
- **File**: `app/globals.css`
- **Optimizations**:
  - Larger buttons (min 56px on large screens, 60px in TV mode)
  - Enhanced focus states (4px solid outline with scale effect)
  - Increased font sizes (120% in TV mode, 18px base on 1920px+ screens)
  - Better spacing and readability from distance
  - Thicker borders on focused elements

### 4. Manifest Enhancements
- **File**: `public/site.webmanifest`
- **TV-specific settings**:
  - `display: "fullscreen"` - No browser chrome
  - `orientation: "landscape"` - Force landscape mode
  - `purpose: "any maskable"` - Adaptive icons for Android
  - `categories: ["entertainment", "utilities"]` - Play Store categories

## Testing

### Local Testing

1. **Desktop Browser (Keyboard Navigation)**:
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000
   - Use Tab/Arrow keys to navigate
   - Press Enter to select
   - Verify focus indicators are visible

2. **PWA Installation**:
   - Open in Chrome
   - Click install icon in address bar
   - Verify app installs and works offline

3. **TV Simulation**:
   - Open DevTools (F12)
   - Device Toolbar (Ctrl+Shift+M)
   - Select "Responsive" > 1920x1080
   - Verify larger UI elements and enhanced focus states

### Production Testing
- Deploy to Vercel
- Test at https://entreganewba.com.br
- Verify Service Worker registration in DevTools > Application
- Check PWA score with Lighthouse (should be 90+)

## Packaging for Android TV (TWA)

### Prerequisites
```bash
npm install -g @bubblewrap/cli
```

### Step 1: Initialize TWA Project
```bash
bubblewrap init --manifest https://entreganewba.com.br/site.webmanifest
```

### Step 2: Configure for TV
Edit `twa-manifest.json`:
```json
{
  "packageId": "br.com.entreganewba.multistream",
  "host": "entreganewba.com.br",
  "name": "Entrega Newba Multistream",
  "launcherName": "Multistream",
  "display": "fullscreen",
  "orientation": "landscape",
  "themeColor": "#0f1419",
  "navigationColor": "#0f1419",
  "backgroundColor": "#0f1419",
  "enableNotifications": false,
  "startUrl": "/",
  "iconUrl": "https://entreganewba.com.br/android-chrome-512x512.png",
  "maskableIconUrl": "https://entreganewba.com.br/android-chrome-512x512.png",
  "monochromeIconUrl": "https://entreganewba.com.br/android-chrome-512x512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "./android.keystore",
    "alias": "multistream"
  },
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [],
  "generatorApp": "@bubblewrap/cli",
  "webManifestUrl": "https://entreganewba.com.br/site.webmanifest",
  "fallbackType": "customtabs",
  "features": {
    "locationDelegation": {
      "enabled": false
    }
  },
  "alphaDependencies": {
    "enabled": false
  }
}
```

### Step 3: Build APK
```bash
bubblewrap build
```

### Step 4: Test on Android TV
```bash
# Install on Android TV via ADB
adb connect <TV_IP_ADDRESS>
adb install app-release-signed.apk
```

### Step 5: Generate App Bundle for Play Store
```bash
bubblewrap build --skipPwaValidation
```
Output: `app-release-bundle.aab`

## Publishing to Google Play Store

### 1. Create Play Console Account
- Go to https://play.google.com/console
- Pay one-time $25 fee

### 2. Create New App
- Select "TV" as device category
- Upload `app-release-bundle.aab`
- Add screenshots (1920x1080 TV screenshots)
- Write description emphasizing multistream viewing

### 3.  Content Rating
- Complete questionnaire
- Select appropriate ratings

### 4. Submit for Review
- Can take 1-7 days
- Ensure all Play Store policies are met

## Next Steps

1. ✅ Service Worker implemented
2. ✅ Manifest optimized for TV
3. ✅ D-pad navigation added
4. ✅ 10-foot UI styles added
5. ⏳ Test on actual Android TV device
6. ⏳ Generate keystore and build TWA
7. ⏳ Submit to Play Store

## Troubleshooting

### Service Worker not registering
- Check HTTPS is enabled (required for SW)
- Verify `sw.js` is accessible at `/sw.js`
- Check browser console for errors

### Focus states not visible on TV
- Ensure TV mode is detected (check body class)
- Verify CSS is loaded
- Increase outline width if needed

### App won't install via TWA
- Verify PWA meets all criteria (Lighthouse check)
- Ensure manifest is valid JSON
- Check all icons are accessible

## Resources
- [Android TV Design Guidelines](https://developer.android.com/design/tv)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)
