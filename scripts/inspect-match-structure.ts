import { playwrightScraper } from '../lib/services/hltv/playwright-scraper';

async function inspectMatchStructure() {
  console.log('🔍 Inspecting .match structure...\n');

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

    await page.waitForTimeout(15000);

    const matches = page.locator('.match');
    const count = await matches.count();

    console.log(`Found ${count} .match elements\n`);

    // Inspect first 3 matches
    for (let i = 0; i < Math.min(3, count); i++) {
      const match = matches.nth(i);

      console.log(`\n=== Match ${i + 1} ===`);

      // Get outer HTML
      const outerHTML = await match.evaluate(el => el.outerHTML);
      console.log('HTML:', outerHTML.substring(0, 500));

      // Try to find team names
      const teamDivs = match.locator('.team');
      const teamCount = await teamDivs.count();
      console.log(`\nTeam elements (.team): ${teamCount}`);

      for (let j = 0; j < teamCount; j++) {
        const teamText = await teamDivs.nth(j).textContent();
        const teamHTML = await teamDivs.nth(j).evaluate(el => el.outerHTML);
        console.log(`  Team ${j + 1}: ${teamText}`);
        console.log(`  HTML: ${teamHTML.substring(0, 200)}`);
      }

      // Try to find match link
      const matchLink = match.locator('a[href*="/matches/"]');
      const linkCount = await matchLink.count();
      if (linkCount > 0) {
        const href = await matchLink.first().getAttribute('href');
        console.log(`Match link: ${href}`);
      }

      console.log('---');
    }

    await playwrightScraper.close();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

inspectMatchStructure();
