import HLTV from 'hltv';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAfterCooldown() {
  try {
    console.log('Waiting 30 seconds for potential cooldown...\n');
    await sleep(30000);

    console.log('Testing getMatches() after cooldown...');
    const matches = await HLTV.getMatches();
    console.log(`Result: ${matches.length} matches`);

    if (matches.length > 0) {
      console.log('\n✅ IT WORKS! Cloudflare unblocked!');
      console.log('First match:', matches[0]);
    } else {
      console.log('\n❌ Still blocked or no matches available');
    }
  } catch (error: any) {
    if (error.message.includes('Cloudflare')) {
      console.log('\n❌ Still blocked by Cloudflare');
    } else {
      console.log('\n❌ Error:', error.message);
    }
  }
}

testAfterCooldown();
