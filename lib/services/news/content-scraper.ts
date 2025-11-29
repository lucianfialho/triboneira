import { getPlaywrightScraper, closePlaywrightScraper } from '../hltv/playwright-scraper';
import { scrapeHLTVArticlePython } from './content-scraper-python';

export interface ScrapedContent {
  content: string;
  wordCount: number;
  method: 'python-curl_cffi' | 'playwright' | 'fallback-title' | 'fallback-empty';
  selectorsUsed?: string[];
}

/**
 * Scrape full article content from HLTV news link
 *
 * Strategy:
 * 1. Try Python scraper (curl_cffi) - bypasses Cloudflare
 * 2. If fails, try Playwright as fallback
 * 3. If all fails, return title-only fallback
 */
export async function scrapeHLTVArticle(url: string, title?: string): Promise<ScrapedContent> {
  // STRATEGY 1: Try Python scraper first (bypasses Cloudflare)
  try {
    console.log(`🐍 Trying Python scraper for article: ${url}`);
    const pythonResult = await scrapeHLTVArticlePython(url);

    // If Python scraper got content, return it
    if (pythonResult.wordCount > 0) {
      console.log(`✅ Python scraper succeeded (${pythonResult.wordCount} words)`);
      return pythonResult;
    }

    console.log(`⚠️  Python scraper returned empty content, trying Playwright fallback...`);
  } catch (error: any) {
    console.log(`⚠️  Python scraper failed: ${error.message}, trying Playwright fallback...`);
  }

  // STRATEGY 2: Fallback to Playwright (may be blocked by Cloudflare)
  const scraper = await getPlaywrightScraper();

  try {
    const page = await scraper.init();

    // Ensure URL is absolute (HLTV API returns relative paths)
    const fullUrl = url.startsWith('http') ? url : `https://www.hltv.org${url}`;

    console.log(`🌐 Trying Playwright scraper: ${fullUrl}`);

    // Navigate to article page
    // Use 'domcontentloaded' instead of 'networkidle' to avoid Cloudflare timeout
    await page.goto(fullUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Try multiple content selectors (HLTV changes structure occasionally)
    const selectors = [
      '.newstext-con',                // Current HLTV news text container
      '.fragment-content',            // Fragment/snippet content
      '.headertext',                  // Header text section
      '.bodyshot-html',               // Main HLTV article content (older)
      '.article-content',             // Alternative content container
      '.news-content',                // News-specific content
      'article .content',             // Generic article content
      '.standard-box .padding',       // Standard content box
      '.newstext',                    // Legacy news text
      '.bodytext',                    // Legacy body text
      '.back-bodytext',               // Back body text (found in debug)
    ];

    let content = '';
    let selectorsUsed: string[] = [];

    // Try each selector until we find content
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim().length > 100) { // Require at least 100 chars
            content = text.trim();
            selectorsUsed.push(selector);
            console.log(`✅ Content found with selector: ${selector} (${content.length} chars)`);
            break;
          }
        }
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }

    if (!content) {
      throw new Error('No content selectors matched or content too short');
    }

    const wordCount = content.split(/\s+/).length;

    console.log(`✅ Article scraped: ${wordCount} words`);

    return {
      content,
      wordCount,
      method: 'playwright',
      selectorsUsed
    };

  } catch (error: any) {
    console.log(`⚠️  Playwright scraper also failed: ${error.message}`);
    console.log(`   Using final fallback (title-only mode)`);

    // STRATEGY 3: Final fallback - use title only
    // Os agentes IA usarão apenas o título
    return {
      content: title || '', // Use title as fallback content if provided
      wordCount: title ? title.split(/\s+/).length : 0,
      method: 'fallback-title',
      selectorsUsed: undefined
    };

  } finally {
    // SEMPRE fechar o browser para liberar recursos
    await closePlaywrightScraper();
  }
}

/**
 * Test scraper with a known HLTV article URL
 */
export async function testScraper(url: string): Promise<void> {
  console.log('🧪 Testing content scraper...\n');

  const result = await scrapeHLTVArticle(url);

  console.log('\n📊 Results:');
  console.log(`   Method: ${result.method}`);
  console.log(`   Word count: ${result.wordCount}`);
  console.log(`   Selectors used: ${result.selectorsUsed?.join(', ') || 'none'}`);
  console.log(`   Content preview: ${result.content.substring(0, 200)}...`);
}
