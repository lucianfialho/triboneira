ALTER TABLE "news" ADD COLUMN "slug" varchar(200);--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "image_url" varchar(500);--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;