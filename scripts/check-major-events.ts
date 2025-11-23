import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { events, matches } from '../lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

async function checkMajorEvents() {
  console.log('🔍 Checking for Major events in database...\n');

  const majorIds = ['8504', '8505', '8042'];

  // Check if events exist
  const existingEvents = await db
    .select({
      id: events.id,
      externalId: events.externalId,
      name: events.name,
      status: events.status,
    })
    .from(events)
    .where(inArray(events.externalId, majorIds));

  if (existingEvents.length === 0) {
    console.log('❌ No Major events found in database');
    console.log('Expected external IDs: 8504, 8505, 8042\n');

    // Show what events we do have
    const allEvents = await db
      .select({
        externalId: events.externalId,
        name: events.name,
      })
      .from(events)
      .limit(10);

    console.log('📋 Events we have:');
    allEvents.forEach(e => {
      console.log(`   ${e.externalId}: ${e.name}`);
    });
    return;
  }

  console.log(`✅ Found ${existingEvents.length} Major events:\n`);

  for (const event of existingEvents) {
    const matchCount = await db
      .select()
      .from(matches)
      .where(eq(matches.eventId, event.id));

    console.log(`📊 ${event.name}`);
    console.log(`   External ID: ${event.externalId}`);
    console.log(`   Status: ${event.status}`);
    console.log(`   Matches: ${matchCount.length}`);
    console.log();
  }
}

checkMajorEvents().catch(console.error);
