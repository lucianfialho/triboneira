import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { events } from '../lib/db/schema';

async function checkEventData() {
  try {
    // Sample of events
    const sampleEvents = await db
      .select()
      .from(events)
      .limit(10);

    console.log('--- Sample Events ---\n');
    sampleEvents.forEach(e => {
      console.log(`Event: ${e.name}`);
      console.log(`  Prize Pool: ${e.prizePool || 'NULL'}`);
      console.log(`  Location: ${e.location || 'NULL'}`);
      console.log(`  Status: ${e.status}`);
      console.log(`  Championship Mode: ${e.championshipMode}`);
      console.log(`  Metadata: ${JSON.stringify(e.metadata)}`);
      console.log('');
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkEventData();
