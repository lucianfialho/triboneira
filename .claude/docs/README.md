# 📺 Multistream

This initial commit establishes the main branch of the project repository. It includes the foundational documentation and structure for the Multistream web application.

A beautiful, modern web application for watching multiple live streams simultaneously from Twitch, YouTube, and Kick.

![Multistream Preview](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎬 Multi-Platform Support
- **Twitch** - Watch your favorite Twitch streamers
- **YouTube** - Support for YouTube live streams and videos
- **Kick** - Stream from Kick channels

### 🎨 Beautiful Layouts
- **Single Stream (1x1)** - Focus on one stream
- **Side by Side (2x1)** - Two streams horizontally
- **Triple Horizontal (3x1)** - Three streams in a row
- **Quad View (2x2)** - Four streams in a grid
- **Main + Two (1+2)** - One large stream with two smaller ones
- **Main + Three (1+3)** - One large stream with three smaller ones
- **Picture-in-Picture (PiP)** - Floating overlay mode

### 🎭 Theater Mode
Click on any stream to enter **Theater Mode** - focuses on one stream while dimming others. Perfect for when you want to concentrate on one stream but keep an eye on others!

### 💾 Save & Load Layouts
- Save your favorite stream combinations
- Name your layouts for easy identification
- Quick load previously saved configurations
- Persistent storage using localStorage

### 🎯 Smart URL Parsing
Just paste any supported stream URL:
- `https://twitch.tv/channelname`
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://kick.com/channelname`

### 📱 Responsive Design
Fully optimized for desktop, tablet, and mobile devices.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd multistream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎮 How to Use

1. **Add Streams**
   - Paste a stream URL in the input field
   - Click "Add Stream" or press Enter
   - Repeat for multiple streams

2. **Choose Layout**
   - Select from pre-defined layouts based on stream count
   - Layouts automatically adjust to optimal viewing

3. **Theater Mode**
   - Click on any stream to focus on it
   - Click again to exit theater mode
   - Or use the Theater Mode toggle button

4. **Save Your Setup**
   - Click "Save Layout" to store your current configuration
   - Give it a memorable name
   - Access saved layouts from the "Saved Layouts" dropdown

5. **Clear All**
   - Remove all streams with one click
   - Fresh start for a new viewing session

## 🏗️ Project Structure

```
multistream/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── streams/
│   │   ├── StreamEmbed.tsx    # Individual stream component
│   │   └── StreamGrid.tsx     # Grid layout manager
│   └── ui/
│       ├── LayoutSelector.tsx  # Layout chooser
│       ├── StreamInput.tsx     # URL input component
│       ├── SavedLayouts.tsx    # Saved layouts dropdown
│       └── SaveLayoutModal.tsx # Save dialog
├── lib/
│   ├── urlParser.ts      # URL parsing logic
│   ├── layoutConfig.ts   # Layout configurations
│   └── storage.ts        # LocalStorage manager
└── types/
    └── index.ts          # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: React Hooks
- **Storage**: Browser localStorage

## 🎨 Key Features Implementation

### URL Parser
The `URLParser` class intelligently detects and parses stream URLs from multiple platforms, extracting necessary IDs and generating proper embed URLs.

### Layout System
Pre-configured responsive grid layouts using CSS Grid with Tailwind classes. Each layout specifies max streams, grid classes, and individual item positioning.
### Theater Mode
Dynamic opacity and scale transforms create a focus effect on the selected stream while maintaining visibility of other streams.

### Storage Manager
Handles all localStorage operations with proper error handling and type safety for saving and loading stream configurations.

## 🔧 Configuration

### Adding New Platforms

To add support for a new streaming platform:

1. Update `Platform` type in `types/index.ts`
2. Add parser method in `lib/urlParser.ts`
3. Add platform icon and colors
4. Test with sample URLs

### Custom Layouts

Add new layouts in `lib/layoutConfig.ts`:

```typescript
'custom': {
  type: 'custom',
  name: 'Custom Layout',
  description: 'Your description',
  maxStreams: 4,
  gridClass: 'grid-cols-2 grid-rows-2',
  itemClasses: ['...'],
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by multistream viewing needs

## 📞 Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

---

**Happy Streaming!** 🎉
