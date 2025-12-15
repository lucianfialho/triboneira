import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execPromise = promisify(exec);

interface EventLineupPlayer {
  playerId: number;
  playerName: string;
  playerType: 'starter' | 'coach' | 'substitute' | 'benched';
  role: string | null;
}

interface EventLineupTeam {
  teamId: number;
  teamName: string;
  players: EventLineupPlayer[];
}

export interface EventLineups {
  eventId: number;
  teams: EventLineupTeam[];
}

/**
 * Scrape player lineups for a specific event using Python curl_cffi scraper
 */
export async function scrapeEventLineups(eventId: number): Promise<EventLineups | null> {
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scrapers/hltv_event_lineup.py');
  const venvPython = path.join(projectRoot, 'scrapers/venv/bin/python');

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath} ${eventId}`);

    if (stderr && stderr.includes('Error:')) {
      console.error(`❌ Python scraper error for event ${eventId}:`, stderr);
      return null;
    }

    const lineups: EventLineups = JSON.parse(stdout);
    console.log(`✅ Scraped lineups for event ${eventId}: ${lineups.teams.length} teams`);

    return lineups;
  } catch (error: any) {
    console.error(`❌ Failed to scrape lineups for event ${eventId}:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }
    return null;
  }
}
