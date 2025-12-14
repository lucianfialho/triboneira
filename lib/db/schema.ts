import { pgTable, serial, varchar, timestamp, boolean, integer, decimal, jsonb, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. GAMES (Root Entity)
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. EVENTS (Tournaments/Championships)
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  externalId: varchar('external_id', { length: 100 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(), // hltv, liquipedia, pandascore
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  dateStart: timestamp('date_start'),
  dateEnd: timestamp('date_end'),
  prizePool: varchar('prize_pool', { length: 100 }),
  location: varchar('location', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('upcoming'), // upcoming, ongoing, finished
  championshipMode: boolean('championship_mode').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueEventIdx: uniqueIndex('unique_event_idx').on(table.externalId, table.source),
  uniqueSlugIdx: uniqueIndex('unique_slug_idx').on(table.slug),
}));

// 3. TEAMS
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  externalId: varchar('external_id', { length: 100 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  country: varchar('country', { length: 10 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  rank: integer('rank'),
  active: boolean('active').default(true).notNull(),

  // Social Media
  twitterHandle: varchar('twitter_handle', { length: 100 }),
  instagramHandle: varchar('instagram_handle', { length: 100 }),
  facebookUrl: varchar('facebook_url', { length: 500 }),

  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTeamIdx: uniqueIndex('unique_team_idx').on(table.externalId, table.source),
}));

// 4. PLAYERS
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  externalId: varchar('external_id', { length: 100 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  nickname: varchar('nickname', { length: 100 }).notNull(),
  realName: varchar('real_name', { length: 255 }),
  country: varchar('country', { length: 10 }),
  age: integer('age'),
  photoUrl: varchar('photo_url', { length: 500 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniquePlayerIdx: uniqueIndex('unique_player_idx').on(table.externalId, table.source),
}));

// 5. TEAM_ROSTERS (Many-to-Many)
export const teamRosters = pgTable('team_rosters', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  role: varchar('role', { length: 50 }), // awper, entry, igl, support, rifler
  active: boolean('active').default(true).notNull(),
  joinedAt: timestamp('joined_at'),
  leftAt: timestamp('left_at'),
}, (table) => ({
  uniqueRosterIdx: uniqueIndex('unique_roster_idx').on(table.teamId, table.playerId),
}));

// 6. EVENT_PARTICIPANTS (Many-to-Many)
export const eventParticipants = pgTable('event_participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  seed: integer('seed'),
  placement: varchar('placement', { length: 50 }), // 1st, 2nd, 3-4th, etc
  prizeMoney: varchar('prize_money', { length: 100 }),
}, (table) => ({
  uniqueParticipantIdx: uniqueIndex('unique_participant_idx').on(table.eventId, table.teamId),
}));

// 7. EVENT_TEAM_LINEUPS (rastreia lineup específico por evento)
export const eventTeamLineups = pgTable('event_team_lineups', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  playerId: integer('player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  playerType: varchar('player_type', { length: 20 }).notNull(), // starter, coach, substitute, benched
  role: varchar('role', { length: 50 }), // awper, igl, entry, support, rifler
  joinedForEvent: timestamp('joined_for_event'),
  leftAfterEvent: timestamp('left_after_event'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueEventTeamPlayerIdx: uniqueIndex('unique_event_team_player_idx').on(table.eventId, table.teamId, table.playerId),
}));

// 8. MATCHES
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  externalId: varchar('external_id', { length: 100 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  team1Id: integer('team1_id').references(() => teams.id), // nullable for TBD matches
  team2Id: integer('team2_id').references(() => teams.id), // nullable for TBD matches
  date: timestamp('date'),
  format: varchar('format', { length: 20 }), // bo1, bo3, bo5
  status: varchar('status', { length: 50 }).notNull().default('scheduled'), // scheduled, live, finished, cancelled
  winnerId: integer('winner_id').references(() => teams.id),
  scoreTeam1: integer('score_team1'),
  scoreTeam2: integer('score_team2'),
  maps: jsonb('maps'), // Array of map results
  playerOfTheMatchId: integer('player_of_the_match_id').references(() => players.id),
  significance: varchar('significance', { length: 100 }),
  hasStats: boolean('has_stats').default(false).notNull(),
  statsLastSyncedAt: timestamp('stats_last_synced_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueMatchIdx: uniqueIndex('unique_match_idx').on(table.externalId, table.source),
}));

// 8. MATCH_MAPS
export const matchMaps = pgTable('match_maps', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  mapNumber: integer('map_number').notNull(), // 1, 2, 3
  mapName: varchar('map_name', { length: 100 }), // mirage, dust2, inferno
  team1Score: integer('team1_score'),
  team2Score: integer('team2_score'),
  winnerTeamId: integer('winner_team_id').references(() => teams.id),
  statsId: integer('stats_id'), // HLTV stats ID for detailed map stats
  halfTeam1Score: integer('half_team1_score'), // Score at halftime (round 15)
  halfTeam2Score: integer('half_team2_score'),
  overtimeRounds: integer('overtime_rounds'), // Number of OT rounds played
  metadata: jsonb('metadata'), // rounds, ct/t sides, etc
}, (table) => ({
  uniqueMapIdx: uniqueIndex('unique_map_idx').on(table.matchId, table.mapNumber),
}));

