import HLTV from 'hltv';

async function testGetEvent() {
  console.log('🔍 Testing HLTV.getEvent()...\n');

  // Budapest Major Stage 1 ID = 8504
  const eventId = 8504;

  try {
    console.log(`Fetching event ${eventId}...\n`);
    const event = await HLTV.getEvent({ id: eventId });

    console.log('📊 Event Details:');
    console.log('================');
    console.log(`Name: ${event.name}`);
    console.log(`ID: ${event.id}`);
    console.log(`DateStart: ${event.dateStart}`);
    console.log(`DateEnd: ${event.dateEnd}`);
    console.log(`Prize Pool: ${event.prizePool}`);
    console.log(`Teams: ${event.teams?.length || 0} teams`);

    if (event.teams && event.teams.length > 0) {
      console.log('\nFirst 3 teams:');
      event.teams.slice(0, 3).forEach((team: any) => {
        console.log(`  - ${team.name} (id: ${team.id})`);
      });
    }

    console.log(`\n📋 Full Event Object:`);
    console.log(JSON.stringify(event, null, 2));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testGetEvent();
