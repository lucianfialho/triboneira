/**
 * Content Generation Types
 * Types for the content generation system
 */

// Platforms
export type Platform = 'instagram' | 'twitter' | 'tiktok' | 'discord' | 'telegram';

// Content formats
export type ContentFormat = 'feed' | 'story' | 'reel' | 'carousel' | 'tweet' | 'thread';

// Content priority
export type ContentPriority = 'high' | 'medium' | 'low';

// Content status
export type ContentStatus = 'draft' | 'ready' | 'scheduled' | 'published' | 'failed';

// Base content item
export interface ContentItem {
  id: string;
  platform: Platform;
  format: ContentFormat;
  priority: ContentPriority;
  status: ContentStatus;
  templateId: string;
  data: Record<string, any>;
  generatedAt: Date;
  scheduledFor?: Date;
  publishedAt?: Date;
  metadata?: Record<string, any>;
}

// Template types
export type TemplateCategory =
  | 'match-result'
  | 'player-highlight'
  | 'upset'
  | 'overtime'
  | 'epic-series'
  | 'daily-recap'
  | 'top-performances'
  | 'event-announcement'
  | 'event-preview'
  | 'swiss-bracket'
  | 'team-achievement'
  | 'news';

export interface ContentTemplate {
  id: string;
  category: TemplateCategory;
  platform: Platform;
  format: ContentFormat;
  name: string;
  description: string;

  // Required data fields for this template
  requiredFields: string[];

  // Generation function
  generate: (data: Record<string, any>) => GeneratedContent;
}

// Generated content structure
export interface GeneratedContent {
  // Visual content
  visual?: {
    type: 'image' | 'video' | 'carousel';
    template: string; // Template name/path
    data: Record<string, any>; // Data for visual generation
    filePath?: string; // Generated file path (added by visual generator)
    dimensions?: {
      // Generated dimensions
      width: number;
      height: number;
    };
  };

  // Text content
  text: {
    caption?: string;
    headline?: string;
    description?: string;
    cta?: string;
    hashtags?: string[];
  };

  // Links
  links?: {
    url: string;
    title?: string;
  }[];

  // Media assets (if pre-generated)
  media?: {
    url: string;
    type: 'image' | 'video';
    width?: number;
    height?: number;
  }[];
}

// Event types for content generation triggers
export type ContentTriggerEvent =
  | 'match.finished'
  | 'match.live'
  | 'player.performance'
  | 'upset.detected'
  | 'overtime.detected'
  | 'epic-series.detected'
  | 'daily.recap'
  | 'event.starting'
  | 'event.finished'
  | 'swiss.match-decisive'
  | 'team.achievement'
  | 'news.published';

export interface ContentTrigger {
  event: ContentTriggerEvent;
  data: Record<string, any>;
  timestamp: Date;
  priority?: ContentPriority;
}

// Content queue item
export interface QueuedContent extends ContentItem {
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}
