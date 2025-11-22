import HLTV from 'hltv';

async function testEndpoints() {
  try {
    console.log('Testing which endpoints work...\n');

    // 1. getEvents - JÁ SABEMOS QUE FUNCIONA
    console.log('1. getEvents()...');
    const events = await HLTV.getEvents();
    console.log(`   ✅ Works! Found ${events.length} events\n`);

    // 2. getEvent - JÁ SABEMOS QUE FUNCIONA  
    console.log('2. getEvent({ id: 8841 })...');
    const event = await HLTV.getEvent({ id: 8841 });
    console.log(`   ✅ Works! Event: ${event.name}\n`);

    // 3. getTeamRanking
    console.log('3. getTeamRanking()...');
    const ranking = await HLTV.getTeamRanking();
    console.log(`   ✅ Works! Found ${ranking.length} teams\n`);

    // 4. getNews
    console.log('4. getNews()...');
    const news = await HLTV.getNews();
    console.log(`   ✅ Works! Found ${news.length} news\n`);

    console.log('--- Summary ---');
    console.log('Working: getEvents, getEvent, getTeamRanking, getNews');
    console.log('Blocked: getMatches, getMatchesStats');
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testEndpoints();
