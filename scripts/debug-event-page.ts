import { playwrightScraper } from '../lib/services/hltv/playwright-scraper';

async function debugEventPage() {
  console.log('🔍 Debugging HLTV event page structure...\n');

  const eventId = 8504;

  try {
    await playwrightScraper.init();
    if (!playwrightScraper['page']) {
      console.error('Page not initialized');
      return;
    }

    const page = playwrightScraper['page'];

    console.log(`Navigating to event ${eventId} matches page...`);
    await page.goto(`https://www.hltv.org/events/${eventId}/matches`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('Waiting for page to load...');
    await page.waitForTimeout(15000);

    // Try to find different possible selectors
    console.log('\n📊 Checking different selectors:\n');

    const selectors = [
      '.results-all',
      '.results-all tr',
      '.upcomingMatch',
      '.matchRow',
      'table.matchTable',
      '.match',
      '.allstars',
      'div[class*="match"]',
      'table',
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      console.log(`${selector}: ${count} elements`);
    }

    // Get page HTML snippet
    console.log('\n📄 Page title:', await page.title());

    // Try to screenshot
    await page.screenshot({ path: 'debug-event-page.png', fullPage: false });
    console.log('\n📸 Screenshot saved to debug-event-page.png');

    await playwrightScraper.close();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

debugEventPage();