// 9. PLAYER_MATCH_STATS
export const playerMatchStats = pgTable('player_match_stats', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  teamId: integer('team_id').references(() => teams.id),
  kills: integer('kills'),
  deaths: integer('deaths'),
  assists: integer('assists'),
  adr: decimal('adr', { precision: 5, scale: 2 }), // Average damage per round
  rating: decimal('rating', { precision: 4, scale: 2 }),
  kast: decimal('kast', { precision: 5, scale: 2 }), // KAST percentage
  hsPercentage: decimal('hs_percentage', { precision: 5, scale: 2 }),
  flashAssists: integer('flash_assists'),
  impact: decimal('impact', { precision: 4, scale: 2 }),
  firstKillsDiff: integer('first_kills_diff'),
  isPlayerOfTheMatch: boolean('is_player_of_the_match').default(false).notNull(),
  metadata: jsonb('metadata'), // Game-specific stats
}, (table) => ({
  uniquePlayerMatchIdx: uniqueIndex('unique_player_match_idx').on(table.matchId, table.playerId),
}));

// 10. MAP_VETOES (Pick/Ban Phase)
export const mapVetoes = pgTable('map_vetoes', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  teamId: integer('team_id').references(() => teams.id), // null for leftover maps
  mapName: varchar('map_name', { length: 50 }).notNull(), // mirage, dust2, inferno, etc
  vetoType: varchar('veto_type', { length: 20 }).notNull(), // removed, picked, leftover
  vetoOrder: integer('veto_order').notNull(), // 1-7 (sequence in veto phase)
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueVetoIdx: uniqueIndex('unique_veto_idx').on(table.matchId, table.vetoOrder),
}));

// 11. PLAYER_MAP_STATS (Per-map player statistics)
export const playerMapStats = pgTable('player_map_stats', {
  id: serial('id').primaryKey(),
  matchMapId: integer('match_map_id').references(() => matchMaps.id).notNull(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  teamId: integer('team_id').references(() => teams.id).notNull(),

  // Core Stats
  kills: integer('kills').notNull(),
  deaths: integer('deaths').notNull(),
  assists: integer('assists').notNull(),

  // Advanced Metrics
  adr: decimal('adr', { precision: 5, scale: 2 }), // Average Damage per Round
  kast: decimal('kast', { precision: 5, scale: 2 }), // Kill/Assist/Survive/Trade %
  rating: decimal('rating', { precision: 4, scale: 2 }), // Rating 2.0
  hsKills: integer('hs_kills'), // Headshot kills
  hsPercentage: decimal('hs_percentage', { precision: 5, scale: 2 }),

  // Impact Metrics
  impact: decimal('impact', { precision: 4, scale: 2 }),
  firstKillsDiff: integer('first_kills_diff'), // +/- in first kills
  flashAssists: integer('flash_assists'),

  // Per-Round Metrics
  killsPerRound: decimal('kills_per_round', { precision: 4, scale: 2 }),
  deathsPerRound: decimal('deaths_per_round', { precision: 4, scale: 2 }),

  // Side-Specific (extracted via getMatchMapStats)
  metadata: jsonb('metadata'), // { ctStats: {...}, tStats: {...} }

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniquePlayerMapIdx: uniqueIndex('unique_player_map_idx').on(table.matchMapId, table.playerId),
}));

