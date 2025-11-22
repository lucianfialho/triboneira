import { db } from '../../db/client';
import { syncLogs } from '../../db/schema';
import { eq } from 'drizzle-orm';

export type SyncStatus = 'running' | 'success' | 'failed' | 'partial';

export interface SyncLogResult {
  id: number;
  jobName: string;
  status: SyncStatus;
  itemsSynced: number;
  startedAt: Date;
  completedAt: Date | null;
}

/**
 * Logger for sync jobs
 * Provides auditability and debugging capabilities
 */
export class SyncLogger {
  private logId: number | null = null;

  /**
   * Start logging a sync job
   */
  async start(
    jobName: string,
    gameId?: number,
    eventId?: number
  ): Promise<number> {
    const [log] = await db
      .insert(syncLogs)
      .values({
        jobName,
        gameId: gameId || null,
        eventId: eventId || null,
        status: 'running',
        startedAt: new Date(),
      })
      .returning();

    this.logId = log.id;
    console.log(`📊 [${jobName}] Started (log_id: ${this.logId})`);
    return this.logId;
  }

  /**
   * Complete sync job successfully
   */
  async success(itemsSynced: number): Promise<void> {
    if (!this.logId) {
      throw new Error('Logger not started. Call start() first.');
    }

    await db
      .update(syncLogs)
      .set({
        status: 'success',
        itemsSynced,
        completedAt: new Date(),
      })
      .where(eq(syncLogs.id, this.logId));

    console.log(`✅ [log_id: ${this.logId}] Success - ${itemsSynced} items synced`);
  }

  /**
   * Mark sync job as failed
   */
  async failed(error: Error | string): Promise<void> {
    if (!this.logId) {
      throw new Error('Logger not started. Call start() first.');
    }

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? null : error.stack;

    await db
      .update(syncLogs)
      .set({
        status: 'failed',
        errors: {
          message: errorMessage,
          stack: errorStack,
        },
        completedAt: new Date(),
      })
      .where(eq(syncLogs.id, this.logId));

    console.error(`❌ [log_id: ${this.logId}] Failed - ${errorMessage}`);
  }

  /**
   * Mark sync job as partially successful
   */
  async partial(itemsSynced: number, errors: any[]): Promise<void> {
    if (!this.logId) {
      throw new Error('Logger not started. Call start() first.');
    }

    await db
      .update(syncLogs)
      .set({
        status: 'partial',
        itemsSynced,
        errors: { errors },
        completedAt: new Date(),
      })
      .where(eq(syncLogs.id, this.logId));

    console.warn(
      `⚠️  [log_id: ${this.logId}] Partial - ${itemsSynced} items synced, ${errors.length} errors`
    );
  }
}

/**
 * Wrapper function to log sync jobs automatically
 */
export async function withSyncLog<T>(
  jobName: string,
  fn: (logger: SyncLogger) => Promise<T>,
  gameId?: number,
  eventId?: number
): Promise<T> {
  const logger = new SyncLogger();
  await logger.start(jobName, gameId, eventId);

  try {
    const result = await fn(logger);
    return result;
  } catch (error) {
    await logger.failed(error as Error);
    throw error;
  }
}
