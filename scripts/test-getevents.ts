import HLTV from 'hltv';

async function testGetEvents() {
  try {
    const events = await HLTV.getEvents();

    console.log(`Total events: ${events.length}\n`);

    // Show first 3 events
    events.slice(0, 3).forEach(event => {
      console.log(`Event: ${event.name}`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Prize Pool: ${event.prizePool || 'NULL'}`);
      console.log(`  Location: ${event.location?.name || 'NULL'}`);
      console.log(`  Date Start: ${event.dateStart}`);
      console.log(`  Full object:`, JSON.stringify(event, null, 2));
      console.log('');
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testGetEvents();
