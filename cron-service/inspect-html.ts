import { chromium } from 'playwright';
import * as fs from 'fs';

async function inspectHTML() {
  console.log('🔍 Saving HLTV matches HTML for inspection...\n');

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

    console.log('📡 Loading page...');
    await page.goto('https://www.hltv.org/matches', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(15000);

    console.log('💾 Saving HTML...');
    const html = await page.content();
    fs.writeFileSync('hltv-matches.html', html);
    console.log('✅ Saved to hltv-matches.html\n');

    // Try to find divs that might contain matches
    console.log('🔍 Searching for match containers...\n');

    // Check for common patterns
    const possibleSelectors = [
      '.match',
      '.upcoming-match',
      '.live-match',
      '[class*="match-"]',
      '[class*="Match"]',
      '.matchContainer',
      '.match-container',
      'div.a-reset',
      'a[href*="/matches/"]'
    ];

    for (const selector of possibleSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found ${count} elements with selector: ${selector}`);

        if (count > 0 && count < 50) {
          const first = page.locator(selector).first();
          const text = await first.textContent();
          console.log(`  First element text preview: ${text?.substring(0, 100)}`);
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

inspectHTML();
