-- Migration: Add match statistics tables and fields
-- Created: 2025-01-24

-- Add new columns to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS player_of_the_match_id INTEGER REFERENCES players(id),
ADD COLUMN IF NOT EXISTS significance VARCHAR(100),
ADD COLUMN IF NOT EXISTS has_stats BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS stats_last_synced_at TIMESTAMP;

-- Add new columns to match_maps table
ALTER TABLE match_maps
ADD COLUMN IF NOT EXISTS stats_id INTEGER,
ADD COLUMN IF NOT EXISTS half_team1_score INTEGER,
ADD COLUMN IF NOT EXISTS half_team2_score INTEGER,
ADD COLUMN IF NOT EXISTS overtime_rounds INTEGER;

-- Add new columns to player_match_stats table
ALTER TABLE player_match_stats
ADD COLUMN IF NOT EXISTS flash_assists INTEGER,
ADD COLUMN IF NOT EXISTS impact DECIMAL(4, 2),
ADD COLUMN IF NOT EXISTS first_kills_diff INTEGER,
ADD COLUMN IF NOT EXISTS is_player_of_the_match BOOLEAN DEFAULT FALSE NOT NULL;

-- Create map_vetoes table
CREATE TABLE IF NOT EXISTS map_vetoes (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  map_name VARCHAR(50) NOT NULL,
  veto_type VARCHAR(20) NOT NULL CHECK (veto_type IN ('removed', 'picked', 'leftover')),
  veto_order INTEGER NOT NULL CHECK (veto_order >= 1 AND veto_order <= 7),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create unique index on map_vetoes
CREATE UNIQUE INDEX IF NOT EXISTS unique_veto_idx ON map_vetoes(match_id, veto_order);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_map_vetoes_match_id ON map_vetoes(match_id);
CREATE INDEX IF NOT EXISTS idx_map_vetoes_team_id ON map_vetoes(team_id);
CREATE INDEX IF NOT EXISTS idx_map_vetoes_veto_type ON map_vetoes(veto_type);

-- Create player_map_stats table
CREATE TABLE IF NOT EXISTS player_map_stats (
  id SERIAL PRIMARY KEY,
  match_map_id INTEGER NOT NULL REFERENCES match_maps(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Core Stats
  kills INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  assists INTEGER NOT NULL,

  -- Advanced Metrics
  adr DECIMAL(5, 2),
  kast DECIMAL(5, 2),
  rating DECIMAL(4, 2),
  hs_kills INTEGER,
  hs_percentage DECIMAL(5, 2),

  -- Impact Metrics
  impact DECIMAL(4, 2),
  first_kills_diff INTEGER,
  flash_assists INTEGER,

  -- Per-Round Metrics
  kills_per_round DECIMAL(4, 2),
  deaths_per_round DECIMAL(4, 2),

  -- Side-Specific (JSON metadata)
  metadata JSONB,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create unique index on player_map_stats
CREATE UNIQUE INDEX IF NOT EXISTS unique_player_map_idx ON player_map_stats(match_map_id, player_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_player_map_stats_match_map_id ON player_map_stats(match_map_id);
CREATE INDEX IF NOT EXISTS idx_player_map_stats_player_id ON player_map_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_map_stats_team_id ON player_map_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_player_map_stats_rating ON player_map_stats(rating DESC);
CREATE INDEX IF NOT EXISTS idx_player_map_stats_kills ON player_map_stats(kills DESC);

-- Create indexes on new matches columns
CREATE INDEX IF NOT EXISTS idx_matches_player_of_the_match ON matches(player_of_the_match_id);
CREATE INDEX IF NOT EXISTS idx_matches_has_stats ON matches(has_stats);
CREATE INDEX IF NOT EXISTS idx_matches_stats_last_synced_at ON matches(stats_last_synced_at);

-- Create indexes on new match_maps columns
CREATE INDEX IF NOT EXISTS idx_match_maps_stats_id ON match_maps(stats_id);

-- Create indexes on new player_match_stats columns
CREATE INDEX IF NOT EXISTS idx_player_match_stats_impact ON player_match_stats(impact DESC);
CREATE INDEX IF NOT EXISTS idx_player_match_stats_is_potm ON player_match_stats(is_player_of_the_match);

-- Comments for documentation
COMMENT ON TABLE map_vetoes IS 'Stores map pick/ban phase for matches';
COMMENT ON TABLE player_map_stats IS 'Stores detailed per-map player statistics';
COMMENT ON COLUMN matches.player_of_the_match_id IS 'Player who was awarded player of the match';
COMMENT ON COLUMN matches.has_stats IS 'Whether detailed stats have been synced for this match';
COMMENT ON COLUMN matches.stats_last_synced_at IS 'Last time detailed stats were synced';
COMMENT ON COLUMN match_maps.stats_id IS 'HLTV stats ID for detailed map stats';
COMMENT ON COLUMN match_maps.half_team1_score IS 'Team 1 score at halftime (round 15)';
COMMENT ON COLUMN match_maps.half_team2_score IS 'Team 2 score at halftime (round 15)';
COMMENT ON COLUMN match_maps.overtime_rounds IS 'Number of overtime rounds played';
