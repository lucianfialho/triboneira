# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Entrega Newba is a multi-platform livestream viewer and CS:GO/CS2 esports data aggregation platform. It combines:
- **Frontend**: Next.js app for watching multiple streams simultaneously (Twitch, YouTube, Kick)
- **Data Pipeline**: HLTV data scraping and aggregation for CS:GO/CS2 tournaments, matches, teams, and players
- **Real-time Features**: Chat aggregation across platforms, live match tracking, event monitoring

## Commands

### Development
```bash
yarn dev              # Start Next.js development server (localhost:3000)
yarn build            # Build production Next.js app
yarn start            # Start production Next.js server
yarn lint             # Run ESLint
```

### Database (Drizzle ORM)
```bash
npx drizzle-kit generate   # Generate SQL migration files from schema changes
npx drizzle-kit migrate    # Apply migrations to database
npx drizzle-kit studio     # Open Drizzle Studio (database GUI)
```

Database connection uses PostgreSQL (Neon) via `DATABASE_URL` in `.env.local`.

## Architecture

### Frontend Structure

```
app/                          # Next.js App Router pages
├── page.tsx                  # Main multistream viewer
├── layout.tsx                # Root layout with SEO metadata
├── api/                      # API routes
│   ├── matches/              # Match data endpoints
│   ├── events/               # Tournament/event endpoints
│   ├── teams/                # Team data and H2H stats
│   ├── news/                 # News articles
│   └── stream-info/          # Streamer metadata
└── major/budapest-2025/      # Event-specific pages

components/
├── ui/                       # shadcn/ui components (Radix primitives)
├── chat/                     # Chat aggregation components
├── event-info/               # Tournament brackets, standings, teams
├── templates/                # Reusable page templates
└── match-card.tsx            # Match display components

lib/
├── db/                       # Database layer
│   ├── schema.ts             # Drizzle schema (21 tables)
│   └── client.ts             # Database client setup
├── services/                 # External service integrations
│   ├── hltv/                 # HLTV scrapers (Playwright + API)
│   ├── twitch.ts             # Twitch API
│   ├── youtube.ts            # YouTube API
│   ├── kick.ts               # Kick API
│   ├── news/                 # News scraping
│   └── content-generation/   # AI content generation
└── chat/                     # Chat connectors
    ├── chat-aggregator.ts    # Multi-platform chat aggregation
    ├── twitch-chat.ts        # TMI.js wrapper
    ├── youtube-chat.ts       # YouTube Live Chat
    └── kick-chat.ts          # Kick chat connector
```

### Database Schema (lib/db/schema.ts)

21-table relational schema for esports data:

**Core Entities:**
- `games` - Supported games (CS:GO/CS2)
- `events` - Tournaments/championships with `championshipMode` flag
- `teams` - Team data with rankings and metadata
- `players` - Player profiles
- `matches` - Match data with status tracking (scheduled/live/finished)

**Stats & Relationships:**
- `match_maps` - Per-map results
- `player_match_stats`, `player_map_stats` - Player performance
- `team_stats` - Aggregated team statistics
- `head_to_head` - H2H records between teams
- `swiss_rounds` - Swiss system tournament tracking

**News Pipeline:**
- `news` - News articles with translations
- `news_enrichment_queue` - AI processing queue
- `news_content_cache` - Scraped content
- `news_translations` - Multi-language support (pt-BR)
- `news_summaries` - Bullet-point summaries

**Key Patterns:**
- All external data uses `externalId` + `source` (HLTV, Liquipedia, etc.)
- Unique composite indexes prevent duplicates
- `metadata` JSONB fields for flexible data storage
- `championshipMode` boolean on events for featured tournaments

### Multi-Platform Chat System

The `ChatAggregator` class (lib/chat/chat-aggregator.ts) provides unified chat across platforms:

```typescript
// Platform connectors
- TwitchChatConnector (TMI.js)
- YouTubeChatConnector (YouTube API)
- KickChatConnector (client-side due to Cloudflare)

// Features
- Message throttling (50 msgs/sec)
- Queue management (500 msg buffer)
- Platform-agnostic message format
- Dynamic stream updates
```

**Note**: Kick chat is handled client-side to bypass Cloudflare protection.

### HLTV Data Scraping

Located in `lib/services/hltv/`:

```typescript
client.ts                # HLTV SDK wrapper with retry logic
playwright-scraper.ts    # Browser automation for Cloudflare-protected pages
match-details-scraper.ts # Match results, maps, vetoes
map-stats-scraper.ts     # Per-map player statistics
rankings-scraper.ts      # Team rankings
team-details-scraper.ts  # Roster information
swiss-scraper.ts         # Swiss system brackets
python-scraper.ts        # Python fallback for complex scraping
```

**Scraping Strategy:**
1. Try HLTV SDK first (fastest)
2. Fall back to Playwright for Cloudflare-protected content
3. Use Python scripts for advanced scraping needs
4. All scrapers include retry logic and rate limiting

### Content Generation System

`lib/services/content-generation/` provides automated social media content:

- Visual generation using Handlebars templates
- Match result graphics, upset alerts
- Event-driven content queue
- Discord webhook integration

## Development Patterns

### Path Aliases
Use `@/` prefix for imports (maps to project root):
```typescript
import { db } from '@/lib/db/client'
import { Button } from '@/components/ui/button'
```

### API Routes
All API routes return standardized JSON:
```typescript
{
  data: T | T[],
  count?: number,
  error?: string
}
```

### Database Queries
Use Drizzle ORM with relations:
```typescript
import { db } from '@/lib/db/client'
import { matches, teams } from '@/lib/db/schema'

const match = await db.query.matches.findFirst({
  where: eq(matches.id, matchId),
  with: { team1: true, team2: true, maps: true }
})
```

### Error Handling for Scrapers
All HLTV scrapers use `retryWithBackoff` helper:
```typescript
import { retryWithBackoff } from '@/lib/services/hltv/client'

const data = await retryWithBackoff(async () => {
  return await HLTV.getMatch({ id: matchId })
}, 3) // 3 retries with exponential backoff
```

### Championship Mode
Events can be marked as featured using `championshipMode`:
```typescript
// API: /api/matches?championshipMode=true
// Returns only matches from championship events
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (with custom PostCSS config)
- **UI Components**: Radix UI primitives + shadcn/ui patterns
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Scraping**: HLTV SDK, Playwright, custom Python scripts
- **Chat**: TMI.js (Twitch), YouTube API, WebSockets (Kick)
- **Analytics**: Amplitude with session replay
- **Package Manager**: Yarn 1.22.22

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=             # PostgreSQL connection string
YOUTUBE_API_KEY=          # YouTube Data API v3
```

## Important Notes

- **Cron Jobs**: Background data sync runs in a separate repository - refer to user instructions
- **TV Navigation**: App includes TV remote control support (see `hooks/use-tv-navigation`)
- **SEO**: Comprehensive metadata in `app/layout.tsx` for Brazilian market (pt-BR)
- **Cloudflare**: Some HLTV pages require Playwright; SDK calls may fail
- **Rate Limiting**: HLTV requests use exponential backoff (2s base delay)
- **Database Migrations**: Always run `drizzle-kit generate` after schema changes
- Não faça pushs para prod sem minha autorização