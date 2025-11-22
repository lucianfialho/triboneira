import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { syncEventParticipants } from '../lib/jobs/sync/sync-event-participants';
import { SyncLogger } from '../lib/jobs/utils/logger';

async function test() {
  console.log('🧪 Testing sync-event-participants job...\n');

  const logger = new SyncLogger();
  await logger.start('test-sync-event-participants');

  try {
    const result = await syncEventParticipants(logger);
    console.log(`\n✅ Test completed: ${result} participants synced`);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await logger.failed(error as Error);
    process.exit(1);
  }
}

test();
