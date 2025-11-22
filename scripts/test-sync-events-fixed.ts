import { config } from 'dotenv';
config({ path: '.env.local' });

import { syncEvents } from '../lib/jobs/sync/sync-events';
import { SyncLogger } from '../lib/jobs/utils/logger';

async function testSyncEvents() {
  try {
    const logger = new SyncLogger();
    await logger.start('sync-events-test');

    console.log('Testing sync-events with full details...\n');

    const count = await syncEvents(logger);

    console.log(`\n✅ Synced ${count} events`);

    // Check a sample
    const { db } = await import('../lib/db/client');
    const { events } = await import('../lib/db/schema');
    const { eq } = await import('drizzle-orm');

    const draculan = await db
      .select()
      .from(events)
      .where(eq(events.externalId, '8841'))
      .limit(1);

    if (draculan.length > 0) {
      console.log('\n--- DraculaN Season 3 ---');
      console.log('Prize Pool:', draculan[0].prizePool);
      console.log('Location:', draculan[0].location);
      console.log('Metadata:', JSON.stringify(draculan[0].metadata, null, 2));
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

testSyncEvents();
