import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

interface SwissMatch {
  matchId: number | null;
  team1Name: string | null;
  team2Name: string | null;
  team1Record: string | null;
  team2Record: string | null;
  stakes: string | null;
  status: 'pending' | 'completed';
  winner: 1 | 2 | null;
}

interface SwissRound {
  roundNumber: number;
  bucket: string | null; // e.g., "0:0", "1:0", "2:1"
  matches: SwissMatch[];
}

/**
 * Scrape Swiss bracket data using Python curl_cffi scraper
 */
export async function scrapeSwissBracket(eventId: number): Promise<SwissRound[]> {
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scrapers/hltv_swiss_bracket.py');
  const venvPython = path.join(projectRoot, 'scrapers/venv/bin/python');

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath} ${eventId}`);

    if (stderr && stderr.includes('Error:')) {
      console.error(`❌ Python scraper error for Swiss bracket ${eventId}:`, stderr);
      return [];
    }

    const rounds: SwissRound[] = JSON.parse(stdout);
    console.log(`✅ Python scraper found ${rounds.length} Swiss rounds for event ${eventId}`);

    return rounds;
  } catch (error: any) {
    console.error(`❌ Python scraper error for Swiss bracket ${eventId}:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }
    return [];
  }
}
