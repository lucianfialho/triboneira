import { db } from '../../db/client';
import { events } from '../../db/schema';
import { eq, or, sql } from 'drizzle-orm';
import { SyncLogger } from '../utils/logger';

/**
 * Fix Event Status
 * Recalculates event status based on dates
 * Useful for fixing events with undefined or incorrect status
 */
export async function fixEventStatus(logger: SyncLogger) {
  console.log('🔧 Fixing event statuses based on dates...\n');

  try {
    // Get all events
    const allEvents = await db.select().from(events);
    console.log(`   Found ${allEvents.length} events to check`);

    const now = new Date();
    let fixed = 0;

    for (const event of allEvents) {
      if (!event.dateStart) continue;

      const eventStart = new Date(event.dateStart);
      const eventEnd = event.dateEnd ? new Date(event.dateEnd) : eventStart;

      // Calculate correct status
      let correctStatus: 'upcoming' | 'ongoing' | 'finished' = 'upcoming';

      if (now >= eventStart && now <= eventEnd) {
        correctStatus = 'ongoing';
      } else if (now > eventEnd) {
        correctStatus = 'finished';
      }

      // Update if status is different
      if (event.status !== correctStatus) {
        console.log(`   🔄 Fixing ${event.name}: ${event.status} → ${correctStatus}`);

        // Recalculate championship mode
        const isMajor =
          event.name.toLowerCase().includes('major') ||
          (event.prizePool && parseInt(event.prizePool.replace(/\D/g, '')) >= 1000000);

        const championshipMode = Boolean(correctStatus === 'ongoing' && isMajor);

        await db
          .update(events)
          .set({
            status: correctStatus,
            championshipMode,
            updatedAt: now,
          })
          .where(eq(events.id, event.id));

        fixed++;

        if (championshipMode && !event.championshipMode) {
          console.log(`   🔴 ${event.name} - CHAMPIONSHIP MODE ENABLED`);
        }
      }
    }

    console.log(`\n✅ Fixed ${fixed} event statuses`);
    await logger.success(fixed);
    return fixed;
  } catch (error: any) {
    console.error('❌ Error fixing event statuses:', error.message);
    throw error;
  }
}
