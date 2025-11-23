import axios from 'axios';

async function testFetchPage() {
  console.log('🔍 Testing if we can fetch HLTV matches page...\n');

  try {
    const url = 'https://www.hltv.org/matches';
    console.log(`Fetching: ${url}\n`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:');
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length']}`);
    console.log(`   Server: ${response.headers['server']}`);

    const html = response.data;
    console.log(`\n📄 HTML Length: ${html.length} characters`);

    // Check for Cloudflare blocking
    if (html.includes('Cloudflare') && html.includes('challenge')) {
      console.log('\n🚫 BLOCKED BY CLOUDFLARE!');
      console.log('   Page contains Cloudflare challenge');
    } else if (html.includes('cf-browser-verification')) {
      console.log('\n🚫 BLOCKED BY CLOUDFLARE!');
      console.log('   Browser verification required');
    } else if (html.length < 1000) {
      console.log('\n⚠️  Suspicious: HTML is too short');
      console.log('   First 500 chars:');
      console.log(html.substring(0, 500));
    } else {
      console.log('\n✅ Page fetched successfully!');

      // Check for match elements
      const hasLiveMatches = html.includes('liveMatch-container');
      const hasUpcomingMatches = html.includes('upcomingMatch');

      console.log(`\n🔍 Checking for match elements:`);
      console.log(`   .liveMatch-container: ${hasLiveMatches ? '✅ Found' : '❌ Not found'}`);
      console.log(`   .upcomingMatch: ${hasUpcomingMatches ? '✅ Found' : '❌ Not found'}`);

      if (!hasLiveMatches && !hasUpcomingMatches) {
        console.log('\n⚠️  No match elements found - HTML structure may have changed');
        console.log('\nSearching for "match" in HTML...');
        const matchCount = (html.match(/match/gi) || []).length;
        console.log(`   Found "match" ${matchCount} times in HTML`);
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error fetching page:');
    console.error(`   Message: ${error.message}`);

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   StatusText: ${error.response.statusText}`);
    }
  }
}

testFetchPage();
