import { db } from '../../db/client';
import { matches, teams, events } from '../../db/schema';
import { eq, and, gte, or } from 'drizzle-orm';
import { SyncLogger } from '../utils/logger';
import { handleMatchFinished } from '../../services/content-generation';
import { HLTVClient } from '../../services/hltv/client';

const hltvClient = new HLTVClient();

/**
 * Generate Content Job
 *
 * Checks recent matches that might have finished and generates content for them
 *
 * Flow:
 * 1. Find matches from last 6 hours that are scheduled or live
 * 2. Check if they finished (via HLTV API)
 * 3. Update match status and data
 * 4. Generate content automatically
 */

export async function generateContent(logger: SyncLogger) {
  console.log('🎨 Checking for finished matches and generating content...\n');

  // Find matches from last 6 hours that might have finished
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const recentMatches = await db.query.matches.findMany({
    where: (matches, { and, gte, or, eq }) =>
      and(
        gte(matches.date, sixHoursAgo),
        or(eq(matches.status, 'scheduled'), eq(matches.status, 'live'))
      ),
    with: {
      team1: true,
      team2: true,
      event: true,
    },
  });

  console.log(`📊 Found ${recentMatches.length} recent matches to check\n`);

  let contentGenerated = 0;
  let matchesFinished = 0;

  for (const match of recentMatches) {
    const team1 = match.team1;
    const team2 = match.team2;
    const event = match.event;

    if (!match.externalId || !team1 || !team2 || !event) {
      continue;
    }

    try {
      console.log(`🔍 Checking match: ${team1.name} vs ${team2.name}`);

      // Fetch match details from HLTV
      const matchDetails = await hltvClient.getMatch(parseInt(match.externalId));

      // Check if match is finished
      if (!matchDetails || !matchDetails.finished) {
        console.log(`   ⏳ Match not finished yet\n`);
        continue;
      }

      console.log(`   ✅ Match finished! Updating and generating content...`);

      // Determine winner
      let winnerId: number | null = null;
      if (matchDetails.team1Score !== null && matchDetails.team2Score !== null) {
        if (matchDetails.team1Score > matchDetails.team2Score) {
          winnerId = team1.id;
        } else if (matchDetails.team2Score > matchDetails.team1Score) {
          winnerId = team2.id;
        }
      }

      // Update match in database
      await db
        .update(matches)
        .set({
          status: 'finished',
          winnerId,
          scoreTeam1: matchDetails.team1Score,
          scoreTeam2: matchDetails.team2Score,
          maps: matchDetails.maps ? JSON.stringify(matchDetails.maps) : null,
          updatedAt: new Date(),
        })
        .where(eq(matches.id, match.id));

      matchesFinished++;

      // Prepare match data for content generation
      const matchData = {
        team1: {
          id: team1.id,
          name: team1.name,
          logoUrl: team1.logoUrl,
          rank: team1.rank,
        },
        team2: {
          id: team2.id,
          name: team2.name,
          logoUrl: team2.logoUrl,
          rank: team2.rank,
        },
        winner: winnerId
          ? {
              id: winnerId,
              name: winnerId === team1.id ? team1.name : team2.name,
            }
          : null,
        score: {
          team1: matchDetails.team1Score ?? 0,
          team2: matchDetails.team2Score ?? 0,
        },
        maps: matchDetails.maps || [],
        format: match.format || 'bo1',
        event: {
          id: event.id,
          name: event.name,
        },
        matchId: match.id,
      };

      // Generate content automatically
      await handleMatchFinished(match.id, matchData);
      contentGenerated++;

      console.log(`   🎨 Content generated!\n`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`   ❌ Error processing match ${match.id}:`, error.message);
      console.log('');
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Matches checked: ${recentMatches.length}`);
  console.log(`   Matches finished: ${matchesFinished}`);
  console.log(`   Content generated: ${contentGenerated}`);

  await logger.success(contentGenerated);
  return contentGenerated;
}
