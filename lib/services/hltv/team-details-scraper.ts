import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export interface TeamDetails {
  id: number;
  name: string | null;
  country: string | null;
  rank: number | null;
  logoUrl: string | null;
}

/**
 * Scrape team details using Python curl_cffi scraper
 * Fetches country, rank, and logo from team page
 */
export async function scrapeTeamDetails(teamId: number): Promise<TeamDetails | null> {
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scrapers/hltv_team_details.py');
  const venvPython = path.join(projectRoot, 'scrapers/venv/bin/python');

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath} ${teamId}`);

    if (stderr && stderr.includes('Error:')) {
      console.error(`❌ Python scraper error for team ${teamId}:`, stderr);
      return null;
    }

    const details: TeamDetails = JSON.parse(stdout);
    console.log(`✅ Python scraper fetched team details for ${details.name} (${details.country})`);

    return details;
  } catch (error: any) {
    console.error(`❌ Python scraper error for team ${teamId}:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }
    return null;
  }
}
