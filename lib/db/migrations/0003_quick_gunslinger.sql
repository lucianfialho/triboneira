CREATE TABLE "map_vetoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"team_id" integer,
	"map_name" varchar(50) NOT NULL,
	"veto_type" varchar(20) NOT NULL,
	"veto_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_content_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"content" text NOT NULL,
	"word_count" integer NOT NULL,
	"scrape_method" varchar(50) NOT NULL,
	"selectors_used" jsonb,
	"scraped_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_enrichment_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"error_message" text,
	"last_attempt_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "news_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"style" varchar(20) NOT NULL,
	"bullets" jsonb NOT NULL,
	"agent_metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"agent_metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_map_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_map_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL,
	"assists" integer NOT NULL,
	"adr" numeric(5, 2),
	"kast" numeric(5, 2),
	"rating" numeric(4, 2),
	"hs_kills" integer,
	"hs_percentage" numeric(5, 2),
	"impact" numeric(4, 2),
	"first_kills_diff" integer,
	"flash_assists" integer,
	"kills_per_round" numeric(4, 2),
	"deaths_per_round" numeric(4, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "unique_swiss_round_idx";--> statement-breakpoint
ALTER TABLE "player_match_stats" ALTER COLUMN "team_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "match_maps" ADD COLUMN "stats_id" integer;--> statement-breakpoint
ALTER TABLE "match_maps" ADD COLUMN "half_team1_score" integer;--> statement-breakpoint
ALTER TABLE "match_maps" ADD COLUMN "half_team2_score" integer;--> statement-breakpoint
ALTER TABLE "match_maps" ADD COLUMN "overtime_rounds" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "player_of_the_match_id" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "significance" varchar(100);--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "has_stats" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "stats_last_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD COLUMN "flash_assists" integer;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD COLUMN "impact" numeric(4, 2);--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD COLUMN "first_kills_diff" integer;--> statement-breakpoint
ALTER TABLE "player_match_stats" ADD COLUMN "is_player_of_the_match" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "swiss_rounds" ADD COLUMN "match_position" integer;--> statement-breakpoint
ALTER TABLE "map_vetoes" ADD CONSTRAINT "map_vetoes_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_vetoes" ADD CONSTRAINT "map_vetoes_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_content_cache" ADD CONSTRAINT "news_content_cache_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_enrichment_queue" ADD CONSTRAINT "news_enrichment_queue_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_summaries" ADD CONSTRAINT "news_summaries_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_translations" ADD CONSTRAINT "news_translations_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_map_stats" ADD CONSTRAINT "player_map_stats_match_map_id_match_maps_id_fk" FOREIGN KEY ("match_map_id") REFERENCES "public"."match_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_map_stats" ADD CONSTRAINT "player_map_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_map_stats" ADD CONSTRAINT "player_map_stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_veto_idx" ON "map_vetoes" USING btree ("match_id","veto_order");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_news_content_idx" ON "news_content_cache" USING btree ("news_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_news_queue_idx" ON "news_enrichment_queue" USING btree ("news_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_summary_idx" ON "news_summaries" USING btree ("news_id","language","style");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_translation_idx" ON "news_translations" USING btree ("news_id","language");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_player_map_idx" ON "player_map_stats" USING btree ("match_map_id","player_id");--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_of_the_match_id_players_id_fk" FOREIGN KEY ("player_of_the_match_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_swiss_round_idx" ON "swiss_rounds" USING btree ("event_id","round_number","match_position");