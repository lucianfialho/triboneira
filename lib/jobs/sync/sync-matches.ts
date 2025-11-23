import { db } from '../../db/client';
import { events, matches, teams } from '../../db/schema';
import { eq, or, and } from 'drizzle-orm';
import { playwrightScraper } from '../../services/hltv/playwright-scraper';
import { SyncLogger } from '../utils/logger';

export async function syncMatches(logger: SyncLogger, championshipMode: boolean = false, eventId?: number) {
  console.log(`🏆 Syncing matches from HLTV${eventId ? ` (Event ID: ${eventId})` : championshipMode ? ' (CHAMPIONSHIP MODE)' : ''}...\n`);

  // Get events based on mode
  let relevantEvents;

  if (eventId) {
    // Specific event mode: sync only this event
    relevantEvents = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (relevantEvents.length === 0) {
      console.log(`⚠️  Event with ID ${eventId} not found`);
      await logger.success(0);
      return 0;
    }
  } else {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    if (championshipMode) {
      // Championship mode: only events with championship_mode = true
      relevantEvents = await db
        .select()
        .from(events)
        .where(eq(events.championshipMode, true));
    } else {
      // Normal mode: ongoing and upcoming events from current year and next year only
      const allEvents = await db
        .select()
        .from(events)
        .where(
          or(
            eq(events.status, 'ongoing'),
            eq(events.status, 'upcoming')
          )
        );

      // Filter by year to avoid events too far in the future
      relevantEvents = allEvents.filter(event => {
        if (!event.dateStart) return true; // Include if no date
        const eventYear = new Date(event.dateStart).getFullYear();
        return eventYear <= nextYear;
      });
    }
  }

  if (relevantEvents.length === 0) {
    console.log(`⚠️  No events found for ${championshipMode ? 'championship' : 'normal'} mode`);
    await logger.success(0);
    return 0;
  }

  console.log(`📊 Scraping matches for ${relevantEvents.length} events...\n`);

  let totalMatchesSynced = 0;
  let totalMatchesFound = 0;

  // Process each event sequentially (Playwright scraper needs to navigate pages)
  for (const event of relevantEvents) {
    try {
      console.log(`\n🎮 Event: ${event.name} (ID: ${event.externalId})`);

      const eventMatches = await playwrightScraper.scrapeEventMatches(parseInt(event.externalId));
      totalMatchesFound += eventMatches.length;

      console.log(`   Found ${eventMatches.length} matches`);

      for (const scrapedMatch of eventMatches) {
        try {
          // Handle team1
          let team1Id: number | null = null;
          if (scrapedMatch.team1.name !== 'TBD') {
            // Try to find team by name (we don't have externalId from scraper yet)
            let [team1] = await db
              .select()
              .from(teams)
              .where(
                and(
                  eq(teams.name, scrapedMatch.team1.name),
                  eq(teams.source, 'hltv')
                )
              );

            // If team exists, use it
            if (team1) {
              team1Id = team1.id;
            }
            // Note: We don't create teams here because we don't have externalId
            // Teams should be created by sync-participants job
          }

          // Handle team2
          let team2Id: number | null = null;
          if (scrapedMatch.team2.name !== 'TBD') {
            let [team2] = await db
              .select()
              .from(teams)
              .where(
                and(
                  eq(teams.name, scrapedMatch.team2.name),
                  eq(teams.source, 'hltv')
                )
              );

            if (team2) {
              team2Id = team2.id;
            }
          }

          // Upsert match (supports TBD teams with null IDs)
          await db
            .insert(matches)
            .values({
              eventId: event.id,
              externalId: scrapedMatch.id.toString(),
              source: 'hltv',
              team1Id,
              team2Id,
              date: scrapedMatch.date || null,
              format: scrapedMatch.format || null,
              status: 'scheduled',
              winnerId: null,
              scoreTeam1: null,
              scoreTeam2: null,
              maps: null,
              metadata: {
                team1Name: scrapedMatch.team1.name,
                team2Name: scrapedMatch.team2.name,
                event: scrapedMatch.event,
              },
            })
            .onConflictDoUpdate({
              target: [matches.externalId, matches.source],
              set: {
                team1Id, // Update team IDs if they changed from TBD to actual teams
                team2Id,
                date: scrapedMatch.date || null,
                format: scrapedMatch.format || null,
                updatedAt: new Date(),
              },
            });

          totalMatchesSynced++;

        } catch (error: any) {
          console.error(`   ❌ Error processing match ${scrapedMatch.id}:`, error.message);
        }
      }

    } catch (error: any) {
      console.error(`❌ Error scraping event ${event.externalId}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total matches found: ${totalMatchesFound}`);
  console.log(`   Matches synced: ${totalMatchesSynced}`);

  await logger.success(totalMatchesSynced);
  return totalMatchesSynced;
}
