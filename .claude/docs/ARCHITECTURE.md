# 🏗️ Architecture Overview

This document provides a technical overview of the Multistream application architecture.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Client                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Next.js App (Client-Side)                │  │
│  │                                                    │  │
│  │  ┌──────────────┐      ┌──────────────────────┐  │  │
│  │  │  React       │      │  State Management    │  │  │
│  │  │  Components  │◄────►│  (React Hooks)       │  │  │
│  │  └──────────────┘      └──────────────────────┘  │  │
│  │         │                        │                 │  │
│  │         ▼                        ▼                 │  │
│  │  ┌──────────────┐      ┌──────────────────────┐  │  │
│  │  │  Tailwind    │      │  localStorage        │  │  │
│  │  │  CSS         │      │  (Saved Layouts)     │  │  │
│  │  └──────────────┘      └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              External Streaming Platforms                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Twitch  │    │ YouTube  │    │   Kick   │         │
│  │  Embed   │    │  Embed   │    │  Embed   │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
multistream/
│
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main application page (home)
│   ├── layout.tsx                # Root layout with metadata
│   └── globals.css               # Global styles & Tailwind imports
│
├── components/                   # React Components
│   ├── streams/                  # Stream-related components
│   │   ├── StreamEmbed.tsx       # Individual stream player with overlay
│   │   └── StreamGrid.tsx        # Grid layout manager for streams
│   │
│   └── ui/                       # UI components
│       ├── LayoutSelector.tsx    # Layout selection buttons
│       ├── StreamInput.tsx       # URL input with validation
│       ├── SavedLayouts.tsx      # Saved layouts dropdown
│       └── SaveLayoutModal.tsx   # Save dialog modal
│
├── lib/                          # Utility libraries
│   ├── urlParser.ts              # URL parsing & validation
│   ├── layoutConfig.ts           # Layout definitions
│   └── storage.ts                # localStorage wrapper
│
├── types/                        # TypeScript definitions
│   └── index.ts                  # All type definitions
│
└── Configuration Files
    ├── next.config.ts            # Next.js configuration
    ├── tsconfig.json             # TypeScript configuration
    ├── tailwind.config.ts        # Tailwind CSS configuration
    └── postcss.config.mjs        # PostCSS configuration
```

## 🔄 Data Flow

### Adding a Stream

```
User Input (URL)
    │
    ▼
StreamInput Component
    │
    ▼
URLParser.parseURL()
    │
    ├─► Twitch Pattern Match
    ├─► YouTube Pattern Match
    └─► Kick Pattern Match
    │
    ▼
Generate StreamData Object
    │
    ▼
Update State (useState)
    │
    ▼
StreamGrid Re-renders
    │
    ▼
StreamEmbed Creates iframe
```

### Layout Changes

```
User Clicks Layout Button
    │
    ▼
LayoutSelector Component
    │
    ▼
onLayoutChange(type)
    │
    ▼
Update layoutType State
    │
    ▼
getLayoutConfig(type)
    │
    ▼
StreamGrid Re-renders with New Grid Classes
    │
    ▼
CSS Grid Transition
```

### Theater Mode

```
User Clicks Stream
    │
    ▼
StreamEmbed.onFocus()
    │
    ▼
Update theaterMode State
    │
    ▼
StreamGrid Re-renders
    │
    ▼
Apply opacity/scale to Other Streams
```

### Save/Load Layouts

```
Save:
User → SaveLayoutModal → StorageManager.saveLayout() → localStorage

Load:
SavedLayouts → User Selection → StorageManager.getSavedLayouts() →
    → Update State → Restore Layout
```

## 🎨 Component Hierarchy

```
App (page.tsx)
│
├── StreamInput
│   └── Form with URL validation
│
├── LayoutSelector
│   └── Layout buttons with icons
│
├── SavedLayouts (dropdown)
│   └── List of saved layouts
│
├── StreamGrid
│   └── StreamEmbed (multiple)
│       ├── iframe (actual stream)
│       ├── Loading skeleton
│       ├── Info overlay
│       └── Remove button
│
└── SaveLayoutModal
    └── Form dialog
```

## 🔌 State Management

### Main State (in page.tsx)

```typescript
// Stream management
const [streams, setStreams] = useState<StreamData[]>([])

// Layout configuration
const [layoutType, setLayoutType] = useState<LayoutType>('2x2')

// Theater mode state
const [theaterMode, setTheaterMode] = useState<TheaterMode>({
  isActive: false,
  focusedStreamId: null
})

// Modal visibility
const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
```

### State Flow

- **Unidirectional data flow** (React pattern)
- **Props down, events up** pattern
- **No global state library needed** (React hooks sufficient)
- **localStorage for persistence** (saved layouts)

## 🎯 Key Design Patterns

### 1. **Composition Pattern**
Components are composed of smaller, reusable parts.

```typescript
<StreamGrid>
  <StreamEmbed />
  <StreamEmbed />
