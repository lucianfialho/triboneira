import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { teams } from '../lib/db/schema';
import { isNull, isNotNull } from 'drizzle-orm';

async function checkMissingLogos() {
  try {
    // Teams WITH logo
    const teamsWithLogo = await db
      .select()
      .from(teams)
      .where(isNotNull(teams.logoUrl));
    
    console.log(`✅ Teams with logo: ${teamsWithLogo.length}`);
    
    // Teams WITHOUT logo
    const teamsWithoutLogo = await db
      .select()
      .from(teams)
      .where(isNull(teams.logoUrl));
    
    console.log(`❌ Teams without logo: ${teamsWithoutLogo.length}\n`);
    
    if (teamsWithoutLogo.length > 0) {
      console.log('--- Sample teams without logo ---');
      teamsWithoutLogo.slice(0, 10).forEach(t => {
        console.log(`- [${t.externalId}] ${t.name} (${t.source})`);
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkMissingLogos();
