-- Create swiss_rounds table
CREATE TABLE IF NOT EXISTS "swiss_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"round_number" integer NOT NULL,
	"match_id" integer,
	"team1_id" integer,
	"team2_id" integer,
	"team1_record" varchar(10),
	"team2_record" varchar(10),
	"bucket" varchar(10),
	"stakes" varchar(50),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create event_news table
CREATE TABLE IF NOT EXISTS "event_news" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"news_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign keys for swiss_rounds
DO $$ BEGIN
 ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Add foreign keys for event_news
DO $$ BEGIN
 ALTER TABLE "event_news" ADD CONSTRAINT "event_news_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "event_news" ADD CONSTRAINT "event_news_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "unique_swiss_round_idx" ON "swiss_rounds" ("event_id","round_number","match_id");
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "unique_event_news_idx" ON "event_news" ("event_id","news_id");
