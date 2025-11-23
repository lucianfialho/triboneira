import { config } from 'dotenv';
import { db } from '../lib/db/client';
import { events } from '../lib/db/schema';
import { like, or } from 'drizzle-orm';

config({ path: '.env.local' });

async function findMajorEvents() {
  const majorEvents = await db
    .select()
    .from(events)
    .where(
      or(
        like(events.name, '%Major%'),
        like(events.name, '%major%')
      )
    );

  console.log('\n📊 Major Events:');
  majorEvents.forEach(event => {
    console.log(`\nID: ${event.id}`);
    console.log(`External ID: ${event.externalId}`);
    console.log(`Name: ${event.name}`);
    console.log(`Status: ${event.status}`);
    console.log(`Championship Mode: ${event.championshipMode}`);
  });

  process.exit(0);
}

findMajorEvents();
