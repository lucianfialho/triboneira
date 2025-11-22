import HLTV from 'hltv';

async function checkEventMatches() {
  try {
    // DraculaN Season 3
    const event = await HLTV.getEvent({ id: 8841 });

    console.log(`Event: ${event.name}`);
    console.log(`Has matches field: ${!!event.matches}`);

    if (event.matches) {
      const matches = event.matches as any;
      console.log(`Matches count: ${matches.length || 'N/A'}`);
      console.log('\nSample:');
      console.log(JSON.stringify(event.matches, null, 2).substring(0, 1000));
    } else {
      console.log('No matches field in event object');
      console.log('\nEvent fields:', Object.keys(event));
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkEventMatches();
