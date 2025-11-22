import express from 'express';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { syncEvents } from './jobs/sync-events';
import { syncEventParticipants } from './jobs/sync-participants';
import { syncMatches } from './jobs/sync-matches';
import { syncNews } from './jobs/sync-news';
import { calculateTeamStats } from './jobs/calculate-team-stats';
import { calculateHeadToHead } from './jobs/calculate-head-to-head';
import { fixEventStatus } from './jobs/fix-event-status';
import { generateHourlyReport } from './jobs/hourly-report';

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
    await syncEvents();
    res.json({ success: true, message: 'Events synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/sync-participants', async (req, res) => {
  try {
    await syncEventParticipants();
    res.json({ success: true, message: 'Participants synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/sync-matches', async (req, res) => {
  try {
    await syncMatches();
    res.json({ success: true, message: 'Matches synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/sync-news', async (req, res) => {
  try {
    await syncNews();
    res.json({ success: true, message: 'News synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/calculate-stats', async (req, res) => {
  try {
    await calculateTeamStats();
    res.json({ success: true, message: 'Stats calculated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/calculate-h2h', async (req, res) => {
  try {
    await calculateHeadToHead();
    res.json({ success: true, message: 'Head-to-head calculated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/trigger/fix-status', async (req, res) => {
  try {
    await fixEventStatus();
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

// Schedule cron jobs
console.log('🕐 Scheduling cron jobs...\n');

// Daily at midnight - Sync events
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running sync-events cron...');
  await syncEvents();
}, {
  timezone: 'UTC'
});

// Daily at 00:30 - Sync event participants
cron.schedule('30 0 * * *', async () => {
  console.log('⏰ Running sync-event-participants cron...');
  await syncEventParticipants();
}, {
  timezone: 'UTC'
});

// Every 6 hours - Sync matches
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running sync-matches cron...');
  await syncMatches();
}, {
  timezone: 'UTC'
});

// Daily at 02:00 - Calculate team stats
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Running calculate-team-stats cron...');
  await calculateTeamStats();
}, {
  timezone: 'UTC'
});

// Daily at 03:00 - Calculate head-to-head
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ Running calculate-head-to-head cron...');
  await calculateHeadToHead();
}, {
  timezone: 'UTC'
});

// Every 6 hours - Sync news
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running sync-news cron...');
  await syncNews();
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
  await fixEventStatus();
}, {
  timezone: 'UTC'
});

app.listen(PORT, () => {
  console.log(`✅ Cron service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}`);
  console.log(`🔧 Manual triggers available at POST /trigger/*`);
});
