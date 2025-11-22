import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { teams } from '../lib/db/schema';
import { isNotNull } from 'drizzle-orm';

async function checkTeamLogos() {
  try {
    // Check teams with logo
    const teamsWithLogo = await db
      .select()
      .from(teams)
      .where(isNotNull(teams.logoUrl))
      .limit(5);

    console.log('Teams with logo_url:');
    console.log(teamsWithLogo.length);
    teamsWithLogo.forEach(t => {
      console.log(`- ${t.name}: ${t.logoUrl}`);
    });

    // Check all teams
    const allTeams = await db
      .select()
      .from(teams)
      .limit(10);

    console.log('\n--- Sample of all teams ---');
    allTeams.forEach(t => {
      console.log(`- [${t.externalId}] ${t.name} | logo: ${t.logoUrl || 'NULL'}`);
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkTeamLogos();
