import HLTV from 'hltv';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithDelay() {
  try {
    console.log('Waiting 5 seconds before request...\n');
    await sleep(5000);

    console.log('Fetching matches...');
    const matches = await HLTV.getMatches();

    console.log(`Total matches: ${matches.length}`);

    if (matches.length > 0) {
      console.log('\nFirst match:');
      console.log(JSON.stringify(matches[0], null, 2));
    } else {
      console.log('\nNo matches returned - possible Cloudflare block or empty page');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWithDelay();
