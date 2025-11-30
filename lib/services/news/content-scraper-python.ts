import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export interface ScrapedContent {
  content: string;
  wordCount: number;
  method: 'python-curl_cffi' | 'fallback-empty';
  selectorsUsed?: string[];
  imageUrl?: string;
}

/**
 * Scrape full article content from HLTV news link using Python curl_cffi scraper
 * This bypasses Cloudflare protection that blocks Playwright
 */
export async function scrapeHLTVArticlePython(url: string): Promise<ScrapedContent> {
  // Get project root (cron-service directory)
  // This function is called from the main app but the scraper is in cron-service
  const projectRoot = process.cwd();

  // Determine if we're in main app or cron-service
  const isCronService = projectRoot.includes('cron-service');
  const cronServiceRoot = isCronService
    ? projectRoot
    : path.join(projectRoot, 'cron-service');

  const scriptPath = path.join(cronServiceRoot, 'scrapers/hltv_news_content.py');
  const venvPython = path.join(cronServiceRoot, 'scrapers/venv/bin/python');

  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `https://www.hltv.org${url}`;

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath} "${fullUrl}"`);

    if (stderr && stderr.includes('Error:')) {
      console.error(`❌ Python scraper error for news URL:`, stderr);
      // Return empty content as fallback
      return {
        content: '',
        wordCount: 0,
        method: 'fallback-empty',
        selectorsUsed: []
      };
    }

    const result: ScrapedContent = JSON.parse(stdout);
    console.log(`✅ Python scraper fetched news content (${result.wordCount} words, method: ${result.method})`);

    return result;
  } catch (error: any) {
    console.error(`❌ Python scraper error for news URL:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }

    // Return empty content as fallback instead of throwing
    return {
      content: '',
      wordCount: 0,
      method: 'fallback-empty',
      selectorsUsed: []
    };
  }
}