</StreamGrid>
```

### 2. **Container/Presentational Pattern**
- `page.tsx` = Container (logic)
- UI components = Presentational (display)

### 3. **Controlled Components**
Form inputs managed by React state.

```typescript
<input value={url} onChange={(e) => setUrl(e.target.value)} />
```

### 4. **Render Props Pattern**
Callbacks for user interactions.

```typescript
<StreamEmbed
  onRemove={() => handleRemoveStream(id)}
  onFocus={() => handleFocusStream(id)}
/>
```

## 🔧 Core Utilities

### URLParser

**Purpose**: Parse and validate stream URLs

**Methods**:
- `parseURL(url)` - Main parser
- `parseTwitchURL(url)` - Twitch-specific
- `parseYouTubeURL(url)` - YouTube-specific
- `parseKickURL(url)` - Kick-specific
- `getPlatformIcon(platform)` - Platform emoji
- `getPlatformColor(platform)` - Platform gradient

**Pattern Matching**:
```typescript
// Twitch: /twitch.tv/channelname
// YouTube: /watch?v=ID or /live/ID or youtu.be/ID
// Kick: /kick.com/channelname
```

### LayoutConfig

**Purpose**: Define grid layouts

**Structure**:
```typescript
{
  type: '2x2',
  name: 'Quad View',
  maxStreams: 4,
  gridClass: 'grid-cols-2 grid-rows-2',
  itemClasses: ['col-span-1 row-span-1', ...]
}
```

### StorageManager

**Purpose**: Manage localStorage operations

**Methods**:
- `getSavedLayouts()` - Retrieve all
- `saveLayout(name, type, streams)` - Save new
- `deleteLayout(id)` - Remove
- `updateLayout(id, updates)` - Modify

**Data Format**:
```typescript
{
  id: 'layout-1234567890',
  name: 'My Setup',
  layoutType: '2x2',
  streams: [...],
  createdAt: 1234567890
}
```

## 🎨 Styling Architecture

### Tailwind CSS Strategy

1. **Utility-First Approach**
   - Direct utility classes in JSX
   - No custom CSS files (except globals)

2. **Responsive Design**
   ```typescript
   className="px-3 sm:px-4 py-2"
   //        mobile   tablet/desktop
   ```

3. **Dynamic Classes**
   ```typescript
   className={`${condition ? 'active-class' : 'inactive-class'}`}
   ```

4. **Animation Classes**
   - `animate-fade-in`
   - `animate-slide-up`
   - `animate-scale-in`

### Custom Theme Extensions

```typescript
// tailwind.config.ts
theme: {
  extend: {
    animation: { ... },
    keyframes: { ... }
  }
}
```

## 🔐 Type Safety

### TypeScript Usage

**Core Types**:
```typescript
Platform: 'twitch' | 'youtube' | 'kick'
LayoutType: '1x1' | '2x2' | '1+2' | ...
StreamData: { id, platform, url, embedUrl, ... }
TheaterMode: { isActive, focusedStreamId }
```

**Benefits**:
- Compile-time error checking
- IntelliSense support
- Refactoring safety
- Self-documenting code

## 📱 Responsive Strategy

### Breakpoints

```css
sm:  640px   /* Tablet */
md:  768px   /* Desktop */
lg:  1024px  /* Large desktop */
xl:  1280px  /* Extra large */
2xl: 1536px  /* Ultra wide */
```

### Mobile-First Approach

```typescript
// Mobile by default
className="text-xs"

// Tablet and up
className="text-xs sm:text-sm"

// Desktop and up
className="text-xs sm:text-sm lg:text-base"
```

## 🚀 Performance Considerations

### Current Optimizations

1. **React 19 Features**
   - Automatic batching
   - Concurrent rendering
   - Server Components (ready for future)

2. **Next.js Optimizations**
   - Automatic code splitting
   - Image optimization (if images added)
   - Font optimization

3. **Lazy Loading**
   - Components load on demand
   - iframes load when visible

### Future Optimizations

- [ ] Virtual scrolling for many streams
- [ ] Stream quality auto-adjustment
- [ ] Bandwidth detection
- [ ] Service worker for offline support

## 🧪 Testing Strategy (Future)

### Unit Tests
- URLParser functions
- StorageManager operations
- Layout configuration logic

### Component Tests
- StreamEmbed rendering
- StreamInput validation
- Layout switching

### E2E Tests
- Add/remove streams
- Save/load layouts
- Theater mode toggle

## 📈 Scalability

### Current Limits
- **Streams**: Limited by layout (1-4)
- **Storage**: localStorage (~5-10MB)
- **Performance**: Browser-dependent

### Future Scaling
- Backend API for unlimited storage
- Database for user accounts
- CDN for static assets
- Redis for caching

## 🔒 Security Considerations

### Current Implementation
- Client-side only (no backend)
- No user data collection
- localStorage only (local to browser)
- No authentication needed

### Production Considerations
- CSP headers for iframe security
- CORS configuration
- Rate limiting (if API added)
- Input sanitization (already done)

---

**Questions about the architecture?** Open an issue!
