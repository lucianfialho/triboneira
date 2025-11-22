import { db } from '../../db/client';
import { teams, matches, teamStats, events } from '../../db/schema';
import { eq, and, or, gte, sql } from 'drizzle-orm';
import { SyncLogger } from '../utils/logger';

export async function calculateTeamStats(logger: SyncLogger, eventId?: number) {
  console.log(`📊 Calculating team stats${eventId ? ` for event ${eventId}` : ' (all-time)'}...\n`);

  // Get active teams
  const activeTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.active, true));

  if (activeTeams.length === 0) {
    console.log('⚠️  No active teams found');
    await logger.success(0);
    return 0;
  }

  console.log(`Found ${activeTeams.length} active teams to process\n`);

  let totalCalculated = 0;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (const team of activeTeams) {
    console.log(`🔄 Calculating stats for: ${team.name}`);

    try {
      // Build query conditions
      let matchConditions = or(
        eq(matches.team1Id, team.id),
        eq(matches.team2Id, team.id)
      );

      // Add event filter if specified
      if (eventId) {
        matchConditions = and(
          matchConditions,
          eq(matches.eventId, eventId)
        );
      } else {
        // For all-time stats, only consider last 30 days
        matchConditions = and(
          matchConditions,
          gte(matches.date, thirtyDaysAgo)
        );
      }

      // Get all matches for this team
      const teamMatches = await db
        .select()
        .from(matches)
        .where(and(
          matchConditions,
          eq(matches.status, 'finished')
        ));

      if (teamMatches.length === 0) {
        console.log(`   ℹ️  No finished matches found`);
        continue;
      }

      // Calculate stats
      let wins = 0;
      let losses = 0;
      let draws = 0;
      let mapsPlayed = 0;
      let mapsWon = 0;
      let roundsWon = 0;
      let roundsLost = 0;

      for (const match of teamMatches) {
        const isTeam1 = match.team1Id === team.id;
        const teamScore = isTeam1 ? match.scoreTeam1 : match.scoreTeam2;
        const opponentScore = isTeam1 ? match.scoreTeam2 : match.scoreTeam1;

        if (match.winnerId === team.id) {
          wins++;
        } else if (match.winnerId === null) {
          draws++;
        } else {
          losses++;
        }

        // Map and round stats
        if (teamScore !== null && opponentScore !== null) {
          mapsPlayed += (teamScore + opponentScore);
          mapsWon += teamScore;

          // Estimate rounds (assuming 16-14 average score per map)
          const avgRoundsPerMap = 30;
          roundsWon += teamScore * avgRoundsPerMap;
          roundsLost += opponentScore * avgRoundsPerMap;
        }
      }

      const matchesPlayed = wins + losses + draws;
      const winRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;
      const avgRoundDiff = mapsPlayed > 0
        ? (roundsWon - roundsLost) / mapsPlayed
        : 0;

      // Determine period
      const periodStart = eventId ? null : thirtyDaysAgo;
      const periodEnd = eventId ? null : new Date();

      // Upsert team stats
      await db
        .insert(teamStats)
        .values({
          teamId: team.id,
          eventId: eventId || null,
          periodStart,
          periodEnd,
          matchesPlayed,
          wins,
          losses,
          draws,
          winRate: winRate.toFixed(2),
          mapsPlayed,
          mapsWon,
          roundsWon,
          roundsLost,
          avgRoundDiff: avgRoundDiff.toFixed(2),
          metadata: {
            lastCalculated: new Date().toISOString(),
            matchIds: teamMatches.map(m => m.id),
          },
        })
        .onConflictDoUpdate({
          target: [teamStats.teamId, teamStats.eventId, teamStats.periodStart, teamStats.periodEnd],
          set: {
            matchesPlayed,
            wins,
            losses,
            draws,
            winRate: winRate.toFixed(2),
            mapsPlayed,
            mapsWon,
            roundsWon,
            roundsLost,
            avgRoundDiff: avgRoundDiff.toFixed(2),
            metadata: {
              lastCalculated: new Date().toISOString(),
              matchIds: teamMatches.map(m => m.id),
            },
          },
        });

      totalCalculated++;
      console.log(`   ✅ ${team.name}: ${matchesPlayed} matches, ${wins}W-${losses}L (${winRate.toFixed(1)}% WR)\n`);
    } catch (error: any) {
      console.error(`   ❌ Error calculating stats for ${team.name}:`, error.message);
    }
  }

  await logger.success(totalCalculated);
  return totalCalculated;
}
