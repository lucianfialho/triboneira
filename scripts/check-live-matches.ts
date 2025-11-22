import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getHLTVClient } from '../lib/services/hltv/client';

async function checkLiveMatches() {
  console.log('🔍 Checking for live and upcoming matches on HLTV...\n');

  try {
    const hltvClient = getHLTVClient();

    // Get all matches (no filter)
    console.log('📡 Fetching matches from HLTV...');
    const matches = await hltvClient.getMatches();

    console.log(`\n📊 Found ${matches.length} total matches\n`);

    // Categorize matches
    const liveMatches = matches.filter(m => m.live);
    const upcomingMatches = matches.filter(m => !m.live && !m.result);
    const finishedMatches = matches.filter(m => m.result);

    console.log(`🔴 LIVE MATCHES: ${liveMatches.length}`);
    liveMatches.forEach(m => {
      console.log(`   - ${m.team1?.name} vs ${m.team2?.name} (${m.event?.name})`);
    });

    console.log(`\n📅 UPCOMING MATCHES: ${upcomingMatches.length} (showing first 10)`);
    upcomingMatches.slice(0, 10).forEach(m => {
      const date = m.date ? new Date(m.date).toLocaleString() : 'TBD';
      console.log(`   - ${m.team1?.name} vs ${m.team2?.name} (${m.event?.name}) - ${date}`);
    });

    console.log(`\n✅ FINISHED MATCHES: ${finishedMatches.length} (showing first 5)`);
    finishedMatches.slice(0, 5).forEach(m => {
      const score = m.result ? `${m.result.team1}-${m.result.team2}` : 'N/A';
      console.log(`   - ${m.team1?.name} ${score} ${m.team2?.name} (${m.event?.name})`);
    });

    // Check for Budapest Major
    const budapestMatches = matches.filter(m =>
      m.event?.name.toLowerCase().includes('budapest')
    );

    if (budapestMatches.length > 0) {
      console.log(`\n🏆 BUDAPEST MAJOR MATCHES: ${budapestMatches.length}`);
      budapestMatches.slice(0, 10).forEach(m => {
        const status = m.live ? '🔴 LIVE' : m.result ? '✅ Finished' : '📅 Upcoming';
        const date = m.date ? new Date(m.date).toLocaleDateString() : 'TBD';
        console.log(`   ${status} - ${m.team1?.name} vs ${m.team2?.name} (${date})`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkLiveMatches();
