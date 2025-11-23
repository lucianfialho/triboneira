import { playwrightScraper } from '../lib/services/hltv/playwright-scraper';

async function inspectMatchDetails() {
  console.log('🔍 Inspecting match details...\n');

  const eventId = 8504;

  try {
    await playwrightScraper.init();
    if (!playwrightScraper['page']) {
      console.error('Page not initialized');
      return;
    }

    const page = playwrightScraper['page'];

    await page.goto(`https://www.hltv.org/events/${eventId}/matches`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(15000);

    const matches = page.locator('.match');
    const count = await matches.count();

    console.log(`Found ${count} .match elements\n`);

    // Inspect first match in detail
    const match = matches.first();

    console.log('=== First Match Detail ===\n');

    // Get full HTML
    const fullHTML = await match.evaluate(el => el.outerHTML);
    console.log('Full HTML:');
    console.log(fullHTML);
    console.log('\n---\n');

    // Check for various potential selectors
    const selectors = [
      { name: 'Team divs', selector: 'div[class*="team"]' },
      { name: 'Team links', selector: 'a[href*="/team/"]' },
      { name: 'Match bottom', selector: '.match-bottom' },
      { name: 'All divs', selector: 'div' },
      { name: 'All spans', selector: 'span' },
    ];

    for (const { name, selector } of selectors) {
      const elements = match.locator(selector);
      const count = await elements.count();
      console.log(`\n${name} (${selector}): ${count} elements`);

      if (count > 0 && count <= 5) {
        for (let i = 0; i < count; i++) {
          const text = await elements.nth(i).textContent();
          const html = await elements.nth(i).evaluate(el => el.outerHTML.substring(0, 300));
          console.log(`  [${i}] Text: "${text?.trim()}"`);
          console.log(`      HTML: ${html}`);
        }
      }
    }

    await playwrightScraper.close();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

inspectMatchDetails();