// 12. TEAM_STATS (Aggregated)
export const teamStats = pgTable('team_stats', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  eventId: integer('event_id').references(() => events.id), // null = all-time
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  matchesPlayed: integer('matches_played').default(0),
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  draws: integer('draws').default(0),
  winRate: decimal('win_rate', { precision: 5, scale: 2 }),
  mapsPlayed: integer('maps_played').default(0),
  mapsWon: integer('maps_won').default(0),
  roundsWon: integer('rounds_won').default(0),
  roundsLost: integer('rounds_lost').default(0),
  avgRoundDiff: decimal('avg_round_diff', { precision: 5, scale: 2 }),
  metadata: jsonb('metadata'), // Map pool, CT/T stats, etc
}, (table) => ({
  uniqueTeamStatsIdx: uniqueIndex('unique_team_stats_idx').on(table.teamId, table.eventId, table.periodStart, table.periodEnd),
}));

// 13. HEAD_TO_HEAD
export const headToHead = pgTable('head_to_head', {
  id: serial('id').primaryKey(),
  team1Id: integer('team1_id').references(() => teams.id).notNull(),
  team2Id: integer('team2_id').references(() => teams.id).notNull(),
  eventId: integer('event_id').references(() => events.id), // null = all-time
  matchesPlayed: integer('matches_played').default(0),
  team1Wins: integer('team1_wins').default(0),
  team2Wins: integer('team2_wins').default(0),
  lastMatchDate: timestamp('last_match_date'),
  metadata: jsonb('metadata'), // Maps, common opponents, etc
}, (table) => ({
  uniqueH2HIdx: uniqueIndex('unique_h2h_idx').on(table.team1Id, table.team2Id, table.eventId),
}));

// 14. PLAYER_AGGREGATE_STATS (Rolling windows for player performance)
export const playerAggregateStats = pgTable('player_aggregate_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').references(() => players.id).notNull(),

  // Time window
  period: varchar('period', { length: 20 }).notNull(), // 'last_7d', 'last_30d', 'event_7148', 'all_time'
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),

  // Core stats
  matchesPlayed: integer('matches_played').default(0),
  mapsPlayed: integer('maps_played').default(0),
  totalKills: integer('total_kills').default(0),
  totalDeaths: integer('total_deaths').default(0),
  totalAssists: integer('total_assists').default(0),

  // Averages
  avgRating: decimal('avg_rating', { precision: 4, scale: 2 }),
  avgAdr: decimal('avg_adr', { precision: 5, scale: 2 }),
  avgKast: decimal('avg_kast', { precision: 5, scale: 2 }),
  avgKillsPerMap: decimal('avg_kills_per_map', { precision: 4, scale: 2 }),
  avgDeathsPerMap: decimal('avg_deaths_per_map', { precision: 4, scale: 2 }),

  // Form indicator
  formTrend: varchar('form_trend', { length: 20 }), // 'improving', 'stable', 'declining'
  formScore: decimal('form_score', { precision: 4, scale: 2 }), // 0-10 rating

  // Metadata (map-specific stats, clutch stats if available)
  metadata: jsonb('metadata'),

  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
}, (table) => ({
  uniquePlayerAggregateIdx: uniqueIndex('unique_player_aggregate_idx').on(table.playerId, table.period),
}));

