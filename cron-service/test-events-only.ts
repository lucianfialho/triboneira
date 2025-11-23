import { HLTVPlaywrightScraper } from '../lib/services/hltv/playwright-scraper';

async function testEventsOnly() {
  console.log('🚀 Testing ONLY getEvents()\n');

  const scraper = new HLTVPlaywrightScraper();

  try {
    const events = await scraper.scrapeEvents();
    console.log(`\n✅ Found ${events.length} events`);

    if (events.length > 0) {
      console.log('\n📋 First 5 events:');
      events.slice(0, 5).forEach((event, i) => {
        const date = new Date(event.dateStart);
        console.log(`   ${i + 1}. ${event.name} (ID: ${event.id})`);
        console.log(`      Date: ${date.toLocaleDateString()}`);
      });
    } else {
      console.log('\n❌ No events found!');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await scraper.close();
  }
}

testEventsOnly();
