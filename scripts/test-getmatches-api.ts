import HLTV from 'hltv';

async function testGetMatches() {
  try {
    console.log('Testing getMatches() without filters...\n');

    // No filters
    const matches = await HLTV.getMatches();

    console.log(`Total matches: ${matches.length}`);

    if (matches.length > 0) {
      console.log('\n--- First 3 matches ---');
      matches.slice(0, 3).forEach(m => {
        console.log(`\nMatch ID: ${m.id}`);
        console.log(`  Teams: ${m.team1?.name} vs ${m.team2?.name}`);
        console.log(`  Event: ${m.event?.name}`);
        console.log(`  Date: ${m.date ? new Date(m.date).toISOString() : 'N/A'}`);
        console.log(`  Live: ${m.live}`);
        console.log(`  Stars: ${m.stars}`);
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testGetMatches();
