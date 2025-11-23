import HLTV from 'hltv';

async function test() {
  console.log('Testing HLTV.getMatches()...\n');
  
  // Test without params
  const allMatches = await HLTV.getMatches();
  console.log(`No params: ${allMatches.length} matches`);
  
  // Test with one event ID (Budapest Major Stage 1 = 8504)
  const singleEvent = await HLTV.getMatches({ eventIds: [8504] });
  console.log(`Event 8504: ${singleEvent.length} matches`);
  
  if (singleEvent.length > 0) {
    console.log('First match:', singleEvent[0]);
  }
}

test();
