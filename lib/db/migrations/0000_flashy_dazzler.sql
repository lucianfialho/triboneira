CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"seed" integer,
	"placement" varchar(50),
	"prize_money" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"external_id" varchar(100) NOT NULL,
	"source" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"date_start" timestamp,
	"date_end" timestamp,
	"prize_pool" varchar(100),
	"location" varchar(255),
	"status" varchar(50) DEFAULT 'upcoming' NOT NULL,
	"championship_mode" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "head_to_head" (
	"id" serial PRIMARY KEY NOT NULL,
	"team1_id" integer NOT NULL,
	"team2_id" integer NOT NULL,
	"event_id" integer,
	"matches_played" integer DEFAULT 0,
	"team1_wins" integer DEFAULT 0,
	"team2_wins" integer DEFAULT 0,
	"last_match_date" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "match_maps" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"map_number" integer NOT NULL,
	"map_name" varchar(100),
	"team1_score" integer,
	"team2_score" integer,
	"winner_team_id" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"external_id" varchar(100) NOT NULL,
	"source" varchar(50) NOT NULL,
	"team1_id" integer NOT NULL,
	"team2_id" integer NOT NULL,
	"date" timestamp,
	"format" varchar(20),
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"winner_id" integer,
	"score_team1" integer,
	"score_team2" integer,
	"maps" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"external_id" varchar(100) NOT NULL,
	"source" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"link" varchar(500) NOT NULL,
	"published_at" timestamp,
	"country" varchar(10),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_match_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"kills" integer,
	"deaths" integer,
	"assists" integer,
	"adr" numeric(5, 2),
	"rating" numeric(4, 2),
	"kast" numeric(5, 2),
	"hs_percentage" numeric(5, 2),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"external_id" varchar(100) NOT NULL,
	"source" varchar(50) NOT NULL,
	"nickname" varchar(100) NOT NULL,
	"real_name" varchar(255),
	"country" varchar(10),
	"age" integer,
	"photo_url" varchar(500),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_name" varchar(100) NOT NULL,
	"game_id" integer,
	"event_id" integer,
	"status" varchar(50) NOT NULL,
	"items_synced" integer DEFAULT 0,
	"errors" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_rosters" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"role" varchar(50),
	"active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"event_id" integer,
	"period_start" timestamp,
	"period_end" timestamp,
	"matches_played" integer DEFAULT 0,
	"wins" integer DEFAULT 0,
	"losses" integer DEFAULT 0,
	"draws" integer DEFAULT 0,
	"win_rate" numeric(5, 2),
	"maps_played" integer DEFAULT 0,
	"maps_won" integer DEFAULT 0,
	"rounds_won" integer DEFAULT 0,
	"rounds_lost" integer DEFAULT 0,
	"avg_round_diff" numeric(5, 2),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"external_id" varchar(100) NOT NULL,
	"source" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"country" varchar(10),
	"logo_url" varchar(500),
	"rank" integer,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "head_to_head" ADD CONSTRAINT "head_to_head_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "head_to_head" ADD CONSTRAINT "head_to_head_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "head_to_head" ADD CONSTRAINT "head_to_head_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_maps" ADD CONSTRAINT "match_maps_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_maps" ADD CONSTRAINT "match_maps_winner_team_id_teams_id_fk" FOREIGN KEY ("winner_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_teams_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_rosters" ADD CONSTRAINT "team_rosters_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_rosters" ADD CONSTRAINT "team_rosters_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_stats" ADD CONSTRAINT "team_stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_stats" ADD CONSTRAINT "team_stats_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_participant_idx" ON "event_participants" USING btree ("event_id","team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_event_idx" ON "events" USING btree ("external_id","source");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_h2h_idx" ON "head_to_head" USING btree ("team1_id","team2_id","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_map_idx" ON "match_maps" USING btree ("match_id","map_number");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_match_idx" ON "matches" USING btree ("external_id","source");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_news_idx" ON "news" USING btree ("external_id","source");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_player_match_idx" ON "player_match_stats" USING btree ("match_id","player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_player_idx" ON "players" USING btree ("external_id","source");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_roster_idx" ON "team_rosters" USING btree ("team_id","player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_team_stats_idx" ON "team_stats" USING btree ("team_id","event_id","period_start","period_end");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_team_idx" ON "teams" USING btree ("external_id","source");