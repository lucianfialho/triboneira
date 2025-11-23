import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { matches, teams } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkSwissMatches() {
  console.log('🔍 Analyzing Swiss System matches for Stage 1...\n');

  const eventId = 14; // Stage 1

  const matchesData = await db
    .select({
      id: matches.id,
      date: matches.date,
      status: matches.status,
      team1Id: matches.team1Id,
      team2Id: matches.team2Id,
      winnerId: matches.winnerId,
      scoreTeam1: matches.scoreTeam1,
      scoreTeam2: matches.scoreTeam2,
    })
    .from(matches)
    .where(eq(matches.eventId, eventId))
    .orderBy(matches.date);

  console.log(`Found ${matchesData.length} matches\n`);

  // Group by date
  const byDate = new Map<string, typeof matchesData>();

  matchesData.forEach(match => {
    const date = match.date ? new Date(match.date).toISOString().split('T')[0] : 'no-date';
    const time = match.date ? new Date(match.date).toTimeString().slice(0, 5) : 'no-time';
    const key = `${date} ${time}`;

    if (!byDate.has(key)) {
      byDate.set(key, []);
    }
    byDate.get(key)!.push(match);
  });

  console.log('📅 Matches grouped by date/time:\n');
  byDate.forEach((matches, dateTime) => {
    console.log(`${dateTime}:`);
    matches.forEach(m => {
      console.log(`  Match ${m.id}: Team ${m.team1Id} vs Team ${m.team2Id} - ${m.status}`);
      if (m.winnerId) {
        console.log(`    Winner: Team ${m.winnerId}, Score: ${m.scoreTeam1}-${m.scoreTeam2}`);
      }
    });
    console.log();
  });

  // Check unique dates
  const uniqueDates = Array.from(byDate.keys());
  console.log(`\n📊 Total unique date/time slots: ${uniqueDates.length}`);
  console.log(`Expected rounds in Swiss System (16 teams): 5 rounds`);
  console.log(`Current data suggests: ${uniqueDates.length} rounds\n`);
}

checkSwissMatches().catch(console.error);
