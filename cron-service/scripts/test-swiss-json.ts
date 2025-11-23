import { getPlaywrightScraper, closePlaywrightScraper } from '../src/services/hltv/playwright-scraper';

async function testSwissJSON() {
  try {
    const scraper = await getPlaywrightScraper();

    // Event ID do Budapest Major Stage 1
    const eventId = 8504;

    console.log(`🧪 Testing Swiss JSON extraction for event ${eventId}...\n`);

    const swissData = await scraper.scrapeSwissGroupData(eventId);

    if (!swissData) {
      console.log('❌ No Swiss data found!');
      return;
    }

    console.log('\n📊 Swiss Group Data Structure:\n');
    console.log(JSON.stringify(swissData, null, 2));

    console.log('\n\n🎯 Teams in Swiss:');
    if (swissData.slotIdToTeamInfo) {
      swissData.slotIdToTeamInfo.forEach((team: any, index: number) => {
        if (team.teamName) {
          console.log(`${index + 1}. ${team.teamName} (slot: ${team.eventGroupTeamSlotId})`);
        }
      });
    }

    console.log('\n\n📈 Structure Info:');
    console.log('Type:', swissData.structure?.type);

    console.log('\n\n🏆 Current Results:');
    console.log('3-0 teams:', swissData.structure?.groupResults?.threeZeros?.length || 0);
    console.log('0-3 teams:', swissData.structure?.groupResults?.zeroThrees?.length || 0);
    console.log('3-1/3-2 promotions:', swissData.structure?.groupResults?.threeOneOrThreeTwoPromotions?.length || 0);
    console.log('Not finished:', swissData.structure?.groupResults?.notFinished?.length || 0);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await closePlaywrightScraper();
  }
}

testSwissJSON();
