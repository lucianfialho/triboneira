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

// 7. MATCHES
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
  metadata: jsonb('metadata'), // rounds, ct/t sides, etc
}, (table) => ({
  uniqueMapIdx: uniqueIndex('unique_map_idx').on(table.matchId, table.mapNumber),
}));

// 9. PLAYER_MATCH_STATS
export const playerMatchStats = pgTable('player_match_stats', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  kills: integer('kills'),
  deaths: integer('deaths'),
  assists: integer('assists'),
  adr: decimal('adr', { precision: 5, scale: 2 }), // Average damage per round
  rating: decimal('rating', { precision: 4, scale: 2 }),
  kast: decimal('kast', { precision: 5, scale: 2 }), // KAST percentage
  hsPercentage: decimal('hs_percentage', { precision: 5, scale: 2 }),
  metadata: jsonb('metadata'), // Game-specific stats
}, (table) => ({
  uniquePlayerMatchIdx: uniqueIndex('unique_player_match_idx').on(table.matchId, table.playerId),
}));

// 10. TEAM_STATS (Aggregated)
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

// 11. HEAD_TO_HEAD
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

// 12. NEWS
export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  externalId: varchar('external_id', { length: 100 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  link: varchar('link', { length: 500 }).notNull(),
  publishedAt: timestamp('published_at'),
  country: varchar('country', { length: 10 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueNewsIdx: uniqueIndex('unique_news_idx').on(table.externalId, table.source),
}));

// 13. SWISS_ROUNDS (Swiss System Tournament Rounds)
export const swissRounds = pgTable('swiss_rounds', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  roundNumber: integer('round_number').notNull(), // 1-5 in swiss
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
  uniqueSwissRoundIdx: uniqueIndex('unique_swiss_round_idx').on(table.eventId, table.roundNumber, table.matchId),
}));

// 14. EVENT_NEWS (Many-to-Many relationship between events and news)
export const eventNews = pgTable('event_news', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  newsId: integer('news_id').references(() => news.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueEventNewsIdx: uniqueIndex('unique_event_news_idx').on(table.eventId, table.newsId),
}));

// 15. SYNC_LOG (Audit Trail)
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
  matches: many(matches),
  teamStats: many(teamStats),
  headToHeads: many(headToHead),
  swissRounds: many(swissRounds),
  eventNews: many(eventNews),
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
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  game: one(games, { fields: [players.gameId], references: [games.id] }),
  rosters: many(teamRosters),
  matchStats: many(playerMatchStats),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  event: one(events, { fields: [matches.eventId], references: [events.id] }),
  team1: one(teams, { fields: [matches.team1Id], references: [teams.id], relationName: 'team1' }),
  team2: one(teams, { fields: [matches.team2Id], references: [teams.id], relationName: 'team2' }),
  winner: one(teams, { fields: [matches.winnerId], references: [teams.id] }),
  maps: many(matchMaps),
  playerStats: many(playerMatchStats),
  swissRounds: many(swissRounds),
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
}));
