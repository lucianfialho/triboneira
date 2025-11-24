CREATE TABLE "event_news" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"news_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swiss_rounds" (
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
ALTER TABLE "event_news" ADD CONSTRAINT "event_news_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_news" ADD CONSTRAINT "event_news_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_team1_id_teams_id_fk" FOREIGN KEY ("team1_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swiss_rounds" ADD CONSTRAINT "swiss_rounds_team2_id_teams_id_fk" FOREIGN KEY ("team2_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_event_news_idx" ON "event_news" USING btree ("event_id","news_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_swiss_round_idx" ON "swiss_rounds" USING btree ("event_id","round_number","match_id");