import { config } from 'dotenv';
import { db } from '../lib/db/client';
import { events } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

config({ path: '.env.local' });

async function setChampionshipMode() {
  // Set StarLadder Budapest Major 2025 Stage 1 as championship mode
  const eventId = 14; // Stage 1 of the Major

  await db
    .update(events)
    .set({ championshipMode: true })
    .where(eq(events.id, eventId));

  console.log(`✅ Event ID ${eventId} set to championship mode`);

  // Verify
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId));

  console.log('\nEvent Details:');
  console.log(`Name: ${event.name}`);
  console.log(`Championship Mode: ${event.championshipMode}`);

  process.exit(0);
}

setChampionshipMode();
