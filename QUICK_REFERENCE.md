# Quick Reference - Multistream Design

Referência rápida para desenvolvimento e manutenção.

---

## Arquivos Principais

```
/app
  ├── page.tsx          # Componente principal (15KB)
  ├── layout.tsx        # Layout root (565B)
  └── globals.css       # Design system (8.2KB)

/lib
  └── utils.ts          # Utilities (cn function)

/components/ui
  ├── button.tsx        # Shadcn Button
  ├── input.tsx         # Shadcn Input
  ├── card.tsx          # Shadcn Card
  ├── badge.tsx         # Shadcn Badge
  └── separator.tsx     # Shadcn Separator

/docs
  ├── DESIGN_SYSTEM.md        # Design tokens e decisões
  ├── UI_GUIDE.md             # Manual do usuário
  ├── VISUAL_STRUCTURE.md     # Estrutura visual
  ├── EXAMPLES.md             # Casos de uso
  └── DESIGN_IMPLEMENTATION.md # Resumo técnico
```

---

## CSS Variables (Design Tokens)

### Colors
```css
/* Backgrounds */
--background: 220 15% 6%;
--surface: 220 15% 9%;
--surface-elevated: 220 15% 11%;

/* Text */
--foreground: 220 10% 98%;
--muted-foreground: 220 10% 65%;
--subtle-foreground: 220 10% 45%;

/* Borders */
--border: 220 15% 15%;
--border-strong: 220 15% 20%;

/* Accents */
--primary: 270 80% 65%;        /* Purple */
--secondary: 320 80% 65%;      /* Pink */
```

### Spacing (4pt/8pt Grid)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
```

### Border Radius
```css
--radius-sm: 0.5rem;   /* 8px */
--radius-md: 0.75rem;  /* 12px */
--radius-lg: 1rem;     /* 16px */
--radius-xl: 1.5rem;   /* 24px */
```

### Animations
```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## Utility Classes

### Glassmorphism
```tsx
className="glass-card"
// → backdrop-blur + gradient bg + border + shadow + hover
```

### Gradients
```tsx
className="gradient-text"
// → Purple→Pink gradient text

className="gradient-button"
// → Purple→Pink gradient button with hover
```

### Layouts
```tsx
className="layout-grid-1x1"  // 1 column
className="layout-grid-2x1"  // 2 columns
className="layout-grid-2x2"  // 2 columns
className="layout-grid-3x1"  // 3 columns
className="layout-grid-3x2"  // 3 columns
```

### Animations
```tsx
className="animate-fade-in"    // Opacity 0→1
className="animate-slide-up"   // Y +12px→0
className="animate-scale-in"   // Scale 0.96→1
```

---

## Component Patterns

### Glass Card
```tsx
<div className="glass-card p-3 group">
  {/* content */}
</div>
```

### Gradient Button
```tsx
<Button className="gradient-button">
  <Icon className="w-4 h-4 mr-2" />
  Label
</Button>
```

### Stream Container
```tsx
<div className="stream-container">
  <iframe src={embedUrl} />
  <div className="absolute top-3 left-3">
    {/* platform badge */}
  </div>
</div>
```

### Platform Badge
```tsx
<div className={`bg-gradient-to-br ${getPlatformColor(platform)}`}>
  {getPlatformIcon(platform)}
  <span>{platform}</span>
</div>
```

---

## State Management

### Streams
```tsx
const [streams, setStreams] = useState<Stream[]>([]);

interface Stream {
  id: string;
  url: string;
  platform: 'twitch' | 'youtube' | 'kick';
  title?: string;
}
```

### Layout
```tsx
const [layout, setLayout] = useState<LayoutType>('2x2');

type LayoutType = '1x1' | '2x1' | '2x2' | '3x1' | '3x2';
```

### Input
```tsx
const [inputUrl, setInputUrl] = useState('');
```

---

## Helper Functions

### Detect Platform
```tsx
const detectPlatform = (url: string): Platform | null => {
  if (url.includes('twitch.tv')) return 'twitch';
  if (url.includes('youtube.com')) return 'youtube';
  if (url.includes('kick.com')) return 'kick';
  return null;
};
```

### Get Embed URL
```tsx
const getPlatformEmbed = (url: string, platform: Platform): string => {
  switch (platform) {
    case 'twitch':
      const channel = url.split('twitch.tv/')[1];
      return `https://player.twitch.tv/?channel=${channel}`;
    // ...
  }
};
```

### Platform Colors
```tsx
const getPlatformColor = (platform: Platform): string => {
  return {
    twitch: 'from-purple-500 to-purple-600',
    youtube: 'from-red-500 to-red-600',
    kick: 'from-green-500 to-green-600'
  }[platform];
};
```

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (max-width: 1024px) {
  .layout-grid-* {
    grid-cols-1;  /* Force single column */
  }

  .sidebar {
    width: 100%;
    border-right: 0;
    border-bottom: 1px;
  }
}
```

---

## Typography Scale

```tsx
// H1 - Page Title
className="text-3xl lg:text-4xl font-bold"

// H2 - Section Header
className="text-lg font-bold"

// H3 - Subsection
className="text-sm font-semibold"

// Body - Default
className="text-sm"

// Caption - Small
className="text-xs"

// Micro - Tiny
className="text-[10px]"
```

