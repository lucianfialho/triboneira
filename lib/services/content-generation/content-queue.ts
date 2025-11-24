import { ContentItem, QueuedContent, ContentPriority, ContentStatus } from './types';

/**
 * Content Queue Service
 * Manages a queue of content items to be published
 */
export class ContentQueue {
  private queue: Map<string, QueuedContent>;
  private priorityOrder: ContentPriority[] = ['high', 'medium', 'low'];

  constructor() {
    this.queue = new Map();
  }

  /**
   * Add item to queue
   */
  enqueue(item: ContentItem): void {
    const queuedItem: QueuedContent = {
      ...item,
      attempts: 0,
      status: 'ready',
    };

    this.queue.set(item.id, queuedItem);
    console.log(`✅ Enqueued content: ${item.id} (${item.platform} ${item.format})`);
  }

  /**
   * Add multiple items to queue
   */
  enqueueBatch(items: ContentItem[]): void {
    items.forEach(item => this.enqueue(item));
    console.log(`✅ Enqueued ${items.length} content items`);
  }

  /**
   * Get next item from queue based on priority
   */
  dequeue(): QueuedContent | null {
    // Get ready items sorted by priority
    const readyItems = Array.from(this.queue.values())
      .filter(item => item.status === 'ready')
      .sort((a, b) => {
        // Sort by priority first
        const priorityDiff =
          this.priorityOrder.indexOf(a.priority) - this.priorityOrder.indexOf(b.priority);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        // Then by scheduled time (if exists)
        if (a.scheduledFor && b.scheduledFor) {
          return a.scheduledFor.getTime() - b.scheduledFor.getTime();
        }

        // Finally by generation time
        return a.generatedAt.getTime() - b.generatedAt.getTime();
      });

    if (readyItems.length === 0) {
      return null;
    }

    const item = readyItems[0];
    item.status = 'scheduled';
    return item;
  }

  /**
   * Get items by status
   */
  getByStatus(status: ContentStatus): QueuedContent[] {
    return Array.from(this.queue.values()).filter(item => item.status === status);
  }

  /**
   * Get items by priority
   */
  getByPriority(priority: ContentPriority): QueuedContent[] {
    return Array.from(this.queue.values()).filter(item => item.priority === priority);
  }

  /**
   * Get items by platform
   */
  getByPlatform(platform: string): QueuedContent[] {
    return Array.from(this.queue.values()).filter(item => item.platform === platform);
  }

  /**
   * Update item status
   */
  updateStatus(id: string, status: ContentStatus, error?: string): void {
    const item = this.queue.get(id);
    if (!item) {
      console.warn(`Item not found in queue: ${id}`);
      return;
    }

    item.status = status;

    if (status === 'published') {
      item.publishedAt = new Date();
    }

    if (error) {
      item.error = error;
      item.lastAttempt = new Date();
      item.attempts++;
    }

    console.log(`📝 Updated ${id} status: ${status}${error ? ` (${error})` : ''}`);
  }

  /**
   * Mark item as published
   */
  markPublished(id: string): void {
    this.updateStatus(id, 'published');
  }

  /**
   * Mark item as failed
   */
  markFailed(id: string, error: string): void {
    this.updateStatus(id, 'failed', error);
  }

  /**
   * Retry failed item
   */
  retry(id: string, maxAttempts: number = 3): boolean {
    const item = this.queue.get(id);
    if (!item) {
      return false;
    }

    if (item.attempts >= maxAttempts) {
      console.warn(`Max attempts reached for ${id}`);
      return false;
    }

    item.status = 'ready';
    item.error = undefined;
    console.log(`🔄 Retrying ${id} (attempt ${item.attempts + 1}/${maxAttempts})`);
    return true;
  }

  /**
   * Remove item from queue
   */
  remove(id: string): boolean {
    const deleted = this.queue.delete(id);
    if (deleted) {
      console.log(`🗑️  Removed ${id} from queue`);
    }
    return deleted;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue.clear();
    console.log('🗑️  Queue cleared');
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.size;
  }

  /**
   * Get queue stats
   */
  getStats(): {
    total: number;
    byStatus: Record<ContentStatus, number>;
    byPriority: Record<ContentPriority, number>;
    oldest: Date | null;
    newest: Date | null;
  } {
    const items = Array.from(this.queue.values());

    const stats = {
      total: items.length,
      byStatus: {
        draft: 0,
        ready: 0,
        scheduled: 0,
        published: 0,
        failed: 0,
      } as Record<ContentStatus, number>,
      byPriority: {
        high: 0,
        medium: 0,
        low: 0,
      } as Record<ContentPriority, number>,
      oldest: null as Date | null,
      newest: null as Date | null,
    };

    items.forEach(item => {
      stats.byStatus[item.status]++;
      stats.byPriority[item.priority]++;

      if (!stats.oldest || item.generatedAt < stats.oldest) {
        stats.oldest = item.generatedAt;
      }

      if (!stats.newest || item.generatedAt > stats.newest) {
        stats.newest = item.generatedAt;
      }
    });

    return stats;
  }

  /**
   * Clean old published items
   */
  cleanup(olderThanDays: number = 7): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    let removed = 0;
    this.queue.forEach((item, id) => {
      if (item.status === 'published' && item.publishedAt && item.publishedAt < cutoff) {
        this.queue.delete(id);
        removed++;
      }
    });

    if (removed > 0) {
      console.log(`🗑️  Cleaned up ${removed} old published items`);
    }

    return removed;
  }

  /**
   * Export queue to JSON
   */
  export(): QueuedContent[] {
    return Array.from(this.queue.values());
  }

  /**
   * Import queue from JSON
   */
  import(items: QueuedContent[]): void {
    items.forEach(item => {
      this.queue.set(item.id, item);
    });
    console.log(`📥 Imported ${items.length} items to queue`);
  }
}

// Global instance
let globalQueue: ContentQueue | null = null;

export function getContentQueue(): ContentQueue {
  if (!globalQueue) {
    globalQueue = new ContentQueue();
  }
  return globalQueue;
}
