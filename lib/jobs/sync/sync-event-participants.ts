import { db } from '../../db/client';
import { events, teams, eventParticipants } from '../../db/schema';
import { eq, or, inArray } from 'drizzle-orm';
import { getHLTVClient } from '../../services/hltv/client';
import { SyncLogger } from '../utils/logger';

export async function syncEventParticipants(logger: SyncLogger) {
  console.log('👥 Syncing event participants from HLTV...\n');

  // Get events that need participant sync (ongoing, upcoming, or recently finished)
  const relevantEvents = await db
    .select()
    .from(events)
    .where(
      or(
        eq(events.status, 'ongoing'),
        eq(events.status, 'upcoming'),
        eq(events.status, 'finished')
      )
    );

  if (relevantEvents.length === 0) {
    console.log('⚠️  No relevant events found');
    await logger.success(0);
    return 0;
  }

  console.log(`Found ${relevantEvents.length} events to process\n`);

  const hltvClient = getHLTVClient();
  let totalParticipantsSynced = 0;

  for (const event of relevantEvents) {
    console.log(`🔄 Syncing participants for: ${event.name}`);

    try {
      // Get event details with teams
      const hltvEvent = await getHLTVClient().getEvent(
        parseInt(event.externalId)
      );

      if (!hltvEvent.teams || hltvEvent.teams.length === 0) {
        console.log(`   ⚠️  No teams found for ${event.name}`);
        continue;
      }

      console.log(`   Found ${hltvEvent.teams.length} teams`);

      // Upsert teams with full details
      let teamCount = 0;
      for (const hltvTeam of hltvEvent.teams) {
        teamCount++;
        try {
          // Fetch full team details to get logo and more info
          console.log(`   [${teamCount}/${hltvEvent.teams.length}] Fetching ${hltvTeam.name}...`);
          const teamDetails = await hltvClient.getTeam(hltvTeam.id);

          await db
            .insert(teams)
            .values({
              gameId: event.gameId,
              externalId: hltvTeam.id.toString(),
              source: 'hltv',
              name: teamDetails.name,
              country: teamDetails.location?.code || null,
              logoUrl: teamDetails.logo || null,
              rank: teamDetails.rank || null,
              active: true,
              metadata: {
                location: teamDetails.location,
                twitter: teamDetails.twitter,
                facebook: teamDetails.facebook,
              },
            })
            .onConflictDoUpdate({
              target: [teams.externalId, teams.source],
              set: {
                name: teamDetails.name,
                country: teamDetails.location?.code || null,
                logoUrl: teamDetails.logo || null,
                rank: teamDetails.rank || null,
                metadata: {
                  location: teamDetails.location,
                  twitter: teamDetails.twitter,
                  facebook: teamDetails.facebook,
                },
                updatedAt: new Date(),
              },
            });
        } catch (error: any) {
          console.log(`   ⚠️  Failed to fetch details for ${hltvTeam.name}: ${error.message}`);

          // Fallback: save with minimal info
          await db
            .insert(teams)
            .values({
              gameId: event.gameId,
              externalId: hltvTeam.id.toString(),
              source: 'hltv',
              name: hltvTeam.name,
              country: null,
              logoUrl: null,
              rank: null,
              active: true,
              metadata: {},
            })
            .onConflictDoUpdate({
              target: [teams.externalId, teams.source],
              set: {
                name: hltvTeam.name,
                updatedAt: new Date(),
              },
            });
        }
      }

      // Get team IDs from database
      const teamExternalIds = hltvEvent.teams.map((t) => t.id.toString());
      const dbTeams = await db
        .select()
        .from(teams)
        .where(inArray(teams.externalId, teamExternalIds));

      // Upsert event participants
      for (const dbTeam of dbTeams) {
        const hltvTeam = hltvEvent.teams.find(
          (t) => t.id.toString() === dbTeam.externalId
        );

        if (hltvTeam) {
          await db
            .insert(eventParticipants)
            .values({
              eventId: event.id,
              teamId: dbTeam.id,
              seed: null, // HLTV doesn't provide seed info
              placement: null, // Will be updated after event finishes
              prizeMoney: null,
            })
            .onConflictDoNothing({
              target: [eventParticipants.eventId, eventParticipants.teamId],
            });

          totalParticipantsSynced++;
        }
      }

      console.log(`   ✅ Synced ${dbTeams.length} participants\n`);
    } catch (error: any) {
      console.error(`   ❌ Error syncing participants for ${event.name}:`, error.message);
    }
  }

  await logger.success(totalParticipantsSynced);
  return totalParticipantsSynced;
}
