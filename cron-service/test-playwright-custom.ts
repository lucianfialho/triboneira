import { HLTVPlaywrightScraper } from '../lib/services/hltv/playwright-scraper';

async function testCustomScraper() {
  console.log('🚀 Testing custom Playwright scraper...\n');

  const scraper = new HLTVPlaywrightScraper();

  try {
    const matches = await scraper.scrapeMatches();

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total matches: ${matches.length}`);

    const liveMatches = matches.filter(m => m.live);
    const upcomingMatches = matches.filter(m => !m.live);

    console.log(`   Live: ${liveMatches.length}`);
    console.log(`   Upcoming: ${upcomingMatches.length}`);

    if (matches.length > 0) {
      console.log(`\n🎯 First 3 matches:`);
      matches.slice(0, 3).forEach((match, i) => {
        console.log(`\n   ${i + 1}. ${match.team1.name} vs ${match.team2.name}`);
        console.log(`      ID: ${match.id}`);
        console.log(`      Event: ${match.event?.name || 'Unknown'}`);
        console.log(`      Format: ${match.format || 'Unknown'}`);
        console.log(`      Live: ${match.live ? 'YES' : 'NO'}`);
        if (match.date) {
          console.log(`      Date: ${match.date.toISOString()}`);
        }
      });
    }

    console.log(`\n✅ SUCCESS! Playwright scraper is working!\n`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await scraper.close();
  }
}

testCustomScraper();
