import HLTV from 'hltv';

async function testWithDetails() {
  console.log('🔍 Testing with detailed error handling...\n');

  try {
    console.log('Calling HLTV.getMatches()...');
    const matches = await HLTV.getMatches();

    console.log(`\n📊 Result:`);
    console.log(`   Matches found: ${matches.length}`);
    console.log(`   Type: ${typeof matches}`);
    console.log(`   Is Array: ${Array.isArray(matches)}`);

    if (matches.length === 0) {
      console.log('\n❌ No matches returned');
      console.log('   This could mean:');
      console.log('   1. Cloudflare blocking (silent)');
      console.log('   2. API changed');
      console.log('   3. Need different parameters');
      console.log('\n   Let me check the library version and methods...');

      // Check what methods are actually available
      const allMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(HLTV));
      console.log(`\n📚 Available HLTV methods (${allMethods.length} total):`);
      allMethods.forEach(m => console.log(`   - ${m}`));
    }

  } catch (error: any) {
    console.error('\n❌ Error occurred:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Name: ${error.name}`);

    if (error.message.includes('Cloudflare') || error.message.includes('403') || error.message.includes('blocked')) {
      console.log('\n🚫 Cloudflare is blocking us!');
    }

    if (error.stack) {
      console.error(`\n   Stack trace:`);
      console.error(error.stack);
    }
  }
}

testWithDetails();
