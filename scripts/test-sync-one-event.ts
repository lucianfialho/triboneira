import { config } from 'dotenv';
config({ path: '.env.local' });

import { getHLTVClient } from '../lib/services/hltv/client';
import { db } from '../lib/db/client';
import { teams } from '../lib/db/schema';

async function testSyncOneEvent() {
  try {
    const hltvClient = getHLTVClient();

    // Get event details
    console.log('Fetching event 8841 (DraculaN Season 3)...\n');
    const event = await hltvClient.getEvent(8841);

    console.log(`Event: ${event.name}`);
    console.log(`Teams: ${event.teams?.length || 0}\n`);

    if (!event.teams || event.teams.length === 0) {
      console.log('No teams found');
      return;
    }

    // Test with first 3 teams
    const teamsToTest = event.teams.slice(0, 3);

    for (const hltvTeam of teamsToTest) {
      console.log(`\nFetching details for: ${hltvTeam.name} (ID: ${hltvTeam.id})`);

      try {
        const teamDetails = await hltvClient.getTeam(hltvTeam.id);

        console.log(`  Logo: ${teamDetails.logo || 'NULL'}`);
        console.log(`  Rank: ${teamDetails.rank || 'NULL'}`);
        console.log(`  Country: ${teamDetails.country?.code || 'NULL'}`);

        // Save to database
        await db
          .insert(teams)
          .values({
            gameId: 1,
            externalId: hltvTeam.id.toString(),
            source: 'hltv',
            name: teamDetails.name,
            country: teamDetails.country?.code || null,
            logoUrl: teamDetails.logo || null,
            rank: teamDetails.rank || null,
            active: true,
            metadata: {
              location: teamDetails.country,
            },
          })
          .onConflictDoUpdate({
            target: [teams.externalId, teams.source],
            set: {
              name: teamDetails.name,
              country: teamDetails.country?.code || null,
              logoUrl: teamDetails.logo || null,
              rank: teamDetails.rank || null,
              updatedAt: new Date(),
            },
          });

        console.log(`  ✅ Saved to database`);
      } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }

    // Check database
    console.log('\n--- Checking database ---');
    const dbTeams = await db
      .select()
      .from(teams)
      .limit(5);

    dbTeams.forEach(t => {
      console.log(`${t.name}: ${t.logoUrl ? '✅ HAS LOGO' : '❌ NO LOGO'}`);
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testSyncOneEvent();
