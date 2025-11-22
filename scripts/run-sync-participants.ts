import { config } from 'dotenv';
config({ path: '.env.local' });

import { syncEventParticipants } from '../lib/jobs/sync/sync-event-participants';
import { SyncLogger } from '../lib/jobs/utils/logger';

async function runSync() {
  try {
    const logger = new SyncLogger();
    await logger.start('sync-event-participants');

    const count = await syncEventParticipants(logger);

    console.log(`\n✅ Sync completed: ${count} participants synced`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

runSync();
