import HLTV from 'hltv';

async function testTeamLogo() {
  try {
    // Test with a known event
    const event = await HLTV.getEvent({ id: 8841 }); // DraculaN Season 3

    console.log('Event:', event.name);
    console.log('Teams found:', event.teams?.length || 0);

    if (event.teams && event.teams.length > 0) {
      console.log('\n--- Sample teams ---');
      event.teams.slice(0, 5).forEach(team => {
        console.log(`\nTeam: ${team.name}`);
        console.log('  ID:', team.id);
        console.log('  Logo:', team.logo || 'NULL');
        console.log('  Rank:', team.rank || 'NULL');
        console.log('  Location:', team.location);
        console.log('  Full object:', JSON.stringify(team, null, 2));
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testTeamLogo();
