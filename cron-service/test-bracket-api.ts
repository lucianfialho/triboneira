import { db } from '../lib/db/client';
import { events, matches } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function testBracketAPI() {
  console.log('🔍 Finding events in database...\n');

  // Get all events
  const allEvents = await db
    .select({
      id: events.id,
      externalId: events.externalId,
      name: events.name,
      status: events.status,
    })
    .from(events)
    .limit(10);

  if (allEvents.length === 0) {
    console.log('❌ No events found in database');
    return;
  }

  console.log(`✅ Found ${allEvents.length} events\n`);

  // For each event, count matches
  for (const event of allEvents) {
    const matchCount = await db
      .select({ count: matches.id })
      .from(matches)
      .where(eq(matches.eventId, event.id));

    console.log(`📊 Event: ${event.name}`);
    console.log(`   ID: ${event.externalId}`);
    console.log(`   Status: ${event.status}`);
    console.log(`   Matches: ${matchCount.length}`);
    console.log();
  }

  // Test the API with the first event
  if (allEvents.length > 0) {
    const testEvent = allEvents[0];
    console.log(`🧪 Testing bracket API with event: ${testEvent.externalId}\n`);

    try {
      const response = await fetch(`http://localhost:3000/api/events/${testEvent.externalId}/bracket`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:');
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(errorText);
      }
    } catch (error: any) {
      console.log(`❌ Fetch Error: ${error.message}`);
      console.log('Make sure the Next.js dev server is running on port 3000');
    }
  }
}

testBracketAPI();
