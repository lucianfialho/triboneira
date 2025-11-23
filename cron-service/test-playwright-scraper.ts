import { chromium } from 'playwright';

async function testPlaywrightScraper() {
  console.log('🚀 Testing Playwright scraper for HLTV matches...\n');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    console.log('📡 Navigating to HLTV matches page...');
    await page.goto('https://www.hltv.org/matches', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ Waiting for Cloudflare challenge to complete...\n');

    // Wait longer for Cloudflare challenge
    await page.waitForTimeout(15000);

    // Check if we got blocked
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    if (title.includes('Just a moment') || title.includes('Cloudflare')) {
      console.log('🚫 BLOCKED BY CLOUDFLARE!\n');

      // Try to wait for the challenge to complete
      console.log('⏳ Waiting for Cloudflare challenge to complete...');
      await page.waitForTimeout(10000);

      const newTitle = await page.title();
      console.log(`📄 New page title: ${newTitle}`);

      if (newTitle.includes('Just a moment') || newTitle.includes('Cloudflare')) {
        console.log('❌ Still blocked after waiting\n');
        return;
      }
    }

    console.log('✅ Page loaded successfully!\n');

    // Try to find match elements
    console.log('🔍 Looking for match elements...\n');

    // Check for live matches
    const liveMatches = await page.locator('.liveMatch-container').count();
    console.log(`🔴 Live matches found: ${liveMatches}`);

    // Check for upcoming matches
    const upcomingMatches = await page.locator('.upcomingMatch').count();
    console.log(`📅 Upcoming matches found: ${upcomingMatches}`);

    if (liveMatches === 0 && upcomingMatches === 0) {
      console.log('\n⚠️  No matches found. Let me check the page structure...\n');

      // Get some sample HTML to see what we're working with
      const bodyText = await page.locator('body').textContent();
      console.log('Page contains "match":', bodyText?.toLowerCase().includes('match') || false);
      console.log('Page contains "live":', bodyText?.toLowerCase().includes('live') || false);

      // Try to find any elements with "match" in the class
      const matchElements = await page.locator('[class*="match"]').count();
      console.log(`Elements with "match" in class: ${matchElements}`);
    } else {
      console.log(`\n✅ SUCCESS! Found ${liveMatches + upcomingMatches} total matches\n`);

      // Extract some data from the first match
      const firstMatch = await page.locator('.upcomingMatch, .liveMatch-container').first();
      if (await firstMatch.count() > 0) {
        const matchHtml = await firstMatch.innerHTML();
        console.log('First match HTML preview:');
        console.log(matchHtml.substring(0, 500));
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testPlaywrightScraper();
