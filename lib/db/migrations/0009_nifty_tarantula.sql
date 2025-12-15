ALTER TABLE "events" ADD COLUMN "slug" varchar(200);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_slug_idx" ON "events" USING btree ("slug");