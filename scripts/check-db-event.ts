import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { events } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkDbEvent() {
  try {
    // Check by external ID
    const event = await db
      .select()
      .from(events)
      .where(eq(events.externalId, '8841'))
      .limit(1);
    
    if (event.length > 0) {
      console.log('Evento encontrado no banco:');
      console.log(JSON.stringify(event[0], null, 2));
    } else {
      console.log('Evento 8841 não encontrado no banco');
    }
    
    // Check all ongoing events
    console.log('\n--- Eventos com status "ongoing" no banco ---');
    const ongoingEvents = await db
      .select()
      .from(events)
      .where(eq(events.status, 'ongoing'));
    
    console.log(`Total: ${ongoingEvents.length}`);
    ongoingEvents.forEach(e => {
      console.log(`- [${e.externalId}] ${e.name} (${e.status})`);
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkDbEvent();
