import HLTV from 'hltv';

async function testGetMatchesStats() {
  try {
    console.log('Testing getMatchesStats()...\n');

    // Try without filters first
    const matches = await HLTV.getMatchesStats();

    console.log(`Total matches: ${matches.length}`);

    if (matches.length > 0) {
      console.log('\n--- First 3 matches ---');
      matches.slice(0, 3).forEach((m: any) => {
        console.log(`\nMatch ID: ${m.id}`);
        console.log(`  Team1: ${m.team1?.name}`);
        console.log(`  Team2: ${m.team2?.name}`);
        console.log(`  Event: ${m.event?.name}`);
        console.log(`  Date: ${m.date ? new Date(m.date).toISOString() : 'N/A'}`);
        console.log(`  Result: ${m.result?.team1} - ${m.result?.team2}`);
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGetMatchesStats();
