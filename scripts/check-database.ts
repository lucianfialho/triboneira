import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { games, events, teams, eventParticipants, news, syncLogs } from '../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n');

  // 1. Games
  const allGames = await db.select().from(games);
  console.log(`📊 GAMES: ${allGames.length}`);
  allGames.forEach(g => console.log(`   - ${g.name} (${g.slug})`));
  console.log('');

  // 2. Events
  const allEvents = await db.select().from(events);
  const ongoingEvents = allEvents.filter(e => e.status === 'ongoing');
  const upcomingEvents = allEvents.filter(e => e.status === 'upcoming');
  const finishedEvents = allEvents.filter(e => e.status === 'finished');
  const championshipEvents = allEvents.filter(e => e.championshipMode);

  console.log(`📅 EVENTS: ${allEvents.length} total`);
  console.log(`   - Ongoing: ${ongoingEvents.length}`);
  console.log(`   - Upcoming: ${upcomingEvents.length}`);
  console.log(`   - Finished: ${finishedEvents.length}`);
  console.log(`   - Championship Mode: ${championshipEvents.length}`);

  if (championshipEvents.length > 0) {
    console.log('\n   🔴 CHAMPIONSHIP MODE EVENTS:');
    championshipEvents.forEach(e => {
      console.log(`      - ${e.name} (${e.status})`);
    });
  }
  console.log('');

  // 3. Teams
  const allTeams = await db.select().from(teams);
  console.log(`⚽ TEAMS: ${allTeams.length}`);
  const topTeams = allTeams
    .filter(t => t.rank !== null)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
    .slice(0, 10);

  console.log('   Top 10 teams:');
  topTeams.forEach(t => console.log(`      ${t.rank}. ${t.name} (${t.country || 'N/A'})`));
  console.log('');

  // 4. Event Participants
  const allParticipants = await db.select().from(eventParticipants);
  console.log(`👥 EVENT PARTICIPANTS: ${allParticipants.length}`);
  console.log('');

  // 5. News
  const allNews = await db.select().from(news).orderBy(desc(news.publishedAt)).limit(5);
  console.log(`📰 NEWS: Latest 5`);
  allNews.forEach(n => {
    const date = n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : 'N/A';
    console.log(`   - [${date}] ${n.title}`);
  });
  console.log('');

  // 6. Sync Logs
  const recentLogs = await db.select().from(syncLogs).orderBy(desc(syncLogs.startedAt)).limit(10);
  console.log(`📊 SYNC LOGS: Last 10`);
  recentLogs.forEach(log => {
    const status = log.status === 'success' ? '✅' : log.status === 'failed' ? '❌' : '⏳';
    const duration = log.completedAt && log.startedAt
      ? `(${Math.round((log.completedAt.getTime() - log.startedAt.getTime()) / 1000)}s)`
      : '(running)';
    console.log(`   ${status} ${log.jobName} - ${log.itemsSynced || 0} items ${duration}`);
  });
  console.log('');

  console.log('✅ Database check complete!\n');
}

checkDatabase().catch(console.error);
