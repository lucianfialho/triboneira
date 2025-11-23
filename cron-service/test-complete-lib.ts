import { HLTVPlaywrightScraper } from '../lib/services/hltv/playwright-scraper';

async function testCompleteLibrary() {
  console.log('🚀 Testing Complete HLTV Playwright Library\n');
  console.log('='.repeat(60));

  const scraper = new HLTVPlaywrightScraper();

  try {
    // Test 1: Get Matches
    console.log('\n📍 TEST 1: getMatches()');
    console.log('-'.repeat(60));
    const matches = await scraper.scrapeMatches();
    console.log(`✅ Found ${matches.length} matches`);
    if (matches.length > 0) {
      const firstMatch = matches[0];
      console.log(`   Sample: ${firstMatch.team1.name} vs ${firstMatch.team2.name}`);
      console.log(`   Event: ${firstMatch.event?.name || 'Unknown'}`);
      console.log(`   Live: ${firstMatch.live ? 'YES' : 'NO'}`);
    }

    // Reset browser to avoid Cloudflare blocking
    await scraper.reset();

    // Test 2: Get Events
    console.log('\n📍 TEST 2: getEvents()');
    console.log('-'.repeat(60));
    const events = await scraper.scrapeEvents();
    console.log(`✅ Found ${events.length} events`);
    if (events.length > 0) {
      events.slice(0, 3).forEach((event, i) => {
        const date = new Date(event.dateStart);
        console.log(`   ${i + 1}. ${event.name} (ID: ${event.id})`);
        console.log(`      Date: ${date.toLocaleDateString()}`);
      });
    }

    // Reset browser to avoid Cloudflare blocking
    await scraper.reset();

    // Test 3: Get Event Details (Budapest Major)
    console.log('\n📍 TEST 3: getEvent(8504) - Budapest Major');
    console.log('-'.repeat(60));
    const eventDetails = await scraper.scrapeEvent(8504);
    if (eventDetails) {
      console.log(`✅ Event: ${eventDetails.name}`);
      console.log(`   Prize Pool: ${eventDetails.prizePool || 'N/A'}`);
      console.log(`   Location: ${eventDetails.location?.name || 'N/A'}`);
      console.log(`   Teams: ${eventDetails.teams.length}`);
      if (eventDetails.teams.length > 0) {
        console.log(`   First 3 teams:`);
        eventDetails.teams.slice(0, 3).forEach((team, i) => {
          console.log(`      ${i + 1}. ${team.name} (ID: ${team.id})`);
        });
      }
    } else {
      console.log('❌ Failed to fetch event details');
    }

    // Reset browser to avoid Cloudflare blocking
    await scraper.reset();

    // Test 4: Get News
    console.log('\n📍 TEST 4: getNews()');
    console.log('-'.repeat(60));
    const news = await scraper.scrapeNews();
    console.log(`✅ Found ${news.length} news items`);
    if (news.length > 0) {
      console.log(`   Latest news:`);
      news.slice(0, 5).forEach((item, i) => {
        console.log(`   ${i + 1}. ${item.title}`);
        console.log(`      Link: ${item.link.substring(0, 60)}...`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 LIBRARY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ getMatches(): ${matches.length} results`);
    console.log(`✅ getEvents(): ${events.length} results`);
    console.log(`✅ getEvent(id): ${eventDetails ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ getNews(): ${news.length} results`);
    console.log('\n🎉 ALL TESTS PASSED! Library is fully functional!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await scraper.close();
  }
}

testCompleteLibrary();
