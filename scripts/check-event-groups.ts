import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { events } from '../lib/db/schema';
import { like } from 'drizzle-orm';

async function checkEventGroups() {
  console.log('🔍 Checking for event groups in Major events...\n');

  // Get all Budapest Major events
  const majorEvents = await db
    .select()
    .from(events)
    .where(like(events.name, '%Budapest Major%'));

  console.log(`Found ${majorEvents.length} Budapest Major events:\n`);

  majorEvents.forEach(event => {
    console.log(`📊 Event ID: ${event.id}`);
    console.log(`   External ID: ${event.externalId}`);
    console.log(`   Name: ${event.name}`);
    console.log(`   Status: ${event.status}`);
    console.log(`   Source: ${event.source}`);

    if (event.metadata) {
      console.log(`   Metadata:`, JSON.stringify(event.metadata, null, 2));
    } else {
      console.log(`   Metadata: null`);
    }

    console.log();
  });

  // Check if there's a parent/group relationship pattern
  console.log('Looking for naming patterns...\n');

  const stage1 = majorEvents.find(e => e.name.includes('Stage 1'));
  const stage2 = majorEvents.find(e => e.name.includes('Stage 2'));
  const playoffs = majorEvents.find(e => !e.name.includes('Stage'));

  if (stage1 && stage2 && playoffs) {
    console.log('✅ Found complete Major structure:');
    console.log(`   Stage 1: ${stage1.externalId}`);
    console.log(`   Stage 2: ${stage2.externalId}`);
    console.log(`   Playoffs: ${playoffs.externalId}`);
    console.log();
    console.log('💡 These could be grouped under a parent event');
  }
}

checkEventGroups().catch(console.error);
