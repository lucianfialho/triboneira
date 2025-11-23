import HLTV from 'hltv';

async function testDifferentApproaches() {
  console.log('🔍 Testing different approaches to get matches...\n');

  const eventId = 8504; // Budapest Major Stage 1

  try {
    // Approach 1: No parameters
    console.log('1️⃣ Testing getMatches() with no params...');
    const allMatches = await HLTV.getMatches();
    console.log(`   Result: ${allMatches.length} matches\n`);

    // Approach 2: With eventIds array
    console.log('2️⃣ Testing getMatches() with eventIds...');
    const eventMatches = await HLTV.getMatches({ eventIds: [eventId] });
    console.log(`   Result: ${eventMatches.length} matches\n`);

    // Approach 3: Check if there's a getEventMatches or similar method
    console.log('3️⃣ Available HLTV methods:');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(HLTV))
      .filter(name => name.includes('match') || name.includes('Match'));
    console.log(`   Methods containing 'match': ${methods.join(', ')}\n`);

    // Approach 4: Try getting upcoming matches
    console.log('4️⃣ Testing with date range...');
    const now = Date.now();
    const tomorrow = now + 24 * 60 * 60 * 1000;
    const matchesWithDate = await HLTV.getMatches();
    console.log(`   Result: ${matchesWithDate.length} matches\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDifferentApproaches();
