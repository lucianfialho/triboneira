import HLTV from 'hltv';

async function testGetResults() {
  console.log('🔍 Testing HLTV.getResults()...\n');

  try {
    // Try getResults without params
    console.log('1️⃣ Testing getResults() with no params...');
    const results = await HLTV.getResults();
    console.log(`   Result: ${results.length} results\n`);

    if (results.length > 0) {
      console.log('   ✅ Found results! First result:');
      console.log(JSON.stringify(results[0], null, 2));
    }

    // Try with event filter
    console.log('\n2️⃣ Testing getResults() with eventIds...');
    const eventResults = await HLTV.getResults({ eventIds: [8504] });
    console.log(`   Result: ${eventResults.length} results\n`);

    if (eventResults.length > 0) {
      console.log('   ✅ Found event results! First result:');
      console.log(JSON.stringify(eventResults[0], null, 2));
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  }
}

testGetResults();
