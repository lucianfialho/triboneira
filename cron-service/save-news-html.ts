import { chromium } from 'playwright';
import * as fs from 'fs';

async function saveNewsPage() {
  console.log('💾 Saving HLTV news page HTML...\n');

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
    console.log('📡 Loading home/news page...');
    await page.goto('https://www.hltv.org/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('⏳ Waiting 25 seconds for Cloudflare...');
    await page.waitForTimeout(25000);

    const newsHtml = await page.content();
    fs.writeFileSync('hltv-news-v2.html', newsHtml);
    console.log('✅ Saved hltv-news-v2.html\n');

    console.log('🎉 Page saved successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

saveNewsPage();