// 15. MAP_VETO_PATTERNS (Team pick/ban behavior analysis)
export const mapVetoPatterns = pgTable('map_veto_patterns', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id).notNull(),

  // Analysis period
  period: varchar('period', { length: 20 }).notNull(), // 'last_30d', 'event_7148', 'all_time'
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),

  // Per-map statistics
  mapName: varchar('map_name', { length: 50 }).notNull(),
  timesPicked: integer('times_picked').default(0),
  timesBanned: integer('times_banned').default(0),
  timesLeftover: integer('times_leftover').default(0),
  winRateWhenPicked: decimal('win_rate_when_picked', { precision: 5, scale: 2 }),

  // Patterns
  avgPickOrder: decimal('avg_pick_order', { precision: 3, scale: 1 }), // 1.0 = always first pick
  pickFrequency: decimal('pick_frequency', { precision: 5, scale: 2 }), // % of matches
  banFrequency: decimal('ban_frequency', { precision: 5, scale: 2 }), // % of matches

  // Meta
  matchesAnalyzed: integer('matches_analyzed').notNull(),
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueVetoPatternIdx: uniqueIndex('unique_veto_pattern_idx').on(table.teamId, table.period, table.mapName),
}));

// 16. LIVE_MATCH_CACHE (Real-time match state)
export const liveMatchCache = pgTable('live_match_cache', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull().unique(),

  // Current state
  currentMap: integer('current_map').notNull().default(1),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, live, paused, finished
  lastUpdate: timestamp('last_update').defaultNow().notNull(),

  // Real-time scores (updated every 10min from HLTV)
  currentScoreTeam1: integer('current_score_team1'),
  currentScoreTeam2: integer('current_score_team2'),
  currentMapScoreTeam1: integer('current_map_score_team1'), // rounds on current map
  currentMapScoreTeam2: integer('current_map_score_team2'),

  // Computed analytics (updated on each sync)
  momentum: jsonb('momentum'), // { team: 1|2, strength: 0-100, recentMaps: [...] }
  winProbability: jsonb('win_probability'), // { team1: 0.65, team2: 0.35, factors: [...] }
  keyMoments: jsonb('key_moments'), // Array of key moment objects

  // Performance tracking
  syncCount: integer('sync_count').default(0),
  firstSyncedAt: timestamp('first_synced_at').defaultNow(),
});

