import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

interface MatchVeto {
  vetoOrder: number;
  vetoType: 'removed' | 'picked' | 'leftover';
  mapName: string;
  teamName: string | null;
}

interface MatchMap {
  mapNumber: number;
  mapName: string | null;
  team1Score: number | null;
  team2Score: number | null;
  statsId: number | null;
  winnerTeamNumber: 1 | 2 | null;
}

export interface MatchDetails {
  matchId: number;
  vetoes: MatchVeto[];
  maps: MatchMap[];
  playerStats: Record<string, any>;
  winner: 1 | 2 | null;
  scoreTeam1: number | null;
  scoreTeam2: number | null;
  status: 'scheduled' | 'live' | 'finished';
}

/**
 * Scrape detailed match data using Python curl_cffi scraper
 * This bypasses Cloudflare protection that blocks Playwright
 */
export async function scrapeMatchDetails(matchId: number): Promise<MatchDetails | null> {
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scrapers/hltv_match_details.py');
  const venvPython = path.join(projectRoot, 'scrapers/venv/bin/python');

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath} ${matchId}`);

    if (stderr && stderr.includes('Error:')) {
      console.error(`❌ Python scraper error for match ${matchId}:`, stderr);
      return null;
    }

    const details: MatchDetails = JSON.parse(stdout);
    console.log(`✅ Python scraper fetched details for match ${matchId} (${details.maps.length} maps, ${details.vetoes.length} vetoes)`);

    return details;
  } catch (error: any) {
    console.error(`❌ Python scraper error for match ${matchId}:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }
    return null;
  }
}
