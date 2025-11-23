import express from 'express';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { syncEvents } from './jobs/sync/sync-events';
import { syncEventParticipants } from './jobs/sync/sync-event-participants';
import { syncMatches } from './jobs/sync/sync-matches';
import { syncNews } from './jobs/sync/sync-news';
import { syncSwissData } from './jobs/sync/sync-swiss-data';
import { calculateTeamStats } from './jobs/calculate/calculate-team-stats';
import { calculateHeadToHead } from './jobs/calculate/calculate-head-to-head';
import { fixEventStatus } from './jobs/maintenance/fix-event-status';
import { generateHourlyReport } from './jobs/reports/hourly-report';
import { SyncLogger } from './jobs/utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'multistream-cron-service',
    uptime: process.uptime()
  });
});

// Manual trigger endpoints (for testing)
app.post('/trigger/sync-events', async (req, res) => {
  try {
    const logger = new SyncLogger();
    await logger.start('sync-events');
    await syncEvents(logger);
    res.json({ success: true, message: 'Events synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/sync-participants', async (req, res) => {
  try {
    const logger = new SyncLogger();
    await logger.start('sync-participants');
    await syncEventParticipants(logger);
    res.json({ success: true, message: 'Participants synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/sync-matches', async (req, res) => {
  try {
    const championshipMode = req.query.championship === 'true' || req.body.championship === true;
    const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : req.body.eventId;

    const logger = new SyncLogger();
    await logger.start('sync-matches');

    const matchesSynced = await syncMatches(logger, championshipMode, eventId);

    // Close Playwright browser to free resources
    const { closePlaywrightScraper } = await import('./services/hltv/playwright-scraper');
    await closePlaywrightScraper();

    res.json({
      success: true,
      message: 'Matches synced successfully',
      matchesSynced,
      championshipMode,
      eventId: eventId || null
    });
  } catch (error: any) {
    // Ensure browser is closed even on error
    try {
      const { closePlaywrightScraper } = await import('./services/hltv/playwright-scraper');
      await closePlaywrightScraper();
    } catch {}

    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/clean-matches', async (req, res) => {
  try {
    const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : req.body.eventId;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'eventId is required' });
    }

    const { db } = await import('../../lib/db/client');
    const { matches } = await import('../../lib/db/schema');
    const { eq } = await import('drizzle-orm');

    console.log(`🗑️  Limpando matches do evento ${eventId}...`);

    const deleted = await db
      .delete(matches)
      .where(eq(matches.eventId, eventId));

    console.log(`✅ Matches deletados com sucesso!`);

    res.json({
      success: true,
      message: `Matches deleted for event ${eventId}`,
      eventId
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/sync-news', async (req, res) => {
  try {
    const logger = new SyncLogger();
    await logger.start('sync-news');
    await syncNews(logger);
    res.json({ success: true, message: 'News synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/calculate-stats', async (req, res) => {
  try {
    const logger = new SyncLogger();
    await logger.start('calculate-stats');
    await calculateTeamStats(logger);
    res.json({ success: true, message: 'Stats calculated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/calculate-h2h', async (req, res) => {
  try {
    const logger = new SyncLogger();
    await logger.start('calculate-h2h');
    await calculateHeadToHead(logger);
    res.json({ success: true, message: 'Head-to-head calculated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/fix-status', async (req, res) => {
  try {
    const logger = new SyncLogger();
    await logger.start('fix-status');
    await fixEventStatus(logger);
    res.json({ success: true, message: 'Event status fixed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/hourly-report', async (req, res) => {
  try {
    await generateHourlyReport();
    res.json({ success: true, message: 'Report generated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/sync-swiss', async (req, res) => {
  try {
    const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : req.body.eventId;

    const logger = new SyncLogger();
    await logger.start('sync-swiss');

    await syncSwissData(logger, eventId);

    // Close Playwright browser to free resources
    const { closePlaywrightScraper } = await import('./services/hltv/playwright-scraper');
    await closePlaywrightScraper();

    res.json({
      success: true,
      message: 'Swiss data synced successfully',
      eventId: eventId || null
    });
  } catch (error: any) {
    // Ensure browser is closed even on error
    try {
      const { closePlaywrightScraper } = await import('./services/hltv/playwright-scraper');
      await closePlaywrightScraper();
    } catch {}

    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule cron jobs
console.log('🕐 Scheduling cron jobs...\n');

// Daily at midnight - Sync events
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running sync-events cron...');
  const logger = new SyncLogger();
  await logger.start('sync-events');
  await syncEvents(logger);
}, {
  timezone: 'UTC'
});

// Daily at 00:30 - Sync event participants
cron.schedule('30 0 * * *', async () => {
  console.log('⏰ Running sync-event-participants cron...');
  const logger = new SyncLogger();
  await logger.start('sync-event-participants');
  await syncEventParticipants(logger);
}, {
  timezone: 'UTC'
});

// Every 6 hours - Sync matches
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running sync-matches cron...');
  try {
    const logger = new SyncLogger();
    await logger.start('sync-matches');
    await syncMatches(logger, false); // Normal mode (ongoing/upcoming)
  } catch (error) {
    console.error('❌ Sync matches cron failed:', error);
  } finally {
    // Always close Playwright browser to free resources
    try {
      const { closePlaywrightScraper } = await import('./services/hltv/playwright-scraper');
      await closePlaywrightScraper();
    } catch {}
  }
}, {
  timezone: 'UTC'
});

// Every 10 minutes - Sync championship event matches + Swiss data
cron.schedule('*/10 * * * *', async () => {
  const championshipEventId = process.env.CHAMPIONSHIP_EVENT_ID
    ? parseInt(process.env.CHAMPIONSHIP_EVENT_ID)
    : null;

  if (!championshipEventId) {
    console.log('⚠️  CHAMPIONSHIP_EVENT_ID not configured, skipping championship sync');
    return;
  }

  console.log(`⏰ Running sync-championship-matches cron (Event ID: ${championshipEventId})...`);
  try {
    const logger = new SyncLogger();

    // Sync matches
    await logger.start('sync-championship-matches');
    await syncMatches(logger, false, championshipEventId);

    // Sync Swiss bracket data
    await logger.start('sync-championship-swiss');
    await syncSwissData(logger, championshipEventId);
  } catch (error) {
    console.error('❌ Sync championship data cron failed:', error);
  } finally {
    // Always close Playwright browser to free resources
    try {
      const { closePlaywrightScraper } = await import('./services/hltv/playwright-scraper');
      await closePlaywrightScraper();
    } catch {}
  }
}, {
  timezone: 'UTC'
});

// Daily at 02:00 - Calculate team stats
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Running calculate-team-stats cron...');
  const logger = new SyncLogger();
  await logger.start('calculate-team-stats');
  await calculateTeamStats(logger);
}, {
  timezone: 'UTC'
});

// Daily at 03:00 - Calculate head-to-head
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ Running calculate-head-to-head cron...');
  const logger = new SyncLogger();
  await logger.start('calculate-head-to-head');
  await calculateHeadToHead(logger);
}, {
  timezone: 'UTC'
});

// Every 6 hours - Sync news
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running sync-news cron...');
  const logger = new SyncLogger();
  await logger.start('sync-news');
  await syncNews(logger);
}, {
  timezone: 'UTC'
});

// Every hour - Generate report
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running hourly-report cron...');
  await generateHourlyReport();
}, {
  timezone: 'UTC'
});

// Every 6 hours - Fix event status
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running fix-event-status cron...');
  const logger = new SyncLogger();
  await logger.start('fix-event-status');
  await fixEventStatus(logger);
}, {
  timezone: 'UTC'
});

app.listen(PORT, () => {
  console.log(`✅ Cron service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}`);
  console.log(`🔧 Manual triggers available at POST /trigger/*`);
});