// 17. MATCH_EVENTS (Key moments, upsets, milestones)
export const matchEvents = pgTable('match_events', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'upset_alert', 'comeback', 'milestone', 'close_map'
  severity: varchar('severity', { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'

  // Event data
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata'), // context specific to event type

  // Notification tracking
  notifiedDiscord: boolean('notified_discord').default(false).notNull(),
  notifiedTwitter: boolean('notified_twitter').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 18. NEWS
export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  externalId: varchar('external_id', { length: 100 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 200 }), // URL-friendly slug original (EN)
  slugPtBr: varchar('slug_pt_br', { length: 200 }), // Slug traduzido PT-BR
  description: text('description'),
  link: varchar('link', { length: 500 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  publishedAt: timestamp('published_at'),
  country: varchar('country', { length: 10 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueNewsIdx: uniqueIndex('unique_news_idx').on(table.externalId, table.source),
}));

// 19. SWISS_ROUNDS (Swiss System Tournament Rounds)
export const swissRounds = pgTable('swiss_rounds', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  roundNumber: integer('round_number').notNull(), // 1-5 in swiss
  matchPosition: integer('match_position'), // Position within the round (0-based index)
  matchId: integer('match_id').references(() => matches.id),
  team1Id: integer('team1_id').references(() => teams.id),
  team2Id: integer('team2_id').references(() => teams.id),
  team1Record: varchar('team1_record', { length: 10 }), // "2-0", "2-1"
  team2Record: varchar('team2_record', { length: 10 }),
  bucket: varchar('bucket', { length: 10 }), // "2-0", "2-1", "2-2", etc
  stakes: varchar('stakes', { length: 50 }), // "elimination", "qualification", "seeding"
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, completed
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueSwissRoundIdx: uniqueIndex('unique_swiss_round_idx').on(table.eventId, table.roundNumber, table.matchPosition),
}));

// 20. EVENT_NEWS (Many-to-Many relationship between events and news)
export const eventNews = pgTable('event_news', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  newsId: integer('news_id').references(() => news.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueEventNewsIdx: uniqueIndex('unique_event_news_idx').on(table.eventId, table.newsId),
}));

// 21. SYNC_LOG (Audit Trail)
export const syncLogs = pgTable('sync_logs', {
  id: serial('id').primaryKey(),
  jobName: varchar('job_name', { length: 100 }).notNull(),
  gameId: integer('game_id').references(() => games.id),
  eventId: integer('event_id').references(() => events.id),
  status: varchar('status', { length: 50 }).notNull(), // success, failed, partial
  itemsSynced: integer('items_synced').default(0),
  errors: jsonb('errors'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// 22. NEWS_ENRICHMENT_QUEUE (AI Processing Queue)
export const newsEnrichmentQueue = pgTable('news_enrichment_queue', {
  id: serial('id').primaryKey(),
  newsId: integer('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
  priority: integer('priority').notNull().default(5), // 1-10 (10 = highest)
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  errorMessage: text('error_message'),
  lastAttemptAt: timestamp('last_attempt_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  uniqueNewsQueueIdx: uniqueIndex('unique_news_queue_idx').on(table.newsId),
}));

// 23. NEWS_CONTENT_CACHE (Scraped Article Cache)
export const newsContentCache = pgTable('news_content_cache', {
  id: serial('id').primaryKey(),
  newsId: integer('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  wordCount: integer('word_count').notNull(),
  scrapeMethod: varchar('scrape_method', { length: 50 }).notNull(), // playwright, fallback-title
  selectorsUsed: jsonb('selectors_used'),
  scrapedAt: timestamp('scraped_at').defaultNow().notNull(),
}, (table) => ({
  uniqueNewsContentIdx: uniqueIndex('unique_news_content_idx').on(table.newsId),
}));

// 24. NEWS_TRANSLATIONS (Translated Content)
export const newsTranslations = pgTable('news_translations', {
  id: serial('id').primaryKey(),
  newsId: integer('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  language: varchar('language', { length: 10 }).notNull(), // pt-BR, es, fr
  title: text('title').notNull(),
  content: text('content').notNull(),
  agentMetadata: jsonb('agent_metadata'), // { model, tokens, confidence, processingTime }
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTranslationIdx: uniqueIndex('unique_translation_idx').on(table.newsId, table.language),
}));

// 25. NEWS_SUMMARIES (Particle-style Bullet Summaries)
export const newsSummaries = pgTable('news_summaries', {
  id: serial('id').primaryKey(),
  newsId: integer('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  language: varchar('language', { length: 10 }).notNull(), // pt-BR
  style: varchar('style', { length: 20 }).notNull(), // 5ws, eli5, bullet-points, key-facts
  bullets: jsonb('bullets').notNull(), // Array of bullet objects with type and text
  agentMetadata: jsonb('agent_metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueSummaryIdx: uniqueIndex('unique_summary_idx').on(table.newsId, table.language, table.style),
}));

// 26. TWITTER_QUEUE (Tweet Queue for Publishing)
export const twitterQueue = pgTable('twitter_queue', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  mediaUrls: jsonb('media_urls'), // URLs of images to attach
  scheduledFor: timestamp('scheduled_for'),
  priority: integer('priority').default(5).notNull(), // 1-10, higher = more important
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, posted, failed
  tweetType: varchar('tweet_type', { length: 50 }).notNull(), // match_result, news, preview, upset, etc

  // Relationships
  matchId: integer('match_id').references(() => matches.id),
  newsId: integer('news_id').references(() => news.id),

  // Twitter metadata
  twitterTweetId: varchar('twitter_tweet_id', { length: 100 }),
  hashtags: jsonb('hashtags'), // Array of hashtags used

  createdAt: timestamp('created_at').defaultNow().notNull(),
  postedAt: timestamp('posted_at'),
  errorMessage: text('error_message'),
});

// 27. TWITTER_MENTIONS (User Mentions to Respond)
export const twitterMentions = pgTable('twitter_mentions', {
  id: serial('id').primaryKey(),
  twitterMentionId: varchar('twitter_mention_id', { length: 100 }).notNull().unique(),
  authorUsername: varchar('author_username', { length: 100 }).notNull(),
  content: text('content').notNull(),

  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, processed, ignored
  responseType: varchar('response_type', { length: 20 }), // auto, ai, manual
  responseContent: text('response_content'),
  responseTweetId: varchar('response_tweet_id', { length: 100 }),

  category: varchar('category', { length: 50 }), // match_query, stat_request, opinion, other
  sentiment: varchar('sentiment', { length: 20 }), // positive, neutral, negative, toxic

  mentionedAt: timestamp('mentioned_at').notNull(),
  processedAt: timestamp('processed_at'),
  respondedAt: timestamp('responded_at'),
});

// 28. TWITTER_ANALYTICS (Tweet Performance Tracking)
export const twitterAnalytics = pgTable('twitter_analytics', {
  id: serial('id').primaryKey(),
  queueId: integer('queue_id').references(() => twitterQueue.id),
  twitterTweetId: varchar('twitter_tweet_id', { length: 100 }).notNull(),

  impressions: integer('impressions').default(0).notNull(),
  likes: integer('likes').default(0).notNull(),
  retweets: integer('retweets').default(0).notNull(),
  replies: integer('replies').default(0).notNull(),
  linkClicks: integer('link_clicks').default(0).notNull(),
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }),

  lastFetchedAt: timestamp('last_fetched_at').defaultNow().notNull(),
});

// 29. EVENT_STREAMS (Streams Broadcasting Events)
export const eventStreams = pgTable('event_streams', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),

  // Stream Info
  streamUrl: varchar('stream_url', { length: 500 }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(), // twitch, youtube, kick
  channelName: varchar('channel_name', { length: 100 }).notNull(), // gaules, ESL_CSGO, etc
  streamerType: varchar('streamer_type', { length: 50 }), // caster, player, organizer

  // Stream Metadata
  language: varchar('language', { length: 10 }), // en, pt-BR, ru, fr
  country: varchar('country', { length: 50 }),
  viewerCount: integer('viewer_count'),

  // Status
  isLive: boolean('is_live').default(false).notNull(),
  isOfficial: boolean('is_official').default(false).notNull(), // Official broadcast

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueEventStreamIdx: uniqueIndex('unique_event_stream_idx').on(table.eventId, table.streamUrl),
}));

// 30. USER_PREDICTIONS (Event Simulator / Pickems)
export const userPredictions = pgTable('user_predictions', {
  id: serial('id').primaryKey(),

  // User identification (can be fingerprint or auth-based)
  userId: varchar('user_id', { length: 255 }).notNull(),

  // Prediction target
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }),
  matchId: integer('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),

  // Prediction
  predictedWinnerId: integer('predicted_winner_id').references(() => teams.id),
  confidence: integer('confidence'), // 1-5 stars (optional)

  // Result tracking
  isCorrect: boolean('is_correct'), // null until match finishes
  points: integer('points').default(0), // Points earned for correct prediction

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserMatchPredictionIdx: uniqueIndex('unique_user_match_prediction_idx').on(table.userId, table.matchId),
}));

