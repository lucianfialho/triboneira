import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { syncEvents } from '../lib/jobs/sync/sync-events';
import { SyncLogger } from '../lib/jobs/utils/logger';

async function test() {
  console.log('🧪 Testing sync-events job...\n');

  const logger = new SyncLogger();
  await logger.start('test-sync-events');

  try {
    const result = await syncEvents(logger);
    console.log(`\n✅ Test completed: ${result} events synced`);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await logger.failed(error as Error);
    process.exit(1);
  }
}

test();
