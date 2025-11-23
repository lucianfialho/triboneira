import { chromium } from 'playwright';
import * as fs from 'fs';

async function savePages() {
  console.log('💾 Saving HLTV pages HTML...\n');

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
    // Save Events page
    console.log('📡 Loading events page...');
    await page.goto('https://www.hltv.org/events', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(15000);
    const eventsHtml = await page.content();
    fs.writeFileSync('hltv-events.html', eventsHtml);
    console.log('✅ Saved hltv-events.html\n');

    // Save Event detail page (Budapest Major)
    console.log('📡 Loading event detail page (8504)...');
    await page.goto('https://www.hltv.org/events/8504', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(15000);
    const eventDetailHtml = await page.content();
    fs.writeFileSync('hltv-event-detail.html', eventDetailHtml);
    console.log('✅ Saved hltv-event-detail.html\n');

    // Save News/Home page
    console.log('📡 Loading home/news page...');
    await page.goto('https://www.hltv.org/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(15000);
    const newsHtml = await page.content();
    fs.writeFileSync('hltv-news.html', newsHtml);
    console.log('✅ Saved hltv-news.html\n');

    console.log('🎉 All pages saved successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

savePages();
