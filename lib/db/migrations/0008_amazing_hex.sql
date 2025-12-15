CREATE TABLE "event_streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"stream_url" varchar(500) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"channel_name" varchar(100) NOT NULL,
	"streamer_type" varchar(50),
	"language" varchar(10),
	"country" varchar(50),
	"viewer_count" integer,
	"is_live" boolean DEFAULT false NOT NULL,
	"is_official" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_team_lineups" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"player_type" varchar(20) NOT NULL,
	"role" varchar(50),
	"joined_for_event" timestamp,
	"left_after_event" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_match_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"current_map" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"last_update" timestamp DEFAULT now() NOT NULL,
	"current_score_team1" integer,
	"current_score_team2" integer,
	"current_map_score_team1" integer,
	"current_map_score_team2" integer,
	"momentum" jsonb,
	"win_probability" jsonb,
	"key_moments" jsonb,
	"sync_count" integer DEFAULT 0,
	"first_synced_at" timestamp DEFAULT now(),
	CONSTRAINT "live_match_cache_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
CREATE TABLE "map_veto_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"map_name" varchar(50) NOT NULL,
	"times_picked" integer DEFAULT 0,
	"times_banned" integer DEFAULT 0,
	"times_leftover" integer DEFAULT 0,
	"win_rate_when_picked" numeric(5, 2),
	"avg_pick_order" numeric(3, 1),
	"pick_frequency" numeric(5, 2),
	"ban_frequency" numeric(5, 2),
	"matches_analyzed" integer NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"notified_discord" boolean DEFAULT false NOT NULL,
	"notified_twitter" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_aggregate_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"matches_played" integer DEFAULT 0,
	"maps_played" integer DEFAULT 0,
	"total_kills" integer DEFAULT 0,
	"total_deaths" integer DEFAULT 0,
	"total_assists" integer DEFAULT 0,
	"avg_rating" numeric(4, 2),
	"avg_adr" numeric(5, 2),
	"avg_kast" numeric(5, 2),
	"avg_kills_per_map" numeric(4, 2),
	"avg_deaths_per_map" numeric(4, 2),
	"form_trend" varchar(20),
	"form_score" numeric(4, 2),
	"metadata" jsonb,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"event_id" integer,
	"match_id" integer NOT NULL,
	"predicted_winner_id" integer,
	"confidence" integer,
	"is_correct" boolean,
	"points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_streams" ADD CONSTRAINT "event_streams_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_team_lineups" ADD CONSTRAINT "event_team_lineups_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_team_lineups" ADD CONSTRAINT "event_team_lineups_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_team_lineups" ADD CONSTRAINT "event_team_lineups_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_match_cache" ADD CONSTRAINT "live_match_cache_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_veto_patterns" ADD CONSTRAINT "map_veto_patterns_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_aggregate_stats" ADD CONSTRAINT "player_aggregate_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_predicted_winner_id_teams_id_fk" FOREIGN KEY ("predicted_winner_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_event_stream_idx" ON "event_streams" USING btree ("event_id","stream_url");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_event_team_player_idx" ON "event_team_lineups" USING btree ("event_id","team_id","player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_veto_pattern_idx" ON "map_veto_patterns" USING btree ("team_id","period","map_name");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_player_aggregate_idx" ON "player_aggregate_stats" USING btree ("player_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_match_prediction_idx" ON "user_predictions" USING btree ("user_id","match_id");