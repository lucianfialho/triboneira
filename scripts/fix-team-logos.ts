import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { teams } from '../lib/db/schema';
import { isNull, eq } from 'drizzle-orm';
import { getHLTVClient } from '../lib/services/hltv/client';

async function fixTeamLogos() {
  try {
    // Get teams without logo
    const teamsWithoutLogo = await db
      .select()
      .from(teams)
      .where(isNull(teams.logoUrl));

    console.log(`Found ${teamsWithoutLogo.length} teams without logo\n`);

    if (teamsWithoutLogo.length === 0) {
      console.log('✅ All teams already have logos!');
      return;
    }

    const hltvClient = getHLTVClient();
    let fixed = 0;
    let failed = 0;

    for (let i = 0; i < teamsWithoutLogo.length; i++) {
      const team = teamsWithoutLogo[i];
      console.log(`[${i + 1}/${teamsWithoutLogo.length}] Fixing ${team.name}...`);

      try {
        const teamDetails = await hltvClient.getTeam(parseInt(team.externalId));

        if (teamDetails.logo) {
          await db
            .update(teams)
            .set({
              logoUrl: teamDetails.logo,
              rank: teamDetails.rank || team.rank,
              country: teamDetails.country?.code || team.country,
              updatedAt: new Date(),
            })
            .where(eq(teams.id, team.id));

          console.log(`  ✅ Updated: ${teamDetails.logo.substring(0, 60)}...`);
          fixed++;
        } else {
          console.log(`  ⚠️  No logo available`);
        }
      } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  No logo: ${teamsWithoutLogo.length - fixed - failed}`);
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

fixTeamLogos();
