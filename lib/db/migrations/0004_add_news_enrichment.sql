-- Migration: Add News Enrichment System Tables
-- Description: Multi-agent AI system for translating news to PT-BR and generating Particle-style summaries

-- Table 1: news_enrichment_queue
-- Purpose: Job queue for enrichment processing
CREATE TABLE IF NOT EXISTS "news_enrichment_queue" (
  "id" SERIAL PRIMARY KEY,
  "news_id" INTEGER NOT NULL REFERENCES "news"("id") ON DELETE CASCADE,
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  "priority" INTEGER NOT NULL DEFAULT 5, -- 1-10 (10 = highest)
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "max_attempts" INTEGER NOT NULL DEFAULT 3,
  "error_message" TEXT,
  "last_attempt_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "completed_at" TIMESTAMP
);

-- Indexes for news_enrichment_queue
CREATE UNIQUE INDEX IF NOT EXISTS "unique_news_queue_idx" ON "news_enrichment_queue"("news_id");
CREATE INDEX IF NOT EXISTS "queue_status_priority_idx" ON "news_enrichment_queue"("status", "priority" DESC, "created_at");

-- Table 2: news_content_cache
-- Purpose: Cache scraped article content to avoid re-scraping
CREATE TABLE IF NOT EXISTS "news_content_cache" (
  "id" SERIAL PRIMARY KEY,
  "news_id" INTEGER NOT NULL REFERENCES "news"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL, -- Full article text
  "word_count" INTEGER NOT NULL,
  "scrape_method" VARCHAR(50) NOT NULL, -- 'playwright', 'fallback-title'
  "selectors_used" JSONB, -- CSS selectors that worked
  "scraped_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for news_content_cache
CREATE UNIQUE INDEX IF NOT EXISTS "unique_news_content_idx" ON "news_content_cache"("news_id");

-- Table 3: news_translations
-- Purpose: Store translated news content in different languages
CREATE TABLE IF NOT EXISTS "news_translations" (
  "id" SERIAL PRIMARY KEY,
  "news_id" INTEGER NOT NULL REFERENCES "news"("id") ON DELETE CASCADE,
  "language" VARCHAR(10) NOT NULL, -- 'pt-BR', 'es', 'fr' (future)
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "agent_metadata" JSONB, -- { model, tokens, confidence, processingTime }
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for news_translations
CREATE UNIQUE INDEX IF NOT EXISTS "unique_translation_idx" ON "news_translations"("news_id", "language");
CREATE INDEX IF NOT EXISTS "translation_language_idx" ON "news_translations"("language");

-- Table 4: news_summaries
-- Purpose: Store Particle-style bullet point summaries
CREATE TABLE IF NOT EXISTS "news_summaries" (
  "id" SERIAL PRIMARY KEY,
  "news_id" INTEGER NOT NULL REFERENCES "news"("id") ON DELETE CASCADE,
  "language" VARCHAR(10) NOT NULL, -- 'pt-BR'
  "style" VARCHAR(20) NOT NULL, -- '5ws', 'eli5', 'bullet-points', 'key-facts'
  "bullets" JSONB NOT NULL, -- Array of bullet objects with type and text
  "agent_metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for news_summaries
CREATE UNIQUE INDEX IF NOT EXISTS "unique_summary_idx" ON "news_summaries"("news_id", "language", "style");
CREATE INDEX IF NOT EXISTS "summary_language_style_idx" ON "news_summaries"("language", "style");

-- PostgreSQL Trigger Function
-- Purpose: Automatically enqueue news for enrichment when inserted
CREATE OR REPLACE FUNCTION enqueue_news_enrichment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO news_enrichment_queue (news_id, status, priority, created_at)
  VALUES (NEW.id, 'pending', 5, NOW())
  ON CONFLICT (news_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-enqueue news after insert
CREATE TRIGGER trigger_enqueue_news
  AFTER INSERT ON news
  FOR EACH ROW
  EXECUTE FUNCTION enqueue_news_enrichment();
