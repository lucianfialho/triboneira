import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export interface TeamRanking {
  rank: number;
  teamName: string | null;
  teamId: number | null;
  points: number | null;
  change: number;
  country: string | null;
}

/**
 * Scrape current HLTV team rankings using Python curl_cffi scraper
 */
export async function scrapeTeamRankings(): Promise<TeamRanking[]> {
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scrapers/hltv_rankings.py');
  const venvPython = path.join(projectRoot, 'scrapers/venv/bin/python');

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath}`);

    if (stderr && stderr.includes('Error:')) {
      console.error(`❌ Python scraper error for rankings:`, stderr);
      return [];
    }

    const rankings: TeamRanking[] = JSON.parse(stdout);
    console.log(`✅ Python scraper found ${rankings.length} team rankings`);

    return rankings;
  } catch (error: any) {
    console.error(`❌ Python scraper error for rankings:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }
    return [];
  }
}
