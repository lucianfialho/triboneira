import { db } from '../../db/client';
import { events, matches, teams } from '../../db/schema';
import { eq, or, and, inArray } from 'drizzle-orm';
import { getHLTVClient } from '../../services/hltv/client';
import { SyncLogger } from '../utils/logger';

export async function syncMatches(logger: SyncLogger, championshipMode: boolean = false) {
  console.log(`🏆 Syncing matches from HLTV${championshipMode ? ' (CHAMPIONSHIP MODE)' : ''}...\n`);

  // Get events based on mode
  let relevantEvents;

  if (championshipMode) {
    // Championship mode: only events with championship_mode = true
    relevantEvents = await db
      .select()
      .from(events)
      .where(eq(events.championshipMode, true));
  } else {
    // Normal mode: ongoing and upcoming events
    relevantEvents = await db
      .select()
      .from(events)
      .where(
        or(
          eq(events.status, 'ongoing'),
          eq(events.status, 'upcoming')
        )
      );
  }

  if (relevantEvents.length === 0) {
    console.log(`⚠️  No events found for ${championshipMode ? 'championship' : 'normal'} mode`);
    await logger.success(0);
    return 0;
  }

  console.log(`Found ${relevantEvents.length} events to process\n`);

  const hltvClient = getHLTVClient(championshipMode);
  let totalMatchesSynced = 0;

  for (const event of relevantEvents) {
    console.log(`🔄 Syncing matches for: ${event.name}`);

    try {
      // Get matches for this event
      const hltvMatches = await hltvClient.getMatches({
        eventIds: [parseInt(event.externalId)],
      });

      if (hltvMatches.length === 0) {
        console.log(`   ℹ️  No matches found yet for ${event.name}`);
        continue;
      }

      console.log(`   Found ${hltvMatches.length} matches`);

      for (const hltvMatch of hltvMatches) {
        if (!hltvMatch.team1 || !hltvMatch.team2) {
          console.log(`   ⏭️  Skipping match ${hltvMatch.id} (missing teams)`);
          continue;
        }

        // Find or create teams
        const [team1] = await db
          .select()
          .from(teams)
          .where(
            and(
              eq(teams.externalId, hltvMatch.team1.id.toString()),
              eq(teams.source, 'hltv')
            )
          );

        const [team2] = await db
          .select()
          .from(teams)
          .where(
            and(
              eq(teams.externalId, hltvMatch.team2.id.toString()),
              eq(teams.source, 'hltv')
            )
          );

        if (!team1 || !team2) {
          console.log(`   ⏭️  Skipping match ${hltvMatch.id} (teams not in DB)`);
          continue;
        }

        // Determine match status
        let status: 'scheduled' | 'live' | 'finished' | 'cancelled' = 'scheduled';

        if (hltvMatch.live) {
          status = 'live';
        } else if (hltvMatch.result) {
          status = 'finished';
        }

        // Determine winner
        let winnerId: number | null = null;
        if (hltvMatch.result?.winnerId) {
          const winnerExternalId = hltvMatch.result.winnerId.toString();
          if (team1.externalId === winnerExternalId) {
            winnerId = team1.id;
          } else if (team2.externalId === winnerExternalId) {
            winnerId = team2.id;
          }
        }

        // Upsert match
        await db
          .insert(matches)
          .values({
            eventId: event.id,
            externalId: hltvMatch.id.toString(),
            source: 'hltv',
            team1Id: team1.id,
            team2Id: team2.id,
            date: hltvMatch.date ? new Date(hltvMatch.date) : null,
            format: hltvMatch.format || null,
            status,
            winnerId,
            scoreTeam1: hltvMatch.result?.team1 || null,
            scoreTeam2: hltvMatch.result?.team2 || null,
            maps: hltvMatch.stats ? { maps: [] } : null, // Will be populated by sync-match-stats
            metadata: {
              event: hltvMatch.event,
            },
          })
          .onConflictDoUpdate({
            target: [matches.externalId, matches.source],
            set: {
              date: hltvMatch.date ? new Date(hltvMatch.date) : null,
              format: hltvMatch.format || null,
              status,
              winnerId,
              scoreTeam1: hltvMatch.result?.team1 || null,
              scoreTeam2: hltvMatch.result?.team2 || null,
              updatedAt: new Date(),
            },
          });

        totalMatchesSynced++;

        if (status === 'live') {
          console.log(`   🔴 LIVE: ${team1.name} vs ${team2.name}`);
        }
      }

      console.log(`   ✅ Synced ${hltvMatches.length} matches\n`);
    } catch (error: any) {
      console.error(`   ❌ Error syncing matches for ${event.name}:`, error.message);
    }
  }

  await logger.success(totalMatchesSynced);
  return totalMatchesSynced;
}
