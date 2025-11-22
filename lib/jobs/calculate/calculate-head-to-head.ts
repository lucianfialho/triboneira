import { db } from '../../db/client';
import { teams, matches, headToHead } from '../../db/schema';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import { SyncLogger } from '../utils/logger';

export async function calculateHeadToHead(logger: SyncLogger, eventId?: number) {
  console.log(`🥊 Calculating head-to-head${eventId ? ` for event ${eventId}` : ' (all-time)'}...\n`);

  // Build query conditions
  const conditions = [eq(matches.status, 'finished')];

  if (eventId) {
    conditions.push(eq(matches.eventId, eventId));
  }

  // Get all finished matches
  const finishedMatches = await db
    .select()
    .from(matches)
    .where(and(...conditions));

  if (finishedMatches.length === 0) {
    console.log('⚠️  No finished matches found');
    await logger.success(0);
    return 0;
  }

  console.log(`Found ${finishedMatches.length} finished matches to process\n`);

  // Group matches by team pairs
  const teamPairs = new Map<string, {
    team1Id: number;
    team2Id: number;
    matches: typeof finishedMatches;
  }>();

  for (const match of finishedMatches) {
    // Create a consistent key for team pairs (smaller ID first)
    const [teamA, teamB] = [match.team1Id, match.team2Id].sort((a, b) => a - b);
    const pairKey = `${teamA}-${teamB}`;

    if (!teamPairs.has(pairKey)) {
      teamPairs.set(pairKey, {
        team1Id: teamA,
        team2Id: teamB,
        matches: [],
      });
    }

    teamPairs.get(pairKey)!.matches.push(match);
  }

  console.log(`Processing ${teamPairs.size} unique team pairs\n`);

  let totalCalculated = 0;

  for (const [pairKey, pair] of teamPairs) {
    const { team1Id, team2Id, matches: pairMatches } = pair;

    try {
      // Get team names for logging
      const [team1, team2] = await Promise.all([
        db.select().from(teams).where(eq(teams.id, team1Id)).then(r => r[0]),
        db.select().from(teams).where(eq(teams.id, team2Id)).then(r => r[0]),
      ]);

      if (!team1 || !team2) {
        console.log(`   ⏭️  Skipping ${pairKey}: Team not found`);
        continue;
      }

      console.log(`🔄 ${team1.name} vs ${team2.name}`);

      // Calculate head-to-head stats
      let team1Wins = 0;
      let team2Wins = 0;
      let lastMatchDate: Date | null = null;

      for (const match of pairMatches) {
        if (match.winnerId === team1Id) {
          team1Wins++;
        } else if (match.winnerId === team2Id) {
          team2Wins++;
        }

        if (match.date && (!lastMatchDate || match.date > lastMatchDate)) {
          lastMatchDate = match.date;
        }
      }

      const matchesPlayed = pairMatches.length;

      // Find common opponents for indirect confrontation analysis
      const team1Opponents = await db
        .select({ opponentId: sql<number>`CASE WHEN ${matches.team1Id} = ${team1Id} THEN ${matches.team2Id} ELSE ${matches.team1Id} END` })
        .from(matches)
        .where(
          and(
            or(eq(matches.team1Id, team1Id), eq(matches.team2Id, team1Id)),
            eq(matches.status, 'finished')
          )
        );

      const team2Opponents = await db
        .select({ opponentId: sql<number>`CASE WHEN ${matches.team1Id} = ${team2Id} THEN ${matches.team2Id} ELSE ${matches.team1Id} END` })
        .from(matches)
        .where(
          and(
            or(eq(matches.team1Id, team2Id), eq(matches.team2Id, team2Id)),
            eq(matches.status, 'finished')
          )
        );

      const team1OpponentIds = new Set(team1Opponents.map(o => o.opponentId));
      const team2OpponentIds = new Set(team2Opponents.map(o => o.opponentId));

      const commonOpponents = [...team1OpponentIds].filter(id =>
        team2OpponentIds.has(id) && id !== team1Id && id !== team2Id
      );

      // Upsert head-to-head
      await db
        .insert(headToHead)
        .values({
          team1Id,
          team2Id,
          eventId: eventId || null,
          matchesPlayed,
          team1Wins,
          team2Wins,
          lastMatchDate,
          metadata: {
            commonOpponents: commonOpponents.length,
            lastCalculated: new Date().toISOString(),
            matchIds: pairMatches.map(m => m.id),
          },
        })
        .onConflictDoUpdate({
          target: [headToHead.team1Id, headToHead.team2Id, headToHead.eventId],
          set: {
            matchesPlayed,
            team1Wins,
            team2Wins,
            lastMatchDate,
            metadata: {
              commonOpponents: commonOpponents.length,
              lastCalculated: new Date().toISOString(),
              matchIds: pairMatches.map(m => m.id),
            },
          },
        });

      totalCalculated++;
      console.log(`   ✅ ${matchesPlayed} matches: ${team1.name} ${team1Wins}-${team2Wins} ${team2.name} (${commonOpponents.length} common opponents)\n`);
    } catch (error: any) {
      console.error(`   ❌ Error calculating H2H for ${pairKey}:`, error.message);
    }
  }

  await logger.success(totalCalculated);
  return totalCalculated;
}
