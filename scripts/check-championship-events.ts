import { config } from 'dotenv';
import { db } from '../lib/db/client';
import { events } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

config({ path: '.env.local' });

async function checkChampionshipEvents() {
  const championshipEvents = await db
    .select()
    .from(events)
    .where(eq(events.championshipMode, true));

  console.log('\n📊 Championship Mode Events:');
  console.log(`Total: ${championshipEvents.length}\n`);

  championshipEvents.forEach(event => {
    console.log(`ID: ${event.id}`);
    console.log(`External ID: ${event.externalId}`);
    console.log(`Name: ${event.name}`);
    console.log(`Status: ${event.status}`);
    console.log(`---`);
  });

  process.exit(0);
}

checkChampionshipEvents();
