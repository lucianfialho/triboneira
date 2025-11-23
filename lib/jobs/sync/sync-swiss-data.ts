import { SyncLogger } from '../utils/logger';
import { getPlaywrightScraper } from '../../services/hltv/playwright-scraper';
import { db } from '../../../lib/db/client';
import { events } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Syncs Swiss bracket data from HLTV for championship events
 * Stores the Swiss group JSON in the event metadata
 */
export async function syncSwissData(logger: SyncLogger, eventId?: number) {
  console.log('🏆 Starting Swiss data sync...\n');

  try {
    const scraper = await getPlaywrightScraper();

    // If eventId is provided, sync only that event
    // Otherwise, sync all events with championshipMode = true
    let targetEvents;

    if (eventId) {
      targetEvents = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);
    } else {
      targetEvents = await db
        .select()
        .from(events)
        .where(eq(events.championshipMode, true));
    }

    if (targetEvents.length === 0) {
      console.log('⚠️  No championship events found to sync Swiss data');
      await logger.success(0);
      return;
    }

    console.log(`📊 Found ${targetEvents.length} championship event(s) to sync\n`);

    let syncedCount = 0;

    for (const event of targetEvents) {
      try {
        console.log(`🔍 Syncing Swiss data for event: ${event.name} (ID: ${event.id})`);

        // Extract external ID from the event
        const externalEventId = parseInt(event.externalId);

        if (isNaN(externalEventId)) {
          console.log(`⚠️  Invalid external ID for event ${event.id}: ${event.externalId}`);
          continue;
        }

        // Scrape Swiss group data from HLTV
        const swissData = await scraper.scrapeSwissGroupData(externalEventId);

        if (!swissData) {
          console.log(`⚠️  No Swiss data found for event ${event.id} (${event.name})`);
          continue;
        }

        // Update event metadata with Swiss data
        const currentMetadata = (event.metadata as any) || {};
        const updatedMetadata = {
          ...currentMetadata,
          swissData,
          swissDataUpdatedAt: new Date().toISOString(),
        };

        await db
          .update(events)
          .set({
            metadata: updatedMetadata,
            updatedAt: new Date(),
          })
          .where(eq(events.id, event.id));

        console.log(`✅ Swiss data synced for event: ${event.name}`);
        console.log(`   Teams: ${swissData.slotIdToTeamInfo?.length || 0}`);
        console.log(`   3-0 teams: ${swissData.structure?.groupResults?.threeZeros?.length || 0}`);
        console.log(`   0-3 teams: ${swissData.structure?.groupResults?.zeroThrees?.length || 0}`);
        console.log(`   Playing: ${swissData.structure?.groupResults?.notFinished?.length || 0}\n`);

        syncedCount++;

      } catch (error: any) {
        console.error(`❌ Failed to sync Swiss data for event ${event.id}: ${error.message}`);
      }
    }

    await logger.success(syncedCount);
    console.log(`\n✅ Swiss data sync completed! (${syncedCount} events synced)`);

  } catch (error: any) {
    console.error(`❌ Swiss data sync failed: ${error.message}`);
    await logger.failed(error);
    throw error;
  }
}