// Relations
export const gamesRelations = relations(games, ({ many }) => ({
  events: many(events),
  teams: many(teams),
  players: many(players),
  news: many(news),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  game: one(games, { fields: [events.gameId], references: [games.id] }),
  participants: many(eventParticipants),
  lineups: many(eventTeamLineups),
  matches: many(matches),
  teamStats: many(teamStats),
  headToHeads: many(headToHead),
  swissRounds: many(swissRounds),
  eventNews: many(eventNews),
  streams: many(eventStreams),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  game: one(games, { fields: [teams.gameId], references: [games.id] }),
  rosters: many(teamRosters),
  eventParticipations: many(eventParticipants),
  homeMatches: many(matches, { relationName: 'team1' }),
  awayMatches: many(matches, { relationName: 'team2' }),
  stats: many(teamStats),
  headToHeadsAsTeam1: many(headToHead, { relationName: 'team1' }),
  headToHeadsAsTeam2: many(headToHead, { relationName: 'team2' }),
  vetoPatterns: many(mapVetoPatterns),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  game: one(games, { fields: [players.gameId], references: [games.id] }),
  rosters: many(teamRosters),
  matchStats: many(playerMatchStats),
  aggregateStats: many(playerAggregateStats),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  event: one(events, { fields: [matches.eventId], references: [events.id] }),
  team1: one(teams, { fields: [matches.team1Id], references: [teams.id], relationName: 'team1' }),
  team2: one(teams, { fields: [matches.team2Id], references: [teams.id], relationName: 'team2' }),
  winner: one(teams, { fields: [matches.winnerId], references: [teams.id] }),
  playerOfTheMatch: one(players, { fields: [matches.playerOfTheMatchId], references: [players.id] }),
  maps: many(matchMaps),
  vetoes: many(mapVetoes),
  playerStats: many(playerMatchStats),
  swissRounds: many(swissRounds),
  liveCache: one(liveMatchCache, { fields: [matches.id], references: [liveMatchCache.matchId] }),
  events: many(matchEvents),
}));

