import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { syncNews } from '../lib/jobs/sync/sync-news';
import { SyncLogger } from '../lib/jobs/utils/logger';

async function test() {
  console.log('🧪 Testing sync-news job...\n');

  const logger = new SyncLogger();
  await logger.start('test-sync-news');

  try {
    const result = await syncNews(logger);
    console.log(`\n✅ Test completed: ${result} news items synced`);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await logger.failed(error as Error);
    process.exit(1);
  }
}

test();
