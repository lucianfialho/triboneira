CREATE TABLE "twitter_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"queue_id" integer,
	"twitter_tweet_id" varchar(100) NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"retweets" integer DEFAULT 0 NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"link_clicks" integer DEFAULT 0 NOT NULL,
	"engagement_rate" numeric(5, 2),
	"last_fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "twitter_mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"twitter_mention_id" varchar(100) NOT NULL,
	"author_username" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"response_type" varchar(20),
	"response_content" text,
	"response_tweet_id" varchar(100),
	"category" varchar(50),
	"sentiment" varchar(20),
	"mentioned_at" timestamp NOT NULL,
	"processed_at" timestamp,
	"responded_at" timestamp,
	CONSTRAINT "twitter_mentions_twitter_mention_id_unique" UNIQUE("twitter_mention_id")
);
--> statement-breakpoint
CREATE TABLE "twitter_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"media_urls" jsonb,
	"scheduled_for" timestamp,
	"priority" integer DEFAULT 5 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"tweet_type" varchar(50) NOT NULL,
	"match_id" integer,
	"news_id" integer,
	"twitter_tweet_id" varchar(100),
	"hashtags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"posted_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "twitter_analytics" ADD CONSTRAINT "twitter_analytics_queue_id_twitter_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."twitter_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twitter_queue" ADD CONSTRAINT "twitter_queue_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twitter_queue" ADD CONSTRAINT "twitter_queue_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE no action ON UPDATE no action;