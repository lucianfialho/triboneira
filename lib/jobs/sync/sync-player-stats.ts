import { db } from '../../db/client';
import { matches, playerMatchStats, players, teams } from '../../db/schema';
import { eq, and, isNull, or, inArray } from 'drizzle-orm';
import { getHLTVClient } from '../../services/hltv/client';
import { SyncLogger } from '../utils/logger';

export async function syncPlayerMatchStats(logger: SyncLogger, matchId?: number) {
  console.log(`📊 Syncing player stats from HLTV${matchId ? ` (Match ID: ${matchId})` : ''}...\n`);

  const hltvClient = getHLTVClient();

  // Get finished matches without player stats
  let matchesToSync;

  if (matchId) {
    // Specific match mode
    matchesToSync = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));

    if (matchesToSync.length === 0) {
      console.log(`⚠️  Match with ID ${matchId} not found`);
      await logger.success(0);
      return 0;
    }
  } else {
    // Find finished matches from the last 7 days that don't have stats yet
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get finished matches
    const finishedMatches = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.status, 'finished'),
          eq(matches.source, 'hltv')
        )
      );

    // Filter to recent matches only
    const recentMatches = finishedMatches.filter(match => {
      if (!match.date) return false;
      return match.date >= sevenDaysAgo;
    });

    // Check which matches already have player stats
    const matchesWithStats = await db
      .select({ matchId: playerMatchStats.matchId })
      .from(playerMatchStats)
      .where(inArray(playerMatchStats.matchId, recentMatches.map(m => m.id)));

    const matchIdsWithStats = new Set(matchesWithStats.map(m => m.matchId));

    // Filter to matches without stats
    matchesToSync = recentMatches.filter(match => !matchIdsWithStats.has(match.id));
  }

  if (matchesToSync.length === 0) {
    console.log(`⚠️  No matches found to sync player stats`);
    await logger.success(0);
    return 0;
  }

  console.log(`📊 Found ${matchesToSync.length} matches to sync player stats\n`);

  let totalStatsAdded = 0;
  let matchesProcessed = 0;
  let matchesFailed = 0;

  for (const match of matchesToSync) {
    try {
      const matchExternalId = parseInt(match.externalId);
      console.log(`\n🎮 Processing match ${matchExternalId}...`);

      // Get match details with stats
      const matchDetails = await hltvClient.getMatchStats(matchExternalId);

      if (!matchDetails || !matchDetails.playerStats || matchDetails.playerStats.length === 0) {
        console.log(`   ⚠️  No player stats available for match ${matchExternalId}`);
        continue;
      }

      // Process each player's stats
      for (const playerStat of matchDetails.playerStats) {
        try {
          // Find or create player
          let [player] = await db
            .select()
            .from(players)
            .where(
              and(
                eq(players.externalId, playerStat.player.id.toString()),
                eq(players.source, 'hltv')
              )
            );

          if (!player) {
            // Create player if doesn't exist
            console.log(`   👤 Creating player ${playerStat.player.name} (${playerStat.player.id})`);

            [player] = await db
              .insert(players)
              .values({
                gameId: 1, // CS2 game ID
                externalId: playerStat.player.id.toString(),
                source: 'hltv',
                nickname: playerStat.player.name,
                realName: null,
                country: null,
                age: null,
                photoUrl: null,
                metadata: {},
              })
              .onConflictDoUpdate({
                target: [players.externalId, players.source],
                set: {
                  nickname: playerStat.player.name,
                  updatedAt: new Date(),
                },
              })
              .returning();
          }

          // Find player's team
          let teamId: number | null = null;

          // Try to find team by comparing with match teams
          if (match.team1Id || match.team2Id) {
            // Get team rosters to match player to team
            // For now, we'll try to infer from team name in stats if available
            // This is a simplified approach - could be enhanced with roster data
            teamId = match.team1Id; // Default to team1, ideally we'd check rosters
          }

          // Insert player match stats
          await db
            .insert(playerMatchStats)
            .values({
              matchId: match.id,
              playerId: player.id,
              teamId: teamId,
              kills: playerStat.kills || null,
              deaths: playerStat.deaths || null,
              assists: playerStat.assists || null,
              adr: playerStat.adr ? playerStat.adr.toString() : null,
              rating: playerStat.rating ? playerStat.rating.toString() : null,
              kast: playerStat.kast ? playerStat.kast.toString() : null,
              hsPercentage: playerStat.hsPercentage ? playerStat.hsPercentage.toString() : null,
              metadata: {
                killDeathsDiff: playerStat.killDeathsDiff,
                flashAssists: playerStat.flashAssists,
                firstKills: playerStat.firstKills,
                firstDeaths: playerStat.firstDeaths,
              },
            })
            .onConflictDoUpdate({
              target: [playerMatchStats.matchId, playerMatchStats.playerId],
              set: {
                kills: playerStat.kills || null,
                deaths: playerStat.deaths || null,
                assists: playerStat.assists || null,
                adr: playerStat.adr ? playerStat.adr.toString() : null,
                rating: playerStat.rating ? playerStat.rating.toString() : null,
                kast: playerStat.kast ? playerStat.kast.toString() : null,
                hsPercentage: playerStat.hsPercentage ? playerStat.hsPercentage.toString() : null,
              },
            });

          totalStatsAdded++;

        } catch (error: any) {
          console.error(`   ❌ Error processing player ${playerStat.player.name}:`, error.message);
        }
      }

      matchesProcessed++;
      console.log(`   ✅ Processed ${matchDetails.playerStats.length} player stats`);

      // Add delay between matches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      matchesFailed++;
      console.error(`❌ Error processing match ${match.externalId}:`, error.message);

      // If we hit rate limit or error, add longer delay
      if (error.message.includes('429') || error.message.includes('timeout')) {
        console.log('⏳ Rate limit detected, waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Matches attempted: ${matchesToSync.length}`);
  console.log(`   Matches processed: ${matchesProcessed}`);
  console.log(`   Matches failed: ${matchesFailed}`);
  console.log(`   Player stats added: ${totalStatsAdded}`);

  await logger.success(totalStatsAdded);
  return totalStatsAdded;
}
