import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

interface ScrapedMatch {
  id: number;
  team1: {
    id: string | null;
    name: string;
    country: string | null;
  };
  team2: {
    id: string | null;
    name: string;
    country: string | null;
  };
  date: string | null;
  format: string | null;
  event: string;
  link: string;
}

/**
 * Scrape event matches using Python curl_cffi scraper
 * This bypasses Cloudflare protection that blocks Playwright
 */
export async function scrapeEventMatchesPython(eventId: number): Promise<ScrapedMatch[]> {
  // Use process.cwd() to get project root reliably
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scrapers/hltv_scraper.py');
  const venvPython = path.join(projectRoot, 'scrapers/venv/bin/python');

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath} ${eventId}`);

    if (stderr && !stderr.includes('Error:')) {
      console.warn(`Python scraper warnings:`, stderr);
    }

    const matches: ScrapedMatch[] = JSON.parse(stdout);
    console.log(`✅ Python scraper found ${matches.length} matches for event ${eventId}`);

    return matches;
  } catch (error: any) {
    console.error(`❌ Python scraper error for event ${eventId}:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }
    throw error;
  }
}
