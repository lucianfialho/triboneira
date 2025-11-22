import { db } from '../../db/client';
import { games, events } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { getHLTVClient } from '../../services/hltv/client';
import { SyncLogger } from '../utils/logger';

export async function syncEvents(logger: SyncLogger) {
  console.log('📅 Syncing events from HLTV...\n');

  // Get active games
  const activeGames = await db
    .select()
    .from(games)
    .where(eq(games.active, true));

  if (activeGames.length === 0) {
    console.log('⚠️  No active games found');
    await logger.success(0);
    return 0;
  }

  const hltvClient = getHLTVClient();
  let totalSynced = 0;

  for (const game of activeGames) {
    if (game.slug !== 'cs2') {
      console.log(`⏭️  Skipping ${game.name} (not CS2)`);
      continue;
    }

    console.log(`🔄 Syncing events for ${game.name}...`);

    try {
      const hltvEvents = await hltvClient.getEvents();
      console.log(`   Found ${hltvEvents.length} events`);

      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Filter events: ongoing, upcoming, or recently finished (last 7 days)
      const relevantEvents = hltvEvents.filter((event) => {
        const eventStart = event.dateStart;
        const eventEnd = event.dateEnd || eventStart;

        // Ongoing
        if (now >= eventStart && now <= eventEnd) {
          return true;
        }

        // Upcoming (starts in the future)
        if (eventStart > now) {
          return true;
        }

        // Recently finished (ended in last 7 days)
        if (eventEnd >= sevenDaysAgo) {
          return true;
        }

        return false;
      });

      console.log(`   ${relevantEvents.length} relevant events to sync`);

      // Upsert events with full details
      let eventCount = 0;
      for (const hltvEventSummary of relevantEvents) {
        eventCount++;
        console.log(`   [${eventCount}/${relevantEvents.length}] Fetching ${hltvEventSummary.name}...`);

        try {
          // Fetch full event details to get prize pool, location, etc.
          const hltvEvent = await hltvClient.getEvent(hltvEventSummary.id);

          // Determine status based on dates
          const eventStart = hltvEvent.dateStart || hltvEventSummary.dateStart;
          const eventEnd = hltvEvent.dateEnd || hltvEventSummary.dateEnd || eventStart;
          let status: 'upcoming' | 'ongoing' | 'finished' = 'upcoming';

          if (now >= eventStart && now <= eventEnd) {
            status = 'ongoing';
          } else if (now > eventEnd) {
            status = 'finished';
          }

          // Determine if should enable championship mode
          const isMajor =
            hltvEvent.name.toLowerCase().includes('major') ||
            (hltvEvent.prizePool &&
              parseInt(hltvEvent.prizePool.replace(/\D/g, '')) >= 1000000);

          const championshipMode = status === 'ongoing' && isMajor;

        await db
          .insert(events)
          .values({
            gameId: game.id,
            externalId: hltvEvent.id.toString(),
            source: 'hltv',
            name: hltvEvent.name,
            dateStart: new Date(hltvEvent.dateStart),
            dateEnd: hltvEvent.dateEnd
              ? new Date(hltvEvent.dateEnd)
              : null,
            prizePool: hltvEvent.prizePool || null,
            location: hltvEvent.location?.name || null,
            status,
            championshipMode,
            metadata: {
              format: hltvEvent.format,
              numberOfTeams: hltvEvent.numberOfTeams,
              relatedEvents: hltvEvent.relatedEvents,
            },
          })
          .onConflictDoUpdate({
            target: [events.externalId, events.source],
            set: {
              name: hltvEvent.name,
              dateStart: new Date(hltvEvent.dateStart),
              dateEnd: hltvEvent.dateEnd
                ? new Date(hltvEvent.dateEnd)
                : null,
              prizePool: hltvEvent.prizePool || null,
              location: hltvEvent.location?.name || null,
              status,
              championshipMode,
              metadata: {
                format: hltvEvent.format,
                numberOfTeams: hltvEvent.numberOfTeams,
                relatedEvents: hltvEvent.relatedEvents,
              },
              updatedAt: new Date(),
            },
          });

          totalSynced++;

          if (championshipMode) {
            console.log(`   🔴 ${hltvEvent.name} - CHAMPIONSHIP MODE ENABLED`);
          }
        } catch (eventError: any) {
          console.log(`   ⚠️  Failed to fetch details for ${hltvEventSummary.name}: ${eventError.message}`);
          // Continue with next event
        }
      }

      console.log(`   ✅ Synced ${totalSynced} events for ${game.name}\n`);
    } catch (error: any) {
      console.error(`   ❌ Error syncing events for ${game.name}:`, error.message);
    }
  }

  await logger.success(totalSynced);
  return totalSynced;
}
