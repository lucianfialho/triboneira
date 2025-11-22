import HLTV from 'hltv';

async function testGetTeamDetails() {
  try {
    // Test with ENCE (ID: 4869)
    const team = await HLTV.getTeam({ id: 4869 });

    console.log('Team:', team.name);
    console.log('Logo:', team.logo || 'NULL');
    console.log('Rank:', team.rank || 'NULL');
    console.log('Location:', team.location);
    console.log('Twitter:', team.twitter || 'NULL');
    console.log('Facebook:', team.facebook || 'NULL');
    console.log('\nFull object:');
    console.log(JSON.stringify(team, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testGetTeamDetails();