---

## Color Patterns

### Text Colors
```tsx
// Primary text
className="text-[hsl(var(--foreground))]"

// Secondary text
className="text-[hsl(var(--muted-foreground))]"

// Tertiary text
className="text-[hsl(var(--subtle-foreground))]"
```

### Background Colors
```tsx
// Base background
className="bg-[hsl(var(--background))]"

// Surface
className="bg-[hsl(var(--surface))]"

// Surface elevated
className="bg-[hsl(var(--surface-elevated))]"
```

### Border Colors
```tsx
// Subtle border
className="border-[hsl(var(--border))]"

// Strong border
className="border-[hsl(var(--border-strong))]"

// Primary border (hover)
className="hover:border-[hsl(var(--primary))]"
```

---

## Animation Delays (Stagger)

```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-scale-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* content */}
  </div>
))}
```

---

## Common Spacing Combinations

### Sidebar
```tsx
// Section spacing
className="flex flex-col gap-6"  // 24px between sections

// Card padding
className="p-3"  // 12px internal padding
```

### Main Content
```tsx
// Page padding
className="p-8 lg:p-12"  // 32px → 48px

// Grid gap
className="gap-6"  // 24px between streams
```

### Cards
```tsx
// Internal spacing
className="flex flex-col gap-3"  // 12px between elements
className="flex items-center gap-2"  // 8px between icons/text
```

---

## Icon Sizes

```tsx
// Small (badges, inline)
className="w-3.5 h-3.5"  // 14px

// Medium (buttons, headers)
className="w-4 h-4"  // 16px

// Large (empty state)
className="w-10 h-10"  // 40px
```

---

## Button Sizes

```tsx
// Default
<Button className="h-11">  // 44px height

// Small
<Button size="sm" className="h-7">  // 28px height

// Icon only
<Button size="sm" className="h-7 w-7 p-0">
```

---

## Shadow Utilities

```tsx
// Small
className="shadow-[var(--shadow-sm)]"

// Medium
className="shadow-[var(--shadow-md)]"

// Large
className="shadow-[var(--shadow-lg)]"

// Extra large
className="shadow-[var(--shadow-xl)]"

// Glow (purple)
className="shadow-[0_0_20px_hsl(270_80%_65%_/_0.3)]"
```

---

## Testing Checklist

### Visual
- [ ] All animations working
- [ ] Hover states visible
- [ ] Focus states working
- [ ] No layout shift
- [ ] Responsive at 1024px

### Functional
- [ ] Add stream works
- [ ] Remove stream works
- [ ] Layout change works
- [ ] Platform detection works
- [ ] Embeds load correctly

### Performance
- [ ] No console errors
- [ ] Fast load time
- [ ] Smooth animations
- [ ] No memory leaks

---

## Common Tasks

### Add New Layout
1. Update `LayoutType` type
2. Add to `layoutConfigs` object
3. Add icon from lucide-react
4. Test responsiveness

### Change Color Scheme
1. Update CSS variables in `globals.css`
2. Test contrast ratios
3. Update gradients
4. Check all states

### Add New Platform
1. Add to `Platform` type
2. Update `detectPlatform()`
3. Update `getPlatformEmbed()`
4. Add platform colors
5. Add platform icon
6. Test embed

---

## Debug Commands

```bash
# Clear cache
rm -rf .next

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build test
npm run build
```

---

## Performance Tips

### Optimize Streams
- Limit to 4-6 streams max
- Lower quality for many streams
- Only 1 stream with audio

### Code Optimization
- Use React.memo for expensive components
- Lazy load heavy components
- Debounce input handlers
- Virtual scrolling for long lists

### CSS Optimization
- Use transforms (GPU accelerated)
- Avoid layout thrashing
- Minimize repaints
- Use will-change sparingly

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |
| Opera   | Latest  | ⚠️ Partial |

---

## Useful Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

### Design Inspiration
- [Spotify Web](https://open.spotify.com)
- [Discord](https://discord.com)
- [Linear](https://linear.app)
- [Twitch](https://twitch.tv)

### Tools
- [Coolors](https://coolors.co) - Color palettes
- [Type Scale](https://typescale.com) - Typography
- [Spacing Calculator](https://spacing.bradwoods.io) - 4pt/8pt grid
- [OKLCH Color Picker](https://oklch.com) - Modern colors

---

## Git Workflow

```bash
# Feature branch
git checkout -b feature/new-layout

# Make changes
git add .
git commit -m "Add 4×2 layout option"

# Push
git push origin feature/new-layout

# After review
git checkout main
git merge feature/new-layout
```

---

## Environment Variables

```env
# .env.local (if needed in future)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_ANALYTICS_ID=
```

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Maintenance
npm run lint         # Lint code
npm install <pkg>    # Install dependency
npm update           # Update dependencies
```

---

## Component Import Paths

```tsx
// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Utilities
import { cn } from '@/lib/utils';

// Icons
import { Plus, Trash2, Layout } from 'lucide-react';
```

---

**Last Updated:** November 16, 2025
**Version:** 1.0.0
