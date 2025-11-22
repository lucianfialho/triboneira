import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { syncMatches } from '../lib/jobs/sync/sync-matches';
import { SyncLogger } from '../lib/jobs/utils/logger';

async function test() {
  console.log('🧪 Testing sync-matches job...\n');

  const logger = new SyncLogger();
  await logger.start('test-sync-matches');

  try {
    // Test normal mode (not championship)
    const result = await syncMatches(logger, false);
    console.log(`\n✅ Test completed: ${result} matches synced`);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await logger.failed(error as Error);
    process.exit(1);
  }
}

test();