export const swissRoundsRelations = relations(swissRounds, ({ one }) => ({
  event: one(events, { fields: [swissRounds.eventId], references: [events.id] }),
  match: one(matches, { fields: [swissRounds.matchId], references: [matches.id] }),
  team1: one(teams, { fields: [swissRounds.team1Id], references: [teams.id], relationName: 'swissTeam1' }),
  team2: one(teams, { fields: [swissRounds.team2Id], references: [teams.id], relationName: 'swissTeam2' }),
}));

export const eventNewsRelations = relations(eventNews, ({ one }) => ({
  event: one(events, { fields: [eventNews.eventId], references: [events.id] }),
  news: one(news, { fields: [eventNews.newsId], references: [news.id] }),
}));

export const newsRelations = relations(news, ({ one, many }) => ({
  game: one(games, { fields: [news.gameId], references: [games.id] }),
  eventNews: many(eventNews),
  enrichmentQueue: many(newsEnrichmentQueue),
  contentCache: many(newsContentCache),
  translations: many(newsTranslations),
  summaries: many(newsSummaries),
}));

export const newsEnrichmentQueueRelations = relations(newsEnrichmentQueue, ({ one }) => ({
  news: one(news, { fields: [newsEnrichmentQueue.newsId], references: [news.id] }),
}));

export const newsContentCacheRelations = relations(newsContentCache, ({ one }) => ({
  news: one(news, { fields: [newsContentCache.newsId], references: [news.id] }),
}));

export const newsTranslationsRelations = relations(newsTranslations, ({ one }) => ({
  news: one(news, { fields: [newsTranslations.newsId], references: [news.id] }),
}));

export const newsSummariesRelations = relations(newsSummaries, ({ one }) => ({
  news: one(news, { fields: [newsSummaries.newsId], references: [news.id] }),
}));

