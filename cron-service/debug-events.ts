import { chromium } from 'playwright';

async function debugEvents() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
  });

  const page = await context.newPage();

  try {
    console.log('📡 Loading events page...');
    await page.goto('https://www.hltv.org/events', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ Waiting for Cloudflare...');
    await page.waitForTimeout(20000); // Aumentando para 20 segundos

    console.log('\n🔍 Testing different selectors:\n');

    // Test 1: ongoing-event
    const ongoingCount = await page.locator('.ongoing-event').count();
    console.log(`1. .ongoing-event: ${ongoingCount}`);

    // Test 2: big-event
    const bigCount = await page.locator('.big-event').count();
    console.log(`2. .big-event: ${bigCount}`);

    // Test 3: small-event
    const smallCount = await page.locator('.small-event').count();
    console.log(`3. .small-event: ${smallCount}`);

    // Test 4: Combined
    const combinedCount = await page.locator('.ongoing-event, .big-event, .small-event').count();
    console.log(`4. Combined: ${combinedCount}`);

    // Test 5: Get first element if it exists
    if (combinedCount > 0) {
      console.log('\n📝 First element details:');
      const firstElement = page.locator('.ongoing-event, .big-event, .small-event').first();
      const href = await firstElement.getAttribute('href');
      const tagName = await firstElement.evaluate(el => el.tagName);
      const className = await firstElement.getAttribute('class');

      console.log(`   Tag: ${tagName}`);
      console.log(`   Class: ${className}`);
      console.log(`   Href: ${href}`);
    }

    // Test 6: Check if page has any events-holder
    const eventsHolder = await page.locator('.events-holder').count();
    console.log(`\n5. .events-holder containers: ${eventsHolder}`);

    // Test 7: Check if we're on Cloudflare page
    const pageTitle = await page.title();
    console.log(`\nPage title: ${pageTitle}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugEvents();
