# ⚡ Quick Start Guide

Get Multistream running in 3 minutes!

## 🎯 TL;DR

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start streaming!

## 📝 Step-by-Step

### 1️⃣ Installation

```bash
# Clone (if not already done)
git clone <your-repo>
cd multistream

# Install dependencies
npm install
```

### 2️⃣ Start Development Server

```bash
npm run dev
```

Your app will be running at `http://localhost:3000`

### 3️⃣ Add Your First Stream

1. Copy a stream URL:
   - Twitch: `https://twitch.tv/channelname`
   - YouTube: `https://youtube.com/watch?v=VIDEO_ID`
   - Kick: `https://kick.com/channelname`

2. Paste it in the input field

3. Click "Add Stream"

### 4️⃣ Choose a Layout

Click one of the layout buttons:
- **Single** - One stream
- **2x1** - Two side-by-side
- **2x2** - Four in a grid
- **1+2** - One large + two small
- And more!

### 5️⃣ Try Theater Mode

Click on any stream to focus on it!

### 6️⃣ Save Your Setup

1. Click "Save Layout"
2. Give it a name
3. Load it later from "Saved Layouts"

## 🎨 Example Streams to Try

### Twitch
```
https://twitch.tv/xqc
https://twitch.tv/shroud
https://twitch.tv/pokimane
```

### YouTube
```
https://youtube.com/watch?v=jfKfPfyJRdk (Lofi Girl)
https://youtube.com/watch?v=5qap5aO4i9A (24/7 Stream)
```

### Kick
```
https://kick.com/xqc
```

## ⌨️ Tips & Tricks

### Quick Layout Setup
1. Add 4 streams
2. Try the **2x2** layout for equal viewing
3. Or use **1+3** to focus on one main stream

### Theater Mode
- Click any stream to enter theater mode
- Other streams dim but stay visible
- Click again to exit

### Saving Layouts
- Save different layouts for different purposes
- Example: "Gaming Streams", "IRL Streams", "Chill Music"

### Mobile Usage
- All layouts work on mobile
- Best experience in landscape mode
- Pinch to zoom on individual streams

## 🚨 Troubleshooting

### Stream Not Loading?
- Check if URL is correct
- Some streams may have embedding restrictions
- Try a different stream to verify

### Twitch Stream Black Screen?
- In production, you need to configure `NEXT_PUBLIC_TWITCH_PARENT`
- Works fine in development (localhost)

### Port Already in Use?
- Next.js will automatically use next available port
- Check console output for actual port number

## 🔧 Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [FEATURES.md](FEATURES.md) for roadmap
- See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting options
- Review [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## 💡 Pro Tips

1. **Start with 2x1 layout** for beginners
2. **Use Theater Mode** when one stream has important action
3. **Save your favorite setups** for quick access
4. **Try different layouts** to find what works best for you

---

**Happy Streaming!** 🎉

Need help? Open an issue on GitHub!