export const mapVetoesRelations = relations(mapVetoes, ({ one }) => ({
  match: one(matches, { fields: [mapVetoes.matchId], references: [matches.id] }),
  team: one(teams, { fields: [mapVetoes.teamId], references: [teams.id] }),
}));

export const matchMapsRelations = relations(matchMaps, ({ one, many }) => ({
  match: one(matches, { fields: [matchMaps.matchId], references: [matches.id] }),
  winnerTeam: one(teams, { fields: [matchMaps.winnerTeamId], references: [teams.id] }),
  playerStats: many(playerMapStats),
}));

export const playerMatchStatsRelations = relations(playerMatchStats, ({ one }) => ({
  match: one(matches, { fields: [playerMatchStats.matchId], references: [matches.id] }),
  player: one(players, { fields: [playerMatchStats.playerId], references: [players.id] }),
  team: one(teams, { fields: [playerMatchStats.teamId], references: [teams.id] }),
}));

export const playerMapStatsRelations = relations(playerMapStats, ({ one }) => ({
  matchMap: one(matchMaps, { fields: [playerMapStats.matchMapId], references: [matchMaps.id] }),
  player: one(players, { fields: [playerMapStats.playerId], references: [players.id] }),
  team: one(teams, { fields: [playerMapStats.teamId], references: [teams.id] }),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, { fields: [eventParticipants.eventId], references: [events.id] }),
  team: one(teams, { fields: [eventParticipants.teamId], references: [teams.id] }),
}));

export const eventTeamLineupsRelations = relations(eventTeamLineups, ({ one }) => ({
  event: one(events, { fields: [eventTeamLineups.eventId], references: [events.id] }),
  team: one(teams, { fields: [eventTeamLineups.teamId], references: [teams.id] }),
  player: one(players, { fields: [eventTeamLineups.playerId], references: [players.id] }),
}));

export const teamRostersRelations = relations(teamRosters, ({ one }) => ({
  team: one(teams, { fields: [teamRosters.teamId], references: [teams.id] }),
  player: one(players, { fields: [teamRosters.playerId], references: [players.id] }),
}));

export const teamStatsRelations = relations(teamStats, ({ one }) => ({
  team: one(teams, { fields: [teamStats.teamId], references: [teams.id] }),
  event: one(events, { fields: [teamStats.eventId], references: [events.id] }),
}));

export const headToHeadRelations = relations(headToHead, ({ one }) => ({
  team1: one(teams, { fields: [headToHead.team1Id], references: [teams.id], relationName: 'h2hTeam1' }),
  team2: one(teams, { fields: [headToHead.team2Id], references: [teams.id], relationName: 'h2hTeam2' }),
  event: one(events, { fields: [headToHead.eventId], references: [events.id] }),
}));

export const playerAggregateStatsRelations = relations(playerAggregateStats, ({ one }) => ({
  player: one(players, { fields: [playerAggregateStats.playerId], references: [players.id] }),
}));

export const mapVetoPatternsRelations = relations(mapVetoPatterns, ({ one }) => ({
  team: one(teams, { fields: [mapVetoPatterns.teamId], references: [teams.id] }),
}));

export const liveMatchCacheRelations = relations(liveMatchCache, ({ one }) => ({
  match: one(matches, { fields: [liveMatchCache.matchId], references: [matches.id] }),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, { fields: [matchEvents.matchId], references: [matches.id] }),
}));

export const eventStreamsRelations = relations(eventStreams, ({ one }) => ({
  event: one(events, { fields: [eventStreams.eventId], references: [events.id] }),
}));

export const userPredictionsRelations = relations(userPredictions, ({ one }) => ({
  event: one(events, { fields: [userPredictions.eventId], references: [events.id] }),
  match: one(matches, { fields: [userPredictions.matchId], references: [matches.id] }),
  predictedWinner: one(teams, { fields: [userPredictions.predictedWinnerId], references: [teams.id] }),
}));
