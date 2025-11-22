import { db } from '../../db/client';
import { syncLogs, events, teams, matches, news } from '../../db/schema';
import { desc, gte, eq, sql } from 'drizzle-orm';
import { getDiscordWebhook } from '../../services/discord/webhook';

export async function generateHourlyReport() {
  console.log('📊 Generating hourly report...\n');

  const discord = getDiscordWebhook();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    // Get sync logs from last hour
    const recentLogs = await db
      .select()
      .from(syncLogs)
      .where(gte(syncLogs.startedAt, oneHourAgo))
      .orderBy(desc(syncLogs.startedAt));

    // Get current database stats
    const [eventsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events);

    const [teamsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teams);

    const [matchesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches);

    const [newsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(news);

    const [ongoingEvents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(eq(events.status, 'ongoing'));

    const [championshipEvents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(eq(events.championshipMode, true));

    const [liveMatches] = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(eq(matches.status, 'live'));

    // Categorize syncs
    const successfulSyncs = recentLogs.filter(l => l.status === 'success');
    const failedSyncs = recentLogs.filter(l => l.status === 'failed');
    const totalItemsSynced = successfulSyncs.reduce((sum, log) => sum + (log.itemsSynced || 0), 0);

    // Build report message
    const fields = [
      {
        name: '📊 Database Stats',
        value: [
          `Events: ${eventsCount.count}`,
          `Teams: ${teamsCount.count}`,
          `Matches: ${matchesCount.count}`,
          `News: ${newsCount.count}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🎮 Active Events',
        value: [
          `Ongoing: ${ongoingEvents.count}`,
          `Championship Mode: ${championshipEvents.count}`,
          `Live Matches: ${liveMatches.count}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🔄 Syncs (Last Hour)',
        value: [
          `Total: ${recentLogs.length}`,
          `✅ Success: ${successfulSyncs.length}`,
          `❌ Failed: ${failedSyncs.length}`,
          `📦 Items Synced: ${totalItemsSynced}`,
        ].join('\n'),
        inline: false,
      },
    ];

    // Add recent sync details
    if (successfulSyncs.length > 0) {
      const syncDetails = successfulSyncs
        .slice(0, 5)
        .map(log => {
          const duration = log.completedAt && log.startedAt
            ? Math.round((log.completedAt.getTime() - log.startedAt.getTime()) / 1000)
            : 0;
          return `✅ ${log.jobName}: ${log.itemsSynced || 0} items (${duration}s)`;
        })
        .join('\n');

      fields.push({
        name: '📋 Recent Syncs',
        value: syncDetails || 'No syncs in the last hour',
        inline: false,
      });
    }

    // Add failed syncs if any
    if (failedSyncs.length > 0) {
      const failedDetails = failedSyncs
        .slice(0, 3)
        .map(log => {
          const errorMsg = typeof log.errors === 'object' && log.errors !== null
            ? (log.errors as any).message || 'Unknown error'
            : String(log.errors);
          return `❌ ${log.jobName}: ${errorMsg.substring(0, 100)}`;
        })
        .join('\n');

      fields.push({
        name: '⚠️ Failed Syncs',
        value: failedDetails,
        inline: false,
      });
    }

    // Determine report color and title
    const hasErrors = failedSyncs.length > 0;
    const color = hasErrors ? 0xffa500 : 0x00ff00; // Orange if errors, green otherwise
    const emoji = hasErrors ? '⚠️' : '✅';

    // Send to Discord
    await discord.send({
      embeds: [{
        title: `${emoji} Hourly Report - HLTV Data Pipeline`,
        description: `Report generated at ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`,
        color,
        fields,
        footer: {
          text: 'Next report in 1 hour',
        },
        timestamp: new Date().toISOString(),
      }],
    });

    console.log('✅ Hourly report sent to Discord');

    // If there are errors, send separate alert
    if (failedSyncs.length > 0) {
      await discord.sendError(
        'Sync Failures Detected',
        `${failedSyncs.length} sync job(s) failed in the last hour`,
        failedSyncs.map(l => `${l.jobName}: ${l.errors}`).join('\n')
      );
    }

    return {
      success: true,
      stats: {
        totalLogs: recentLogs.length,
        successfulSyncs: successfulSyncs.length,
        failedSyncs: failedSyncs.length,
        totalItemsSynced,
      },
    };
  } catch (error: any) {
    console.error('❌ Error generating hourly report:', error);

    // Send error notification to Discord
    await discord.sendError(
      'Hourly Report Failed',
      'Failed to generate hourly report',
      error.message
    );

    throw error;
  }
}
